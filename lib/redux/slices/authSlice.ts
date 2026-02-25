import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import {
  AuthService,
  type AuthResponse,
  type User,
  type LoginCredentials,
  type RegisterData,
  type RegisterResponse,
  type ProfileResponse,
  type ForgotPasswordResponse,
  type VerifyOTPResponse,
  type ResetPasswordData,
  checkPasswordSetFlag,
} from "../service/authService"
import { setPassword as setPasswordApi, type SetPasswordData } from "../../api/settings"
import { getUserById as getUserByIdApi } from "../service/userService"
import { setAuthCookie, removeAuthCookie } from "../../authCookies"

interface AuthState {
  user: User | null
  profile: ProfileResponse | null
  token: string | null
  requiresPasswordSetup: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  profile: null,
  token: null,
  requiresPasswordSetup: false,
  loading: false,
  error: null,
}

// Helper function to check if password setup is required
const checkRequiresPasswordSetup = (user: User | null): boolean => {
  if (!user) return false

  const isSocialLogin = user.source === 'Google' || user.source === 'Linkedin'
  if (!isSocialLogin) return false

  // Check if password was already set (from localStorage)
  return !checkPasswordSetFlag()
}

export const setUserPassword = createAsyncThunk<{ message: string }, SetPasswordData>(
  "auth/setUserPassword",
  async (data, { rejectWithValue }) => {
    try {
      const response = await AuthService.setPassword(data.password)
      return { message: "Password set successfully" }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to set password")
    }
  }
)

// Update loginUser async thunk
export const loginUser = createAsyncThunk<AuthResponse, LoginCredentials>(
  "auth/loginUser",
  async (credentials, { rejectWithValue, dispatch }) => { // Add dispatch parameter
    try {
      const response = await AuthService.login(credentials)
      localStorage.setItem("token", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))
      localStorage.setItem("loginMethod", "email")
      setAuthCookie()

      // Fetch and store profile after successful login
      try {
        const profileResponse = await AuthService.getProfile()
        localStorage.setItem("profile", JSON.stringify(profileResponse))
      } catch (profileError) {
        console.error("Failed to fetch profile on login:", profileError)
        // Continue even if profile fetch fails
      }

      return response
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 422) {
        return rejectWithValue("Invalid username or password")
      }
      return rejectWithValue(error.response?.data?.message || "Login failed")
    }
  },
)

// Update loginWithLinkedIn async thunk
export const loginWithLinkedIn = createAsyncThunk<AuthResponse, string>(
  "auth/loginWithLinkedIn",
  async (code, { rejectWithValue }) => {
    try {
      console.log("Attempting LinkedIn login with code:", code);
      const response = await AuthService.linkedinLogin(code);
      console.log("LinkedIn login response:", response);

      if (!response.user || !response.user.id) {
        throw new Error("User ID missing from LinkedIn login response");
      }

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setAuthCookie();

      // Fetch and store profile after successful LinkedIn login
      try {
        const profileResponse = await AuthService.getProfile()
        localStorage.setItem("profile", JSON.stringify(profileResponse))
      } catch (profileError) {
        console.error("Failed to fetch profile on LinkedIn login:", profileError)
      }

      return response;
    } catch (error: any) {
      console.error("LinkedIn login failed:", error);
      return rejectWithValue(error.response?.data?.message || "LinkedIn login failed");
    }
  }
);

// Update loginWithGoogle async thunk
export const loginWithGoogle = createAsyncThunk<AuthResponse, string>(
  "auth/loginWithGoogle",
  async (code, { rejectWithValue }) => {
    try {
      const response = await AuthService.googleLogin(code);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setAuthCookie();

      // Fetch and store profile after successful Google login
      try {
        const profileResponse = await AuthService.getProfile()
        localStorage.setItem("profile", JSON.stringify(profileResponse))
      } catch (profileError) {
        console.error("Failed to fetch profile on Google login:", profileError)
      }

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

    localStorage.setItem("profile", JSON.stringify(response))

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

      // Handle response format from backend where data might be in userInfo
      const updatedProfile = (response as any).userInfo || response

      localStorage.setItem("profile", JSON.stringify(updatedProfile))

      return updatedProfile
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update profile")
    }
  },
)

export const logoutUser = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await AuthService.logout()

    // Clear all localStorage items
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("profile")
    localStorage.removeItem("loginMethod")
    removeAuthCookie()

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

export const setPassword = createAsyncThunk(
  "auth/setPassword",
  async (password: string, { rejectWithValue }) => {
    try {
      await AuthService.setPassword(password)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to set password")
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
// Forgot Password Flow
export const verifyEmailForReset = createAsyncThunk<ForgotPasswordResponse, string>(
  "auth/verifyEmailForReset",
  async (email, { rejectWithValue }) => {
    try {
      const response = await AuthService.verifyEmail(email)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to send verification code")
    }
  }
)

export const verifyOTPForReset = createAsyncThunk<VerifyOTPResponse, { email: string; otp: string }>(
  "auth/verifyOTPForReset",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await AuthService.verifyOTP(email, otp)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Invalid OTP code")
    }
  }
)

export const resetPasswordWithToken = createAsyncThunk<ForgotPasswordResponse, ResetPasswordData>(
  "auth/resetPasswordWithToken",
  async (resetData, { rejectWithValue }) => {
    try {
      const response = await AuthService.resetPassword(resetData)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to reset password")
    }
  }
)

// Resend Email Verification for logged-in users
export const resendEmailVerification = createAsyncThunk<{ message: string }, string>(
  "auth/resendEmailVerification",
  async (email, { rejectWithValue }) => {
    try {
      const response = await AuthService.resendEmailVerification(email)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to resend verification email")
    }
  }
)

// Refresh user data from server (using Profile API instead of User ID API)
export const refreshUserById = createAsyncThunk<User, number>(
  "auth/refreshUserById",
  async (id, { rejectWithValue, getState }) => {
    try {
      // Fetch profile data which is accessible to authenticated users
      const profile = await AuthService.getProfile()

      // Get current user from state to merge
      const state = getState() as any
      const currentUser = state.auth.user as User

      if (!currentUser) {
        throw new Error("No current user found in state")
      }

      // Merge profile data with current user
      // If status is active, we ensure email_verified_at is set to bypass verification popup
      const updatedUser: User = {
        ...currentUser,
        name: profile.name || currentUser.name,
        email: profile.email || currentUser.email,
        status: profile.status || currentUser.status,
        plan_type: profile.plan_type || currentUser.plan_type,
        // If status is active, treat as verified
        email_verified_at: (profile.status?.toLowerCase() === 'active' && !currentUser.email_verified_at)
          ? new Date().toISOString()
          : currentUser.email_verified_at
      }

      localStorage.setItem("user", JSON.stringify(updatedUser))
      return updatedUser
    } catch (error: any) {
      // If profile fetch fails, it might be auth issue
      return rejectWithValue(error.response?.data?.message || "Failed to refresh user profile")
    }
  }
)

const authSlice = createSlice({
  name: "auth",
  initialState, reducers: {
    clearAuth: (state) => {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      localStorage.removeItem("profile")
      localStorage.removeItem("loginMethod")
      removeAuthCookie()
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
      state.requiresPasswordSetup = checkRequiresPasswordSetup(action.payload.user)
      setAuthCookie()
    },
    setRequiresPasswordSetup: (state, action: PayloadAction<boolean>) => {
      state.requiresPasswordSetup = action.payload
    },
    clearError: (state) => {
      state.error = null
    },

    // In the reducers section of createSlice
    restoreAuth: (state) => {
      const token = localStorage.getItem("token")
      const userStr = localStorage.getItem("user")
      const profileStr = localStorage.getItem("profile") // Get profile from localStorage

      if (token && userStr) {
        try {
          state.token = token
          const user = JSON.parse(userStr)
          state.user = user
          state.requiresPasswordSetup = checkRequiresPasswordSetup(user)

          // Restore profile if available
          if (profileStr) {
            state.profile = JSON.parse(profileStr)
          }
        } catch (e) {
          console.error("Failed to parse stored user data:", e)
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          localStorage.removeItem("profile") // Clean up profile too
          removeAuthCookie()
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Set User Password
      .addCase(setUserPassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(setUserPassword.fulfilled, (state) => {
        state.loading = false
        state.requiresPasswordSetup = false
        if (state.user) {
          state.user = { ...state.user, has_password: true }
          localStorage.setItem("user", JSON.stringify(state.user))
        }
      })
      .addCase(setUserPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Login User
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.requiresPasswordSetup = checkRequiresPasswordSetup(action.payload.user)
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
      // Set Password
      .addCase(setPassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(setPassword.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(setPassword.rejected, (state, action) => {
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
        removeAuthCookie()
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        removeAuthCookie()
        state.user = null
        state.profile = null
        state.token = null
        state.error = null
        state.loading = false
        state.requiresPasswordSetup = false
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Verify Email for Reset
      .addCase(verifyEmailForReset.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyEmailForReset.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(verifyEmailForReset.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Verify OTP for Reset
      .addCase(verifyOTPForReset.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyOTPForReset.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(verifyOTPForReset.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Reset Password with Token
      .addCase(resetPasswordWithToken.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(resetPasswordWithToken.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(resetPasswordWithToken.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Refresh User
      .addCase(refreshUserById.fulfilled, (state, action) => {
        state.user = action.payload
      })
      .addCase(refreshUserById.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to refresh user"
      })
  },
})

export const { clearAuth, clearProfile, setCredentials, clearError, restoreAuth } = authSlice.actions
export default authSlice.reducer
