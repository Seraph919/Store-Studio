import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { ViewportMode } from './EditorTopBar'

const WIDTHS = { desktop: 1280, tablet: 768, mobile: 390 }

/** The iframe has a real CSS viewport; portals keep the existing app providers. */
export function PreviewFrame({ viewport, children }: { viewport: ViewportMode; children: ReactNode }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [doc, setDoc] = useState<Document | null>(null)
  useEffect(() => {
    if (!doc) return
    const syncStyles = () => {
      doc.head.querySelectorAll('[data-preview-style]').forEach(node => node.remove())
      document.head.querySelectorAll('style, link[rel="stylesheet"]').forEach(node => {
        const copy = node.cloneNode(true) as HTMLElement
        copy.setAttribute('data-preview-style', '')
        doc.head.append(copy)
      })
    }
    syncStyles()
    const observer = new MutationObserver(syncStyles)
    observer.observe(document.head, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [doc])
  return <iframe ref={frame} title="Store preview" className="studio-preview-frame"
    style={{ width: WIDTHS[viewport] }} sandbox="allow-same-origin"
    srcDoc={'<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="preview-root"></div></body></html>'}
    onLoad={() => setDoc(frame.current?.contentDocument ?? null)}>
    {doc?.getElementById('preview-root') && createPortal(children, doc.getElementById('preview-root')!)}
  </iframe>
}
