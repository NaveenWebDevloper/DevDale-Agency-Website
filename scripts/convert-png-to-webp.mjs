import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const globSync = require('glob').sync;

const projectRoot = process.cwd();
const publicDir = path.resolve(projectRoot, 'public');

// Convert all PNG/JPG/JPEG files in the public folder to WebP
const files = globSync('**/*.{png,jpg,jpeg}', { cwd: publicDir });
if (!files.length) {
  console.log('No PNG/JPG/JPEG files found.');
}
files.forEach(async (file) => {
  const srcPath = path.join(publicDir, file);
  const ext = path.extname(file).toLowerCase();
  const destPath = srcPath.replace(ext, '.webp');
  try {
    await sharp(srcPath).webp({ quality: 80 }).toFile(destPath);
    console.log(`Converted ${file} -> ${path.basename(destPath)}`);
  } catch (e) {
    console.error(`Failed to convert ${file}:`, e);
  }
});

// Update code references from .png to .webp (simple regex replace in source files)
const srcGlob = '**/*.{tsx,ts,jsx,js}';
const srcFiles = globSync(srcGlob, { cwd: projectRoot, ignore: ['node_modules/**', 'public/**'] });
srcFiles.forEach((file) => {
  const filePath = path.resolve(projectRoot, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const updated = content.replace(/\.png\b/g, '.webp');
  if (updated !== content) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`Updated references in ${file}`);
  }
});

// Add lazy loading attribute to all <img> tags that lack it
const srcFilesLazy = globSync(srcGlob, { cwd: projectRoot, ignore: ['node_modules/**', 'public/**'] });
srcFilesLazy.forEach((file) => {
  const filePath = path.resolve(projectRoot, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const updated = content.replace(/<img(?![^>]*\bloading=)/g, '<img loading="lazy"');
  if (updated !== content) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`Added lazy loading in ${file}`);
  }
});
