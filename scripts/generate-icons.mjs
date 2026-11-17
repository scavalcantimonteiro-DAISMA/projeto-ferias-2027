import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, '..', 'public', 'logo.svg');
const publicDir = path.join(__dirname, '..', 'public');

async function generateIcons() {
  console.log('Gerando ícones PNG nativos para iOS / iPhone e Android...');

  const svgBuffer = fs.readFileSync(svgPath);

  // 1. apple-touch-icon.png (180x180) - Padrão Apple Safari
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon-180x180.png'));

  // 2. icon-192.png e icon-512.png para Android e Web App
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));

  // 3. favicon.png (64x64 e 32x32)
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  console.log('✅ Todos os ícones PNG para iPhone/iOS foram criados com sucesso!');
}

generateIcons().catch(console.error);
