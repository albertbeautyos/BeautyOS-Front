'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { PlusIcon, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function ServiceOptions({ onLoadTemplates, onCreateCustom }: {
  onLoadTemplates?: () => void,
  onCreateCustom?: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleCreateCustomService = () => {
    if (onCreateCustom) {
      onCreateCustom()
    }
    setIsOpen(false)
  }

  const handleUseTemplate = () => {
    if (onLoadTemplates) {
      onLoadTemplates()
    }
    setIsOpen(false)
  }

  return (
    <div className="flex justify-end">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="sm"
            className={cn(
              "text-sm font-medium",
              isOpen && "bg-primary/90"
            )}
          >
            <PlusIcon className="mr-1.5 h-3.5 w-3.5" />
            Add Service
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60 rounded-md border-border/40 shadow-md">
          <DropdownMenuItem
            onClick={handleCreateCustomService}
            className="px-3 py-2 text-sm cursor-pointer focus:bg-muted focus:text-foreground"
          >
            <span className="flex items-center w-full">
              <PlusIcon className="h-4 w-4 mr-2 text-primary" />
              <span className="flex-1">Custom Service</span>
              <span className="text-xs text-muted-foreground">(Create your own)</span>
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleUseTemplate}
            className="px-3 py-2 text-sm cursor-pointer focus:bg-muted focus:text-foreground"
          >
            <span className="flex items-center w-full">
              <Sparkles className="h-4 w-4 mr-2 text-primary" />
              <span className="flex-1">BeautyOs Templates</span>
              <Badge variant="outline" className="ml-1 py-0 px-1.5 h-5 text-xs bg-primary/10 text-primary border-transparent">
                Recommended
              </Badge>
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}