import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
}

// In a real app, we would use localStorage or cookies to persist the auth state
const loadAuthState = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")

    if (token && user) {
      return {
        isAuthenticated: true,
        token,
        user: JSON.parse(user),
        loading: false,
        error: null,
      }
    }
  }

  return initialState
}

const saveAuthState = (token, user) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
  }
}

const clearAuthState = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }
}

export const authSlice = createSlice({
  name: "auth",
  initialState: loadAuthState(),
  reducers: {
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action) => {
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.token
      state.loading = false
      state.error = null
      saveAuthState(action.payload.token, action.payload.user)
    },
    loginFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
    registerStart: (state) => {
      state.loading = true
      state.error = null
    },
    registerSuccess: (state, action) => {
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.token
      state.loading = false
      state.error = null
      saveAuthState(action.payload.token, action.payload.user)
    },
    registerFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
    logoutSuccess: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.token = null
      clearAuthState()
    },
  },
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logoutSuccess,
} = authSlice.actions

// Async action creators
export const login = (userData) => async (dispatch) => {
  try {
    dispatch(loginStart())

    const response = await fetch("http://localhost:8000/api/auth/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Login failed")
    }

    const data = await response.json()

    dispatch(loginSuccess(data))
    return data
  } catch (error) {
    dispatch(loginFailure(error.message))
    throw error
  }
}

export const register = (userData) => async (dispatch) => {
  try {
    dispatch(registerStart())

    const response = await fetch("http://localhost:8000/api/auth/signup/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Registration failed")
    }

    const data = await response.json()

    dispatch(registerSuccess(data))
    return data
  } catch (error) {
    dispatch(registerFailure(error.message))
    throw error
  }
}

export const logout = () => (dispatch) => {
  // In a real app, this would be an API call to invalidate the token
  dispatch(logoutSuccess())
}

export default authSlice.reducer
