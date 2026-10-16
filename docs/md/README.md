# hr-paginationjs — documentação

Micro-framework de listagens remotas para Joomla 3 / PHP 7.0. Toda a tela é configurada por atributos
`data-paginationjs-*`; JavaScript só é necessário para integrações específicas (eventos e API).

Pagination.js 2.6.0 desenha **apenas os botões de página**. Requisição, estado, busca, filtros, ordenação,
renderização, colunas, preferências e erros pertencem ao hr-paginationjs.

> **Dica:** procurando como fazer algo? Comece pelos **[Exemplos](exemplos.md)** — receitas prontas para copiar,
> organizadas por recurso.

## Índice

1. [Instalação e ordem de carregamento](instalacao.md)
2. [Primeira tela em 2 minutos](primeira-tela.md)
3. [Referência de atributos do elemento raiz](atributos.md)
4. [Colunas: definição, formatação, templates e visibilidade](colunas.md)
5. [Busca, filtros e ordenação](busca-filtros-ordenacao.md)
6. [Controles declarativos (toolbar, paginação, resumo, seletor de colunas)](controles.md)
7. [Ações por linha (inclusive remotas com token CSRF)](acoes.md)
8. [API JavaScript — cada método](api-js.md)
9. [Eventos `hrpaginationjs:*`](eventos.md)
10. [Contrato da API (backend) e adaptadores](backend.md)
11. [Preferências, estado na URL e cache](preferencias-url-cache.md)
12. [Opções do Pagination.js (`data-paginationjs-options`)](paginationjs-opcoes.md)
13. [Acessibilidade e segurança](acessibilidade-seguranca.md)
14. [Testes](testes.md)

## Arquivos

| Caminho | Conteúdo |
|---|---|
| `dist/hr-paginationjs.min.js` / `.min.css` | **Arquivos para produção** (gerados por `npm run build`). |
| `dist/hr-paginationjs.js` / `.css` | Versões legíveis (depuração / Joomla em modo debug). |
| `dist/pagination-2.6.0.min.js` | Pagination.js 2.6.0 (MIT). |
| `src/hr-paginationjs.js` / `.css` | Fonte para desenvolvimento (um IIFE, sem imports). |
| `build.mjs`, `scripts/` | Build (esbuild), geração da documentação e pacote zip. |
| `vendor/jquery-1.12.4.min.js` | Só para os exemplos fora do Joomla. No Joomla, ou em qualquer site, use o jQuery que já existe (1.7 ou superior, inclusive *slim*). |
| `exemplos/minimo.html` | Exemplo mínimo. |
| `exemplos/index.php` | Exemplo realista (duas listagens, filtros, ações, URL, preferências). |
| `exemplos/api.php`, `exemplos/api-datatables.php` | APIs de demonstração (contrato `ApiResponseHelper` e DataTables). |
| `exemplos/joomla3/` | Controller e view reais usando os helpers do projeto. |
| `tests/` | Testes (navegador e Node + jsdom). |

## Esta documentação

Leia no navegador: `docs/index.html` (ex.: `http://localhost/paginatorjs/docs/`). Funciona também abrindo o
arquivo direto, sem servidor.

As páginas `.html` são geradas a partir de `docs/md/*.md` (a fonte). Depois de editar um `.md`, regere:

```bash
npm install
npm run docs
```

## Comandos

| Comando | O que faz |
|---|---|
| `npm install` | Instala as ferramentas de desenvolvimento (esbuild, jsdom, marked). A biblioteca em si não tem dependências npm. |
| `npm run build` | Gera `dist/` (`.js`, `.min.js`, `.css`, `.min.css`, Pagination.js) e `dist/sizes.json`. |
| `npm test` | 39 testes contra `src/`. |
| `npm run test:dist` | Os mesmos 39 testes contra `dist/hr-paginationjs.min.js`. |
| `npm run test:all` | build + os dois acima. |
| `npm run docs` | Gera `docs/*.html` a partir de `docs/md/`. |
| `npm run pacote` | build + `pacote/hr-paginationjs-<versão>.zip` para levar aos projetos. |
| `npm run serve` | Servidor PHP em `http://127.0.0.1:8080/` (exemplos em `/exemplos/`, docs em `/docs/`). |

## Rodar os exemplos

Com o Laragon: `http://localhost/paginatorjs/exemplos/` (o `index.php` precisa de PHP).
Sem o Laragon: `npm run serve` e abra `http://127.0.0.1:8080/exemplos/`.

## Núcleo, extensões e fora do escopo

| Núcleo (pronto) | Extensões (por adaptador/formatador/evento) | Fora do escopo desta versão |
|---|---|---|
| Paginação remota, busca, filtros tipados, ordenação, colunas, preferências, URL, cache opcional, ações por linha, eventos, estados, múltiplas instâncias, `destroy()` | Adaptadores de API próprios (`HrPaginationjs.adapter`), formatadores (`HrPaginationjs.formatter`), modais próprios via evento `action` | Exportação, seleção em lote, edição inline, reordenar/redimensionar colunas, virtualização |
