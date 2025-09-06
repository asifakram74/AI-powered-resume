import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import {
  AuthService,
  type AuthResponse,
  type User,
  type LoginCredentials,
  type RegisterData,
  type RegisterResponse,
  type ProfileResponse,
} from "../service/authService"

interface AuthState {
  user: User | null
  profile: ProfileResponse | null
  token: string | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  profile: null,
  token: null,
  loading: false,
  
  error: null,
}

export const loginUser = createAsyncThunk<AuthResponse, LoginCredentials>(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(credentials)
      localStorage.setItem("token", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed")
    }
  },
)

export const loginWithLinkedIn = createAsyncThunk<AuthResponse, { code: string; action: string }>(
  "auth/loginWithLinkedIn",
  async ({ code, action }, { rejectWithValue }) => {
    try {
      console.log("Attempting LinkedIn login with code:", code, "action:", action);
      const response = await AuthService.linkedinLogin(code, action);
      console.log("LinkedIn login response:", response);

      if (!response.user || !response.user.id) {
        throw new Error("User ID missing from LinkedIn login response");
      }

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      return response;
    } catch (error: any) {
      console.error("LinkedIn login failed:", error);
      return rejectWithValue(error.response?.data?.message || "LinkedIn login failed");
    }
  }
);

export const loginWithGoogle = createAsyncThunk<AuthResponse, string>(
  "auth/loginWithGoogle",
  async (code, { rejectWithValue }) => {
    try {
      const response = await AuthService.googleLogin(code);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Google login failed");
    }
  }
);

export const registerUser = createAsyncThunk<RegisterResponse, RegisterData>(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await AuthService.register(userData)
      return response
    } catch (error: any) {
      // Handle validation errors
      if (error.response?.data?.errors) {
        return rejectWithValue({
          message: error.response.data.message || "Validation failed",
          errors: error.response.data.errors
        })
      }
      return rejectWithValue(error.response?.data?.message || "Registration failed")
    }
  },
)

export const fetchProfile = createAsyncThunk<ProfileResponse>("auth/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await AuthService.getProfile()
    return response
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch profile")
  }
})

export const updateProfile = createAsyncThunk<ProfileResponse, Partial<ProfileResponse>>(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await AuthService.updateProfile(profileData)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update profile")
    }
  },
)

export const logoutUser = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await AuthService.logout()
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Logout failed")
  }
})

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      await AuthService.changePassword(oldPassword, newPassword)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Password change failed")
    }
  }
)

export const deleteAccount = createAsyncThunk(
  "auth/deleteAccount",
  async (_, { rejectWithValue }) => {
    try {
      await AuthService.deleteAccount()
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Account deletion failed")
    }
  }
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuth: (state) => {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      state.user = null
      state.profile = null
      state.token = null
      state.error = null
      state.loading = false
    },
    clearProfile: (state) => {
      state.profile = null
    },
    setCredentials: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token
      state.user = action.payload.user
    },
    clearError: (state) => {
      state.error = null
    },
    restoreAuth: (state) => {
      const token = localStorage.getItem("token")
      const userStr = localStorage.getItem("user")

      if (token && userStr) {
        try {
          state.token = token
          state.user = JSON.parse(userStr)
        } catch (e) {
          console.error("Failed to parse stored user data:", e)
          localStorage.removeItem("token")
          localStorage.removeItem("user")
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login User
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.profile = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // LinkedIn Login
      .addCase(loginWithLinkedIn.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginWithLinkedIn.fulfilled, (state, action) => {
        console.log('Redux LinkedIn login fulfilled:', action.payload);
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.profile = null;

        // Check if user has ID and force redirect
        if (action.payload.user && action.payload.user.id) {
          console.log('LinkedIn user has ID, should redirect');
          // You might want to trigger a redirect here or in the component
        }
      })
      .addCase(loginWithLinkedIn.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Google Login
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.profile = null
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        if (action.payload && typeof action.payload === 'object' && 'errors' in action.payload) {
          // Handle validation errors
          const payload = action.payload as { message: string; errors: Record<string, string[]> }
          state.error = Object.entries(payload.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ')
        } else {
          // Handle other errors
          state.error = typeof action.payload === 'string' ? action.payload : 'Registration failed'
        }
      })
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false
        state.profile = action.payload
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false
        state.profile = action.payload

        // Also update user name/email if changed
        if (state.user && action.payload.name) {
          state.user.name = action.payload.name
          localStorage.setItem("user", JSON.stringify(state.user))
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Delete Account
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.loading = false
        state.user = null
        state.profile = null
        state.token = null
        state.error = null
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        state.user = null
        state.profile = null
        state.token = null
        state.error = null
        state.loading = false
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearAuth, clearProfile, setCredentials, clearError, restoreAuth } = authSlice.actions
export default authSlice.reducer