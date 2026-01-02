"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Target, Rocket, Lightbulb, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

const headcanonTypes = [
  "Random Selection",
  "Single Character Daily Life",
  "Relationship Interaction",
  "Backstory Expansion",
  "Future Scenario",
  "Alternate Universe (AU)",
  "Humorous Quirk",
  "Dark What-If",
]

const tones = [
  "Random Selection",
  "Wholesome",
  "Emotional",
  "Dark",
  "Humorous",
  "Angst",
]

const lengths = ["Short", "Medium", "Long"]

const examples = [
  {
    name: "Iron Man",
    fandom: "Marvel",
    type: "Humorous Quirk",
    tone: "Humorous",
  },
  {
    name: "Naruto",
    fandom: "Naruto",
    type: "Backstory Expansion",
    tone: "Wholesome",
  },
  {
    name: "Batman",
    fandom: "DC Comics",
    type: "Dark What-If",
    tone: "Dark",
  },
]

export default function CharacterHeadcanonPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [characterName, setCharacterName] = useState("")
  const [fandom, setFandom] = useState("")
  const [headcanonType, setHeadcanonType] = useState("Random Selection")
  const [tone, setTone] = useState("Random Selection")
  const [length, setLength] = useState("Medium")
  const [context, setContext] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedHeadcanon, setGeneratedHeadcanon] = useState<{
    character: string
    fandom: string
    tone: string
    brainstorm: string
    elaboration: string
    scene: string
  } | null>(null)
  const [isLoadingSection, setIsLoadingSection] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [totalTime, setTotalTime] = useState<number>(0)

  const handleExampleClick = (example: typeof examples[0]) => {
    setCharacterName(example.name)
    setFandom(example.fandom)
    setHeadcanonType(example.type)
    setTone(example.tone)
    setContext("")
  }

  const parseHeadcanon = (text: string) => {
    // 清理文本
    let cleanText = text.trim()
    
    // 尝试解析结构化的内容（带标签）
    const brainstormMatch = cleanText.match(/(?:Brainstorm|brainstorm):\s*(.+?)(?=\n\n*(?:Elaboration|elaboration|Scene|scene):|$)/is)
    const elaborationMatch = cleanText.match(/(?:Elaboration|elaboration):\s*(.+?)(?=\n\n*(?:Scene|scene):|$)/is)
    const sceneMatch = cleanText.match(/(?:Scene|scene):\s*(.+?)$/is)

    let brainstorm = ""
    let elaboration = ""
    let scene = ""

    if (brainstormMatch && elaborationMatch && sceneMatch) {
      brainstorm = brainstormMatch[1].trim().replace(/^["']|["']$/g, "")
      elaboration = elaborationMatch[1].trim().replace(/^["']|["']$/g, "")
      scene = sceneMatch[1].trim().replace(/^["']|["']$/g, "")
    } else {
      // 如果没有找到结构化格式，尝试按段落分割
      const paragraphs = cleanText.split(/\n\n+/).filter(p => p.trim())
      if (paragraphs.length >= 3) {
        brainstorm = paragraphs[0].trim()
        elaboration = paragraphs[1].trim()
        scene = paragraphs.slice(2).join(" ").trim()
      } else if (paragraphs.length === 2) {
        brainstorm = paragraphs[0].trim()
        elaboration = paragraphs[1].trim()
        scene = ""
      } else if (paragraphs.length === 1) {
        // 如果只有一个段落，尝试按句子分割
        const sentences = paragraphs[0].split(/[.!?]+/).filter(s => s.trim())
        const third = Math.ceil(sentences.length / 3)
        brainstorm = sentences.slice(0, third).join(". ").trim() + (sentences.slice(0, third).length > 0 ? "." : "")
        elaboration = sentences.slice(third, third * 2).join(". ").trim() + (sentences.slice(third, third * 2).length > 0 ? "." : "")
        scene = sentences.slice(third * 2).join(". ").trim() + (sentences.slice(third * 2).length > 0 ? "." : "")
      } else {
        // 最后的回退：按字符数分割
        brainstorm = cleanText.substring(0, Math.min(150, cleanText.length))
        elaboration = cleanText.substring(150, Math.min(400, cleanText.length))
        scene = cleanText.substring(400)
      }
    }

    return {
      brainstorm: brainstorm || "No brainstorm generated.",
      elaboration: elaboration || "No elaboration generated.",
      scene: scene || "No scene generated."
    }
  }

  const handleGenerate = async () => {
    if (!characterName.trim()) {
      toast({
        title: "Missing Character",
        description: "Please enter a character name.",
        variant: "destructive",
      })
      return
    }
    setIsGenerating(true)
    setGeneratedHeadcanon(null)
    setIsLoadingSection("brainstorm")

    const randomTime = Math.floor(Math.random() * (23 - 18 + 1)) + 18 // 18-23 seconds
    setTotalTime(randomTime)
    setCountdown(randomTime)

    let countdownInterval: NodeJS.Timeout | null = null
    let timeoutId: NodeJS.Timeout | null = null

    // 倒计时效果
    countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev && prev > 1) return prev - 1
        if (countdownInterval) clearInterval(countdownInterval)
        return null
      })
    }, 1000)

    // 40秒超时检测
    timeoutId = setTimeout(() => {
      if (countdownInterval) clearInterval(countdownInterval)
      setCountdown(null)
      setIsLoadingSection(null)
      setIsGenerating(false)
      toast({
        title: "Generation Timeout",
        description: "The generation took too long. Please try again.",
        variant: "destructive",
      })
    }, 40000) // 40 seconds timeout

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          headcanonType: headcanonType === "Random Selection" ? "" : headcanonType,
          focusArea: tone === "Random Selection" ? "" : tone,
          characterInput: `${characterName}${fandom ? ` from ${fandom}` : ""}${context ? `. ${context}` : ""}`,
        }),
      })

      // 清除超时定时器
      if (timeoutId) clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error("Failed to generate headcanon")
      }

      const data = await response.json()

      // 解析生成的内容
      const parsed = parseHeadcanon(data.headcanon)

      // 动态加载效果 - 逐步显示内容
      setIsLoadingSection("brainstorm")
      setGeneratedHeadcanon({
        character: characterName,
        fandom: fandom || characterName,
        tone: tone === "Random Selection" ? "Random" : tone,
        brainstorm: parsed.brainstorm,
        elaboration: "",
        scene: "",
      })

      await new Promise(resolve => setTimeout(resolve, 800))

      setIsLoadingSection("elaboration")
      setGeneratedHeadcanon(prev => prev ? {
        ...prev,
        elaboration: parsed.elaboration,
      } : null)

      await new Promise(resolve => setTimeout(resolve, 800))

      setIsLoadingSection("scene")
      setGeneratedHeadcanon(prev => prev ? {
        ...prev,
        scene: parsed.scene,
      } : null)

      await new Promise(resolve => setTimeout(resolve, 500))

      setIsLoadingSection(null)
      if (countdownInterval) clearInterval(countdownInterval) // Stop countdown on success
      setCountdown(null)
    } catch (error) {
      // 清除超时定时器
      if (timeoutId) clearTimeout(timeoutId)
      toast({
        title: "Generation Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
      setIsLoadingSection(null)
      if (countdownInterval) clearInterval(countdownInterval) // Stop countdown on error
      setCountdown(null)
    } finally {
      setIsGenerating(false)
    }
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        {/* Hero Section */}
        <div className="mb-8 md:mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Character Headcanon Generator
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto mb-6 leading-relaxed">
            Craft unique character stories by customizing every detail—from personality traits to backstory depth. 
            Our intelligent generator adapts to your creative vision, delivering personalized headcanons in seconds.
          </p>
          
          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-200">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Fully Customizable</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200">
              <Rocket className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Instant Results</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT PANEL: Custom Generation Parameters */}
          <div className="flex-1 max-w-xl space-y-5">
            <Card className="border border-gray-200 bg-white shadow-sm rounded-lg p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Custom Generation Parameters
                </h2>
                <p className="text-sm text-gray-600">
                  Configure all aspects of your headcanon generation to create the perfect character story.
                </p>
              </div>

              <div className="space-y-4">
                {/* Character */}
                <div className="space-y-2">
                  <Label htmlFor="character" className="text-sm font-medium text-gray-900">
                    Character <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="character"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="Enter character name (eg: Harry Potter, Elsa, Sp)"
                    className="h-10 border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-lg bg-white"
                  />
                </div>

                {/* Fandom */}
                <div className="space-y-2">
                  <Label htmlFor="fandom" className="text-sm font-medium text-gray-900">
                    Fandom
                  </Label>
                  <Input
                    id="fandom"
                    value={fandom}
                    onChange={(e) => setFandom(e.target.value)}
                    placeholder="Enter fandom name (eg: Naruto, Marvel...)"
                    className="h-10 border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-lg bg-white"
                  />
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium text-gray-900">
                    Type
                  </Label>
                  <Select value={headcanonType} onValueChange={setHeadcanonType}>
                    <SelectTrigger id="type" className="h-10 border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-lg bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {headcanonTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tone */}
                <div className="space-y-2">
                  <Label htmlFor="tone" className="text-sm font-medium text-gray-900">
                    Tone
                  </Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger id="tone" className="h-10 border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-lg bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tones.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Length */}
                <div className="space-y-2">
                  <Label htmlFor="length" className="text-sm font-medium text-gray-900">
                    Length
                  </Label>
                  <Select value={length} onValueChange={setLength}>
                    <SelectTrigger id="length" className="h-10 border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-lg bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {lengths.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Context */}
                <div className="space-y-2">
                  <Label htmlFor="context" className="text-sm font-medium text-gray-900">
                    Context
                  </Label>
                  <Textarea
                    id="context"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Enter additional context or leave empty for auto-generation..."
                    className="min-h-24 border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-lg resize-none bg-white"
                  />
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={!characterName.trim() || isGenerating}
                  className="w-full h-11 text-base font-semibold bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg rounded-lg"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                      {countdown !== null ? `Generating... ${countdown}s` : "Generating..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Headcanon
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* RIGHT PANEL: Your Generated Headcanon */}
          <div className="flex-1 lg:max-w-xl space-y-6">
            {isGenerating && !generatedHeadcanon ? (
              <Card className="border border-gray-200 bg-white shadow-sm rounded-lg p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Your Generated Headcanon
                  </h2>
                  <p className="text-sm text-gray-600">
                    AI-generated character story based on your custom parameters.
                  </p>
                </div>

                {/* Loading Animation */}
                <div className="space-y-4">
                  {/* Character Placeholder */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
                      <div className="flex gap-2">
                        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>

                  {/* Brainstorm Loading */}
                  <div className="p-4 rounded-lg bg-orange-50 border border-orange-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <h4 className="text-sm font-semibold text-orange-900">Brainstorm</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-orange-100 rounded animate-pulse w-full"></div>
                      <div className="h-4 bg-orange-100 rounded animate-pulse w-5/6"></div>
                    </div>
                  </div>

                  {/* Elaboration Loading */}
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <h4 className="text-sm font-semibold text-blue-900">Elaboration</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-blue-100 rounded animate-pulse w-full"></div>
                      <div className="h-4 bg-blue-100 rounded animate-pulse w-4/5"></div>
                      <div className="h-4 bg-blue-100 rounded animate-pulse w-3/4"></div>
                    </div>
                  </div>

                  {/* Scene Loading */}
                  <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <h4 className="text-sm font-semibold text-green-900">Scene</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-green-100 rounded animate-pulse w-full"></div>
                      <div className="h-4 bg-green-100 rounded animate-pulse w-5/6"></div>
                      <div className="h-4 bg-green-100 rounded animate-pulse w-4/5"></div>
                      <div className="h-4 bg-green-100 rounded animate-pulse w-3/4"></div>
                    </div>
                  </div>

                  {/* Countdown Display */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-2 text-purple-600">
                      <Sparkles className="h-5 w-5 animate-spin" />
                      <span className="text-sm font-medium">
                        {countdown !== null ? `Generating in ${countdown}s...` : "Generating..."}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ) : !generatedHeadcanon ? (
              <Card className="border border-gray-200 bg-white shadow-sm rounded-lg p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                    <h2 className="text-xl font-bold text-gray-900">
                      Ready to Generate Your Custom Headcanon
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Fill in the parameters on the left and click 'Generate Headcanon' to create your personalized character story. Our AI will craft a unique headcanon based on your specifications.
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Customize character, fandom, type, tone, length, and context
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Get structured output with brainstorm, elaboration, and scene
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Rocket className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Generate images for your headcanon after creation
                    </p>
                  </div>
                </div>

                {/* Popular Examples */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="h-4 w-4 text-purple-600" />
                    <h3 className="text-base font-semibold text-gray-900">Popular Examples to Try</h3>
                  </div>
                  <div className="space-y-2.5">
                    {examples.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => handleExampleClick(example)}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
                      >
                        <p className="font-medium text-sm text-gray-900 mb-1">
                          {example.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          Fandom: {example.fandom} | Type: {example.type} | Tone: {example.tone}
                        </p>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Click any example to auto-fill the form, or create your own unique character story!
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="border border-gray-200 bg-white shadow-sm rounded-lg p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Your Generated Headcanon
                  </h2>
                  <p className="text-sm text-gray-600">
                    AI-generated character story based on your custom parameters.
                  </p>
                </div>

                {/* Character & Tags */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {generatedHeadcanon.character}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="px-3 py-1 text-xs bg-purple-100 text-purple-700 border-0">
                        {generatedHeadcanon.fandom}
                      </Badge>
                      <Badge className="px-3 py-1 text-xs bg-blue-100 text-blue-700 border-0">
                        {generatedHeadcanon.tone}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex-shrink-0"></div>
                    <span>Just now</span>
                  </div>
                </div>

                {/* Story Sections */}
                <div className="space-y-4 mb-6">
                  {/* Brainstorm - Orange */}
                  <div className={cn(
                    "p-4 rounded-lg border transition-all duration-500",
                    isLoadingSection === "brainstorm"
                      ? "bg-orange-50 border-orange-200 animate-pulse"
                      : "bg-orange-50 border-orange-100"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <h4 className="text-sm font-semibold text-orange-900">Brainstorm</h4>
                    </div>
                    {isLoadingSection === "brainstorm" ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Sparkles className="h-4 w-4 animate-spin" />
                        <span>Generating...</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {generatedHeadcanon.brainstorm}
                      </p>
                    )}
                  </div>

                  {/* Elaboration - Blue */}
                  <div className={cn(
                    "p-4 rounded-lg border transition-all duration-500",
                    isLoadingSection === "elaboration"
                      ? "bg-blue-50 border-blue-200 animate-pulse"
                      : generatedHeadcanon.elaboration
                      ? "bg-blue-50 border-blue-100"
                      : "bg-gray-50 border-gray-100 opacity-50"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <h4 className="text-sm font-semibold text-blue-900">Elaboration</h4>
                    </div>
                    {isLoadingSection === "elaboration" ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Sparkles className="h-4 w-4 animate-spin" />
                        <span>Generating...</span>
                      </div>
                    ) : generatedHeadcanon.elaboration ? (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {generatedHeadcanon.elaboration}
                      </p>
                    ) : null}
                  </div>

                  {/* Scene - Green */}
                  <div className={cn(
                    "p-4 rounded-lg border transition-all duration-500",
                    isLoadingSection === "scene"
                      ? "bg-green-50 border-green-200 animate-pulse"
                      : generatedHeadcanon.scene
                      ? "bg-green-50 border-green-100"
                      : "bg-gray-50 border-gray-100 opacity-50"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <h4 className="text-sm font-semibold text-green-900">Scene</h4>
                    </div>
                    {isLoadingSection === "scene" ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Sparkles className="h-4 w-4 animate-spin" />
                        <span>Generating...</span>
                      </div>
                    ) : generatedHeadcanon.scene ? (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {generatedHeadcanon.scene}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full h-10 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}

