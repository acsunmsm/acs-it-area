import { readdir } from 'node:fs/promises';
import path from 'node:path';
import HeroCarouselClient from './HeroCarouselClient';

export default async function HeroCarousel() {
  const directory = path.join(process.cwd(), 'public/assets/img/fondosinicio');
  const files = await readdir(directory, { withFileTypes: true });
  const photos = files
    .filter(file => file.isFile() && /\.(avif|jpe?g|png|webp)$/i.test(file.name))
    .map(file => `/assets/img/fondosinicio/${encodeURIComponent(file.name)}`)
    .sort((first, second) => first.localeCompare(second));

  return <HeroCarouselClient photos={photos} />;
}
