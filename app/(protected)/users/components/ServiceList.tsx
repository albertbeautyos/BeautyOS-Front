'use client'

import { useEffect, useState } from 'react'
import { getSalonServices } from '@/services/services'
import type { SalonServicesResponse, Category, Service, Addon } from '@/services/services'
import { formatPrice } from '@/lib/utils'

export default function ServiceList({ salonId = 'salon-1' }: { salonId?: string }) {

  const [data, setData] = useState<SalonServicesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await getSalonServices(salonId)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load salon services')
        console.error('Error fetching salon services:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [salonId])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const toggleService = (serviceId: string) => {
    setExpandedServices(prev => {
      const newSet = new Set(prev)
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId)
      } else {
        newSet.add(serviceId)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md my-4">
        <h3 className="font-medium">Error loading services</h3>
        <p>{error}</p>
      </div>
    )
  }

  if (!data || !data.categories || data.categories.length === 0) {
    return (
      <div className="text-center p-6 border border-dashed rounded-md">
        <p className="text-muted-foreground">No services available for this salon</p>
      </div>
    )
  }

  // Helper function to render duration
  const formatDuration = (duration: { start: number; break: number; finish: number }) => {
    const totalMinutes = duration.start + duration.break + duration.finish
    if (totalMinutes < 60) {
      return `${totalMinutes} min`
    }
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`
  }

  return (
    <div className="w-full space-y-4">
      <h2 className="text-2xl font-bold mb-6">Salon Services</h2>

      <div className="space-y-4">
        {data.categories.map((category) => (
          <div key={category.id} className="border rounded-lg overflow-hidden">
            {/* Category Header */}
            <div
              className="bg-muted p-4 flex items-center justify-between cursor-pointer"
              onClick={() => toggleCategory(category.id)}
            >
              <div className="flex items-center">
                <button className="mr-2 text-sm">
                  {expandedCategories.has(category.id) ?
                    <span className="text-lg">▼</span> :
                    <span className="text-lg">▶</span>
                  }
                </button>
                <h3 className="font-medium">{category.name}</h3>
              </div>
              <div className="text-sm text-muted-foreground">
                {category.services.length} service{category.services.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Services List */}
            {expandedCategories.has(category.id) && (
              <div className="divide-y">
                {category.services.map((service) => (
                  <div key={service.id} className="px-4">
                    <div
                      className="py-3 flex items-center justify-between cursor-pointer"
                      onClick={() => toggleService(service.id)}
                    >
                      <div className="flex items-center">
                        {service.addons.length > 0 && (
                          <button className="mr-2 text-sm">
                            {expandedServices.has(service.id) ?
                              <span className="text-lg">▼</span> :
                              <span className="text-lg">▶</span>
                            }
                          </button>
                        )}
                        <div className="ml-4">
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-muted-foreground flex gap-2">
                            <span>{formatDuration(service.duration)}</span>
                            {service.hasBreak && <span>• Break included</span>}
                          </div>
                        </div>
                      </div>
                      <div className="font-medium">{formatPrice(service.cost)}</div>
                    </div>

                    {/* Addons List */}
                    {expandedServices.has(service.id) && service.addons.length > 0 && (
                      <div className="pl-10 pb-3 space-y-2">
                        {service.addons.map((addon) => (
                          <div key={addon.id} className="flex items-center justify-between py-1">
                            <div>
                              <div className="text-sm font-medium">{addon.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatDuration(addon.duration)}
                              </div>
                            </div>
                            <div className="text-sm font-medium">{formatPrice(addon.cost)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
