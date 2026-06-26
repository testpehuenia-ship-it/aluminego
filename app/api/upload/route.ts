import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { v2 as cloudinary } from 'cloudinary';
const Jimp = require('jimp');
import crypto from 'crypto';

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
      return NextResponse.json({ success: false, error: 'No se subió ningÁºn archivo' });
    }

    const isBanner = data.get('isBanner') === 'true';
    let isHeavy = false;
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    const allowedImageExtensions = ['png', 'jpg', 'jpeg', 'webp'];
    const allowedBannerExtensions = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'mp4'];
    const allowedExtensions = isBanner ? allowedBannerExtensions : allowedImageExtensions;

    if (!extension || !allowedExtensions.includes(extension)) {
      const allowedText = isBanner ? 'PNG, JPG, JPEG, WEBP, GIF y MP4' : 'PNG, JPG, JPEG y WEBP';
      return NextResponse.json({ success: false, error: `Formato no permitido. Solo se permiten archivos: ${allowedText}` }, { status: 400 });
    }

    if (isBanner) {
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
    } else {
      // Límite de tamaño para imágenes normales
      const sizeLimit = 10 * 1024 * 1024; // 10MB
      if (file.size > sizeLimit) {
        return NextResponse.json({ success: false, error: 'El archivo es muy pesado. Máximo permitido: 10MB' }, { status: 400 });
      }
    }

    // Auto-compresión con Jimp para imágenes (evitar videos o gifs animados)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    let processedBuffer = buffer;
    let finalExtension = extension;
    let mimeType = file.type;

    if (['png', 'jpg', 'jpeg', 'webp'].includes(extension)) {
      try {
        const image = await Jimp.read(buffer);
        // Redimensionar si es muy ancha (ej: fotos de cámara de 4000px)
        if (image.getWidth() > 1000) {
          image.resize(1000, Jimp.AUTO);
        }
        // Bajar calidad al 80% y convertir a JPEG para ahorrar peso
        image.quality(80);
        processedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);
        finalExtension = 'jpg';
        mimeType = 'image/jpeg';
      } catch (err) {
        console.error('Error comprimiendo con Jimp, usando original:', err);
      }
    }

    // Producción: usar Cloudinary
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      // Subir a Cloudinary como base64
      const base64 = processedBuffer.toString('base64');
      const dataUri = `data:${mimeType};base64,${base64}`;

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'AluminéGO',
        resource_type: 'auto',
        format: finalExtension === 'jpeg' ? 'jpg' : finalExtension,
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

    const filename = `${crypto.randomUUID()}.${finalExtension || 'tmp'}`;
    const path = join(uploadsDir, filename);

    await writeFile(path, processedBuffer);

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


