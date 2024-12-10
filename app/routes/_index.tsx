import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useRouteError, isRouteErrorResponse } from "@remix-run/react"
import { prisma } from "~/lib/db.server";
import { requireAuth } from "~/lib/auth.server";
import { HomePage } from "~/components/pages/home"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const user = await requireAuth(request);

    const userData = await prisma.user.findUnique({
      where: { id: user.session.user.id },
      include: {
        subscription: true,
      },
    });

    if (!userData) {
      throw new Error("User not found");
    }

    // Get recent documents using Prisma
    const recentDocuments = await prisma.document.findMany({
      where: {
        userId: user.session.user.id,
        isArchived: false
      },
      select: {
        id: true,
        title: true,
        emoji: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc"
      },
      take: 5
    })

    return json(
      {
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          avatarUrl: userData.avatarUrl,
          avatar: userData.avatarUrl,
          subscription: userData.subscription,
        },
        recentDocuments
      },
      {
        headers: user.response.headers,
      }
    )
  } catch (error) {
    console.error("Error in root loader:", error);
    throw error;
  }
};

export default function Index() {
  const { recentDocuments, user } = useLoaderData<typeof loader>()
  return <HomePage recentDocuments={recentDocuments} user={user} />
}

export function ErrorBoundary() {
  const error = useRouteError()
  
  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <h1 className="text-2xl font-bold text-red-600">
            {error.status} {error.statusText}
          </h1>
          <div className="bg-red-50 p-4 rounded-md border border-red-200">
            <p className="text-sm text-red-800">{error.data}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Error loading page</h1>
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <pre className="text-sm text-red-800 whitespace-pre-wrap">
            {error instanceof Error ? error.message : JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}