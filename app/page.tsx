'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ClipboardCopy, Upload, Moon, Sun, History } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CustomSummary } from '@/components/custom-summary'
import { ApiSettings } from '@/components/api-settings'

type Mode = 'paragraph' | 'bullet' | 'custom' | 'grammar'

type HistoryItem = {
  id: string
  inputText: string
  outputText: string
  mode: Mode
  timestamp: number
}

export default function TextSummarizer() {
  const [mode, setMode] = useState<Mode>('paragraph')
  const [length, setLength] = useState(1)
  const [inputText, setInputText] = useState('')
  const [summaryText, setSummaryText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [customInstructions, setCustomInstructions] = useState('')
  const [activeAction, setActiveAction] = useState<string>()
  const [darkMode, setDarkMode] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  
  const wordCount = inputText.trim() === '' ? 0 : inputText.trim().split(/\s+/).length
  const sentenceCount = inputText.trim() === '' ? 0 : inputText.trim().split(/[.!?]+/).filter(Boolean).length

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(prefersDark)
    if (prefersDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    const savedHistory = localStorage.getItem('textSummarizerHistory')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const getLengthLabel = (value: number) => {
    switch (value) {
      case 0:
        return 'Very Brief'
      case 1:
        return 'Brief'
      case 2:
        return 'Detailed'
      case 3:
        return 'Very Detailed'
      default:
        return 'Brief'
    }
  }

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      setInputText(clipboardText)
    } catch (err) {
      console.error('Failed to read clipboard:', err)
    }
  }

  const handleQuickAction = (action: string) => {
    setActiveAction(action)
    let instructions = ''
    switch (action) {
      case 'conclusion':
        instructions = 'Generate a concise conclusion for this text'
        break
      case 'academic':
        instructions = 'Rewrite this text in an academic style'
        break
      case 'title':
        instructions = 'Generate an appropriate title for this text'
        break
    }
    setCustomInstructions(instructions)
  }

  const handleSummarize = async () => {
    if (!inputText.trim()) return
    
    setIsLoading(true)
    try {
      const apiSettings = localStorage.getItem('apiSettings')
      if (!apiSettings) {
        throw new Error('Please configure your API settings first')
      }

      const parsedSettings = JSON.parse(apiSettings)

      if (mode === 'grammar') {
        const response = await fetch('/api/grammar-check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: inputText,
            apiKey: parsedSettings.apiKey,
            provider: parsedSettings.provider
          }),
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to check grammar')
        }
        
        const data = await response.json()
        setSummaryText(data.result)
        
        const newHistory = [{
          id: Date.now().toString(),
          inputText,
          outputText: data.result,
          mode,
          timestamp: Date.now()
        }, ...history.slice(0, 9)]
        setHistory(newHistory)
        localStorage.setItem('textSummarizerHistory', JSON.stringify(newHistory))
      } else {
        const response = await fetch('/api/summarize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: inputText,
            mode,
            length: (length + 1) * 0.25,
            customInstructions: mode === 'custom' ? customInstructions : undefined,
            apiSettings: parsedSettings
          }),
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to summarize')
        }
        
        const data = await response.json()
        setSummaryText(data.summary)
        
        const newHistory = [{
          id: Date.now().toString(),
          inputText,
          outputText: data.summary,
          mode,
          timestamp: Date.now()
        }, ...history.slice(0, 9)]
        setHistory(newHistory)
        localStorage.setItem('textSummarizerHistory', JSON.stringify(newHistory))
      }
    } catch (err) {
      console.error('Failed to process:', err)
      alert(err instanceof Error ? err.message : 'Failed to process text')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      if (file.type === 'text/plain') {
        // Handle .txt files
        const text = await file.text()
        setInputText(text)
      } else if (file.type === 'application/pdf' || 
                file.type === 'application/msword' || 
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // For other document types, we'll need to use FormData
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/extract-text', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Failed to extract text from document')
        }

        const { text } = await response.json()
        setInputText(text)
      } else {
        throw new Error('Unsupported file type')
      }
    } catch (err) {
      console.error('Failed to read file:', err)
      alert(err instanceof Error ? err.message : 'Failed to read file')
    }

    // Reset the input so the same file can be uploaded again
    e.target.value = ''
  }

  const loadFromHistory = (item: HistoryItem) => {
    setMode(item.mode)
    setInputText(item.inputText)
    setSummaryText(item.outputText)
    setShowHistory(false)
  }

  const tabs = [
    { id: "paragraph", label: "Paragraph" },
    { id: "bullet", label: "Bullet Points" },
    { id: "custom", label: "Custom" },
    { id: "grammar", label: "Grammar Check" }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-[#1B1E23] transition-colors duration-200 flex items-center">
      <div className="w-full max-w-7xl mx-auto p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Modes:</span>
            <Tabs 
              value={mode} 
              onValueChange={(value) => setMode(value as Mode)}
              className="bg-transparent"
            >
              <TabsList className="bg-gray-100 dark:bg-gray-800">
                <TabsTrigger 
                  value="paragraph"
                  className={cn(
                    "data-[state=active]:bg-green-600 data-[state=active]:text-white",
                    "dark:text-gray-300 dark:data-[state=active]:bg-green-600",
                    "transition-colors duration-200"
                  )}
                >
                  Paragraph
                </TabsTrigger>
                <TabsTrigger 
                  value="bullet"
                  className={cn(
                    "data-[state=active]:bg-green-600 data-[state=active]:text-white",
                    "dark:text-gray-300 dark:data-[state=active]:bg-green-600",
                    "transition-colors duration-200"
                  )}
                >
                  Bullet Points
                </TabsTrigger>
                <TabsTrigger 
                  value="custom"
                  className={cn(
                    "data-[state=active]:bg-green-600 data-[state=active]:text-white",
                    "dark:text-gray-300 dark:data-[state=active]:bg-green-600",
                    "transition-colors duration-200"
                  )}
                >
                  Custom
                </TabsTrigger>
                <TabsTrigger 
                  value="grammar"
                  className={cn(
                    "data-[state=active]:bg-green-600 data-[state=active]:text-white",
                    "dark:text-gray-300 dark:data-[state=active]:bg-green-600",
                    "transition-colors duration-200"
                  )}
                >
                  Grammar Check
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex items-center gap-2">
            <ApiSettings />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className={cn(
                "rounded-full",
                "border-gray-200 dark:border-gray-700",
                "bg-white dark:bg-gray-800",
                "text-gray-700 dark:text-gray-200",
                "hover:bg-gray-100 dark:hover:bg-gray-700",
                "transition-colors duration-200"
              )}
            >
              {darkMode ? (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Summary Length:
          </span>
          <div className="w-32">
            <Slider
              value={[length]}
              onValueChange={(values) => setLength(values[0])}
              min={0}
              max={3}
              step={1}
              className="[&>[role=slider]]:bg-green-600 [&>div]:bg-green-600 dark:[&>[role=slider]]:bg-green-500 dark:[&>div]:bg-green-500"
            />
          </div>
        </div>

        {mode === 'custom' && (
          <CustomSummary
            onInstructionsChange={setCustomInstructions}
            onQuickAction={handleQuickAction}
            activeAction={activeAction}
          />
        )}

        <div className="grid grid-cols-2 gap-6">
          <div className="relative">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Input Text
            </div>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={mode === 'grammar' 
                ? "Enter or paste your text for grammar checking..."
                : "Enter or paste your text and press 'Summarize.'"}
              className={cn(
                "min-h-[400px] p-4 resize-none",
                "bg-white dark:bg-[#1B1E23]",
                "text-gray-900 dark:text-gray-100",
                "border-gray-200 dark:border-gray-700",
                "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                "focus:border-green-600 dark:focus:border-green-500",
                "transition-colors duration-200"
              )}
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              {!inputText && (
                <Button
                  variant="outline"
                  onClick={handlePaste}
                  className={cn(
                    "flex items-center gap-2",
                    "bg-white dark:bg-[#1B1E23]",
                    "border-green-600 dark:border-green-500",
                    "text-green-600 dark:text-green-500",
                    "hover:bg-green-50 dark:hover:bg-green-950/30",
                    "transition-colors duration-200"
                  )}
                >
                  <ClipboardCopy className="w-4 h-4" />
                  Paste Text
                </Button>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {mode === 'grammar' ? 'Refined Version' : 'Summary'}
              </div>
              {summaryText && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(summaryText)
                      .then(() => alert('Text copied to clipboard!'))
                      .catch(() => alert('Failed to copy text'))
                  }}
                  className={cn(
                    "flex items-center gap-2",
                    "bg-white dark:bg-[#1B1E23]",
                    "border-green-600 dark:border-green-500",
                    "text-green-600 dark:text-green-500",
                    "hover:bg-green-50 dark:hover:bg-green-950/30",
                    "transition-colors duration-200"
                  )}
                >
                  <ClipboardCopy className="w-3 h-3" />
                  Copy
                </Button>
              )}
            </div>
            <Textarea
              value={summaryText}
              readOnly
              placeholder={mode === 'grammar' 
                ? "Refined version with grammar corrections will appear here..."
                : "Summary will appear here..."}
              className={cn(
                "min-h-[400px] p-4 resize-none",
                "bg-white dark:bg-[#1B1E23]",
                "text-gray-900 dark:text-gray-100",
                "border-gray-200 dark:border-gray-700",
                "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                "focus:border-green-600 dark:focus:border-green-500",
                "transition-colors duration-200"
              )}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className={cn(
                "flex items-center gap-2",
                "bg-white dark:bg-[#1B1E23]",
                "border-gray-200 dark:border-gray-700",
                "text-gray-700 dark:text-gray-200",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                "transition-colors duration-200"
              )}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload className="w-4 h-4" />
              Upload Doc
              <input
                id="file-upload"
                type="file"
                accept=".txt,.doc,.docx,.pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
            </Button>

            <Button
              variant="outline"
              className={cn(
                "flex items-center gap-2",
                "bg-white dark:bg-[#1B1E23]",
                "border-gray-200 dark:border-gray-700",
                "text-gray-700 dark:text-gray-200",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                "transition-colors duration-200"
              )}
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="w-4 h-4" />
              History
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={handleSummarize}
              disabled={!inputText.trim() || isLoading}
              className={cn(
                "bg-green-600 hover:bg-green-700",
                "dark:bg-green-600 dark:hover:bg-green-700",
                "text-white",
                "transition-colors duration-200",
                "disabled:opacity-50"
              )}
            >
              {isLoading 
                ? (mode === 'grammar' ? 'Checking...' : 'Summarizing...') 
                : (mode === 'grammar' ? 'Check' : 'Summarize')}
            </Button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {sentenceCount} sentences • {wordCount} words
            </span>
          </div>
        </div>

        {showHistory && history.length > 0 && (
          <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">History</div>
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                  onClick={() => loadFromHistory(item)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {item.mode.charAt(0).toUpperCase() + item.mode.slice(1)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {item.inputText}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

