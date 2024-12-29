'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface CustomSummaryProps {
  onInstructionsChange: (instructions: string) => void
  onQuickAction: (action: string) => void
  activeAction?: string
}

export function CustomSummary({ onInstructionsChange, onQuickAction, activeAction }: CustomSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => onQuickAction('conclusion')}
          className={cn(
            "text-sm",
            "bg-white dark:bg-[#1B1E23]",
            "border-gray-200 dark:border-gray-700",
            "text-gray-700 dark:text-white",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            activeAction === 'conclusion' && "!border-green-600 !text-green-600 dark:!border-green-500 dark:!text-green-500"
          )}
        >
          Generate Conclusion
        </Button>
        <Button
          variant="outline"
          onClick={() => onQuickAction('academic')}
          className={cn(
            "text-sm",
            "bg-white dark:bg-[#1B1E23]",
            "border-gray-200 dark:border-gray-700",
            "text-gray-700 dark:text-white",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            activeAction === 'academic' && "!border-green-600 !text-green-600 dark:!border-green-500 dark:!text-green-500"
          )}
        >
          Academic Style
        </Button>
        <Button
          variant="outline"
          onClick={() => onQuickAction('title')}
          className={cn(
            "text-sm",
            "bg-white dark:bg-[#1B1E23]",
            "border-gray-200 dark:border-gray-700",
            "text-gray-700 dark:text-white",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            activeAction === 'title' && "!border-green-600 !text-green-600 dark:!border-green-500 dark:!text-green-500"
          )}
        >
          Generate Title
        </Button>
      </div>
      <Textarea
        placeholder="Enter custom instructions for the summary..."
        onChange={(e) => onInstructionsChange(e.target.value)}
        className={cn(
          "h-24",
          "bg-white dark:bg-[#1B1E23]",
          "text-gray-900 dark:text-white",
          "border-gray-200 dark:border-gray-700",
          "placeholder:text-gray-500 dark:placeholder:text-gray-400",
          "focus:border-green-600 dark:focus:border-green-500",
          "transition-colors duration-200"
        )}
      />
    </div>
  )
}

