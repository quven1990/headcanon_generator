"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Heart, ArrowRight, Wrench, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// 生成类型配置
const generatorTypes = [
  {
    id: "character-headcanon",
    title: "Character Headcanon",
    description: "Explore character backstories, personality traits, hidden talents, and personal quirks",
    icon: Sparkles,
    tags: ["Backstory", "Traits", "Secrets"],
    styles: {
      gradient: "from-purple-200/40 to-purple-300/20",
      borderColor: "border-purple-300/60",
      hoverBorderColor: "hover:border-purple-400/80",
      iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
      buttonColor: "text-purple-600 hover:text-purple-700",
      tagBg: "bg-purple-100/80",
      tagText: "text-purple-700",
      tagBorder: "border-purple-300/50",
      hoverBg: "hover:bg-purple-100/50",
    },
  },
  {
    id: "relationship-headcanon",
    title: "Relationship Headcanon",
    description: "Discover character relationships, friendships, rivalries, and romantic dynamics",
    icon: Heart,
    tags: ["Romance", "Friendship", "Rivalry"],
    styles: {
      gradient: "from-pink-200/40 to-pink-300/20",
      borderColor: "border-pink-300/60",
      hoverBorderColor: "hover:border-pink-400/80",
      iconBg: "bg-gradient-to-br from-pink-500 to-pink-600",
      buttonColor: "text-pink-600 hover:text-pink-700",
      tagBg: "bg-pink-100/80",
      tagText: "text-pink-700",
      tagBorder: "border-pink-300/50",
      hoverBg: "hover:bg-pink-100/50",
    },
  },
]

export default function HomePage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleCardClick = (typeId: string, title: string) => {
    if (typeId === "character-headcanon") {
      router.push(`/character-headcanon`)
    } else if (typeId === "relationship-headcanon") {
      router.push(`/relationship-headcanon`)
    } else {
      toast({
        title: "Coming Soon",
        description: `${title} generator page is under development.`,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/40 via-rose-50/30 to-pink-50/40">
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-16">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary/60 blur-xl opacity-50 animate-pulse" />
              <Sparkles className="relative h-10 w-10 text-primary drop-shadow-lg" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-balance bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent md:text-5xl drop-shadow-sm">
              Headcanon Generator
            </h1>
          </div>
          <p className="text-lg text-gray-700 text-pretty md:text-xl">
            Generate creative headcanon ideas for any character
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Perfect for writers, fanfiction creators, and world-builders
          </p>
        </header>

        {/* Generator Types Grid */}
        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto mb-16">
          {generatorTypes.map((type) => {
            const IconComponent = type.icon
            return (
              <Card
                key={type.id}
                className={cn(
                  "border-2 shadow-xl backdrop-blur-sm bg-white/90 relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] rounded-2xl",
                  type.styles.borderColor,
                  type.styles.hoverBorderColor
                )}
                onClick={() => handleCardClick(type.id, type.title)}
              >
                {/* Background Gradient */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-30 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none",
                  type.styles.gradient
                )} />
                
                <CardHeader className="relative pb-4">
                  {/* Icon */}
                  <div className={cn(
                    "mb-4 flex h-20 w-20 items-center justify-center rounded-2xl shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300",
                    type.styles.iconBg
                  )}>
                    <IconComponent className="h-10 w-10 text-white drop-shadow-md" />
                  </div>
                  
                  <CardTitle className="text-xl font-bold mb-2 group-hover:text-foreground transition-colors text-foreground">
                    {type.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                    {type.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="relative space-y-4">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {type.tags.map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium border",
                          type.styles.tagBg,
                          type.styles.tagText,
                          type.styles.tagBorder
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* CTA Button */}
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between group/btn",
                      type.styles.buttonColor,
                      type.styles.hoverBg
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCardClick(type.id, type.title)
                    }}
                  >
                    <span className="font-semibold">
                      {type.id === "character-name" ? "Generate Names" : 
                       type.id === "relationship-headcanon" ? "Explore Bonds" :
                       type.id === "scenario-headcanon" ? "Explore Scenarios" :
                       "Start Creating"}
                    </span>
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
          
          {/* Coming Soon Card */}
          <Card className="border-2 border-dashed border-gray-300/60 bg-white/60 backdrop-blur-sm shadow-xl rounded-2xl relative overflow-hidden group hover:shadow-2xl hover:scale-[1.03] transition-all duration-300">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200/30 to-gray-300/20 opacity-30 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none" />
            
            <CardHeader className="relative pb-4">
              {/* Icon */}
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl shadow-xl bg-gradient-to-br from-gray-200 to-gray-300 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Clock className="h-10 w-10 text-gray-600 drop-shadow-md" />
              </div>
              
              <CardTitle className="text-xl font-bold mb-2 text-foreground">
                More Features Coming Soon
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                We're working on adding more exciting features to enhance your creative experience.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative space-y-4">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium border bg-gray-100/80 text-gray-700 border-gray-300/50">
                  In Development
                </span>
              </div>
              
              {/* CTA Button */}
              <Button
                variant="ghost"
                className="w-full justify-between group/btn text-gray-600 hover:text-gray-700 hover:bg-gray-100/50"
                disabled
              >
                <span className="font-semibold">Stay Tuned</span>
                <Clock className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>Powered by AI · For creative inspiration only</p>
        </footer>
      </div>
      <Toaster />
    </div>
  )
}
