# Colunas

Cada `<th>` da última linha do `<thead>` é uma coluna. A **key** é a identidade (ordenação, preferências, API);
o **field** é de onde vem o valor.

## Key, field e campos aninhados

```html
<thead>
    <tr>
        <!-- key = field = "nome" -->
        <th data-paginationjs-key="nome">Nome</th>

        <!-- key pública "limite", valor vindo de "limite_credito" -->
        <th data-paginationjs-key="limite" data-paginationjs-field="limite_credito">Limite</th>

        <!-- objeto aninhado: linha.endereco.cidade -->
        <th data-paginationjs-key="cidade" data-paginationjs-field="endereco.cidade">Cidade</th>
    </tr>
</thead>
```

> **Dica:** use a key curta e estável (`limite`) e deixe o nome real do banco só no servidor. O controller recebe
> `sort=limite` e traduz pela lista branca.

## Coluna oculta por padrão, obrigatória e de ações

```html
<thead>
    <tr>
        <th data-paginationjs-key="id" data-paginationjs-required>ID</th>                  <!-- sempre visível -->
        <th data-paginationjs-key="nome" data-paginationjs-required>Nome</th>
        <th data-paginationjs-key="email">E-mail</th>                                     <!-- visível, pode ocultar -->
        <th data-paginationjs-key="telefone" data-paginationjs-hidden>Telefone</th>       <!-- começa oculta -->
        <th data-paginationjs-key="acoes" data-paginationjs-actions
            data-paginationjs-template="tpl-acoes">Ações</th>                             <!-- coluna de ações -->
    </tr>
</thead>
```

> **Como funciona:** a coluna `actions` pode ser ocultada, mas não conta como “coluna de dados”: o usuário nunca
> consegue esconder todas as colunas de dados.

## Rótulo diferente no seletor de colunas

Quando o cabeçalho é um ícone ou abreviação.

```html
<th data-paginationjs-key="vip" data-paginationjs-label="Cliente VIP" data-paginationjs-format="bool">★</th>
```

## Alinhamento, largura, valor padrão e classe

```html
<th data-paginationjs-key="id" data-paginationjs-width="70px">ID</th>
<th data-paginationjs-key="limite" data-paginationjs-field="limite_credito"
    data-paginationjs-format="money" data-paginationjs-align="right">Limite</th>
<th data-paginationjs-key="site" data-paginationjs-default="—">Site</th>
<th data-paginationjs-key="obs" data-paginationjs-class="texto-pequeno quebra">Observação</th>
```

> **Resultado:** `null`, `undefined` e `""` em `site` aparecem como `—`; cada `<td>` de `obs` recebe as classes
> `texto-pequeno quebra`; o `<th>` e as `<td>` de `limite` recebem `hrpjs-align-right`.

## Formatadores embutidos

```html
<thead>
    <tr>
        <th data-paginationjs-key="nome" data-paginationjs-format="text">Nome</th>
        <th data-paginationjs-key="pontos" data-paginationjs-format="number">Pontos</th>
        <th data-paginationjs-key="peso" data-paginationjs-format="number" data-paginationjs-decimals="2">Peso (kg)</th>
        <th data-paginationjs-key="limite" data-paginationjs-field="limite_credito" data-paginationjs-format="money">Limite</th>
        <th data-paginationjs-key="dolar" data-paginationjs-format="money" data-paginationjs-currency="USD">Em dólar</th>
        <th data-paginationjs-key="nascimento" data-paginationjs-format="date">Nascimento</th>
        <th data-paginationjs-key="criado" data-paginationjs-field="created_at" data-paginationjs-format="datetime">Cadastro</th>
        <th data-paginationjs-key="vip" data-paginationjs-format="bool">VIP</th>
        <th data-paginationjs-key="ativo" data-paginationjs-format="bool"
            data-paginationjs-true="Liberado" data-paginationjs-false="Bloqueado">Acesso</th>
        <th data-paginationjs-key="email" data-paginationjs-format="email">E-mail</th>
        <th data-paginationjs-key="site" data-paginationjs-format="link"
            data-paginationjs-link-text="Abrir site de {nome}" data-paginationjs-link-target="_blank">Site</th>
    </tr>
</thead>
```

| Coluna | Valor recebido | Exibido |
|---|---|---|
| `pontos` | `1234567` | `1.234.567` |
| `peso` | `72.5` | `72,50` |
| `limite` | `12500.5` | `R$ 12.500,50` |
| `dolar` | `99.9` | `US$ 99,90` |
| `nascimento` | `"1984-07-12"` | `12/07/1984` (sem conversão de fuso) |
| `criado` | `"2025-03-14 10:32:00"` | `14/03/2025, 10:32` |
| `vip` | `true` / `1` / `"sim"` | `Sim` |
| `ativo` | `0` | `Bloqueado` |
| `email` | `"ana@ex.com"` | link `mailto:` |
| `site` | `"https://ex.com/42"` | link “Abrir site de Ana Silva” em nova aba |
| `site` | `"javascript:alert(1)"` | texto puro (esquema recusado) |

## Template: montar a célula com HTML

O `<template>` é clonado para cada linha. `{campo}` vira **texto** (seguro), inclusive dentro de atributos.

```html
<th data-paginationjs-key="cliente" data-paginationjs-template="tpl-cliente">Cliente</th>

<template id="tpl-cliente">
    <strong>{nome}</strong><br>
    <small class="muted">{email} · {endereco.cidade}/{endereco.uf}</small>
</template>
```

```preview Como fica na tela
<table><thead><tr><th>Cliente</th></tr></thead><tbody><tr><td><strong>Ana Silva</strong><br><small style="color:#667085">ana.silva42@exemplo.com.br · São Paulo/SP</small></td></tr></tbody></table>
```

## Template com links e atributos

```html
<template id="tpl-links">
    <a href="index.php?option=com_loja&view=cliente&id={id}" title="Ver {nome}">Ver</a>
    <a href="{site}" target="_blank" rel="noopener">Site</a>
    <img src="/imagens/clientes/{id}.jpg" alt="Foto de {nome}" width="32" height="32">
</template>
```

> **Atenção:** em `href`, `src`, `action`… o valor final é validado. Se `site` vier como `javascript:…` ou outro
> esquema não permitido, o atributo é **removido**. Atributos `on*`, `style` e `srcdoc` com `{}` também são removidos.

## Template com formatador dentro: `{campo|formatador}`

```html
<template id="tpl-resumo">
    {nome} — limite de {limite_credito|money}, cliente desde {created_at|date}
</template>
```

> **Resultado:** `Ana Silva — limite de R$ 12.500,50, cliente desde 14/03/2025`

## Template com condição: `data-paginationjs-if`

O elemento é removido quando a condição é falsa.

```html
<template id="tpl-status">
    <span class="badge badge-success" data-paginationjs-if="status=ativo">Ativo</span>
    <span class="badge" data-paginationjs-if="status!=ativo">Inativo</span>
    <span class="badge badge-warning" data-paginationjs-if="vip">VIP</span>
    <span class="muted" data-paginationjs-if="!site">sem site</span>
</template>
```

| Condição | Verdadeira quando |
|---|---|
| `vip` | o valor não é vazio, `0`, `"0"`, `false`, `null` nem lista vazia |
| `!site` | o contrário da anterior |
| `status=ativo` | o valor, como texto, é igual a `ativo` |
| `status!=ativo` | o valor é diferente de `ativo` |

```preview Como fica na tela
<table><thead><tr><th>Cliente</th><th>Status</th></tr></thead><tbody>
<tr><td>Ana Silva</td><td><span class="pv-badge pv-ativo">Ativo</span> <span class="pv-badge" style="background:#fef0c7;color:#b54708">VIP</span></td></tr>
<tr><td>Bruno Souza</td><td><span class="pv-badge pv-inativo">Inativo</span> <span style="color:#667085">sem site</span></td></tr>
</tbody></table>
```

## Formatador próprio (JavaScript)

Registre antes do fim do carregamento da página e use pelo nome no `<th>`.

```js
HrPaginationjs.formatter('cpf', function (valor) {
    var d = String(valor || '').replace(/\D/g, '');

    return d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : valor;
});

HrPaginationjs.formatter('telefone', function (valor) {
    var d = String(valor || '').replace(/\D/g, '');

    return d.length === 11 ? d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : valor;
});
```

```html
<th data-paginationjs-key="cpf" data-paginationjs-format="cpf">CPF</th>
<th data-paginationjs-key="telefone" data-paginationjs-format="telefone">Telefone</th>
```

> **Dica:** o formatador também funciona dentro de templates: `{telefone|telefone}`.

## Formatador que devolve um elemento

```js
HrPaginationjs.formatter('progresso', function (valor) {
    var barra = document.createElement('progress');

    barra.max = 100;
    barra.value = Number(valor) || 0;
    barra.textContent = barra.value + '%';

    return barra;
});
```

```html
<th data-paginationjs-key="percentual" data-paginationjs-format="progresso">Andamento</th>
```

## Formatador que devolve HTML (explícito)

A única forma de inserir HTML é devolver `ctx.html(...)` / `HrPaginationjs.html(...)`. **Escape você mesmo** os dados.

```js
function escapar(texto) {
    var div = document.createElement('div');

    div.textContent = texto;

    return div.innerHTML;
}

HrPaginationjs.formatter('destaque', function (valor, linha, ctx) {
    return ctx.html('<mark>' + escapar(valor) + '</mark>');
});
```

## Formatador só desta listagem (init manual)

```html
<div id="notas" data-paginationjs="manual" data-paginationjs-remote="index.php?option=com_loja&task=notas.listar">
    <table><thead><tr><th data-paginationjs-key="nota" data-paginationjs-format="estrelas">Nota</th></tr></thead></table>
</div>

<script>
    HrPaginationjs.init('notas', {
        formatters: {
            estrelas: function (valor) {
                return '★★★★★'.slice(0, Number(valor) || 0) + '☆☆☆☆☆'.slice(Number(valor) || 0);
            }
        }
    });
</script>
```

## Seletor de colunas

```html
<div id="clientes" data-paginationjs data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar">
    <div data-paginationjs-columns></div>
    <table>
        <thead>
            <tr>
                <th data-paginationjs-key="id" data-paginationjs-required>ID</th>
                <th data-paginationjs-key="nome" data-paginationjs-required>Nome</th>
                <th data-paginationjs-key="email">E-mail</th>
                <th data-paginationjs-key="telefone" data-paginationjs-hidden>Telefone</th>
                <th data-paginationjs-key="cidade">Cidade</th>
            </tr>
        </thead>
    </table>
</div>
```

```preview Seletor aberto
<div class="hrpjs"><details class="hrpjs-columns" open><summary class="hrpjs-columns-toggle">Colunas</summary><div class="hrpjs-columns-panel"><div class="hrpjs-columns-list">
<label class="hrpjs-columns-item"><input type="checkbox" checked disabled> ID</label>
<label class="hrpjs-columns-item"><input type="checkbox" checked disabled> Nome</label>
<label class="hrpjs-columns-item"><input type="checkbox" checked> E-mail</label>
<label class="hrpjs-columns-item"><input type="checkbox"> Telefone</label>
<label class="hrpjs-columns-item"><input type="checkbox" checked> Cidade</label>
</div><button type="button" class="hrpjs-button hrpjs-columns-reset">Restaurar padrão</button></div></details></div>
```

> **Como funciona:** marcar/desmarcar **não faz requisição**; o `colspan` das mensagens se ajusta; `Esc` fecha o
> painel. Para lembrar a escolha, veja [Preferências](exemplos-preferencias-url-cache.md).
