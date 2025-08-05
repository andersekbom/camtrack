import axios from 'axios'

// Base URL configuration
const BASE_URL = 'http://localhost:3000/api'

// Camera API functions
export const getCameras = async () => {
  const response = await axios.get(`${BASE_URL}/cameras`)
  return response.data
}

export const getCamera = async (id) => {
  const response = await axios.get(`${BASE_URL}/cameras/${id}`)
  return response.data
}

export const createCamera = async (cameraData) => {
  const response = await axios.post(`${BASE_URL}/cameras`, cameraData)
  return response.data
}

export const updateCamera = async (id, updates) => {
  const response = await axios.put(`${BASE_URL}/cameras/${id}`, updates)
  return response.data
}

export const deleteCamera = async (id) => {
  const response = await axios.delete(`${BASE_URL}/cameras/${id}`)
  return response.data
}