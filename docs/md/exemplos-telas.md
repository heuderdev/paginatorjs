# Montando a tela

## Carregando os arquivos (uma vez por página)

```html Fora do Joomla
<link rel="stylesheet" href="/assets/hr-paginationjs/hr-paginationjs.min.css">

<!-- ... conteúdo da página ... -->

<script src="/assets/js/jquery.min.js"></script>
<script src="/assets/hr-paginationjs/pagination-2.6.0.min.js"></script>
<script src="/assets/hr-paginationjs/hr-paginationjs.min.js"></script>
```

```php views/clientes/tmpl/default.php (Joomla 3)
<?php
defined('_JEXEC') or die;

JHtml::_('jquery.framework');
JHtml::_('script', 'com_loja/pagination-2.6.0.min.js', array('relative' => true, 'version' => 'auto'));
JHtml::_('script', 'com_loja/hr-paginationjs.min.js', array('relative' => true, 'version' => 'auto'));
JHtml::_('stylesheet', 'com_loja/hr-paginationjs.min.css', array('relative' => true, 'version' => 'auto'));
```

> **Como funciona:** ao terminar de carregar a página, a biblioteca procura todo elemento com `data-paginationjs`
> e cria uma listagem para cada um. Não é preciso chamar nada.

## Tela mínima

O suficiente para uma listagem paginada no servidor: um elemento com `id`, o endpoint e o `<thead>`.

```html
<div id="clientes"
     data-paginationjs
     data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar">
    <table>
        <thead>
            <tr>
                <th data-paginationjs-key="id">ID</th>
                <th data-paginationjs-key="nome">Nome</th>
                <th data-paginationjs-key="email">E-mail</th>
            </tr>
        </thead>
    </table>
</div>
```

```http
GET index.php?option=com_loja&task=clientes.listar&page=1&limit=20&_=1760630400000
X-Requested-With: XMLHttpRequest
Accept: application/json, text/javascript, */*; q=0.01
```

> **Resultado:** a biblioteca cria o `<tbody>`, o resumo (“Exibindo 1 a 20 de 137 registros”) e a paginação logo
> abaixo da tabela. O parâmetro `_` só evita cache do navegador; o `InputHelper` o ignora.

## Tela com toolbar automática

`data-paginationjs-toolbar` cria os controles prontos, com `<label>`, na ordem informada.

```html
<div id="clientes"
     data-paginationjs
     data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar"
     data-paginationjs-toolbar="search,limit,columns,reload,clear">
    <table>
        <thead>
            <tr>
                <th data-paginationjs-key="id" data-paginationjs-sortable data-paginationjs-required>ID</th>
                <th data-paginationjs-key="nome" data-paginationjs-sortable>Nome</th>
                <th data-paginationjs-key="email">E-mail</th>
                <th data-paginationjs-key="cidade" data-paginationjs-sortable>Cidade</th>
            </tr>
        </thead>
    </table>
</div>
```

```preview Como fica na tela
<div class="hrpjs">
<div class="hrpjs-toolbar">
<div class="hrpjs-field hrpjs-field--search"><label class="hrpjs-label">Buscar</label><input class="hrpjs-input" type="search" value="ana"></div>
<div class="hrpjs-field hrpjs-field--limit"><label class="hrpjs-label">Por página</label><select class="hrpjs-select"><option>20</option></select></div>
<div class="hrpjs-field"><details class="hrpjs-columns"><summary class="hrpjs-columns-toggle">Colunas</summary></details></div>
<button type="button" class="hrpjs-button">Atualizar</button>
<button type="button" class="hrpjs-button">Limpar</button>
</div>
<table class="hrpjs-table"><thead><tr><th class="hrpjs-sorted-asc" aria-sort="ascending"><button type="button" class="hrpjs-sort">ID <span class="hrpjs-sort-icon">▲</span></button></th><th><button type="button" class="hrpjs-sort">Nome <span class="hrpjs-sort-icon">↕</span></button></th><th>E-mail</th><th><button type="button" class="hrpjs-sort">Cidade <span class="hrpjs-sort-icon">↕</span></button></th></tr></thead>
<tbody><tr><td>1</td><td>Ana Silva</td><td>ana.silva1@exemplo.com.br</td><td>Rio de Janeiro</td></tr><tr><td>20</td><td>Ana Costa</td><td>ana.costa20@exemplo.com.br</td><td>Curitiba</td></tr><tr><td>40</td><td>Ana Lima</td><td>ana.lima40@exemplo.com.br</td><td>Salvador</td></tr></tbody></table>
<div class="hrpjs-footer"><div class="hrpjs-summary">Exibindo 1 a 3 de 3 registros</div></div>
</div>
```

## Controles posicionados por você

Sem toolbar, você coloca cada controle onde quiser e escreve o seu próprio `<label>`.

```html
<div id="clientes"
     data-paginationjs
     data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar">

    <div class="minha-barra">
        <label>Buscar cliente
            <input type="search" data-paginationjs-search>
        </label>
        <label>Por página
            <select data-paginationjs-page-size></select>
        </label>
        <div data-paginationjs-columns></div>
        <button type="button" data-paginationjs-reload>Atualizar</button>
    </div>

    <table>
        <thead>
            <tr>
                <th data-paginationjs-key="id">ID</th>
                <th data-paginationjs-key="nome">Nome</th>
            </tr>
        </thead>
    </table>

    <div class="meu-rodape">
        <p data-paginationjs-summary></p>
        <div data-paginationjs-pager></div>
    </div>
</div>
```

> **Dica:** o `<select data-paginationjs-page-size>` vazio recebe as opções de `data-paginationjs-limits`
> (padrão 10, 20, 50, 100). Se ele já tiver `<option>`, as suas são mantidas.

## Controles fora do elemento da listagem

Use `data-paginationjs-for="<id da listagem>"` no controle ou num contêiner. Útil quando a busca fica no
cabeçalho do template.

```html
<header class="cabecalho-da-pagina">
    <div data-paginationjs-for="clientes">
        <input type="search" data-paginationjs-search aria-label="Buscar clientes">
        <button type="button" data-paginationjs-reload>Atualizar</button>
    </div>
</header>

<div id="clientes" data-paginationjs data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar">
    <table>
        <thead><tr><th data-paginationjs-key="nome">Nome</th></tr></thead>
    </table>
</div>
```

## Identificador estável diferente do `id`

O `id` do HTML pode mudar entre telas; preferências e URL usam `data-paginationjs-id`.

```html
<div id="lista-123" data-paginationjs
     data-paginationjs-id="loja.clientes"
     data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar">
    ...
</div>
```

```js
HrPaginationjs.get('loja.clientes').reload();
```

## Quantidade inicial e opções de quantidade

```html
<div id="clientes" data-paginationjs
     data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar"
     data-paginationjs-limit="50"
     data-paginationjs-limits="25,50,100"
     data-paginationjs-toolbar="limit">
    ...
</div>
```

```http
GET index.php?option=com_loja&task=clientes.listar&page=1&limit=50&_=...
```

> **Atenção:** o servidor manda no limite real. Com `InputHelper::pagination(20, 100)`, pedir `limit=500` volta
> `por_pagina: 100`, e a listagem passa a usar 100.

## Parâmetros fixos em toda requisição

Para telas que listam um subconjunto fixo (ex.: clientes de uma categoria).

```html
<div id="clientes-governo" data-paginationjs
     data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar"
     data-paginationjs-params='{"categoria": "governo", "origem": "painel"}'>
    ...
</div>
```

```http
GET index.php?option=com_loja&task=clientes.listar&categoria=governo&origem=painel&page=1&limit=20&_=...
```

> **Atenção:** nunca coloque segredos em atributos HTML. O servidor deve validar `categoria` como qualquer filtro.

## Renomear os parâmetros enviados

Quando o endpoint já existe com outros nomes.

```html
<div id="clientes" data-paginationjs
     data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar"
     data-paginationjs-names='{"page": "pagina", "limit": "por_pagina", "search": "busca", "sort": "ordem", "direction": "direcao"}'
     data-paginationjs-toolbar="search">
    ...
</div>
```

```http
GET index.php?option=com_loja&task=clientes.listar&pagina=1&por_pagina=20&busca=ana&_=...
```

## Listagem por POST

```html
<div id="clientes" data-paginationjs
     data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar"
     data-paginationjs-method="POST">
    ...
</div>
```

```http
POST index.php?option=com_loja&task=clientes.listar
Content-Type: application/x-www-form-urlencoded; charset=UTF-8

page=1&limit=20&status%5B%5D=ativo
```

## Campo que identifica a linha

As ações usam a chave da linha (padrão `id`). Aceita caminho com ponto.

```html
<div id="pedidos" data-paginationjs
     data-paginationjs-remote="index.php?option=com_loja&task=pedidos.listar"
     data-paginationjs-row-key="pedido.numero">
    ...
</div>
```

## Idioma e moeda dos formatadores

```html
<div id="faturas" data-paginationjs
     data-paginationjs-remote="index.php?option=com_loja&task=faturas.listar"
     data-paginationjs-locale="en-US"
     data-paginationjs-currency="USD">
    <table>
        <thead>
            <tr>
                <th data-paginationjs-key="valor" data-paginationjs-format="money">Amount</th>
                <th data-paginationjs-key="vencimento" data-paginationjs-format="date">Due</th>
            </tr>
        </thead>
    </table>
</div>
```

> **Resultado:** `1234.5` vira `$1,234.50` e `2026-01-31` vira `01/31/2026`.

## Escolher a tabela quando há mais de uma

```html
<div id="clientes" data-paginationjs data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar">
    <table class="legenda">...</table>

    <table data-paginationjs-table>
        <thead><tr><th data-paginationjs-key="nome">Nome</th></tr></thead>
    </table>
</div>
```

## Conteúdo antes da primeira carga

Um `<tbody>` já preenchido (ex.: linhas renderizadas pelo PHP) é substituído na primeira resposta e volta
intacto se a listagem for destruída.

```html
<table>
    <thead><tr><th data-paginationjs-key="nome">Nome</th></tr></thead>
    <tbody>
        <tr><td>Carregando clientes…</td></tr>
    </tbody>
</table>
```
