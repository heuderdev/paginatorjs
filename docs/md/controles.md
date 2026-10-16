# Controles declarativos

Controles são elementos marcados com atributos. Podem ficar **dentro** do elemento raiz ou **fora** dele com
`data-paginationjs-for="<id da listagem>"` (no próprio controle ou num contêiner que o envolva).

```html
<!-- fora da listagem -->
<div data-paginationjs-for="clientes">
    <input type="search" data-paginationjs-search aria-label="Buscar">
    <button type="button" data-paginationjs-reload>Atualizar</button>
</div>
```

| Atributo | Elemento | Efeito |
|---|---|---|
| `data-paginationjs-search` | `input` | Campo de busca ([detalhes](busca-filtros-ordenacao.md)). |
| `data-paginationjs-filters` | `form` | Todos os campos com `name` viram filtros. |
| `data-paginationjs-filter` | campo | Campo avulso de filtro (`name` = nome do parâmetro). |
| `data-paginationjs-type` | campo | `text`, `number`, `int`, `bool`, `date`. |
| `data-paginationjs-ignore` | campo | Exclui o campo do formulário de filtros. |
| `data-paginationjs-apply="submit"` | `form` | Aplica só no envio do formulário. |
| `data-paginationjs-clear` | botão | `all` (padrão), `filters` ou `search`. |
| `data-paginationjs-reload` | botão | Recarrega a página atual ignorando o cache. |
| `data-paginationjs-page-size` | `select` | Quantidade por página. Vazio = opções de `data-paginationjs-limits`. |
| `data-paginationjs-columns` | contêiner | Recebe o seletor de colunas. |
| `data-paginationjs-summary` | qualquer | Recebe o texto “Exibindo 1 a 20 de 135 registros”. Se não existir, um é criado no rodapé. |
| `data-paginationjs-pager` | contêiner | Onde a paginação é desenhada. Se não existir, fica no rodapé. |
| `data-paginationjs-table` | `table` | Escolhe a tabela quando há mais de uma dentro da raiz. |

## Toolbar automática

`data-paginationjs-toolbar="search,limit,columns,reload,clear"` cria, no topo da raiz e na ordem informada:

| Item | Cria |
|---|---|
| `search` | `<label>` + `<input type="search" data-paginationjs-search>` |
| `limit` | `<label>` + `<select data-paginationjs-page-size>` |
| `columns` | seletor de colunas |
| `reload` | botão Atualizar |
| `clear` | botão Limpar (busca + filtros) |

## O que a biblioteca cria sozinha

| Elemento | Classe | Observação |
|---|---|---|
| Corpo da tabela | `tbody.hrpjs-body` | Usa o `<tbody>` existente ou cria um. O conteúdo original volta no `destroy()`. |
| Estados | `tr.hrpjs-message-row` | `--loading`, `--empty`, `--error` (com “Tentar novamente” e código da requisição). |
| Rodapé | `.hrpjs-footer` | Aviso de ações, resumo e paginação. |
| Paginação | `.hrpjs-pager` (`role="navigation"`) | Desenhada pelo Pagination.js dentro de um elemento exclusivo. |
| Região viva | `.hrpjs-live` (`role="status"`) | Anúncios para leitores de tela (visualmente oculta). |
| Aviso | `.hrpjs-notice` | Mensagens de ações (some sozinho após alguns segundos). |

Classes de estado no elemento raiz: `.hrpjs`, `.hrpjs-is-loading` (+ `aria-busy="true"`), e na tabela `.hrpjs-table`.
