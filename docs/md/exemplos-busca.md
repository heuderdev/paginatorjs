# Busca

A busca é sempre feita no servidor. A biblioteca espera o usuário parar de digitar, cancela a requisição anterior
e descarta respostas atrasadas.

## Campo de busca

```html
<div id="clientes" data-paginationjs data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar">
    <label>Buscar por nome ou e-mail
        <input type="search" data-paginationjs-search autocomplete="off">
    </label>
    <table>...</table>
</div>
```

```http Usuário digitou "ana"
GET index.php?option=com_loja&task=clientes.listar&page=1&limit=20&search=ana&_=...
```

```php No controller
$filtros = InputHelper::filters(array('search' => 'string'));

if (!empty($filtros['search'])) {
    $busca = $filtros['search'];

    $query->whereGroup(function ($g) use ($busca) {
        $g->whereLike('nome', $busca)->orWhereLike('email', $busca);
    });
}
```

| O usuário… | Acontece |
|---|---|
| digita `a`, `an`, `ana` rápido | **uma** requisição, 400 ms depois da última tecla |
| aperta `Enter` | busca na hora |
| apaga tudo | requisição sem `search` (lista completa) |
| digita o mesmo termo de novo | nada (sem requisição) |
| usa teclado com composição (acentos, IME) | espera terminar de compor |

> **Como funciona:** toda nova busca volta para a página 1.

## Ajustar a espera (debounce)

```html
<div id="clientes" data-paginationjs
     data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar"
     data-paginationjs-debounce="700">
    ...
</div>
```

> **Dica:** `data-paginationjs-debounce="0"` busca a cada tecla — evite em listas grandes.

## Mínimo de caracteres

Com 3, digitar `a` ou `an` não consulta o servidor (o resultado atual fica na tela). Apagar tudo continua
limpando a busca.

```html
<div id="clientes" data-paginationjs
     data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar"
     data-paginationjs-min-chars="3">
    <input type="search" data-paginationjs-search aria-label="Buscar (mínimo 3 letras)">
    ...
</div>
```

## Nome do parâmetro diferente

```html
<div id="clientes" data-paginationjs
     data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar"
     data-paginationjs-names='{"search": "busca"}'>
    <input type="search" data-paginationjs-search aria-label="Buscar">
    ...
</div>
```

```http
GET index.php?option=com_loja&task=clientes.listar&page=1&limit=20&busca=ana&_=...
```

## Busca pronta da toolbar

```html
<div id="clientes" data-paginationjs
     data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar"
     data-paginationjs-toolbar="search"
     data-paginationjs-text-search="Pesquisar clientes"
     data-paginationjs-text-search-placeholder="Nome ou e-mail">
    ...
</div>
```

## Busca no cabeçalho, fora da listagem

```html
<div class="busca-global" role="search">
    <input type="search" data-paginationjs-for="clientes" data-paginationjs-search aria-label="Buscar clientes">
</div>

<div id="clientes" data-paginationjs data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar">
    ...
</div>
```

## Dois campos ligados à mesma busca

Os campos da mesma listagem ficam sincronizados (útil com um campo no topo e outro numa barra lateral).

```html
<div id="clientes" data-paginationjs data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar">
    <input type="search" data-paginationjs-search aria-label="Buscar">
    <table>...</table>
    <aside>
        <input type="search" data-paginationjs-search aria-label="Buscar novamente">
    </aside>
</div>
```

## Busca já preenchida ao abrir

O valor do campo no HTML vira a busca inicial (útil quando o PHP repassa um termo).

```php
<input type="search" data-paginationjs-search aria-label="Buscar"
       value="<?php echo htmlspecialchars(InputHelper::string('q'), ENT_QUOTES, 'UTF-8'); ?>">
```

## Botões de limpar

```html
<button type="button" data-paginationjs-clear="search">Limpar busca</button>
<button type="button" data-paginationjs-clear="filters">Limpar filtros</button>
<button type="button" data-paginationjs-clear>Limpar tudo</button>
```

## Busca junto com filtros num formulário

Dentro de `<form data-paginationjs-filters>`, `Enter` na busca aplica busca e filtros numa só requisição.

```html
<form data-paginationjs-filters>
    <input type="search" data-paginationjs-search aria-label="Buscar">
    <select name="status" aria-label="Status">
        <option value="">Todos</option>
        <option value="ativo">Ativos</option>
    </select>
</form>
```

```http
GET index.php?option=com_loja&task=clientes.listar&status=ativo&page=1&limit=20&search=ana&_=...
```
