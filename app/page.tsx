"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Sparkles, Lightbulb, Zap, Layers, HelpCircle, Share2, BookOpen, Users, Wand2 } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function HeadcanonGenerator() {
  const [headcanonType, setHeadcanonType] = useState("")
  const [focusArea, setFocusArea] = useState("")
  const [characterInput, setCharacterInput] = useState("")
  const [generatedHeadcanon, setGeneratedHeadcanon] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!headcanonType || !focusArea || !characterInput.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before generating.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGeneratedHeadcanon("")

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          headcanonType,
          focusArea,
          characterInput,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate headcanon")
      }

      const data = await response.json()
      setGeneratedHeadcanon(data.headcanon)
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (generatedHeadcanon) {
      await navigator.clipboard.writeText(generatedHeadcanon)
      toast({
        title: "Copied!",
        description: "Headcanon copied to clipboard.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 md:py-16">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary/60 blur-xl opacity-50 animate-pulse" />
              <Sparkles className="relative h-10 w-10 text-primary drop-shadow-lg" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-balance bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent md:text-5xl">
              Headcanon Generator
            </h1>
          </div>
          <p className="text-lg text-muted-foreground text-pretty md:text-xl">
            Generate creative headcanon ideas for any character
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Perfect for writers, fanfiction creators, and world-builders
          </p>
        </header>

        {/* Main Generator Card */}
        <Card className="mb-8 border-border/50 shadow-2xl backdrop-blur-sm bg-card/80 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
          <CardHeader className="relative">
            <CardTitle className="text-2xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Create Your Headcanon
            </CardTitle>
            <CardDescription>Customize the type and focus to generate unique character insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            {/* Headcanon Type Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="headcanon-type">Headcanon Type</Label>
              <Select value={headcanonType} onValueChange={setHeadcanonType}>
                <SelectTrigger id="headcanon-type">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backstory">Backstory</SelectItem>
                  <SelectItem value="hidden-talents">Hidden Talents</SelectItem>
                  <SelectItem value="daily-life">Daily Life</SelectItem>
                  <SelectItem value="relationships">Relationships</SelectItem>
                  <SelectItem value="personal-habits">Personal Habits</SelectItem>
                  <SelectItem value="secret-history">Secret History</SelectItem>
                  <SelectItem value="alternative-timeline">Alternative Timeline</SelectItem>
                  <SelectItem value="future-events">Future Events</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Focus Area Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="focus-area">Focus Area</Label>
              <Select value={focusArea} onValueChange={setFocusArea}>
                <SelectTrigger id="focus-area">
                  <SelectValue placeholder="Select a focus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal-life">Personal Life</SelectItem>
                  <SelectItem value="character-development">Character Development</SelectItem>
                  <SelectItem value="relationships">Relationships</SelectItem>
                  <SelectItem value="fears-dreams">Fears & Dreams</SelectItem>
                  <SelectItem value="hobbies">Hobbies</SelectItem>
                  <SelectItem value="inner-thoughts">Inner Thoughts</SelectItem>
                  <SelectItem value="what-if-scenarios">What-if Scenarios</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Character Input Textarea */}
            <div className="space-y-2">
              <Label htmlFor="character-input">What would you like to create?</Label>
              <Textarea
                id="character-input"
                placeholder="Describe your character or the situation you want to explore.&#10;Example: A quiet vampire who secretly loves modern pop music."
                value={characterInput}
                onChange={(e) => setCharacterInput(e.target.value)}
                className="min-h-32 resize-none"
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full text-base font-semibold shadow-lg transition-all hover:shadow-xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary hover:to-primary/90 border-0 relative overflow-hidden group"
              size="lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {isGenerating ? (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-spin relative z-10" />
                  <span className="relative z-10">Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5 relative z-10" />
                  <span className="relative z-10">Generate Headcanon</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Result Section */}
        {generatedHeadcanon && (
          <Card className="border-primary/30 shadow-2xl backdrop-blur-sm bg-card/80 animate-in fade-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Generated Headcanon
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleCopy} 
                  className="hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Copy className="h-5 w-5" />
                  <span className="sr-only">Copy to clipboard</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="prose prose-invert max-w-none">
                <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
                  {generatedHeadcanon}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-16 space-y-12">
          {/* How to Use Section */}
          <section>
            <h2 className="mb-8 text-center text-3xl font-bold text-balance">How to Use Headcanon Generator</h2>
            <p className="mb-10 text-center text-muted-foreground text-pretty">
              Follow these simple steps to generate creative headcanons for your characters
            </p>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <Card className="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg backdrop-blur-sm bg-card/60 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="relative">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-xl font-bold text-primary border border-primary/20">
                    1
                  </div>
                  <CardTitle className="text-xl">Describe Your Character</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Enter basic details about your character, such as their personality, backstory, or theme. Select a
                    headcanon type and focus area to tailor the output to your creative needs.
                  </p>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg backdrop-blur-sm bg-card/60 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="relative">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-xl font-bold text-primary border border-primary/20">
                    2
                  </div>
                  <CardTitle className="text-xl">Click Generate</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Press the Generate button to create a unique headcanon. Each result is AI-powered and designed to
                    inspire fresh perspectives and add depth to your character development.
                  </p>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg backdrop-blur-sm bg-card/60 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="relative">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-xl font-bold text-primary border border-primary/20">
                    3
                  </div>
                  <CardTitle className="text-xl">Explore and Apply</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Review the generated headcanon and incorporate it into your stories. Use it for writing, share with
                    friends, or expand on it to develop your characters further.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Feature Highlights */}
          <section>
            <h2 className="mb-12 text-center text-3xl font-bold text-balance bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Why Choose Headcanon Generator?
            </h2>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <Card className="border-primary/20 bg-card/60 backdrop-blur-sm relative overflow-hidden group hover:border-primary/40 hover:shadow-xl transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="relative">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                      <Lightbulb className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Endless Character Ideas</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                    The headcanon generator provides endless creative possibilities. From quirky personality traits to
                    mysterious backstories, each generated headcanon offers something new and unique.
                  </p>
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                    {/* Headcanon Generator 插图 */}
                    <Image
                      src="/endless_character_ideas.png"
                      alt="Headcanon Generator - Creative character ideas and imaginative worlds illustration for AI-powered headcanon creation"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="border-primary/20 bg-card/60 backdrop-blur-sm relative overflow-hidden group hover:border-primary/40 hover:shadow-xl transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="relative">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Easy to Use, Fun to Explore</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                    Our character headcanon generator is incredibly easy to use. With just a few selections and a click, you
                    can dive into new headcanons and let your creativity take over.
                  </p>
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                    {/* Character Headcanon Generator 界面插图 */}
                    <Image
                      src="/easy_to_use.png"
                      alt="Headcanon Generator interface - Easy to use AI headcanon generator tool with intuitive design for creating character ideas"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="border-primary/20 bg-card/60 backdrop-blur-sm relative overflow-hidden group hover:border-primary/40 hover:shadow-xl transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="relative">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                      <Layers className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Expand Character Depth</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                    Add meaningful layers to your characters' stories with AI-generated headcanons. Each result brings new
                    aspects to your character's personality or history.
                  </p>
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                    {/* AI Headkots - Character transformation illustration */}
                    <Image
                      src="/expand_character_depth.png"
                      alt="Headcanon Generator - Expand character depth with AI-powered headcanon creation and character development tools"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Use Cases Section */}
          <section className="mt-16">
            <h2 className="mb-12 text-center text-3xl font-bold text-balance bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Perfect For
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-primary/20 bg-card/60 backdrop-blur-sm text-center p-6 hover:border-primary/40 hover:shadow-lg transition-all">
                <BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
                <CardTitle className="text-lg mb-2">Writers</CardTitle>
                <p className="text-sm text-muted-foreground">Enhance your stories with rich character details</p>
              </Card>
              
              <Card className="border-primary/20 bg-card/60 backdrop-blur-sm text-center p-6 hover:border-primary/40 hover:shadow-lg transition-all">
                <Wand2 className="h-8 w-8 text-primary mx-auto mb-3" />
                <CardTitle className="text-lg mb-2">Fanfiction</CardTitle>
                <p className="text-sm text-muted-foreground">Create unique interpretations of beloved characters</p>
              </Card>
              
              <Card className="border-primary/20 bg-card/60 backdrop-blur-sm text-center p-6 hover:border-primary/40 hover:shadow-lg transition-all">
                <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                <CardTitle className="text-lg mb-2">RPG Players</CardTitle>
                <p className="text-sm text-muted-foreground">Develop deep backstories for your characters</p>
              </Card>
              
              <Card className="border-primary/20 bg-card/60 backdrop-blur-sm text-center p-6 hover:border-primary/40 hover:shadow-lg transition-all">
                <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
                <CardTitle className="text-lg mb-2">Creators</CardTitle>
                <p className="text-sm text-muted-foreground">Inspire new ideas and creative directions</p>
              </Card>
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 mb-4">
                <HelpCircle className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold text-balance bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  Frequently Asked Questions
                </h2>
              </div>
              <p className="text-muted-foreground">Everything you need to know about Headcanon Generator</p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem 
                  value="item-1" 
                  className="border border-primary/20 rounded-lg backdrop-blur-sm bg-card/60 overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline group">
                    <div className="flex items-start gap-4 w-full">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                        <HelpCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          What is a Headcanon Generator?
                        </h3>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="pl-14">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        A headcanon generator is an AI-powered tool that creates unique character details, backstories, and
                        personality traits. It helps writers and creators develop deeper, more interesting characters by
                        suggesting creative ideas you might not have thought of yourself.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem 
                  value="item-2" 
                  className="border border-primary/20 rounded-lg backdrop-blur-sm bg-card/60 overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline group">
                    <div className="flex items-start gap-4 w-full">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          How do I use the Headcanon Generator?
                        </h3>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="pl-14">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Simply select a headcanon type and focus area from the dropdown menus, describe your character in
                        the text box, and click Generate. The AI will create a unique headcanon based on your inputs that
                        you can use or modify for your creative projects.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem 
                  value="item-3" 
                  className="border border-primary/20 rounded-lg backdrop-blur-sm bg-card/60 overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline group">
                    <div className="flex items-start gap-4 w-full">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          Can I use this for any character?
                        </h3>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="pl-14">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Yes! The headcanon generator works with any character from any universe—original characters,
                        fanfiction, game characters, or even real people. Just provide a description and the generator will
                        create relevant headcanons tailored to your input.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem 
                  value="item-4" 
                  className="border border-primary/20 rounded-lg backdrop-blur-sm bg-card/60 overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline group">
                    <div className="flex items-start gap-4 w-full">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                        <Layers className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          Can the Headcanon Generator assist with character development?
                        </h3>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="pl-14">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        The generator is specifically designed to help with character development by providing creative
                        insights, personality quirks, relationship dynamics, and backstory elements that add depth and
                        complexity to your characters.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem 
                  value="item-5" 
                  className="border border-primary/20 rounded-lg backdrop-blur-sm bg-card/60 overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline group">
                    <div className="flex items-start gap-4 w-full">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                        <Share2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          Can I share the headcanons I generate?
                        </h3>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="pl-14">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Yes! Use the copy button to easily share your generated headcanons with friends, post them on social
                        media, or incorporate them into your stories and creative projects. The headcanons are yours to use
                        however you like.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>Powered by AI · For creative inspiration only</p>
        </footer>
      </div>
      <Toaster />
    </div>
  )
}
