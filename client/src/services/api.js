import axios from 'axios'

// Base URL configuration
const BASE_URL = 'http://localhost:3000/api'

// Camera API functions
export const getCameras = async (filters = {}, signal) => {
  const params = new URLSearchParams()
  
  // Add search parameter
  if (filters.search) {
    params.append('search', filters.search)
  }
  
  // Add mechanical status filters
  if (filters.mechanicalStatus && filters.mechanicalStatus.length > 0) {
    filters.mechanicalStatus.forEach(status => {
      params.append('mechanicalStatus', status.toString())
    })
  }
  
  // Add cosmetic status filters
  if (filters.cosmeticStatus && filters.cosmeticStatus.length > 0) {
    filters.cosmeticStatus.forEach(status => {
      params.append('cosmeticStatus', status.toString())
    })
  }
  
  // Add price range filters
  if (filters.minPrice !== undefined && filters.minPrice !== '') {
    params.append('minPrice', filters.minPrice.toString())
  }
  
  if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
    params.append('maxPrice', filters.maxPrice.toString())
  }
  
  const queryString = params.toString()
  const url = queryString ? `${BASE_URL}/cameras?${queryString}` : `${BASE_URL}/cameras`
  
  const response = await axios.get(url, { signal })
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
