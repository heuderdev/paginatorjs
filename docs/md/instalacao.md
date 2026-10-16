# Instalação e ordem de carregamento

## Dependências

| Dependência | Versão | Observação |
|---|---|---|
| jQuery | **1.7 ou superior** — qualquer versão de 1.7 a 4.x, inclusive os builds *slim* | Use o que a página já tem e **não** carregue outra cópia. No Joomla 3: `JHtml::_('jquery.framework')` (1.12.4). |
| Pagination.js | 2.6.0 | `dist/pagination-2.6.0.min.js`. Usa template strings → navegadores modernos (não roda no IE11). |
| Bootstrap | não exigido | A biblioteca não usa modais nem classes do Bootstrap. |

Nenhum bundler, transpiler ou gerenciador de pacotes é necessário.

## Arquivos para produção (`dist/`)

Use sempre os arquivos de `dist/`, gerados por `npm run build` e versionados no repositório:

| Arquivo | Uso | Tamanho (gzip) |
|---|---|---|
| `dist/hr-paginationjs.min.js` | **produção** | 51 KiB (17,4 KiB) |
| `dist/hr-paginationjs.js` | legível, para depurar (o Joomla 3 em modo debug carrega este no lugar da `.min`) | 123 KiB |
| `dist/hr-paginationjs.min.css` | **produção** | 6,8 KiB (1,7 KiB) |
| `dist/hr-paginationjs.css` | legível | 8,4 KiB |
| `dist/pagination-2.6.0.min.js` | dependência (MIT, licença em `dist/pagination-LICENSE.txt`) | 15 KiB |

Os tamanhos exatos de cada build ficam em `dist/sizes.json`. Para levar a outro projeto, `npm run pacote` gera
`pacote/hr-paginationjs-<versão>.zip` com `js/`, `css/`, o exemplo `joomla3/` e um `LEIAME.md`.

A pasta `src/` é a fonte para desenvolvimento; a `.min.js` passa pelos mesmos testes (`npm run test:dist`).

## Compatibilidade com versões do jQuery

A biblioteca usa o jQuery **apenas** para desenhar a paginação com o Pagination.js
(`$(elemento).pagination(...)`). As requisições usam `XMLHttpRequest` nativo, então `$.ajax`, `$.param` e os
recursos removidos no jQuery 4 não são necessários, e os builds *slim* (sem AJAX) funcionam.

| jQuery | Situação | Evidência |
|---|---|---|
| 1.6.x ou anterior | **Não suportado.** O Pagination.js 2.6.0 usa `.on()`/`.off()` (criados no 1.7). A listagem mostra: `o jQuery 1.6.4 é antigo demais: o Pagination.js 2.6.0 exige jQuery 1.7 ou superior.` | testes 34 e execução com 1.6.4 |
| 1.7.2, 1.8.3, 1.9.1, 1.10.2, 1.11.3, 1.12.4 | Suportado | suíte completa |
| 2.2.4 | Suportado | suíte completa |
| 3.0.0, 3.3.1, 3.5.1, 3.7.1, 3.7.1 *slim* | Suportado | suíte completa |
| 4.0.0, 4.0.0 *slim* | Suportado | suíte completa |

Além da suíte, a página `exemplos/index.php` foi executada ponta a ponta contra o servidor PHP com 1.7.2,
1.12.4, 2.2.4, 3.7.1, 3.7.1 *slim*, 4.0.0 e 4.0.0 *slim*. Veja [testes.md](testes.md) para repetir a verificação
com outra versão.

Com `jQuery.noConflict()` (como no Joomla) tudo funciona, porque a biblioteca usa `window.jQuery`. Com
`jQuery.noConflict(true)`, que remove também `window.jQuery`, carregue o Pagination.js e o hr-paginationjs
**antes** dessa chamada.

## Ordem obrigatória

```html
<link rel="stylesheet" href="hr-paginationjs.min.css">

<script src="jquery.min.js"></script>              <!-- 1. jQuery (no Joomla: o do Joomla) -->
<script src="pagination-2.6.0.min.js"></script>    <!-- 2. Pagination.js -->
<script src="hr-paginationjs.min.js"></script>     <!-- 3. hr-paginationjs -->
```

No Joomla 3 (view):

```php
JHtml::_('jquery.framework');
JHtml::_('script', 'com_loja/pagination-2.6.0.min.js', array('relative' => true, 'version' => 'auto'));
JHtml::_('script', 'com_loja/hr-paginationjs.min.js', array('relative' => true, 'version' => 'auto'));
JHtml::_('stylesheet', 'com_loja/hr-paginationjs.min.css', array('relative' => true, 'version' => 'auto'));
```

## O que acontece se a ordem estiver errada

A biblioteca verifica as dependências **no momento de iniciar cada listagem** (sem polling):

- sem jQuery: `hr-paginationjs: jQuery não foi encontrado. Carregue nesta ordem: jQuery -> pagination.js -> hr-paginationjs.js.`
- jQuery anterior a 1.7: `hr-paginationjs: o jQuery X é antigo demais: o Pagination.js 2.6.0 exige jQuery 1.7 ou superior.`
- sem Pagination.js: `hr-paginationjs: Pagination.js não foi encontrado. Carregue nesta ordem: ...`

A mensagem aparece no lugar da listagem (`.hrpjs-fatal`, `role="alert"`) e no console. Nenhuma instância é criada.

## Inicialização automática

Ao carregar, a biblioteca procura todos os elementos `[data-paginationjs]` (no `DOMContentLoaded`, ou na hora
se o documento já estiver pronto) e cria uma instância para cada um.

| Quero… | Faça |
|---|---|
| Desligar a inicialização automática da página inteira | `<script src="hr-paginationjs.min.js" data-paginationjs-autoinit="false"></script>` |
| Que uma listagem específica não inicie sozinha | `data-paginationjs="manual"` no elemento e depois `HrPaginationjs.init('id')` |
| Iniciar listagens inseridas depois (AJAX, aba) | `HrPaginationjs.scan(container)` |
| Iniciar sem disparar a primeira requisição | `data-paginationjs-autoload="false"` e depois `HrPaginationjs.get('id').reload()` |

Chamar `init`/`scan` de novo sobre um elemento já iniciado devolve a mesma instância (sem duplicar handlers).
