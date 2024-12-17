import { supabaseAdmin } from "./supabase.server"

// Create the grading-criteria bucket if it doesn't exist
export async function ensureGradingCriteriaBucket() {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets()
  
  if (!buckets?.find(bucket => bucket.name === 'grading-criteria')) {
    await supabaseAdmin.storage.createBucket('grading-criteria', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ]
    })
  }
}
