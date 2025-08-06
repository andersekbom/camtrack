import { useState, useEffect } from 'react'
import { getSummary } from '../services/api'

const Summary = ({ refreshTrigger }) => {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getSummary()
        setSummary(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [refreshTrigger])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getConditionLabel = (rating) => {
    const labels = {
      1: 'Poor',
      2: 'Fair', 
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    }
    return labels[rating] || 'Unknown'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-500">Error loading summary: {error}</div>
      </div>
    )
  }

  if (!summary) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Collection Summary</h2>
        
        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{summary.totalCameras}</div>
            <div className="text-sm text-blue-800">Total Cameras</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalValue)}</div>
            <div className="text-sm text-green-800">Total Collection Value</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(summary.averageValue)}</div>
            <div className="text-sm text-purple-800">Average Camera Value</div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{summary.recentAdditions}</div>
            <div className="text-sm text-orange-800">Added This Month</div>
          </div>
        </div>

        {/* Condition Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Average Condition</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Mechanical:</span>
                <span className="font-medium">{summary.averageMechanicalCondition.toFixed(1)}/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cosmetic:</span>
                <span className="font-medium">{summary.averageCosmeticCondition.toFixed(1)}/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">With Images:</span>
                <span className="font-medium">{summary.camerasWithImages}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Price Distribution</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Under $100:</span>
                <span className="font-medium">{summary.priceRanges.under100}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">$100 - $300:</span>
                <span className="font-medium">{summary.priceRanges.range100to300}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">$300 - $500:</span>
                <span className="font-medium">{summary.priceRanges.range300to500}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">$500 - $1000:</span>
                <span className="font-medium">{summary.priceRanges.range500to1000}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Over $1000:</span>
                <span className="font-medium">{summary.priceRanges.over1000}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Extremes */}
        {(summary.mostExpensive || summary.leastExpensive) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {summary.mostExpensive && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Most Expensive</h3>
                <div className="text-lg font-bold text-yellow-600">
                  {summary.mostExpensive.brand} {summary.mostExpensive.model}
                </div>
                <div className="text-yellow-800">{formatCurrency(summary.mostExpensive.price)}</div>
              </div>
            )}
            
            {summary.leastExpensive && (
              <div className="bg-cyan-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Least Expensive</h3>
                <div className="text-lg font-bold text-cyan-600">
                  {summary.leastExpensive.brand} {summary.leastExpensive.model}
                </div>
                <div className="text-cyan-800">{formatCurrency(summary.leastExpensive.price)}</div>
              </div>
            )}
          </div>
        )}

        {/* Top Brands */}
        {summary.brandBreakdown && summary.brandBreakdown.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Top Brands</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary.brandBreakdown.slice(0, 6).map((brand, index) => (
                <div key={brand.brand} className="bg-white p-3 rounded border">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">{brand.brand}</div>
                      <div className="text-sm text-gray-600">{brand.count} cameras</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        {formatCurrency(brand.totalValue)}
                      </div>
                      {brand.averageValue > 0 && (
                        <div className="text-xs text-gray-500">
                          avg: {formatCurrency(brand.averageValue)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Condition Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Mechanical Condition</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = summary.conditionBreakdown.mechanical[rating] || 0
                return count > 0 ? (
                  <div key={rating} className="flex justify-between items-center">
                    <span className="text-sm">{rating} - {getConditionLabel(rating)}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ) : null
              })}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Cosmetic Condition</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = summary.conditionBreakdown.cosmetic[rating] || 0
                return count > 0 ? (
                  <div key={rating} className="flex justify-between items-center">
                    <span className="text-sm">{rating} - {getConditionLabel(rating)}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ) : null
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Summary