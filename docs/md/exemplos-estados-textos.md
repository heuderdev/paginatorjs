# Estados e textos

A biblioteca desenha sozinha os estados de carregamento, vazio e erro. Nada disso precisa de código; aqui está o
que aparece em cada situação e como trocar os textos.

## Carregando

```preview Primeira carga
<div class="hrpjs"><table class="hrpjs-table"><thead><tr><th>ID</th><th>Nome</th><th>E-mail</th></tr></thead><tbody class="hrpjs-body"><tr class="hrpjs-message-row"><td colspan="3"><div class="hrpjs-message hrpjs-message--loading"><p class="hrpjs-message-text">Carregando…</p></div></td></tr></tbody></table></div>
```

> **Como funciona:** só a **primeira** carga mostra “Carregando…”. Nas seguintes, as linhas atuais ficam esmaecidas
> (sem pular a tela) e o elemento recebe `aria-busy="true"` e a classe `hrpjs-is-loading`.

```css Destacar o carregamento com a classe da listagem
#clientes.hrpjs-is-loading { cursor: progress; }
```

## Nenhum registro

```preview Busca sem resultados
<div class="hrpjs"><table class="hrpjs-table"><thead><tr><th>ID</th><th>Nome</th><th>E-mail</th></tr></thead><tbody class="hrpjs-body"><tr class="hrpjs-message-row"><td colspan="3"><div class="hrpjs-message hrpjs-message--empty"><p class="hrpjs-message-text">Nenhum cliente encontrado com esses filtros.</p></div></td></tr></tbody></table><div class="hrpjs-footer"><div class="hrpjs-summary">Nenhum registro</div></div></div>
```

```html
<div id="clientes" data-paginationjs
     data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar"
     data-paginationjs-text-empty="Nenhum cliente encontrado com esses filtros."
     data-paginationjs-text-summary-empty="Nenhum registro">
    ...
</div>
```

## Erro

```preview HTTP 500, success false, sem conexão…
<div class="hrpjs"><table class="hrpjs-table"><thead><tr><th>ID</th><th>Nome</th><th>E-mail</th></tr></thead><tbody class="hrpjs-body"><tr class="hrpjs-message-row"><td colspan="3"><div class="hrpjs-message hrpjs-message--error"><p class="hrpjs-message-text">Ocorreu um erro interno ao processar a solicitação.</p><p class="hrpjs-message-id">Código para suporte: 6bf735c3d97b99f4</p><button type="button" class="hrpjs-button hrpjs-retry">Tentar novamente</button></div></td></tr></tbody></table></div>
```

O texto vem da `mensagem` do `ApiResponseHelper`; quando não há mensagem, usa o texto padrão do tipo de erro:

| Situação | Tipo (`kind`) | Texto padrão |
|---|---|---|
| Sem conexão | `network` | Não foi possível conectar ao servidor. Verifique sua conexão. |
| Passou do tempo limite | `timeout` | O servidor demorou demais para responder. |
| HTTP 4xx/5xx | `http` | O servidor retornou um erro ({status}). |
| HTML/JSON fora do contrato | `invalid` | O servidor enviou uma resposta inválida. |
| `success: false` | `api` | Não foi possível carregar os registros. |
| HTTP 401 | `session` | Sua sessão expirou. Entre novamente para continuar. |
| HTTP 403 | `permission` | Você não tem permissão para esta operação. |

```html Trocando os textos padrão desta listagem
<div id="clientes" data-paginationjs
     data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar"
     data-paginationjs-timeout="15000"
     data-paginationjs-text-error-timeout="A consulta está demorando. Tente filtrar por um período menor."
     data-paginationjs-text-error-session="Sua sessão terminou. Recarregue a página e entre de novo."
     data-paginationjs-text-retry="Recarregar lista">
    ...
</div>
```

## Sessão expirada: levar para o login

```js
document.addEventListener('hrpaginationjs:error', function (e) {
    if (e.detail.error.kind === 'session') {
        window.location.href = 'index.php?option=com_users&view=login&return=' + btoa(window.location.href);
    }
});
```

## Todos os textos de uma vez (página inteira)

Altere `HrPaginationjs.texts` logo depois de carregar a biblioteca. Vale para todas as listagens da página.

```html
<script src="/assets/hr-paginationjs/hr-paginationjs.min.js"></script>
<script>
    HrPaginationjs.texts.loading = 'Buscando dados…';
    HrPaginationjs.texts.empty = 'Nada por aqui.';
    HrPaginationjs.texts.summary = '{start} a {end} de {total}';
    HrPaginationjs.texts.previous = 'Voltar uma página';
    HrPaginationjs.texts.next = 'Avançar uma página';
</script>
```

## Textos por atributo — referência rápida

O nome do atributo é a chave em minúsculas com hífen:

```html
<div id="clientes" data-paginationjs
     data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar"
     data-paginationjs-toolbar="search,limit,columns,reload,clear"
     data-paginationjs-text-loading="Carregando clientes…"
     data-paginationjs-text-empty="Nenhum cliente."
     data-paginationjs-text-summary="{start}–{end} de {total}"
     data-paginationjs-text-summary-empty="0 clientes"
     data-paginationjs-text-search="Pesquisar"
     data-paginationjs-text-search-placeholder="Nome ou e-mail"
     data-paginationjs-text-limit="Itens"
     data-paginationjs-text-columns="Exibir colunas"
     data-paginationjs-text-columns-reset="Padrão"
     data-paginationjs-text-column-required="Esta coluna não pode ser ocultada"
     data-paginationjs-text-reload="Recarregar"
     data-paginationjs-text-clear="Limpar tudo"
     data-paginationjs-text-pagination="Páginas de clientes"
     data-paginationjs-text-page="Ir para a página {page}"
     data-paginationjs-text-request-id="Protocolo: {id}"
     data-paginationjs-text-yes="✔"
     data-paginationjs-text-no="✘"
     data-paginationjs-text-action-done="Pronto!"
     data-paginationjs-text-action-error="Não deu certo.">
    ...
</div>
```

## Não carregar ao abrir

Útil para telas que pedem um filtro antes de listar.

```html
<div id="relatorio" data-paginationjs
     data-paginationjs-remote="index.php?option=com_loja&task=relatorio.listar"
     data-paginationjs-autoload="false"
     data-paginationjs-text-idle="Escolha o período e clique em Filtrar.">
    <form data-paginationjs-filters data-paginationjs-apply="submit">
        <input type="date" name="de" required aria-label="De">
        <input type="date" name="ate" required aria-label="Até">
        <button type="submit">Filtrar</button>
    </form>
    <table>...</table>
</div>
```

```preview Antes do primeiro filtro
<div class="hrpjs"><table class="hrpjs-table"><thead><tr><th>Data</th><th>Pedidos</th><th>Total</th></tr></thead><tbody class="hrpjs-body"><tr class="hrpjs-message-row"><td colspan="3"><div class="hrpjs-message hrpjs-message--idle"><p class="hrpjs-message-text">Escolha o período e clique em Filtrar.</p></div></td></tr></tbody></table></div>
```

## Mensagens de dependência faltando

Se a ordem dos scripts estiver errada, a listagem mostra o problema no lugar da tabela:

```preview jQuery não carregado
<div class="hrpjs"><div class="hrpjs-fatal" role="alert">hr-paginationjs: jQuery não foi encontrado. Carregue nesta ordem: jQuery -&gt; pagination.js -&gt; hr-paginationjs.js.</div></div>
```

## Cores do tema

Sobrescreva as variáveis no elemento da listagem (ou em `.hrpjs` para todas):

```css
.hrpjs {
    --hrpjs-accent: #0b7a75;
    --hrpjs-accent-text: #ffffff;
    --hrpjs-border: #c9d4d3;
    --hrpjs-radius: 4px;
}

#clientes {
    --hrpjs-danger: #a4161a;
}
```
