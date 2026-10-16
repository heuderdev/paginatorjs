# Primeira tela em 2 minutos

Uma nova listagem precisa essencialmente de: **um elemento, um endpoint, um identificador estável, as colunas,
os filtros e as ações**. Nada de JavaScript.

## 1. Mínimo absoluto

```html
<div id="clientes"
     data-paginationjs
     data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar"
     data-paginationjs-toolbar="search,limit,columns,reload">
    <table>
        <thead>
            <tr>
                <th data-paginationjs-key="id" data-paginationjs-sortable data-paginationjs-required>ID</th>
                <th data-paginationjs-key="nome" data-paginationjs-sortable>Nome</th>
                <th data-paginationjs-key="email">E-mail</th>
            </tr>
        </thead>
    </table>
</div>
```

- `id="clientes"` é o identificador estável (usado em preferências, URL e `HrPaginationjs.get('clientes')`).
- `data-paginationjs-remote` é o endpoint. Ele recebe `page`, `limit`, `sort`, `direction`, `search` e os filtros.
- Cada `<th>` com `data-paginationjs-key` é uma coluna. O valor exibido vem do campo de mesmo nome na resposta.
- `data-paginationjs-toolbar` monta busca, quantidade por página, seletor de colunas e botão atualizar.

A biblioteca cria sozinha: corpo da tabela, estados (carregando/vazio/erro), resumo, paginação e região `aria-live`.

## 2. Adicionando filtros

Qualquer campo com `name` dentro de um `<form data-paginationjs-filters>` vira filtro:

```html
<form data-paginationjs-filters>
    <label>Buscar <input type="search" data-paginationjs-search></label>
    <label>Status
        <select name="status">
            <option value="">Todos</option>
            <option value="ativo">Ativos</option>
        </select>
    </label>
    <label><input type="checkbox" name="uf[]" value="SP"> SP</label>
    <label><input type="checkbox" name="uf[]" value="RJ"> RJ</label>
    <button type="button" data-paginationjs-clear>Limpar</button>
</form>
```

Envia `status=ativo&uf[]=SP&uf[]=RJ` — exatamente o que `InputHelper::filters()` lê.

## 3. Adicionando ações

```html
<th data-paginationjs-key="acoes" data-paginationjs-actions data-paginationjs-template="tpl-acoes">Ações</th>
...
<template id="tpl-acoes">
    <button type="button"
            data-paginationjs-action="excluir"
            data-paginationjs-action-remote="index.php?option=com_loja&task=clientes.excluir"
            data-paginationjs-action-confirm="Excluir {nome}?">Excluir</button>
</template>
```

O clique confirma, envia `POST id=<id>&<token>=1` com o token CSRF do Joomla, mostra a mensagem do servidor e
recarrega a página atual.

## 4. Backend

```php
public function listar()
{
    try {
        if (!PermissionHelper::require('core.manage', 'com_loja')) {
            return;
        }

        $pagina = InputHelper::pagination(20, 100);
        $ordem = InputHelper::sorting(array('id', 'nome'), 'id', 'DESC');

        $query = OrmTables::table('#__loja_clientes')
            ->select('id, nome, email')
            ->orderBy($ordem['field'], $ordem['direction'])
            ->orderBy('id', 'DESC');

        return ApiResponseHelper::paginated($query->paginate($pagina['limit'], $pagina['page']));
    } catch (Throwable $e) {
        return ApiResponseHelper::exception($e);
    }
}
```

Veja o exemplo completo em `exemplos/joomla3/` e o contrato em [backend.md](backend.md).
