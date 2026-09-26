import { NextResponse } from 'next/server';
import { uploadMedia } from '@/lib/storage';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'trust-logos';

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadMedia(
      buffer,
      file.name,
      `logos/${folder}`,
      file.type.startsWith('image/')
    );

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      fileId: result.public_id
    });
  } catch (error: any) {
    console.error('Logo upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload logo' }, { status: 500 });
  }
}
