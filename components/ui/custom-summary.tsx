'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CustomSummaryProps {
  onInstructionsChange: (instructions: string) => void
  onQuickAction: (action: string) => void
}

export default function CustomSummary({ onInstructionsChange, onQuickAction }: CustomSummaryProps) {
  const [activeSlide, setActiveSlide] = React.useState(0)
  const [instructions, setInstructions] = React.useState('')

  const examples = [
    {
      title: "Climate change",
      subtitle: "Time to take actions",
      content: "The climate debate is often fraught with assumptions, projections, best wishes, and unclear thinking. This leaves many people concerned about the climate in a bind. "What can I do?" people ask."
    },
    {
      title: "Climate Analysis",
      subtitle: "Understanding the debate",
      content: "The author acknowledges the climate debate's assumptions and unclear thinking, arguing that overestimating individual actions and assuming greenhouse gas emissions are the main common."
    },
  ]

  const handleInstructionsChange = (value: string) => {
    setInstructions(value)
    onInstructionsChange(value)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
        <span>Customizable summaries</span>
        <Sparkles className="w-5 h-5 text-yellow-400" />
      </div>

      <div className="relative">
        <Input
          value={instructions}
          placeholder="Enter instructions to tailor your summary"
          className={cn(
            "border-green-600 focus:ring-green-600",
            "dark:border-green-500 dark:focus:ring-green-500",
            "bg-white dark:bg-[#1B1E23]",
            "text-gray-900 dark:text-white",
            "placeholder:text-gray-500 dark:placeholder:text-gray-400",
            "transition-colors duration-200"
          )}
          onChange={(e) => handleInstructionsChange(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {['conclusion', 'academic', 'title'].map((action) => (
          <Button
            key={action}
            variant="outline"
            className={cn(
              "border-green-600 text-green-600",
              "dark:border-green-500 dark:text-green-500",
              "hover:bg-green-50 dark:hover:bg-green-950/30",
              "transition-colors duration-200"
            )}
            onClick={() => onQuickAction(action)}
          >
            {action === 'conclusion' && 'Generate a conclusion'}
            {action === 'academic' && 'Make it academic'}
            {action === 'title' && 'Write a title'}
          </Button>
        ))}
      </div>

      <Card className={cn(
        "relative overflow-hidden",
        "bg-white dark:bg-[#1B1E23]",
        "border-gray-200 dark:border-gray-700",
        "transition-colors duration-200"
      )}>
        <div className="flex items-stretch">
          {examples.map((example, index) => (
            <div
              key={index}
              className={`w-full flex-shrink-0 transition-transform duration-300 ease-in-out ${
                index === activeSlide ? 'translate-x-0' : 'translate-x-full'
              }`}
              style={{
                transform: `translateX(-${activeSlide * 100}%)`
              }}
            >
              <div className="p-6 space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {example.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {example.subtitle}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {example.content}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="absolute inset-y-0 left-0 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full",
              "text-gray-700 dark:text-gray-200",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "disabled:opacity-50",
              "transition-colors duration-200"
            )}
            onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))}
            disabled={activeSlide === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="absolute inset-y-0 right-0 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full",
              "text-gray-700 dark:text-gray-200",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "disabled:opacity-50",
              "transition-colors duration-200"
            )}
            onClick={() => setActiveSlide(prev => Math.min(examples.length - 1, prev + 1))}
            disabled={activeSlide === examples.length - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}

