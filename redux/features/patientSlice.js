import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  patients: [],
  loading: false,
  error: null,
}

export const patientSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {
    registerPatientStart: (state) => {
      state.loading = true
      state.error = null
    },
    registerPatientSuccess: (state, action) => {
      state.patients.push(action.payload)
      state.loading = false
      state.error = null
    },
    registerPatientFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
    fetchPatientsStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchPatientsSuccess: (state, action) => {
      state.patients = action.payload
      state.loading = false
      state.error = null
    },
    fetchPatientsFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
  },
})

export const {
  registerPatientStart,
  registerPatientSuccess,
  registerPatientFailure,
  fetchPatientsStart,
  fetchPatientsSuccess,
  fetchPatientsFailure,
} = patientSlice.actions

// Async action creators
export const registerPatient = (patientData) => async (dispatch) => {
  try {
    dispatch(registerPatientStart())

    // In a real app, this would be an API call
    // For demo purposes, we'll simulate a successful registration
    // const response = await fetch('/api/patients', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(patientData),
    // });
    // const data = await response.json();

    // Simulate API response
    const data = {
      id: Date.now(), // Generate a unique ID
      ...patientData,
      registeredDate: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
      doctorName: getDoctorName(patientData.doctorId), // Helper function to get doctor name
    }

    dispatch(registerPatientSuccess(data))
    return data
  } catch (error) {
    dispatch(registerPatientFailure(error.message))
    throw error
  }
}

export const fetchPatients = () => async (dispatch) => {
  try {
    dispatch(fetchPatientsStart())

    // In a real app, this would be an API call
    // For demo purposes, we'll simulate a successful fetch
    // const response = await fetch('/api/patients');
    // const data = await response.json();

    // Simulate API response
    const data = [] // Empty array for now

    dispatch(fetchPatientsSuccess(data))
    return data
  } catch (error) {
    dispatch(fetchPatientsFailure(error.message))
    throw error
  }
}

// Helper function to get doctor name from ID
function getDoctorName(doctorId) {
  const doctors = {
    1: "Dr. John Smith",
    2: "Dr. Sarah Johnson",
    3: "Dr. Michael Brown",
    4: "Dr. Emily Davis",
    5: "Dr. Robert Wilson",
  }

  return doctors[doctorId] || "Unknown Doctor"
}

export default patientSlice.reducer
