# Preferências, URL e cache

## Lembrar colunas, quantidade e ordenação

```php
<div id="clientes" data-paginationjs
     data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar"
     data-paginationjs-persist
     data-paginationjs-namespace="com_loja"
     data-paginationjs-user="<?php echo (int) JFactory::getUser()->id; ?>"
     data-paginationjs-version="1"
     data-paginationjs-toolbar="search,limit,columns">
    ...
</div>
```

```json Gravado no localStorage em "hrpaginationjs:com_loja:42:clientes:v1"
{
    "saved": 1760630400000,
    "columns": { "email": true, "telefone": false, "cidade": true },
    "limit": 50,
    "sort": "nome",
    "direction": "asc"
}
```

> **Como funciona:** ao reabrir a tela, o usuário 42 encontra as mesmas colunas, 50 por página e ordem por nome.
> Outro usuário no mesmo navegador tem a própria chave. Se o `localStorage` estiver bloqueado, a tela funciona
> normalmente, só não lembra.

## Escolher o que é lembrado

```html
<div ... data-paginationjs-persist="columns">                       <!-- só colunas -->
<div ... data-paginationjs-persist="columns,limit">                 <!-- colunas e quantidade -->
<div ... data-paginationjs-persist="columns,limit,sort,filters">    <!-- também os filtros -->
<div ... data-paginationjs-persist="columns,limit,sort,search,filters">
```

> **Atenção:** busca e filtros ficam gravados no navegador. Não use `search`/`filters` em telas com dados
> sensíveis (CPF, nomes de pacientes etc.).

## Mudou as colunas da tela?

Colunas novas usam o padrão do HTML e colunas removidas são ignoradas automaticamente. Para uma mudança grande,
aumente a versão — as preferências antigas deixam de ser lidas:

```html
<div ... data-paginationjs-persist data-paginationjs-version="2">
```

## Botão “restaurar preferências”

```html
<button type="button" id="restaurar">Restaurar visualização padrão</button>

<script>
    document.getElementById('restaurar').addEventListener('click', function () {
        HrPaginationjs.get('clientes').resetPreferences();
    });
</script>
```

> **Dica:** para restaurar só as colunas, o seletor de colunas já tem o botão “Restaurar padrão”.

## Estado na URL (link compartilhável)

```html
<div id="clientes" data-paginationjs
     data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar"
     data-paginationjs-url
     data-paginationjs-url-prefix="cli_">
    ...
</div>
```

```http Endereço da página depois de filtrar, ordenar e ir para a página 3
index.php?option=com_loja&view=clientes&cli_page=3&cli_sort=nome&cli_direction=asc&cli_search=ana&cli_f_status=ativo&cli_f_uf=SP&cli_f_uf=RJ
```

> **Resultado:** quem abrir esse link vê exatamente a mesma lista. Os parâmetros do Joomla (`option`, `view`,
> `Itemid`) são preservados; a página 1 e os valores padrão não poluem a URL.

## Voltar e avançar do navegador

Com `push`, cada mudança vira uma entrada no histórico.

```html
<div ... data-paginationjs-url data-paginationjs-url-history="push">
```

> **Como funciona:** o botão Voltar restaura página, filtros e busca anteriores com **uma** requisição.

## Duas listagens com URL na mesma página

Cada uma com seu prefixo; uma não mexe nos parâmetros da outra.

```html
<div id="clientes" data-paginationjs data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar"
     data-paginationjs-url data-paginationjs-url-prefix="cli_">...</div>

<div id="pedidos" data-paginationjs data-paginationjs-remote="index.php?option=com_loja&task=pedidos.listar"
     data-paginationjs-url data-paginationjs-url-prefix="ped_">...</div>
```

```http
index.php?option=com_loja&view=painel&cli_page=2&ped_f_status=aberto
```

## Precedência ao abrir a tela

| Ordem | Fonte |
|---|---|
| 1º | Parâmetros da URL (`data-paginationjs-url`) |
| 2º | Preferências salvas (`data-paginationjs-persist`) |
| 3º | HTML (atributos e valores já preenchidos nos campos) |

## Cache de respostas

Volta instantaneamente às páginas já vistas no último minuto.

```html
<div id="clientes" data-paginationjs
     data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar"
     data-paginationjs-cache="60"
     data-paginationjs-cache-max="30">
    ...
</div>
```

| Situação | Vai ao servidor? |
|---|---|
| Página 1 → 2 → 1 (dentro de 60 s) | 1 e 2 sim; a volta para a 1, não |
| Botão “Atualizar” / `reload()` | sim (limpa o cache) |
| Depois de uma ação remota com sucesso | sim (limpa o cache) |
| Outro usuário (`data-paginationjs-user`) | chave diferente, nunca compartilha |

> **Atenção:** só ligue o cache em listas que podem ficar alguns segundos desatualizadas.
