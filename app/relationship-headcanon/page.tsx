"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Heart, Sparkles, Rocket, Lightbulb, RefreshCw, Plus, X, LogIn, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/toaster"

const relationshipTypes = [
  "Random Selection",
  "Friendship",
  "Romance",
  "Rivalry",
  "Mentor-Student",
  "Sibling Bond",
  "Parent-Child",
  "Colleague",
  "Enemies to Friends",
  "Best Friends",
]

const tones = [
  "Random Selection",
  "Wholesome",
  "Emotional",
  "Dark",
  "Humorous",
  "Angst",
  "Dramatic",
]

const lengths = ["Short", "Medium", "Long"]

const examples = [
  {
    characters: ["Sherlock Holmes", "John Watson"],
    fandom: "Sherlock",
    type: "Best Friends",
    tone: "Wholesome",
  },
  {
    characters: ["Frodo", "Sam"],
    fandom: "The Lord of the Rings",
    type: "Friendship",
    tone: "Emotional",
  },
  {
    characters: ["Tony Stark", "Steve Rogers"],
    fandom: "Marvel",
    type: "Rivalry",
    tone: "Dramatic",
  },
]

export default function RelationshipHeadcanonPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, loading: authLoading } = useAuth()

  const [characters, setCharacters] = useState<string[]>([""])
  const [fandom, setFandom] = useState("")
  const [relationshipTypeMode, setRelationshipTypeMode] = useState<"list" | "custom">("list")
  const [relationshipType, setRelationshipType] = useState("Random Selection")
  const [customRelationshipType, setCustomRelationshipType] = useState("")
  const [tone, setTone] = useState("Random Selection")
  const [length, setLength] = useState("Medium")
  const [context, setContext] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedHeadcanon, setGeneratedHeadcanon] = useState<{
    characters: string[]
    fandom: string
    type: string
    tone: string
    coreIdea: string
    development: string
    moment: string
  } | null>(null)
  const [isLoadingSection, setIsLoadingSection] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)

  const handleAddCharacter = () => {
    if (characters.length < 5) {
      setCharacters([...characters, ""])
    } else {
      toast({
        title: "Maximum Characters",
        description: "You can add up to 5 characters.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveCharacter = (index: number) => {
    if (characters.length > 1) {
      setCharacters(characters.filter((_, i) => i !== index))
    }
  }

  const handleCharacterChange = (index: number, value: string) => {
    const newChars = [...characters]
    newChars[index] = value
    setCharacters(newChars)
  }

  const handleExampleClick = (example: typeof examples[0]) => {
    setCharacters(example.characters)
    setFandom(example.fandom)
    setRelationshipType(example.type)
    setCustomRelationshipType("")
    setRelationshipTypeMode("list")
    setTone(example.tone)
    setContext("")
  }

  const parseHeadcanon = (text: string) => {
    let cleanText = text.trim()
    
    const coreIdeaMatch = cleanText.match(/(?:Core Idea|core idea|CoreIdea|Brainstorm|brainstorm):\s*(.+?)(?=\n\n*(?:Development|development|Elaboration|elaboration|Moment|moment|Scene|scene):|$)/i)
    const developmentMatch = cleanText.match(/(?:Development|development|Elaboration|elaboration):\s*(.+?)(?=\n\n*(?:Moment|moment|Scene|scene):|$)/i)
    const momentMatch = cleanText.match(/(?:Moment|moment|Scene|scene):\s*(.+?)$/i)

    let coreIdea = ""
    let development = ""
    let moment = ""

    if (coreIdeaMatch && developmentMatch && momentMatch) {
      coreIdea = coreIdeaMatch[1].trim().replace(/^["']|["']$/g, "")
      development = developmentMatch[1].trim().replace(/^["']|["']$/g, "")
      moment = momentMatch[1].trim().replace(/^["']|["']$/g, "")
    } else {
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
        const sentences = paragraphs[0].split(/[.!?]+/).filter(s => s.trim())
        const third = Math.ceil(sentences.length / 3)
        coreIdea = sentences.slice(0, third).join(". ").trim() + (sentences.slice(0, third).length > 0 ? "." : "")
        development = sentences.slice(third, third * 2).join(". ").trim() + (sentences.slice(third, third * 2).length > 0 ? "." : "")
        moment = sentences.slice(third * 2).join(". ").trim() + (sentences.slice(third * 2).length > 0 ? "." : "")
      } else {
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
    // 检查用户是否已登录
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please sign in with Google to generate headcanons.",
        variant: "destructive",
      })
      return
    }

    const validCharacters = characters.filter(c => c.trim())
    if (validCharacters.length === 0) {
      toast({
        title: "Missing Characters",
        description: "Please enter at least one character name.",
        variant: "destructive",
      })
      return
    }

    const finalRelationshipType = relationshipTypeMode === "custom" 
      ? customRelationshipType.trim() 
      : (relationshipType === "Random Selection" ? "" : relationshipType)

    if (relationshipTypeMode === "custom" && !customRelationshipType.trim()) {
      toast({
        title: "Missing Relationship Type",
        description: "Please enter a custom relationship type.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGeneratedHeadcanon(null)
    setIsLoadingSection("coreIdea")

    const randomTime = Math.floor(Math.random() * (23 - 18 + 1)) + 18
    setCountdown(randomTime)

    let countdownInterval: NodeJS.Timeout | null = null
    let timeoutId: NodeJS.Timeout | null = null

    countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev && prev > 1) return prev - 1
        if (countdownInterval) clearInterval(countdownInterval)
        return null
      })
    }, 1000)

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
    }, 40000)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          headcanonType: finalRelationshipType || "Relationship",
          focusArea: tone === "Random Selection" ? "" : tone,
          characterInput: `${validCharacters.join(" and ")}${fandom ? ` from ${fandom}` : ""}${context ? `. ${context}` : ""}`,
          length: length,
        }),
      })

      if (timeoutId) clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error("Failed to generate headcanon")
      }

      const data = await response.json()
      const parsed = parseHeadcanon(data.headcanon)

      setIsLoadingSection("coreIdea")
      setGeneratedHeadcanon({
        characters: validCharacters,
        fandom: fandom || validCharacters.join(" & "),
        type: finalRelationshipType || "Relationship",
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
      if (countdownInterval) clearInterval(countdownInterval)
      setCountdown(null)
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId)
      toast({
        title: "Generation Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
      setIsLoadingSection(null)
      if (countdownInterval) clearInterval(countdownInterval)
      setCountdown(null)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-12 md:pt-24 md:pb-16">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-sm">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent md:text-5xl">
              Relationship Headcanon Generator
            </h1>
          </div>
          <p className="text-lg text-gray-600 text-pretty md:text-xl max-w-2xl mx-auto mb-4">
            Create personalized relationship headcanons by customizing characters, fandom, relationship type, tone, length, and context.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Our AI-powered relationship generator helps you explore character dynamics, friendships, romances, and rivalries.
          </p>
          
          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-50 border border-pink-200">
              <Heart className="h-3.5 w-3.5 text-pink-600" />
              <span className="text-xs font-medium text-pink-700">Relationships</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200">
              <Sparkles className="h-3.5 w-3.5 text-rose-600" />
              <span className="text-xs font-medium text-rose-700">Multi-Character</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200">
              <Rocket className="h-3.5 w-3.5 text-purple-600" />
              <span className="text-xs font-medium text-purple-700">AI-Powered</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT PANEL: Relationship Generation Parameters */}
          <div className="flex-1 w-full lg:max-w-xl space-y-5">
            <Card className="border border-pink-100 bg-white shadow-sm rounded-2xl p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Generation Parameters
                </h2>
                <p className="text-sm text-gray-600">
                  Configure your relationship headcanon settings.
                </p>
              </div>

              <div className="space-y-4">
                {/* Login Required Alert */}
                {!isAuthenticated && !authLoading && (
                  <Alert className="border border-pink-200 bg-pink-50 rounded-xl">
                    <LogIn className="h-4 w-4 text-pink-600" />
                    <AlertDescription className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-pink-900 mb-1 text-sm">Sign in required</p>
                        <p className="text-xs text-pink-700">
                          Sign in to generate headcanons.
                        </p>
                      </div>
                      <Button
                        onClick={() => window.location.href = "/api/auth/login"}
                        size="sm"
                        className="bg-pink-500 hover:bg-pink-600 text-white whitespace-nowrap text-xs h-8 px-3 rounded-lg"
                      >
                        Sign In
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Characters */}
                <div className="space-y-2">
                  <Label htmlFor="characters" className="text-sm font-medium text-gray-900">
                    Characters <span className="text-red-500">*</span> <span className="text-gray-500 text-xs">(Max 5)</span>
                  </Label>
                  <div className="space-y-2">
                    {characters.map((char, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={char}
                          onChange={(e) => handleCharacterChange(index, e.target.value)}
                          placeholder="Enter character name"
                          className="h-10 border border-gray-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl bg-white transition-all"
                        />
                        {characters.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveCharacter(index)}
                            className="h-10 w-10 text-gray-500 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {characters.length < 5 && (
                      <div className="pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddCharacter}
                          className="w-full h-10 border-2 border-dashed border-pink-400 bg-pink-50/80 hover:bg-pink-100/80 hover:border-pink-500 text-pink-600 hover:text-pink-700 rounded-lg transition-all duration-200 text-xs md:text-sm font-medium"
                        >
                          <Plus className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                          <span className="truncate">Add Character ({characters.length}/5)</span>
                        </Button>
                      </div>
                    )}
                  </div>
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
                    placeholder="Enter fandom name (eg: Harry Potter, Marvel...)"
                    className="h-10 border border-gray-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl bg-white transition-all"
                  />
                </div>

                {/* Relationship Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900">
                    Relationship Type
                  </Label>
                  <div className="flex gap-2 mb-2">
                    <Button
                      type="button"
                      variant={relationshipTypeMode === "list" ? "default" : "outline"}
                      onClick={() => setRelationshipTypeMode("list")}
                      className={cn(
                        "h-9 text-xs flex-1 font-medium",
                        relationshipTypeMode === "list"
                          ? "bg-pink-500 hover:bg-pink-600 text-white shadow-md"
                          : "bg-white border-gray-300 hover:bg-pink-50/50"
                      )}
                    >
                      <span className="truncate">Choose from List</span>
                    </Button>
                    <Button
                      type="button"
                      variant={relationshipTypeMode === "custom" ? "default" : "outline"}
                      onClick={() => setRelationshipTypeMode("custom")}
                      className={cn(
                        "h-9 text-xs flex-1 font-medium",
                        relationshipTypeMode === "custom"
                          ? "bg-pink-500 hover:bg-pink-600 text-white shadow-md"
                          : "bg-white border-gray-300 hover:bg-pink-50/50"
                      )}
                    >
                      <span className="truncate">Custom Input</span>
                    </Button>
                  </div>
                  {relationshipTypeMode === "list" ? (
                    <Select value={relationshipType} onValueChange={setRelationshipType}>
                      <SelectTrigger className="h-10 border border-gray-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all rounded-xl rounded-lg bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {relationshipTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        value={customRelationshipType}
                        onChange={(e) => setCustomRelationshipType(e.target.value)}
                        placeholder="Enter custom relationship type (eg: Rival, Best Friend, Mentor, Sibling, Colleague, etc.)"
                        className="h-10 border border-gray-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all rounded-xl rounded-lg bg-white text-sm"
                      />
                      <p className="text-xs text-gray-500 break-words">
                        Examples: Rival, Best Friend, Mentor, Sibling, Colleague, etc.
                      </p>
                    </div>
                  )}
                </div>

                {/* Tone */}
                <div className="space-y-2">
                  <Label htmlFor="tone" className="text-sm font-medium text-gray-900">
                    Tone
                  </Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger id="tone" className="h-10 border border-gray-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all rounded-xl rounded-lg bg-white">
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
                    <SelectTrigger id="length" className="h-10 border border-gray-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all rounded-xl rounded-lg bg-white">
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
                    placeholder="Enter additional context about the relationship, setting, or specific scenario you want to explore (optional)"
                    className="min-h-24 border border-gray-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all rounded-xl rounded-lg resize-none bg-white"
                  />
                </div>

                {/* Generate Button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-full">
                        <Button
                          onClick={handleGenerate}
                          disabled={characters.filter(c => c.trim()).length === 0 || isGenerating || !isAuthenticated || authLoading}
                          className="w-full h-11 text-sm font-medium bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white shadow-sm hover:shadow-md rounded-xl relative transition-all duration-200"
                        >
                          {!isAuthenticated && !authLoading && (
                            <Lock className="absolute left-3 h-4 w-4" />
                          )}
                          {isGenerating ? (
                            <>
                              <Heart className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                              <span className="truncate">
                                {countdown !== null ? `Generating... ${countdown}s` : "Generating..."}
                              </span>
                            </>
                          ) : !isAuthenticated ? (
                            <>
                              <Heart className={`mr-2 h-4 w-4 md:h-5 md:w-5 ${!isAuthenticated ? 'opacity-0' : ''}`} />
                              <span className="truncate">Sign in to Generate</span>
                            </>
                          ) : (
                            <>
                              <Heart className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                              <span className="truncate">Generate Relationship Headcanon</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {!isAuthenticated && !authLoading && (
                      <TooltipContent>
                        <p>Please sign in to generate headcanons</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            </Card>
          </div>

          {/* RIGHT PANEL: Ready to Generate / Generated Headcanon */}
          <div className="flex-1 w-full lg:max-w-xl space-y-4 md:space-y-6">
            {isGenerating && !generatedHeadcanon ? (
              <Card className="border border-pink-100 bg-white shadow-sm rounded-2xl p-6">
                <div className="mb-4 md:mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Your Generated Relationship Headcanon
                  </h2>
                  <p className="text-sm text-gray-600">
                    AI-generated relationship story based on your custom parameters.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
                      <div className="flex gap-2">
                        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>

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

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-2 text-pink-600">
                      <Heart className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                      <span className="text-xs md:text-sm font-medium">
                        {countdown !== null ? `Generating in ${countdown}s...` : "Generating..."}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ) : !generatedHeadcanon ? (
              <Card className="border border-pink-100 bg-white shadow-sm rounded-2xl p-6">
                <div className="mb-4 md:mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="h-5 w-5 md:h-6 md:w-6 text-pink-600 flex-shrink-0" />
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">
                      Ready to Generate Your Relationship Headcanon
                    </h2>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                    Fill in the parameters on the left and click "Generate Relationship Headcanon" to create your personalized character relationship story. Our AI will craft a unique headcanon exploring the dynamics between your characters.
                  </p>
                </div>

                <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                  <div className="flex items-start gap-2 md:gap-3">
                    <Heart className="h-4 w-4 md:h-5 md:w-5 text-pink-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                      Explore character relationships, friendships, and romances
                    </p>
                  </div>
                  <div className="flex items-start gap-2 md:gap-3">
                    <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                      Customize relationship type, tone, length, and context
                    </p>
                  </div>
                  <div className="flex items-start gap-2 md:gap-3">
                    <Rocket className="h-4 w-4 md:h-5 md:w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                      Generate images for your relationship headcanon after creation
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3 md:mb-4">
                    <Lightbulb className="h-3 w-3 md:h-4 md:w-4 text-pink-600 flex-shrink-0" />
                    <h3 className="text-sm md:text-base font-semibold text-gray-900">Popular Examples to Try</h3>
                  </div>
                  <div className="space-y-2 md:space-y-2.5">
                    {examples.map((example, index) => {
                      const isSelected = 
                        JSON.stringify(characters.sort()) === JSON.stringify(example.characters.sort()) &&
                        fandom === example.fandom &&
                        relationshipType === example.type &&
                        relationshipTypeMode === "list" &&
                        tone === example.tone
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleExampleClick(example)}
                          className={cn(
                            "w-full text-left p-2.5 md:p-3 rounded-lg border transition-all duration-200",
                            isSelected
                              ? "border-pink-500 bg-pink-100 shadow-sm"
                              : "border-gray-200 hover:border-pink-300 hover:bg-pink-50 active:bg-pink-100"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "font-medium text-xs md:text-sm mb-1 break-words",
                                isSelected ? "text-pink-900" : "text-gray-900"
                              )}>
                                {example.characters.join(" & ")}
                              </p>
                              <p className={cn(
                                "text-xs break-words",
                                isSelected ? "text-pink-700" : "text-gray-600"
                              )}>
                                <span className="hidden sm:inline">Fandom: {example.fandom} | Type: {example.type} | Tone: {example.tone}</span>
                                <span className="sm:hidden">{example.fandom} · {example.type}</span>
                              </p>
                            </div>
                            {isSelected && (
                              <div className="flex-shrink-0 mt-0.5">
                                <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 md:mt-3 text-center">
                    Click any example to auto-fill the form, or create your own unique relationship story!
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="border border-pink-100 bg-white shadow-sm rounded-2xl p-6">
                <div className="mb-4 md:mb-6">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                    Your Generated Relationship Headcanon
                  </h2>
                  <p className="text-xs md:text-sm text-gray-600">
                    AI-generated relationship story based on your custom parameters.
                  </p>
                </div>

                <div className="flex items-start justify-between mb-4 md:mb-6 gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 break-words">
                      {generatedHeadcanon.characters.join(" & ")}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="px-2 md:px-3 py-1 text-xs bg-pink-100 text-pink-700 border-0">
                        {generatedHeadcanon.fandom}
                      </Badge>
                      <Badge className="px-2 md:px-3 py-1 text-xs bg-blue-100 text-blue-700 border-0">
                        {generatedHeadcanon.type}
                      </Badge>
                      <Badge className="px-2 md:px-3 py-1 text-xs bg-purple-100 text-purple-700 border-0">
                        {generatedHeadcanon.tone}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2 text-xs text-gray-500 flex-shrink-0">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gray-300 flex-shrink-0"></div>
                    <span className="hidden sm:inline">Just now</span>
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                  <div className={cn(
                    "p-3 md:p-4 rounded-lg border transition-all duration-500",
                    isLoadingSection === "coreIdea"
                      ? "bg-orange-50 border-orange-200 animate-pulse"
                      : "bg-orange-50 border-orange-100"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></div>
                      <h4 className="text-xs md:text-sm font-semibold text-orange-900">Core Idea</h4>
                    </div>
                    {isLoadingSection === "coreIdea" ? (
                      <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                        <Heart className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                        <span>Generating...</span>
                      </div>
                    ) : (
                      <p className="text-xs md:text-sm text-gray-700 leading-relaxed break-words">
                        {generatedHeadcanon.coreIdea}
                      </p>
                    )}
                  </div>

                  <div className={cn(
                    "p-3 md:p-4 rounded-lg border transition-all duration-500",
                    isLoadingSection === "development"
                      ? "bg-blue-50 border-blue-200 animate-pulse"
                      : generatedHeadcanon.development
                      ? "bg-blue-50 border-blue-100"
                      : "bg-gray-50 border-gray-100 opacity-50"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                      <h4 className="text-xs md:text-sm font-semibold text-blue-900">Development</h4>
                    </div>
                    {isLoadingSection === "development" ? (
                      <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                        <Heart className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                        <span>Generating...</span>
                      </div>
                    ) : generatedHeadcanon.development ? (
                      <p className="text-xs md:text-sm text-gray-700 leading-relaxed break-words">
                        {generatedHeadcanon.development}
                      </p>
                    ) : null}
                  </div>

                  <div className={cn(
                    "p-3 md:p-4 rounded-lg border transition-all duration-500",
                    isLoadingSection === "moment"
                      ? "bg-green-50 border-green-200 animate-pulse"
                      : generatedHeadcanon.moment
                      ? "bg-green-50 border-green-100"
                      : "bg-gray-50 border-gray-100 opacity-50"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                      <h4 className="text-xs md:text-sm font-semibold text-green-900">Moment</h4>
                    </div>
                    {isLoadingSection === "moment" ? (
                      <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                        <Heart className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                        <span>Generating...</span>
                      </div>
                    ) : generatedHeadcanon.moment ? (
                      <p className="text-xs md:text-sm text-gray-700 leading-relaxed break-words">
                        {generatedHeadcanon.moment}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-3 md:pt-4 border-t border-gray-100">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full h-10 text-sm font-medium bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <RefreshCw className="mr-2 h-3 w-3 md:h-4 md:w-4" />
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
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Understanding Relationship Headcanon Generation</h2>
            <p className="text-lg leading-relaxed mb-4">
              A relationship headcanon generator is an essential tool for writers, fanfiction creators, and creative enthusiasts who want to explore the dynamics and bonds between characters. This AI-powered relationship headcanon generator helps you develop unique interpretations of character relationships by generating creative interactions, emotional connections, and untold stories about how characters relate to each other.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              When you use our relationship headcanon generator, you're not just creating random relationship details. Instead, you're building upon existing canon to develop richer, more nuanced relationship interpretations. The relationship headcanon generator uses advanced artificial intelligence to ensure that each generated headcanon feels authentic and believable, maintaining consistency with the characters' established traits while exploring new dimensions of their connections.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">How Our Relationship Headcanon Generator Works</h2>
            <p className="text-lg leading-relaxed mb-4">
              Our relationship headcanon generator operates through a simple yet powerful interface. You start by entering the names of the characters whose relationship you want to explore, optionally specifying their fandom or universe. The generator then allows you to customize various aspects of the relationship headcanon creation process, including the type of relationship you want to explore, the tone you prefer, and the length of the generated content.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              The AI relationship headcanon generator processes your input and creates a structured output consisting of three key components: a core idea that presents the central concept about the relationship dynamic, a development section that expands on how the relationship developed and what makes their bond unique, and a moment that illustrates the relationship through a vivid scene showing their chemistry and connection.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Types of Relationship Headcanons You Can Generate</h2>
            <p className="text-lg leading-relaxed mb-4">
              Our relationship headcanon generator supports multiple types of relationship exploration. You can generate headcanons focused on friendships, exploring how characters support and understand each other. Romantic relationship headcanons examine the emotional and physical connections between characters, while rivalry headcanons explore competitive dynamics and conflicts.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              The generator can also create mentor-student relationships, sibling bonds, parent-child dynamics, colleague relationships, enemies-to-friends transformations, and found family connections. Each type of relationship headcanon serves different creative purposes, allowing writers to explore various aspects of character interactions. The relationship headcanon generator adapts its output based on your selected type, ensuring relevance and coherence.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Customizing Your Relationship Headcanon</h2>
            <p className="text-lg leading-relaxed mb-4">
              One of the key advantages of using our relationship headcanon generator is the extensive customization options available. You can select from various tones including wholesome, emotional, dark, humorous, angst, and dramatic, each of which influences the mood and style of the generated relationship headcanon. The length option allows you to choose between short, medium, and long outputs, giving you control over the level of detail.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Additionally, the relationship headcanon generator accepts optional context input, allowing you to provide specific details or scenarios you want the AI to incorporate. This feature makes the generator particularly useful for writers working on specific projects or exploring particular relationship aspects. The more context you provide, the more tailored and relevant your generated relationship headcanon will be.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Benefits of Using a Relationship Headcanon Generator</h2>
            <p className="text-lg leading-relaxed mb-4">
              Writers and creators benefit significantly from using a relationship headcanon generator. The tool helps overcome writer's block by providing fresh perspectives on familiar character relationships. When you're stuck on relationship development or need inspiration for new story directions, the relationship headcanon generator can spark creative ideas that lead to more engaging narratives.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              For fanfiction writers specifically, the relationship headcanon generator enables exploration of alternative relationship interpretations while maintaining consistency with established canon. The generator helps develop relationship dynamics, emotional connections, and interaction patterns that enrich storytelling. Role-playing game enthusiasts can use the relationship headcanon generator to quickly develop NPC relationship backgrounds and character bonds that enhance their game sessions.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Best Practices for Relationship Headcanon Generation</h2>
            <p className="text-lg leading-relaxed mb-4">
              To get the most out of our relationship headcanon generator, it's important to provide clear and specific input. While the generator works with minimal information, including character names and fandom details helps produce more accurate and relevant relationship headcanons. When using the generator, consider what aspects of the relationship you want to explore and select appropriate relationship types and tones.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              The generated relationship headcanons from our relationship headcanon generator should be viewed as starting points for your creative work. Use them as inspiration to develop your own unique interpretations, combining multiple generated ideas, or refining the output to better fit your creative vision. Remember that the best relationship headcanons feel authentic and enhance rather than contradict the original characters' established relationship dynamics.
            </p>
          </section>
        </article>
      </div>
      <Toaster />
    </div>
  )
}

