export async function POST(req: Request) {
  const startTime = Date.now()
  const timestamp = new Date().toLocaleString("zh-CN", { 
    timeZone: "Asia/Shanghai",
    hour12: false 
  })

  try {
    const { headcanonType, focusArea, characterInput } = await req.json()

    console.log("\n" + "=".repeat(80))
    console.log(`[${timestamp}] 🚀 收到新的 Headcanon 生成请求`)
    console.log("=".repeat(80))
    console.log("📝 请求参数:")
    console.log(`   - 类型 (Type): ${headcanonType}`)
    console.log(`   - 焦点 (Focus): ${focusArea}`)
    console.log(`   - 角色描述: ${characterInput.substring(0, 100)}${characterInput.length > 100 ? "..." : ""}`)
    console.log("")

    const prompt = `You are a creative writing assistant that generates fictional headcanon ideas for characters. 

Generate a headcanon based on the following:
- Type: ${headcanonType}
- Focus: ${focusArea}
- Character/Situation: ${characterInput}

Write a creative, engaging, and story-driven headcanon in 2-4 paragraphs. The headcanon should:
- Feel like a fan-created personal interpretation
- Be written in natural, engaging English
- Be fictional and imaginative
- Be safe-for-work and appropriate
- Avoid referencing real people
- Include specific details that make it feel authentic and believable

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

    const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    const requestDuration = Date.now() - startTime
    console.log(`⏱️  请求耗时: ${requestDuration}ms`)

    if (!response.ok) {
      const errorData = await response.text()
      console.error("❌ API 请求失败!")
      console.error(`   状态码: ${response.status} ${response.statusText}`)
      console.error(`   错误信息: ${errorData}`)
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    console.log("✅ API 请求成功!")
    const data = await response.json()
    
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
