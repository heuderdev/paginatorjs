# 📄 `scripts/pacote.mjs`

- **Camada:** [📄 OUTROS ARQUIVOS](../../outros.md)
- **Linguagem:** javascript
- **Linhas:** 166

## Imports

- `node:fs`
- `node:child_process`
- `node:zlib`
- `node:url`
- `node:path`

## Funções / Métodos

- `exigir(caminho)`
- `crc32(buf)`

## Código-fonte

```javascript
/**
 * Gera pacote/hr-paginationjs-<versão>.zip com tudo que um projeto precisa para usar a biblioteca:
 *   js/       hr-paginationjs.min.js (+ versão legível, usada pelo Joomla em modo debug) e pagination-2.6.0.min.js
 *   css/      hr-paginationjs.min.css (+ versão legível)
 *   joomla3/  controller e view de exemplo com os helpers do projeto
 *   LEIAME.md ordem de carregamento e onde colocar cada arquivo
 *
 * Uso: npm run pacote            (roda o build antes)
 *      npm run pacote -- --sem-build
 * Sem dependências: o zip é montado aqui mesmo (deflate do node:zlib).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { deflateRawSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(join(raiz, 'package.json'), 'utf8'))
const versao = pkg.version

if (!process.argv.includes('--sem-build')) {
    const r = spawnSync(process.execPath, [join(raiz, 'build.mjs')], { cwd: raiz, stdio: 'inherit' })
    if (r.status !== 0) {
        console.error('Build falhou; pacote não gerado.')
        process.exit(1)
    }
}

function exigir(caminho) {
    const completo = join(raiz, caminho)
    if (!existsSync(completo)) {
        console.error(`Arquivo ausente: ${caminho}` + (caminho.startsWith('dist') ? ' (rode npm run build)' : ''))
        process.exit(1)
    }
    return readFileSync(completo)
}

// [caminho no zip, conteúdo]
const entradas = [
    ['js/hr-paginationjs.min.js', exigir('dist/hr-paginationjs.min.js')],
    ['js/hr-paginationjs.js', exigir('dist/hr-paginationjs.js')],
    ['js/pagination-2.6.0.min.js', exigir('dist/pagination-2.6.0.min.js')],
    ['js/pagination-LICENSE.txt', exigir('dist/pagination-LICENSE.txt')],
    ['css/hr-paginationjs.min.css', exigir('dist/hr-paginationjs.min.css')],
    ['css/hr-paginationjs.css', exigir('dist/hr-paginationjs.css')],
    ['joomla3/controllers/clientes.php', exigir('exemplos/joomla3/controllers/clientes.php')],
    ['joomla3/views/clientes/tmpl/default.php', exigir('exemplos/joomla3/views/clientes/tmpl/default.php')],
    ['joomla3/README.md', exigir('exemplos/joomla3/README.md')],
]

const leiame = `# hr-paginationjs ${versao}

Pacote para usar a biblioteca em um projeto. Gerado por \`npm run pacote\` em ${new Date().toISOString().slice(0, 10)}.

## Conteúdo

| Pasta | Uso |
|---|---|
| \`js/hr-paginationjs.min.js\` | A biblioteca (use este em produção) |
| \`js/hr-paginationjs.js\` | Versão legível. O Joomla 3 a carrega no lugar da \`.min\` quando o debug está ligado |
| \`js/pagination-2.6.0.min.js\` | Pagination.js 2.6.0 (MIT, licença ao lado) |
| \`css/hr-paginationjs.min.css\` | Estilos isolados em \`.hrpjs\` (+ versão legível) |
| \`joomla3/\` | Controller e view de exemplo com OrmTables, InputHelper, PermissionHelper e ApiResponseHelper |

jQuery **não** está incluído: use o que a página já tem (1.7 ou superior, inclusive *slim*; no Joomla 3,
\`JHtml::_('jquery.framework')\`).

## Ordem de carregamento

\`\`\`html
<link rel="stylesheet" href="/hr-paginationjs/css/hr-paginationjs.min.css">
<script src="/js/jquery.min.js"></script>                            <!-- 1. o jQuery que já existe -->
<script src="/hr-paginationjs/js/pagination-2.6.0.min.js"></script>  <!-- 2. -->
<script src="/hr-paginationjs/js/hr-paginationjs.min.js"></script>   <!-- 3. -->
\`\`\`

No Joomla 3, copie \`js/\` para \`media/com_seucomponente/js/\` e \`css/\` para \`media/com_seucomponente/css/\`:

\`\`\`php
JHtml::_('jquery.framework');
JHtml::_('script', 'com_seucomponente/pagination-2.6.0.min.js', array('relative' => true, 'version' => 'auto'));
JHtml::_('script', 'com_seucomponente/hr-paginationjs.min.js', array('relative' => true, 'version' => 'auto'));
JHtml::_('stylesheet', 'com_seucomponente/hr-paginationjs.min.css', array('relative' => true, 'version' => 'auto'));
\`\`\`

Depois disso a tela é só HTML (\`data-paginationjs-*\`). Documentação completa: \`docs/index.html\` no repositório.

No Laravel, copie \`js/\` e \`css/\` para \`public/vendor/hr-paginationjs/\`, tenha \`<meta name="csrf-token" content="{{ csrf_token() }}">\`
no layout e use \`ResponseService::paginated()\` ou, com \`paginate()\` puro / API Resource,
\`data-paginationjs-adapter="laravel"\`. Guia: \`docs/laravel.html\` no repositório.

Toda regra precisa ser revalidada no servidor: coluna oculta ou botão escondido não é controle de acesso.
`
entradas.push(['LEIAME.md', Buffer.from(leiame.replace(/\n/g, '\r\n'), 'utf8')])

// ---- zip (PKZIP 2.0, deflate) ----
const tabelaCrc = new Uint32Array(256).map((_, n) => {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    return c >>> 0
})
function crc32(buf) {
    let c = 0xffffffff
    for (let i = 0; i < buf.length; i++) c = tabelaCrc[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
    return (c ^ 0xffffffff) >>> 0
}

const agora = new Date()
const horaDos = (agora.getHours() << 11) | (agora.getMinutes() << 5) | (agora.getSeconds() >> 1)
const dataDos = ((agora.getFullYear() - 1980) << 9) | ((agora.getMonth() + 1) << 5) | agora.getDate()
const prefixo = `hr-paginationjs-${versao}/`

const partes = []
const central = []
let deslocamento = 0
for (const [caminho, dados] of entradas) {
    const nome = Buffer.from(prefixo + caminho, 'utf8')
    const comprimido = deflateRawSync(dados, { level: 9 })
    const crc = crc32(dados)

    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4) // versão necessária
    local.writeUInt16LE(0x0800, 6) // nomes em UTF-8
    local.writeUInt16LE(8, 8) // deflate
    local.writeUInt16LE(horaDos, 10)
    local.writeUInt16LE(dataDos, 12)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(comprimido.length, 18)
    local.writeUInt32LE(dados.length, 22)
    local.writeUInt16LE(nome.length, 26)
    local.writeUInt16LE(0, 28)
    partes.push(local, nome, comprimido)

    const cabecalho = Buffer.alloc(46)
    cabecalho.writeUInt32LE(0x02014b50, 0)
    cabecalho.writeUInt16LE(20, 4) // feito por
    cabecalho.writeUInt16LE(20, 6)
    cabecalho.writeUInt16LE(0x0800, 8)
    cabecalho.writeUInt16LE(8, 10)
    cabecalho.writeUInt16LE(horaDos, 12)
    cabecalho.writeUInt16LE(dataDos, 14)
    cabecalho.writeUInt32LE(crc, 16)
    cabecalho.writeUInt32LE(comprimido.length, 20)
    cabecalho.writeUInt32LE(dados.length, 24)
    cabecalho.writeUInt16LE(nome.length, 28)
    cabecalho.writeUInt32LE(deslocamento, 42)
    central.push(cabecalho, nome)

    deslocamento += local.length + nome.length + comprimido.length
}

const tamanhoCentral = central.reduce((s, b) => s + b.length, 0)
const fim = Buffer.alloc(22)
fim.writeUInt32LE(0x06054b50, 0)
fim.writeUInt16LE(entradas.length, 8)
fim.writeUInt16LE(entradas.length, 10)
fim.writeUInt32LE(tamanhoCentral, 12)
fim.writeUInt32LE(deslocamento, 16)

const saida = join(raiz, 'pacote', `hr-paginationjs-${versao}.zip`)
mkdirSync(dirname(saida), { recursive: true })
const zip = Buffer.concat([...partes, ...central, fim])
writeFileSync(saida, zip)
console.log(`pacote/hr-paginationjs-${versao}.zip: ${entradas.length} arquivos, ${(zip.length / 1024).toFixed(0)} KB`)
```
