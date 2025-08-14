// Utility functions for handling image URLs dynamically

export const getApiBaseUrl = () => {
  // In development with Vite proxy, use relative URLs
  if (import.meta.env.DEV && window.location.hostname === 'localhost') {
    return ''
  }
  // In production or network access, use same host as frontend with port 3000
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  return `${protocol}//${hostname}:3000`
}

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null
  
  const baseUrl = getApiBaseUrl()
  
  // Handle different image path formats
  if (imagePath.startsWith('http')) {
    // External URL - use image proxy
    return `${baseUrl}/api/image-proxy?url=${encodeURIComponent(imagePath)}`
  }
  
  // Local image path
  if (imagePath.startsWith('/')) {
    return `${baseUrl}${imagePath}`
  }
  
  return `${baseUrl}/${imagePath}`
}

export const getFullApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl()
  return `${baseUrl}${endpoint}`
}