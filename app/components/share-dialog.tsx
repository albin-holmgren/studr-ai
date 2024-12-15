"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Copy, Mail, Twitter, Facebook, Linkedin, Instagram, Youtube } from "lucide-react"
import { toast } from "sonner"

// Custom X (Twitter) icon component
const XIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4"
    fill="currentColor"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

// Custom TikTok icon component
const TikTokIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4"
    fill="currentColor"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

// Custom Reddit icon component
const RedditIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4"
    fill="currentColor"
  >
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
  </svg>
)

export function ShareDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [email, setEmail] = React.useState("")
  const inviteLink = "https://studr.ai/invite/xyz123" // Replace with actual invite link generation

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      toast.success("Invite link copied to clipboard!")
    } catch (err) {
      toast.error("Failed to copy invite link")
    }
  }

  const shareToSocial = (platform: string) => {
    const text = "Join me on Studr.ai - The AI-powered study platform!"
    const url = encodeURIComponent(inviteLink)
    
    let shareUrl = ""
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
        break
      case "reddit":
        shareUrl = `https://www.reddit.com/submit?url=${url}&title=${encodeURIComponent(text)}`
        break
      case "instagram":
        // Instagram doesn't have a direct share URL, open stories in new tab
        toast.info("Open Instagram Stories and paste your copied link!", {
          description: "Your invite link has been copied to clipboard."
        })
        navigator.clipboard.writeText(inviteLink)
        window.open("https://instagram.com", "_blank")
        return
      case "youtube":
        // YouTube doesn't have a direct share URL, but we can open YouTube
        toast.info("Share your invite link in your next video description!", {
          description: "Your invite link has been copied to clipboard."
        })
        navigator.clipboard.writeText(inviteLink)
        window.open("https://studio.youtube.com", "_blank")
        return
      case "tiktok":
        // TikTok doesn't have a direct share URL, but we can open TikTok
        toast.info("Share your invite link in your next TikTok bio!", {
          description: "Your invite link has been copied to clipboard."
        })
        navigator.clipboard.writeText(inviteLink)
        window.open("https://www.tiktok.com/upload", "_blank")
        return
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400")
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    // Add your invite logic here
    toast.success("Invitation sent!")
    setEmail("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Friends</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <form onSubmit={handleInvite} className="grid gap-4">
            <div className="flex gap-2">
              <Input
                placeholder="friend@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" className="shrink-0">
                <Mail className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or share via
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 justify-items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => shareToSocial("twitter")}
              className="hover:bg-[#1DA1F2] hover:text-white"
            >
              <Twitter className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => shareToSocial("x")}
              className="hover:bg-black hover:text-white"
            >
              <XIcon />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => shareToSocial("facebook")}
              className="hover:bg-[#4267B2] hover:text-white"
            >
              <Facebook className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => shareToSocial("linkedin")}
              className="hover:bg-[#0077B5] hover:text-white"
            >
              <Linkedin className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => shareToSocial("instagram")}
              className="hover:bg-[#E4405F] hover:text-white"
            >
              <Instagram className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => shareToSocial("youtube")}
              className="hover:bg-[#FF0000] hover:text-white"
            >
              <Youtube className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => shareToSocial("tiktok")}
              className="hover:bg-black hover:text-white"
            >
              <TikTokIcon />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => shareToSocial("reddit")}
              className="hover:bg-[#FF4500] hover:text-white"
            >
              <RedditIcon />
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or copy link
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              readOnly
              value={inviteLink}
              className="flex-1"
            />
            <Button onClick={copyToClipboard} variant="secondary" className="shrink-0">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
