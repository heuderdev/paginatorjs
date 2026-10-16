# Contrato da API e adaptadores

## Adaptador padrão `apiresponse` — `ApiResponseHelper::paginated()`

O contrato oficial é o retorno real de `ApiResponseHelper::paginated($resultadoDoOrmBasePaginate)`.
O helper **não** precisa de nenhuma alteração.

### Requisição

| Parâmetro | Origem | Lido no PHP por |
|---|---|---|
| `page` | página atual (≥ 1) | `InputHelper::pagination($padrao, $maximo)` |
| `limit` | quantidade por página | `InputHelper::pagination($padrao, $maximo)` |
| `sort` | **key** da coluna (só se houver ordenação) | `InputHelper::sorting($permitidos, $padrao, $dir)` |
| `direction` | `asc` ou `desc` (o helper converte para maiúsculas) | `InputHelper::sorting(...)` |
| `search` | termo (só se não vazio) | `InputHelper::filters(array('search' => 'string'))` |
| `<filtro>` / `<filtro>[]` | cada filtro (vazios não são enviados) | `InputHelper::filters(array('status' => 'array', ...))` |
| fixos | `data-paginationjs-params` | — |

- Método `GET` por padrão. `&format=json` **não** é necessário: a biblioteca envia `X-Requested-With: XMLHttpRequest`
  (só para a mesma origem, como o jQuery fazia) e `Accept: application/json`, que o `ApiResponseHelper` já reconhece.
- Cada `GET` leva um parâmetro `_=<timestamp>` para impedir cache do navegador (mesmo comportamento do `cache: false`
  do jQuery). `InputHelper` ignora esse parâmetro.
- `POST` (listagem com `data-paginationjs-method="POST"` e ações) vai como `application/x-www-form-urlencoded; charset=UTF-8`.
- A requisição usa `XMLHttpRequest` nativo, sem depender de `$.ajax`.
- Para renomear: `data-paginationjs-names='{"page":"pagina","search":"busca"}'`.
- Um filtro com o mesmo nome de um parâmetro reservado é ignorado (aviso no console).

### Resposta esperada

```json
{
    "success": true,
    "status": "sucesso",
    "mensagem": "Registros carregados.",
    "data": [ { "id": 1, "nome": "Ana" } ],
    "errors": [],
    "request_id": "6bf735c3d97b99f4",
    "meta": {
        "paginacao": { "total": 135, "por_pagina": 20, "pagina_atual": 1, "total_paginas": 7 }
    }
}
```

Validação feita pela biblioteca:

| Situação | Resultado |
|---|---|
| `success` não é booleano, `data` não é lista ou `meta.paginacao.total` não é número ≥ 0 | erro `invalid` (nunca vira lista vazia) |
| `success: false` (mesmo com HTTP 200) | erro `api`, exibindo `mensagem` |
| HTTP 401 / 403 | erro `session` / `permission` |
| OK | `data` = linhas da página; `total` vem **sempre** de `meta.paginacao.total` (nunca de `data.length`) |

`por_pagina` e `pagina_atual` devolvidos passam a ser o estado efetivo. `request_id` (ou o cabeçalho
`X-Request-Id`) é guardado e mostrado na mensagem de erro para diagnóstico. `errors` é repassado como veio
(o helper normaliza para `{ "campo": ["msg"] }`, ou `[]` quando vazio).

### Controller de referência (PHP 7.0 / Joomla 3)

```php
public function listar()
{
    try {
        if (!PermissionHelper::require('core.manage', 'com_loja')) {
            return;
        }

        // key pública -> coluna real (lista branca). Nada do navegador vira SQL.
        $mapa = array('id' => 'id', 'nome' => 'nome', 'criado' => 'created_at');

        $pagina = InputHelper::pagination(20, 100);                              // teto de 100 por página
        $ordem = InputHelper::sorting(array_keys($mapa), 'criado', 'DESC');

        $query = $this->filtrar(OrmTables::table('#__loja_clientes')->select('id, nome, created_at'))
            ->orderBy($mapa[$ordem['field']], $ordem['direction'])
            ->orderBy('id', 'DESC');                                              // desempate estável

        return ApiResponseHelper::paginated($query->paginate($pagina['limit'], $pagina['page']));
    } catch (Throwable $e) {
        return ApiResponseHelper::exception($e);
    }
}
```

`OrmBase::paginate()` conta com **os mesmos filtros** e aplica `LIMIT/OFFSET` no banco. O objeto `JPagination`
que ele devolve é descartado pelo `paginated()` (não é serializado).

### Página além da última

`OrmBase::paginate()` não corrige a página: devolve `data: []` com o `total` real. A biblioteca detecta
`data` vazio + `total > 0` + página > última e faz **uma** nova requisição para a última página. Se essa ainda
vier vazia (registros apagados no meio), mostra o estado vazio — nunca entra em ciclo.

## Adaptador `laravel`

`data-paginationjs-adapter="laravel"` — envia os mesmos parâmetros do padrão (`page`, `limit`, `sort`,
`direction`, `search`, filtros) e aceita três respostas:

| Resposta | Lido |
|---|---|
| `paginate()` puro | `data`, `total`, `per_page`, `current_page`, `last_page` |
| API Resource (`Resource::collection($paginator)`) | `data` e `meta.total`, `meta.per_page`, `meta.current_page`, `meta.last_page` |
| `ResponseService::paginated()` | igual ao adaptador `apiresponse` |

Sem `total` numérico (ex.: `simplePaginate()`, `cursorPaginate()`) a resposta é tratada como inválida.
Guia completo: [Laravel](laravel.md).

## Adaptador `datatables` (APIs legadas)

`data-paginationjs-adapter="datatables"`

| Enviado | Valor |
|---|---|
| `draw` | número de sequência da requisição |
| `start` | `(página - 1) * limite` |
| `length` | limite |
| `search_value` | termo (se houver) |
| `order_col` | key da coluna (se houver ordenação) |
| `order_dir` | `asc` / `desc` |
| filtros | iguais ao padrão |

| Lido | Uso |
|---|---|
| `data` | linhas (obrigatório, lista) |
| `recordsFiltered` | total paginável (obrigatório, numérico) |
| `recordsTotal` | `totalAll` no evento `load` |
| `error` (string) | erro `api` |

Os nomes podem ser trocados com `data-paginationjs-names` (chaves: `draw`, `start`, `length`, `search`, `sort`, `direction`).

## Adaptador próprio

```js
HrPaginationjs.adapter('legado-xyz', {
    names: { page: 'pg', limit: 'qtd', search: 'q', sort: 'ord', direction: 'dir' },
    cacheExclude: [],
    params: function (state, ctx) {
        // state: { page, limit, search, sort, direction, filters } — devolve só os parâmetros de controle;
        // os filtros e os params fixos são acrescentados pela biblioteca.
        var p = {};
        p[ctx.names.page] = state.page;
        p[ctx.names.limit] = state.limit;
        if (state.search) p[ctx.names.search] = state.search;
        return p;
    },
    parse: function (body, ctx) {
        if (!body || !Array.isArray(body.itens)) throw ctx.error('invalid');
        if (body.ok === false) throw ctx.error('api', body.msg);
        return { rows: body.itens, total: body.quantidade, page: ctx.state.page, limit: ctx.state.limit };
    }
});
```

`parse` deve devolver `{ rows, total }` (e opcionalmente `page`, `limit`, `totalPages`, `totalAll`, `message`,
`requestId`) ou lançar `ctx.error(kind, mensagem?, errors?)`. O núcleo não conhece nenhum formato legado.

## Exportação

Não faz parte do núcleo. Se precisar, use o endpoint de exportação existente (ex.: `ExportHelper`) com os
mesmos filtros: `getState()` entrega `search`, `filters`, `sort` e `direction` para montar o link, e o backend
deve aplicar as mesmas permissões da listagem. Não carregue todos os registros no navegador para exportar.
