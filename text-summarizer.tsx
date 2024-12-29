'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ClipboardCopy, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CustomSummary } from './components/custom-summary'

type Mode = 'paragraph' | 'bullet' | 'custom'

export default function TextSummarizer() {
  const [mode, setMode] = useState<Mode>('paragraph')
  const [length, setLength] = useState(50)
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [customInstructions, setCustomInstructions] = useState('')
  
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
  const sentenceCount = text.trim() === '' ? 0 : text.trim().split(/[.!?]+/).filter(Boolean).length

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      setText(clipboardText)
    } catch (err) {
      console.error('Failed to read clipboard:', err)
    }
  }

  const handleQuickAction = (action: string) => {
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
    if (!text.trim()) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          mode,
          length: length / 100,
          customInstructions: mode === 'custom' ? customInstructions : undefined,
        }),
      })
      
      if (!response.ok) throw new Error('Failed to summarize')
      
      const data = await response.json()
      setText(data.summary)
    } catch (err) {
      console.error('Failed to summarize:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Modes:</span>
          <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)}>
            <TabsList>
              <TabsTrigger 
                value="paragraph"
                className={cn(mode === 'paragraph' && 'bg-green-600 text-white')}
              >
                Paragraph
              </TabsTrigger>
              <TabsTrigger 
                value="bullet"
                className={cn(mode === 'bullet' && 'bg-green-600 text-white')}
              >
                Bullet Points
              </TabsTrigger>
              <TabsTrigger 
                value="custom"
                className={cn(mode === 'custom' && 'bg-green-600 text-white')}
              >
                Custom
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Summary Length:</span>
          <div className="flex items-center gap-2">
            <span className="text-sm">Short</span>
            <Slider
              value={[length]}
              onValueChange={(values) => setLength(values[0])}
              min={0}
              max={100}
              step={1}
              className="w-32"
            />
            <span className="text-sm">Long</span>
          </div>
        </div>
      </div>

      {mode === 'custom' && (
        <CustomSummary
          onInstructionsChange={setCustomInstructions}
          onQuickAction={handleQuickAction}
        />
      )}

      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter or paste your text and press 'Summarize.'"
          className="min-h-[300px] p-4 resize-none"
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {!text && (
            <Button
              variant="outline"
              onClick={handlePaste}
              className="flex items-center gap-2 border-green-600 text-green-600 hover:bg-green-50"
            >
              <ClipboardCopy className="w-4 h-4" />
              Paste Text
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <Upload className="w-4 h-4" />
          Upload Doc
          <input
            id="file-upload"
            type="file"
            accept=".txt,.doc,.docx,.pdf"
            className="hidden"
            onChange={(e) => {
              // Handle file upload here
              console.log(e.target.files?.[0])
            }}
          />
        </Button>

        <div className="flex items-center gap-4">
          <Button
            onClick={handleSummarize}
            disabled={!text.trim() || isLoading}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            {isLoading ? 'Summarizing...' : 'Summarize'}
          </Button>
          <span className="text-sm text-gray-500">
            {sentenceCount} sentences • {wordCount} words
          </span>
        </div>
      </div>
    </div>
  )
}

