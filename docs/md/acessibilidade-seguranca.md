# Acessibilidade e segurança

## Acessibilidade

| Requisito | Como é atendido |
|---|---|
| Busca e controles com rótulo | A toolbar automática cria `<label for>`. Nos seus controles, use `<label>` ou `aria-label`. |
| Navegação por teclado | Paginação: links viram `role="button"` com `tabindex="0"`; `Enter` e `Espaço` acionam. Ordenação: `<button>` real no `<th>`. Seletor de colunas: `<details>`/`<summary>` nativos + `Esc` fecha. |
| Foco visível | `:focus-visible` com contorno de 2px em todos os controles da biblioteca. |
| Foco estável | Se o foco estava na paginação, depois do redesenho ele volta para o mesmo botão (anterior/próxima) ou para a página atual. Nenhum outro movimento de foco é feito. |
| Página atual identificada | `aria-current="page"` + destaque + sublinhado (não só cor). |
| Estado desabilitado | `aria-disabled="true"` + `tabindex="-1"` (anterior/próxima nas pontas). Botões de ação ficam `disabled` + `aria-busy` durante o envio. |
| Carregamento | `aria-busy="true"` no elemento raiz e na tabela; linhas atuais ficam esmaecidas (sem salto de layout) e só a primeira carga mostra “Carregando…”. |
| Anúncios | Região `role="status"` / `aria-live="polite"`: anuncia o resumo após cada interação do usuário (não na carga inicial), erros e mensagens de ações — um anúncio por resposta. |
| Ordenação | `aria-sort="ascending|descending"` no `<th>` ativo + ícone ▲/▼ (↕ nas demais). |
| Estados vazio/erro | Linha única com `colspan` = colunas visíveis; erro com ícone ⚠, texto e botão “Tentar novamente”. |
| Paginação | Contêiner `role="navigation"` com `aria-label="Paginação"`; rótulos “Página N”, “Página anterior”, “Próxima página”; reticências `aria-hidden`. |
| Movimento reduzido | `prefers-reduced-motion` desliga o spinner e transições. |
| Responsivo | Toolbar e rodapé quebram linha; as células recebem `data-label` (nome da coluna) para layouts em cartão. |

## Estilos isolados

Todas as regras ficam sob `.hrpjs` (raiz) ou `.hrpjs-table` (tabela). Nada altera `table`, `button`, `input`,
`.row` ou outras classes globais. O visual da tabela continua sendo o do projeto; a biblioteca só estiliza o que
ela cria. Cores via variáveis CSS (`--hrpjs-accent`, `--hrpjs-border`, …) sobrescrevíveis no `.hrpjs`.

## Segurança — frontend

| Regra | Implementação |
|---|---|
| Texto comum é texto | Células, placeholders de template e mensagens usam `textContent`/`nodeValue`. Nunca `innerHTML` com dados. |
| HTML só por API explícita | `HrPaginationjs.html()` num formatador. Documentado como responsabilidade de quem o usa. |
| URLs validadas | `data-paginationjs-remote` e ações remotas: só relativa, `http`, `https`. Links (`link`, atributos `href`/`src`/`action`… em templates): também `mailto` e `tel`. `javascript:`, `data:` e similares são descartados. |
| Atributos perigosos em templates | `on*`, `style` e `srcdoc` com `{campo}` são removidos. |
| Sem detalhes internos | Mensagens vêm da `mensagem` pública do helper ou de textos padrão. Só o `request_id` é exibido (para suporte). |
| Console | Só avisos de configuração (nomes de opções/colunas). Nenhum dado de linha, parâmetro ou resposta é registrado. |
| Sem segredos em atributos | Nada sensível deve ir em `data-paginationjs-params`. O token CSRF é descoberto na página (já presente via `JHtml::_('form.token')`), não em atributo da listagem. |
| CSP | Nenhum `eval`, `new Function` ou script inline gerado. |

> Escapar não é autorizar: esconder um botão ou uma coluna no navegador não impede ninguém de chamar o endpoint.

## Segurança — backend (obrigatório em cada endpoint)

- Autenticação e autorização em **toda** task (`PermissionHelper::require`), inclusive na listagem.
- Ações que alteram dados: `PermissionHelper::requireToken()` + permissão específica.
- Ordenação só por lista branca `key pública → coluna real`; direção validada (`InputHelper::sorting`).
- Teto de registros por página (`InputHelper::pagination($padrao, $maximo)`).
- Consultas parametrizadas (`OrmBase`/`whereLike` escapam os valores).
- Mesmos filtros de autorização na contagem e na consulta (`OrmBase::paginate()` faz o `count()` com o mesmo clone).
- O `select` devolve só colunas que o usuário pode ver.
- Não confie em filtros, colunas ou IDs vindos do navegador; verifique se o usuário pode acessar **aquele** registro.
- Não altere o `ApiResponseHelper` para acomodar a interface.
