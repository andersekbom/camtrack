import { useState } from 'react'

const CameraForm = ({ camera = {}, onSubmit, onCancel, isEdit = false }) => {
  const [formData, setFormData] = useState({
    brand: camera.brand || '',
    model: camera.model || '',
    serial: camera.serial || '',
    mechanical_status: camera.mechanical_status || '',
    cosmetic_status: camera.cosmetic_status || '',
    kamerastore_price: camera.kamerastore_price || '',
    sold_price: camera.sold_price || '',
    comment: camera.comment || ''
  })
  
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      const submitData = { ...formData }
      
      if (submitData.mechanical_status) {
        submitData.mechanical_status = parseInt(submitData.mechanical_status)
      }
      if (submitData.cosmetic_status) {
        submitData.cosmetic_status = parseInt(submitData.cosmetic_status)
      }
      if (submitData.kamerastore_price) {
        submitData.kamerastore_price = parseFloat(submitData.kamerastore_price)
      }
      if (submitData.sold_price) {
        submitData.sold_price = parseFloat(submitData.sold_price)
      }

      await onSubmit(submitData)
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
      
      <form onSubmit={handleSubmit} className="space-y-4">
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
              Kamerastore Price ($)
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
              Sold Price ($)
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