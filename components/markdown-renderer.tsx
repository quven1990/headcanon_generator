"use client"

import { ReactNode } from "react"

interface MarkdownRendererProps {
  content: string
}

// 简单的 markdown 渲染器
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const lines = content.split('\n')
  const elements: ReactNode[] = []
  let currentParagraph: string[] = []
  let inList = false
  let listItems: string[] = []

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ')
      if (text.trim()) {
        elements.push(
          <p key={elements.length} className="mb-4 text-gray-700 leading-relaxed">
            {renderInlineMarkdown(text)}
          </p>
        )
      }
      currentParagraph = []
    }
  }

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={elements.length} className="list-disc list-inside mb-4 space-y-2 text-gray-700">
          {listItems.map((item, idx) => (
            <li key={idx}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      )
      listItems = []
      inList = false
    }
  }

  const renderInlineMarkdown = (text: string): ReactNode => {
    if (!text) return text
    
    const parts: ReactNode[] = []
    let keyIndex = 0
    
    // 先处理链接，再处理粗体，避免冲突
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    const boldRegex = /\*\*(.+?)\*\*/g
    
    // 找到所有匹配项（链接和粗体）
    const matches: Array<{ type: 'link' | 'bold', start: number, end: number, content: string, url?: string }> = []
    
    let match
    while ((match = linkRegex.exec(text)) !== null) {
      matches.push({
        type: 'link',
        start: match.index,
        end: match.index + match[0].length,
        content: match[1],
        url: match[2],
      })
    }
    
    while ((match = boldRegex.exec(text)) !== null) {
      matches.push({
        type: 'bold',
        start: match.index,
        end: match.index + match[0].length,
        content: match[1],
      })
    }
    
    // 按位置排序
    matches.sort((a, b) => a.start - b.start)
    
    // 移除重叠的匹配（保留第一个）
    const filteredMatches: typeof matches = []
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i]
      const overlaps = filteredMatches.some(m => 
        (current.start >= m.start && current.start < m.end) ||
        (current.end > m.start && current.end <= m.end) ||
        (current.start <= m.start && current.end >= m.end)
      )
      if (!overlaps) {
        filteredMatches.push(current)
      }
    }
    
    // 构建结果
    let lastIndex = 0
    filteredMatches.forEach((match) => {
      // 添加之前的文本
      if (match.start > lastIndex) {
        const beforeText = text.substring(lastIndex, match.start)
        if (beforeText) {
          parts.push(beforeText)
        }
      }
      
      // 添加匹配的内容
      if (match.type === 'link' && match.url) {
        const isExternal = match.url.startsWith('http')
        const rel = isExternal ? "noopener noreferrer nofollow" : undefined
        parts.push(
          <a
            key={`link-${keyIndex++}`}
            href={match.url}
            className="text-blue-600 hover:text-blue-800 underline"
            {...(isExternal ? { target: "_blank", rel } : {})}
          >
            {match.content}
          </a>
        )
      } else if (match.type === 'bold') {
        parts.push(
          <strong key={`bold-${keyIndex++}`} className="font-semibold text-gray-900">
            {match.content}
          </strong>
        )
      }
      
      lastIndex = match.end
    })
    
    // 添加剩余的文本
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }
    
    return parts.length > 0 ? <>{parts}</> : text
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim()

    // 处理标题
    if (trimmed.startsWith('# ')) {
      flushParagraph()
      flushList()
      elements.push(
        <h1 key={elements.length} className="text-3xl font-bold text-gray-900 mb-4 mt-8">
          {trimmed.substring(2)}
        </h1>
      )
      return
    }
    if (trimmed.startsWith('## ')) {
      flushParagraph()
      flushList()
      elements.push(
        <h2 key={elements.length} className="text-2xl font-semibold text-gray-900 mb-3 mt-6">
          {trimmed.substring(3)}
        </h2>
      )
      return
    }
    if (trimmed.startsWith('### ')) {
      flushParagraph()
      flushList()
      elements.push(
        <h3 key={elements.length} className="text-xl font-semibold text-gray-900 mb-2 mt-4">
          {trimmed.substring(4)}
        </h3>
      )
      return
    }
    if (trimmed.startsWith('#### ')) {
      flushParagraph()
      flushList()
      elements.push(
        <h4 key={elements.length} className="text-lg font-semibold text-gray-900 mb-2 mt-4">
          {trimmed.substring(5)}
        </h4>
      )
      return
    }

    // 处理图片 ![alt](url)
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/
    const imageMatch = trimmed.match(imageRegex)
    if (imageMatch) {
      flushParagraph()
      flushList()
      const altText = imageMatch[1] || "Image"
      const imageUrl = imageMatch[2]
      elements.push(
        <img
          key={elements.length}
          src={imageUrl}
          alt={altText}
          className="my-6 rounded-lg shadow-md max-w-full h-auto"
          loading="lazy"
        />
      )
      return
    }

    // 处理列表项
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushParagraph()
      inList = true
      listItems.push(trimmed.substring(2))
      return
    }

    // 处理空行
    if (trimmed === '') {
      flushParagraph()
      flushList()
      return
    }

    // 普通段落
    if (inList) {
      flushList()
    }
    currentParagraph.push(trimmed)
  })

  flushParagraph()
  flushList()

  return <div className="prose prose-lg max-w-none">{elements}</div>
}

