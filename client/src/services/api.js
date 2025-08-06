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
  
  // Add brand filter
  if (filters.brand) {
    params.append('brand', filters.brand)
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
  const config = {}
  
  // If cameraData is FormData (for file uploads), set proper headers
  if (cameraData instanceof FormData) {
    config.headers = {
      'Content-Type': 'multipart/form-data'
    }
  }
  
  const response = await axios.post(`${BASE_URL}/cameras`, cameraData, config)
  return response.data
}

export const updateCamera = async (id, updates) => {
  const config = {}
  
  // If updates is FormData (for file uploads), set proper headers
  if (updates instanceof FormData) {
    config.headers = {
      'Content-Type': 'multipart/form-data'
    }
  }
  
  const response = await axios.put(`${BASE_URL}/cameras/${id}`, updates, config)
  return response.data
}

export const deleteCamera = async (id) => {
  const response = await axios.delete(`${BASE_URL}/cameras/${id}`)
  return response.data
}

export const clearAllCameras = async () => {
  const response = await axios.delete(`${BASE_URL}/cameras/clear`)
  return response.data
}

// Import/Export functions
export const exportCameras = async () => {
  const response = await axios.get(`${BASE_URL}/export`, {
    responseType: 'blob' // Important for file downloads
  })
  return response.data
}

export const importCameras = async (csvFile) => {
  const formData = new FormData()
  formData.append('csvFile', csvFile)
  
  const response = await axios.post(`${BASE_URL}/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

// Summary statistics
export const getSummary = async () => {
  const response = await axios.get(`${BASE_URL}/summary`)
  return response.data
}
