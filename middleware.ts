import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host")?.split(":")[0]

  if (hostname === "headcanonforge.com") {
    const url = request.nextUrl.clone()
    url.hostname = "www.headcanonforge.com"
    url.protocol = "https:"
    return NextResponse.redirect(url, 301)
  }

  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
