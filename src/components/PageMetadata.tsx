import { useLayoutEffect } from 'react'

interface PageMetadataProps {
  title: string
  description: string
  canonicalPath: string
  imagePath?: string
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.content = content
}

export default function PageMetadata({ title, description, canonicalPath, imagePath = '/romanus-social.jpg' }: PageMetadataProps) {
  useLayoutEffect(() => {
    const canonicalUrl = new URL(canonicalPath, window.location.origin).toString()
    const imageUrl = new URL(imagePath, window.location.origin).toString()
    document.title = title
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:site_name', 'ROMANUS')
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', canonicalUrl)
    upsertMeta('property', 'og:image', imageUrl)
    upsertMeta('property', 'og:image:width', '1200')
    upsertMeta('property', 'og:image:height', '630')
    upsertMeta('property', 'og:image:alt', 'ROMANUS — herramientas jurídicas claras para México')
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:image', imageUrl)
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description)

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = canonicalUrl

    return () => {
      const defaultTitle = 'ROMANUS — Soluciones integrales para el ámbito jurídico, empresarial y personal'
      const defaultDescription =
        'ROMANUS es una plataforma de soluciones para el ámbito jurídico, empresarial y personal. Su primer producto, Laboral Suite, calcula finiquito y liquidación conforme a la Ley Federal del Trabajo.'
      const defaultUrl = new URL('/', window.location.origin).toString()
      document.title = defaultTitle
      upsertMeta('name', 'description', defaultDescription)
      upsertMeta('property', 'og:title', 'ROMANUS — Herramientas jurídicas claras')
      upsertMeta('property', 'og:description', defaultDescription)
      upsertMeta('property', 'og:url', defaultUrl)
      upsertMeta('name', 'twitter:title', 'ROMANUS — Herramientas jurídicas claras')
      upsertMeta('name', 'twitter:description', defaultDescription)
      canonical.href = defaultUrl
    }
  }, [title, description, canonicalPath, imagePath])

  return null
}
