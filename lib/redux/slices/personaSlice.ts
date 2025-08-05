import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { CVData } from '@/types/cv-data'
import { getPersonas, createPersona, updatePersona, deletePersona, getPersonaById } from '@/lib/api'

interface PersonaState {
  personas: CVData[]
  loading: boolean
  error: string | null
}

const initialState: PersonaState = {
  personas: [],
  loading: false,
  error: null,
}

// Async thunks
export const fetchPersonas = createAsyncThunk(
  'persona/fetchPersonas',
  async () => {
    const data = await getPersonas()
    return data
  }
)

export const addPersona = createAsyncThunk(
  'persona/addPersona',
  async (personaData: any) => {
    const response = await createPersona(personaData)
    return response
  }
)

export const editPersona = createAsyncThunk(
  'persona/editPersona',
  async ({ id, data }: { id: number; data: any }) => {
    const response = await updatePersona(id, data)
    return response
  }
)

export const removePersona = createAsyncThunk(
  'persona/removePersona',
  async (id: number) => {
    await deletePersona(id)
    return id
  }
)

const personaSlice = createSlice({
  name: 'persona',
  initialState,
  reducers: {
    setPersonas: (state, action: PayloadAction<CVData[]>) => {
      state.personas = action.payload
      localStorage.setItem('personas', JSON.stringify(action.payload))
    },
    addPersonaLocal: (state, action: PayloadAction<CVData>) => {
      state.personas.unshift(action.payload)
      localStorage.setItem('personas', JSON.stringify(state.personas))
    },
    updatePersonaLocal: (state, action: PayloadAction<CVData>) => {
      const index = state.personas.findIndex(p => p.id === action.payload.id)
      if (index !== -1) {
        state.personas[index] = action.payload
        localStorage.setItem('personas', JSON.stringify(state.personas))
      }
    },
    deletePersonaLocal: (state, action: PayloadAction<string>) => {
      state.personas = state.personas.filter(p => p.id !== action.payload)
      localStorage.setItem('personas', JSON.stringify(state.personas))
    },
    loadFromStorage: (state) => {
      const saved = localStorage.getItem('personas')
      if (saved) {
        state.personas = JSON.parse(saved)
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPersonas.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPersonas.fulfilled, (state, action) => {
        state.loading = false
        const formattedPersonas = action.payload.map((persona: any) => ({
          id: persona.id.toString(),
          personalInfo: {
            fullName: persona.full_name || "",
            jobTitle: persona.job_title || "",
            email: persona.email || "",
            phone: persona.phone || "",
            address: persona.address || "",
            city: persona.city || "",
            country: persona.country || "",
            profilePicture: persona.profile_picture || "",
            summary: persona.summary || "",
            linkedin: persona.linkedin || "",
            github: persona.github || "",
          },
          experience: persona.experience || [],
          education: persona.education || [],
          skills: {
            technical: Array.isArray(persona.skills) ? persona.skills : [],
            soft: [],
          },
          languages: persona.languages || [],
          certifications: persona.certifications || [],
          projects: persona.projects || [],
          additional: {
            interests: persona.additional || [],
          },
          createdAt: persona.created_at || new Date().toISOString(),
          generatedPersona: "",
        }))
        state.personas = formattedPersonas
        localStorage.setItem('personas', JSON.stringify(formattedPersonas))
      })
      .addCase(fetchPersonas.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch personas'
      })
  },
})

export const { 
  setPersonas, 
  addPersonaLocal, 
  updatePersonaLocal, 
  deletePersonaLocal, 
  loadFromStorage 
} = personaSlice.actions

export default personaSlice.reducer
