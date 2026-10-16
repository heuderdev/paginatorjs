# Atributos do elemento raiz

O elemento raiz é o que tem `data-paginationjs`. Ele deve conter uma `<table>` com `<thead>`.
Todo atributo tem um equivalente em JavaScript (segunda coluna) para quem inicia com
`HrPaginationjs.init(el, opcoes)`; a opção JS tem precedência sobre o atributo.

| Atributo | Opção JS | Padrão | Descrição |
|---|---|---|---|
| `data-paginationjs` | — | — | Marca a listagem. Valor `manual` impede a inicialização automática. |
| `data-paginationjs-remote` | `remote` | **obrigatório** | Endpoint. Aceita URL relativa, `http` ou `https`. Outros esquemas são recusados. |
| `data-paginationjs-id` | `id` | `id` do elemento | Identificador **estável** da listagem (preferências, URL, `get()`). Obrigatório se o elemento não tiver `id`. |
| `data-paginationjs-method` | `method` | `GET` | `GET` ou `POST`. |
| `data-paginationjs-adapter` | `adapter` | `apiresponse` | `apiresponse` (contrato do `ApiResponseHelper`) ou `datatables`, ou um adaptador registrado. |
| `data-paginationjs-names` | `names` | ver [backend](backend.md) | JSON que renomeia os parâmetros enviados. Ex.: `{"search":"busca"}`. |
| `data-paginationjs-limit` | `limit` | `20` | Registros por página iniciais. |
| `data-paginationjs-limits` | `limits` | `10,20,50,100` | Opções do seletor de quantidade (o `limit` é incluído se faltar). |
| `data-paginationjs-sort` | `sort` | (nenhuma) | Chave da coluna ordenada inicialmente. Precisa ser `data-paginationjs-sortable`. |
| `data-paginationjs-direction` | `direction` | `asc` | `asc` ou `desc`. |
| `data-paginationjs-debounce` | `debounce` | `400` | Espera (ms) da busca enquanto se digita. |
| `data-paginationjs-min-chars` | `minChars` | `0` | Mínimo de caracteres para buscar. Termo vazio sempre limpa a busca. |
| `data-paginationjs-timeout` | `timeout` | `30000` | Tempo limite (ms) de cada requisição. `0` = sem limite. |
| `data-paginationjs-params` | `params` | `{}` | JSON com parâmetros fixos enviados sempre. Ex.: `{"categoria":3}`. Nunca coloque segredos. |
| `data-paginationjs-row-key` | `rowKey` | `id` | Campo (aceita `a.b`) que identifica a linha nas ações. |
| `data-paginationjs-autoload` | `autoload` | `true` | `false` = não carrega ao iniciar (use `reload()`). |
| `data-paginationjs-locale` | `locale` | `lang` do `<html>` ou `pt-BR` | Idioma dos formatadores. |
| `data-paginationjs-currency` | `currency` | `BRL` | Moeda do formatador `money`. |
| `data-paginationjs-toolbar` | `toolbar` | (nenhuma) | Monta controles prontos no topo: `search`, `limit`, `columns`, `reload`, `clear` (na ordem informada). |
| `data-paginationjs-persist` | `persist` | desligado | Liga preferências. Sem valor = `columns,limit,sort`. Lista explícita aceita também `search` e `filters`. |
| `data-paginationjs-namespace` | `namespace` | `app` | Parte da chave de preferências. |
| `data-paginationjs-user` | `user` | `anon` | Identificador do usuário para a chave de preferências (use o id, nunca dados sensíveis). |
| `data-paginationjs-version` | `version` | `1` | Versão do esquema de preferências. Aumente para descartar preferências antigas. |
| `data-paginationjs-url` | `url` | desligado | Guarda página, quantidade, ordem, busca e filtros na URL. |
| `data-paginationjs-url-prefix` | `urlPrefix` | `{id}_` | Prefixo dos parâmetros na URL (necessário com várias listagens). |
| `data-paginationjs-url-history` | `urlHistory` | `replace` | `push` cria entradas no histórico (voltar/avançar navegam entre estados). |
| `data-paginationjs-cache` | `cache` | `0` | Validade do cache em **segundos** (0 = sem cache). |
| `data-paginationjs-cache-max` | `cacheMax` | `20` | Máximo de respostas guardadas por instância. |
| `data-paginationjs-page-range` | `paginationOptions.pageRange` | `2` | Páginas exibidas ao redor da atual. |
| `data-paginationjs-options` | `paginationOptions` | `{}` | JSON com opções do Pagination.js. Ver [paginationjs-opcoes.md](paginationjs-opcoes.md). |
| `data-paginationjs-text-*` | `texts` | ver abaixo | Troca qualquer texto. Ex.: `data-paginationjs-text-empty="Nenhum cliente."` |

Opções só de JavaScript: `headers` (cabeçalhos extras), `token` (token CSRF explícito), `formatters`
(formatadores locais da instância) e `transport` (função de transporte; usada nos testes).

## Textos (`data-paginationjs-text-*`)

O nome do atributo é o nome da chave em minúsculas com hífen (`summaryEmpty` → `data-paginationjs-text-summary-empty`).
Para mudar o padrão de todas as listagens: `HrPaginationjs.texts.empty = '...'` antes do `DOMContentLoaded`.

| Chave | Padrão |
|---|---|
| `loading` | `Carregando…` |
| `empty` | `Nenhum registro encontrado.` |
| `idle` | (vazio) — mostrado quando `autoload=false` |
| `retry` | `Tentar novamente` |
| `summary` | `Exibindo {start} a {end} de {total} registros` (também `{page}` e `{pages}`) |
| `summaryEmpty` | `Nenhum registro` |
| `search`, `searchPlaceholder`, `limit`, `columns`, `columnsReset`, `columnRequired`, `reload`, `clear` | rótulos dos controles |
| `pagination`, `page`, `previous`, `next` | rótulos acessíveis da paginação (`page` usa `{page}`) |
| `requestId` | `Código para suporte: {id}` |
| `yes`, `no` | formatador `bool` |
| `errorNetwork`, `errorTimeout`, `errorHttp` (`{status}`), `errorInvalid`, `errorApi`, `errorSession`, `errorPermission`, `errorConfig` | mensagens de erro (quando o servidor não enviar `mensagem`) |
| `actionDone`, `actionError` | ações remotas sem mensagem do servidor |

## Precedência do estado inicial

**URL** (se `data-paginationjs-url`) **> preferências salvas** (se `data-paginationjs-persist`) **> HTML**
(atributos e valores já preenchidos nos campos de filtro/busca).
