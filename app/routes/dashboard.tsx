import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { requireAuth } from "~/lib/auth.server"
import { Layout } from "~/components/layout"

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, response, session } = await requireAuth(request)

  // Get user's document statistics
  const { data: documentStats, error: statsError } = await supabase
    .from("documents")
    .select("id")
    .eq("user_id", session.user.id)

  if (statsError) {
    throw new Error(statsError.message)
  }

  // Get recent activity
  const { data: recentActivity, error: activityError } = await supabase
    .from("documents")
    .select("id, title, updated_at")
    .eq("user_id", session.user.id)
    .order("updated_at", { ascending: false })
    .limit(10)

  if (activityError) {
    throw new Error(activityError.message)
  }

  return json(
    {
      totalDocuments: documentStats.length,
      recentActivity,
    },
    { headers: response.headers }
  )
}

export default function Dashboard() {
  const { totalDocuments, recentActivity } = useLoaderData<typeof loader>()

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Stats Card */}
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-medium mb-2">Documents</h3>
            <p className="text-3xl font-bold">{totalDocuments}</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="bg-card rounded-lg border">
            <div className="divide-y">
              {recentActivity.map((doc) => (
                <div key={doc.id} className="p-4">
                  <h4 className="font-medium">{doc.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Last updated: {new Date(doc.updated_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="p-4 text-muted-foreground">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
