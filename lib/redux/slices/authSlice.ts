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

export const registerUser = createAsyncThunk<RegisterResponse, RegisterData>(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await AuthService.register(userData)
      return response
    } catch (error: any) {
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

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuth: (state) => {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      state.user = null
      state.profile = null // Add this line
      state.token = null
      state.error = null
      state.loading = false
    },
    clearProfile: (state) => { // Add this new action
      state.profile = null
    },
    setCredentials: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token
      state.user = action.payload.user
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.profile = null // Clear any previous profile on new login
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
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
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false
        state.profile = action.payload
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(logoutUser.fulfilled, (state) => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        state.user = null
        state.profile = null // Add this line to clear profile on logout
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

export const { clearAuth, clearProfile, setCredentials, clearError } = authSlice.actions
export default authSlice.reducer