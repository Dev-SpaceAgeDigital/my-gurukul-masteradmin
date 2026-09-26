import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { randomUUID } from 'crypto';

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'edutrust-media';

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export const sanitizePath = (segment: string) =>
  segment.replace(/[^a-zA-Z0-9._\-]/g, '_').replace(/_+/g, '_').toLowerCase();

export async function uploadMedia(
  file: Buffer,
  fileName: string,
  folder: string,
  isImage: boolean = true
): Promise<{ secure_url: string; public_id: string }> {
  let bufferToUpload = file;
  let finalFileName = fileName;

  if (isImage) {
    try {
      bufferToUpload = await sharp(file).webp({ quality: 80 }).toBuffer();
      finalFileName = fileName.replace(/\.[^/.]+$/, '') + '.webp';
    } catch {
      bufferToUpload = file;
    }
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase Storage is not configured in masteradmin.');
  }

  const mimeType = isImage ? 'image/webp' : 'application/octet-stream';
  const baseName = sanitizePath(finalFileName.replace(/\.[^/.]+$/, ''));
  const ext = isImage ? 'webp' : (finalFileName.split('.').pop() || 'bin');
  const uniqueFileName = `${baseName}_${randomUUID()}.${ext}`;
  const storagePath = `${folder.split('/').map(sanitizePath).join('/')}/${uniqueFileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, bufferToUpload, { contentType: mimeType, upsert: true });

  if (error) {
    console.error('[MasterAdmin Storage] Supabase upload error:', error);
    throw error;
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return {
    secure_url: urlData.publicUrl,
    public_id: storagePath,
  };
}

export async function deleteMedia(fileIdOrUrl: string): Promise<void> {
  if (!fileIdOrUrl) return;

  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    let storagePath = fileIdOrUrl;

    if (fileIdOrUrl.startsWith('http://') || fileIdOrUrl.startsWith('https://')) {
      const url = new URL(fileIdOrUrl);
      const marker = `/object/public/${BUCKET}/`;
      const markerIdx = url.pathname.indexOf(marker);
      if (markerIdx !== -1) {
        storagePath = decodeURIComponent(url.pathname.slice(markerIdx + marker.length));
      } else {
        return;
      }
    }

    await supabase.storage.from(BUCKET).remove([storagePath]);
  } catch (err) {
    console.warn('[MasterAdmin Storage] Supabase delete error:', err);
  }
}
