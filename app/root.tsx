import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRevalidator,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { createBrowserClient } from "@supabase/auth-helpers-remix";
import { useEffect, useState } from "react";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { prisma } from "~/lib/db.server";
import { PageTitleProvider } from "./components/page-title-context";

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
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  const response = new Response();
  const supabase = createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    request,
    response,
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  let workspaces = []
  let user = null
  
  if (session) {
    user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: {
        workspaces: {
          include: {
            notes: {
              orderBy: {
                updatedAt: 'desc'
              }
            }
          },
          orderBy: {
            updatedAt: 'desc'
          }
        }
      }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email!,
          name: session.user.user_metadata.full_name || session.user.email,
        },
        include: {
          workspaces: true
        }
      });
    }

    workspaces = user.workspaces
  }

  return json(
    { env, workspaces, user, session },
    {
      headers: response.headers,
    }
  );
};

let browserSupabase: ReturnType<typeof createBrowserClient> | null = null;

export default function App() {
  const { env, workspaces, user, session } = useLoaderData<typeof loader>();
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
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <PageTitleProvider>
          <Outlet context={{ supabase, workspaces, user, session }} />
        </PageTitleProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
