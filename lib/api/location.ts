export type GeoResult = {
  id: string
  name: string
  city?: string
  country?: string
}

const flagFromCountryCode = (code?: string) => {
  if (!code) return ""
  const cc = code.toUpperCase()
  return cc.replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)))
}

const norm = (s: string) => s.toLowerCase().trim()
const levenshtein = (a: string, b: string) => {
  const aa = a.split("")
  const bb = b.split("")
  const m = Array(bb.length + 1).fill(0).map(() => Array(aa.length + 1).fill(0))
  for (let i = 0; i <= aa.length; i++) m[0][i] = i
  for (let j = 0; j <= bb.length; j++) m[j][0] = j
  for (let j = 1; j <= bb.length; j++) {
    for (let i = 1; i <= aa.length; i++) {
      const cost = aa[i - 1] === bb[j - 1] ? 0 : 1
      m[j][i] = Math.min(m[j - 1][i] + 1, m[j][i - 1] + 1, m[j - 1][i - 1] + cost)
    }
  }
  return m[bb.length][aa.length]
}
type Prefs = { country?: string }
const relevanceScore = (q: string, item: GeoResult, prefs?: Prefs) => {
  const nq = norm(q)
  const city = norm(item.city || "")
  const country = norm(item.country || "")
  let score = 0
  if (city.startsWith(nq)) score += 6
  else if (city.includes(nq)) score += 4
  if (country.includes(nq)) score += 1
  const lv = levenshtein(city.slice(0, Math.max(city.length, nq.length)), nq)
  const denom = Math.max(city.length, nq.length) || 1
  score += 3 * (1 - Math.min(1, lv / denom))
  if (prefs?.country && country === norm(prefs.country)) score += 2
  return score
}

export async function geocodeForward(query: string, prefs?: Prefs): Promise<GeoResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=10&q=${encodeURIComponent(query)}`
  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "persona-cv/1.0"
    }
  })
  if (!res.ok) throw new Error(`Geocode failed ${res.status}`)
  const data: any[] = await res.json()
  const items: GeoResult[] = data.map((d) => {
    const addr = d.address || {}
    const city = addr.city || addr.town || addr.village || addr.hamlet || ""
    const country = addr.country || ""
    return {
      id: String(d.place_id),
      name: [city, country].filter(Boolean).join(", "),
      city,
      country,
    }
  })
  const ranked = items
    .map((it) => ({ it, score: relevanceScore(query, it, prefs) }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.it)
  return ranked
}

// Removed timezone enrichment; only city and country are returned as requested.

export async function geocodeForwardFull(query: string): Promise<Array<{ id: string; city: string; country: string; lat: number; lon: number; name: string }>> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=10&q=${encodeURIComponent(query)}`
  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "persona-cv/1.0"
    }
  })
  if (!res.ok) throw new Error(`Geocode failed ${res.status}`)
  const data: any[] = await res.json()
  return data.map((d) => {
    const addr = d.address || {}
    const city = addr.city || addr.town || addr.village || addr.hamlet || ""
    const country = addr.country || ""
    const lat = Number(d.lat)
    const lon = Number(d.lon)
    return {
      id: String(d.place_id),
      city,
      country,
      lat,
      lon,
      name: [city, country].filter(Boolean).join(", "),
    }
  })
}

export async function reverseGeocode(lat: number, lon: number): Promise<{ city: string; country: string; name: string }> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`
  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "persona-cv/1.0"
    }
  })
  if (!res.ok) throw new Error(`Reverse geocode failed ${res.status}`)
  const d: any = await res.json()
  const addr = d.address || {}
  const city = addr.city || addr.town || addr.village || addr.hamlet || ""
  const country = addr.country || ""
  return {
    city,
    country,
    name: [city, country].filter(Boolean).join(", "),
  }
}
