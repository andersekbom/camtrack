import { describe, it, expect, beforeEach, vi } from 'vitest'
import axios from 'axios'
import * as api from './api'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCameras', () => {
    it('should fetch all cameras', async () => {
      const mockCameras = [
        { id: 1, brand: 'Nikon', model: 'F50' },
        { id: 2, brand: 'Canon', model: 'EOS' }
      ]
      
      mockedAxios.get.mockResolvedValue({ data: mockCameras })
      
      const result = await api.getCameras()
      
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3000/api/cameras')
      expect(result).toEqual(mockCameras)
    })

    it('should handle API errors', async () => {
      const error = new Error('Network Error')
      mockedAxios.get.mockRejectedValue(error)
      
      await expect(api.getCameras()).rejects.toThrow('Network Error')
    })
  })

  describe('getCamera', () => {
    it('should fetch single camera by ID', async () => {
      const mockCamera = { id: 1, brand: 'Nikon', model: 'F50' }
      
      mockedAxios.get.mockResolvedValue({ data: mockCamera })
      
      const result = await api.getCamera(1)
      
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3000/api/cameras/1')
      expect(result).toEqual(mockCamera)
    })
  })

  describe('createCamera', () => {
    it('should create new camera', async () => {
      const newCamera = {
        brand: 'Nikon',
        model: 'F50',
        mechanical_status: 5,
        cosmetic_status: 4
      }
      const createdCamera = { id: 1, ...newCamera, weighted_price: 540 }
      
      mockedAxios.post.mockResolvedValue({ data: createdCamera })
      
      const result = await api.createCamera(newCamera)
      
      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:3000/api/cameras', newCamera)
      expect(result).toEqual(createdCamera)
    })
  })

  describe('updateCamera', () => {
    it('should update existing camera', async () => {
      const updates = { comment: 'Updated camera' }
      const updatedCamera = { id: 1, brand: 'Nikon', model: 'F50', comment: 'Updated camera' }
      
      mockedAxios.put.mockResolvedValue({ data: updatedCamera })
      
      const result = await api.updateCamera(1, updates)
      
      expect(mockedAxios.put).toHaveBeenCalledWith('http://localhost:3000/api/cameras/1', updates)
      expect(result).toEqual(updatedCamera)
    })
  })

  describe('deleteCamera', () => {
    it('should delete camera', async () => {
      const deleteResponse = { message: 'Camera deleted successfully', id: 1 }
      
      mockedAxios.delete.mockResolvedValue({ data: deleteResponse })
      
      const result = await api.deleteCamera(1)
      
      expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:3000/api/cameras/1')
      expect(result).toEqual(deleteResponse)
    })
  })
})