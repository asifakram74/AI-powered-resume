import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import personaReducer from "./slices/personaSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    persona: personaReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
