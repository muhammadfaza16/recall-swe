export type QA = {
  q: string
  a: string
}

export type Topic = {
  id: string
  title: string
  depth: string
  content: string
  why: string
  mistake: string
  interview: QA[]
  code: string
  image?: string
}

export type Pillar = {
  id: string
  title: string
  topics: Topic[]
}
