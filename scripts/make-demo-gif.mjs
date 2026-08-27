/**
 * Tiny animated GIF: terminal-style BLOCKED demo (no deps).
 * Frames: command → FAIL line → exit 1
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Minimal GIF89a writer for solid-color frames + LZW of indexed pixels
function lzwEncode(indices, minCodeSize) {
  const clear = 1 << minCodeSize
  const eoi = clear + 1
  let codeSize = minCodeSize + 1
  let nextCode = eoi + 1
  const dict = new Map()
  for (let i = 0; i < clear; i++) dict.set(String(i), i)

  const out = []
  let buf = 0
  let bufBits = 0
  const write = (code, size) => {
    buf |= code << bufBits
    bufBits += size
    while (bufBits >= 8) {
      out.push(buf & 0xff)
      buf >>= 8
      bufBits -= 8
    }
  }

  write(clear, codeSize)
  let w = String(indices[0])
  for (let i = 1; i < indices.length; i++) {
    const k = String(indices[i])
    const wk = w + ',' + k
    if (dict.has(wk)) {
      w = wk
    } else {
      write(dict.get(w), codeSize)
      dict.set(wk, nextCode++)
      if (nextCode >= 1 << codeSize && codeSize < 12) codeSize++
      if (nextCode >= 4096) {
        write(clear, codeSize)
        dict.clear()
        for (let j = 0; j < clear; j++) dict.set(String(j), j)
        nextCode = eoi + 1
        codeSize = minCodeSize + 1
      }
      w = k
    }
  }
  write(dict.get(w), codeSize)
  write(eoi, codeSize)
  if (bufBits > 0) out.push(buf & 0xff)
  return Uint8Array.from(out)
}

function frame(w, h, rgbFill, rgbText, lines, delayCs) {
  // 4-color palette: bg, muted, accent fail, white
  const palette = [
    ...rgbFill,
    90, 100, 120,
    ...rgbText,
    230, 235, 245,
  ]
  while (palette.length < 12) palette.push(0)
  const indices = new Uint8Array(w * h)
  indices.fill(0)

  const put = (x, y, c) => {
    if (x >= 0 && x < w && y >= 0 && y < h) indices[y * w + x] = c
  }
  // crude 5x7 glyphs for a few chars
  const glyphs = {
    ' ': [],
    '>': [[0,1],[1,2],[2,3],[1,4],[0,5]],
    'v': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,4],[2,0],[2,1],[2,2],[2,3],[2,4],[3,4],[4,0],[4,1],[4,2],[4,3],[4,4]],
    'e': [[0,1],[0,2],[0,3],[1,0],[1,2],[1,4],[2,0],[2,2],[2,4],[3,0],[3,2],[3,4],[4,1],[4,2],[4,3]],
    'r': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[1,2],[2,0],[2,2],[3,0],[3,3],[4,0],[4,4]],
    'i': [[1,0],[1,2],[1,3],[1,4],[2,0],[2,2],[2,3],[2,4]],
    'f': [[0,1],[0,2],[0,3],[0,4],[1,0],[1,2],[2,0],[2,2],[3,0],[4,0]],
    'l': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,4],[2,4]],
    'o': [[0,1],[0,2],[0,3],[1,0],[1,4],[2,0],[2,4],[3,0],[3,4],[4,1],[4,2],[4,3]],
    'w': [[0,0],[0,1],[0,2],[0,3],[1,4],[2,2],[2,3],[3,4],[4,0],[4,1],[4,2],[4,3]],
    'd': [[1,0],[1,1],[1,2],[1,3],[1,4],[2,0],[2,4],[3,0],[3,4],[4,1],[4,2],[4,3]],
    'c': [[0,1],[0,2],[0,3],[1,0],[1,4],[2,0],[2,4],[3,0],[3,4]],
    't': [[0,0],[1,0],[1,1],[1,2],[1,3],[1,4],[2,0],[2,4],[3,4]],
    'n': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[2,0],[3,0],[4,1],[4,2],[4,3],[4,4]],
    'p': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[1,2],[2,0],[2,2],[3,0],[3,2],[4,1]],
    'a': [[0,1],[0,2],[0,3],[0,4],[1,0],[1,2],[2,0],[2,2],[3,0],[3,2],[4,1],[4,2],[4,3],[4,4]],
    'y': [[0,0],[0,1],[1,2],[2,3],[2,4],[3,2],[4,0],[4,1]],
    'l': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,4],[2,4]],
    'B': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[1,2],[1,4],[2,0],[2,2],[2,4],[3,0],[3,2],[3,4],[4,1],[4,3]],
    'L': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,4],[2,4],[3,4],[4,4]],
    'O': [[0,1],[0,2],[0,3],[1,0],[1,4],[2,0],[2,4],[3,0],[3,4],[4,1],[4,2],[4,3]],
    'C': [[0,1],[0,2],[0,3],[1,0],[1,4],[2,0],[2,4],[3,0],[3,4]],
    'K': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,2],[2,1],[2,3],[3,0],[3,4],[4,0],[4,4]],
    'E': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[1,2],[1,4],[2,0],[2,2],[2,4],[3,0],[3,4],[4,0],[4,4]],
    'D': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[1,4],[2,0],[2,4],[3,0],[3,4],[4,1],[4,2],[4,3]],
    'F': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[1,2],[2,0],[2,2],[3,0],[4,0]],
    'A': [[0,1],[0,2],[0,3],[0,4],[1,0],[1,2],[2,0],[2,2],[3,0],[3,2],[4,1],[4,2],[4,3],[4,4]],
    'I': [[1,0],[1,4],[2,0],[2,1],[2,2],[2,3],[2,4],[3,0],[3,4]],
    '1': [[1,1],[2,0],[2,1],[2,2],[2,3],[2,4],[3,4]],
    'x': [[0,0],[0,4],[1,1],[1,3],[2,2],[3,1],[3,3],[4,0],[4,4]],
    'i': [[1,0],[1,2],[1,3],[1,4],[2,0],[2,2],[2,3],[2,4]],
    't': [[0,0],[1,0],[1,1],[1,2],[1,3],[1,4],[2,0],[2,4],[3,4]],
    ':': [[1,1],[1,3],[2,1],[2,3]],
    '.': [[1,4],[2,4]],
    '-': [[0,2],[1,2],[2,2],[3,2],[4,2]],
    'm': [[0,1],[0,2],[0,3],[0,4],[1,1],[2,1],[2,2],[3,1],[4,1],[4,2],[4,3],[4,4]],
    's': [[0,1],[0,4],[1,0],[1,2],[1,4],[2,0],[2,2],[2,4],[3,0],[3,2],[3,4],[4,0],[4,3]],
    'u': [[0,1],[0,2],[0,3],[1,4],[2,4],[3,4],[4,1],[4,2],[4,3]],
    'g': [[0,1],[0,2],[0,3],[1,0],[1,4],[2,0],[2,4],[3,0],[3,2],[3,4],[4,1],[4,2],[4,4]],
  }

  const drawText = (sx, sy, text, color) => {
    let x = sx
    for (const ch of text) {
      const g = glyphs[ch] || glyphs['.']
      for (const [dx, dy] of g) put(x + dx, sy + dy, color)
      x += 6
    }
  }

  let y = 18
  for (const line of lines) {
    drawText(12, y, line.text, line.color)
    y += 14
  }

  const minCodeSize = 2
  const compressed = lzwEncode(indices, minCodeSize)
  return { w, h, palette, compressed, delayCs, minCodeSize }
}

function buildGif(frames) {
  const parts = []
  const push = (...bytes) => parts.push(Uint8Array.from(bytes))

  // Header + Logical Screen
  const { w, h } = frames[0]
  push(0x47, 0x49, 0x46, 0x38, 0x39, 0x61) // GIF89a
  push(w & 0xff, (w >> 8) & 0xff, h & 0xff, (h >> 8) & 0xff, 0x70, 0x00, 0x00) // no gct

  // Netscape loop
  push(0x21, 0xff, 0x0b)
  parts.push(Uint8Array.from([...Buffer.from('NETSCAPE2.0'), 0x03, 0x01, 0x00, 0x00, 0x00]))

  for (const f of frames) {
    // GCE
    push(0x21, 0xf9, 0x04, 0x04, f.delayCs & 0xff, (f.delayCs >> 8) & 0xff, 0x00, 0x00)
    // Image descriptor + local color table (4 colors → size 1 → 2 bits → 4*3? wait)
    // packed: 1_000_001 = 0x81 for 4-color LCT (size=1 → 2^(1+1)=4)
    push(0x2c, 0, 0, 0, 0, f.w & 0xff, (f.w >> 8) & 0xff, f.h & 0xff, (f.h >> 8) & 0xff, 0x81)
    parts.push(Uint8Array.from(f.palette.slice(0, 12)))
    push(f.minCodeSize)
    // sub-blocks
    let offset = 0
    const data = f.compressed
    while (offset < data.length) {
      const n = Math.min(255, data.length - offset)
      push(n)
      parts.push(data.subarray(offset, offset + n))
      offset += n
    }
    push(0x00)
  }
  push(0x3b)
  const total = parts.reduce((n, p) => n + p.length, 0)
  const out = new Uint8Array(total)
  let o = 0
  for (const p of parts) {
    out.set(p, o)
    o += p.length
  }
  return out
}

const W = 480
const H = 140
const bg = [18, 24, 38]
const fail = [220, 80, 90]

const frames = [
  frame(W, H, bg, [140, 200, 190], [{ text: '> verifyflow doctor --payload bad', color: 3 }], 80),
  frame(
    W,
    H,
    bg,
    fail,
    [
      { text: '> verifyflow doctor --payload bad', color: 3 },
      { text: 'FAIL EVM version field', color: 2 },
      { text: 'evmversion=default rejected', color: 1 },
    ],
    100,
  ),
  frame(
    W,
    H,
    bg,
    fail,
    [
      { text: '> verifyflow doctor --payload bad', color: 3 },
      { text: 'FAIL EVM version field', color: 2 },
      { text: 'BLOCKED  exit:1', color: 2 },
    ],
    120,
  ),
]

const outPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'demo.gif')
mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, buildGif(frames))
console.log('wrote', outPath, 'bytes', buildGif(frames).length)
