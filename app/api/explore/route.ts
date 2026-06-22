import { NextRequest, NextResponse } from "next/server"
import { getDbEnv } from "@/lib/auth/env"

const MAX_PAGE_LIMIT = 50

function parseInputData(raw: string) {
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function mapGenerationRow(row: Record<string, unknown>) {
  const { user_id: _userId, ...publicFields } = row
  return {
    ...publicFields,
    input_data:
      typeof publicFields.input_data === "string"
        ? parseInputData(publicFields.input_data)
        : publicFields.input_data,
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(
      MAX_PAGE_LIMIT,
      Math.max(1, parseInt(searchParams.get("limit") || "12", 10))
    )
    const offset = (page - 1) * limit

    const env = await getDbEnv()

    const countRow = await env.DB.prepare(
      "SELECT COUNT(*) as total FROM headcanon_generations WHERE is_deleted = 0 AND is_public = 1"
    ).first<{ total: number }>()

    const total = countRow?.total ?? 0
    const totalPages = Math.ceil(total / limit)

    const { results } = await env.DB.prepare(
      `SELECT id, type, input_data, core_idea, development, moment,
              is_favorite, is_deleted, is_public, created_at
       FROM headcanon_generations
       WHERE is_deleted = 0 AND is_public = 1
       ORDER BY datetime(created_at) DESC
       LIMIT ? OFFSET ?`
    )
      .bind(limit, offset)
      .all<Record<string, unknown>>()

    return NextResponse.json(
      {
        data: (results || []).map(mapGenerationRow),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    )
  } catch (error) {
    console.error("Explore API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
