import { AiChat } from "~/components/ai-chat"
import { Layout } from "~/components/layout"

export default function AskAiPage() {
  return (
    <Layout minimal>
      <div className="h-[calc(100vh-3.5rem)] overflow-hidden">
        <AiChat />
      </div>
    </Layout>
  )
}