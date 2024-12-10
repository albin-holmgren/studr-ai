import { createCookieSessionStorage } from "@remix-run/node";
import { createSupabaseServerClient } from "./supabase.server";
import { prisma } from "./db.server";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set");
}

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function createUserSession({
  request,
  userId,
  email,
  remember,
  redirectTo,
}: {
  request: Request;
  userId: string;
  email: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set("userId", userId);
  session.set("email", email);

  return sessionStorage.commitSession(session, {
    maxAge: remember
      ? 60 * 60 * 24 * 7 // 7 days
      : 60 * 60 * 24, // 24 hours
  });
}

export async function requireUser(request: Request) {
  const response = new Response();
  const supabase = createSupabaseServerClient({ request, response });
  const { data: { session: supabaseSession } } = await supabase.auth.getSession();

  if (!supabaseSession?.user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  // Get or create user in our database
  let user = await prisma.user.findUnique({
    where: { id: supabaseSession.user.id },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: supabaseSession.user.id,
        email: supabaseSession.user.email!,
        name: supabaseSession.user.email?.split('@')[0] || 'User',
      },
    });
  }

  return user;
}

export async function destroySession(request: Request) {
  const session = await getSession(request);
  return sessionStorage.destroySession(session);
}
