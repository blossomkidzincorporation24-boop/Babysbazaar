import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'

// Initialize the S3 client for Cloudflare R2
const accountId = process.env.R2_ACCOUNT_ID || ''
const accessKeyId = process.env.R2_ACCESS_KEY_ID || ''
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || ''

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
})

export const R2_BUCKET = process.env.R2_BUCKET_NAME || 'babys-bazaar-media'
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || ''

// The 7 GB Safety Limit (in bytes) -> 7 * 1024 * 1024 * 1024
export const STORAGE_LIMIT_BYTES = 7 * 1024 * 1024 * 1024

export async function getR2StorageUsage(): Promise<number> {
  let totalBytes = 0
  let isTruncated = true
  let continuationToken: string | undefined = undefined

  try {
    while (isTruncated) {
      const command: any = new ListObjectsV2Command({
        Bucket: R2_BUCKET,
        ContinuationToken: continuationToken,
      })
      
      const response: any = await r2Client.send(command)
      
      response.Contents?.forEach((item: any) => {
        totalBytes += item.Size || 0
      })
      
      isTruncated = response.IsTruncated || false
      continuationToken = response.NextContinuationToken
    }
    return totalBytes
  } catch (error) {
    console.error("Error fetching R2 storage usage:", error)
    // Fallback if R2 isn't configured yet, so the app doesn't crash during migration
    return 0 
  }
}
