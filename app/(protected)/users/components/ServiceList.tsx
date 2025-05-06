'use client'

import { useEffect, useState, useMemo } from 'react'
import { getSalonServices, updateCategoryOrder } from '@/services/services'
import type { SalonServicesResponse, Category, Service, Addon } from '@/services/services'
import { formatPrice } from '@/lib/utils'
import ServiceOptions from './ServiceOptions'
import TemplateServiceList from './TemplateServiceList'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { toast } from 'sonner'

type DragData = {
  type: 'category' | 'service';
  categoryId: string;
}

// Sortable Category component
function SortableCategory({
  category,
  expandedCategories,
  toggleCategory,
  expandedServices,
  toggleService,
  formatDuration,
}: {
  category: Category;
  expandedCategories: Set<string>;
  toggleCategory: (id: string) => void;
  expandedServices: Set<string>;
  toggleService: (id: string) => void;
  formatDuration: (duration: { start: number; break: number; finish: number }) => string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: category.id,
    data: {
      type: 'category',
      categoryId: category.id
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-md overflow-hidden shadow-sm mb-3"
    >
      {/* Category Header */}
      <div
        className="bg-muted p-3 flex items-center justify-between cursor-pointer"
        onClick={() => toggleCategory(category.id)}
      >
        <div className="flex items-center">
          <div
            className="mr-2 text-sm px-2 py-1 cursor-move"
            {...attributes}
            {...listeners}
          >
            ⋮⋮
          </div>
          <button className="mr-2 text-sm">
            {expandedCategories.has(category.id) ?
              <span className="text-lg">▼</span> :
              <span className="text-lg">▶</span>
            }
          </button>
          <h3 className="text-sm font-medium">{category.name}</h3>
        </div>
        <div className="text-xs text-muted-foreground">
          {category.services.length} service{category.services.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Services List */}
      {expandedCategories.has(category.id) && (
        <div className="divide-y">
          {category.services.map((service) => (
            <SortableService
              key={service.id}
              service={service}
              expandedServices={expandedServices}
              toggleService={toggleService}
              formatDuration={formatDuration}
              categoryId={category.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Sortable Service component
function SortableService({
  service,
  expandedServices,
  toggleService,
  formatDuration,
  categoryId,
}: {
  service: Service;
  expandedServices: Set<string>;
  toggleService: (id: string) => void;
  formatDuration: (duration: { start: number; break: number; finish: number }) => string;
  categoryId: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: service.id,
    data: {
      type: 'service',
      categoryId: categoryId
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="px-3"
    >
      <div
        className="py-2.5 flex items-center justify-between cursor-pointer"
        onClick={() => toggleService(service.id)}
      >
        <div className="flex items-center">
          <div
            className="mr-2 text-sm px-2 py-1 cursor-move"
            {...attributes}
            {...listeners}
          >
            ⋮⋮
          </div>
          {service.addons.length > 0 && (
            <button className="mr-2 text-sm">
              {expandedServices.has(service.id) ?
                <span className="text-lg">▼</span> :
                <span className="text-lg">▶</span>
              }
            </button>
          )}
          <div className="ml-2">
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
              <div>
                <div className="text-xs font-medium">{addon.name}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDuration(addon.duration)}
                </div>
              </div>
              <div className="text-xs font-medium">{formatPrice(addon.cost)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Skeleton loading component
function ServiceListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border rounded-md overflow-hidden shadow-sm">
          <div className="bg-muted p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="p-3 space-y-2">
            {[...Array(2)].map((_, j) => (
              <div key={j} className="flex items-center justify-between">
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ServiceList({ salonId = 'salon-1' }: { salonId?: string }) {
  const [data, setData] = useState<SalonServicesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set())
  const [showTemplates, setShowTemplates] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeData, setActiveData] = useState<DragData | null>(null)
  const [overCategory, setOverCategory] = useState<string | null>(null)

  const fetchSalonServices = async () => {
    try {
      setLoading(true)
      const result = await getSalonServices(salonId)
      setData(result)

      // For better UX, expand all categories by default
      if (result?.categories?.length) {
        setExpandedCategories(new Set(result.categories.map(c => c.id)))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load salon services')
      console.error('Error fetching salon services:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSalonServices()
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

  const handleLoadTemplates = () => {
    setShowTemplates(true)
  }

  const handleCreateCustom = () => {
    console.log('Create custom service - to be implemented')
  }

  const handleTemplatesComplete = async () => {
    // Refresh salon services after adding templates
    await fetchSalonServices()
    setShowTemplates(false)
  }

  const handleTemplatesBack = () => {
    setShowTemplates(false)
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

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handler for drag start
  const handleDragStart = (event: DragStartEvent) => {
    const activeData = event.active.data.current as DragData;
    if (activeData?.type === 'category') {
      setExpandedCategories(new Set());
    }
  };

  // Handler for drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      // If dropped outside, re-expand categories only if we were dragging a category
      const activeData = active.data.current as DragData;
      if (activeData?.type === 'category' && data?.categories) {
        setExpandedCategories(new Set(data.categories.map(c => c.id)));
      }
      return;
    }

    // Extract data from both elements
    const activeData = active.data.current as DragData | undefined;
    const overData = over.data.current as DragData | undefined;

    if (!activeData || !overData) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Skip if dropping onto itself
    if (activeId === overId) {
      // Re-expand categories only if we were dragging a category
      if (activeData.type === 'category' && data?.categories) {
        setExpandedCategories(new Set(data.categories.map(c => c.id)));
      }
      return;
    }

    // CASE 1: Reordering categories
    if (activeData.type === 'category' && overData.type === 'category') {
      // Store the current state for potential rollback
      const previousData = data;

      try {
        // Find the new order index based on the over category
        const overCategoryIndex = data?.categories.findIndex(c => c.id === overId) ?? -1;
        if (overCategoryIndex === -1) return;

        // Update the local state first for immediate feedback
        setData(prevData => {
          if (!prevData?.categories) return prevData;

          const oldIndex = prevData.categories.findIndex(c => c.id === activeId);
          const newIndex = prevData.categories.findIndex(c => c.id === overId);

          if (oldIndex === -1 || newIndex === -1) return prevData;

          const newCategories = [...prevData.categories];
          const [movedCategory] = newCategories.splice(oldIndex, 1);
          newCategories.splice(newIndex, 0, movedCategory);

          return { ...prevData, categories: newCategories };
        });

        // Expand all categories after local update
        if (data?.categories) {
          setExpandedCategories(new Set(data.categories.map(c => c.id)));
        }

        // Make the API call after local update
        await updateCategoryOrder(activeId, overCategoryIndex, salonId);

        toast.success('Category order updated successfully');
      } catch (error) {
        console.error('Error updating category order:', error);
        // Revert to previous state on error
        setData(previousData);
        toast.error('Failed to update category order');
        // Re-expand categories in case of error
        if (previousData?.categories) {
          setExpandedCategories(new Set(previousData.categories.map(c => c.id)));
        }
      }
      return;
    }

    // CASE 2: Reordering services within the same category
    if (activeData.type === 'service' && overData.type === 'service' && activeData.categoryId === overData.categoryId) {
      setData(prevData => {
        if (!prevData?.categories) return prevData;

        const categoryIndex = prevData.categories.findIndex(c => c.id === activeData.categoryId);
        if (categoryIndex === -1) return prevData;

        const services = prevData.categories[categoryIndex].services;
        const oldIndex = services.findIndex(s => s.id === activeId);
        const newIndex = services.findIndex(s => s.id === overId);

        if (oldIndex === -1 || newIndex === -1) return prevData;

        const newCategories = [...prevData.categories];
        const newServices = [...services];
        const [movedService] = newServices.splice(oldIndex, 1);
        newServices.splice(newIndex, 0, movedService);

        newCategories[categoryIndex] = {
          ...newCategories[categoryIndex],
          services: newServices
        };

        return { ...prevData, categories: newCategories };
      });
      return;
    }

    // CASE 3: Moving service to a different category
    if (activeData.type === 'service') {
      // Get target category ID (either from a service or directly from a category)
      const targetCategoryId = overData.type === 'service'
        ? overData.categoryId
        : overData.type === 'category'
          ? overId
          : null;

      if (targetCategoryId && activeData.categoryId !== targetCategoryId) {
        setData(prevData => {
          if (!prevData?.categories) return prevData;

          const sourceCategoryIndex = prevData.categories.findIndex(c => c.id === activeData.categoryId);
          const targetCategoryIndex = prevData.categories.findIndex(c => c.id === targetCategoryId);

          if (sourceCategoryIndex === -1 || targetCategoryIndex === -1) return prevData;

          // Find the service to move
          const serviceIndex = prevData.categories[sourceCategoryIndex].services.findIndex(s => s.id === activeId);
          if (serviceIndex === -1) return prevData;

          // Create a deep copy of categories
          const newCategories = [...prevData.categories];

          // Remove service from source category
          const [movedService] = newCategories[sourceCategoryIndex].services.splice(serviceIndex, 1);

          // Add service to target category
          // If dropping over a specific service, find its position
          if (overData.type === 'service') {
            const targetServiceIndex = newCategories[targetCategoryIndex].services.findIndex(s => s.id === overId);
            if (targetServiceIndex !== -1) {
              newCategories[targetCategoryIndex].services.splice(targetServiceIndex, 0, movedService);
            } else {
              newCategories[targetCategoryIndex].services.push(movedService);
            }
          } else {
            // If dropping over a category, add to the end
            newCategories[targetCategoryIndex].services.push(movedService);
          }

          return { ...prevData, categories: newCategories };
        });
      }
    }
  };

  if (showTemplates) {
    return (
      <TemplateServiceList
        salonId={salonId}
        onComplete={handleTemplatesComplete}
        onBack={handleTemplatesBack}
      />
    )
  }

  if (loading) {
    return (
      <div className="w-full space-y-4 p-2">
        <div className="flex justify-center items-center mb-6">
          <h2 className="text-xl font-semibold">Salon Services</h2>
        </div>
        <ServiceListSkeleton />
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

  return (
    <div className="w-full space-y-4 p-2">
      <div className="flex justify-center items-center mb-6">
        <h2 className="text-xl font-semibold">Salon Services</h2>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={data?.categories.map(c => c.id) ?? []}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {data?.categories?.map((category) => (
              <SortableCategory
                key={category.id}
                category={category}
                expandedCategories={expandedCategories}
                toggleCategory={toggleCategory}
                expandedServices={expandedServices}
                toggleService={toggleService}
                formatDuration={formatDuration}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {!data?.categories?.length && (
        <div className="text-center p-6 border border-dashed rounded-md">
          <p className="text-sm text-muted-foreground">No services available for this salon</p>
        </div>
      )}

      <div className="mt-4 text-sm text-muted-foreground text-center">
        <p>Drag and drop services to reorder or move between categories</p>
      </div>

      <ServiceOptions onLoadTemplates={handleLoadTemplates} onCreateCustom={handleCreateCustom} />
    </div>
  )
}
