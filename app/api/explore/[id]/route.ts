import { NextRequest, NextResponse } from "next/server"
import { getDbEnv } from "@/lib/auth/env"

function parseInputData(raw: string) {
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const recordId = parseInt(id, 10)

    if (isNaN(recordId)) {
      return NextResponse.json({ error: "Invalid record ID" }, { status: 400 })
    }

    const env = await getDbEnv()

    const row = await env.DB.prepare(
      `SELECT id, user_id, type, input_data, core_idea, development, moment,
              is_favorite, is_deleted, created_at
       FROM headcanon_generations
       WHERE id = ? AND is_deleted = 0`
    )
      .bind(recordId)
      .first<Record<string, unknown>>()

    if (!row) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 })
    }

    return NextResponse.json({
      data: {
        ...row,
        input_data:
          typeof row.input_data === "string" ? parseInputData(row.input_data) : row.input_data,
      },
    })
  } catch (error) {
    console.error("Explore detail API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
