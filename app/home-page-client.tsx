"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Heart, ArrowRight, Clock } from "lucide-react"
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
      gradient: "from-blue-200/50 to-purple-300/30",
      borderColor: "border-blue-300/70",
      hoverBorderColor: "hover:border-blue-400/90",
      iconBg: "bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600",
      buttonColor: "text-blue-600 hover:text-blue-700",
      tagBg: "bg-blue-100/90",
      tagText: "text-blue-700",
      tagBorder: "border-blue-300/60",
      hoverBg: "hover:bg-blue-100/60",
    },
  },
  {
    id: "relationship-headcanon",
    title: "Relationship Headcanon",
    description: "Discover character relationships, friendships, rivalries, and romantic dynamics",
    icon: Heart,
    tags: ["Romance", "Friendship", "Rivalry"],
    styles: {
      gradient: "from-rose-200/50 to-pink-300/30",
      borderColor: "border-rose-300/70",
      hoverBorderColor: "hover:border-rose-400/90",
      iconBg: "bg-gradient-to-br from-rose-500 via-pink-500 to-pink-600",
      buttonColor: "text-rose-600 hover:text-rose-700",
      tagBg: "bg-rose-100/90",
      tagText: "text-rose-700",
      tagBorder: "border-rose-300/60",
      hoverBg: "hover:bg-rose-100/60",
    },
  },
]

export default function HomePageClient() {
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
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-semibold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent md:text-5xl">
              Headcanon Generator
            </h1>
          </div>
          
          {/* 明确的价值主张 - 3秒内让用户明白 */}
          <div className="mb-10 max-w-3xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Create Unique Character Stories with AI
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-700 mb-4 leading-relaxed">
              Generate creative backstories, personality traits, and relationship dynamics for any character from any fandom. Perfect for fanfiction, role-playing games, and creative writing.
            </p>
            <p className="text-sm md:text-base text-gray-600 mb-8">
              <span className="font-semibold text-green-600">Free to Use</span> • No sign-up required to explore • Instant results
            </p>
            
            {/* 主要CTA按钮 - 醒目且响应式 */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
              <Button
                onClick={() => router.push("/character-headcanon")}
                size="lg"
                className="w-full sm:w-auto sm:flex-1 max-w-xs sm:max-w-none px-6 sm:px-8 py-5 sm:py-6 text-base md:text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Creating Free
              </Button>
              <Button
                onClick={() => router.push("/relationship-headcanon")}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto sm:flex-1 max-w-xs sm:max-w-none px-6 sm:px-8 py-5 sm:py-6 text-base md:text-lg font-semibold border-2 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 rounded-xl transition-all duration-200"
              >
                <Heart className="mr-2 h-5 w-5" />
                Try Relationship
              </Button>
            </div>
          </div>
          
          {/* 快速说明 - 增强信任感 */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="font-medium text-green-700">Free to Use</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="font-medium text-blue-700">No Credit Card</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="font-medium text-purple-700">Instant Results</span>
            </div>
          </div>
        </header>

        {/* Generator Types Grid */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
              Choose Your Generator Type
            </h3>
            <p className="text-sm md:text-base text-gray-600">
              Select the type of headcanon you want to create
            </p>
          </div>
          <div className="grid gap-6 md:gap-8 md:grid-cols-3 max-w-6xl mx-auto mb-20">
          {generatorTypes.map((type) => {
            const IconComponent = type.icon
            return (
              <Card
                key={type.id}
                className={cn(
                  "border shadow-sm bg-white relative overflow-hidden group cursor-pointer transition-all duration-200 hover:shadow-md rounded-2xl",
                  type.id === "character-headcanon" 
                    ? "border-blue-200 hover:border-blue-300" 
                    : "border-pink-200 hover:border-pink-300"
                )}
                onClick={() => handleCardClick(type.id, type.title)}
              >
                <CardHeader className="relative pb-6 pt-6">
                  {/* Icon */}
                  <div className={cn(
                    "mb-5 flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-200 shadow-sm",
                    type.id === "character-headcanon" 
                      ? "bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600" 
                      : "bg-gradient-to-br from-pink-500 to-rose-500"
                  )}>
                    <IconComponent className="h-7 w-7 text-white" />
                  </div>
                  
                  <CardTitle className="text-xl font-semibold mb-2 text-gray-900">
                    {type.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-gray-600">
                    {type.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="relative space-y-5 pb-6">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {type.tags.map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          "px-3 py-1 rounded-lg text-xs font-medium border",
                          type.id === "character-headcanon"
                            ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200"
                            : "bg-pink-50 text-pink-700 border-pink-200"
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* CTA Button - 更醒目 */}
                  <Button
                    className={cn(
                      "w-full justify-center group/btn rounded-xl font-semibold text-sm md:text-base py-6 shadow-sm hover:shadow-md transition-all duration-200",
                      type.id === "character-headcanon"
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                        : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCardClick(type.id, type.title)
                    }}
                  >
                    <span>
                      {type.id === "character-name" ? "Generate Names" : 
                       type.id === "relationship-headcanon" ? "Generate Relationship" :
                       type.id === "scenario-headcanon" ? "Explore Scenarios" :
                       "Start Creating"}
                    </span>
                    <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
          
          {/* Coming Soon Card */}
          <Card className="border border-dashed border-gray-300 bg-white shadow-sm rounded-2xl relative overflow-hidden group hover:shadow-md hover:border-gray-400 transition-all duration-200">
            <CardHeader className="relative pb-6 pt-6">
              {/* Icon */}
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-50">
                <Clock className="h-7 w-7 text-gray-500" />
              </div>

              <CardTitle className="text-xl font-semibold mb-2 text-gray-900">
                More Features Coming Soon
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed text-gray-600">
                We're working on adding more exciting features to enhance your creative experience.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative space-y-5 pb-6">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                  In Development
                </span>
              </div>
              
              {/* CTA Button */}
              <Button
                variant="ghost"
                className="w-full justify-between group/btn text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
                disabled
              >
                <span className="font-medium text-sm">Stay Tuned</span>
                <Clock className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
          </div>
        </div>

        {/* SEO Content Section - 4. Heading 标题标签和 3. 文本内容 */}
        <article className="max-w-4xl mx-auto mb-20 space-y-10 text-gray-600">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">What is a Headcanon Generator?</h2>
            <p className="text-base leading-relaxed mb-4">
              A headcanon generator is an innovative AI-powered tool designed to help writers, fanfiction creators, and role-playing game enthusiasts develop unique character interpretations and backstories. This headcanon generator uses advanced artificial intelligence to create personalized character headcanons that explore personality traits, hidden talents, relationship dynamics, and untold stories that never made it into the original canon.
            </p>
            <p className="text-base leading-relaxed mb-4">
              Whether you're crafting fanfiction, developing original characters for your novel, or building rich narratives for tabletop RPGs, our headcanon generator provides endless creative inspiration. The tool allows you to customize every aspect of your character's story, from their deepest motivations to their most mundane daily habits.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">How to Use Our Headcanon Generator</h2>
            <p className="text-base leading-relaxed mb-4">
              Using our headcanon generator is simple and intuitive. Start by selecting the type of headcanon you want to create - whether it's a character headcanon focusing on individual traits and backstories, or a relationship headcanon exploring the dynamics between multiple characters. Enter your character names, specify the fandom or universe they belong to, and choose from various customization options including tone, length, and additional context.
            </p>
            <p className="text-base leading-relaxed mb-4">
              Our AI headcanon generator will then craft a unique, detailed headcanon that includes a core idea, development of the concept, and a vivid moment that illustrates the headcanon in action. The generated content is structured to provide both inspiration and a solid foundation for your creative writing projects.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Benefits of Using a Character Headcanon Generator</h2>
            <p className="text-base leading-relaxed mb-4">
              The primary benefit of using a character headcanon generator is the ability to quickly generate creative ideas when you're experiencing writer's block or need fresh perspectives on familiar characters. This headcanon generator tool helps you explore aspects of characters that weren't fully developed in the original source material, allowing for deeper character analysis and more nuanced storytelling.
            </p>
            <p className="text-base leading-relaxed mb-4">
              For fanfiction writers, our headcanon generator serves as an invaluable resource for developing alternative interpretations and exploring "what if" scenarios. The generator can help you create consistent character voices, develop relationship dynamics, and build upon existing canon in meaningful ways. Role-playing game masters can use the headcanon generator to quickly develop NPC backstories and character motivations that enrich their game worlds.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Types of Headcanons You Can Generate</h2>
            <p className="text-base leading-relaxed mb-4">
              Our headcanon generator supports multiple types of headcanon creation. Character headcanons focus on individual character development, exploring personality traits, backstories, hidden talents, and personal quirks. Relationship headcanons examine the bonds between characters, whether they're friendships, romantic relationships, rivalries, or mentor-student dynamics.
            </p>
            <p className="text-base leading-relaxed mb-4">
              The generator can create headcanons in various tones - from wholesome and emotional to dark and humorous. You can specify the length of the generated content, from short and concise summaries to long, detailed explorations. This flexibility makes our headcanon generator suitable for a wide range of creative projects and writing styles.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Why Choose Our Headcanon Generator?</h2>
            <p className="text-base leading-relaxed mb-4">
              Our headcanon generator is free to use, with no credit card required to get started. The AI-powered tool is designed to be user-friendly, requiring minimal setup while providing maximum creative output. Whether you're a seasoned writer or just starting your creative journey, the headcanon generator adapts to your needs and skill level.
            </p>
            <p className="text-base leading-relaxed mb-4">
              The generator uses advanced AI technology to ensure that each headcanon is unique and creative, avoiding repetitive or generic content. With customizable parameters for type, tone, length, and context, you have complete control over the generation process while still benefiting from AI-assisted creativity. Start using our headcanon generator today and unlock endless possibilities for character development and storytelling.
            </p>
          </section>
        </article>

        {/* Footer */}
        <footer className="mt-20 text-center text-sm text-gray-400">
          <p>Powered by AI · For creative inspiration only</p>
        </footer>
      </div>
      <Toaster />
    </div>
  )
}

