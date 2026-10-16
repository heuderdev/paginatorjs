# Integrações

## View completa no Joomla 3

```php views/clientes/tmpl/default.php
<?php
defined('_JEXEC') or die;

$base = 'index.php?option=com_loja&task=clientes.';
$url = function ($task) use ($base) {
    return htmlspecialchars(JRoute::_($base . $task, false), ENT_QUOTES, 'UTF-8');
};

JHtml::_('jquery.framework');
JHtml::_('script', 'com_loja/pagination-2.6.0.min.js', array('relative' => true, 'version' => 'auto'));
JHtml::_('script', 'com_loja/hr-paginationjs.min.js', array('relative' => true, 'version' => 'auto'));
JHtml::_('stylesheet', 'com_loja/hr-paginationjs.min.css', array('relative' => true, 'version' => 'auto'));
?>

<?php echo JHtml::_('form.token'); ?>

<div id="clientes"
     data-paginationjs
     data-paginationjs-remote="<?php echo $url('listar'); ?>"
     data-paginationjs-sort="criado"
     data-paginationjs-direction="desc"
     data-paginationjs-persist
     data-paginationjs-namespace="com_loja"
     data-paginationjs-user="<?php echo (int) JFactory::getUser()->id; ?>"
     data-paginationjs-url
     data-paginationjs-url-prefix="cli_">

    <form class="form-inline" data-paginationjs-filters>
        <input type="search" data-paginationjs-search placeholder="Buscar" aria-label="Buscar">
        <select name="status" aria-label="Status">
            <option value="">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
        </select>
        <button type="button" class="btn" data-paginationjs-clear>Limpar</button>
        <select data-paginationjs-page-size aria-label="Por página"></select>
        <div data-paginationjs-columns></div>
    </form>

    <table class="table table-striped">
        <thead>
            <tr>
                <th data-paginationjs-key="id" data-paginationjs-sortable data-paginationjs-required>ID</th>
                <th data-paginationjs-key="nome" data-paginationjs-sortable data-paginationjs-required>Nome</th>
                <th data-paginationjs-key="email" data-paginationjs-format="email">E-mail</th>
                <th data-paginationjs-key="limite" data-paginationjs-field="limite_credito" data-paginationjs-sortable
                    data-paginationjs-format="money" data-paginationjs-align="right">Limite</th>
                <th data-paginationjs-key="criado" data-paginationjs-field="created_at" data-paginationjs-sortable
                    data-paginationjs-sort-first="desc" data-paginationjs-format="datetime">Cadastro</th>
                <th data-paginationjs-key="acoes" data-paginationjs-actions data-paginationjs-template="tpl-acoes">Ações</th>
            </tr>
        </thead>
    </table>
</div>

<template id="tpl-acoes">
    <a class="btn btn-small" href="index.php?option=com_loja&view=cliente&layout=edit&id={id}">Editar</a>
    <button type="button" class="btn btn-small btn-danger"
            data-paginationjs-action="excluir"
            data-paginationjs-action-remote="<?php echo $url('excluir'); ?>"
            data-paginationjs-action-confirm="Excluir {nome}?">Excluir</button>
</template>
```

O controller completo está em `exemplos/joomla3/controllers/clientes.php` e o contrato em [Backend](backend.md).

## Busca na toolbar do Joomla

```php
<?php
JToolbarHelper::title('Clientes');
JToolbarHelper::addNew('cliente.add');
?>
<div class="pull-right" data-paginationjs-for="clientes">
    <input type="search" data-paginationjs-search placeholder="Buscar clientes" aria-label="Buscar clientes">
</div>
```

## API legada no formato DataTables

Sem mudar o endpoint antigo.

```html
<div id="legado" data-paginationjs
     data-paginationjs-remote="index.php?option=com_antigo&task=lista.dados"
     data-paginationjs-adapter="datatables"
     data-paginationjs-sort="id">
    <input type="search" data-paginationjs-search aria-label="Buscar">
    <table>
        <thead>
            <tr>
                <th data-paginationjs-key="id" data-paginationjs-sortable>ID</th>
                <th data-paginationjs-key="nome" data-paginationjs-sortable>Nome</th>
            </tr>
        </thead>
    </table>
</div>
```

```http Página 3, 20 por página, busca "ana"
GET index.php?option=com_antigo&task=lista.dados&draw=4&start=40&length=20&search_value=ana&order_col=id&order_dir=asc&_=...
```

```json Resposta esperada
{ "draw": 4, "recordsTotal": 1200, "recordsFiltered": 37, "data": [ { "id": 41, "nome": "Ana Silva" } ] }
```

Nomes diferentes no endpoint legado:

```html
<div ... data-paginationjs-adapter="datatables"
         data-paginationjs-names='{"start": "inicio", "length": "qtd", "search": "q", "sort": "col", "direction": "dir"}'>
```

## API com formato próprio (adaptador)

Registre uma vez, use pelo nome em quantas telas quiser.

```js
HrPaginationjs.adapter('erp', {
    names: { page: 'pg', limit: 'qtd', search: 'q', sort: 'ordem', direction: 'sentido' },
    params: function (state, ctx) {
        var p = {};

        p[ctx.names.page] = state.page;
        p[ctx.names.limit] = state.limit;

        if (state.search) {
            p[ctx.names.search] = state.search;
        }

        if (state.sort) {
            p[ctx.names.sort] = state.sort;
            p[ctx.names.direction] = state.direction;
        }

        return p;
    },
    parse: function (body, ctx) {
        if (!body || !Array.isArray(body.itens)) {
            throw ctx.error('invalid');
        }

        if (body.ok === false) {
            throw ctx.error('api', body.msg);
        }

        return { rows: body.itens, total: body.quantidade };
    }
});
```

```html
<div id="produtos" data-paginationjs data-paginationjs-adapter="erp"
     data-paginationjs-remote="/erp/produtos">
    ...
</div>
```

```json O endpoint responde
{ "ok": true, "quantidade": 512, "itens": [ { "id": 1, "nome": "Parafuso" } ] }
```

> **Atenção:** registre o adaptador antes do `DOMContentLoaded` (logo após carregar a biblioteca), senão a
> listagem é criada antes e acusa “adaptador não registrado”.

## Dentro de abas (carregar só quando a aba abre)

```html
<div id="pedidos" data-paginationjs
     data-paginationjs-remote="index.php?option=com_loja&task=pedidos.listar"
     data-paginationjs-autoload="false">
    ...
</div>

<script>
    var carregado = false;

    document.querySelector('[href="#aba-pedidos"]').addEventListener('click', function () {
        if (!carregado) {
            carregado = true;
            HrPaginationjs.get('pedidos').reload();
        }
    });
</script>
```

## Listagem dentro de um modal

```js
function abrirModalPedidos(clienteId) {
    var modal = document.getElementById('modal-pedidos');

    modal.querySelector('[data-paginationjs]').setAttribute(
        'data-paginationjs-params', JSON.stringify({ cliente_id: clienteId })
    );

    var lista = HrPaginationjs.get('pedidos-cliente');

    if (lista) {
        lista.destroy();   // relê os atributos ao recriar
    }

    HrPaginationjs.init('pedidos-cliente');
    mostrarModal(modal);
}
```

## Várias listagens na mesma página

Cada uma é independente (estado, requisições, preferências).

```html
<div id="clientes" data-paginationjs data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar">...</div>
<div id="pedidos" data-paginationjs data-paginationjs-remote="index.php?option=com_loja&task=pedidos.listar">...</div>
<div id="produtos" data-paginationjs data-paginationjs-remote="index.php?option=com_loja&task=produtos.listar">...</div>
```

## Paginação com classes do Bootstrap

```html
<div ... data-paginationjs-options='{"className": "pagination", "activeClassName": "active", "disableClassName": "disabled"}'>
```

> **Dica:** o CSS da biblioteca já estiliza a paginação; use classes do tema apenas se quiser o visual do template.

## Testar com outra versão do jQuery

A biblioteca funciona com jQuery 1.7 a 4.x (inclusive *slim*). Basta trocar o script do jQuery:

```html
<script src="https://code.jquery.com/jquery-3.7.1.slim.min.js"></script>
<script src="/assets/hr-paginationjs/pagination-2.6.0.min.js"></script>
<script src="/assets/hr-paginationjs/hr-paginationjs.min.js"></script>
```
