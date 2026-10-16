# Ações por linha

Botões ou links com `data-paginationjs-action`, normalmente num `<template>` de uma coluna de ações.

## Coluna de ações

```html
<th data-paginationjs-key="acoes" data-paginationjs-actions data-paginationjs-template="tpl-acoes">Ações</th>

<template id="tpl-acoes">
    <button type="button" data-paginationjs-action="editar" aria-label="Editar {nome}">Editar</button>
    <button type="button" data-paginationjs-action="excluir"
            data-paginationjs-action-remote="index.php?option=com_loja&task=clientes.excluir"
            data-paginationjs-action-confirm="Excluir o cliente {nome}?"
            aria-label="Excluir {nome}">Excluir</button>
</template>
```

```preview Como fica na tela
<table><thead><tr><th>ID</th><th>Nome</th><th>Ações</th></tr></thead><tbody>
<tr><td>42</td><td>Ana Silva</td><td><button type="button" class="pv-btn">Editar</button> <button type="button" class="pv-btn" style="color:#b42318">Excluir</button></td></tr>
<tr><td>43</td><td>Bruno Souza</td><td><button type="button" class="pv-btn">Editar</button> <button type="button" class="pv-btn" style="color:#b42318">Excluir</button></td></tr>
</tbody></table>
```

## Ação que abre a sua tela (evento)

Sem `-remote`, o clique só dispara o evento `hrpaginationjs:action` — você decide o que fazer.

```html
<template id="tpl-acoes">
    <button type="button" data-paginationjs-action="editar">Editar</button>
    <button type="button" data-paginationjs-action="detalhes">Detalhes</button>
</template>
```

```js
document.getElementById('clientes').addEventListener('hrpaginationjs:action', function (e) {
    var linha = e.detail.row;   // cópia da linha clicada

    if (e.detail.action === 'editar') {
        window.location.href = 'index.php?option=com_loja&view=cliente&layout=edit&id=' + encodeURIComponent(e.detail.key);
    }

    if (e.detail.action === 'detalhes') {
        abrirPainelDeDetalhes(linha);
    }
});
```

| `e.detail` | Conteúdo |
|---|---|
| `action` | valor de `data-paginationjs-action` |
| `key` | chave da linha (`data-paginationjs-row-key`, padrão `id`) |
| `row` | cópia da linha |
| `index` | posição da linha na página |
| `element` | o botão clicado |

## Link de navegação comum (sem ação)

Um link normal não precisa de nada; só **não** use `data-paginationjs-action` nele (a ação bloqueia a navegação).

```html
<template id="tpl-acoes">
    <a href="index.php?option=com_loja&view=cliente&id={id}">Abrir</a>
</template>
```

## Ação remota com confirmação

```html
<button type="button"
        data-paginationjs-action="excluir"
        data-paginationjs-action-remote="index.php?option=com_loja&task=clientes.excluir"
        data-paginationjs-action-confirm="Excluir o cliente {nome}? Esta ação não pode ser desfeita.">
    Excluir
</button>
```

```http Após confirmar
POST index.php?option=com_loja&task=clientes.excluir
Content-Type: application/x-www-form-urlencoded; charset=UTF-8
X-CSRF-Token: 3f9c…e1a7

id=42&3f9c…e1a7=1
```

```php No controller
public function excluir()
{
    try {
        if (!PermissionHelper::requireToken() || !PermissionHelper::require('core.delete', 'com_loja')) {
            return;
        }

        $id = InputHelper::int('id', 0, 'post');
        $this->tabela()->findOrFail($id);
        $this->tabela()->delete($id);

        return ApiResponseHelper::deleted('Cliente excluído.');
    } catch (Throwable $e) {
        return ApiResponseHelper::exception($e);
    }
}
```

```preview Depois do sucesso
<div class="hrpjs"><div class="hrpjs-footer"><div class="hrpjs-notice">Cliente excluído.</div><div class="hrpjs-summary">Exibindo 1 a 20 de 136 registros</div></div></div>
```

> **Como funciona:** o botão fica desabilitado durante o envio; com `success: true` a mensagem do servidor aparece,
> o cache é limpo e a página atual é recarregada. Com erro, a mensagem aparece em vermelho e a lista não muda.

## Ação com parâmetros extras

`data-paginationjs-param-<nome>` vira um parâmetro; aceita `{campo}` da linha.

```html
<template id="tpl-status">
    <button type="button" data-paginationjs-if="status=ativo"
            data-paginationjs-action="desativar"
            data-paginationjs-action-remote="index.php?option=com_loja&task=clientes.alterarStatus"
            data-paginationjs-param-status="inativo">Desativar</button>

    <button type="button" data-paginationjs-if="status=inativo"
            data-paginationjs-action="ativar"
            data-paginationjs-action-remote="index.php?option=com_loja&task=clientes.alterarStatus"
            data-paginationjs-param-status="ativo">Ativar</button>
</template>
```

```http
POST index.php?option=com_loja&task=clientes.alterarStatus

id=42&status=inativo&3f9c…e1a7=1
```

## Nome do parâmetro da chave

```html
<button type="button"
        data-paginationjs-action="cancelar"
        data-paginationjs-action-remote="index.php?option=com_loja&task=pedidos.cancelar"
        data-paginationjs-action-key="pedido_id"
        data-paginationjs-param-origem="lista-{status}">Cancelar pedido</button>
```

```http
POST index.php?option=com_loja&task=pedidos.cancelar

pedido_id=981&origem=lista-aberto&3f9c…e1a7=1
```

## Sem recarregar depois

```html
<button type="button"
        data-paginationjs-action="reenviar"
        data-paginationjs-action-remote="index.php?option=com_loja&task=clientes.reenviarBoasVindas"
        data-paginationjs-action-reload="false">Reenviar e-mail</button>
```

## Ação por GET

```html
<button type="button"
        data-paginationjs-action="sincronizar"
        data-paginationjs-action-remote="index.php?option=com_loja&task=clientes.sincronizar"
        data-paginationjs-action-method="GET">Sincronizar</button>
```

> **Atenção:** prefira `POST` para qualquer ação que altera dados. O token é enviado nos dois casos, mas o
> `PermissionHelper::requireToken()` confere `POST` por padrão.

## De onde vem o token CSRF

A biblioteca procura, nesta ordem (igual ao Vigia.js). Basta **um** deles na página:

```js 1. Joomla 4/5 — já vem automático, nada a fazer
Joomla.getOptions('csrf.token');
```

```php 2. Joomla 3 — campo oculto do token
<?php echo JHtml::_('form.token'); ?>
```

```html 3. Qualquer site — meta tag
<meta name="csrf-token" content="<?php echo JSession::getFormToken(); ?>">
```

## Modal próprio no lugar do `confirm()`

Cancele o fluxo padrão com `preventDefault()` e faça a chamada depois da confirmação.

```js
var lista = document.getElementById('clientes');

lista.addEventListener('hrpaginationjs:action', function (e) {
    if (e.detail.action !== 'excluir') {
        return;
    }

    e.preventDefault();

    meuModal.confirmar('Excluir ' + e.detail.row.nome + '?').then(function () {
        var xhr = new XMLHttpRequest();

        xhr.open('POST', 'index.php?option=com_loja&task=clientes.excluir');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.onloadend = function () {
            HrPaginationjs.get('clientes').reload();
        };
        xhr.send(HrPaginationjs.serialize({ id: e.detail.key }) + '&' + encodeURIComponent(HrPaginationjs.findToken()) + '=1');
    });
});
```

> **Dica:** mantenha `data-paginationjs-action-remote` no botão mesmo assim — sem o `preventDefault()` ele volta a
> funcionar sozinho.

## Reagir ao sucesso ou ao erro

```js
var lista = document.getElementById('clientes');

lista.addEventListener('hrpaginationjs:actiondone', function (e) {
    if (e.detail.action === 'excluir') {
        atualizarContadorDoMenu();
    }
});

lista.addEventListener('hrpaginationjs:actionerror', function (e) {
    if (e.detail.error.kind === 'session') {
        window.location.href = 'index.php?option=com_users&view=login';
    }
});
```
