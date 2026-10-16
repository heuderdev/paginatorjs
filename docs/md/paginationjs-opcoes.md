# Opções do Pagination.js 2.6.0

O Pagination.js é usado **somente como renderizador dos botões de página**. A cada resposta, a biblioteca chama
`$(pager).pagination({...})` de novo com `totalNumber`, `pageNumber` e `pageSize` vindos do servidor e
`triggerPagingOnInit: false` — o plugin nunca faz requisições. Cliques são interceptados pelos hooks `before*`,
que devolvem `false` e repassam a página para o estado do hr-paginationjs (único dono das requisições).

Opções extras vão em JSON no atributo ou em `paginationOptions` no `init`:

```html
<div ... data-paginationjs-options='{"showGoInput": true, "showGoButton": true, "goButtonText": "Ir", "pageRange": 1}'>
```

## Podem ser sobrescritas

`pageRange`, `showPrevious`, `showNext`, `showPageNumbers`, `showNavigator`, `formatNavigator`, `showGoInput`,
`showGoButton`, `formatGoInput`, `formatGoButton`, `goButtonText`, `prevText`, `nextText`, `ellipsisText`,
`activeClassName`, `disableClassName`, `ulClassName`, `pageClassName`, `prevClassName`, `nextClassName`,
`autoHidePrevious`, `autoHideNext`, `hideOnlyOnePage`, `hideFirstOnEllipsisShow`, `hideLastOnEllipsisShow`,
`header`, `footer`, `position`.

Padrões da biblioteca: `pageRange: 2` (ou `data-paginationjs-page-range`), `prevText: '&lsaquo;'`,
`nextText: '&rsaquo;'`, `hideOnlyOnePage: true`.

> `prevText`, `nextText`, `header`, `footer`, `formatNavigator`, `formatGoInput` e `formatGoButton` são
> inseridos **como HTML** pelo Pagination.js. Use apenas texto fixo do desenvolvedor, nunca dados do usuário.

## São combinadas

| Opção | Como combina |
|---|---|
| `className` | `hrpjs-paginationjs` + a sua. |
| `afterRender` | A sua roda primeiro; depois a biblioteca aplica os atributos de acessibilidade. |
| `beforePageOnClick`, `beforePreviousOnClick`, `beforeNextOnClick`, `beforeGoButtonOnClick`, `beforeGoInputOnEnter` | A sua roda primeiro. Se devolver `false`, a navegação é cancelada. Caso contrário, a biblioteca navega. Em nenhum caso o plugin faz requisição própria. |

## Controladas exclusivamente pela biblioteca (ignoradas, com aviso no console)

`dataSource`, `locator`, `totalNumber`, `totalNumberLocator`, `pageNumber`, `pageSize`, `alias`, `ajax`,
`ajaxFunction`, `callback`, `formatResult`, `triggerPagingOnInit`, `resetPageNumberOnInit`, `showSizeChanger`,
`sizeChangerOptions`, `formatSizeChanger`, `beforeSizeSelectorChange`, `pageLink`, `classPrefix`, `disabled`,
`beforeInit`, `beforePaging`, `onError` e qualquer outra não listada acima.

Motivos: são as opções que fariam o plugin requisitar dados, guardar um total diferente do servidor, navegar por
link ou mudar os seletores que a biblioteca usa. A quantidade por página tem controle próprio
(`select[data-paginationjs-page-size]`) com `<label>` acessível.

Se algo externo chamar `$(pager).pagination('go', n)`, a chamada é desviada pelo `ajaxFunction` protegido para
`setPage(n)` — continua havendo uma única requisição. `'next'`, `'previous'` e `'refresh'` não têm efeito nesse
modo (o plugin não guarda a página atual porque nunca executa o próprio `go()`); use os métodos da instância
(`setPage`, `reload`).

## APIs do Pagination.js usadas (verificadas no código 2.6.0)

| API | Uso |
|---|---|
| `$(el).pagination(opcoes)` | Desenha; chamar de novo desinstala a instância anterior (`uninstallPlugin`). |
| `dataSource` string + `totalNumber` | Modo assíncrono sem `totalNumberLocator`; exige `totalNumber` numérico. |
| `triggerPagingOnInit: false` | Impede o `go()` inicial (que faria a requisição). |
| hooks `before*OnClick` / `beforeGo*` | Retornar `false` interrompe o `go()` do plugin. |
| `ajaxFunction` | Ponto único por onde o plugin requisitaria — desviado. |
| `afterRender` | Acessibilidade. |
| `$(el).pagination('destroy')` | Remove o elemento e faz `container.off()` — por isso o contêiner é exclusivo da biblioteca. |
