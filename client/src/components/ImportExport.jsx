import { useState, useRef } from 'react'
import { exportCameras, importCameras } from '../services/api'

const ImportExport = ({ onImportComplete }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [importError, setImportError] = useState(null)
  const fileInputRef = useRef(null)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      
      // Get CSV data as blob
      const csvBlob = await exportCameras()
      
      // Create download link
      const url = window.URL.createObjectURL(csvBlob)
      const link = document.createElement('a')
      link.href = url
      
      // Generate filename with current date
      const today = new Date().toISOString().split('T')[0]
      link.download = `cameras_export_${today}.csv`
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setImportError('Please select a CSV file')
      return
    }

    try {
      setIsImporting(true)
      setImportError(null)
      setImportResult(null)
      
      const result = await importCameras(file)
      setImportResult(result)
      
      // Notify parent component to refresh data
      if (onImportComplete) {
        onImportComplete()
      }
      
    } catch (error) {
      console.error('Import failed:', error)
      setImportError(error.response?.data?.error || 'Import failed. Please try again.')
    } finally {
      setIsImporting(false)
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const clearResults = () => {
    setImportResult(null)
    setImportError(null)
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const hasActivity = importResult || importError || isExporting || isImporting

  return (
    <div className="bg-white border border-gray-200 rounded-lg relative">
      {/* Import/Export Toggle Button */}
      <button
        onClick={toggleDropdown}
        className="w-full px-4 py-3 flex items-center justify-between text-left text-gray-700 hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
      >
        <div className="flex items-center">
          <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Import/Export</span>
          {hasActivity && (
            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              {isExporting || isImporting ? 'Processing' : 'Complete'}
            </span>
          )}
        </div>
        <svg 
          className={`h-4 w-4 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'transform rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Import/Export Content */}
      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-200">
          <div className="mt-4">
            {(importResult || importError) && (
              <div className="flex justify-end mb-3">
                <button
                  onClick={clearResults}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear Results
                </button>
              </div>
            )}

            <div className="flex gap-3 mb-4">
              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {isExporting ? 'Exporting...' : 'Export to CSV'}
              </button>

              {/* Import Button */}
              <button
                onClick={handleImportClick}
                disabled={isImporting}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                {isImporting ? 'Importing...' : 'Import from CSV'}
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>

            {/* Import Results */}
            {importResult && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-green-800">Import Completed</h4>
                    <div className="mt-2 text-sm text-green-700">
                      <p><strong>Processed:</strong> {importResult.summary.processed} rows</p>
                      <p><strong>Created:</strong> {importResult.summary.created} cameras</p>
                      {importResult.summary.skipped > 0 && (
                        <p><strong>Skipped:</strong> {importResult.summary.skipped} rows</p>
                      )}
                      {importResult.summary.errors > 0 && (
                        <p><strong>Errors:</strong> {importResult.summary.errors} rows</p>
                      )}
                    </div>
                    
                    {importResult.errors && importResult.errors.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-red-800">Errors:</p>
                        <ul className="mt-1 text-sm text-red-700 list-disc list-inside max-h-32 overflow-y-auto">
                          {importResult.errors.slice(0, 10).map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                          {importResult.errors.length > 10 && (
                            <li>... and {importResult.errors.length - 10} more errors</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Import Error */}
            {importError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Import Failed</h4>
                    <p className="mt-1 text-sm text-red-700">{importError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">CSV Format:</p>
              <p className="mb-2">Required columns: Brand, Model</p>
              <p className="mb-2">Optional columns: Serial, Mechanical, Cosmetic, Kamerastore Price, Sold Price, Comment</p>
              <p className="text-xs">Note: Status values should be 1-5, prices should be numeric</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImportExport