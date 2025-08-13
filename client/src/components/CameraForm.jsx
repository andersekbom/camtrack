import { useState } from 'react'
import { deleteCameraImage } from '../services/api'

const CameraForm = ({ camera, onSubmit, onCancel, isEdit = false }) => {
  const initCamera = camera || {}
  const [formData, setFormData] = useState({
    brand: initCamera.brand || '',
    model: initCamera.model || '',
    serial: initCamera.serial || '',
    mechanical_status: initCamera.mechanical_status || '',
    cosmetic_status: initCamera.cosmetic_status || '',
    kamerastore_price: initCamera.kamerastore_price || '',
    sold_price: initCamera.sold_price || '',
    comment: initCamera.comment || ''
  })
  
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState({
    image1: null,
    image2: null
  })
  const [imagePreviews, setImagePreviews] = useState({
    image1: initCamera.image1_path ? `http://localhost:3000/${initCamera.image1_path}` : null,
    image2: initCamera.image2_path ? `http://localhost:3000/${initCamera.image2_path}` : null
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleImageChange = (e, imageKey) => {
    const file = e.target.files[0]
    
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          [imageKey]: 'Image must be smaller than 5MB'
        }))
        return
      }
      
      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          [imageKey]: 'Only JPEG and PNG files are allowed'
        }))
        return
      }
      
      // Clear any previous error
      if (errors[imageKey]) {
        setErrors(prev => ({
          ...prev,
          [imageKey]: ''
        }))
      }
      
      // Store the file
      setImages(prev => ({
        ...prev,
        [imageKey]: file
      }))
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => ({
          ...prev,
          [imageKey]: e.target.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = async (imageKey) => {
    // If editing an existing camera and there's an existing image, delete from server
    if (isEdit && camera && camera[`${imageKey}_path`]) {
      try {
        const imageNumber = imageKey === 'image1' ? 1 : 2
        await deleteCameraImage(camera.id, imageNumber)
        
        // Update the camera object to reflect the deletion
        camera[`${imageKey}_path`] = null
      } catch (error) {
        console.error('Error deleting image:', error)
        alert('Failed to delete image. Please try again.')
        return
      }
    }
    
    // Clear local state and preview
    setImages(prev => ({
      ...prev,
      [imageKey]: null
    }))
    setImagePreviews(prev => ({
      ...prev,
      [imageKey]: null
    }))
    
    // Clear file input
    const fileInput = document.getElementById(imageKey)
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required'
    }
    
    if (!formData.model.trim()) {
      newErrors.model = 'Model is required'
    }
    
    if (formData.mechanical_status && (formData.mechanical_status < 1 || formData.mechanical_status > 5)) {
      newErrors.mechanical_status = 'Mechanical status must be between 1 and 5'
    }
    
    if (formData.cosmetic_status && (formData.cosmetic_status < 1 || formData.cosmetic_status > 5)) {
      newErrors.cosmetic_status = 'Cosmetic status must be between 1 and 5'
    }
    
    if (formData.kamerastore_price && formData.kamerastore_price < 0) {
      newErrors.kamerastore_price = 'Price cannot be negative'
    }
    
    if (formData.sold_price && formData.sold_price < 0) {
      newErrors.sold_price = 'Price cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // Create FormData for multipart form submission
      const formDataToSubmit = new FormData()
      
      // Add form fields
      formDataToSubmit.append('brand', formData.brand)
      formDataToSubmit.append('model', formData.model)
      if (formData.serial) formDataToSubmit.append('serial', formData.serial)
      if (formData.mechanical_status) formDataToSubmit.append('mechanical_status', parseInt(formData.mechanical_status))
      if (formData.cosmetic_status) formDataToSubmit.append('cosmetic_status', parseInt(formData.cosmetic_status))
      if (formData.kamerastore_price) formDataToSubmit.append('kamerastore_price', parseFloat(formData.kamerastore_price))
      if (formData.sold_price) formDataToSubmit.append('sold_price', parseFloat(formData.sold_price))
      if (formData.comment) formDataToSubmit.append('comment', formData.comment)
      
      // Add image files
      if (images.image1) {
        formDataToSubmit.append('image1', images.image1)
      }
      if (images.image2) {
        formDataToSubmit.append('image2', images.image2)
      }

      await onSubmit(formDataToSubmit)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Camera' : 'Add New Camera'}
      </h2>
      
      <form data-testid="camera-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
              Brand *
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.brand ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Canon, Nikon, Leica"
            />
            {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
              Model *
            </label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.model ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., AE-1, F3, M6"
            />
            {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="serial" className="block text-sm font-medium text-gray-700 mb-1">
            Serial Number
          </label>
          <input
            type="text"
            id="serial"
            name="serial"
            value={formData.serial}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Serial number"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="mechanical_status" className="block text-sm font-medium text-gray-700 mb-1">
              Mechanical Status (1-5)
            </label>
            <select
              id="mechanical_status"
              name="mechanical_status"
              value={formData.mechanical_status}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.mechanical_status ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select condition</option>
              <option value="1">1 - Poor</option>
              <option value="2">2 - Fair</option>
              <option value="3">3 - Good</option>
            <option value="4">4 - Very Good</option>
              <option value="5">5 - Excellent</option>
            </select>
            {errors.mechanical_status && <p className="text-red-500 text-sm mt-1">{errors.mechanical_status}</p>}
          </div>

          <div>
            <label htmlFor="cosmetic_status" className="block text-sm font-medium text-gray-700 mb-1">
              Cosmetic Status (1-5)
            </label>
            <select
              id="cosmetic_status"
              name="cosmetic_status"
              value={formData.cosmetic_status}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.cosmetic_status ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select condition</option>
              <option value="1">1 - Poor</option>
              <option value="2">2 - Fair</option>
            <option value="3">3 - Good</option>
              <option value="4">4 - Very Good</option>
              <option value="5">5 - Excellent</option>
            </select>
            {errors.cosmetic_status && <p className="text-red-500 text-sm mt-1">{errors.cosmetic_status}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="kamerastore_price" className="block text-sm font-medium text-gray-700 mb-1">
              Kamerastore Price (SEK)
            </label>
            <input
              type="number"
              id="kamerastore_price"
              name="kamerastore_price"
              value={formData.kamerastore_price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.kamerastore_price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.kamerastore_price && <p className="text-red-500 text-sm mt-1">{errors.kamerastore_price}</p>}
          </div>

          <div>
            <label htmlFor="sold_price" className="block text-sm font-medium text-gray-700 mb-1">
              Sold Price (SEK)
            </label>
            <input
              type="number"
              id="sold_price"
              name="sold_price"
              value={formData.sold_price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.sold_price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.sold_price && <p className="text-red-500 text-sm mt-1">{errors.sold_price}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            Comment
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Additional notes about the camera..."
          />
        </div>

        {/* Image Upload Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Images (Optional)</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Image 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image 1
              </label>
              <div className="space-y-3">
                {imagePreviews.image1 ? (
                  <div className="relative">
                    <img
                      src={imagePreviews.image1}
                      alt="Camera preview 1"
                      className="w-full h-48 object-cover border border-gray-300 rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage('image1')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">No image selected</p>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  id="image1"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => handleImageChange(e, 'image1')}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {errors.image1 && <p className="text-red-500 text-sm">{errors.image1}</p>}
              </div>
            </div>

            {/* Image 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image 2
              </label>
              <div className="space-y-3">
                {imagePreviews.image2 ? (
                  <div className="relative">
                    <img
                      src={imagePreviews.image2}
                      alt="Camera preview 2"
                      className="w-full h-48 object-cover border border-gray-300 rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage('image2')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">No image selected</p>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  id="image2"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => handleImageChange(e, 'image2')}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {errors.image2 && <p className="text-red-500 text-sm">{errors.image2}</p>}
              </div>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Maximum 2 images, 5MB each. JPEG and PNG formats only.
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Camera' : 'Add Camera'}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default CameraForm
