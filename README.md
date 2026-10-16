# hr-paginationjs

Listagens remotas declarativas para Joomla 3 / PHP 7.0 e Laravel (Blade): paginação no servidor, busca, filtros tipados, ordenação,
seletor de colunas, preferências, estado na URL e ações por linha — tudo por atributos `data-paginationjs-*`,
no contrato do `ApiResponseHelper::paginated()`. O Pagination.js 2.6.0 desenha só os botões de página.

```html
<link rel="stylesheet" href="/dist/hr-paginationjs.min.css">

<div id="clientes" data-paginationjs
     data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar"
     data-paginationjs-toolbar="search,limit,columns,reload">
    <table>
        <thead>
            <tr>
                <th data-paginationjs-key="id" data-paginationjs-sortable data-paginationjs-required>ID</th>
                <th data-paginationjs-key="nome" data-paginationjs-sortable>Nome</th>
                <th data-paginationjs-key="email">E-mail</th>
            </tr>
        </thead>
    </table>
</div>

<script src="/js/jquery.min.js"></script>                 <!-- o jQuery que já existe (1.7 a 4.x, inclusive slim) -->
<script src="/dist/pagination-2.6.0.min.js"></script>
<script src="/dist/hr-paginationjs.min.js"></script>
```

## Arquivos

| Caminho | Conteúdo |
|---|---|
| `dist/` | **Saída do build**: `hr-paginationjs.min.js` (51 KiB, 17 KiB gzip), `hr-paginationjs.min.css`, versões legíveis, Pagination.js e `sizes.json` |
| `src/` | Fonte (um IIFE sem imports + CSS) |
| `docs/` | Documentação em HTML — abra [docs/index.html](docs/index.html). Fonte em `docs/md/` |
| `exemplos/` | Exemplo mínimo, exemplo realista com APIs PHP de demonstração e exemplo Joomla 3 real (`exemplos/joomla3/`) |
| `tests/` | 39 testes (navegador: `tests/runner.html`; Node + jsdom: `npm test`) |
| `build.mjs`, `scripts/` | Build (esbuild), documentação e pacote |
| `penssamento.md` | Checklist do desenvolvimento e registro do que foi executado |

## Build, execução e testes

```bash
npm install
npm run build          # gera dist/ (.js, .min.js, .css, .min.css) e dist/sizes.json
npm test               # 39 testes contra src/
npm run test:dist      # os mesmos 39 testes contra dist/hr-paginationjs.min.js
npm run test:all       # build + os dois acima
npm run docs           # gera docs/*.html a partir de docs/md/
npm run pacote         # build + pacote/hr-paginationjs-<versão>.zip (js, css, exemplo Joomla, LEIAME) para levar aos projetos
npm run serve          # http://127.0.0.1:8080/exemplos/ e /docs/
```

`npm install` instala só ferramentas de desenvolvimento (esbuild, jsdom, marked). A biblioteca não tem dependências
npm em tempo de execução: precisa apenas de jQuery ≥ 1.7 e do Pagination.js 2.6.0 (incluído em `dist/`).

Laravel: `ResponseService::paginated()`, `paginate()` puro ou API Resource (`data-paginationjs-adapter="laravel"`) — guia em [docs/laravel.html](docs/laravel.html).

Compatibilidade verificada com jQuery 1.7.2, 1.8.3, 1.9.1, 1.10.2, 1.11.3, 1.12.4, 2.2.4, 3.0.0, 3.3.1, 3.5.1,
3.7.1, 3.7.1 slim, 4.0.0 e 4.0.0 slim — detalhes em [docs/instalacao.html](docs/instalacao.html).
