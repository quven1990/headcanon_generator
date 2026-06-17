import { NextRequest, NextResponse } from "next/server"
import { getAuthEnv } from "@/lib/auth/env"

function parseInputData(raw: string) {
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function mapGenerationRow(row: Record<string, unknown>) {
  return {
    ...row,
    input_data: typeof row.input_data === "string" ? parseInputData(row.input_data) : row.input_data,
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "12", 10)
    const offset = (page - 1) * limit

    const env = await getAuthEnv()

    const countRow = await env.DB.prepare(
      "SELECT COUNT(*) as total FROM headcanon_generations WHERE is_deleted = 0"
    ).first<{ total: number }>()

    const total = countRow?.total ?? 0
    const totalPages = Math.ceil(total / limit)

    const { results } = await env.DB.prepare(
      `SELECT id, user_id, type, input_data, core_idea, development, moment,
              is_favorite, is_deleted, created_at
       FROM headcanon_generations
       WHERE is_deleted = 0
       ORDER BY datetime(created_at) DESC
       LIMIT ? OFFSET ?`
    )
      .bind(limit, offset)
      .all<Record<string, unknown>>()

    return NextResponse.json({
      data: (results || []).map(mapGenerationRow),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    })
  } catch (error) {
    console.error("Explore API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
