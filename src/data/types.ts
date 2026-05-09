export type QA = {
  q: string
  a: string
}

export type Topic = {
  id: string
  title: string
  depth: string
  content: string
  content_casual?: string
  why: string
  why_casual?: string
  mistake: string
  mistake_casual?: string
  interview: QA[]
  code: string
  image?: string
}

export type Pillar = {
  id: string
  title: string
  topics: Topic[]
}
