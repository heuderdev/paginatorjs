# Testes

O projeto não tinha infraestrutura de testes JavaScript reutilizável; foi criado um harness mínimo, sem
dependências, que roda **o mesmo arquivo de testes** no navegador e no Node.

| Arquivo | Papel |
|---|---|
| `tests/harness.js` | `HRPJS_TEST(nome, fn)` / `HRPJS_RUN()`, asserções, isolamento (sandbox, `destroy` de tudo, limpa `localStorage` e URL entre testes). |
| `tests/hr-paginationjs.tests.js` | Os cenários, com transporte falso injetado (`transport`), que controla a ordem e o momento de cada resposta. |
| `tests/runner.html` | Executa no navegador (abra pelo Laragon: `http://localhost/paginatorjs/tests/runner.html`). |
| `tests/run-node.js` | Executa no Node com jsdom. |

## Rodar no Node

O jsdom **não** é dependência do projeto. Instale numa pasta temporária fora do repositório:

```bash
npm install --prefix C:\temp\hrpjs-jsdom jsdom@24
set HRPJS_JSDOM=C:\temp\hrpjs-jsdom\node_modules\jsdom      # PowerShell: $env:HRPJS_JSDOM = '...'
node tests/run-node.js
```

Saída: a versão do jQuery usada, uma linha por teste e o total. Código de saída `1` se algum falhar.

### Testar com outra versão do jQuery

Por padrão é usado `vendor/jquery-1.12.4.min.js`. Para outra versão, aponte `HRPJS_JQUERY` para o arquivo
(baixe numa pasta fora do projeto, ex.: `https://code.jquery.com/jquery-3.7.1.slim.min.js`):

```bash
set HRPJS_JQUERY=C:\temp\jquery-versions\jquery-3.7.1.slim.min.js   # PowerShell: $env:HRPJS_JQUERY = '...'
node tests/run-node.js
```

Matriz executada em 2026-10-16 (35 testes cada):

| jQuery | Resultado |
|---|---|
| 1.6.4 | Recusado com a mensagem “exige jQuery 1.7 ou superior” (esperado: o Pagination.js 2.6.0 não funciona com ele) |
| 1.7.2, 1.8.3, 1.9.1, 1.10.2, 1.11.3, 1.12.4 | 35/35 |
| 2.2.4 | 35/35 |
| 3.0.0, 3.3.1, 3.5.1, 3.7.1, 3.7.1 *slim* | 35/35 |
| 4.0.0, 4.0.0 *slim* | 35/35 |

## Cenários cobertos

| # | Cenário |
|---|---|
| 01 | Primeira carga: uma requisição, parâmetros, linhas, resumo, página atual |
| 02 | Troca de página: exatamente uma requisição (o Pagination.js não requisita) |
| 03 | Quantidade por página volta para a página 1 |
| 04 | Busca com debounce (várias teclas → uma requisição) |
| 04b | Composição de texto (IME) e Enter imediato |
| 05 | Limpar busca e botão limpar |
| 06 | Combinação de filtros tipados e serialização `uf[]=` |
| 07 | Ordenação por key, `aria-sort`, coluna não ordenável recusada |
| 08 | Total zero, `colspan`, paginação oculta |
| 09 | Última página incompleta |
| 10 | Página além do limite: uma correção, sem loop |
| 11 | Respostas fora de ordem: a mais recente prevalece |
| 12 | Cancelamento da anterior não vira erro |
| 13 | HTTP de erro, `request_id`, tentar novamente |
| 14 | HTTP 200 com `success: false` |
| 15 | Resposta não JSON e JSON fora do contrato não viram lista vazia |
| 16 | Sessão expirada (401) e permissão (403) |
| 17 | Ocultar/reexibir coluna sem requisição, mantida na troca de página |
| 18 | Coluna obrigatória e mínimo de uma coluna de dados |
| 19 | Preferência corrompida |
| 20 | Mudança do esquema de colunas |
| 21 | Duas instâncias isoladas + controle externo `data-paginationjs-for` |
| 22 | Destruição completa e reinicialização sem duplicar handlers |
| 23 | Conteúdo malicioso em células e templates |
| 24 | Navegação por teclado e foco preservado |
| 25 | Ausência de jQuery ou Pagination.js |
| 26 | Adaptador DataTables |
| 27 | Estado na URL com prefixo e parâmetros alheios |
| 28 | Ação remota com token CSRF e recarga |
| 29 | Cache e `reload()` ignorando o cache |
| 30 | Templates com condição e formatadores |
| 31 | `pagination('go', n)` externo desviado; `next`/`refresh` sem requisição paralela |
| 32 | Transporte nativo (`XMLHttpRequest` falso): URL, cabeçalhos, JSON, HTML no lugar de JSON, timeout, abort real e promessa superada resolvendo com a resposta mais recente |
| 33 | Ação remota pelo transporte nativo: POST urlencoded com token |
| 34 | jQuery anterior a 1.7 gera mensagem clara |

## Limites

- jsdom não calcula layout nem foco visual: “foco visível” e responsividade foram conferidos só por CSS.
- Leitores de tela reais não foram testados; os testes verificam os atributos ARIA.
- O controller Joomla (`exemplos/joomla3`) foi verificado com `php -l` e revisado contra o código dos helpers,
  mas não executado num Joomla 3 (não há instalação com o componente `com_loja` neste ambiente).
- As APIs de demonstração (`exemplos/api.php`, `api-datatables.php`) e a página `exemplos/index.php` foram
  exercitadas ponta a ponta (jsdom + servidor `php -S`, transporte nativo) com jQuery 1.7.2, 1.12.4, 2.2.4,
  3.7.1, 3.7.1 *slim*, 4.0.0 e 4.0.0 *slim*.
