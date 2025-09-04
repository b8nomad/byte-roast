"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UploadCloud, Copy, Flame, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ByteRoastPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [roastText, setRoastText] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const { toast } = useToast()

  const handleImageUpload = useCallback((file: File) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setShowResult(false)
      setRoastText("")
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) {
        handleImageUpload(file)
      }
    },
    [handleImageUpload],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleImageUpload(file)
      }
    },
    [handleImageUpload],
  )

  const generateRoast = async () => {
    if (!selectedImage) return

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("image", selectedImage)

      const response = await fetch("/api/roast", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      if (result.roast && result.roast.trim()) {
        setRoastText(result.roast.trim())
      } else {
        throw new Error("Empty response from API")
      }
      setShowResult(true)

      toast({
        title: "Roast delivered! 🔥",
        description: "Your image has been thoroughly roasted!",
      })
    } catch (error) {
      console.error("Roast generation failed:", error)
      toast({
        title: "API temporarily down 💥",
        description: "Using backup roast generator!",
        variant: "destructive",
      })
      // Enhanced fallback roasts
      const fallbackRoasts = [
        "This person looks like they debug code by changing random variables until it works.",
        "Bro really said 'let me take a selfie' and forgot to install confidence.exe first.",
        "Looking like a Stack Overflow question that nobody wants to answer.",
        "This is what happens when you order charisma from AliExpress.",
        "Face.exe has stopped working. Would you like to restart?",
        "This person definitely uses Internet Explorer by choice.",
      ]
      const randomRoast = fallbackRoasts[Math.floor(Math.random() * fallbackRoasts.length)]
      setRoastText(randomRoast)
      setShowResult(true)
    } finally {
      setIsLoading(false)
    }
  }

  const copyRoast = () => {
    navigator.clipboard.writeText(roastText)
    toast({
      title: "Roast copied! 🔥",
      description: "Share the burn with your friends",
    })
  }

  return (
    <div className="min-h-screen roast-bg flex items-center justify-center p-2 sm:p-4 font-sans relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-red-500/20 animate-pulse"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-orange-500/30 animate-bounce"></div>
        <div className="absolute bottom-32 left-16 w-3 h-3 bg-yellow-500/20 animate-ping"></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-red-400/25 animate-pulse"></div>
      </div>

      <Card className="roast-card p-4 sm:p-8 lg:p-16 max-w-4xl w-full text-center transition-all hover:scale-[1.01] duration-500 border-0 relative z-10">
        <div className="mb-6 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-poppins)] mb-4 text-white leading-tight">
            Upload & Get{" "}
            <span className="roast-accent inline-flex items-center gap-2">
              Roasted <Flame className="animate-bounce w-8 h-8 sm:w-10 sm:h-10" />
            </span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg font-light">AI-powered roasts that hit different 💀</p>
        </div>

        {!imagePreview && (
          <div
            className="upload-area p-8 sm:p-16 cursor-pointer roast-border-hover transition-all duration-500 mb-6 sm:mb-10 relative group hover:bg-white/5"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />

            <div className="pointer-events-none">
              <UploadCloud
                className="mx-auto mb-6 sm:mb-8 text-gray-400 group-hover:text-gray-300 transition-colors duration-300 group-hover:scale-110 transform w-16 h-16 sm:w-20 sm:h-20"
              />
              <p className="text-gray-400 text-lg sm:text-xl mb-2 group-hover:text-gray-300 transition-colors">
                Drop your image here or click to upload
              </p>
              <p className="text-gray-500 text-sm">Supports JPG, PNG, GIF • Max 10MB</p>
            </div>
          </div>
        )}

        {imagePreview && (
          <div className="mb-6 sm:mb-10 animate-in fade-in duration-700">
            <div className="relative inline-block">
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="Preview"
                className="mx-auto max-h-60 sm:max-h-80 w-auto object-cover shadow-2xl border border-gray-600/50 backdrop-blur-sm rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-lg"></div>
            </div>
          </div>
        )}

        <Button
          onClick={generateRoast}
          disabled={!selectedImage || isLoading}
          className="roast-gradient text-white px-8 sm:px-16 py-4 sm:py-6 text-lg sm:text-xl font-bold hover:scale-110 transition-all duration-300 glow-hover border-0 mb-6 sm:mb-10 disabled:opacity-50 disabled:cursor-not-allowed group w-full sm:w-auto"
        >
          {isLoading ? (
            <div className="flex items-center gap-3 sm:gap-4">
              <Flame className="animate-spin w-6 h-6 sm:w-7 sm:h-7" />
              <span>Generating Roast...</span>
              <Sparkles className="animate-pulse w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Flame className="group-hover:animate-bounce w-5 h-5 sm:w-6 sm:h-6" />
              <span>Roast Me</span>
              <Flame className="group-hover:animate-bounce w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          )}
        </Button>

        {showResult && roastText && (
          <div className="space-y-4 sm:space-y-8 animate-in fade-in duration-700">
            <div className="result-area p-4 sm:p-8 text-left relative group hover:bg-white/5 transition-all duration-300 min-h-fit overflow-visible">
              <div className="absolute top-2 sm:top-4 left-2 sm:left-4 text-red-400/60 text-4xl sm:text-6xl font-serif leading-none">"</div>
              <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 text-red-400/60 text-4xl sm:text-6xl font-serif rotate-180 leading-none">"</div>
              <div className="relative z-10 min-h-fit">
                <p className="font-mono text-gray-200 text-sm sm:text-lg leading-relaxed px-6 sm:px-8 py-4 whitespace-pre-wrap break-words overflow-wrap-anywhere">
                  {roastText}
                </p>
              </div>
              <Button
                onClick={copyRoast}
                variant="ghost"
                size="sm"
                className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 z-20 p-2"
              >
                <Copy size={16} className="sm:w-5 sm:h-5" />
              </Button>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                onClick={copyRoast}
                variant="outline"
                className="bg-white/10 border-gray-600 text-gray-300 hover:bg-white/20 hover:text-white transition-all duration-300 text-sm sm:text-base px-4 sm:px-6"
              >
                <Copy size={14} className="mr-2 sm:w-4 sm:h-4" />
                Copy Roast
              </Button>
            </div>
          </div>
        )}

        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-800/50">
          <p className="text-gray-500 text-xs sm:text-sm px-2 text-center">
            Powered by AI • All roasts are for entertainment •
            <span className="text-red-400/70 ml-1">Handle with care 🔥</span>
          </p>
        </div>
      </Card>
    </div>
  )
}
