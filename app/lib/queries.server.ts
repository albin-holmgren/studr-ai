import { createServerClient } from "@supabase/auth-helpers-remix"
import type { Database } from "./database.types"
import { prisma } from "./prisma.server"

export async function getDocuments(request: Request) {
  const response = new Response()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { request, response }
  )

  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user) {
    return { documents: [], response }
  }

  const documents = await prisma.document.findMany({
    where: {
      userId: session.user.id,
      isArchived: false
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  return { documents, response }
}

export async function getWorkspaces(request: Request) {
  const response = new Response()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { request, response }
  )

  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user) {
    return { workspaces: [], response }
  }

  const documents = await prisma.document.findMany({
    where: {
      userId: session.user.id,
      parentId: null,
      isArchived: false
    },
    include: {
      children: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return { workspaces: documents, response }
}

export async function getUserProfile(request: Request, userId: string) {
  const response = new Response()
  
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  })

  return { profile: user, response }
}