# Busca, filtros e ordenação

Tudo é executado **no servidor**. A biblioteca só monta os parâmetros, cancela o que ficou velho e redesenha.

## Busca

```html
<input type="search" data-paginationjs-search aria-label="Buscar clientes">
```

| Comportamento | Regra |
|---|---|
| Parâmetro enviado | `search` (renomeie com `data-paginationjs-names='{"search":"busca"}'`). |
| Digitando | Espera `data-paginationjs-debounce` ms (padrão 400) sem novas teclas. |
| `Enter` | Busca na hora (cancela a espera). |
| Composição de texto (IME, acentos em alguns teclados) | Não busca enquanto compõe; busca ao terminar. |
| Termo vazio | Remove o parâmetro `search` → lista sem busca. |
| Menos que `data-paginationjs-min-chars` | Não faz requisição e mantém o resultado atual. |
| Mesmo termo de antes | Não faz requisição. |
| Página | Volta para 1. |
| Espaços | Removidos nas pontas (`trim`). |

Acentos e maiúsculas: a biblioteca envia o termo como foi digitado. Se a busca ignora acentos/maiúsculas
depende do backend (no MySQL, da collation da coluna; `utf8mb4_unicode_ci` ignora ambos). Não prometa busca
sem acento se o backend não a implementa.

Vários campos de busca da mesma listagem ficam sincronizados.

## Filtros

Duas formas de declarar — podem ser misturadas:

```html
<!-- 1. Formulário: todo campo com name vira filtro -->
<form data-paginationjs-filters>
    <select name="status">…</select>
    <input type="date" name="de">
</form>

<!-- 2. Campo avulso -->
<select name="categoria" data-paginationjs-filter>…</select>
```

Use `data-paginationjs-ignore` num campo do formulário que não deve ser filtro.

### Tipos e serialização

| Controle | Valor enviado |
|---|---|
| `input`, `textarea`, `select` simples | string (vazio = filtro não enviado) |
| `data-paginationjs-type="number"` | número (`10,5` → `10.5`); inválido = não enviado |
| `data-paginationjs-type="int"` | inteiro |
| `data-paginationjs-type="bool"` | `1` ou `0` (aceita `true/false`, `sim/não`, `on/off`) |
| `type="date"` ou `data-paginationjs-type="date"` | `YYYY-MM-DD` válido; inválido = não enviado |
| `select multiple` | lista → `nome[]=a&nome[]=b` |
| vários `checkbox` com o mesmo `name` (ou `name="x[]"`) | lista → `x[]=a&x[]=b` |
| um único `checkbox` | marcado = `value` (ou `1`); desmarcado = filtro não enviado |
| `radio` | valor do marcado |

O `[]` do final do `name` é removido do nome do filtro (`uf[]` → filtro `uf`); na hora de enviar, a lista volta ao
formato `uf[]=SP`, que o PHP/`InputHelper::filters(array('uf' => 'array'))` entende. A serialização é feita por
`HrPaginationjs.serialize()`, que gera exatamente a mesma saída do `jQuery.param` (verificado nos testes), com
`encodeURIComponent` em cada nome e valor — nada é concatenado manualmente na URL.

### Quando o filtro é aplicado

| Situação | Padrão (`apply="change"`) | `<form data-paginationjs-filters data-paginationjs-apply="submit">` |
|---|---|---|
| `change` de select/checkbox/radio/data | aplica | não aplica |
| `Enter` num campo de texto | aplica | envia o formulário → aplica |
| `submit` do formulário | aplica (busca + filtros numa só requisição) | aplica |

Toda mudança de filtro volta para a **página 1** e gera **uma** requisição (as anteriores são canceladas).

### Limpar

```html
<button type="button" data-paginationjs-clear>Limpar tudo</button>          <!-- busca + filtros -->
<button type="button" data-paginationjs-clear="filters">Limpar filtros</button>
<button type="button" data-paginationjs-clear="search">Limpar busca</button>
```

Filtros definidos só por JavaScript (`setFilter`) sem campo correspondente são mantidos quando os campos mudam e
removidos por `clearFilters()`/`data-paginationjs-clear`.

## Ordenação

```html
<th data-paginationjs-key="criado" data-paginationjs-field="created_at"
    data-paginationjs-sortable data-paginationjs-sort-first="desc">Cadastro</th>
```

- Envia a **key** da coluna (`sort=criado&direction=desc`), nunca o nome real do campo nem a posição.
  O backend traduz por lista branca (veja [backend.md](backend.md)).
- Só colunas `data-paginationjs-sortable` podem ser ordenadas (inclusive via `setSort`).
- Clique na mesma coluna alterna `asc`/`desc`; em outra coluna usa `sort-first`.
- O `<th>` ganha `aria-sort="ascending|descending"` e o ícone `▲`/`▼` (`↕` nas demais) — não depende só de cor.
- **Mudar a ordenação volta para a página 1** (a página N de outra ordem não tem relação com a atual).
- Ordem inicial: `data-paginationjs-sort` + `data-paginationjs-direction`.
- Sem ordenação definida, nenhum `sort` é enviado e o backend usa o seu padrão (que deve ser determinístico).
