(function (window) {
    'use strict';

    var test = window.HRPJS_TEST;
    var document = window.document;

    function tick(ms) {
        return new Promise(function (resolve) {
            window.setTimeout(resolve, ms || 0);
        });
    }

    function server() {
        var s = { calls: [] };

        s.transport = function (request, done) {
            var call = { request: request, params: request.data, done: done, aborted: false, settled: false };

            s.calls.push(call);

            return function () {
                if (!call.settled) {
                    call.aborted = true;
                    call.settled = true;
                    done({ status: 0, textStatus: 'abort' });
                }
            };
        };

        s.last = function () {
            return s.calls[s.calls.length - 1];
        };

        s.reply = function (call, body, status) {
            call.settled = true;
            call.done({ status: status || 200, textStatus: 'success', body: body, requestId: '' });
        };

        s.fail = function (call, status, textStatus, body) {
            call.settled = true;
            call.done({ status: status, textStatus: textStatus, body: body, requestId: '' });
        };

        s.replyPage = function (call, total, rowsFactory) {
            var page = call.params.page;
            var limit = call.params.limit;
            var rows = (rowsFactory || makeRows)(page, limit, total);

            s.reply(call, envelope(rows, total, page, limit));
        };

        return s;
    }

    function makeRows(page, limit, total) {
        var rows = [];
        var start = (page - 1) * limit;

        for (var i = start; i < Math.min(start + limit, total); i++) {
            rows.push({ id: i + 1, nome: 'Cliente ' + (i + 1), email: 'c' + (i + 1) + '@ex.com', url: 'https://ex.com/' + (i + 1) });
        }

        return rows;
    }

    function envelope(rows, total, page, limit) {
        return {
            success: true,
            status: 'sucesso',
            mensagem: 'Registros carregados.',
            data: rows,
            errors: [],
            request_id: 'req-' + page,
            meta: {
                paginacao: {
                    total: total,
                    por_pagina: limit,
                    pagina_atual: page,
                    total_paginas: Math.ceil(total / limit)
                }
            }
        };
    }

    var FIXTURE = '' +
        '<div id="lista" data-paginationjs data-paginationjs-remote="/api.php" data-paginationjs-limit="10" data-paginationjs-limits="10,20,50" data-paginationjs-debounce="30">' +
        '  <form data-paginationjs-filters>' +
        '    <label>Buscar <input type="search" data-paginationjs-search></label>' +
        '    <label>Status <select name="status"><option value="">Todos</option><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select></label>' +
        '    <label><input type="checkbox" name="uf[]" value="SP"> SP</label>' +
        '    <label><input type="checkbox" name="uf[]" value="RJ"> RJ</label>' +
        '    <label>Mínimo <input name="min" data-paginationjs-type="number"></label>' +
        '    <button type="button" data-paginationjs-clear>Limpar</button>' +
        '  </form>' +
        '  <label>Por página <select data-paginationjs-page-size></select></label>' +
        '  <div data-paginationjs-columns></div>' +
        '  <table><thead><tr>' +
        '    <th data-paginationjs-key="id" data-paginationjs-sortable data-paginationjs-required>ID</th>' +
        '    <th data-paginationjs-key="nome" data-paginationjs-sortable>Nome</th>' +
        '    <th data-paginationjs-key="email" data-paginationjs-hidden>E-mail</th>' +
        '    <th data-paginationjs-key="acoes" data-paginationjs-actions data-paginationjs-template="tpl-acoes">Ações</th>' +
        '  </tr></thead></table>' +
        '</div>' +
        '<template id="tpl-acoes"><a href="{url}" data-paginationjs-action="ver">Ver {nome}</a></template>';

    function mount(sandbox, html) {
        sandbox.innerHTML = html || FIXTURE;

        return sandbox.querySelector('[data-paginationjs]');
    }

    function start(sandbox, options, html) {
        var s = server();
        var root = mount(sandbox, html);
        var instance = window.HrPaginationjs.init(root, Object.assign({ transport: s.transport }, options || {}));

        return { s: s, root: root, instance: instance };
    }

    function loaded(sandbox, options, html, total) {
        var ctx = start(sandbox, options, html);

        ctx.s.replyPage(ctx.s.calls[0], total === undefined ? 35 : total);

        return tick().then(function () {
            return ctx;
        });
    }

    function bodyRows(root) {
        return root.querySelectorAll('tbody tr:not(.hrpjs-message-row)');
    }

    function firstCell(root, key) {
        return root.querySelector('tbody tr td[data-paginationjs-cell="' + key + '"]');
    }

    function pagerLink(root, page) {
        return root.querySelector('.hrpjs-pager li[data-num="' + page + '"] a');
    }

    function fire(node, type) {
        node.dispatchEvent(new window.Event(type, { bubbles: true }));
    }

    function key(node, name) {
        node.dispatchEvent(new window.KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
    }

    test('01 primeira carga faz uma requisição e renderiza a página', function (assert, sandbox) {
        return loaded(sandbox).then(function (ctx) {
            assert.equal(ctx.s.calls.length, 1, 'quantidade de requisições');
            assert.deepEqual(ctx.s.calls[0].params, { page: 1, limit: 10 }, 'parâmetros iniciais');
            assert.equal(bodyRows(ctx.root).length, 10, 'linhas renderizadas');
            assert.equal(ctx.root.querySelector('[data-paginationjs-summary]').textContent, 'Exibindo 1 a 10 de 35 registros');
            assert.equal(ctx.root.querySelector('.hrpjs-pager a[aria-current="page"]').textContent, '1');
            assert.equal(ctx.instance.getState().total, 35);
            assert.equal(ctx.root.getAttribute('aria-busy'), null, 'aria-busy removido');
        });
    });

    test('02 troca de página gera exatamente uma requisição', function (assert, sandbox) {
        return loaded(sandbox).then(function (ctx) {
            pagerLink(ctx.root, 2).click();
            assert.equal(ctx.s.calls.length, 2, 'uma requisição nova');
            assert.equal(ctx.s.last().params.page, 2);
            assert.equal(ctx.root.getAttribute('aria-busy'), 'true', 'aria-busy durante o carregamento');
            ctx.s.replyPage(ctx.s.last(), 35);

            return tick().then(function () {
                assert.equal(firstCell(ctx.root, 'id').textContent, '11');
                assert.equal(ctx.s.calls.length, 2, 'Pagination.js não disparou requisição própria');
                assert.equal(ctx.root.querySelector('.hrpjs-pager a[aria-current="page"]').textContent, '2');
            });
        });
    });

    test('03 quantidade por página volta para a página 1', function (assert, sandbox) {
        return loaded(sandbox).then(function (ctx) {
            var p = ctx.instance.setPage(3);

            ctx.s.replyPage(ctx.s.last(), 35);

            return p.then(function () {
                var select = ctx.root.querySelector('[data-paginationjs-page-size]');

                assert.equal(select.options.length, 3, 'opções geradas a partir de data-paginationjs-limits');
                select.value = '20';
                fire(select, 'change');
                assert.deepEqual(ctx.s.last().params, { page: 1, limit: 20 });
                ctx.s.replyPage(ctx.s.last(), 35);

                return tick();
            }).then(function () {
                assert.equal(bodyRows(ctx.root).length, 20);
                assert.equal(ctx.instance.getState().page, 1);
            });
        });
    });

    test('04 busca com debounce envia uma única requisição', function (assert, sandbox) {
        return loaded(sandbox).then(function (ctx) {
            var input = ctx.root.querySelector('[data-paginationjs-search]');

            ['a', 'an', 'ana'].forEach(function (value) {
                input.value = value;
                fire(input, 'input');
            });

            assert.equal(ctx.s.calls.length, 1, 'nenhuma requisição antes do debounce');

            return tick(60).then(function () {
                assert.equal(ctx.s.calls.length, 2, 'uma requisição após o debounce');
                assert.deepEqual(ctx.s.last().params, { page: 1, limit: 10, search: 'ana' });
            });
        });
    });

    test('04b busca respeita composição de texto (IME) e Enter imediato', function (assert, sandbox) {
        return loaded(sandbox).then(function (ctx) {
            var input = ctx.root.querySelector('[data-paginationjs-search]');

            fire(input, 'compositionstart');
            input.value = 'jo';
            fire(input, 'input');

            return tick(60).then(function () {
                assert.equal(ctx.s.calls.length, 1, 'sem requisição durante a composição');
                fire(input, 'compositionend');
                key(input, 'Enter');
                assert.equal(ctx.s.calls.length, 2, 'Enter dispara na hora');
                assert.equal(ctx.s.last().params.search, 'jo');

                return tick(60);
            }).then(function () {
                assert.equal(ctx.s.calls.length, 2, 'debounce pendente foi cancelado pelo Enter');
            });
        });
    });

    test('05 limpar a busca remove o parâmetro e o botão limpar zera tudo', function (assert, sandbox) {
        return loaded(sandbox).then(function (ctx) {
            var p = ctx.instance.setSearch('maria');

            ctx.s.replyPage(ctx.s.last(), 3);

            return p.then(function () {
                var input = ctx.root.querySelector('[data-paginationjs-search]');

                assert.equal(input.value, 'maria', 'campo sincronizado com o estado');
                input.value = '';
                fire(input, 'input');

                return tick(60);
            }).then(function () {
                assert.deepEqual(ctx.s.last().params, { page: 1, limit: 10 }, 'termo vazio não envia search');
                ctx.s.replyPage(ctx.s.last(), 35);

                return tick();
            }).then(function () {
                var p2 = ctx.instance.setFilters({ status: 'ativo' });

                ctx.s.replyPage(ctx.s.last(), 10);

                return p2;
            }).then(function () {
                var before = ctx.s.calls.length;

                ctx.root.querySelector('[data-paginationjs-clear]').click();
                assert.equal(ctx.s.calls.length, before + 1, 'limpar gera uma requisição');
                assert.deepEqual(ctx.s.last().params, { page: 1, limit: 10 });
                assert.equal(ctx.root.querySelector('select[name="status"]').value, '', 'select limpo');
            });
        });
    });

    test('06 combinação de filtros tipados', function (assert, sandbox) {
        return loaded(sandbox).then(function (ctx) {
            var status = ctx.root.querySelector('select[name="status"]');
            var boxes = ctx.root.querySelectorAll('input[name="uf[]"]');
            var min = ctx.root.querySelector('input[name="min"]');

            status.value = 'ativo';
            fire(status, 'change');
            boxes[0].checked = true;
            fire(boxes[0], 'change');
            boxes[1].checked = true;
            fire(boxes[1], 'change');
            min.value = '10,5';
            fire(min, 'change');

            var params = ctx.s.last().params;

            assert.deepEqual(params, { status: 'ativo', uf: ['SP', 'RJ'], min: 10.5, page: 1, limit: 10 });
            assert.equal(window.HrPaginationjs.serialize(params), 'status=ativo&uf%5B%5D=SP&uf%5B%5D=RJ&min=10.5&page=1&limit=10', 'serialização no formato do PHP');

            if (typeof window.jQuery.param === 'function') {
                assert.equal(window.HrPaginationjs.serialize(params), window.jQuery.param(params), 'idêntica ao jQuery.param');
            }
            assert.ok(ctx.s.calls[1].aborted && ctx.s.calls[2].aborted && ctx.s.calls[3].aborted, 'requisições anteriores canceladas');
        });
    });

    test('07 ordenação por chave estável com aria-sort', function (assert, sandbox) {
        return loaded(sandbox).then(function (ctx) {
            var th = ctx.root.querySelector('th[data-paginationjs-key="nome"]');
            var button = th.querySelector('button.hrpjs-sort');

            assert.ok(button, 'cabeçalho ordenável vira botão');
            button.click();
            assert.deepEqual(ctx.s.last().params, { page: 1, limit: 10, sort: 'nome', direction: 'asc' });
            ctx.s.replyPage(ctx.s.last(), 35);

            return tick().then(function () {
                assert.equal(th.getAttribute('aria-sort'), 'ascending');
                assert.equal(th.querySelector('.hrpjs-sort-icon').textContent, '▲');
                button.click();
                assert.equal(ctx.s.last().params.direction, 'desc');
                ctx.s.replyPage(ctx.s.last(), 35);

                return tick();
            }).then(function () {
                assert.equal(th.getAttribute('aria-sort'), 'descending');

                return ctx.instance.setSort('email').then(function () {
                    throw new Error('não deveria aceitar coluna não ordenável');
                }, function (error) {
                    assert.equal(error.kind, 'config');
                });
            });
        });
    });

    test('08 total zero mostra estado vazio com colspan correto', function (assert, sandbox) {
        return loaded(sandbox, null, null, 0).then(function (ctx) {
            var cell = ctx.root.querySelector('.hrpjs-message-row td');

            assert.ok(ctx.root.querySelector('.hrpjs-message--empty'), 'mensagem de vazio');
            assert.equal(cell.colSpan, 3, 'colspan = colunas visíveis (email oculto)');
            assert.ok(ctx.root.querySelector('.hrpjs-pager').hidden, 'paginação oculta');
            assert.equal(ctx.root.querySelector('[data-paginationjs-summary]').textContent, 'Nenhum registro');
        });
    });

    test('09 última página incompleta', function (assert, sandbox) {
        return loaded(sandbox, null, null, 25).then(function (ctx) {
            var p = ctx.instance.setPage(3);

            ctx.s.replyPage(ctx.s.last(), 25);

            return p.then(function (state) {
                assert.equal(bodyRows(ctx.root).length, 5);
                assert.equal(state.page, 3);
                assert.equal(ctx.root.querySelector('[data-paginationjs-summary]').textContent, 'Exibindo 21 a 25 de 25 registros');
                assert.ok(ctx.root.querySelector('.hrpjs-pager .paginationjs-next a[aria-disabled="true"]'), 'próxima desabilitada');
            });
        });
    });

    test('10 página além do limite corrige uma única vez', function (assert, sandbox) {
        return loaded(sandbox, null, null, 25).then(function (ctx) {
            var p = ctx.instance.setPage(9);

            ctx.s.reply(ctx.s.last(), envelope([], 25, 9, 10));
            assert.equal(ctx.s.calls.length, 3, 'uma requisição de correção');
            assert.equal(ctx.s.last().params.page, 3, 'corrige para a última página');
            ctx.s.reply(ctx.s.last(), envelope([], 25, 3, 10));

            return p.then(function (state) {
                assert.equal(ctx.s.calls.length, 3, 'sem loop de correção');
                assert.equal(state.page, 3);
            });
        });
    });

    test('11 respostas fora de ordem: a mais recente prevalece', function (assert, sandbox) {
        return loaded(sandbox).then(function (ctx) {
            var original = ctx.s.transport;
            var calls = [];
            var s2 = server();

            s2.transport = function (request, done) {
                calls.push({ params: request.data, done: done });

                return function () {};
            };

            ctx.instance.destroy();

            var root = mount(sandbox);
            var instance = window.HrPaginationjs.init(root, { transport: s2.transport });

            calls[0].done({ status: 200, textStatus: 'success', body: envelope(makeRows(1, 10, 35), 35, 1, 10) });

            return tick().then(function () {
                var p2 = instance.setPage(2);
                var p3 = instance.setPage(3);

                calls[2].done({ status: 200, textStatus: 'success', body: envelope(makeRows(3, 10, 35), 35, 3, 10) });
                calls[1].done({ status: 200, textStatus: 'success', body: envelope(makeRows(2, 10, 35), 35, 2, 10) });

                return Promise.all([p2, p3]);
            }).then(function () {
                assert.equal(firstCell(root, 'id').textContent, '21', 'renderizou a página 3');
                assert.equal(instance.getState().page, 3);
                assert.ok(original, 'servidor original existia');
            });
        });
    });

    test('12 cancelamento da requisição anterior', function (assert, sandbox) {
        return loaded(sandbox).then(function (ctx) {
            ctx.instance.setPage(2);

            var first = ctx.s.last();

            ctx.instance.setPage(3);
            assert.ok(first.aborted, 'anterior abortada');
            assert.equal(ctx.root.querySelector('.hrpjs-message--error'), null, 'cancelamento não vira erro');
        });
    });

    test('13 HTTP de erro mostra mensagem, código e nova tentativa', function (assert, sandbox) {
        var errors = [];

        return loaded(sandbox).then(function (ctx) {
            ctx.root.addEventListener('hrpaginationjs:error', function (e) {
                errors.push(e.detail.error);
            });

            var p = ctx.instance.setPage(2);

            ctx.s.fail(ctx.s.last(), 500, 'error', { success: false, status: 'erro', mensagem: 'Ocorreu um erro interno ao processar a solicitação.', data: null, errors: [], request_id: 'abc123' });

            return p.then(function () {
                throw new Error('deveria rejeitar');
            }, function (error) {
                assert.equal(error.kind, 'http');
                assert.equal(error.status, 500);
                assert.equal(errors.length, 1, 'evento de erro');
                assert.ok(ctx.root.querySelector('.hrpjs-message--error').textContent.indexOf('abc123') !== -1, 'request_id exibido');

                var before = ctx.s.calls.length;

                ctx.root.querySelector('[data-paginationjs-retry]').click();
                assert.equal(ctx.s.calls.length, before + 1, 'tentar novamente requisita');
                assert.equal(ctx.s.last().params.page, 2, 'mantém a página');
            });
        });
    });

    test('14 HTTP 200 com success false é erro funcional', function (assert, sandbox) {
        return loaded(sandbox).then(function (ctx) {
            var p = ctx.instance.setFilter('status', 'xx');

            ctx.s.reply(ctx.s.last(), { success: false, status: 'erro', mensagem: 'Filtro inválido.', data: null, errors: { status: ['Valor inválido.'] }, request_id: 'r9' });

            return p.then(function () {
                throw new Error('deveria rejeitar');
            }, function (error) {
                assert.equal(error.kind, 'api');
                assert.equal(error.message, 'Filtro inválido.');
                assert.deepEqual(error.errors, { status: ['Valor inválido.'] });
                assert.equal(bodyRows(ctx.root).length, 0, 'linhas antigas removidas');
            });
        });
    });

    test('15 resposta inválida não vira lista vazia', function (assert, sandbox) {
        return loaded(sandbox).then(function (ctx) {
            var p = ctx.instance.setPage(2);

            ctx.s.fail(ctx.s.last(), 200, 'parsererror');

            return p.then(function () {
                throw new Error('deveria rejeitar');
            }, function (error) {
                assert.equal(error.kind, 'invalid');

                var p2 = ctx.instance.setPage(2);

                ctx.s.reply(ctx.s.last(), { success: true, data: [] });

                return p2;
            }).then(function () {
                throw new Error('envelope sem meta deveria rejeitar');
            }, function (error) {
                assert.equal(error.kind, 'invalid');
                assert.equal(ctx.root.querySelector('.hrpjs-message--empty'), null, 'não exibiu estado vazio');
            });
        });
    });

    test('16 sessão expirada (401) e permissão (403)', function (assert, sandbox) {
        return loaded(sandbox).then(function (ctx) {
            var p = ctx.instance.reload();

            ctx.s.fail(ctx.s.last(), 401, 'error', { success: false, status: 'erro', mensagem: 'Usuário não autenticado.', data: null, errors: [], request_id: 'x' });

            return p.then(null, function (error) {
                assert.equal(error.kind, 'session');
                assert.equal(error.message, 'Usuário não autenticado.');

                var p2 = ctx.instance.reload();

                ctx.s.fail(ctx.s.last(), 403, 'error', undefined);

                return p2;
            }).then(null, function (error) {
                assert.equal(error.kind, 'permission');
            });
        });
    });

    test('17 ocultar e reexibir coluna sem requisição', function (assert, sandbox) {
        return loaded(sandbox).then(function (ctx) {
            var calls = ctx.s.calls.length;
            var th = ctx.root.querySelector('th[data-paginationjs-key="nome"]');

            assert.ok(ctx.instance.hideColumn('nome'));
            assert.equal(ctx.s.calls.length, calls, 'sem requisição');
            assert.ok(th.hidden, 'cabeçalho oculto');
            assert.ok(firstCell(ctx.root, 'nome').hidden, 'célula oculta');

            var p = ctx.instance.setPage(2);

            ctx.s.replyPage(ctx.s.last(), 35);

            return p.then(function () {
                assert.ok(firstCell(ctx.root, 'nome').hidden, 'continua oculta na nova página');

                var box = ctx.root.querySelector('input[data-paginationjs-column-toggle="nome"]');

                assert.equal(box.checked, false, 'seletor sincronizado');
                box.checked = true;
                fire(box, 'change');
                assert.equal(th.hidden, false);
                assert.equal(firstCell(ctx.root, 'nome').hidden, false);
                assert.ok(ctx.instance.showColumn('email'));
                assert.deepEqual(ctx.instance.getState().columns, ['id', 'nome', 'email', 'acoes']);
            });
        });
    });

    test('18 coluna obrigatória e mínimo de uma coluna de dados', function (assert, sandbox) {
        return loaded(sandbox).then(function (ctx) {
            assert.equal(ctx.instance.hideColumn('id'), false, 'obrigatória não oculta');
            assert.ok(ctx.root.querySelector('input[data-paginationjs-column-toggle="id"]').disabled);

            ctx.instance.destroy();

            var html = '<div id="l2" data-paginationjs data-paginationjs-remote="/x"><div data-paginationjs-columns></div><table><thead><tr>' +
                '<th data-paginationjs-key="a">A</th><th data-paginationjs-key="b">B</th><th data-paginationjs-key="acoes" data-paginationjs-actions>Ações</th>' +
                '</tr></thead></table></div>';
            var c2 = start(sandbox, null, html);

            c2.s.reply(c2.s.calls[0], envelope([{ a: 1, b: 2 }], 1, 1, 20));

            return tick().then(function () {
                assert.ok(c2.instance.hideColumn('a'));
                assert.equal(c2.instance.hideColumn('b'), false, 'última coluna de dados não oculta');
                assert.ok(c2.instance.hideColumn('acoes'), 'coluna de ações pode ser ocultada');
                assert.ok(c2.root.querySelector('input[data-paginationjs-column-toggle="b"]').disabled, 'checkbox bloqueado');
                c2.instance.resetColumns();
                assert.deepEqual(c2.instance.getState().columns, ['a', 'b', 'acoes'], 'restaurar padrão');
            });
        });
    });

    test('19 preferência corrompida é descartada sem quebrar', function (assert, sandbox) {
        var key = 'hrpaginationjs:app:7:lista:v1';

        window.localStorage.setItem(key, '{corrompido');

        var html = FIXTURE.replace('data-paginationjs-limit="10"', 'data-paginationjs-limit="10" data-paginationjs-persist data-paginationjs-user="7"');

        return loaded(sandbox, null, html).then(function (ctx) {
            assert.deepEqual(ctx.s.calls[0].params, { page: 1, limit: 10 }, 'usou o padrão');
            assert.ok(ctx.instance.hideColumn('nome'));

            var saved = JSON.parse(window.localStorage.getItem(key));

            assert.equal(saved.columns.nome, false, 'salvou no lugar do corrompido');
            assert.equal(saved.limit, 10);
        });
    });

    test('20 mudança do esquema de colunas', function (assert, sandbox) {
        var key = 'hrpaginationjs:app:anon:lista:v1';

        window.localStorage.setItem(key, JSON.stringify({ columns: { nome: false, email: true, removida: true }, limit: 50, sort: 'inexistente', direction: 'desc' }));

        var html = FIXTURE
            .replace('data-paginationjs-limit="10"', 'data-paginationjs-limit="10" data-paginationjs-persist')
            .replace('data-paginationjs-key="nome" data-paginationjs-sortable', 'data-paginationjs-key="nome" data-paginationjs-sortable data-paginationjs-required')
            .replace('<th data-paginationjs-key="acoes"', '<th data-paginationjs-key="telefone" data-paginationjs-hidden>Telefone</th><th data-paginationjs-key="acoes"');

        return loaded(sandbox, null, html).then(function (ctx) {
            var state = ctx.instance.getState();

            assert.deepEqual(state.columns, ['id', 'nome', 'email', 'acoes'], 'nome agora obrigatória, email da preferência, telefone com padrão');
            assert.equal(state.limit, 50, 'limite salvo e permitido');
            assert.equal(state.sort, '', 'ordenação de coluna inexistente ignorada');
        });
    });

    test('21 duas instâncias isoladas na mesma página (com controle externo)', function (assert, sandbox) {
        var html = '' +
            '<input data-paginationjs-for="a" data-paginationjs-search aria-label="Buscar A">' +
            '<div id="a" data-paginationjs data-paginationjs-remote="/a" data-paginationjs-debounce="0"><table><thead><tr><th data-paginationjs-key="id">ID</th></tr></thead></table></div>' +
            '<div id="b" data-paginationjs data-paginationjs-remote="/b"><table><thead><tr><th data-paginationjs-key="id">ID</th></tr></thead></table></div>';
        var sa = server();
        var sb = server();

        sandbox.innerHTML = html;

        var a = window.HrPaginationjs.init('a', { transport: sa.transport });
        var b = window.HrPaginationjs.init('b', { transport: sb.transport });

        sa.replyPage(sa.calls[0], 100);
        sb.replyPage(sb.calls[0], 100);

        return tick().then(function () {
            var pa = a.setPage(4);

            sa.replyPage(sa.last(), 100);

            return pa;
        }).then(function () {
            assert.equal(a.getState().page, 4);
            assert.equal(b.getState().page, 1, 'B não mudou');
            assert.equal(sb.calls.length, 1, 'B não requisitou');

            var input = sandbox.querySelector('[data-paginationjs-for="a"]');

            input.value = 'zz';
            fire(input, 'input');

            return tick(20);
        }).then(function () {
            assert.equal(sa.last().params.search, 'zz', 'controle externo ligado à A');
            assert.equal(sb.calls.length, 1, 'B continua isolada');
            assert.equal(window.HrPaginationjs.get('b'), b);
        });
    });

    test('22 destruição completa e reinicialização sem duplicar handlers', function (assert, sandbox) {
        var ctx = start(sandbox, { toolbar: 'search,limit,columns,reload' });
        var pending = ctx.s.calls[0];
        var th = ctx.root.querySelector('th[data-paginationjs-key="nome"]');

        ctx.instance.destroy();
        assert.ok(pending.aborted, 'requisição pendente cancelada');
        assert.equal(ctx.root.querySelector('.hrpjs-toolbar'), null, 'toolbar removida');
        assert.equal(ctx.root.querySelector('.hrpjs-footer'), null, 'rodapé removido');
        assert.equal(ctx.root.querySelector('details.hrpjs-columns'), null, 'seletor removido');
        assert.equal(th.querySelector('button'), null, 'cabeçalho restaurado');
        assert.equal(th.textContent, 'Nome');
        assert.equal(window.HrPaginationjs.get(ctx.root), null, 'registro liberado');

        var s2 = server();
        var again = window.HrPaginationjs.init(ctx.root, { transport: s2.transport });

        assert.equal(s2.calls.length, 1, 'uma requisição na reinicialização');
        s2.replyPage(s2.calls[0], 35);

        return tick().then(function () {
            pagerLink(ctx.root, 2).click();
            assert.equal(s2.calls.length, 2, 'um clique = uma requisição');
            assert.equal(ctx.s.calls.length, 1, 'transporte antigo não recebeu nada');
            assert.equal(ctx.root.querySelectorAll('.hrpjs-footer').length, 1, 'sem estrutura duplicada');
            assert.equal(window.HrPaginationjs.init(ctx.root), again, 'init repetido devolve a mesma instância');
        });
    });

    test('23 conteúdo malicioso é renderizado como texto', function (assert, sandbox) {
        var ctx = start(sandbox);
        var evil = '<img src=x onerror="window.__hrpjsXss=1">';

        ctx.s.reply(ctx.s.calls[0], envelope([{ id: 1, nome: evil, email: 'x', url: 'javascript:alert(1)' }], 1, 1, 10));

        return tick().then(function () {
            var cell = firstCell(ctx.root, 'nome');
            var link = ctx.root.querySelector('td[data-paginationjs-cell="acoes"] a');

            assert.equal(cell.textContent, evil, 'texto literal');
            assert.equal(ctx.root.querySelector('tbody img'), null, 'nenhum elemento injetado');
            assert.equal(link.hasAttribute('href'), false, 'href javascript: removido');
            assert.equal(link.textContent, 'Ver ' + evil, 'placeholder no template é texto');
            assert.equal(window.__hrpjsXss, undefined);
        });
    });

    test('24 navegação por teclado na paginação e foco preservado', function (assert, sandbox) {
        return loaded(sandbox).then(function (ctx) {
            var link = pagerLink(ctx.root, 2);

            assert.equal(link.getAttribute('role'), 'button');
            assert.equal(link.getAttribute('tabindex'), '0');
            assert.equal(link.getAttribute('aria-label'), 'Página 2');
            assert.equal(ctx.root.querySelector('.hrpjs-pager').getAttribute('role'), 'navigation');
            link.focus();
            key(link, 'Enter');
            assert.equal(ctx.s.last().params.page, 2, 'Enter navega');
            ctx.s.replyPage(ctx.s.last(), 35);

            return tick().then(function () {
                var active = document.activeElement;

                assert.ok(ctx.root.querySelector('.hrpjs-pager').contains(active), 'foco permanece na paginação');
                assert.equal(active.getAttribute('aria-current'), 'page');

                var next = ctx.root.querySelector('.hrpjs-pager .J-paginationjs-next a');

                next.focus();
                key(next, ' ');
                assert.equal(ctx.s.last().params.page, 3, 'Espaço navega');
                ctx.s.replyPage(ctx.s.last(), 35);

                return tick();
            }).then(function () {
                assert.ok(document.activeElement.closest('.J-paginationjs-next'), 'foco volta para "próxima"');
            });
        });
    });

    test('25 ausência de jQuery ou Pagination.js gera mensagem clara', function (assert, sandbox) {
        var root = mount(sandbox);
        var jq = window.jQuery;
        var plugin = jq.fn.pagination;

        try {
            window.jQuery = undefined;
            assert.throws(function () {
                window.HrPaginationjs.init(root, { transport: server().transport });
            }, /jQuery/);
            assert.ok(root.querySelector('.hrpjs-fatal[role="alert"]').textContent.indexOf('jQuery') !== -1, 'mensagem visível');
        } finally {
            window.jQuery = jq;
        }

        try {
            delete jq.fn.pagination;
            assert.throws(function () {
                window.HrPaginationjs.init(root, { transport: server().transport });
            }, /Pagination\.js/);
        } finally {
            jq.fn.pagination = plugin;
        }

        assert.equal(window.HrPaginationjs.get(root), null, 'nenhuma instância criada');
    });

    test('26 adaptador DataTables traduz parâmetros e resposta', function (assert, sandbox) {
        var html = FIXTURE.replace('data-paginationjs-limit="10"', 'data-paginationjs-limit="10" data-paginationjs-adapter="datatables" data-paginationjs-sort="nome" data-paginationjs-direction="desc"');
        var ctx = start(sandbox, null, html);
        var params = ctx.s.calls[0].params;

        assert.deepEqual(params, { draw: 1, start: 0, length: 10, order_col: 'nome', order_dir: 'desc' });
        ctx.s.reply(ctx.s.calls[0], { draw: 1, recordsTotal: 500, recordsFiltered: 42, data: makeRows(1, 10, 42) });

        return tick().then(function () {
            assert.equal(ctx.instance.getState().total, 42, 'usa recordsFiltered');

            var p = ctx.instance.setPage(3);

            assert.equal(ctx.s.last().params.start, 20);
            ctx.s.reply(ctx.s.last(), { draw: 3, recordsTotal: 500, recordsFiltered: 42, data: makeRows(3, 10, 42) });

            return p;
        }).then(function (state) {
            assert.equal(state.page, 3);
            assert.equal(firstCell(ctx.root, 'id').textContent, '21');
        });
    });

    test('27 estado na URL com prefixo preserva parâmetros alheios', function (assert, sandbox) {
        window.history.replaceState(null, '', window.location.pathname + '?option=com_loja&lista_page=2&lista_f_status=ativo');

        var html = FIXTURE.replace('data-paginationjs-limit="10"', 'data-paginationjs-limit="10" data-paginationjs-url');

        return Promise.resolve().then(function () {
            var ctx = start(sandbox, null, html);

            assert.deepEqual(ctx.s.calls[0].params, { status: 'ativo', page: 2, limit: 10 }, 'URL tem precedência');
            assert.equal(ctx.root.querySelector('select[name="status"]').value, 'ativo', 'controle restaurado');
            ctx.s.replyPage(ctx.s.calls[0], 35);

            return tick().then(function () {
                var p = ctx.instance.setSearch('ana');

                ctx.s.replyPage(ctx.s.last(), 35);

                return p;
            }).then(function () {
                var search = new window.URLSearchParams(window.location.search);

                assert.equal(search.get('option'), 'com_loja', 'parâmetro alheio preservado');
                assert.equal(search.get('lista_search'), 'ana');
                assert.equal(search.get('lista_page'), null, 'página 1 não polui a URL');
                assert.equal(search.get('lista_f_status'), 'ativo');
            });
        });
    });

    test('28 ação remota envia token CSRF e recarrega', function (assert, sandbox) {
        var html = FIXTURE.replace('<template id="tpl-acoes"><a href="{url}" data-paginationjs-action="ver">Ver {nome}</a></template>',
            '<template id="tpl-acoes"><button type="button" data-paginationjs-action="excluir" data-paginationjs-action-remote="/excluir.php" data-paginationjs-param-motivo="limpeza {id}">Excluir</button></template>') +
            '<input type="hidden" name="0123456789abcdef0123456789abcdef" value="1">';
        var actions = [];

        return loaded(sandbox, null, html).then(function (ctx) {
            ctx.root.addEventListener('hrpaginationjs:action', function (e) {
                actions.push(e.detail);
            });

            ctx.root.querySelector('tbody button[data-paginationjs-action]').click();

            var call = ctx.s.last();

            assert.equal(actions.length, 1, 'evento action');
            assert.equal(actions[0].key, 1);
            assert.equal(call.request.url, '/excluir.php');
            assert.equal(call.request.method, 'POST');
            assert.deepEqual(call.params, { id: 1, motivo: 'limpeza 1', '0123456789abcdef0123456789abcdef': '1' });
            assert.equal(call.request.headers['X-CSRF-Token'], '0123456789abcdef0123456789abcdef');

            var before = ctx.s.calls.length;

            ctx.s.reply(call, { success: true, status: 'sucesso', mensagem: 'Cliente excluído.', data: null, errors: [], request_id: 'z' });
            assert.equal(ctx.s.calls.length, before + 1, 'recarregou a lista');
            assert.equal(ctx.root.querySelector('.hrpjs-notice').textContent, 'Cliente excluído.');
        });
    });

    test('29 cache opcional evita requisição repetida e reload ignora o cache', function (assert, sandbox) {
        var html = FIXTURE.replace('data-paginationjs-limit="10"', 'data-paginationjs-limit="10" data-paginationjs-cache="60"');

        return loaded(sandbox, null, html).then(function (ctx) {
            var p = ctx.instance.setPage(2);

            ctx.s.replyPage(ctx.s.last(), 35);

            return p.then(function () {
                return ctx.instance.setPage(1);
            }).then(function () {
                assert.equal(ctx.s.calls.length, 2, 'página 1 veio do cache');
                assert.equal(firstCell(ctx.root, 'id').textContent, '1');
                ctx.instance.reload();
                assert.equal(ctx.s.calls.length, 3, 'reload vai ao servidor');
            });
        });
    });

    test('31 chamadas diretas ao Pagination.js não criam requisições paralelas', function (assert, sandbox) {
        return loaded(sandbox).then(function (ctx) {
            var pager = window.jQuery(ctx.root.querySelector('.hrpjs-pager'));

            pager.pagination('go', 3);
            assert.equal(ctx.s.calls.length, 2, 'go desviado para o transporte da biblioteca');
            assert.equal(ctx.s.last().params.page, 3);
            ctx.s.replyPage(ctx.s.last(), 35);

            return tick().then(function () {
                pager.pagination('next');
                pager.pagination('refresh');
                assert.equal(ctx.s.calls.length, 2, 'next/refresh sem efeito');
            });
        });
    });

    function restoreAfter(original, promise) {
        return promise.then(function (value) {
            window.XMLHttpRequest = original;

            return value;
        }, function (error) {
            window.XMLHttpRequest = original;
            throw error;
        });
    }

    function fakeXhr() {
        var created = [];

        function FakeXHR() {
            this.headers = {};
            this.responseHeaders = {};
            this.status = 0;
            this.responseText = '';
            this.timeout = 0;
            created.push(this);
        }

        FakeXHR.prototype.open = function (method, url) {
            this.method = method;
            this.url = url;
        };
        FakeXHR.prototype.setRequestHeader = function (name, value) {
            this.headers[name] = value;
        };
        FakeXHR.prototype.getResponseHeader = function (name) {
            return this.responseHeaders[name] || null;
        };
        FakeXHR.prototype.send = function (body) {
            this.body = body;
        };
        FakeXHR.prototype.abort = function () {
            this.aborted = true;
        };
        FakeXHR.prototype.respond = function (status, text, headers) {
            this.status = status;
            this.responseText = text;
            this.responseHeaders = headers || {};
            this.onload();
        };

        return { FakeXHR: FakeXHR, created: created };
    }

    test('32 transporte nativo (sem $.ajax): GET, cabeçalhos, JSON, erro de parse, timeout e abort', function (assert, sandbox) {
        var original = window.XMLHttpRequest;
        var fake = fakeXhr();

        window.XMLHttpRequest = fake.FakeXHR;

        try {
            var root = mount(sandbox);
            var instance = window.HrPaginationjs.init(root);
            var x1 = fake.created[0];

            assert.equal(x1.method, 'GET');
            assert.ok(/^\/api\.php\?page=1&limit=10&_=\d+$/.test(x1.url), 'URL com parâmetros: ' + x1.url);
            assert.equal(x1.headers['X-Requested-With'], 'XMLHttpRequest', 'reconhecido pelo ApiResponseHelper');
            assert.ok(/application\/json/.test(x1.headers.Accept));
            x1.respond(200, JSON.stringify(envelope(makeRows(1, 10, 35), 35, 1, 10)), { 'X-Request-Id': 'hdr-1' });

            return restoreAfter(original, tick().then(function () {
                assert.equal(bodyRows(root).length, 10, 'renderizou');

                var p = instance.setPage(2);

                fake.created[1].respond(200, '<html>login</html>');

                return p.then(null, function (e) {
                    return e;
                });
            }).then(function (error) {
                assert.equal(error.kind, 'invalid', 'HTML no lugar de JSON');

                var p = instance.setPage(2);

                fake.created[2].ontimeout();

                return p.then(null, function (e) {
                    return e;
                });
            }).then(function (error) {
                assert.equal(error.kind, 'timeout');

                var p = instance.setFilters({ uf: ['SP', 'RJ'] });
                var pending = fake.created[3];

                assert.ok(pending.url.indexOf('uf%5B%5D=SP&uf%5B%5D=RJ') !== -1, 'array no formato PHP');
                instance.setPage(3);
                assert.ok(pending.aborted, 'abort real no XMLHttpRequest');
                fake.created[4].respond(401, JSON.stringify({ success: false, status: 'erro', mensagem: 'Usuário não autenticado.', data: null, errors: [], request_id: 's1' }));

                return p.then(null, function (e) {
                    return e;
                });
            }).then(function (error) {
                assert.equal(error.kind, 'session', 'promessa superada resolve com o resultado mais recente');
                assert.equal(error.requestId, 's1');
            }));
        } catch (e) {
            window.XMLHttpRequest = original;
            throw e;
        }
    });

    test('33 ação remota pelo transporte nativo envia POST urlencoded', function (assert, sandbox) {
        var original = window.XMLHttpRequest;
        var fake = fakeXhr();
        var html = FIXTURE.replace('<template id="tpl-acoes"><a href="{url}" data-paginationjs-action="ver">Ver {nome}</a></template>',
            '<template id="tpl-acoes"><button type="button" data-paginationjs-action="excluir" data-paginationjs-action-remote="/excluir.php">Excluir</button></template>') +
            '<input type="hidden" name="0123456789abcdef0123456789abcdef" value="1">';

        window.XMLHttpRequest = fake.FakeXHR;

        try {
            var root = mount(sandbox, html);

            window.HrPaginationjs.init(root);
            fake.created[0].respond(200, JSON.stringify(envelope(makeRows(1, 10, 35), 35, 1, 10)));

            return restoreAfter(original, tick().then(function () {
                root.querySelector('tbody button[data-paginationjs-action]').click();

                var post = fake.created[1];

                assert.equal(post.method, 'POST');
                assert.equal(post.url, '/excluir.php');
                assert.equal(post.body, 'id=1&0123456789abcdef0123456789abcdef=1');
                assert.equal(post.headers['Content-Type'], 'application/x-www-form-urlencoded; charset=UTF-8');
                assert.equal(post.headers['X-CSRF-Token'], '0123456789abcdef0123456789abcdef');
            }));
        } catch (e) {
            window.XMLHttpRequest = original;
            throw e;
        }
    });

    test('34 jQuery anterior a 1.7 gera mensagem clara', function (assert, sandbox) {
        var root = mount(sandbox);
        var jq = window.jQuery;
        var on = jq.fn.on;

        try {
            jq.fn.on = undefined;
            assert.throws(function () {
                window.HrPaginationjs.init(root, { transport: server().transport });
            }, /jQuery 1\.7 ou superior/);
        } finally {
            jq.fn.on = on;
        }
    });

    test('35 adaptador laravel: paginate(), API Resource, envelope do ResponseService e simplePaginate', function (assert, sandbox) {
        var html = FIXTURE.replace('data-paginationjs-limit="10"', 'data-paginationjs-limit="10" data-paginationjs-adapter="laravel"');
        var ctx = start(sandbox, null, html);

        assert.deepEqual(ctx.s.calls[0].params, { page: 1, limit: 10 }, 'mesmos parâmetros do padrão');
        ctx.s.reply(ctx.s.calls[0], { current_page: 1, data: makeRows(1, 10, 42), per_page: 10, total: 42, last_page: 5, from: 1, to: 10 });

        return tick().then(function () {
            assert.equal(ctx.instance.getState().total, 42, 'paginate() puro');

            var p = ctx.instance.setPage(2);

            ctx.s.reply(ctx.s.last(), { data: makeRows(2, 10, 42), links: {}, meta: { current_page: 2, per_page: 10, total: 42, last_page: 5 } });

            return p;
        }).then(function (state) {
            assert.equal(state.page, 2, 'API Resource (data + meta)');
            assert.equal(firstCell(ctx.root, 'id').textContent, '11');

            var p = ctx.instance.setPage(3);

            ctx.s.reply(ctx.s.last(), envelope(makeRows(3, 10, 42), 42, 3, 10));

            return p;
        }).then(function (state) {
            assert.equal(state.page, 3, 'envelope do ResponseService');

            var p = ctx.instance.setPage(4);

            ctx.s.reply(ctx.s.last(), { current_page: 4, data: [], per_page: 10, next_page_url: null });

            return p.then(null, function (e) {
                return e;
            });
        }).then(function (error) {
            assert.equal(error.kind, 'invalid', 'simplePaginate (sem total) não vira lista vazia');
        });
    });

    test('36 HTTP 419 (token/sessão do Laravel) e mensagem em "message"', function (assert, sandbox) {
        return loaded(sandbox).then(function (ctx) {
            var p = ctx.instance.reload();

            ctx.s.fail(ctx.s.last(), 419, 'error', { message: 'CSRF token mismatch.' });

            return p.then(null, function (error) {
                assert.equal(error.kind, 'session');
                assert.equal(error.message, 'CSRF token mismatch.');

                var p2 = ctx.instance.reload();

                ctx.s.fail(ctx.s.last(), 422, 'error', { message: 'The given data was invalid.', errors: { status: ['Inválido.'] } });

                return p2;
            }).then(null, function (error) {
                assert.equal(error.kind, 'http');
                assert.equal(error.message, 'The given data was invalid.', 'lê "message" do Laravel');
                assert.deepEqual(error.errors, { status: ['Inválido.'] });
            });
        });
    });

    test('37 token CSRF: @csrf do Laravel e data-paginationjs-csrf="header" enviam só o cabeçalho', function (assert, sandbox) {
        var tpl = '<template id="tpl-acoes"><button type="button" data-paginationjs-action="excluir" data-paginationjs-action-remote="/clientes/{id}" data-paginationjs-param-_method="DELETE">Excluir</button></template>';
        var base = FIXTURE.replace('<template id="tpl-acoes"><a href="{url}" data-paginationjs-action="ver">Ver {nome}</a></template>', tpl);
        var meta = document.createElement('meta');

        meta.name = 'csrf-token';
        meta.content = 'LaravelToken40CharsAbcdefghijklmnopqrstuv';
        document.head.appendChild(meta);

        function acionar(html, opts) {
            sandbox.innerHTML = '';

            var c = start(sandbox, opts, html);

            c.s.replyPage(c.s.calls[0], 35);

            return tick().then(function () {
                c.root.querySelector('tbody button[data-paginationjs-action]').click();

                var call = c.s.last();

                c.instance.destroy();

                return call;
            });
        }

        return acionar(base + '<input type="hidden" name="_token" value="TokenDoBlade123">').then(function (call) {
            assert.deepEqual(call.params, { id: 1, _method: 'DELETE' }, '@csrf: corpo sem campo extra');
            assert.equal(call.request.headers['X-CSRF-Token'], 'TokenDoBlade123');

            return acionar(base.replace('data-paginationjs-limit="10"', 'data-paginationjs-limit="10" data-paginationjs-csrf="header"'));
        }).then(function (call) {
            assert.deepEqual(call.params, { id: 1, _method: 'DELETE' }, 'csrf="header": só cabeçalho');
            assert.equal(call.request.headers['X-CSRF-Token'], 'LaravelToken40CharsAbcdefghijklmnopqrstuv');

            return acionar(base);
        }).then(function (call) {
            assert.equal(call.params.LaravelToken40CharsAbcdefghijklmnopqrstuv, '1', 'padrão (auto) mantém o campo do Joomla');
            document.head.removeChild(meta);
        }, function (error) {
            document.head.removeChild(meta);
            throw error;
        });
    });

    test('38 ação remota: 204 No Content e JSON sem envelope com "message"', function (assert, sandbox) {
        var tpl = '<template id="tpl-acoes"><button type="button" data-paginationjs-action="excluir" data-paginationjs-action-remote="/clientes/{id}">Excluir</button></template>';
        var html = FIXTURE.replace('<template id="tpl-acoes"><a href="{url}" data-paginationjs-action="ver">Ver {nome}</a></template>', tpl);
        var done = [];

        return loaded(sandbox, null, html).then(function (ctx) {
            ctx.root.addEventListener('hrpaginationjs:actiondone', function (e) {
                done.push(e.detail);
            });

            ctx.root.querySelector('tbody button[data-paginationjs-action]').click();
            ctx.s.fail(ctx.s.last(), 204, 'parsererror', undefined);
            assert.equal(done.length, 1, '204 conta como sucesso');
            assert.equal(ctx.root.querySelector('.hrpjs-notice').textContent, 'Operação concluída.');
            ctx.s.replyPage(ctx.s.last(), 35);

            return tick().then(function () {
                ctx.root.querySelector('tbody button[data-paginationjs-action]').click();
                ctx.s.reply(ctx.s.last(), { message: 'Cliente removido.' });
                assert.equal(done.length, 2, 'JSON sem "success" conta como sucesso');
                assert.equal(ctx.root.querySelector('.hrpjs-notice').textContent, 'Cliente removido.');
            });
        });
    });

    test('30 template com condição e formatadores', function (assert, sandbox) {
        var html = '<div id="t" data-paginationjs data-paginationjs-remote="/t" data-paginationjs-locale="pt-BR"><table><thead><tr>' +
            '<th data-paginationjs-key="valor" data-paginationjs-format="money">Valor</th>' +
            '<th data-paginationjs-key="data" data-paginationjs-format="date">Data</th>' +
            '<th data-paginationjs-key="ativo" data-paginationjs-format="bool">Ativo</th>' +
            '<th data-paginationjs-key="vazio" data-paginationjs-default="—">Vazio</th>' +
            '<th data-paginationjs-key="st" data-paginationjs-template="tpl-st">Status</th>' +
            '</tr></thead></table></div>' +
            '<template id="tpl-st"><span data-paginationjs-if="status=ativo">Ativo</span><span data-paginationjs-if="status!=ativo">Inativo</span></template>';
        var ctx = start(sandbox, null, html);

        ctx.s.reply(ctx.s.calls[0], envelope([{ valor: 1234.5, data: '2026-01-31', ativo: 1, vazio: null, status: 'ativo' }], 1, 1, 20));

        return tick().then(function () {
            assert.equal(firstCell(ctx.root, 'valor').textContent.replace(/\s/g, ' '), 'R$ 1.234,50');
            assert.equal(firstCell(ctx.root, 'data').textContent, '31/01/2026', 'data sem deslocamento de fuso');
            assert.equal(firstCell(ctx.root, 'ativo').textContent, 'Sim');
            assert.equal(firstCell(ctx.root, 'vazio').textContent, '—');
            assert.equal(firstCell(ctx.root, 'st').textContent, 'Ativo');
        });
    });
})(window);
