import { json, type ActionFunctionArgs } from "@remix-run/node"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { db } from "~/lib/db.server"
import ogs from 'open-graph-scraper'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { getEmojiForContent } from "~/services/ai-emoji.server"

interface UrlMetadata {
  title?: string
  description?: string
  image?: string
  siteName?: string
  type?: string
  url: string
  content?: string
  author?: string
  publishedTime?: string
}

async function fetchUrlContent(url: string): Promise<string> {
  try {
    const response = await axios.get(url)
    const $ = cheerio.load(response.data)
    
    // Remove script tags, style tags, and comments
    $('script').remove()
    $('style').remove()
    $('noscript').remove()
    $('iframe').remove()
    
    // For Wikipedia specifically, get the main content
    if (url.includes('wikipedia.org')) {
      const content = $('#mw-content-text').text()
      return content.trim()
    }
    
    // For other sites, get the main content
    // Remove navigation, header, footer, and other non-content elements
    $('nav').remove()
    $('header').remove()
    $('footer').remove()
    $('.header').remove()
    $('.footer').remove()
    $('.navigation').remove()
    $('.nav').remove()
    $('.sidebar').remove()
    $('.menu').remove()
    $('.ad').remove()
    $('.advertisement').remove()
    
    // Get the remaining text content
    const content = $('body').text()
    return content.trim()
  } catch (error) {
    console.error("Error fetching page content:", error)
    return ""
  }
}

async function fetchUrlMetadata(url: string): Promise<UrlMetadata> {
  try {
    const [{ result }, content] = await Promise.all([
      ogs({ url }),
      fetchUrlContent(url)
    ])

    // Extract author and date from meta tags
    let author = result.author || result.ogArticleAuthor || result.twitterCreator
    let publishedTime = result.articlePublishedTime || result.ogArticlePublishedTime

    // If no author found, try to get it from schema.org data
    if (!author && result.jsonLD) {
      const jsonLD = Array.isArray(result.jsonLD) ? result.jsonLD[0] : result.jsonLD
      author = jsonLD.author?.name || jsonLD.creator?.name
      publishedTime = publishedTime || jsonLD.datePublished || jsonLD.dateCreated
    }

    return {
      title: result.ogTitle || result.twitterTitle || result.dcTitle || result.title,
      description: result.ogDescription || result.twitterDescription || result.dcDescription || result.description,
      image: result.ogImage?.[0]?.url || result.twitterImage?.[0]?.url,
      siteName: result.ogSiteName,
      type: result.ogType,
      url: url,
      content: content,
      author: author,
      publishedTime: publishedTime
    }
  } catch (error) {
    console.error("Error fetching metadata:", error)
    const content = await fetchUrlContent(url)
    return { url, content }
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const response = new Response()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { request, response }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Response("Unauthorized", { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email! },
  })

  if (!user) {
    throw new Response("User not found", { status: 404 })
  }

  const formData = await request.formData()
  const sourceId = formData.get("sourceId") as string
  const url = formData.get("url") as string

  console.log("API Route - Received URL:", url)
  console.log("API Route - Source ID:", sourceId)

  if (!url) {
    throw new Response("No URL provided", { status: 400 })
  }

  try {
    // Validate URL
    new URL(url)
  } catch (error) {
    throw new Response("Invalid URL", { status: 400 })
  }

  // Fetch metadata
  console.log("API Route - Fetching metadata for URL:", url)
  const metadata = await fetchUrlMetadata(url)
  console.log("API Route - Fetched metadata:", metadata)

  // Get AI-selected emoji based on content
  const initialEmoji = await getEmojiForContent(metadata.title || "", metadata.content || "")
  console.log("AI-selected emoji for content:", initialEmoji)

  const source = await db.libraryItem.update({
    where: {
      id: sourceId,
      userId: user.id,
    },
    data: {
      title: metadata.title || "Untitled Website",
      content: JSON.stringify({
        ...metadata,
        type: "url",
      }),
      fileName: url,
      fileType: "url",
      emoji: initialEmoji,
      updatedAt: new Date(),
    },
  })

  return json(source, {
    headers: response.headers,
  })
}
