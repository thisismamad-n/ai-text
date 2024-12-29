'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

type ApiProvider = 'mistral' | 'openai' | 'anthropic'

interface ApiSettings {
  provider: ApiProvider
  apiKey: string
}

export function ApiSettings() {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<ApiSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('apiSettings')
      return saved ? JSON.parse(saved) : { provider: 'mistral', apiKey: '' }
    }
    return { provider: 'mistral', apiKey: '' }
  })

  useEffect(() => {
    localStorage.setItem('apiSettings', JSON.stringify(settings))
  }, [settings])

  return (
    <div className="relative z-50">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "rounded-full",
          "border-gray-200 dark:border-gray-700",
          "bg-white dark:bg-gray-800",
          "text-gray-700 dark:text-white",
          "hover:bg-gray-100 dark:hover:bg-gray-700",
          "transition-colors duration-200",
          "relative z-50"
        )}
      >
        <Settings className="h-[1.2rem] w-[1.2rem]" />
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-80 p-4 rounded-lg shadow-lg bg-white dark:bg-[#1B1E23] border border-gray-200 dark:border-gray-700 z-50">
            <h3 className="text-sm font-medium text-gray-700 dark:text-white mb-3">
              API Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-white">
                  AI Provider
                </label>
                <div className="flex gap-2 mt-1">
                  {(['mistral', 'openai', 'anthropic'] as ApiProvider[]).map((provider) => (
                    <Button
                      key={provider}
                      variant="outline"
                      size="sm"
                      onClick={() => setSettings(s => ({ ...s, provider }))}
                      className={cn(
                        "bg-white dark:bg-[#1B1E23] border-gray-200 dark:border-gray-700",
                        "text-gray-900 dark:text-white",
                        "hover:bg-gray-100 dark:hover:bg-gray-800",
                        settings.provider === provider && "!border-green-600 !text-green-600 dark:!border-green-500 dark:!text-green-500",
                        "capitalize"
                      )}
                    >
                      {provider}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-white">
                  API Key
                </label>
                <Textarea
                  value={settings.apiKey}
                  onChange={(e) => setSettings(s => ({ ...s, apiKey: e.target.value }))}
                  placeholder={`Enter your ${settings.provider} API key`}
                  className={cn(
                    "mt-1 h-20 text-sm",
                    "bg-white dark:bg-[#1B1E23]",
                    "text-gray-900 dark:text-white",
                    "border-gray-200 dark:border-gray-700",
                    "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                    "focus:border-green-600 dark:focus:border-green-500",
                    "transition-colors duration-200"
                  )}
                />
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your API key is stored locally in your browser and is never sent to our servers.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 