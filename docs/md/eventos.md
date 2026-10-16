# Eventos

Todos são `CustomEvent` disparados no **elemento raiz**, com `bubbles: true`. O `detail` contém **cópias**
(alterá-las não afeta a listagem). Sempre há `detail.id` (identificador da listagem).

```js
document.getElementById('clientes').addEventListener('hrpaginationjs:load', function (e) {
    console.log(e.detail.total);
});

// jQuery
jQuery(document).on('hrpaginationjs:error', '#clientes', function (e) {
    var erro = e.originalEvent.detail.error;
});
```

| Evento | Cancelável | Quando | `detail` |
|---|---|---|---|
| `hrpaginationjs:init` | não | Instância criada (antes da 1ª requisição) | `{ id, state }` |
| `hrpaginationjs:statechange` | não | Busca, filtro, página, quantidade ou ordem mudaram (antes da requisição) | `{ id, state }` |
| `hrpaginationjs:beforeload` | não | Imediatamente antes de cada requisição (ou leitura do cache) | `{ id, params, state }` |
| `hrpaginationjs:load` | não | Página renderizada com sucesso | `{ id, rows, total, totalAll, requestId, message, state }` |
| `hrpaginationjs:error` | não | Falha classificada (exceto cancelamentos) | `{ id, error, state }` |
| `hrpaginationjs:columnschange` | não | Visibilidade de colunas mudou | `{ id, visible }` |
| `hrpaginationjs:action` | **sim** | Clique em `data-paginationjs-action` | `{ id, action, key, index, row, element }` |
| `hrpaginationjs:actiondone` | não | Ação remota concluída com `success: true` | `{ id, action, key, row, response }` |
| `hrpaginationjs:actionerror` | não | Ação remota falhou | `{ id, action, key, row, error }` |
| `hrpaginationjs:destroy` | não | Início do `destroy()` | `{ id }` |

`state` tem o formato de [`getState()`](api-js.md#getstate). `totalAll` é `recordsTotal` no adaptador DataTables
e igual a `total` no `apiresponse`. `params` é exatamente o que será enviado ao servidor.

## Exemplos úteis

Redirecionar quando a sessão expira:

```js
document.addEventListener('hrpaginationjs:error', function (e) {
    if (e.detail.error.kind === 'session') {
        window.location.href = 'index.php?option=com_users&view=login';
    }
});
```

Atualizar um contador fora da listagem:

```js
document.getElementById('clientes').addEventListener('hrpaginationjs:load', function (e) {
    document.getElementById('total-clientes').textContent = e.detail.total;
});
```
