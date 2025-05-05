'use client'

import { useEffect, useState, useMemo } from 'react'
import { getSalonServices } from '@/services/services'
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
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

type DragData = {
  type: 'category' | 'service';
  categoryId: string;
}

// Draggable Category component
function DraggableCategory({
  category,
  expandedCategories,
  toggleCategory,
  expandedServices,
  toggleService,
  formatDuration,
  activeId,
}: {
  category: Category;
  expandedCategories: Set<string>;
  toggleCategory: (id: string) => void;
  expandedServices: Set<string>;
  toggleService: (id: string) => void;
  formatDuration: (duration: { start: number; break: number; finish: number }) => string;
  activeId: string | null;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: category.id,
    data: {
      type: 'category',
      categoryId: category.id
    }
  });

  const { isOver, setNodeRef: setDropRef } = useDroppable({
    id: `category-${category.id}`,
    data: {
      type: 'category',
      categoryId: category.id
    }
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    opacity: activeId === category.id ? 0.5 : 1,
    zIndex: activeId === category.id ? 999 : 1,
  } : {};

  // Highlight the category when a draggable service is over it
  const categoryHighlight = isOver ? {
    borderColor: '#3b82f6',
    borderWidth: '2px',
    borderStyle: 'dashed',
    backgroundColor: '#f0f9ff'
  } : {};

  return (
    <div
      ref={setDropRef}
      className="border rounded-md overflow-hidden shadow-sm mb-3"
      style={{...categoryHighlight}}
    >
      {/* Category Header */}
      <div
        className="bg-muted p-3 flex items-center justify-between cursor-pointer"
        onClick={() => toggleCategory(category.id)}
      >
        <div className="flex items-center">
          <div
            ref={setNodeRef}
            className="mr-2 text-sm px-2 py-1 cursor-move"
            {...attributes}
            {...listeners}
            style={style}
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
            <DraggableService
              key={service.id}
              service={service}
              expandedServices={expandedServices}
              toggleService={toggleService}
              formatDuration={formatDuration}
              categoryId={category.id}
              activeId={activeId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Draggable Service component
function DraggableService({
  service,
  expandedServices,
  toggleService,
  formatDuration,
  categoryId,
  activeId,
}: {
  service: Service;
  expandedServices: Set<string>;
  toggleService: (id: string) => void;
  formatDuration: (duration: { start: number; break: number; finish: number }) => string;
  categoryId: string;
  activeId: string | null;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: service.id,
    data: {
      type: 'service',
      categoryId: categoryId
    }
  });

  const { isOver, setNodeRef: setDropRef } = useDroppable({
    id: `service-${service.id}`,
    data: {
      type: 'service',
      categoryId: categoryId
    }
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    opacity: activeId === service.id ? 0.5 : 1,
    zIndex: activeId === service.id ? 999 : 1,
  } : {};

  // Highlight the service when a draggable service is over it
  const serviceHighlight = isOver ? {
    backgroundColor: '#f0f9ff',
    borderLeft: '3px solid #3b82f6'
  } : {};

  return (
    <div
      ref={setDropRef}
      className="px-3"
      style={{...serviceHighlight}}
    >
      <div
        className="py-2.5 flex items-center justify-between cursor-pointer"
        onClick={() => toggleService(service.id)}
      >
        <div className="flex items-center">
          <div
            ref={setNodeRef}
            className="mr-2 text-sm px-2 py-1 cursor-move"
            {...attributes}
            {...listeners}
            style={style}
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
      coordinateGetter: (event) => {
        return {
          x: 0,
          y: event.code === 'ArrowDown' ? 5 : event.code === 'ArrowUp' ? -5 : 0,
        };
      },
    })
  );

  // Handler for drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveData(event.active.data.current as DragData);
  };

  // Handler for drag over
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;

    if (!over) {
      setOverCategory(null);
      return;
    }

    // Extract data from the over element
    const overData = over.data.current as DragData | undefined;
    if (overData && overData.type === 'category') {
      setOverCategory(overData.categoryId);
    } else if (overData && overData.type === 'service') {
      // If over a service, get its category
      setOverCategory(overData.categoryId);
    } else {
      setOverCategory(null);
    }
  };

  // Handler for drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setActiveData(null);
    setOverCategory(null);

    if (!over) return;

    // Extract data from both elements
    const activeData = active.data.current as DragData | undefined;
    const overData = over.data.current as DragData | undefined;

    if (!activeData || !overData) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Extract real IDs without prefixes
    const activeRealId = activeId;
    const overRealId = overId.startsWith('category-')
      ? overId.substring(9)
      : overId.startsWith('service-')
        ? overId.substring(8)
        : overId;

    // Skip if dropping onto itself
    if (activeRealId === overRealId) return;

    // CASE 1: Reordering categories
    if (activeData.type === 'category' && overData.type === 'category') {
      setData(prevData => {
        if (!prevData?.categories) return prevData;

        const oldIndex = prevData.categories.findIndex(c => c.id === activeRealId);
        const newIndex = prevData.categories.findIndex(c => c.id === overRealId);

        if (oldIndex === -1 || newIndex === -1) return prevData;

        const newCategories = [...prevData.categories];
        const [movedCategory] = newCategories.splice(oldIndex, 1);
        newCategories.splice(newIndex, 0, movedCategory);

        return { ...prevData, categories: newCategories };
      });
      return;
    }

    // CASE 2: Reordering services within the same category
    if (activeData.type === 'service' && overData.type === 'service' && activeData.categoryId === overData.categoryId) {
      setData(prevData => {
        if (!prevData?.categories) return prevData;

        const categoryIndex = prevData.categories.findIndex(c => c.id === activeData.categoryId);
        if (categoryIndex === -1) return prevData;

        const services = prevData.categories[categoryIndex].services;
        const oldIndex = services.findIndex(s => s.id === activeRealId);
        const newIndex = services.findIndex(s => s.id === overRealId);

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
          ? overRealId
          : null;

      if (targetCategoryId && activeData.categoryId !== targetCategoryId) {
        setData(prevData => {
          if (!prevData?.categories) return prevData;

          const sourceCategoryIndex = prevData.categories.findIndex(c => c.id === activeData.categoryId);
          const targetCategoryIndex = prevData.categories.findIndex(c => c.id === targetCategoryId);

          if (sourceCategoryIndex === -1 || targetCategoryIndex === -1) return prevData;

          // Find the service to move
          const serviceIndex = prevData.categories[sourceCategoryIndex].services.findIndex(s => s.id === activeRealId);
          if (serviceIndex === -1) return prevData;

          // Create a deep copy of categories
          const newCategories = [...prevData.categories];

          // Remove service from source category
          const [movedService] = newCategories[sourceCategoryIndex].services.splice(serviceIndex, 1);

          // Add service to target category
          // If dropping over a specific service, find its position
          if (overData.type === 'service') {
            const targetServiceIndex = newCategories[targetCategoryIndex].services.findIndex(s => s.id === overRealId);
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

  return (
    <div className="w-full space-y-4 p-2">
      <div className="flex justify-center items-center mb-6">
        <h2 className="text-xl font-semibold">Salon Services</h2>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <div className="space-y-3">
          {data?.categories?.map((category) => (
            <DraggableCategory
              key={category.id}
              category={category}
              expandedCategories={expandedCategories}
              toggleCategory={toggleCategory}
              expandedServices={expandedServices}
              toggleService={toggleService}
              formatDuration={formatDuration}
              activeId={activeId}
            />
          ))}
        </div>
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
