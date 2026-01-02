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
    coreIdea: string
    development: string
    moment: string
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
    
    // 尝试解析结构化的内容（带标签）- 支持新旧格式
    const coreIdeaMatch = cleanText.match(/(?:Core Idea|core idea|CoreIdea|Brainstorm|brainstorm):\s*(.+?)(?=\n\n*(?:Development|development|Elaboration|elaboration|Moment|moment|Scene|scene):|$)/is)
    const developmentMatch = cleanText.match(/(?:Development|development|Elaboration|elaboration):\s*(.+?)(?=\n\n*(?:Moment|moment|Scene|scene):|$)/is)
    const momentMatch = cleanText.match(/(?:Moment|moment|Scene|scene):\s*(.+?)$/is)

    let coreIdea = ""
    let development = ""
    let moment = ""

    if (coreIdeaMatch && developmentMatch && momentMatch) {
      coreIdea = coreIdeaMatch[1].trim().replace(/^["']|["']$/g, "")
      development = developmentMatch[1].trim().replace(/^["']|["']$/g, "")
      moment = momentMatch[1].trim().replace(/^["']|["']$/g, "")
    } else {
      // 如果没有找到结构化格式，尝试按段落分割
      const paragraphs = cleanText.split(/\n\n+/).filter(p => p.trim())
      if (paragraphs.length >= 3) {
        coreIdea = paragraphs[0].trim()
        development = paragraphs[1].trim()
        moment = paragraphs.slice(2).join(" ").trim()
      } else if (paragraphs.length === 2) {
        coreIdea = paragraphs[0].trim()
        development = paragraphs[1].trim()
        moment = ""
      } else if (paragraphs.length === 1) {
        // 如果只有一个段落，尝试按句子分割
        const sentences = paragraphs[0].split(/[.!?]+/).filter(s => s.trim())
        const third = Math.ceil(sentences.length / 3)
        coreIdea = sentences.slice(0, third).join(". ").trim() + (sentences.slice(0, third).length > 0 ? "." : "")
        development = sentences.slice(third, third * 2).join(". ").trim() + (sentences.slice(third, third * 2).length > 0 ? "." : "")
        moment = sentences.slice(third * 2).join(". ").trim() + (sentences.slice(third * 2).length > 0 ? "." : "")
      } else {
        // 最后的回退：按字符数分割
        coreIdea = cleanText.substring(0, Math.min(150, cleanText.length))
        development = cleanText.substring(150, Math.min(400, cleanText.length))
        moment = cleanText.substring(400)
      }
    }

    return {
      coreIdea: coreIdea || "No core idea generated.",
      development: development || "No development generated.",
      moment: moment || "No moment generated."
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
    setIsLoadingSection("coreIdea")

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
          length: length,
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
      setIsLoadingSection("coreIdea")
      setGeneratedHeadcanon({
        character: characterName,
        fandom: fandom || characterName,
        tone: tone === "Random Selection" ? "Random" : tone,
        coreIdea: parsed.coreIdea,
        development: "",
        moment: "",
      })

      await new Promise(resolve => setTimeout(resolve, 800))

      setIsLoadingSection("development")
      setGeneratedHeadcanon(prev => prev ? {
        ...prev,
        development: parsed.development,
      } : null)

      await new Promise(resolve => setTimeout(resolve, 800))

      setIsLoadingSection("moment")
      setGeneratedHeadcanon(prev => prev ? {
        ...prev,
        moment: parsed.moment,
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50/40 via-rose-50/30 to-pink-50/40">
      <div className="mx-auto max-w-7xl px-4 pt-20 pb-6 md:pt-24 md:pb-8">
        {/* Hero Section */}
        <div className="mb-8 md:mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary/60 blur-xl opacity-50 animate-pulse" />
              <Sparkles className="relative h-10 w-10 text-primary drop-shadow-lg" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-balance bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent md:text-5xl drop-shadow-sm">
              Character Headcanon Generator
            </h1>
          </div>
          <p className="text-lg text-gray-700 text-pretty md:text-xl max-w-3xl mx-auto mb-6">
            Craft unique character stories by customizing every detail—from personality traits to backstory depth.
          </p>
          <p className="text-sm text-gray-600 mb-6">
            Our intelligent generator adapts to your creative vision, delivering personalized headcanons in seconds.
          </p>
          
          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-200">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Smart AI Generation</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Complete Control</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200">
              <Rocket className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Quick & Easy</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT PANEL: Custom Generation Parameters */}
          <div className="flex-1 max-w-xl space-y-5">
            <Card className="border-2 border-gray-200/60 bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6">
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
              <Card className="border-2 border-gray-200/60 bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6">
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

                  {/* Core Idea Loading */}
                  <div className="p-4 rounded-lg bg-orange-50 border border-orange-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <h4 className="text-sm font-semibold text-orange-900">Core Idea</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-orange-100 rounded animate-pulse w-full"></div>
                      <div className="h-4 bg-orange-100 rounded animate-pulse w-5/6"></div>
                    </div>
                  </div>

                  {/* Development Loading */}
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <h4 className="text-sm font-semibold text-blue-900">Development</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-blue-100 rounded animate-pulse w-full"></div>
                      <div className="h-4 bg-blue-100 rounded animate-pulse w-4/5"></div>
                      <div className="h-4 bg-blue-100 rounded animate-pulse w-3/4"></div>
                    </div>
                  </div>

                  {/* Moment Loading */}
                  <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <h4 className="text-sm font-semibold text-green-900">Moment</h4>
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
              <Card className="border-2 border-gray-200/60 bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6">
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
                      Get structured output with core idea, development, and moment
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
              <Card className="border-2 border-gray-200/60 bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6">
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
                  {/* Core Idea - Orange */}
                  <div className={cn(
                    "p-4 rounded-lg border transition-all duration-500",
                    isLoadingSection === "coreIdea"
                      ? "bg-orange-50 border-orange-200 animate-pulse"
                      : "bg-orange-50 border-orange-100"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <h4 className="text-sm font-semibold text-orange-900">Core Idea</h4>
                    </div>
                    {isLoadingSection === "coreIdea" ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Sparkles className="h-4 w-4 animate-spin" />
                        <span>Generating...</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {generatedHeadcanon.coreIdea}
                      </p>
                    )}
                  </div>

                  {/* Development - Blue */}
                  <div className={cn(
                    "p-4 rounded-lg border transition-all duration-500",
                    isLoadingSection === "development"
                      ? "bg-blue-50 border-blue-200 animate-pulse"
                      : generatedHeadcanon.development
                      ? "bg-blue-50 border-blue-100"
                      : "bg-gray-50 border-gray-100 opacity-50"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <h4 className="text-sm font-semibold text-blue-900">Development</h4>
                    </div>
                    {isLoadingSection === "development" ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Sparkles className="h-4 w-4 animate-spin" />
                        <span>Generating...</span>
                      </div>
                    ) : generatedHeadcanon.development ? (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {generatedHeadcanon.development}
                      </p>
                    ) : null}
                  </div>

                  {/* Moment - Green */}
                  <div className={cn(
                    "p-4 rounded-lg border transition-all duration-500",
                    isLoadingSection === "moment"
                      ? "bg-green-50 border-green-200 animate-pulse"
                      : generatedHeadcanon.moment
                      ? "bg-green-50 border-green-100"
                      : "bg-gray-50 border-gray-100 opacity-50"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <h4 className="text-sm font-semibold text-green-900">Moment</h4>
                    </div>
                    {isLoadingSection === "moment" ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Sparkles className="h-4 w-4 animate-spin" />
                        <span>Generating...</span>
                      </div>
                    ) : generatedHeadcanon.moment ? (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {generatedHeadcanon.moment}
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

        {/* SEO Content Section - 4. Heading 标题标签和 3. 文本内容 */}
        <article className="max-w-4xl mx-auto mt-16 space-y-8 text-gray-700">
          <section>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Understanding Character Headcanon Generation</h2>
            <p className="text-lg leading-relaxed mb-4">
              A character headcanon generator is an essential tool for writers, fanfiction creators, and creative enthusiasts who want to explore deeper aspects of their favorite characters. This AI-powered headcanon generator helps you develop unique interpretations of characters by generating creative backstories, personality traits, hidden talents, and personal quirks that weren't explored in the original source material.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              When you use our character headcanon generator, you're not just creating random character details. Instead, you're building upon existing canon to develop richer, more nuanced character interpretations. The headcanon generator uses advanced artificial intelligence to ensure that each generated headcanon feels authentic and believable, maintaining consistency with the character's established traits while exploring new dimensions.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">How Our Character Headcanon Generator Works</h2>
            <p className="text-lg leading-relaxed mb-4">
              Our character headcanon generator operates through a simple yet powerful interface. You start by entering the character's name and optionally specifying their fandom or universe. The generator then allows you to customize various aspects of the headcanon creation process, including the type of headcanon you want to explore, the tone you prefer, and the length of the generated content.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              The AI headcanon generator processes your input and creates a structured output consisting of three key components: a core idea that presents the central concept, a development section that expands on the idea with context and implications, and a moment that illustrates the headcanon through a vivid scene. This structure ensures that every generated headcanon provides both inspiration and practical storytelling material.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Types of Character Headcanons You Can Generate</h2>
            <p className="text-lg leading-relaxed mb-4">
              Our character headcanon generator supports multiple types of headcanon creation. You can generate headcanons focused on single character daily life, exploring how characters behave in mundane situations. Relationship interaction headcanons examine how characters connect with others, while backstory expansion headcanons delve into untold past events that shaped the character.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              The generator can also create future scenario headcanons, alternate universe interpretations, humorous quirks, and dark what-if scenarios. Each type of headcanon serves different creative purposes, allowing writers to explore various aspects of character development. The headcanon generator adapts its output based on your selected type, ensuring relevance and coherence.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Customizing Your Character Headcanon</h2>
            <p className="text-lg leading-relaxed mb-4">
              One of the key advantages of using our character headcanon generator is the extensive customization options available. You can select from various tones including wholesome, emotional, dark, humorous, and angst, each of which influences the mood and style of the generated headcanon. The length option allows you to choose between short, medium, and long outputs, giving you control over the level of detail.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Additionally, the character headcanon generator accepts optional context input, allowing you to provide specific details or scenarios you want the AI to incorporate. This feature makes the generator particularly useful for writers working on specific projects or exploring particular character aspects. The more context you provide, the more tailored and relevant your generated headcanon will be.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Benefits of Using a Character Headcanon Generator</h2>
            <p className="text-lg leading-relaxed mb-4">
              Writers and creators benefit significantly from using a character headcanon generator. The tool helps overcome writer's block by providing fresh perspectives on familiar characters. When you're stuck on character development or need inspiration for new story directions, the headcanon generator can spark creative ideas that lead to more engaging narratives.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              For fanfiction writers specifically, the character headcanon generator enables exploration of alternative character interpretations while maintaining consistency with established canon. The generator helps develop character voices, motivations, and internal conflicts that enrich storytelling. Role-playing game enthusiasts can use the headcanon generator to quickly develop NPC backgrounds and character motivations that enhance their game sessions.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Best Practices for Character Headcanon Generation</h2>
            <p className="text-lg leading-relaxed mb-4">
              To get the most out of our character headcanon generator, it's important to provide clear and specific input. While the generator works with minimal information, including character names and fandom details helps produce more accurate and relevant headcanons. When using the generator, consider what aspects of the character you want to explore and select appropriate types and tones.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              The generated headcanons from our character headcanon generator should be viewed as starting points for your creative work. Use them as inspiration to develop your own unique interpretations, combining multiple generated ideas, or refining the output to better fit your creative vision. Remember that the best headcanons feel authentic and enhance rather than contradict the original character's essence.
            </p>
          </section>
        </article>
      </div>
      <Toaster />
    </div>
  )
}

