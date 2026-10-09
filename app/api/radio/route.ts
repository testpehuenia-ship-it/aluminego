import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'radio-config.json');

const DEFAULT_CONFIG = {
  streamUrl: 'https://streaming01.shockmedia.com.ar/9180/stream',
  fallbackStreamUrl: 'https://streaming01.shockmedia.com.ar:10798/stream',
  name: 'FM Golfo Azul',
  frequency: '92.5 MHZ',
  slogan: 'Radio de Montaña, Capital de la música',
  city: 'Villa Pehuenia',
  isActive: true,
  updatedAt: new Date().toISOString()
};

async function readConfig() {
  try {
    const raw = await fs.readFile(CONFIG_PATH, 'utf-8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch (error) {
    return DEFAULT_CONFIG;
  }
}

async function writeConfig(newConfig: any) {
  try {
    await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
    await fs.writeFile(CONFIG_PATH, JSON.stringify(newConfig, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving radio config to file:', error);
  }
}

export async function GET() {
  try {
    const config = await readConfig();
    return NextResponse.json(config);
  } catch (error: any) {
    console.error('Error reading radio config:', error);
    return NextResponse.json(DEFAULT_CONFIG);
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    if (!verifySession(token)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const currentConfig = await readConfig();

    const updatedConfig = {
      ...currentConfig,
      streamUrl: typeof body.streamUrl === 'string' ? body.streamUrl.trim() : currentConfig.streamUrl,
      fallbackStreamUrl: typeof body.fallbackStreamUrl === 'string' ? body.fallbackStreamUrl.trim() : currentConfig.fallbackStreamUrl,
      name: typeof body.name === 'string' && body.name.trim() ? body.name.trim() : currentConfig.name,
      frequency: typeof body.frequency === 'string' && body.frequency.trim() ? body.frequency.trim() : currentConfig.frequency,
      slogan: typeof body.slogan === 'string' && body.slogan.trim() ? body.slogan.trim() : currentConfig.slogan,
      city: typeof body.city === 'string' && body.city.trim() ? body.city.trim() : currentConfig.city,
      isActive: typeof body.isActive === 'boolean' ? body.isActive : currentConfig.isActive,
      updatedAt: new Date().toISOString()
    };

    await writeConfig(updatedConfig);

    return NextResponse.json({ success: true, config: updatedConfig });
  } catch (error: any) {
    console.error('Error updating radio config:', error);
    return NextResponse.json({ error: error.message || 'Error al actualizar configuración de radio' }, { status: 500 });
  }
}
