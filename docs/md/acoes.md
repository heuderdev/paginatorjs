# Ações por linha

Botões ou links com `data-paginationjs-action` dentro das células (normalmente num `<template>`).

```html
<th data-paginationjs-key="acoes" data-paginationjs-actions data-paginationjs-template="tpl-acoes">Ações</th>

<template id="tpl-acoes">
    <button type="button" data-paginationjs-action="editar">Editar</button>
</template>
```

Todo clique dispara o evento **cancelável** `hrpaginationjs:action` no elemento raiz:

```js
document.getElementById('clientes').addEventListener('hrpaginationjs:action', function (e) {
    if (e.detail.action === 'editar') {
        abrirFormulario(e.detail.key, e.detail.row);
    }
});
```

`detail` = `{ id, action, key, index, row, element }` — `row` é uma **cópia** da linha; `key` vem de
`data-paginationjs-row-key` (padrão `id`). O clique tem `preventDefault()` (um `<a href>` de ação não navega).
Para um link comum de navegação, **não** use `data-paginationjs-action`.

## Ação remota (sem JavaScript)

```html
<button type="button"
        data-paginationjs-action="excluir"
        data-paginationjs-action-remote="index.php?option=com_loja&task=clientes.excluir"
        data-paginationjs-action-confirm="Excluir o cliente {nome}?"
        data-paginationjs-param-motivo="limpeza">Excluir</button>
```

| Atributo | Padrão | Descrição |
|---|---|---|
| `data-paginationjs-action-remote` | — | URL (relativa, `http` ou `https`). |
| `data-paginationjs-action-method` | `POST` | `POST` ou `GET`. |
| `data-paginationjs-action-key` | `id` | Nome do parâmetro que leva a chave da linha. |
| `data-paginationjs-param-<nome>` | — | Parâmetros extras; aceitam `{campo}` da linha. |
| `data-paginationjs-action-confirm` | — | Texto de `window.confirm()` (aceita `{campo}`). Cancelar = nada é enviado. |
| `data-paginationjs-action-reload` | `true` | `false` = não recarrega a lista após o sucesso. |

Fluxo:

1. Evento `hrpaginationjs:action` (se alguém chamar `preventDefault()`, para aqui — útil para modal próprio).
2. Confirmação, se houver.
3. Envia `id=<chave>&<parâmetros>&<token>=1` com o cabeçalho `X-CSRF-Token: <token>`.
   O token é descoberto como no Vigia.js: `Joomla.getOptions('csrf.token')` → `<input type="hidden" name="<32 hex>" value="1">`
   (`JHtml::_('form.token')`) → `<meta name="csrf-token">`. Compatível com `PermissionHelper::requireToken()`.
4. O botão fica `disabled` + `aria-busy` durante o envio.
5. Resposta com `success: true` → mensagem do servidor no aviso, cache limpo, evento `hrpaginationjs:actiondone` e
   recarga da página atual (se a página esvaziar, a biblioteca volta uma única vez para a última página válida).
6. Qualquer erro (HTTP, `success: false`, sessão, permissão, resposta inválida) → mensagem no aviso e evento
   `hrpaginationjs:actionerror`.

O backend continua obrigado a validar token, permissão e se o usuário pode agir **naquele registro**.
Conhecer o ID não dá direito de acesso.

## Modal próprio (com um pouco de JavaScript)

```js
root.addEventListener('hrpaginationjs:action', function (e) {
    if (e.detail.action !== 'excluir') return;
    e.preventDefault();
    meuModal.confirmar('Excluir ' + e.detail.row.nome + '?').then(function () {
        var corpo = HrPaginationjs.serialize({ id: e.detail.key });
        var xhr = new XMLHttpRequest();

        corpo += '&' + encodeURIComponent(HrPaginationjs.findToken()) + '=1';
        xhr.open('POST', 'index.php?option=com_loja&task=clientes.excluir');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.onloadend = function () { HrPaginationjs.get('clientes').reload(); };
        xhr.send(corpo);
    });
});
```
