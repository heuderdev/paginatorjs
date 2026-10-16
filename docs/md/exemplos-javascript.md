# JavaScript

Tudo nesta página é opcional. Use quando a tela precisa conversar com outras partes da página.

## Pegar a instância

```js
var lista = HrPaginationjs.get('clientes');          // pelo id (ou data-paginationjs-id)
var mesma = HrPaginationjs.get(document.querySelector('#clientes'));
var todas = HrPaginationjs.instances();              // todas as listagens da página
```

> **Atenção:** as listagens automáticas são criadas no `DOMContentLoaded`. Chame `get()` dentro de um listener
> de `DOMContentLoaded` registrado **depois** do script da biblioteca, ou em resposta a cliques.

```js
document.addEventListener('DOMContentLoaded', function () {
    var lista = HrPaginationjs.get('clientes');
});
```

## reload()

Recarrega a página atual indo ao servidor (ignora o cache). Ideal depois de salvar um formulário num modal.

```js
meuFormulario.addEventListener('salvo', function () {
    HrPaginationjs.get('clientes').reload();
});
```

## setPage()

```js
HrPaginationjs.get('clientes').setPage(3);
```

## setLimit()

```js
HrPaginationjs.get('clientes').setLimit(100);   // volta para a página 1
```

## setSearch()

```js
document.getElementById('so-ana').addEventListener('click', function () {
    HrPaginationjs.get('clientes').setSearch('ana');   // sem espera; atualiza o campo de busca
});

HrPaginationjs.get('clientes').setSearch('');           // limpa
```

## setFilter e setFilters

```js
var lista = HrPaginationjs.get('clientes');

lista.setFilter('status', 'ativo');                       // um filtro
lista.setFilter('uf', ['SP', 'RJ']);                      // lista
lista.setFilter('status', '');                            // remove

lista.setFilters({ status: 'ativo', vip: true });         // mescla com os atuais
lista.setFilters({ categoria: 'governo' }, true);         // substitui todos
```

```http lista.setFilters({ status: 'ativo', vip: true }) com um select vip data-paginationjs-type="bool"
GET index.php?option=com_loja&task=clientes.listar&status=ativo&vip=1&page=1&limit=20&_=...
```

> **Como funciona:** os campos do formulário com o mesmo `name` são atualizados para refletir o novo filtro.

## clearFilters()

```js
HrPaginationjs.get('clientes').clearFilters();   // remove todos os filtros, mantém a busca
```

## setSort()

```js
var lista = HrPaginationjs.get('clientes');

lista.setSort('nome', 'asc');
lista.setSort('criado');       // sem direção: alterna se já for a atual, senão usa sort-first
lista.setSort('');             // remove a ordenação
```

## Colunas: showColumn, hideColumn, toggleColumn, resetColumns

Não fazem requisição. Devolvem `false` quando a mudança não é permitida.

```js
var lista = HrPaginationjs.get('clientes');

lista.showColumn('telefone');
lista.hideColumn('email');
lista.toggleColumn('cidade');
lista.toggleColumn('cidade', true);   // força exibir

if (!lista.hideColumn('id')) {
    console.log('id é obrigatória');
}

lista.resetColumns();
```

## Modo compacto (exemplo prático)

```html
<button type="button" id="compacto" aria-pressed="false">Modo compacto</button>

<script>
    document.getElementById('compacto').addEventListener('click', function () {
        var lista = HrPaginationjs.get('clientes');
        var ligado = this.getAttribute('aria-pressed') !== 'true';

        ['email', 'cidade', 'telefone'].forEach(function (key) {
            lista.toggleColumn(key, !ligado);
        });

        this.setAttribute('aria-pressed', String(ligado));
    });
</script>
```

## resetPreferences()

```js
HrPaginationjs.get('clientes').resetPreferences();
```

## getState() e getRows()

```js
var estado = HrPaginationjs.get('clientes').getState();
var linhas = HrPaginationjs.get('clientes').getRows();
```

```json getState()
{
    "id": "clientes",
    "page": 2, "limit": 20, "search": "ana",
    "filters": { "status": "ativo", "uf": ["SP"] },
    "sort": "nome", "direction": "asc",
    "columns": ["id", "nome", "email"],
    "hiddenColumns": ["telefone"],
    "loading": false, "error": null,
    "total": 37, "totalPages": 2,
    "requestId": "6bf735c3d97b99f4"
}
```

## Exportar com os filtros atuais

Use o estado para montar o link do endpoint de exportação existente.

```js
document.getElementById('exportar').addEventListener('click', function () {
    var s = HrPaginationjs.get('clientes').getState();
    var params = HrPaginationjs.serialize(Object.assign({ search: s.search, sort: s.sort, direction: s.direction }, s.filters));

    window.location.href = 'index.php?option=com_loja&task=clientes.exportar&' + params;
});
```

## Promises

Os métodos que consultam o servidor devolvem uma `Promise`.

```js
HrPaginationjs.get('clientes').setFilter('status', 'ativo')
    .then(function (estado) {
        document.getElementById('total-ativos').textContent = estado.total;
    })
    .catch(function (erro) {
        console.warn(erro.kind, erro.message);
    });
```

> **Dica:** chamadas seguidas (ex.: dois `setPage` rápidos) cancelam a anterior; todas as promises resolvem com o
> resultado da **última**.

## Eventos

```js
var lista = document.getElementById('clientes');

lista.addEventListener('hrpaginationjs:load', function (e) {
    document.getElementById('badge-total').textContent = e.detail.total;
});

lista.addEventListener('hrpaginationjs:beforeload', function (e) {
    console.log('vai enviar', e.detail.params);
});

lista.addEventListener('hrpaginationjs:columnschange', function (e) {
    console.log('colunas visíveis', e.detail.visible);
});

lista.addEventListener('hrpaginationjs:statechange', function (e) {
    console.log('página', e.detail.state.page);
});
```

```js Com jQuery
jQuery('#clientes').on('hrpaginationjs:load', function (e) {
    var detalhe = e.originalEvent.detail;
});
```

| Evento | Quando |
|---|---|
| `hrpaginationjs:init` | listagem criada |
| `hrpaginationjs:statechange` | página, busca, filtros, quantidade ou ordem mudaram |
| `hrpaginationjs:beforeload` | antes de cada requisição |
| `hrpaginationjs:load` | página desenhada |
| `hrpaginationjs:error` | erro (exceto cancelamento) |
| `hrpaginationjs:columnschange` | colunas mostradas/ocultadas |
| `hrpaginationjs:action` / `actiondone` / `actionerror` | ações por linha |
| `hrpaginationjs:destroy` | antes de destruir |

## Iniciar manualmente com opções

```html
<div id="clientes" data-paginationjs="manual" data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar">
    ...
</div>

<script>
    HrPaginationjs.init('clientes', {
        limit: 50,
        sort: 'nome',
        direction: 'asc',
        headers: { 'X-Tela': 'clientes' },
        paginationOptions: {
            showGoInput: true,
            showGoButton: true,
            formatGoInput: 'Ir para <%= input %>'
        }
    });
</script>
```

## Desligar a inicialização automática da página

```html
<script src="/assets/hr-paginationjs/hr-paginationjs.min.js" data-paginationjs-autoinit="false"></script>
<script>
    document.addEventListener('DOMContentLoaded', function () {
        HrPaginationjs.scan(document.getElementById('area-de-relatorios'));
    });
</script>
```

## Conteúdo carregado depois (AJAX, aba, modal)

```js
fetch('index.php?option=com_loja&view=pedidos&format=raw')
    .then(function (r) { return r.text(); })
    .then(function (html) {
        var area = document.getElementById('area-pedidos');

        area.innerHTML = html;
        HrPaginationjs.scan(area);   // inicia as listagens do HTML recebido
    });
```

## Destruir e recriar

```js
var lista = HrPaginationjs.get('clientes');

lista.destroy();                    // cancela a requisição, remove eventos e tudo que a lib criou
HrPaginationjs.init('clientes');    // cria de novo, sem duplicar nada
```

> **Dica:** destrua antes de remover o elemento da página (ex.: ao fechar um modal), para liberar memória e
> cancelar requisições pendentes.
