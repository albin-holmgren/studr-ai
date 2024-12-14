import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRevalidator,
  LiveReload,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { createBrowserClient } from "@supabase/auth-helpers-remix";
import { useEffect, useState } from "react";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { db } from "~/lib/db.server";
import { PageTitleProvider } from "./components/page-title-context";
import { SidebarProvider } from "~/components/ui/sidebar";

import "./tailwind.css";
import "./styles/editor.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const env = {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  };

  const response = new Response();
  const supabase = createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    request,
    response,
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  let user = null;
  let workspaces: {
    id: string
    name: string
    emoji: string
    createdAt: string
    updatedAt: string
    notes?: {
      id: string
      title: string
      createdAt: string
      updatedAt: string
    }[]
  }[] = [];
  
  if (session?.user?.email) {
    user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        workspaces: {
          orderBy: { createdAt: "desc" },
          include: {
            notes: {
              orderBy: { createdAt: "desc" }
            }
          }
        },
      },
    });

    if (user) {
      workspaces = user.workspaces.map(workspace => ({
        ...workspace,
        emoji: workspace.emoji || "📝", // Provide default emoji
        createdAt: workspace.createdAt.toISOString(),
        updatedAt: workspace.updatedAt.toISOString(),
        notes: workspace.notes?.map(note => ({
          ...note,
          createdAt: note.createdAt.toISOString(),
          updatedAt: note.updatedAt.toISOString()
        }))
      }));
    }
  }

  return json(
    {
      env,
      user,
      session,
      workspaces
    },
    {
      headers: response.headers,
    }
  );
};

let browserSupabase: ReturnType<typeof createBrowserClient> | null = null;

export default function App() {
  const { env, user, session, workspaces } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  
  const [supabase] = useState(() => {
    if (!browserSupabase) {
      browserSupabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    }
    return browserSupabase;
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      revalidator.revalidate();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, revalidator]);

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <PageTitleProvider>
          <SidebarProvider>
            <Outlet context={{ supabase, user, session, workspaces }} />
          </SidebarProvider>
        </PageTitleProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
