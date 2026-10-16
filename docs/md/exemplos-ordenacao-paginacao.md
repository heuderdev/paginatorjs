# Ordenação e paginação

## Colunas ordenáveis

```html
<thead>
    <tr>
        <th data-paginationjs-key="id" data-paginationjs-sortable>ID</th>
        <th data-paginationjs-key="nome" data-paginationjs-sortable>Nome</th>
        <th data-paginationjs-key="email">E-mail</th>   <!-- não ordenável -->
    </tr>
</thead>
```

```http Clique em "Nome"
GET index.php?option=com_loja&task=clientes.listar&page=1&limit=20&sort=nome&direction=asc&_=...
```

```http Segundo clique em "Nome"
GET index.php?option=com_loja&task=clientes.listar&page=1&limit=20&sort=nome&direction=desc&_=...
```

```preview Cabeçalho ordenado por Nome (crescente)
<div class="hrpjs"><table class="hrpjs-table"><thead><tr><th><button type="button" class="hrpjs-sort">ID <span class="hrpjs-sort-icon">↕</span></button></th><th class="hrpjs-sorted-asc" aria-sort="ascending"><button type="button" class="hrpjs-sort">Nome <span class="hrpjs-sort-icon">▲</span></button></th><th>E-mail</th></tr></thead><tbody><tr><td>20</td><td>Ana Costa</td><td>ana.costa20@exemplo.com.br</td></tr><tr><td>1</td><td>Ana Silva</td><td>ana.silva1@exemplo.com.br</td></tr></tbody></table></div>
```

> **Como funciona:** o cabeçalho vira um `<button>` (teclado e leitor de tela), recebe `aria-sort` e o ícone
> ▲/▼. Mudar a ordenação volta para a página 1.

```php No controller: key pública → coluna real
$mapa = array('id' => 'id', 'nome' => 'nome', 'limite' => 'limite_credito', 'criado' => 'created_at');
$ordem = InputHelper::sorting(array_keys($mapa), 'criado', 'DESC');

$query->orderBy($mapa[$ordem['field']], $ordem['direction'])
      ->orderBy('id', 'DESC');   // desempate estável entre páginas
```

## Ordenação inicial

```html
<div id="clientes" data-paginationjs
     data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar"
     data-paginationjs-sort="criado"
     data-paginationjs-direction="desc">
    <table>
        <thead>
            <tr>
                <th data-paginationjs-key="nome" data-paginationjs-sortable>Nome</th>
                <th data-paginationjs-key="criado" data-paginationjs-field="created_at"
                    data-paginationjs-sortable data-paginationjs-format="datetime">Cadastro</th>
            </tr>
        </thead>
    </table>
</div>
```

```http
GET index.php?option=com_loja&task=clientes.listar&page=1&limit=20&sort=criado&direction=desc&_=...
```

## Primeiro clique decrescente

Para datas e valores, o usuário geralmente quer o maior primeiro.

```html
<th data-paginationjs-key="limite" data-paginationjs-field="limite_credito"
    data-paginationjs-sortable data-paginationjs-sort-first="desc"
    data-paginationjs-format="money">Limite</th>
```

## Sem ordenação definida

Sem `data-paginationjs-sort`, nenhum `sort` é enviado e o servidor usa o padrão dele (passado como segundo
argumento do `InputHelper::sorting`).

## Seletor de quantidade por página

```html
<div id="clientes" data-paginationjs
     data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar"
     data-paginationjs-limit="25"
     data-paginationjs-limits="10,25,50,100">
    <label>Mostrar <select data-paginationjs-page-size></select> por página</label>
    <table>...</table>
</div>
```

Ou com rótulos próprios nas opções:

```html
<select data-paginationjs-page-size aria-label="Registros por página">
    <option value="10">10 clientes</option>
    <option value="25">25 clientes</option>
    <option value="100">100 clientes</option>
</select>
```

> **Resultado:** trocar a quantidade volta para a página 1.

## Quantos botões de página aparecem

```html
<div ... data-paginationjs-page-range="1">   <!-- 1 página de cada lado da atual -->
```

```preview data-paginationjs-page-range="1", página 5 de 12
<div class="hrpjs"><div class="hrpjs-pager"><div class="paginationjs"><div class="paginationjs-pages"><ul>
<li class="paginationjs-prev"><a role="button" aria-label="Página anterior">‹</a></li>
<li class="paginationjs-page"><a role="button">1</a></li>
<li class="paginationjs-ellipsis disabled"><a aria-hidden="true">...</a></li>
<li class="paginationjs-page"><a role="button">4</a></li>
<li class="paginationjs-page active"><a aria-current="page">5</a></li>
<li class="paginationjs-page"><a role="button">6</a></li>
<li class="paginationjs-ellipsis disabled"><a aria-hidden="true">...</a></li>
<li class="paginationjs-page"><a role="button">12</a></li>
<li class="paginationjs-next"><a role="button" aria-label="Próxima página">›</a></li>
</ul></div></div></div></div>
```

## Campo “ir para a página”

Opções do Pagination.js passam por `data-paginationjs-options` (JSON).

```html
<div id="clientes" data-paginationjs
     data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar"
     data-paginationjs-options='{"showGoInput": true, "showGoButton": true, "goButtonText": "Ir"}'>
    ...
</div>
```

> **Dica:** digitar uma página maior que a última leva para a última.

## Textos de anterior/próxima e reticências

```html
<div ... data-paginationjs-options='{"prevText": "« Anterior", "nextText": "Próxima »", "ellipsisText": "…"}'>
```

> **Atenção:** `prevText`, `nextText`, `header`, `footer` e `formatNavigator` são inseridos como HTML pelo
> Pagination.js — use só texto fixo seu, nunca dados do usuário.

## Esconder anterior/próxima nas pontas e sempre mostrar a paginação

```html
<div ... data-paginationjs-options='{"autoHidePrevious": true, "autoHideNext": true, "hideOnlyOnePage": false}'>
```

## Navegador do Pagination.js (“Total de X”)

```html
<div ... data-paginationjs-options='{"showNavigator": true, "formatNavigator": "<%= currentPage %> de <%= totalPage %> páginas"}'>
```

## Onde a paginação e o resumo aparecem

Por padrão ficam num rodapé logo abaixo da tabela. Para posicionar:

```html
<div id="clientes" data-paginationjs data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar">
    <div class="topo">
        <span data-paginationjs-summary></span>
        <div data-paginationjs-pager></div>
    </div>
    <table>...</table>
</div>
```

## Texto do resumo

```html
<div ... data-paginationjs-text-summary="{start}–{end} de {total} clientes (página {page}/{pages})"
         data-paginationjs-text-summary-empty="Nenhum cliente">
```

> **Resultado:** `21–40 de 137 clientes (página 2/7)`.

## Classes extras para combinar com o tema

```html
<div ... data-paginationjs-options='{"className": "minha-paginacao", "ulClassName": "lista-paginas"}'>
```

```css
.hrpjs .minha-paginacao li > a { border-radius: 999px; }
```

## Página além da última

Se a página pedida deixou de existir (registros excluídos, link antigo), o servidor devolve `data: []` com o
`total` real. A biblioteca pede **uma** vez a última página válida.

```http
GET ...&page=9&limit=20   →  { "data": [], "meta": { "paginacao": { "total": 137, ... } } }
GET ...&page=7&limit=20   →  linhas 121 a 137
```
