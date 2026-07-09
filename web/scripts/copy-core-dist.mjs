import { cpSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const webDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(webDir, '..', 'core', 'dist')
const dest = join(webDir, 'core-dist')

if (!existsSync(src)) {
  console.error('core/dist missing — run: npm run build -w @verifyflow/core')
  process.exit(1)
}

mkdirSync(dest, { recursive: true })
cpSync(src, dest, { recursive: true })
console.log('Copied core/dist → web/core-dist')
