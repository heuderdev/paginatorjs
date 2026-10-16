# hr-paginationjs — Pensamento e passo a passo

Arquivo de controle do desenvolvimento. Cada etapa só recebe `[x]` quando foi feita **e** conferida.
Etapas com `[ ]` ainda não foram feitas. Nada aqui é marcado como testado sem evidência.

---

## 0. Pedido

- Framework **hr-paginationjs** baseado no `prompt.md`.
- Toda a lógica dirigida por atributos `data-paginationjs-*` (o mínimo possível de JavaScript na tela).
  Ex.: `data-paginationjs-remote="minhaurl.com.br/api.php"`.
- Documentação de cada método/atributo na pasta `docs/`.
- Este arquivo como checklist para nunca se perder.

## 1. Inspeção das fontes (prompt.md §1)

- [x] Ler `leia.md` e `prompt.md` inteiros.
- [x] `DOCUMENTO_CONTEXTO_IA.md` → **não existe** em `C:\laragon\www` (busca até 7 níveis). Seguimos com o código real dos helpers como fonte de verdade.
- [x] `ApiResponseHelper.php` (em `C:\laragon\www\helpers-joomla`) lido. Fatos verificados:
  - `paginated(array $result, $message, $options)` recebe o retorno de `OrmBase::paginate()` e gera
    `data` = `$result['itens']` e `meta.paginacao` = `{total, por_pagina, pagina_atual, total_paginas}` (todos `int`).
  - Envelope: `success` (bool), `status` (`sucesso|erro|aviso|info`), `mensagem`, `data`, `errors`, `request_id`, `meta` (só quando não vazio).
  - `errors` é normalizado para `{ "campo": ["msg", ...] }`; lista simples vira `{ "_general": [...] }`; vazio vira `[]` em JSON (array PHP vazio).
  - Responde JSON quando `format=json` **ou** `X-Requested-With: XMLHttpRequest` **ou** `Accept: application/json` → `&format=json` não é obrigatório.
  - Header `X-Request-Id` também é enviado.
  - Códigos: 401 `unauthorized`, 403 `forbidden`, 422 `validationError`, 429, 500 `exception`, 503.
- [x] `OrmBase::paginate($porPagina, $paginaAtual)` lido: faz `count()` com os mesmos filtros e `LIMIT/OFFSET` no banco. **Não** corrige página além da última (devolve `itens` vazio com `pagina_atual` pedida) → o frontend trata (ver §6).
- [x] `OrmBase::orderBy()` aceita só ASC/DESC e usa `quoteName` → o mapeamento campo público → coluna real fica no controller (lista permitida).
- [x] `InputHelper::pagination($default, $max)` → parâmetros `page` e `limit`, com teto máximo no backend.
- [x] `InputHelper::sorting($permitidos, $padrao, $dir)` → parâmetros `sort` e `direction` (aceita minúsculo, converte para maiúsculo).
- [x] `InputHelper::filters($mapa)` → filtros tipados; arrays no formato PHP `status[]=a&status[]=b`.
- [x] `vitrine.js`/`vigia.js` lidos (trechos relevantes). Vigia descobre o token CSRF por `Joomla.getOptions('csrf.token')` → `input hidden` de 32 hex com valor 1 → `meta[name=csrf-token]`. **Reaproveitamos a mesma regra.**
- [x] Joomla 3 local (`C:\laragon\www\joomla3`) traz **jQuery 1.12.4** em `media/jui/js/jquery.min.js`.
- [x] Pagination.js **2.6.0** baixado do npm e o `src/pagination.js` lido inteiro. APIs reais usadas listadas em §4.

### Classificação de recursos (prompt.md §3)

| Recurso | Situação |
|---|---|
| Envelope JSON, paginação no banco, `page/limit/sort/direction`, filtros tipados | **Existente e reutilizável** (ApiResponseHelper, OrmBase, InputHelper) |
| Descoberta do token CSRF | **Existente** (regra do Vigia.js, replicada sem depender do axios) |
| Listagem declarativa com Pagination.js, seletor de colunas, preferências versionadas, adaptador DataTables | **Novo** |
| Exportação, seleção em lote, edição inline, reordenação/redimensionamento de colunas | **Fora do escopo** (extensões futuras) |

**Por que uma biblioteca nova e não estender a Vitrine.js:** o pedido explícito é um framework novo chamado
hr-paginationjs, com Pagination.js como motor e atributos `data-paginationjs-*`. A Vitrine.js tem paginação
própria, depende do Vigia.js + axios e usa `data-vitrine-*`. Estendê-la para usar Pagination.js trocaria o
motor e o contrato público dela (proibido sem autorização). As duas **não** devem ser usadas na mesma tela.
O transporte da hr-paginationjs usa `XMLHttpRequest` nativo (revisado em 2026-10-16 para aceitar qualquer jQuery ≥ 1.7, inclusive *slim*; ver §10), então
não entra axios nem outra dependência.

## 2. Decisões fixadas (contrato)

- [x] Requisição (padrão, nomes configuráveis): `page`, `limit`, `sort`, `direction` (`asc|desc`), busca `search` (renomeável só por `data-paginationjs-names`, uma única fonte — revisado na implementação), filtros pelo `name` de cada campo.
- [x] Resposta: contrato do `ApiResponseHelper::paginated()`. `success !== true` = falha funcional mesmo com HTTP 200. Sem `meta.paginacao.total` numérico ou `data` não-array = **resposta inválida** (nunca vira lista vazia).
- [x] Total vem sempre de `meta.paginacao.total`, nunca de `data.length`.
- [x] Adaptador `datatables`: envia `draw,start,length,search_value,order_col,order_dir`; lê `recordsFiltered` (total filtrado) e `data`.
- [x] Precedência do estado inicial: **URL > preferências salvas > atributos HTML (padrão)**.
- [x] Busca, filtros e limite → voltam para a página 1. Ordenação → **também volta para a página 1** (decisão: a página N de outra ordem não tem relação com a atual).
- [x] Página além da última → corrige **uma única vez** para a última página válida (sem loop).
- [x] Visibilidade de coluna → só re-renderiza com os dados atuais, **sem requisição**.
- [x] Pagination.js só desenha os controles; **o único dono das requisições é o transporte da hr-paginationjs**.

## 3. Estrutura de arquivos

- [x] `src/hr-paginationjs.js` — biblioteca (um arquivo, sem build). `node --check` OK.
- [x] `src/hr-paginationjs.css` — estilos isolados em `.hrpjs` / `.hrpjs-table`.
- [x] `vendor/` — `jquery-1.12.4.min.js` (só para demo/testes), `pagination-2.6.0.min.js`, `pagination-LICENSE.txt`.
- [x] `exemplos/minimo.html` — exemplo mínimo (só HTML).
- [x] `exemplos/index.php` — exemplo realista (duas instâncias, filtros, ações remotas, URL, preferências, simulação de erros).
- [x] `exemplos/dados.php` + `exemplos/api.php` — API falsa no formato exato do `ApiResponseHelper::paginated()` (+ tasks `excluir`, `status`, `reiniciar` com token).
- [x] `exemplos/api-datatables.php` — API legada no formato DataTables.
- [x] `exemplos/joomla3/` — `controllers/clientes.php`, `views/clientes/tmpl/default.php`, `README.md`. `php -l` OK.
- [x] `tests/` — `harness.js`, `hr-paginationjs.tests.js`, `runner.html`, `run-node.js`.
- [x] `docs/` — 15 páginas (índice, instalação, primeira tela, atributos, colunas, busca/filtros/ordenação, controles, ações, API JS, eventos, backend, preferências/URL/cache, opções do Pagination.js, acessibilidade/segurança, testes).
- [x] Pedido de 2026-10-16: docs em HTML para ler no navegador. Fonte movida para `docs/md/*.md`; `docs/*.html` (entrada `docs/index.html`) gerados por `tools/build-docs.js` (marked 12 fora do projeto, via `HRPJS_MARKED`) com `docs/assets/docs.css` (menu lateral, sumário da página, anterior/próxima, tema claro/escuro, responsivo, impressão). Verificado: 438 links/âncoras internos resolvem, nenhuma marcação de exemplo fora de `<pre>/<code>`.

## 4. Integração com Pagination.js 2.6.0 (APIs verificadas no código-fonte)

- [x] `dataSource: 'hrpjs'` + `totalNumber` + `pageNumber` + `pageSize` + `triggerPagingOnInit: false` → só desenha. (teste 02: 1 clique = 1 requisição)
- [x] Hooks `beforePageOnClick/PreviousOnClick/NextOnClick/GoButtonOnClick/GoInputOnEnter` retornam `false` e chamam `setPage`. Seletor de tamanho do plugin desligado (controle próprio com label).
- [x] `ajaxFunction` protegido: `pagination('go', n)` externo vira `setPage(n)`. `next/previous/refresh` não têm efeito (o plugin não guarda `model.pageNumber`) — documentado. (teste 31)
- [x] Acessibilidade aplicada após cada desenho (role, tabindex, aria-current, aria-disabled, aria-label). (teste 24)
- [x] Re-render a cada resposta com `.pagination(opções)` (o plugin faz `uninstallPlugin`).
- [x] `destroy`: contêiner `.hrpjs-pager` exclusivo da biblioteca (o plugin faz `container.off()`). (teste 22)
- [x] `paginationOptions`: lista permitida, combinadas (`className`, `afterRender`, hooks de clique) e protegidas (aviso no console). Documentado em `docs/paginationjs-opcoes.md`.
- [x] Matriz: navegadores modernos (Pagination.js 2.6.0 usa ES6). A biblioteca usa sintaxe ES5 + APIs modernas (Promise, URLSearchParams, CustomEvent, `<template>`, `closest`).

## 5. Implementação (ordem do prompt §19)

- [x] 5.1 Utilidades: `textContent`, `safeUrl` (request: relativa/http/https; link: + mailto/tel), `getPath`, timers nomeados.
- [x] 5.2 Dependências verificadas no `init` (sem polling) com mensagem visível (`.hrpjs-fatal`, role=alert) + console. (teste 25)
- [x] 5.3 Configuração: todos os `data-paginationjs-*` + opções JS (JS tem precedência).
- [x] 5.4 Estado único por instância em closure; `getState()` devolve cópia.
- [x] 5.5 Transporte `XMLHttpRequest` nativo (antes `$.ajax`; ver §10), sequência + abort, timeout, classificação: abort, network, timeout, http, invalid, api, session (401), permission (403). (testes 11–16)
- [x] 5.6 Adaptadores `apiresponse` e `datatables` + `HrPaginationjs.adapter()`. (teste 26)
- [x] 5.7 Paginação remota com Pagination.js só como renderizador.
- [x] 5.8 Renderização: texto por padrão, formatadores embutidos/registrados, `HrPaginationjs.html()` explícito, `<template>` com `{campo}`, `{campo|formatador}` e `data-paginationjs-if`. (testes 23, 30)
- [x] 5.9 Estados: carregando (aria-busy, linhas esmaecidas), vazio, erro com "Tentar novamente" e `request_id`, resumo, aria-live. (testes 08, 13)
- [x] 5.10 Busca: debounce, Enter imediato, IME, mínimo de caracteres, termo vazio = sem filtro. (testes 04, 04b, 05)
- [x] 5.11 Filtros tipados (text, number, int, bool, date, múltiplos), `form[data-paginationjs-filters]`, modo `apply=submit`, limpar. (teste 06)
- [x] 5.12 Ordenação por key, só colunas `sortable`, botão no th, `aria-sort`, ▲/▼/↕. (teste 07)
- [x] 5.13 Colunas: padrão/obrigatórias/ocultas, `<details>` nativo, restaurar, colspan, mínimo 1 coluna de dados (colunas `actions` não contam). (testes 17, 18)
- [x] 5.14 Preferências `hrpaginationjs:{namespace}:{usuario}:{id}:v{versao}`, tolerante a falhas. (testes 19, 20)
- [x] 5.15 URL: prefixo, preserva alheios, replace/push só quando muda, popstate sem loop. (teste 27)
- [x] 5.16 Cache opcional: TTL, máximo, chave endpoint+método+usuário+parâmetros, invalidação em reload/ações. (teste 29)
- [x] 5.17 Ações: evento cancelável `hrpaginationjs:action` + ação remota declarativa com confirmação e token CSRF (mesma regra do Vigia.js). (teste 28)
- [x] 5.18 Eventos `hrpaginationjs:*` com payload copiado.
- [x] 5.19 API JS (`init/get/scan/instances/formatter/adapter/html/findToken`) + métodos de instância + `destroy()` completo. (teste 22)
- [x] 5.20 Múltiplas instâncias e `data-paginationjs-for`. (teste 21)

## 6. Regras de comportamento (para conferência)

| Método / interação | Requisição? | Página |
|---|---|---|
| `reload()` / botão `data-paginationjs-reload` | Sim (ignora cache) | Preserva |
| `setPage(n)` / clique na paginação | Sim | n |
| `setLimit(n)` / select de quantidade | Sim | 1 |
| `setSearch(t)` / campo de busca | Sim (debounce no campo) | 1 |
| `setFilter / setFilters / clearFilters` | Sim | 1 |
| `setSort(key, dir)` / clique no cabeçalho | Sim | 1 |
| `showColumn / hideColumn / toggleColumn / resetColumns` | **Não** | Preserva |
| `resetPreferences()` | Sim (limite/ordem podem mudar) | 1 |
| `getState()` / `getRows()` | Não (cópia) | — |
| `destroy()` | Cancela a pendente | — |

- Todos podem ser chamados durante o carregamento: a requisição anterior é abortada e a resposta antiga é descartada pela sequência.
- Métodos que requisitam retornam `Promise` (resolve após renderizar; rejeita com o erro classificado; já marcada como tratada).

## 7. Testes

- [x] 7.1 Harness sem dependências (`tests/harness.js`) + `tests/runner.html` para o navegador.
- [x] 7.2 Execução em Node + jsdom 24 (instalado só no scratchpad, fora do projeto) via `tests/run-node.js`.
- [x] 7.3 Os 25 cenários do prompt §18 + 10 extras (04b, 26–34).
- [x] 7.4 Executado — ver §9.

## 8. Revisão final (prompt §20)

- [x] Usa apenas APIs reais? Pagination.js 2.6.0 lido no fonte (`src/pagination.js` do pacote npm); jQuery só via `$(el).pagination` (compatível 1.7–4.x, ver §10); helpers lidos (`paginated`, `pagination`, `sorting`, `filters`, `oneOf`, `int`, `paginate`, `whereLike`, `whereIn`, `update`, `delete`, `findOrFail`, `require`, `requireToken`).
- [x] Contrato do `ApiResponseHelper` respeitado sem alterar o helper.
- [x] Paginação no banco (exemplo Joomla usa `OrmBase::paginate`; demo PHP filtra → conta → ordena com desempate → corta).
- [x] Um único dono das requisições (testes 02 e 31).
- [x] Resposta antiga não sobrescreve a nova (testes 11 e 12; mutação removendo a checagem de sequência faz o teste 11 falhar).
- [x] Seletor de colunas funciona após trocar de página (teste 17).
- [x] Dados não autorizados fora da resposta: o `select` do exemplo lista só as colunas da tela; documentado que coluna oculta não é controle de acesso.
- [x] Múltiplas instâncias isoladas (teste 21 + página `exemplos/index.php`).
- [x] `destroy()` remove tudo e permite reinicializar (teste 22).
- [x] Ordem de carregamento validada (teste 25 + view Joomla com `JHtml::_('jquery.framework')` primeiro).
- [x] Exemplos integráveis sem trechos faltando (`exemplos/joomla3/README.md` diz onde cada arquivo vai).
- [x] Nenhum teste declarado como executado sem evidência (ver §9 e limites).

## 9. Registro de execução

Executado em 2026-10-16 (Windows 11, Node 22.12.0, PHP 8.4.2 CLI, jsdom 24 no scratchpad):

1. `node --check src/hr-paginationjs.js` → OK.
2. `node tests/run-node.js` (HRPJS_JSDOM apontando para o scratchpad) → **32 de 32 testes passaram**, código de saída 0.
3. Teste de mutação (cópia no scratchpad): removendo a checagem de sequência e trocando `textContent` por `innerHTML` → testes 11 e 23 falharam como esperado (os testes detectam as regressões).
4. `php -S 127.0.0.1:8765` + `curl`: `api.php` devolve o envelope do `ApiResponseHelper` com `meta.paginacao`; página 99 devolve `data: []` com o total real; `api-datatables.php` devolve `draw/recordsTotal/recordsFiltered/data`; POST de exclusão sem token → HTTP 403.
5. Ponta a ponta (jsdom + jQuery real + servidor PHP) em `exemplos/index.php`: carga das duas listagens (237 registros), troca de página com URL `?cli_page=3`, ordenação por nome (volta à página 1, URL `cli_sort=nome&cli_direction=asc`), filtro status=inativo (47), ação remota "Ativar" com token (mensagem "Cliente ativado.", lista recarregada com 46), simulações `erro→http`, `falha→api`, `sessao→session`, `invalida→invalid` com `request_id`, campo "Ir" da listagem DataTables (página 4), preferência de colunas salva. Linha com `<img onerror>` exibida como texto (0 `<img>` no tbody). Console sem erros.
6. `php -l` em todos os PHP de `exemplos/` → sem erros. Busca por sintaxe pós-PHP 7.0 (`??=`, `?->`, `match`, `fn`, `: void`, `enum`) → nenhuma ocorrência real.

**Não executado** (sem ambiente):
- `tests/runner.html` num navegador real (o mesmo arquivo de testes foi executado no jsdom).
- Controller/view `exemplos/joomla3` dentro de um Joomla 3 com o componente `com_loja` (não existe neste ambiente); verificados só por `php -l` e revisão contra o código dos helpers.
- Leitores de tela reais e conferência visual de foco/responsividade.

## 10. Compatibilidade com qualquer versão do jQuery (pedido de 2026-10-16)

Diagnóstico (antes de mudar):
- [x] Baixadas (scratchpad, de code.jquery.com) 1.6.4, 1.7.2, 1.8.3, 1.9.1, 1.10.2, 1.11.3, 1.12.4, 2.2.4, 3.0.0, 3.3.1, 3.5.1, 3.7.1, 3.7.1 slim, 4.0.0, 4.0.0 slim. `tests/run-node.js` passou a aceitar `HRPJS_JQUERY`.
- [x] Linha de base: 1.7.2–4.0.0 passavam com o transporte falso, **mas** o transporte real usava `$.ajax` (inexistente nos builds slim). 1.6.4 quebra dentro do Pagination.js 2.6.0 (usa `.on/.off`, criados no 1.7) — limite que não depende da hr-paginationjs.

Mudanças:
- [x] Transporte trocado por `XMLHttpRequest` nativo (`xhrTransport`): mesmos cabeçalhos do jQuery (`X-Requested-With` só na mesma origem, `Accept` JSON), `_=` anti-cache no GET, POST urlencoded, timeout, abort, `X-Request-Id`, classificação idêntica (success/parsererror/error/timeout/abort).
- [x] Serializador próprio `HrPaginationjs.serialize()` com saída idêntica ao `jQuery.param` (teste 06 compara os dois quando `$.param` existe).
- [x] jQuery agora é usado só em `$(pager).pagination(...)`. Verificação de dependência acusa jQuery < 1.7 com mensagem clara (teste 34).
- [x] **Bug encontrado e corrigido**: `startRequest` cancelava a requisição anterior antes de incrementar a sequência; como o abort avisa de forma síncrona (o `$.ajax` também), as promises superadas eram rejeitadas com `abort` em vez de resolverem com a resposta mais recente (o que a doc prometia). Agora a sequência é incrementada antes do cancelamento (teste 32).
- [x] Demo `exemplos/index.php` e exemplo de `docs/md/acoes.md` não usam mais `jQuery.post`.
- [x] Docs atualizadas (instalação com tabela de compatibilidade, backend, busca/filtros, ações, API JS, testes) e HTML regerado.

Execução:
- [x] Suíte (35 testes) em todas as versões: 1.7.2 … 4.0.0 slim → **35/35 em cada uma**; 1.6.4 → recusado com "exige jQuery 1.7 ou superior" (esperado).
- [x] Ponta a ponta (jsdom + `php -S` + `exemplos/index.php`, jQuery trocado via ResourceLoader) com 1.7.2, 1.12.4, 2.2.4, 3.7.1, 3.7.1 slim, 4.0.0 e 4.0.0 slim: carga, paginação, ordenação, filtros, ação remota com token, 4 erros simulados, "Ir" da listagem DataTables e botão "Restaurar dados" — tudo OK, console sem erros.
- [ ] Não executado: navegadores reais com cada versão.
