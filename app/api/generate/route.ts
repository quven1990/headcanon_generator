import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const timestamp = new Date().toLocaleString("zh-CN", { 
    timeZone: "Asia/Shanghai",
    hour12: false 
  })

  try {
    // 在 API 路由中，需要使用 NextRequest 来创建 Supabase 客户端
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.log(`[${timestamp}] ❌ Supabase 环境变量未配置`)
      return NextResponse.json(
        { error: "Server configuration error. Please contact support." },
        { status: 500 }
      )
    }

    let supabaseResponse = NextResponse.next({
      request: {
        headers: req.headers,
      },
    })

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // 检查用户是否已登录（服务器端验证）
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log(`[${timestamp}] ❌ 未授权访问 - 用户未登录`)
      console.log(`   错误信息: ${authError?.message || 'No user found'}`)
      return NextResponse.json(
        { error: "Authentication required. Please sign in to generate headcanons." },
        { status: 401 }
      )
    }

    console.log(`[${timestamp}] ✅ 用户已登录: ${user.email}`)

    // 读取请求体（需要在验证之后）
    const body = await req.json()
    const { headcanonType, focusArea, characterInput, length } = body

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

Format your response EXACTLY as follows (use \\n\\n to separate sections):
Core Idea: [your core idea here]

Development: [your development here]

Moment: [your moment here]

Generate the headcanon now:`

    // 从环境变量获取 API Key 和模型，必须配置
    const apiKey = process.env.SILICONFLOW_API_KEY
    const model = process.env.SILICONFLOW_MODEL

    if (!apiKey) {
      console.error("❌ 错误: SILICONFLOW_API_KEY 未配置!")
      console.error("   请在 .env.local 文件中配置 SILICONFLOW_API_KEY")
      return Response.json(
        { error: "SILICONFLOW_API_KEY is not configured. Please set it in .env.local" },
        { status: 500 }
      )
    }

    if (!model) {
      console.error("❌ 错误: SILICONFLOW_MODEL 未配置!")
      console.error("   请在 .env.local 文件中配置 SILICONFLOW_MODEL")
      return Response.json(
        { error: "SILICONFLOW_MODEL is not configured. Please set it in .env.local" },
        { status: 500 }
      )
    }

    console.log("🤖 AI 配置:")
    console.log(`   - 模型: ${model}`)
    console.log(`   - API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`)
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
    console.log("=".repeat(80))
    console.log(`[${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false })}] ✅ 请求处理完成\n`)

    return Response.json({ headcanon })
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
        error: error instanceof Error ? error.message : "Failed to generate headcanon" 
      }, 
      { status: 500 }
    )
  }
}
