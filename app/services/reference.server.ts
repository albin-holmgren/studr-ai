import { prisma } from "~/db.server"
import { createEmbedding } from "~/lib/embeddings.server"

export async function findSimilarReferences(
  query: string,
  matchThreshold = 0.7,
  matchCount = 5
) {
  const queryEmbedding = await createEmbedding(query)

  // Using Prisma's raw query for vector similarity search
  const references = await prisma.$queryRaw`
    SELECT 
      id,
      title,
      content,
      authors,
      journal,
      year,
      1 - (embedding <=> float8[${queryEmbedding}]) as similarity
    FROM "Reference"
    WHERE 1 - (embedding <=> float8[${queryEmbedding}]) > ${matchThreshold}
    ORDER BY similarity DESC
    LIMIT ${matchCount}
  `

  return references
}

export async function createReference(data: {
  title: string
  authors: string[]
  content: string
  journal?: string
  year?: number
  volume?: string
  issue?: string
  pages?: string
  url?: string
}) {
  const embedding = await createEmbedding(data.content)

  return prisma.reference.create({
    data: {
      ...data,
      embedding,
    },
  })
}

export async function createCitation({
  noteId,
  referenceId,
  context,
}: {
  noteId: string
  referenceId: string
  context: string
}) {
  return prisma.citation.create({
    data: {
      noteId,
      referenceId,
      context,
    },
    include: {
      reference: true,
    },
  })
}

export async function getNoteCitations(noteId: string) {
  return prisma.citation.findMany({
    where: {
      noteId,
    },
    include: {
      reference: true,
    },
  })
}
