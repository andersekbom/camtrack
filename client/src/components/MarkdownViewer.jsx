import { useState, useEffect } from 'react'

const MarkdownViewer = ({ url, title, darkMode = false, onClose }) => {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMarkdownContent()
  }, [url])

  const fetchMarkdownContent = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to load documentation: ${response.statusText}`)
      }
      
      const text = await response.text()
      setContent(text)
    } catch (err) {
      console.error('Failed to fetch markdown:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const parseMarkdown = (text) => {
    if (!text) return ''
    
    // Split into lines for better processing
    const lines = text.split('\n')
    const result = []
    let inCodeBlock = false
    let inList = false
    let listItems = []
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i]
      
      // Handle code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          result.push('</code></pre>')
          inCodeBlock = false
        } else {
          result.push('<pre><code>')
          inCodeBlock = true
        }
        continue
      }
      
      if (inCodeBlock) {
        result.push(line)
        continue
      }
      
      // Handle list items
      if (line.match(/^[\s]*[-*+] /) || line.match(/^[\s]*\d+\. /)) {
        if (!inList) {
          inList = true
          listItems = []
        }
        const listContent = line.replace(/^[\s]*[-*+] /, '').replace(/^[\s]*\d+\. /, '')
        listItems.push(`<li>${listContent}</li>`)
      } else {
        if (inList) {
          result.push('<ul>' + listItems.join('') + '</ul>')
          inList = false
          listItems = []
        }
        
        // Handle headers
        if (line.startsWith('# ')) {
          result.push(`<h1>${line.substring(2)}</h1>`)
        } else if (line.startsWith('## ')) {
          result.push(`<h2>${line.substring(3)}</h2>`)
        } else if (line.startsWith('### ')) {
          result.push(`<h3>${line.substring(4)}</h3>`)
        } else if (line.startsWith('---')) {
          result.push('<hr>')
        } else if (line.trim() === '') {
          result.push('<br>')
        } else {
          // Process inline markdown
          let processedLine = line
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic (but not bold)
            .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            // Images - handle relative paths
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
              // Convert relative paths to absolute API paths
              if (src.startsWith('screenshots/') || src.startsWith('docs/')) {
                src = `/api/help/${src}`
              }
              return `<img src="${src}" alt="${alt}" class="doc-image" />`
            })
          
          if (processedLine.trim() !== '') {
            result.push(`<p>${processedLine}</p>`)
          }
        }
      }
    }
    
    // Handle any remaining list items
    if (inList && listItems.length > 0) {
      result.push('<ul>' + listItems.join('') + '</ul>')
    }
    
    return result.join('')
  }

  if (!url) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div 
        className={`max-w-4xl w-full max-h-[90vh] overflow-hidden rounded-lg shadow-xl ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center">
              <span className="mr-2">📖</span>
              {title || 'Documentation'}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-2 ${
                  darkMode 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-600' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700 border border-gray-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Help
              </button>
              <button
                onClick={onClose}
                className={`p-1 rounded-md transition-colors ${
                  darkMode 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                Loading documentation...
              </p>
            </div>
          )}

          {error && (
            <div className="p-6">
              <div className={`p-4 rounded-md ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-700'}`}>
                <div className="flex">
                  <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-medium">Error Loading Documentation</h3>
                    <p className="text-sm mt-1">{error}</p>
                    <button 
                      onClick={fetchMarkdownContent}
                      className="text-sm underline mt-2 hover:no-underline"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {content && !loading && !error && (
            <div className="p-6">
              <div 
                className={`prose max-w-none ${
                  darkMode ? 'prose-invert' : ''
                }`}
                dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
                style={{
                  '--tw-prose-body': darkMode ? '#d1d5db' : '#374151',
                  '--tw-prose-headings': darkMode ? '#f9fafb' : '#111827',
                  '--tw-prose-links': darkMode ? '#60a5fa' : '#2563eb',
                  '--tw-prose-bold': darkMode ? '#f9fafb' : '#111827',
                  '--tw-prose-code': darkMode ? '#f9fafb' : '#111827',
                  '--tw-prose-pre-code': darkMode ? '#d1d5db' : '#374151',
                  '--tw-prose-pre-bg': darkMode ? '#374151' : '#f3f4f6',
                  '--tw-prose-th-borders': darkMode ? '#4b5563' : '#d1d5db',
                  '--tw-prose-td-borders': darkMode ? '#4b5563' : '#e5e7eb',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MarkdownViewer