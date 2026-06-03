import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary si las variables existen
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No se subió ningún archivo' });
    }

    const isBanner = data.get('isBanner') === 'true';
    let isHeavy = false;
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    if (isBanner) {
      const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'mp4'];
      
      if (!extension || !allowedExtensions.includes(extension)) {
        return NextResponse.json({ success: false, error: 'Formato no permitido. Solo PNG, JPG, JPEG, WEBP, GIF y MP4.' }, { status: 400 });
      }

      let sizeLimit = 250 * 1024; // 250KB por defecto para imagenes estáticas
      let limitText = '250KB';
      
      if (extension === 'gif') {
        sizeLimit = 5 * 1024 * 1024; // 5MB para GIF
        limitText = '5MB';
      } else if (extension === 'mp4') {
        sizeLimit = 10 * 1024 * 1024; // 10MB para MP4
        limitText = '10MB';
        
        // Si el mp4 pesa más de 5MB, lo marcamos como pesado
        if (file.size > 5 * 1024 * 1024) {
          isHeavy = true;
        }
      }

      if (file.size > sizeLimit) {
        return NextResponse.json({ success: false, error: `El archivo es muy pesado. Máximo permitido: ${limitText}` }, { status: 400 });
      }
    }

    // Producción: usar Cloudinary
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Subir a Cloudinary como base64
      const base64 = buffer.toString('base64');
      const dataUri = `data:${file.type};base64,${base64}`;

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'AlumineGo',
        resource_type: 'auto',
        format: extension === 'jpeg' ? 'jpg' : extension,
      });

      return NextResponse.json({
        success: true,
        url: result.secure_url,
        isHeavy
      });
    }

    // Desarrollo local: guardar en /public/uploads/
    const { writeFile, mkdir } = await import('fs/promises');
    const { join } = await import('path');

    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${crypto.randomUUID()}.${extension || 'tmp'}`;
    const path = join(uploadsDir, filename);

    await writeFile(path, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
      isHeavy
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno del servidor',
    });
  }
}
