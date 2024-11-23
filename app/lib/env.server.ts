export function getEnvVar(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
}

export function getSupabaseEnvVars() {
  return {
    SUPABASE_URL: getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
    SUPABASE_ANON_KEY: getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    SUPABASE_JWT_SECRET: getEnvVar("SUPABASE_JWT_SECRET"),
  }
}

export function getOpenAIEnvVars() {
  return {
    OPENAI_API_KEY: getEnvVar("OPENAI_API_KEY"),
  }
}