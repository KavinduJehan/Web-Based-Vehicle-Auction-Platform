const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

/**
 * Upload a single File to Cloudinary using an unsigned upload preset.
 * Returns the secure_url of the uploaded image.
 */
export async function uploadImage(file) {
  if (!CLOUD || !PRESET) {
    throw new Error('Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env')
  }
  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', PRESET)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`,
    { method: 'POST', body }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? 'Image upload failed')
  }
  const data = await res.json()
  return data.secure_url
}
