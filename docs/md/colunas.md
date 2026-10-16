# Colunas

As colunas são os `<th>` da **última linha** do `<thead>`. A ordem visual é a ordem dos `<th>`, mas a
identidade da coluna é sempre a `key` — nunca a posição.

## Atributos do `<th>`

| Atributo | Padrão | Descrição |
|---|---|---|
| `data-paginationjs-key` | **obrigatório** (ou `field`) | Identificador estável. Usado na ordenação (`sort=<key>`), nas preferências e na API JS. |
| `data-paginationjs-field` | igual à `key` | Campo da linha a exibir. Aceita caminho: `cliente.nome`. |
| `data-paginationjs-label` | texto do `<th>` | Nome usado no seletor de colunas e em `data-label` das células. |
| `data-paginationjs-sortable` | — | Coluna ordenável (o `<th>` ganha um botão). |
| `data-paginationjs-sort-first` | `asc` | Direção do primeiro clique (`desc` é útil para datas e valores). |
| `data-paginationjs-required` | — | Sempre visível; não aparece como opção desmarcável. |
| `data-paginationjs-hidden` | — | Começa oculta (o usuário pode exibir). |
| `data-paginationjs-actions` | — | Coluna de ações: não conta como “coluna de dados” na regra de mínimo. |
| `data-paginationjs-format` | texto | Formatador: `text`, `number`, `money`, `date`, `datetime`, `bool`, `link`, `email` ou um registrado. |
| `data-paginationjs-template` | — | `id` de um `<template>` usado para montar a célula. |
| `data-paginationjs-align` | — | `left`, `center` ou `right` (classe `hrpjs-align-*` no `<th>` e nas `<td>`). |
| `data-paginationjs-width` | — | Largura CSS aplicada ao `<th>` (ex.: `80px`, `10%`). |
| `data-paginationjs-default` | vazio | Texto quando o valor é `null`, `undefined` ou vazio. Ex.: `—`. |
| `data-paginationjs-class` | — | Classes extras em cada `<td>` da coluna. |

Parâmetros de formatadores (no próprio `<th>`):

| Atributo | Formatador | Efeito |
|---|---|---|
| `data-paginationjs-decimals` | `number` | Casas decimais fixas. |
| `data-paginationjs-currency` | `money` | Moeda da coluna (padrão: a da listagem). |
| `data-paginationjs-true` / `-false` | `bool` | Textos no lugar de Sim/Não. |
| `data-paginationjs-link-text` | `link` | Texto do link (aceita `{campo}`); padrão: a própria URL. |
| `data-paginationjs-link-target` | `link` | `_blank` abre em nova aba com `rel="noopener noreferrer"`. |

## Formatadores embutidos

| Nome | Entrada | Saída (pt-BR) |
|---|---|---|
| `text` | qualquer | texto |
| `number` | número ou string numérica | `1.234,5` |
| `money` | número | `R$ 1.234,50` |
| `date` | `YYYY-MM-DD` ou `YYYY-MM-DD HH:MM:SS` | `31/01/2026` (sem conversão de fuso) |
| `datetime` | `YYYY-MM-DD HH:MM(:SS)` / ISO | `31/01/2026, 14:05`. Sem fuso na string = exibido como veio; com `Z`/`±hh:mm` = convertido para o fuso do navegador |
| `bool` | `1/0`, `true/false`, `sim/não` | `Sim` / `Não` |
| `link` | URL `http`, `https`, `mailto`, `tel` ou relativa | `<a href>`; outros esquemas viram texto |
| `email` | e-mail | `<a href="mailto:...">` |

### Formatador próprio

```js
HrPaginationjs.formatter('cpf', function (valor, linha, ctx) {
    var d = String(valor || '').replace(/\D/g, '');
    return d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : valor;
});
```

`ctx` = `{ key, field, label, th, locale, currency, texts, html }`. O retorno pode ser:

- **string/número** → inserido como **texto** (seguro);
- **Node** (elemento criado com `document.createElement`) → inserido como está;
- `HrPaginationjs.html('<b>…</b>')` → inserido como **HTML**. É a única forma de inserir HTML e é
  responsabilidade de quem escreve o formatador escapar os dados.

Formatador que lança exceção não quebra a tabela: a célula mostra o `default` e um aviso vai para o console.

## Templates (`<template>`)

```html
<th data-paginationjs-key="status" data-paginationjs-template="tpl-status">Status</th>

<template id="tpl-status">
    <span class="badge badge-{status}">{status}</span>
    <small data-paginationjs-if="bloqueado">bloqueado em {bloqueado_em|date}</small>
</template>
```

- `{campo}` e `{a.b}` são substituídos **como texto** em nós de texto e atributos.
- `{campo|formatador}` aplica um formatador e usa o resultado como texto.
- Atributos de URL (`href`, `src`, `action`, `formaction`…) com `{}` são validados: `javascript:` e
  esquemas desconhecidos removem o atributo.
- Atributos `on*`, `style` e `srcdoc` que contenham `{}` são removidos.
- `data-paginationjs-if` remove o elemento quando a condição é falsa:
  `campo` (verdadeiro), `!campo` (falso), `campo=valor`, `campo!=valor`.
- Campo ausente vira texto vazio.

## Seletor de colunas

Coloque `<div data-paginationjs-columns></div>` onde quiser (ou use `toolbar="columns"`). Ele vira um
`<details>` nativo com uma caixa por coluna e o botão “Restaurar padrão”. `Esc` fecha o painel.

Regras:

- Colunas `required` aparecem marcadas e desabilitadas.
- Não é possível ocultar **a última coluna de dados visível** (colunas `actions` não contam).
- Mudar visibilidade **não faz requisição**: cabeçalhos e células são atualizados na hora, o `colspan` das
  mensagens é ajustado e a escolha vale para as próximas páginas.
- Com `data-paginationjs-persist` (inclui `columns`), a escolha é salva.

## Mudança de esquema (o que acontece com preferências salvas)

| Situação | Comportamento |
|---|---|
| Coluna nova | Usa o padrão do HTML (`hidden` ou não). |
| Coluna removida | A preferência dela é ignorada. |
| `key` renomeada | Tratada como removida + nova (volta ao padrão). |
| Coluna antes opcional agora `required` | Sempre visível, a preferência antiga é ignorada. |
| Preferência deixaria nenhuma coluna de dados | A primeira coluna de dados é exibida. |
| Mudança grande / incompatível | Aumente `data-paginationjs-version`: a chave muda e as preferências antigas deixam de ser lidas. |

> Coluna oculta **não é controle de acesso**. Dados que o usuário não pode ver não devem estar na resposta.
