import type { StyleSpecification } from 'maplibre-gl'

/**
 * Registry of map styles served from `public/<folder>/style.json`.
 * Add an entry per folder under `public/` and set center (lng, lat) + zoom for each.
 */
export interface MapStyleDefinition {
  /** Stable id for v-model / routing */
  id: string
  /** Label shown in the style picker */
  label: string
  /** Folder name under `public/` containing `style.json` and assets */
  publicFolder: string
  /** Initial camera when this style is selected [lng, lat] */
  center: [number, number]
  zoom: number
}

export const MAP_STYLES: readonly MapStyleDefinition[] = [
  {
    id: 'macos3',
    label: 'MacOS 3',
    publicFolder: 'MacOS3',
    center: [-122.009008,37.334833],
    zoom: 14,
  },
]

/** URL to a style JSON, respecting Vite `base` when deployed under a subpath */
export function styleJsonUrl(publicFolder: string): string {
  const base = import.meta.env.BASE_URL
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${publicFolder}/style.json`
}

export function styleById(id: string): MapStyleDefinition | undefined {
  return MAP_STYLES.find((s) => s.id === id)
}

/**
 * Expands `{host}` and `{style_name}` in sprite/glyphs so URLs are absolute before MapLibre
 * validates them. `transformRequest` runs too late for sprites (see normalizeSpriteURL).
 */
function replaceStylePlaceholders(s: string, publicFolder: string): string {
  const base = import.meta.env.BASE_URL
  const pathPrefix = base === '/' || base === '' ? '' : base.replace(/\/$/, '')
  const host = `${window.location.origin}${pathPrefix}`
  return s
    .replace(/\{host\}/g, host)
    .replace(/\{style_name\}/g, publicFolder)
}

export function expandPublicPlaceholdersInStyle(
  style: StyleSpecification,
  publicFolder: string,
): StyleSpecification {
  const next = { ...style } as Record<string, unknown>

  if (typeof next.sprite === 'string') {
    next.sprite = replaceStylePlaceholders(next.sprite, publicFolder)
  } else if (Array.isArray(next.sprite)) {
    next.sprite = next.sprite.map((entry: unknown) => {
      if (typeof entry === 'string') {
        return replaceStylePlaceholders(entry, publicFolder)
      }
      if (
        entry &&
        typeof entry === 'object' &&
        'url' in entry &&
        typeof (entry as { url: unknown }).url === 'string'
      ) {
        const e = entry as { id: string; url: string }
        return { ...e, url: replaceStylePlaceholders(e.url, publicFolder) }
      }
      return entry
    })
  }

  if (typeof next.glyphs === 'string') {
    next.glyphs = replaceStylePlaceholders(next.glyphs, publicFolder)
  }

  return next as StyleSpecification
}

/** Pass to `map.setStyle(url, { transformStyle: … })` — not supported on `new Map({ style })` alone. */
export function styleTransformForFolder(publicFolder: string) {
  return (_previous: StyleSpecification | undefined, next: StyleSpecification) =>
    expandPublicPlaceholdersInStyle(next, publicFolder)
}
