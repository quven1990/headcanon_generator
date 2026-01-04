"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

// 延迟加载 GoogleLoginButton，避免阻塞初始渲染
const GoogleLoginButton = dynamic(
  () => import("./google-login-button").then((mod) => ({ default: mod.GoogleLoginButton })),
  {
    ssr: false, // 不在服务端渲染，减少初始 bundle
    loading: () => (
      <div className="h-9 w-20 animate-pulse rounded-md bg-gray-100" />
    ),
  }
)

export function GoogleLoginButtonLazy() {
  return (
    <Suspense fallback={<div className="h-9 w-20 animate-pulse rounded-md bg-gray-100" />}>
      <GoogleLoginButton />
    </Suspense>
  )
}

