import * as React from "react"
import { Bot, ChevronDown, Lightbulb, Sparkles, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "~/components/ui/button"
import { ScrollArea } from "~/components/ui/scroll-area"
import { cn } from "~/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible"

interface Suggestion {
  id: string
  type: "improvement" | "insight" | "enhancement"
  title: string
  content: {
    summary: string
    highlights: string[]
  }
}

interface AiSuggestionsProps {
  content: string
}

function getLetterGradeStyle(grade: string): string {
  switch (grade) {
    case 'A':
      return 'text-emerald-500 bg-emerald-500/10'
    case 'B':
      return 'text-blue-500 bg-blue-500/10'
    case 'C':
      return 'text-amber-500 bg-amber-500/10'
    case 'D':
      return 'text-orange-500 bg-orange-500/10'
    case 'F':
      return 'text-red-500 bg-red-500/10'
    default:
      return 'text-primary bg-primary/10'
  }
}

function getLetterGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

export function AiSuggestions({ content }: AiSuggestionsProps) {
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([])
  const [loading, setLoading] = React.useState(true)
  const [score] = React.useState(87) // Example score
  const [openSuggestion, setOpenSuggestion] = React.useState<string | null>(null)
  const letterGrade = getLetterGrade(score)
  const gradeStyle = getLetterGradeStyle(letterGrade)

  React.useEffect(() => {
    // Simulate AI analysis
    const timer = setTimeout(() => {
      const newSuggestions = [
        {
          id: "1",
          type: "improvement",
          title: "Add More Examples",
          content: {
            summary: "Your points need stronger support through concrete examples.",
            highlights: [
              "Add real-world case studies",
              "Include statistical data",
              "Share relevant experiences",
              "Reference expert opinions"
            ]
          }
        },
        {
          id: "2",
          type: "insight",
          title: "Enhance Introduction",
          content: {
            summary: "Make your introduction more engaging and attention-grabbing.",
            highlights: [
              "Start with a surprising statistic",
              "Open with a thought-provoking question",
              "Begin with a relevant anecdote",
              "Present a compelling problem"
            ]
          }
        },
        {
          id: "3",
          type: "enhancement",
          title: "Improve Readability",
          content: {
            summary: "Break down content into more digestible sections.",
            highlights: [
              "Keep paragraphs to 3-4 sentences",
              "Use bullet points strategically",
              "Add clear subheadings",
              "Increase white space"
            ]
          }
        },
        {
          id: "4",
          type: "improvement",
          title: "Smooth Transitions",
          content: {
            summary: "Create better flow between topics and sections.",
            highlights: [
              "Add transitional phrases",
              "Connect ideas explicitly",
              "Summarize before new topics",
              "Use logical bridges"
            ]
          }
        },
        {
          id: "5",
          type: "insight",
          title: "Strengthen Arguments",
          content: {
            summary: "Support claims with authoritative sources and research.",
            highlights: [
              "Cite recent studies",
              "Include expert quotes",
              "Add industry statistics",
              "Reference peer-reviewed papers"
            ]
          }
        },
      ]
      setSuggestions(newSuggestions)
      setOpenSuggestion(newSuggestions[0].id)
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [content])

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg bg-muted/50 p-4"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Bot className="h-4 w-4 animate-pulse" />
          <p>Analyzing content...</p>
        </div>
      </motion.div>
    )
  }

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <motion.div 
        className="space-y-4 pr-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-lg bg-muted/50 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <motion.p 
                className="text-2xl font-bold tracking-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                {score}%
              </motion.p>
            </div>
            <motion.div 
              className={cn("flex h-14 w-14 items-center justify-center rounded-full transition-colors", gradeStyle)}
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

        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * (index + 2) }}
          >
            <Collapsible
              open={openSuggestion === suggestion.id}
              onOpenChange={(open) => setOpenSuggestion(open ? suggestion.id : null)}
            >
              <div className="rounded-lg bg-muted/50">
                <CollapsibleTrigger className="flex w-full items-center justify-between p-4">
                  <div className="flex items-center gap-2">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
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
                    <span className="text-sm font-medium">
                      {suggestion.title}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: openSuggestion === suggestion.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
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
                        className="border-t border-border/50"
                      >
                        <div className="p-4">
                          <p className="text-sm text-muted-foreground mb-3">
                            {suggestion.content.summary}
                          </p>
                          <div className="space-y-2">
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
                            className="mt-4 flex gap-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <Button 
                              size="sm" 
                              className="w-full bg-primary/10 text-primary hover:bg-primary/20"
                            >
                              Accept Suggestion
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
      </motion.div>
    </ScrollArea>
  )
}