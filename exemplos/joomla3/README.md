# Exemplo Joomla 3 — com_loja / clientes

Integração real com os helpers do projeto (`OrmTables`, `InputHelper`, `PermissionHelper`, `ApiResponseHelper`).
PHP 7.0 + Joomla 3, sem alterar nenhum helper.

## Onde colocar cada arquivo

| Arquivo deste exemplo | Destino no Joomla |
|---|---|
| `controllers/clientes.php` | `administrator/components/com_loja/controllers/clientes.php` |
| `views/clientes/tmpl/default.php` | `administrator/components/com_loja/views/clientes/tmpl/default.php` |
| `../../vendor/pagination-2.6.0.min.js` | `media/com_loja/js/pagination-2.6.0.min.js` |
| `../../src/hr-paginationjs.js` | `media/com_loja/js/hr-paginationjs.js` |
| `../../src/hr-paginationjs.css` | `media/com_loja/css/hr-paginationjs.css` |

Os helpers ficam onde o componente já os carrega (ex.: `administrator/components/com_loja/helpers/`).
**Não copie** `vendor/jquery-1.12.4.min.js`: no Joomla usa-se o jQuery do próprio Joomla via `JHtml::_('jquery.framework')`.

## Ordem de carregamento (validada na view)

1. `JHtml::_('jquery.framework')` → jQuery 1.12.4 do Joomla (`media/jui/js/jquery.min.js`) + noConflict.
   (A biblioteca aceita qualquer jQuery ≥ 1.7, inclusive *slim*; o jQuery só é usado pelo Pagination.js.)
2. `pagination-2.6.0.min.js` (registra `jQuery.fn.pagination`).
3. `hr-paginationjs.js` (procura as telas `[data-paginationjs]` no `DOMContentLoaded`).

Se a ordem estiver errada, a listagem mostra uma mensagem clara no lugar da tabela e no console.

## Tabela usada

```sql
CREATE TABLE IF NOT EXISTS `#__loja_clientes` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NOT NULL,
    `email` VARCHAR(190) NOT NULL,
    `uf` CHAR(2) NOT NULL,
    `cidade` VARCHAR(100) NOT NULL,
    `limite_credito` DECIMAL(12,2) NOT NULL DEFAULT 0,
    `status` VARCHAR(10) NOT NULL DEFAULT 'ativo',
    `created_at` DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_status_created` (`status`, `created_at`),
    KEY `idx_nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Decisões de segurança do exemplo

- `listar` exige `core.manage`; `alterarStatus` e `excluir` exigem token CSRF (`PermissionHelper::requireToken`) e a permissão própria.
- A ordenação recebe a **chave pública** da coluna (`criado`, `limite`…) e o controller a traduz pela lista branca `ordenaveis()`; o nome real da coluna nunca vem do navegador. Desempate estável por `id`.
- `InputHelper::pagination(20, 100)` impõe o teto de 100 registros por página no servidor.
- O `select` lista só as colunas que a tela pode ver. Ocultar uma coluna no navegador **não** é controle de acesso.
- `OrmBase::paginate()` conta com os mesmos filtros e aplica `LIMIT/OFFSET` no banco. Página além da última volta vazia; a biblioteca corrige uma única vez para a última página válida.
- Busca: `whereLike` (`%termo%`, escapado). Maiúsculas/acentos seguem a collation da coluna (`utf8mb4_unicode_ci` ignora ambos). A biblioteca não promete nada além disso.
- As datas `de`/`até` são comparadas como estão no banco. Se o banco grava em UTC e o usuário digita no fuso local, converta com `DateHelper::between()` como no exemplo da Vitrine.
