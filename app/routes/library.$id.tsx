import { useParams } from "@remix-run/react"
import { Layout } from "~/components/layout"
import { LibraryViewer } from "~/components/library-viewer"

export default function LibraryRoute() {
  const { id } = useParams()
  
  // Demo library items
  const getLibraryItem = (id: string) => {
    const items = {
      "react-docs": {
        name: "React Documentation",
        type: "url",
        content: `
          <h1>React Documentation</h1>
          <p>React is a JavaScript library for building user interfaces.</p>
          <h2>Getting Started</h2>
          <p>To get started with React, you can create a new project using Create React App:</p>
          <pre><code>npx create-react-app my-app</code></pre>
          <h2>Main Concepts</h2>
          <ul>
            <li>Components</li>
            <li>Props</li>
            <li>State</li>
            <li>Lifecycle Methods</li>
          </ul>
          <p>This is a demo document showcasing how library items can be displayed.</p>
        `,
      },
      "design-system": {
        name: "Design System Guidelines",
        type: "file",
        content: `
          <h1>Design System Guidelines</h1>
          <h2>Colors</h2>
          <p>Our design system uses a carefully selected color palette:</p>
          <ul>
            <li>Primary: #0066CC</li>
            <li>Secondary: #6B7280</li>
            <li>Accent: #10B981</li>
          </ul>
          <h2>Typography</h2>
          <p>We use Inter as our primary font family across all applications.</p>
          <h3>Font Sizes</h3>
          <ul>
            <li>Heading 1: 2.25rem</li>
            <li>Heading 2: 1.875rem</li>
            <li>Body: 1rem</li>
          </ul>
          <p>This is a demo document showcasing how library items can be displayed.</p>
        `,
      },
      "research-paper": {
        name: "Research Paper: AI in 2024",
        type: "file",
        content: `
          <h1>The State of AI in 2024</h1>
          <p class="lead">A comprehensive overview of artificial intelligence developments.</p>
          <h2>Abstract</h2>
          <p>This paper examines the current state of artificial intelligence and its impact on various industries.</p>
          <h2>Introduction</h2>
          <p>Artificial intelligence has seen remarkable progress in recent years, with breakthroughs in:</p>
          <ul>
            <li>Large Language Models</li>
            <li>Computer Vision</li>
            <li>Robotics</li>
            <li>Healthcare Applications</li>
          </ul>
          <h2>Methodology</h2>
          <p>Our research methodology included analyzing data from multiple sources and conducting interviews with industry experts.</p>
          <p>This is a demo document showcasing how library items can be displayed.</p>
        `,
      },
    }
    return items[id as keyof typeof items] || { 
      name: "Unknown Item", 
      type: "file", 
      content: "<h1>Document Not Found</h1><p>The requested document could not be found in the library.</p>" 
    }
  }

  const item = getLibraryItem(id!)

  return (
    <Layout minimal title={item.name}>
      <LibraryViewer item={item} />
    </Layout>
  )
}