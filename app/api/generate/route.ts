import { NextRequest, NextResponse } from "next/server"
import { getAuthEnv } from "@/lib/auth/env"
import { checkGenerationRateLimit } from "@/lib/auth/rate-limit"
import { getCurrentUser } from "@/lib/auth/session"
import { getEnvVar } from "@/lib/runtime/env"

// 内容过滤函数：检测不适当、违法或不当内容
function containsInappropriateContent(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false
  }

  const lowerText = text.toLowerCase()
  
  // 性相关内容关键词（包括用户示例中的词汇）
  const sexualKeywords = [
    'penis', 'dick', 'cock', 'dick', 'phallus', 'genital',
    'vagina', 'pussy', 'cunt', 'clitoris',
    'balls', 'testicles', 'scrotum',
    'sex', 'sexual', 'intercourse', 'fuck', 'fucking', 'fucked',
    'orgasm', 'masturbat', 'ejaculat', 'cum', 'sperm',
    'erotic', 'erotica', 'porn', 'pornographic', 'xxx',
    'nude', 'naked', 'nudity', 'bare', 'exposed',
    'gigantic penis', 'huge penis', 'big penis', 'large penis',
    'thick penis', 'veiny', 'heavy balls', 'big balls',
    'hard-on', 'erection', 'aroused', 'horny',
    'breast', 'boob', 'nipple', 'tits',
    'ass', 'butt', 'buttock', 'anus', 'anal',
    'oral', 'blowjob', 'cunnilingus', 'fellatio',
    'kink', 'fetish', 'bdsm', 'bondage', 'sadomasochism',
    'rape', 'raping', 'molest', 'abuse',
    'incest', 'pedophil', 'underage',
  ]

  // 暴力/违法内容关键词
  const violentKeywords = [
    'kill', 'murder', 'assassinat', 'homicide',
    'torture', 'torturing', 'tortured',
    'suicide', 'self-harm', 'cutting',
    'terrorism', 'bomb', 'explosive', 'weapon',
    'drug', 'cocaine', 'heroin', 'meth', 'marijuana',
    'illegal', 'crime', 'criminal',
  ]

  // 仇恨/歧视内容关键词
  const hateKeywords = [
    'nazi', 'hitler', 'holocaust',
    'racist', 'racism', 'racial slur',
    'hate speech', 'discriminat',
  ]

  // 检查所有关键词
  const allKeywords = [...sexualKeywords, ...violentKeywords, ...hateKeywords]
  
  for (const keyword of allKeywords) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`\\b${escaped}\\b`, 'i')
    if (regex.test(lowerText)) {
      return true
    }
  }

  // 检查特定模式（如用户示例中的描述）
  const inappropriatePatterns = [
    /\b(?:gigantic|huge|ultra-thick|very veiny|super heavy)\s+(?:penis|dick|cock|balls|testicles)\b/i,
    /\b(?:penis|dick|cock)\s+(?:is|has|have)\s+(?:gigantic|huge|big|large|thick|veiny)\b/i,
    /\b(?:balls|testicles)\s+(?:is|are|has|have)\s+(?:huge|big|large|heavy|super heavy)\b/i,
  ]

  for (const pattern of inappropriatePatterns) {
    if (pattern.test(text)) {
      return true
    }
  }

  return false
}

// 解析headcanon文本,提取core_idea, development, moment
function parseHeadcanon(text: string) {
  let cleanText = text.trim()
  
  // 尝试解析结构化的内容（带标签）
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


export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const timestamp = new Date().toLocaleString("zh-CN", { 
    timeZone: "Asia/Shanghai",
    hour12: false 
  })

  try {
    const env = await getAuthEnv()
    const user = await getCurrentUser(req, env)

    if (!user) {
      console.log(`[${timestamp}] ❌ 未授权访问 - 用户未登录`)
      return NextResponse.json(
        { error: "Authentication required. Please sign in to generate headcanons." },
        { status: 401 }
      )
    }

    console.log(`[${timestamp}] ✅ User authenticated: ${user.id}`)

    const body = await req.json()
    const { headcanonType, focusArea, characterInput, length, shareToExplore = true } = body

    if (!characterInput || typeof characterInput !== "string" || !characterInput.trim()) {
      return NextResponse.json(
        { error: "Character description is required." },
        { status: 400 }
      )
    }

    const rateLimit = await checkGenerationRateLimit(env.DB, user.id)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Hourly generation limit reached. Please try again later." },
        { status: 429 }
      )
    }

    // 检查用户输入是否包含不适当内容
    if (containsInappropriateContent(characterInput)) {
      console.log(`[${timestamp}] 🚫 检测到不适当内容 - 拒绝请求`)
      console.log(`   用户输入包含不当内容，已拒绝生成`)
      return NextResponse.json(
        { error: "Your input contains inappropriate, explicit, or illegal content. Please provide appropriate character descriptions for headcanon generation." },
        { status: 400 }
      )
    }

    // 检查其他输入字段
    const allInputText = `${headcanonType || ''} ${focusArea || ''} ${characterInput || ''}`.trim()
    if (containsInappropriateContent(allInputText)) {
      console.log(`[${timestamp}] 🚫 检测到不适当内容 - 拒绝请求`)
      console.log(`   输入包含不当内容，已拒绝生成`)
      return NextResponse.json(
        { error: "Your input contains inappropriate, explicit, or illegal content. Please provide appropriate content for headcanon generation." },
        { status: 400 }
      )
    }

    console.log("\n" + "=".repeat(80))
    console.log(`[${timestamp}] 🚀 收到新的 Headcanon 生成请求`)
    console.log("=".repeat(80))
    console.log("📝 请求参数:")
    console.log(`   - 类型 (Type): ${headcanonType}`)
    console.log(`   - 焦点 (Focus): ${focusArea}`)
    console.log(`   - 长度 (Length): ${length || "Medium"}`)
    console.log(`   - 角色描述: ${characterInput.substring(0, 100)}${characterInput.length > 100 ? "..." : ""}`)
    console.log("")

    // 检测是否是关系类型的 headcanon
    const isRelationshipType = headcanonType.toLowerCase().includes("relationship") || 
                               headcanonType.toLowerCase().includes("friendship") ||
                               headcanonType.toLowerCase().includes("romance") ||
                               headcanonType.toLowerCase().includes("rivalry") ||
                               headcanonType.toLowerCase().includes("mentor") ||
                               headcanonType.toLowerCase().includes("sibling") ||
                               headcanonType.toLowerCase().includes("colleague") ||
                               headcanonType.toLowerCase().includes("enemy") ||
                               characterInput.toLowerCase().includes(" and ") ||
                               characterInput.toLowerCase().includes(" & ")

    // 根据 length 参数确定每个部分的长度要求
    const lengthGuidance = length === "Short" 
      ? "Keep each section concise: Core Idea (1 sentence), Development (1-2 sentences), Moment (1-2 sentences). Total should be brief and to the point."
      : length === "Long"
      ? "Expand each section in detail: Core Idea (2-3 sentences), Development (3-4 sentences), Moment (3-5 sentences). Provide rich details and depth."
      : "Use moderate length: Core Idea (1-2 sentences), Development (2-3 sentences), Moment (2-4 sentences). Balance detail with conciseness."

    const prompt = isRelationshipType 
      ? `You are a creative writing assistant that generates fictional relationship headcanon ideas for characters. 

Generate a relationship headcanon based on the following:
- Relationship Type: ${headcanonType || "Random"}
- Tone: ${focusArea || "Random"}
- Length: ${length || "Medium"}
- Characters: ${characterInput}

${lengthGuidance}

Focus on the DYNAMICS, INTERACTIONS, and BOND between the characters. Write a creative, engaging, and story-driven relationship headcanon in THREE distinct sections, separated by double newlines (\\n\\n):

1. **Core Idea**: The central concept about the relationship dynamic or bond between the characters
2. **Development**: Expand on how this relationship developed, their interactions, and what makes their bond unique
3. **Moment**: A vivid, specific moment or scene that illustrates their relationship in action - show their chemistry, connection, or dynamic

The relationship headcanon should:
- Focus on the relationship dynamics, not just individual characters
- Explore how the characters interact, support, challenge, or understand each other
- Feel like a fan-created personal interpretation of their bond
- Be written in natural, engaging English
- Be fictional and imaginative
- Be safe-for-work and appropriate
- Avoid referencing real people
- Include specific details that make the relationship feel authentic and believable
- STRICTLY PROHIBITED: No sexual content, explicit descriptions, adult themes, violence, illegal activities, or inappropriate material of any kind
- DO NOT include any explicit, sexual, violent, or illegal content whatsoever

Format your response EXACTLY as follows (use \\n\\n to separate sections):
Core Idea: [your core idea here]

Development: [your development here]

Moment: [your moment here]

Generate the relationship headcanon now:`
      : `You are a creative writing assistant that generates fictional headcanon ideas for characters. 

Generate a headcanon based on the following:
- Type: ${headcanonType || "Random"}
- Focus: ${focusArea || "Random"}
- Length: ${length || "Medium"}
- Character/Situation: ${characterInput}

${lengthGuidance}

Write a creative, engaging, and story-driven headcanon in THREE distinct sections, separated by double newlines (\\n\\n):

1. **Core Idea**: The central concept or main idea of the headcanon
2. **Development**: Expand on the core idea with more details, context, and implications
3. **Moment**: A vivid, specific moment or scene that illustrates the headcanon in action

The headcanon should:
- Feel like a fan-created personal interpretation
- Be written in natural, engaging English
- Be fictional and imaginative
- Be safe-for-work and appropriate
- Avoid referencing real people
- Include specific details that make it feel authentic and believable
- STRICTLY PROHIBITED: No sexual content, explicit descriptions, adult themes, violence, illegal activities, or inappropriate material of any kind
- DO NOT include any explicit, sexual, violent, or illegal content whatsoever

Format your response EXACTLY as follows (use \\n\\n to separate sections):
Core Idea: [your core idea here]

Development: [your development here]

Moment: [your moment here]

Generate the headcanon now:`

    // 从 Cloudflare Worker 环境变量 / Secrets 读取 AI 配置
    const apiKey = await getEnvVar("SILICONFLOW_API_KEY")
    const model = await getEnvVar("SILICONFLOW_MODEL")

    if (!apiKey) {
      console.error("❌ 错误: SILICONFLOW_API_KEY 未配置!")
      console.error("   请在 Cloudflare Worker Secrets 或 .dev.vars 中配置 SILICONFLOW_API_KEY")
      return Response.json(
        { error: "SILICONFLOW_API_KEY is not configured. Please set it in Cloudflare Worker secrets." },
        { status: 500 }
      )
    }

    if (!model) {
      console.error("❌ 错误: SILICONFLOW_MODEL 未配置!")
      console.error("   请在 wrangler.jsonc vars 或 .dev.vars 中配置 SILICONFLOW_MODEL")
      return Response.json(
        { error: "SILICONFLOW_MODEL is not configured. Please set it in Cloudflare Worker variables." },
        { status: 500 }
      )
    }

    console.log("🤖 AI 配置:")
    console.log(`   - 模型: ${model}`)
    console.log(`   - API Key: configured`)
    console.log("")
    console.log("📤 正在发送请求到 SiliconFlow API...")

    const requestBody = {
      model: model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
      max_tokens: 2048,
      enable_thinking: false,
      thinking_budget: 4096,
      min_p: 0.05,
      stop: null,
      temperature: 0.7,
      top_p: 0.7,
      top_k: 50,
      frequency_penalty: 0.5,
      n: 1,
      response_format: {
        type: "text",
      },
    }

    const apiResponse = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    const requestDuration = Date.now() - startTime
    console.log(`⏱️  请求耗时: ${requestDuration}ms`)

    if (!apiResponse.ok) {
      const errorData = await apiResponse.text()
      console.error("❌ API 请求失败!")
      console.error(`   状态码: ${apiResponse.status} ${apiResponse.statusText}`)
      console.error(`   错误信息: ${errorData}`)
      throw new Error(`API request failed: ${apiResponse.status} ${apiResponse.statusText}`)
    }

    console.log("✅ API 请求成功!")
    const data = await apiResponse.json()
    
    // 提取生成的文本
    const headcanon = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || ""

    if (!headcanon) {
      console.error("❌ 响应中没有生成内容!")
      console.error("   完整响应:", JSON.stringify(data, null, 2))
      throw new Error("No content generated")
    }

    // 检查AI生成的内容是否包含不适当内容
    if (containsInappropriateContent(headcanon)) {
      console.log(`[${timestamp}] 🚫 检测到AI生成内容包含不适当内容 - 拒绝返回`)
      console.log(`   AI生成的内容包含不当内容，已拒绝返回`)
      return NextResponse.json(
        { error: "The generated content contains inappropriate, explicit, or illegal content. Please try again with different inputs." },
        { status: 400 }
      )
    }

    const totalDuration = Date.now() - startTime
    const headcanonLength = headcanon.length

    console.log("")
    console.log("📥 收到 AI 响应:")
    console.log(`   - 生成内容长度: ${headcanonLength} 字符`)
    console.log(`   - 总耗时: ${totalDuration}ms`)
    console.log("")
    console.log("📄 生成的内容预览:")
    console.log("-".repeat(80))
    console.log(headcanon.substring(0, 200) + (headcanon.length > 200 ? "..." : ""))
    console.log("-".repeat(80))

    // 解析生成的内容
    const parsed = parseHeadcanon(headcanon)
    const { coreIdea, development, moment } = parsed

    // 构建input_data JSON对象
    let inputData: any = {}
    const generationType = isRelationshipType ? "relationship" : "character"
    
    if (isRelationshipType) {
      // 关系类型: characterInput格式为 "Char1 and Char2 from Fandom. Context"
      let remainingInput = characterInput
      let context = ""
      
      // 提取context (在最后一个"."之后的内容)
      const lastDotIndex = remainingInput.lastIndexOf(".")
      if (lastDotIndex > 0 && lastDotIndex < remainingInput.length - 1) {
        context = remainingInput.substring(lastDotIndex + 1).trim()
        remainingInput = remainingInput.substring(0, lastDotIndex)
      }
      
      // 提取fandom (在" from "之后的内容)
      let fandom = ""
      const fromIndex = remainingInput.toLowerCase().lastIndexOf(" from ")
      if (fromIndex > 0) {
        fandom = remainingInput.substring(fromIndex + 6).trim()
        remainingInput = remainingInput.substring(0, fromIndex)
      }
      
      // 提取characters (剩余部分,用"and"或"&"分割)
      const characters = remainingInput.split(/\s+(?:and|&)\s+/i).map(c => c.trim()).filter(c => c)
      
      inputData = {
        characters: characters.length > 0 ? characters : [characterInput],
        fandom: fandom,
        relationshipType: headcanonType || "Relationship",
        tone: focusArea || "",
        length: length || "Medium",
        ...(context ? { context: context } : {}),
      }
    } else {
      // 角色类型: characterInput格式为 "CharacterName from Fandom. Context"
      let remainingInput = characterInput
      let context = ""
      
      // 提取context (在最后一个"."之后的内容)
      const lastDotIndex = remainingInput.lastIndexOf(".")
      if (lastDotIndex > 0 && lastDotIndex < remainingInput.length - 1) {
        context = remainingInput.substring(lastDotIndex + 1).trim()
        remainingInput = remainingInput.substring(0, lastDotIndex)
      }
      
      // 提取characterName和fandom
      const fromIndex = remainingInput.toLowerCase().indexOf(" from ")
      let characterName = remainingInput
      let fandom = ""
      if (fromIndex > 0) {
        characterName = remainingInput.substring(0, fromIndex).trim()
        fandom = remainingInput.substring(fromIndex + 6).trim()
      }
      
      inputData = {
        characterName: characterName,
        fandom: fandom,
        headcanonType: headcanonType || "",
        tone: focusArea || "",
        length: length || "Medium",
        ...(context ? { context: context } : {}),
      }
    }

    const userId = user.id

    const isPublic = shareToExplore === false ? 0 : 1

    let recordId: number | null = null
    let saveWarning: string | null = null
    try {
      console.log("💾 正在保存数据到 D1...")

      const result = await env.DB.prepare(
        `INSERT INTO headcanon_generations
         (user_id, type, input_data, core_idea, development, moment, is_favorite, is_deleted, is_public, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, datetime('now'))`
      )
        .bind(
          userId,
          generationType,
          JSON.stringify(inputData),
          coreIdea,
          development,
          moment,
          isPublic
        )
        .run()

      if (!result.success) {
        console.error("❌ D1 保存失败")
        saveWarning = "Generated successfully but failed to save to your history."
      } else {
        const idRow = await env.DB.prepare("SELECT last_insert_rowid() as id").first<{ id: number }>()
        recordId = idRow?.id ?? null
        console.log("✅ 数据已成功保存到 D1")
        if (recordId) console.log(`   记录 ID: ${recordId}`)
      }
    } catch (saveError) {
      console.error("❌ 保存数据时发生异常:", saveError)
      saveWarning = "Generated successfully but failed to save to your history."
    }

    console.log("=".repeat(80))
    console.log(`[${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false })}] ✅ 请求处理完成\n`)

    return Response.json({ headcanon, recordId, saveWarning })
  } catch (error) {
    const totalDuration = Date.now() - startTime
    console.error("")
    console.error("❌ 发生错误!")
    console.error(`   错误类型: ${error instanceof Error ? error.constructor.name : "Unknown"}`)
    console.error(`   错误信息: ${error instanceof Error ? error.message : String(error)}`)
    console.error(`   总耗时: ${totalDuration}ms`)
    if (error instanceof Error && error.stack) {
      console.error("   堆栈跟踪:")
      console.error(error.stack)
    }
    console.error("=".repeat(80))
    console.error(`[${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false })}] ❌ 请求处理失败\n`)
    
    return Response.json(
      {
        error: "Failed to generate headcanon. Please try again.",
      },
      { status: 500 }
    )
  }
}
