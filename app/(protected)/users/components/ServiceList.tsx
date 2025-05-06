'use client'

import { useEffect, useState, useMemo } from 'react'
import { getSalonServices, updateCategoryOrder, updateServiceOrder } from '@/services/services'
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
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { toast } from 'sonner'

type DragData = {
  type: 'category' | 'service' | 'container';
  categoryId: string;
}

// Add this type declaration at the top of the file, after the imports
declare global {
  interface Window {
    __previousExpandedCategories?: Set<string>;
  }
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
        <DroppableContainer id={category.id}>
          <SortableContext
            items={category.services.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
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
          </SortableContext>
        </DroppableContainer>
      )}
    </div>
  );
}

// Droppable Container component
function DroppableContainer({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({
    id,
    data: {
      type: 'container',
      categoryId: id
    }
  });

  return (
    <div ref={setNodeRef} className="w-full">
      {children}
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

// Drag Overlay component
function DragOverlayContent({ activeId, data }: { activeId: string | null; data: SalonServicesResponse | null }) {
  if (!activeId || !data) return null;

  // Find the active item
  const activeItem = data.categories.find(c => c.id === activeId) ||
    data.categories.flatMap(c => c.services).find(s => s.id === activeId);

  if (!activeItem) return null;

  return (
    <div className="border rounded-md overflow-hidden shadow-lg bg-background">
      <div className="bg-muted p-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-2 text-sm px-2 py-1">⋮⋮</div>
          <h3 className="text-sm font-medium">{activeItem.name}</h3>
        </div>
        {'cost' in activeItem && (
          <div className="text-sm font-medium">{formatPrice(activeItem.cost)}</div>
        )}
      </div>
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
    setActiveId(event.active.id as string);
  };

  // Handler for drag over
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current as DragData;
    const overData = over.data.current as DragData;

    if (!activeData || !overData) return;

    // Add visual feedback for different operations
    const overElement = document.getElementById(over.id as string);
    if (!overElement) return;

    // Remove all highlight classes
    document.querySelectorAll('.drag-over').forEach(el => {
      el.classList.remove('drag-over');
      el.classList.remove('drag-over-up');
      el.classList.remove('drag-over-down');
    });

    if (activeData.type === 'service') {
      if (overData.type === 'service') {
        // Moving within the same category or to a different category
        const activeElement = document.getElementById(active.id as string);
        if (!activeElement) return;

        const activeRect = activeElement.getBoundingClientRect();
        const overRect = overElement.getBoundingClientRect();

        const activeCenterY = activeRect.top + activeRect.height / 2;
        const overCenterY = overRect.top + overRect.height / 2;

        if (activeCenterY < overCenterY) {
          overElement.classList.add('drag-over-down');
        } else {
          overElement.classList.add('drag-over-up');
        }

        // If moving to a different category, also show movement for other services in target category
        if (activeData.categoryId !== overData.categoryId) {
          const targetCategory = data?.categories.find(c => c.id === overData.categoryId);
          if (targetCategory) {
            targetCategory.services.forEach(service => {
              if (service.id === over.id) return; // Skip the current over element

              const serviceElement = document.getElementById(service.id);
              if (!serviceElement) return;

              const serviceRect = serviceElement.getBoundingClientRect();
              const serviceCenterY = serviceRect.top + serviceRect.height / 2;

              if (activeCenterY < serviceCenterY) {
                serviceElement.classList.add('drag-over-down');
              } else {
                serviceElement.classList.add('drag-over-up');
              }
            });
          }
        }
      } else if (overData.type === 'container') {
        // Moving to a different category container
        const activeElement = document.getElementById(active.id as string);
        if (!activeElement) return;

        const activeRect = activeElement.getBoundingClientRect();
        const overRect = overElement.getBoundingClientRect();

        const activeCenterY = activeRect.top + activeRect.height / 2;
        const overCenterY = overRect.top + overRect.height / 2;

        // Get all service elements in the target category
        const targetCategory = data?.categories.find(c => c.id === overData.categoryId);
        if (targetCategory) {
          targetCategory.services.forEach(service => {
            const serviceElement = document.getElementById(service.id);
            if (!serviceElement) return;

            const serviceRect = serviceElement.getBoundingClientRect();
            const serviceCenterY = serviceRect.top + serviceRect.height / 2;

            if (activeCenterY < serviceCenterY) {
              serviceElement.classList.add('drag-over-down');
            } else {
              serviceElement.classList.add('drag-over-up');
            }
          });
        }
      }
    }
  };

  // Handler for drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Skip if dropping onto itself
    if (activeId === overId) {
      setActiveId(null);
      return;
    }

    const activeData = active.data.current as DragData | undefined;
    const overData = over.data.current as DragData | undefined;

    if (!activeData || !overData || !data?.categories) {
      setActiveId(null);
      return;
    }

    // Remove all highlight classes
    document.querySelectorAll('.drag-over').forEach(el => {
      el.classList.remove('drag-over');
      el.classList.remove('drag-over-up');
      el.classList.remove('drag-over-down');
    });

    // CASE 1: Reordering categories
    if (activeData.type === 'category' && overData.type === 'category') {
      const oldIndex = data.categories.findIndex(c => c.id === activeId);
      const newIndex = data.categories.findIndex(c => c.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newCategories = arrayMove(data.categories, oldIndex, newIndex);
        setData({ ...data, categories: newCategories });

        try {
          await updateCategoryOrder(activeId, newIndex, salonId);
          toast.success('Category order updated successfully');
        } catch (error) {
          console.error('Error updating category order:', error);
          setData(data); // Revert on error
          toast.error('Failed to update category order');
        }
      }
    }

    // CASE 2: Reordering services within the same category
    if (activeData.type === 'service' && overData.type === 'service' && activeData.categoryId === overData.categoryId) {
      const categoryIndex = data.categories.findIndex(c => c.id === activeData.categoryId);
      if (categoryIndex === -1) return;

      const services = data.categories[categoryIndex].services;
      const oldIndex = services.findIndex(s => s.id === activeId);
      const newIndex = services.findIndex(s => s.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newServices = arrayMove(services, oldIndex, newIndex);
        const newCategories = [...data.categories];
        newCategories[categoryIndex] = {
          ...newCategories[categoryIndex],
          services: newServices
        };
        setData({ ...data, categories: newCategories });

        try {
          await updateServiceOrder(activeId, newIndex, salonId);
          toast.success('Service order updated successfully');
        } catch (error) {
          console.error('Error updating service order:', error);
          setData(data); // Revert on error
          toast.error('Failed to update service order');
        }
      }
    }

    // CASE 3: Moving service to a different category
    if (activeData.type === 'service' && (overData.type === 'container' || overData.type === 'service')) {
      const sourceCategoryIndex = data.categories.findIndex(c => c.id === activeData.categoryId);
      const targetCategoryId = overData.type === 'service' ? overData.categoryId : overId;
      const targetCategoryIndex = data.categories.findIndex(c => c.id === targetCategoryId);

      if (sourceCategoryIndex !== -1 && targetCategoryIndex !== -1) {
        const sourceServiceIndex = data.categories[sourceCategoryIndex].services.findIndex(s => s.id === activeId);
        if (sourceServiceIndex === -1) return;

        const newCategories = [...data.categories];
        const [movedService] = newCategories[sourceCategoryIndex].services.splice(sourceServiceIndex, 1);

        // Calculate the new order index
        let newOrderIndex;
        if (overData.type === 'service') {
          const targetServiceIndex = newCategories[targetCategoryIndex].services.findIndex(s => s.id === overId);
          if (targetServiceIndex !== -1) {
            newCategories[targetCategoryIndex].services.splice(targetServiceIndex, 0, movedService);
            newOrderIndex = targetServiceIndex;
          } else {
            newCategories[targetCategoryIndex].services.push(movedService);
            newOrderIndex = newCategories[targetCategoryIndex].services.length - 1;
          }
        } else {
          newCategories[targetCategoryIndex].services.push(movedService);
          newOrderIndex = newCategories[targetCategoryIndex].services.length - 1;
        }

        setData({ ...data, categories: newCategories });

        try {
          await updateServiceOrder(activeId, newOrderIndex, salonId, targetCategoryId);
          toast.success('Service moved to new category successfully');
        } catch (error) {
          console.error('Error moving service:', error);
          setData(data); // Revert on error
          toast.error('Failed to move service');
        }
      }
    }

    setActiveId(null);
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

      <style jsx global>{`
        .sortable-item {
          transition: all 200ms ease;
          position: relative;
        }
        .sortable-item.sorting {
          transform: translateY(0);
          transition: all 200ms ease;
        }
        .sortable-item.sorting-up {
          transform: translateY(-100%);
          transition: all 200ms ease;
        }
        .sortable-item.sorting-down {
          transform: translateY(100%);
          transition: all 200ms ease;
        }
        .sortable-item.dragging {
          opacity: 0.5;
          transform: scale(1.02);
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          z-index: 999;
        }
        .sortable-item.drag-over {
          background-color: hsl(var(--muted));
          border-left: 2px solid hsl(var(--primary));
        }
        .sortable-item.drag-over-up {
          border-top: 2px solid hsl(var(--primary));
          background-color: hsl(var(--muted));
          transform: translateY(-8px);
          transition: transform 200ms ease;
        }
        .sortable-item.drag-over-down {
          border-bottom: 2px solid hsl(var(--primary));
          background-color: hsl(var(--muted));
          transform: translateY(8px);
          transition: transform 200ms ease;
        }
        .sortable-item.drag-over-up::before {
          content: '';
          position: absolute;
          top: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: hsl(var(--primary));
          opacity: 0.5;
        }
        .sortable-item.drag-over-down::before {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: hsl(var(--primary));
          opacity: 0.5;
        }
      `}</style>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
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

        <DragOverlay>
          <DragOverlayContent activeId={activeId} data={data} />
        </DragOverlay>
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
