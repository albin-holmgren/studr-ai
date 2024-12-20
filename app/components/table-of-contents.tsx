import * as React from "react"
import { cn } from "~/lib/utils"
import { ChevronRight } from "lucide-react"

interface Section {
  id: string
  title: string
  level: number
  element: HTMLElement
}

interface TableOfContentsProps {
  contentRef: React.RefObject<HTMLElement>
  className?: string
}

export function TableOfContents({ contentRef, className }: TableOfContentsProps) {
  const [sections, setSections] = React.useState<Section[]>([])
  const [activeId, setActiveId] = React.useState<string>()
  const [isVisible, setIsVisible] = React.useState(false)
  const observer = React.useRef<IntersectionObserver>()

  React.useEffect(() => {
    if (!contentRef.current) return

    // Find all heading elements in the content
    const headings = contentRef.current.querySelectorAll('[data-heading="true"]')
    const newSections: Section[] = Array.from(headings)
      .filter(heading => {
        // Only include level 1 (title) and level 2 (section) headings
        const level = parseInt(heading.getAttribute('data-level') || '1')
        return level <= 2
      })
      .map((heading, index) => ({
        id: `section-${index}`,
        title: heading.textContent?.replace(/^[0-9]+\.\s*/, '') || '',
        level: parseInt(heading.getAttribute('data-level') || '1'),
        element: heading as HTMLElement
      }))

    setSections(newSections)
    setIsVisible(newSections.length > 1) // Show if there's more than just the title

    // Set up intersection observer
    observer.current?.disconnect()
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 1.0
      }
    )

    // Add IDs and observe each heading
    headings.forEach((heading, index) => {
      const id = `section-${index}`
      heading.id = id
      observer.current?.observe(heading)
    })

    return () => observer.current?.disconnect()
  }, [contentRef])

  const scrollToSection = React.useCallback((section: Section) => {
    section.element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  if (!isVisible) return null

  return (
    <div 
      className={cn(
        "hidden lg:block sticky top-[85px] ml-8 w-64 flex-shrink-0 h-[calc(100vh-85px)]",
        className
      )}
    >
      <div className="overflow-y-auto h-full py-8 pr-8">
        <div className="text-sm font-medium mb-4 text-foreground/70">
          On this page
        </div>
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section)}
              className={cn(
                "flex items-center w-full text-sm py-1 px-2 hover:bg-muted rounded-md",
                "transition-colors duration-200",
                activeId === section.id 
                  ? "text-foreground font-medium" 
                  : "text-muted-foreground",
                section.level === 1 ? "pl-2" : "pl-4"
              )}
            >
              <ChevronRight 
                className={cn(
                  "h-3 w-3 mr-1 transition-transform",
                  activeId === section.id ? "text-foreground" : "text-muted-foreground/50",
                  activeId === section.id && "transform rotate-90"
                )} 
              />
              <span className="truncate text-left">
                {section.title}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
