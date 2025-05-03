'use client'

import { useEffect, useState } from 'react'
import { getTemplateServices, attachTemplateServices } from '@/services/templateServices'
import type { SalonServicesResponse, Category, Service, Addon } from '@/services/services'
import { formatPrice } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useAppSelector } from '@/store/hooks'
import { selectUserInfo } from '@/store/slices/authSlice'
import { toast } from 'sonner'

interface TemplateServiceListProps {
  salonId: string;
  onComplete?: () => void;
  onBack?: () => void;
}

export default function TemplateServiceList({ salonId, onComplete, onBack }: TemplateServiceListProps) {
  const userId = useAppSelector(selectUserInfo)?.id || ''
  const [data, setData] = useState<SalonServicesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set())
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await getTemplateServices()
        setData(result)

        // Expand all categories by default for better visibility
        if (result.categories) {
          setExpandedCategories(new Set(result.categories.map(c => c.id)))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load template services')
        console.error('Error fetching template services:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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

  const toggleSelectService = (serviceId: string) => {
    setSelectedServices(prev => {
      const newSet = new Set(prev)
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId)
      } else {
        newSet.add(serviceId)
      }
      return newSet
    })
  }

  const handleApplySelected = async () => {
    if (selectedServices.size === 0) return

    try {
      setIsSubmitting(true)
      // This should be replaced with actual user ID

      const result = await attachTemplateServices(
        userId,
        salonId,
        Array.from(selectedServices)
      )

      // Show success notification
      toast.success(`Successfully added ${selectedServices.size} services to your salon`, {
        duration: 3000
      })

      if (onComplete) {
        onComplete()
      }
    } catch (err) {
      console.error('Error attaching template services:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to attach template services', {
        duration: 4000
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoBack = () => {
    if (onBack) {
      onBack()
    }
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
        <h3 className="font-medium">Error loading template services</h3>
        <p>{error}</p>
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
    <div className="w-full space-y-4 p-2">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              className="mr-2"
              onClick={handleGoBack}
            >
              <ArrowLeft size={16} />
            </Button>
          )}
          <h2 className="text-xl font-semibold">BeautyOS Templates</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={selectedServices.size === 0 || isSubmitting}
            onClick={handleApplySelected}
          >
            {isSubmitting ? 'Applying...' : `Apply Selected (${selectedServices.size})`}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {data?.categories?.map((category) => (
          <div key={category.id} className="border rounded-md overflow-hidden shadow-sm">
            {/* Category Header */}
            <div
              className="bg-muted p-3 flex items-center justify-between cursor-pointer"
              onClick={() => toggleCategory(category.id)}
            >
              <div className="flex items-center">
                <button className="mr-2 text-sm">
                  {expandedCategories.has(category.id) ?
                    <span className="text-lg">▼</span> :
                    <span className="text-lg">▶</span>
                  }
                </button>
                <h3 className="text-sm font-medium">{category.name}</h3>
              </div>
              <div className="text-xs text-muted-foreground">
                {category.services.length} template{category.services.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Services List */}
            {expandedCategories.has(category.id) && (
              <div className="divide-y">
                {category.services.map((service) => (
                  <div key={service.id} className="px-3">
                    <div className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <Checkbox
                          checked={selectedServices.has(service.id)}
                          onCheckedChange={() => toggleSelectService(service.id)}
                          id={`service-${service.id}`}
                          className="mr-2"
                        />
                        <div
                          className="flex-1 ml-2 cursor-pointer"
                          onClick={() => toggleService(service.id)}
                        >
                          <div className="text-sm font-medium">{service.name}</div>
                          <div className="text-xs text-muted-foreground flex gap-2">
                            <span>{formatDuration(service.duration)}</span>
                            {service.hasBreak && <span>• Break included</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-medium">{formatPrice(service.cost)}</div>
                    </div>

                    {/* Addons List */}
                    {expandedServices.has(service.id) && service.addons.length > 0 && (
                      <div className="pl-8 pb-2 space-y-1.5">
                        {service.addons.map((addon) => (
                          <div key={addon.id} className="flex items-center justify-between py-1">
                            <div className="flex items-center flex-1">
                              <Checkbox
                                checked={selectedServices.has(addon.id)}
                                onCheckedChange={() => toggleSelectService(addon.id)}
                                id={`addon-${addon.id}`}
                                className="mr-2"
                              />
                              <div className="ml-2">
                                <div className="text-xs font-medium">{addon.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDuration(addon.duration)}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs font-medium">{formatPrice(addon.cost)}</div>
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

        {!data?.categories?.length && (
          <div className="text-center p-6 border border-dashed rounded-md">
            <p className="text-sm text-muted-foreground">No template services available</p>
          </div>
        )}
      </div>
    </div>
  )
}