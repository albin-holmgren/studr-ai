import * as React from "react"
import { Bot, ChevronDown, Lightbulb, Sparkles, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useFetcher } from "@remix-run/react"

import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import { cn } from "~/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible"
import { useDebounce } from "~/hooks/use-debounce"

interface Suggestion {
  id: string
  type: "improvement" | "insight" | "enhancement"
  title: string
  content: {
    summary: string
    highlights: string[]
  }
}

interface SuggestionsProps {
  content: string
  noteId: string
  className?: string
}

function getLetterGradeStyle(grade: string): string {
  switch (grade) {
    case 'A':
      return 'text-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/20'
    case 'B':
      return 'text-blue-500 bg-blue-500/5 ring-1 ring-blue-500/20'
    case 'C':
      return 'text-amber-500 bg-amber-500/5 ring-1 ring-amber-500/20'
    case 'D':
      return 'text-orange-500 bg-orange-500/5 ring-1 ring-orange-500/20'
    case 'F':
      return 'text-red-500 bg-red-500/5 ring-1 ring-red-500/20'
    default:
      return 'text-primary bg-primary/5 ring-1 ring-primary/20'
  }
}

function getLetterGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

export function Suggestions({ content, noteId, className }: SuggestionsProps) {
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([])
  const [loading, setLoading] = React.useState(false)
  const [score, setScore] = React.useState(0)
  const [openSuggestion, setOpenSuggestion] = React.useState<string | null>(null)
  const letterGrade = getLetterGrade(score)
  const gradeStyle = getLetterGradeStyle(letterGrade)
  const fetcher = useFetcher()
  const debouncedContent = useDebounce(content, 1000)

  React.useEffect(() => {
    if (!debouncedContent.trim()) {
      setSuggestions([])
      setScore(0)
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append("noteId", noteId)
    formData.append("content", debouncedContent)

    fetcher.submit(formData, {
      method: "post",
      action: "/api/note/suggestions"
    })
  }, [debouncedContent, noteId, fetcher])

  React.useEffect(() => {
    if (fetcher.data && !fetcher.data.error) {
      setSuggestions(fetcher.data.suggestions || [])
      setScore(fetcher.data.score || 0)
      setOpenSuggestion(fetcher.data.suggestions?.[0]?.id || null)
      setLoading(false)
    }
  }, [fetcher.data])

  if (loading || fetcher.state === "submitting") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("p-6", className)}
      >
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <p className="font-medium">Analyzing your content...</p>
        </div>
      </motion.div>
    )
  }

  return (
    <ScrollArea className={cn("h-[calc(100vh-12rem)]", className)}>
      <div className="space-y-6 p-6">
        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 p-6 shadow-sm"
        >
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
          <div className="relative flex items-center justify-between">
            <div className="space-y-1">
              <motion.p 
                className="text-3xl font-bold tracking-tight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                {score}%
              </motion.p>
              <motion.p 
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                Content Score
              </motion.p>
            </div>
            <motion.div 
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full shadow-sm transition-colors",
                gradeStyle
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.4 
              }}
            >
              <span className="text-2xl font-bold">{letterGrade}</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Suggestions List or Empty State */}
        {suggestions.length > 0 ? (
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * (index + 2) }}
              >
                <Collapsible
                  open={openSuggestion === suggestion.id}
                  onOpenChange={(open) => setOpenSuggestion(open ? suggestion.id : null)}
                >
                  <div className="overflow-hidden rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 shadow-sm transition-colors hover:from-muted/60 hover:to-muted/40">
                    <CollapsibleTrigger className="flex w-full items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="rounded-full bg-background/80 p-2 shadow-sm"
                        >
                          {suggestion.type === "improvement" && (
                            <Sparkles className="h-4 w-4 text-blue-500" />
                          )}
                          {suggestion.type === "insight" && (
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                          )}
                          {suggestion.type === "enhancement" && (
                            <Bot className="h-4 w-4 text-emerald-500" />
                          )}
                        </motion.div>
                        <div className="space-y-1 text-left">
                          <span className="block text-sm font-medium">
                            {suggestion.title}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
                          </span>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: openSuggestion === suggestion.id ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-4 shrink-0"
                      >
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </motion.div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <AnimatePresence>
                        {openSuggestion === suggestion.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-border/50 bg-gradient-to-br from-background/50 to-background/80"
                          >
                            <div className="space-y-4 p-4">
                              <p className="text-sm text-muted-foreground">
                                {suggestion.content.summary}
                              </p>
                              <div className="space-y-2.5">
                                {suggestion.content.highlights.map((highlight, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-2 text-sm"
                                  >
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                                    <span className="font-medium text-primary">
                                      {highlight}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <motion.div 
                                className="flex gap-2 pt-2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                              >
                                <Button 
                                  size="sm" 
                                  className="relative w-full overflow-hidden bg-primary/10 text-primary hover:bg-primary/20"
                                >
                                  <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0"
                                    animate={{
                                      x: ["0%", "200%"],
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      ease: "linear",
                                    }}
                                  />
                                  <span className="relative">Accept Suggestion</span>
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="w-8 p-0 text-muted-foreground hover:text-foreground"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center text-sm text-muted-foreground">
            <Bot className="h-8 w-8" />
            <div>
              <p className="font-medium">No suggestions yet</p>
              <p className="text-xs">Start writing to get AI-powered suggestions</p>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
