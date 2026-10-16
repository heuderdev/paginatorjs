# API JavaScript

A tela não precisa de JavaScript. A API existe para integrações (modais, botões externos, outras bibliotecas).

## Objeto global `HrPaginationjs`

| Método | Retorno | Descrição |
|---|---|---|
| `HrPaginationjs.init(alvo, opcoes?)` | instância | Inicia uma listagem. `alvo` = id, seletor, elemento ou objeto jQuery. Se já iniciada, devolve a mesma instância. Lança erro claro se faltar dependência ou configuração. |
| `HrPaginationjs.get(alvo)` | instância ou `null` | Busca por id do elemento, `data-paginationjs-id`, seletor ou elemento. |
| `HrPaginationjs.scan(contexto?)` | lista de instâncias | Inicia os `[data-paginationjs]` ainda não iniciados dentro de `contexto` (padrão: `document`). Erros vão para o console sem interromper as outras. |
| `HrPaginationjs.instances()` | lista | Instâncias ativas. |
| `HrPaginationjs.formatter(nome, fn)` | — | Registra um formatador global ([colunas.md](colunas.md)). |
| `HrPaginationjs.adapter(nome, def)` | — | Registra um adaptador de API ([backend.md](backend.md)). |
| `HrPaginationjs.html(string)` | marcador | Retorno de formatador que deve ser inserido como HTML. |
| `HrPaginationjs.findToken()` | string | Token CSRF descoberto na página. |
| `HrPaginationjs.serialize(objeto)` | string | Serializa parâmetros como o PHP espera (`uf[]=SP&uf[]=RJ`); mesma saída do `jQuery.param`, sem depender dele. |
| `HrPaginationjs.texts` | objeto | Textos padrão (altere antes do `DOMContentLoaded`). |
| `HrPaginationjs.version` | string | `1.0.0`. |

```js
var lista = HrPaginationjs.get('clientes');
```

## Métodos da instância

Resumo do comportamento:

| Método | Faz requisição? | Página | Retorno |
|---|---|---|---|
| `reload()` | Sim (ignora e limpa o cache) | preserva | `Promise` |
| `setPage(n)` | Sim | `n` | `Promise` |
| `setLimit(n)` | Sim | 1 | `Promise` |
| `setSearch(termo)` | Sim | 1 | `Promise` |
| `setFilter(nome, valor)` | Sim | 1 | `Promise` |
| `setFilters(objeto, substituir?)` | Sim | 1 | `Promise` |
| `clearFilters()` | Sim | 1 | `Promise` |
| `setSort(key, direcao?)` | Sim | 1 | `Promise` |
| `showColumn(key)` / `hideColumn(key)` / `toggleColumn(key, forcar?)` | **Não** | preserva | `boolean` |
| `resetColumns()` | **Não** | preserva | `boolean` |
| `resetPreferences()` | Sim | 1 | `Promise` |
| `getState()` | Não | — | objeto (cópia) |
| `getRows()` | Não | — | lista (cópia) |
| `destroy()` | cancela a pendente | — | — |

**Todos podem ser chamados durante um carregamento.** A requisição anterior é cancelada e, se a resposta dela
ainda chegar, é descartada pelo número de sequência. As `Promise` de chamadas superadas resolvem junto com a
mais recente.

### Promises

- **Resolvem** com `getState()` depois que a página foi renderizada.
- **Rejeitam** com o erro classificado (veja abaixo). Chamar o método e ignorar o retorno é seguro: a
  biblioteca marca a própria rejeição como tratada. Se você encadear `.then(...)`, termine com `.catch(...)`
  (a nova promise criada pelo `.then` é sua).

```js
lista.setFilter('status', 'ativo')
    .then(function (estado) { console.log(estado.total); })
    .catch(function (erro) { if (erro.kind === 'session') location.reload(); });
```

### `reload()`

Recarrega a página atual com os mesmos parâmetros, sempre indo ao servidor. Use após salvar um registro num modal.

### `setPage(n)`

Vai para a página `n` (≥ 1). Se `n` passar da última página, o servidor devolve a lista vazia e a biblioteca
corrige **uma única vez** para a última página válida. `n < 1` rejeita com `kind: 'config'`.

### `setLimit(n)`

Muda a quantidade por página e volta para a página 1. O servidor pode reduzir o valor (teto do
`InputHelper::pagination`); o estado passa a usar o `por_pagina` devolvido.

### `setSearch(termo)`

Define a busca imediatamente (sem debounce) e sincroniza os campos `data-paginationjs-search`. `''`/`null` limpa.

### `setFilter(nome, valor)` / `setFilters(objeto, substituir?)`

Normaliza pelo tipo do campo de mesmo nome (`number`, `bool`, `date`…). `''`, `null`, `[]` removem o filtro.
`setFilters({...})` mescla; `setFilters({...}, true)` substitui todos. Os campos do formulário são atualizados.

```js
lista.setFilters({ status: 'ativo', uf: ['SP', 'RJ'] });
```

### `clearFilters()`

Remove todos os filtros (mantém a busca).

### `setSort(key, direcao?)`

`key` precisa ser uma coluna `data-paginationjs-sortable` (senão rejeita com `kind: 'config'`).
Sem `direcao`: alterna se já for a coluna atual; senão usa `data-paginationjs-sort-first`.
`setSort('')` remove a ordenação.

### `showColumn(key)` / `hideColumn(key)` / `toggleColumn(key, forcar?)`

Alteram só a interface. Retornam `false` quando a mudança não é permitida (coluna inexistente, obrigatória ou
última coluna de dados). Disparam `hrpaginationjs:columnschange` e salvam a preferência (se ligada).

### `resetColumns()`

Volta a visibilidade definida no HTML.

### `resetPreferences()`

Apaga as preferências salvas e volta colunas, quantidade e ordenação (e busca/filtros, se eram persistidos) ao
padrão do HTML. Recarrega a partir da página 1.

### `getState()`

```js
{
    id: 'clientes',
    page: 2, limit: 20, search: 'ana',
    filters: { status: 'ativo', uf: ['SP'] },
    sort: 'nome', direction: 'asc',
    columns: ['id', 'nome', 'email'],      // visíveis, na ordem da tabela
    hiddenColumns: ['site'],
    loading: false,
    error: null,                           // ou o objeto de erro
    total: 135, totalPages: 7,
    requestId: '5f2c…'
}
```

É uma cópia: alterar o objeto não altera a listagem.

### `getRows()`

Cópia das linhas da página atual.

### `destroy()`

Cancela a requisição pendente, limpa timers, remove todos os listeners (inclusive `popstate`), destrói o
Pagination.js, remove tudo o que a biblioteca criou, restaura os `<th>` e o `<tbody>` originais e libera o
registro. Depois disso, `HrPaginationjs.init()` no mesmo elemento cria uma instância nova, sem duplicações.

## Erros

Objeto entregue em rejeições, em `getState().error` e no evento `hrpaginationjs:error`:

```js
{ kind: 'api', status: 200, message: 'Filtro inválido.', errors: { status: ['…'] }, requestId: 'abc' }
```

| `kind` | Quando |
|---|---|
| `network` | Sem conexão / servidor inacessível (status 0). |
| `timeout` | Passou de `data-paginationjs-timeout`. |
| `http` | HTTP ≥ 400 (exceto 401/403). |
| `invalid` | Não é JSON, ou JSON fora do contrato (sem `success`, sem `meta.paginacao.total`, `data` não é lista…). |
| `api` | Envelope válido com `success: false` (mesmo com HTTP 200). |
| `session` | HTTP 401. |
| `permission` | HTTP 403. |
| `abort` | Cancelamento voluntário (só aparece se a requisição foi cancelada sem outra no lugar). |
| `config` | Uso incorreto da API (ex.: `setSort` em coluna não ordenável). |
| `destroyed` | A instância foi destruída antes da resposta. |

`message` usa a `mensagem` do servidor quando existir (o `ApiResponseHelper` já entrega mensagens públicas);
caso contrário, um texto padrão. Detalhes internos nunca são exibidos.
