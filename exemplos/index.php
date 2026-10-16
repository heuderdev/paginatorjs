<?php
require __DIR__ . '/dados.php';
$token = demo_token();
?>
<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="<?php echo htmlspecialchars($token, ENT_QUOTES, 'UTF-8'); ?>">
    <title>hr-paginationjs — exemplo realista</title>
    <link rel="stylesheet" href="../src/hr-paginationjs.css">
    <style>
        body { font: 15px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; margin: 0; background: #f8f9fb; color: #1d2939; }
        main { max-width: 1180px; margin: 0 auto; padding: 24px 16px 64px; }
        h1 { font-size: 1.6rem; margin: 0 0 4px; }
        h2 { font-size: 1.2rem; margin: 40px 0 8px; }
        p.lead { color: #475467; margin: 0 0 24px; }
        .card { background: #fff; border: 1px solid #eaecf0; border-radius: 10px; padding: 16px; }
        .filtros { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; align-items: end; margin-bottom: 12px; }
        .filtros label, .filtros fieldset { display: flex; flex-direction: column; gap: 4px; font-size: .875rem; color: #475467; }
        .filtros fieldset { border: 0; margin: 0; padding: 0; }
        .filtros fieldset div { display: flex; gap: 10px; flex-wrap: wrap; color: #1d2939; }
        .filtros fieldset label { flex-direction: row; align-items: center; }
        .filtros input:not([type=checkbox]), .filtros select { min-height: 36px; padding: 6px 10px; border: 1px solid #d0d5dd; border-radius: 6px; font: inherit; background: #fff; }
        .barra { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .barra .acoes { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .btn { min-height: 36px; padding: 6px 12px; border: 1px solid #d0d5dd; border-radius: 6px; background: #fff; font: inherit; cursor: pointer; }
        .tabela-wrap { overflow-x: auto; }
        table.lista { width: 100%; border-collapse: collapse; }
        table.lista th, table.lista td { padding: 10px 12px; border-bottom: 1px solid #eaecf0; text-align: left; vertical-align: middle; }
        table.lista thead th { background: #f2f4f7; font-size: .8125rem; text-transform: uppercase; letter-spacing: .02em; color: #475467; }
        table.lista td.hrpjs-align-right, table.lista th.hrpjs-align-right { text-align: right; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: .8125rem; font-weight: 600; }
        .badge-ativo { background: #ecfdf3; color: #067647; }
        .badge-inativo { background: #f2f4f7; color: #475467; }
        .linha-acoes { display: flex; gap: 6px; flex-wrap: wrap; }
        .linha-acoes button { padding: 4px 8px; border: 1px solid #d0d5dd; border-radius: 6px; background: #fff; font: inherit; font-size: .8125rem; cursor: pointer; }
        .linha-acoes .perigo { color: #b42318; border-color: #fda29b; }
        #log { font: 12px/1.4 ui-monospace, monospace; background: #101828; color: #d0d5dd; padding: 12px; border-radius: 8px; max-height: 180px; overflow: auto; margin: 0; }
    </style>
</head>
<body>
<main>
    <h1>Clientes</h1>
    <p class="lead">Listagem remota declarativa: busca, filtros tipados, ordenação, colunas, preferências, estado na URL e ações por linha — sem JavaScript específico da tela.</p>

    <div class="card">
        <div id="clientes"
             data-paginationjs
             data-paginationjs-remote="api.php"
             data-paginationjs-limit="20"
             data-paginationjs-limits="10,20,50,100"
             data-paginationjs-sort="criado"
             data-paginationjs-direction="desc"
             data-paginationjs-persist="columns,limit,sort"
             data-paginationjs-namespace="demo"
             data-paginationjs-version="1"
             data-paginationjs-url
             data-paginationjs-url-prefix="cli_"
             data-paginationjs-url-history="push"
             data-paginationjs-text-empty="Nenhum cliente encontrado com esses filtros.">

            <form class="filtros" data-paginationjs-filters>
                <label>Buscar por nome ou e-mail
                    <input type="search" data-paginationjs-search autocomplete="off">
                </label>
                <label>Status
                    <select name="status">
                        <option value="">Todos</option>
                        <option value="ativo">Ativos</option>
                        <option value="inativo">Inativos</option>
                    </select>
                </label>
                <fieldset>
                    <legend>Estados</legend>
                    <div>
                        <label><input type="checkbox" name="uf[]" value="SP"> SP</label>
                        <label><input type="checkbox" name="uf[]" value="RJ"> RJ</label>
                        <label><input type="checkbox" name="uf[]" value="MG"> MG</label>
                        <label><input type="checkbox" name="uf[]" value="PR"> PR</label>
                    </div>
                </fieldset>
                <label>Limite mínimo (R$)
                    <input name="limite_min" inputmode="decimal" data-paginationjs-type="number">
                </label>
                <label>Cadastro de
                    <input type="date" name="de">
                </label>
                <label>até
                    <input type="date" name="ate">
                </label>
                <label>Simular (só demo)
                    <select name="simular">
                        <option value="">Normal</option>
                        <option value="lento">Resposta lenta (1,5 s)</option>
                        <option value="erro">HTTP 500</option>
                        <option value="falha">HTTP 200 com success false</option>
                        <option value="sessao">Sessão expirada (401)</option>
                        <option value="invalida">Resposta não JSON</option>
                    </select>
                </label>
            </form>

            <div class="barra">
                <div class="acoes">
                    <button type="button" class="btn" data-paginationjs-clear>Limpar filtros</button>
                    <button type="button" class="btn" data-paginationjs-reload>Atualizar</button>
                </div>
                <div class="acoes">
                    <label>Por página <select data-paginationjs-page-size></select></label>
                    <div data-paginationjs-columns></div>
                </div>
            </div>

            <div class="tabela-wrap">
                <table class="lista">
                    <thead>
                        <tr>
                            <th data-paginationjs-key="id" data-paginationjs-sortable data-paginationjs-required data-paginationjs-width="70px">ID</th>
                            <th data-paginationjs-key="nome" data-paginationjs-sortable data-paginationjs-required>Nome</th>
                            <th data-paginationjs-key="email" data-paginationjs-sortable data-paginationjs-format="email">E-mail</th>
                            <th data-paginationjs-key="cidade" data-paginationjs-sortable data-paginationjs-template="tpl-cidade">Cidade</th>
                            <th data-paginationjs-key="limite" data-paginationjs-field="limite_credito" data-paginationjs-sortable data-paginationjs-sort-first="desc" data-paginationjs-format="money" data-paginationjs-align="right">Limite</th>
                            <th data-paginationjs-key="site" data-paginationjs-format="link" data-paginationjs-link-text="Abrir site" data-paginationjs-link-target="_blank" data-paginationjs-default="—" data-paginationjs-hidden>Site</th>
                            <th data-paginationjs-key="status" data-paginationjs-sortable data-paginationjs-template="tpl-status">Status</th>
                            <th data-paginationjs-key="criado" data-paginationjs-field="created_at" data-paginationjs-sortable data-paginationjs-sort-first="desc" data-paginationjs-format="datetime">Cadastro</th>
                            <th data-paginationjs-key="acoes" data-paginationjs-actions data-paginationjs-template="tpl-acoes">Ações</th>
                        </tr>
                    </thead>
                </table>
            </div>
        </div>
    </div>

    <template id="tpl-cidade">{cidade}/{uf}</template>
    <template id="tpl-status"><span class="badge badge-{status}">{status}</span></template>
    <template id="tpl-acoes">
        <div class="linha-acoes">
            <button type="button" data-paginationjs-action="editar" aria-label="Editar {nome}">Editar</button>
            <button type="button" data-paginationjs-if="status=ativo"
                    data-paginationjs-action="desativar"
                    data-paginationjs-action-remote="api.php?task=status"
                    data-paginationjs-param-status="inativo"
                    aria-label="Desativar {nome}">Desativar</button>
            <button type="button" data-paginationjs-if="status=inativo"
                    data-paginationjs-action="ativar"
                    data-paginationjs-action-remote="api.php?task=status"
                    data-paginationjs-param-status="ativo"
                    aria-label="Ativar {nome}">Ativar</button>
            <button type="button" class="perigo"
                    data-paginationjs-action="excluir"
                    data-paginationjs-action-remote="api.php?task=excluir"
                    data-paginationjs-action-confirm="Excluir o cliente {nome}?"
                    aria-label="Excluir {nome}">Excluir</button>
        </div>
    </template>

    <h2>Segunda listagem na mesma página (API legada DataTables)</h2>
    <p class="lead">Instância independente, adaptador <code>datatables</code> e busca externa ligada por <code>data-paginationjs-for</code>.</p>

    <div class="card">
        <p>
            <label>Buscar na lista legada
                <input type="search" data-paginationjs-for="legado" data-paginationjs-search>
            </label>
        </p>
        <div id="legado"
             data-paginationjs
             data-paginationjs-remote="api-datatables.php"
             data-paginationjs-adapter="datatables"
             data-paginationjs-limit="5"
             data-paginationjs-limits="5,10,25"
             data-paginationjs-sort="id"
             data-paginationjs-options='{"showGoInput": true, "showGoButton": true, "goButtonText": "Ir"}'>
            <div class="tabela-wrap">
                <table class="lista">
                    <thead>
                        <tr>
                            <th data-paginationjs-key="id" data-paginationjs-sortable>ID</th>
                            <th data-paginationjs-key="nome" data-paginationjs-sortable>Nome</th>
                            <th data-paginationjs-key="uf">UF</th>
                        </tr>
                    </thead>
                </table>
            </div>
        </div>
    </div>

    <h2>Eventos (opcional)</h2>
    <p class="lead">A tela não precisa de JavaScript. Este log só mostra os eventos <code>hrpaginationjs:*</code> disponíveis para integração.</p>
    <pre id="log" aria-label="Log de eventos"></pre>
    <p><button type="button" class="btn" id="reiniciar">Restaurar dados da demonstração</button></p>
</main>

<script src="../vendor/jquery-1.12.4.min.js"></script>
<script src="../vendor/pagination-2.6.0.min.js"></script>
<script src="../src/hr-paginationjs.js"></script>
<script>
    (function () {
        var log = document.getElementById('log');

        ['load', 'error', 'action', 'actiondone', 'actionerror', 'columnschange'].forEach(function (name) {
            document.addEventListener('hrpaginationjs:' + name, function (event) {
                var d = event.detail;
                var info = name === 'load' ? 'total=' + d.total + ' página=' + d.state.page
                    : name === 'error' ? d.error.kind + ': ' + d.error.message
                    : name === 'columnschange' ? d.visible.join(', ')
                    : d.action + ' #' + d.key;

                log.textContent = '[' + d.id + '] ' + name + ' → ' + info + '\n' + log.textContent;
            });
        });

        document.addEventListener('hrpaginationjs:action', function (event) {
            if (event.detail.action === 'editar') {
                alert('Abrir o formulário de edição do cliente #' + event.detail.key);
            }
        });

        document.getElementById('reiniciar').addEventListener('click', function () {
            var xhr = new XMLHttpRequest();

            xhr.open('POST', 'api.php?task=reiniciar');
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.onloadend = function () {
                HrPaginationjs.get('clientes').reload();
            };
            xhr.send(encodeURIComponent(HrPaginationjs.findToken()) + '=1');
        });
    })();
</script>
</body>
</html>
