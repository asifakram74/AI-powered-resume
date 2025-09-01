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

// Temporary debug version of the thunk
export const loginWithLinkedIn = createAsyncThunk<AuthResponse, string>(
  "auth/loginWithLinkedIn",
  async (code, { rejectWithValue }) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/linkedin/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      const responseText = await response.text()
      console.log('Raw API response:', responseText)
      
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error('Failed to parse JSON response:', responseText)
        throw new Error('Invalid response from server')
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to authenticate with LinkedIn')
      }

      console.log('Parsed API data:', data)
      
      // Make sure the response has the expected structure
      if (!data.access_token || !data.user) {
        console.error('Invalid response structure:', data)
        throw new Error('Invalid response format from server')
      }

      const authResponse: AuthResponse = {
        token: data.access_token,
        user: data.user
      }

      localStorage.setItem("token", authResponse.token)
      localStorage.setItem("user", JSON.stringify(authResponse.user))
      
      return authResponse
    } catch (error: any) {
      return rejectWithValue(error.message || "LinkedIn login failed")
    }
  }
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
        state.profile = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(loginWithLinkedIn.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.profile = null
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

export const { clearAuth, clearProfile, setCredentials, clearError } = authSlice.actions
export default authSlice.reducer