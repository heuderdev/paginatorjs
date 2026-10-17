# 📄 `build.mjs`

- **Camada:** [📄 OUTROS ARQUIVOS](../outros.md)
- **Linguagem:** javascript
- **Linhas:** 51

## Imports

- `esbuild`
- `node:fs`
- `node:zlib`

## Código-fonte

```javascript
import { transform } from 'esbuild'
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)))
const banner = `/*! hr-paginationjs v${pkg.version} | MIT */`
const jsTarget = ['es2015']
const cssTarget = ['chrome92', 'firefox90', 'safari15', 'edge92']

/**
 * Gera:
 *   dist/hr-paginationjs.js        <script> legível (cópia do src, com comentários)
 *   dist/hr-paginationjs.min.js    <script> minificado
 *   dist/hr-paginationjs.css       CSS legível
 *   dist/hr-paginationjs.min.css   CSS minificado
 *   dist/pagination-2.6.0.min.js   dependência (MIT) + licença
 *   dist/sizes.json
 * A biblioteca é um único IIFE sem imports: não há bundle nem ESM.
 * jsTarget es2015 impede o minificador de introduzir sintaxe mais nova que a do Pagination.js 2.6.0.
 */
const js = readFileSync('src/hr-paginationjs.js', 'utf8')
const css = readFileSync('src/hr-paginationjs.css', 'utf8')
const versaoFonte = (/var VERSION = '([^']+)'/.exec(js) || [])[1]

if (versaoFonte !== pkg.version) {
    console.error(`Versão divergente: src/hr-paginationjs.js tem '${versaoFonte}' e package.json tem '${pkg.version}'.`)
    process.exit(1)
}

rmSync('dist', { recursive: true, force: true })
mkdirSync('dist', { recursive: true })

const minJs = await transform(js, { loader: 'js', minify: true, target: jsTarget, legalComments: 'none', banner, charset: 'ascii' })
const minCss = await transform(css, { loader: 'css', minify: true, target: cssTarget, legalComments: 'none', banner, charset: 'ascii' })

writeFileSync('dist/hr-paginationjs.js', js)
writeFileSync('dist/hr-paginationjs.min.js', minJs.code)
writeFileSync('dist/hr-paginationjs.css', css)
writeFileSync('dist/hr-paginationjs.min.css', minCss.code)
copyFileSync('vendor/pagination-2.6.0.min.js', 'dist/pagination-2.6.0.min.js')
copyFileSync('vendor/pagination-LICENSE.txt', 'dist/pagination-LICENSE.txt')

const sizes = ['hr-paginationjs.js', 'hr-paginationjs.min.js', 'hr-paginationjs.css', 'hr-paginationjs.min.css'].map((file) => {
    const content = readFileSync(`dist/${file}`)
    return { file, bytes: content.length, gzip: gzipSync(content).length }
})

writeFileSync('dist/sizes.json', JSON.stringify(sizes, null, 2) + '\n')
for (const s of sizes) {
    console.log(`${s.file.padEnd(26)} ${(s.bytes / 1024).toFixed(1).padStart(6)} KiB   gzip ${(s.gzip / 1024).toFixed(1).padStart(5)} KiB`)
}
```
