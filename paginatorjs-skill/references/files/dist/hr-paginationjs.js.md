# 📄 `dist/hr-paginationjs.js`

- **Camada:** [📄 OUTROS ARQUIVOS](../../outros.md)
- **Linguagem:** javascript
- **Linhas:** 3883

## Funções / Métodos

- `HtmlString(value)`
- `warn(message)`
- `logError(message)`
- `own(object, key)`
- `isPlainObject(value)`
- `extend(target)`
- `clone(value)`
- `camel(name)`
- `attrName(name)`
- `getAttr(el, name)`
- `hasAttr(el, name)`
- `toInt(value, fallback)`
- `toBool(value, fallback)`
- `toList(value)`
- `parseJsonAttr(el, name, fallback)`
- `getPath(object, path)`
- `fill(template, vars)`
- `safeUrl(value, purpose)`
- `cssEscape(value)`
- `normalizeDirection(value)`
- `sameJson(a, b)`
- `sortedEntries(object)`
- `deferred()`
- `emit(target, name, detail, cancelable)`
- `tokenInfo(explicit)`
- `findToken(explicit)`
- `normalizeScalar(value, type)`
- `normalizeFilterValue(value, type)`
- `parseDateParts(value)`
- `isEmptyValue(value)`
- `makeLink(doc, url, text, target)`
- `serialize(data)`
- `add(key, value)`
- `build(prefix, value)`
- `sameOrigin(url)`
- `appendQuery(url, query)`
- `xhrTransport(request, done)`
- `finish(result)`
- `header(name)`
- `dependencyError()`
- `ConfigError(message)`
- `showFatal(root, message)`
- `readConfig(root, options)`
- `readColumns(table, cfgId)`
- `createInstance(root, options)`
- `listen(target, type, handler, capture)`
- `setTimer(name, fn, ms)`
- `clearTimer(name)`
- `el(tag, className, text)`
- `track(node)`
- `forScopes()`
- `owns(node)`
- `query(selector)`
- `blockOf(node)`
- `buildToolbar()`
- `isDataColumn(col)`
- `visibleKeys()`
- `visibleCount()`
- `defaultVisibility()`
- `ensureMinimum(visible)`
- `canHide(col)`
- `getStorage()`
- `loadPrefs()`
- `savePrefs()`
- `removePrefs()`
- `validSort(key)`
- `sanitizeFilters(input)`
- `applyPrefs(target, prefs)`
- `readUrl()`
- `writeUrl(initial)`
- `searchInputs()`
- `isFilterControl(node)`
- `filterControls()`
- `filterName(node)`
- `controlsByName()`
- `filterType(name)`
- `filterIsMultiple(name)`
- `readFilterControls()`
- `writeFilterControls()`
- `writeSearchControls()`
- `limitSelects()`
- `writeLimitControls()`
- `buildPickers()`
- `updatePickers()`
- `applyVisibility()`
- `updateSortUi()`
- `announce(text)`
- `showNotice(text, isError)`
- `messageRow(kind, text, extra)`
- `formatterContext(col)`
- `getFormatter(name)`
- `outputToText(out)`
- `placeholderValue(row, expression)`
- `fillRow(text, row)`
- `evaluateCondition(expression, row)`
- `renderTemplate(template, row)`
- `renderCell(col, row)`
- `renderRows()`
- `renderSummary()`
- `clearSummary(text)`
- `rememberPagerFocus()`
- `restorePagerFocus(memory)`
- `enhancePager(paginationOptions)`
- `goFromPager(value)`
- `destroyPager()`
- `renderPager()`
- `combined(hook, pick)`
- `fromArgs(args)`
- `makeError(kind, message, errors, status, requestId)`
- `classify(result)`
- `adapterContext(sequence)`
- `buildParams(sequence)`
- `cacheKeyFor(params)`
- `cacheGet(key)`
- `cacheSet(key, body)`
- `cancelCurrent()`
- `settle(error)`
- `showLoading()`
- `endLoading()`
- `renderError(error)`
- `startRequest(opts)`
- `finish(mySeq, result, opts, key)`
- `load(opts)`
- `changed()`
- `rejected(message)`
- `applyControls(which)`
- `formApplyMode(node)`
- `runRemoteAction(button, row, key)`
- `handleAction(button)`
- `onClick(e)`
- `clearControls(kind)`
- `onInput(e)`
- `onChange(e)`
- `onKeydown(e)`
- `onSubmit(e)`
- `onCompositionStart()`
- `onCompositionEnd(e)`
- `onPopState()`
- `bindEvents()`
- `html(value)`
- `initialState()`
- `resolveElement(target)`
- `get(target)`
- `init(target, options)`
- `scan(context)`

## Código-fonte

```javascript
/*!
 * hr-paginationjs 1.0.0
 * Listagens remotas declarativas (data-paginationjs-*) sobre jQuery + Pagination.js 2.6.0.
 * Ordem de carregamento: jQuery -> pagination.js -> hr-paginationjs.js
 */
(function (window, document) {
    'use strict';

    var VERSION = '1.0.0';
    var P = 'data-paginationjs';
    var EVENT_PREFIX = 'hrpaginationjs:';

    var TEXTS = {
        loading: 'Carregando…',
        empty: 'Nenhum registro encontrado.',
        idle: '',
        retry: 'Tentar novamente',
        summary: 'Exibindo {start} a {end} de {total} registros',
        summaryEmpty: 'Nenhum registro',
        search: 'Buscar',
        searchPlaceholder: '',
        limit: 'Por página',
        columns: 'Colunas',
        columnsReset: 'Restaurar padrão',
        columnRequired: 'Coluna obrigatória',
        reload: 'Atualizar',
        clear: 'Limpar',
        pagination: 'Paginação',
        page: 'Página {page}',
        previous: 'Página anterior',
        next: 'Próxima página',
        requestId: 'Código para suporte: {id}',
        yes: 'Sim',
        no: 'Não',
        errorNetwork: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
        errorTimeout: 'O servidor demorou demais para responder.',
        errorHttp: 'O servidor retornou um erro ({status}).',
        errorInvalid: 'O servidor enviou uma resposta inválida.',
        errorApi: 'Não foi possível carregar os registros.',
        errorSession: 'Sua sessão expirou. Entre novamente para continuar.',
        errorPermission: 'Você não tem permissão para esta operação.',
        errorConfig: 'A ação não está configurada corretamente.',
        actionDone: 'Operação concluída.',
        actionError: 'Não foi possível concluir a operação.'
    };

    var PAGINATION_ALLOWED = [
        'pageRange', 'showPrevious', 'showNext', 'showPageNumbers', 'showNavigator', 'formatNavigator',
        'showGoInput', 'showGoButton', 'formatGoInput', 'formatGoButton', 'goButtonText',
        'prevText', 'nextText', 'ellipsisText', 'activeClassName', 'disableClassName',
        'ulClassName', 'pageClassName', 'prevClassName', 'nextClassName',
        'autoHidePrevious', 'autoHideNext', 'hideOnlyOnePage', 'hideFirstOnEllipsisShow',
        'hideLastOnEllipsisShow', 'header', 'footer', 'position'
    ];

    var PAGINATION_COMBINED = [
        'className', 'afterRender', 'beforePageOnClick', 'beforePreviousOnClick',
        'beforeNextOnClick', 'beforeGoButtonOnClick', 'beforeGoInputOnEnter'
    ];

    var URL_ATTRIBUTES = ['href', 'src', 'action', 'formaction', 'xlink:href', 'poster', 'cite', 'background'];

    var instances = [];
    var adapters = {};
    var formatters = {};
    var uidCounter = 0;
    var warned = {};

    function HtmlString(value) {
        this.value = value === null || value === undefined ? '' : String(value);
    }

    function warn(message) {
        if (warned[message]) {
            return;
        }

        warned[message] = true;

        if (window.console && window.console.warn) {
            window.console.warn('hr-paginationjs: ' + message);
        }
    }

    function logError(message) {
        if (window.console && window.console.error) {
            window.console.error('hr-paginationjs: ' + message);
        }
    }

    function own(object, key) {
        return Object.prototype.hasOwnProperty.call(object, key);
    }

    function isPlainObject(value) {
        return value !== null && typeof value === 'object' && Object.prototype.toString.call(value) === '[object Object]';
    }

    function extend(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];

            if (!source) {
                continue;
            }

            for (var key in source) {
                if (own(source, key) && source[key] !== undefined) {
                    target[key] = source[key];
                }
            }
        }

        return target;
    }

    function clone(value) {
        if (value === undefined) {
            return undefined;
        }

        try {
            return JSON.parse(JSON.stringify(value));
        } catch (e) {
            return null;
        }
    }

    function camel(name) {
        return String(name).replace(/-([a-z0-9])/g, function (m, c) {
            return c.toUpperCase();
        });
    }

    function attrName(name) {
        return name ? P + '-' + name : P;
    }

    function getAttr(el, name) {
        return el && el.getAttribute ? el.getAttribute(attrName(name)) : null;
    }

    function hasAttr(el, name) {
        return !!(el && el.hasAttribute && el.hasAttribute(attrName(name)));
    }

    function toInt(value, fallback) {
        if (value === null || value === undefined || value === '') {
            return fallback;
        }

        var n = parseInt(value, 10);

        return isNaN(n) ? fallback : n;
    }

    function toBool(value, fallback) {
        if (value === null || value === undefined) {
            return fallback;
        }

        if (typeof value === 'boolean') {
            return value;
        }

        var v = String(value).toLowerCase().trim();

        if (v === '' || v === 'true' || v === '1' || v === 'sim' || v === 'yes' || v === 'on') {
            return true;
        }

        if (v === 'false' || v === '0' || v === 'nao' || v === 'não' || v === 'no' || v === 'off') {
            return false;
        }

        return fallback;
    }

    function toList(value) {
        if (Array.isArray(value)) {
            return value.slice();
        }

        if (value === null || value === undefined) {
            return [];
        }

        return String(value).split(',').map(function (s) {
            return s.trim();
        }).filter(function (s) {
            return s !== '';
        });
    }

    function parseJsonAttr(el, name, fallback) {
        var raw = getAttr(el, name);

        if (raw === null || raw.trim() === '') {
            return fallback;
        }

        try {
            return JSON.parse(raw);
        } catch (e) {
            warn('o atributo ' + attrName(name) + ' não contém JSON válido e foi ignorado.');

            return fallback;
        }
    }

    function getPath(object, path) {
        if (object === null || object === undefined || path === null || path === undefined || path === '') {
            return undefined;
        }

        var parts = String(path).split('.');
        var current = object;

        for (var i = 0; i < parts.length; i++) {
            if (current === null || current === undefined || typeof current !== 'object') {
                return undefined;
            }

            current = current[parts[i]];
        }

        return current;
    }

    function fill(template, vars) {
        return String(template).replace(/\{([a-zA-Z0-9_]+)\}/g, function (m, key) {
            return own(vars, key) && vars[key] !== null && vars[key] !== undefined ? String(vars[key]) : '';
        });
    }

    function safeUrl(value, purpose) {
        if (value === null || value === undefined) {
            return null;
        }

        var url = String(value).trim();

        if (url === '' || /[\u0000-\u001F\u007F]/.test(url)) {
            return null;
        }

        var scheme = /^([a-zA-Z][a-zA-Z0-9+.\-]*):/.exec(url);

        if (!scheme) {
            if (/^\/\//.test(url)) {
                return purpose === 'request' ? null : url;
            }

            return url;
        }

        var name = scheme[1].toLowerCase();
        var allowed = purpose === 'request' ? ['http', 'https'] : ['http', 'https', 'mailto', 'tel'];

        return allowed.indexOf(name) !== -1 ? url : null;
    }

    function cssEscape(value) {
        if (window.CSS && typeof window.CSS.escape === 'function') {
            return window.CSS.escape(value);
        }

        return String(value).replace(/["\\]/g, '\\$&');
    }

    function normalizeDirection(value) {
        var v = String(value || '').toLowerCase();

        return v === 'asc' || v === 'desc' ? v : null;
    }

    function sameJson(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    function sortedEntries(object) {
        return Object.keys(object).sort().map(function (key) {
            return [key, object[key]];
        });
    }

    function deferred() {
        var d = {};

        d.promise = new Promise(function (resolve, reject) {
            d.resolve = resolve;
            d.reject = reject;
        });

        d.promise.catch(function () {});

        return d;
    }

    function emit(target, name, detail, cancelable) {
        var event;

        try {
            event = new window.CustomEvent(EVENT_PREFIX + name, {
                bubbles: true,
                cancelable: !!cancelable,
                detail: detail
            });
        } catch (e) {
            event = document.createEvent('CustomEvent');
            event.initCustomEvent(EVENT_PREFIX + name, true, !!cancelable, detail);
        }

        return target.dispatchEvent(event);
    }

    function tokenInfo(explicit) {
        if (explicit) {
            return { token: explicit, source: 'option' };
        }

        if (window.Joomla && typeof window.Joomla.getOptions === 'function') {
            var option = window.Joomla.getOptions('csrf.token', '');

            if (option) {
                return { token: option, source: 'joomla' };
            }
        }

        var inputs = document.querySelectorAll('input[type="hidden"][value="1"]');

        for (var i = 0; i < inputs.length; i++) {
            if (/^[a-f0-9]{32}$/i.test(inputs[i].name)) {
                return { token: inputs[i].name, source: 'joomla' };
            }
        }

        var laravel = document.querySelector('input[type="hidden"][name="_token"]');

        if (laravel && laravel.value) {
            return { token: laravel.value, source: 'laravel' };
        }

        var meta = document.querySelector('meta[name="csrf-token"]');

        return { token: meta ? meta.getAttribute('content') || '' : '', source: 'meta' };
    }

    function findToken(explicit) {
        return tokenInfo(explicit).token;
    }

    function normalizeScalar(value, type) {
        if (value === null || value === undefined) {
            return undefined;
        }

        if (type === 'bool') {
            var b = toBool(value, null);

            return b === null ? undefined : (b ? '1' : '0');
        }

        if (typeof value === 'boolean') {
            return value ? '1' : '0';
        }

        var s = String(value).trim();

        if (s === '') {
            return undefined;
        }

        if (type === 'number') {
            var n = Number(s.replace(',', '.'));

            return isFinite(n) ? n : undefined;
        }

        if (type === 'int') {
            var i = parseInt(s, 10);

            return isNaN(i) ? undefined : i;
        }

        if (type === 'date') {
            var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);

            if (!m) {
                return undefined;
            }

            var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));

            return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3] ? s : undefined;
        }

        return s;
    }

    function normalizeFilterValue(value, type) {
        if (Array.isArray(value)) {
            var out = [];

            value.forEach(function (item) {
                var v = normalizeScalar(item, type);

                if (v !== undefined && out.indexOf(v) === -1) {
                    out.push(v);
                }
            });

            return out.length ? out : undefined;
        }

        if (value !== null && typeof value === 'object') {
            return undefined;
        }

        return normalizeScalar(value, type);
    }

    function parseDateParts(value) {
        var m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?)?(Z|[+\-]\d{2}:?\d{2})?$/.exec(String(value).trim());

        if (!m) {
            return null;
        }

        return {
            y: +m[1], mo: +m[2], d: +m[3],
            h: m[4] !== undefined ? +m[4] : null,
            mi: m[5] !== undefined ? +m[5] : 0,
            s: m[6] !== undefined ? +m[6] : 0,
            zone: m[7] || null
        };
    }

    function isEmptyValue(value) {
        return value === null || value === undefined || value === '';
    }

    function makeLink(doc, url, text, target) {
        var a = doc.createElement('a');

        a.setAttribute('href', url);
        a.textContent = text;

        if (target === '_blank') {
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
        }

        return a;
    }

    formatters.text = function (value) {
        return isEmptyValue(value) ? null : String(value);
    };

    formatters.number = function (value, row, ctx) {
        if (isEmptyValue(value) || !isFinite(Number(value))) {
            return null;
        }

        var decimals = toInt(getAttr(ctx.th, 'decimals'), null);
        var options = decimals === null ? {} : { minimumFractionDigits: decimals, maximumFractionDigits: decimals };

        return new Intl.NumberFormat(ctx.locale, options).format(Number(value));
    };

    formatters.money = function (value, row, ctx) {
        if (isEmptyValue(value) || !isFinite(Number(value))) {
            return null;
        }

        var currency = getAttr(ctx.th, 'currency') || ctx.currency;

        return new Intl.NumberFormat(ctx.locale, { style: 'currency', currency: currency }).format(Number(value));
    };

    formatters.date = function (value, row, ctx) {
        if (isEmptyValue(value)) {
            return null;
        }

        var p = parseDateParts(value);

        if (!p) {
            return String(value);
        }

        return new Intl.DateTimeFormat(ctx.locale, { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' })
            .format(new Date(Date.UTC(p.y, p.mo - 1, p.d)));
    };

    formatters.datetime = function (value, row, ctx) {
        if (isEmptyValue(value)) {
            return null;
        }

        var p = parseDateParts(value);

        if (!p) {
            return String(value);
        }

        var options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };

        if (p.zone) {
            var date = new Date(String(value).trim().replace(' ', 'T'));

            return isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat(ctx.locale, options).format(date);
        }

        options.timeZone = 'UTC';

        return new Intl.DateTimeFormat(ctx.locale, options)
            .format(new Date(Date.UTC(p.y, p.mo - 1, p.d, p.h || 0, p.mi, p.s)));
    };

    formatters.bool = function (value, row, ctx) {
        if (isEmptyValue(value)) {
            return null;
        }

        var b = toBool(value, null);

        if (b === null) {
            b = !!value;
        }

        return b ? (getAttr(ctx.th, 'true') || ctx.texts.yes) : (getAttr(ctx.th, 'false') || ctx.texts.no);
    };

    formatters.link = function (value, row, ctx) {
        var url = safeUrl(value, 'link');

        if (!url) {
            return isEmptyValue(value) ? null : String(value);
        }

        var text = getAttr(ctx.th, 'link-text');

        return makeLink(document, url, text !== null ? fill(text, row || {}) : url, getAttr(ctx.th, 'link-target'));
    };

    formatters.email = function (value) {
        if (isEmptyValue(value)) {
            return null;
        }

        var email = String(value).trim();

        if (!/^[^\s@<>"]+@[^\s@<>"]+$/.test(email)) {
            return email;
        }

        return makeLink(document, 'mailto:' + email, email, null);
    };

    adapters.apiresponse = {
        names: { page: 'page', limit: 'limit', sort: 'sort', direction: 'direction', search: 'search' },
        cacheExclude: [],
        params: function (state, ctx) {
            var n = ctx.names;
            var params = {};

            params[n.page] = state.page;
            params[n.limit] = state.limit;

            if (state.sort) {
                params[n.sort] = state.sort;
                params[n.direction] = state.direction;
            }

            if (state.search !== '') {
                params[n.search] = state.search;
            }

            return params;
        },
        parse: function (body, ctx) {
            if (!isPlainObject(body) || typeof body.success !== 'boolean') {
                throw ctx.error('invalid');
            }

            if (body.success !== true) {
                throw ctx.error('api', body.mensagem, body.errors);
            }

            var paging = body.meta && body.meta.paginacao;

            if (!Array.isArray(body.data) || !isPlainObject(paging) || typeof paging.total !== 'number' || !isFinite(paging.total) || paging.total < 0) {
                throw ctx.error('invalid');
            }

            var limit = toInt(paging.por_pagina, 0) > 0 ? toInt(paging.por_pagina, 0) : ctx.state.limit;
            var page = toInt(paging.pagina_atual, 0) > 0 ? toInt(paging.pagina_atual, 0) : ctx.state.page;

            return {
                rows: body.data,
                total: paging.total,
                page: page,
                limit: limit,
                totalPages: toInt(paging.total_paginas, -1) >= 0 ? toInt(paging.total_paginas, 0) : Math.ceil(paging.total / limit),
                message: typeof body.mensagem === 'string' ? body.mensagem : '',
                requestId: typeof body.request_id === 'string' ? body.request_id : ''
            };
        }
    };

    adapters.datatables = {
        names: {
            draw: 'draw', start: 'start', length: 'length',
            search: 'search_value', sort: 'order_col', direction: 'order_dir'
        },
        cacheExclude: ['draw'],
        params: function (state, ctx) {
            var n = ctx.names;
            var params = {};

            params[n.draw] = ctx.sequence;
            params[n.start] = (state.page - 1) * state.limit;
            params[n.length] = state.limit;

            if (state.search !== '') {
                params[n.search] = state.search;
            }

            if (state.sort) {
                params[n.sort] = state.sort;
                params[n.direction] = state.direction;
            }

            return params;
        },
        parse: function (body, ctx) {
            if (!isPlainObject(body)) {
                throw ctx.error('invalid');
            }

            if (typeof body.error === 'string' && body.error !== '') {
                throw ctx.error('api', body.error);
            }

            var filtered = Number(body.recordsFiltered);

            if (!Array.isArray(body.data) || body.recordsFiltered === null || body.recordsFiltered === '' || !isFinite(filtered) || filtered < 0) {
                throw ctx.error('invalid');
            }

            return {
                rows: body.data,
                total: filtered,
                totalAll: isFinite(Number(body.recordsTotal)) ? Number(body.recordsTotal) : filtered,
                page: ctx.state.page,
                limit: ctx.state.limit,
                totalPages: Math.ceil(filtered / ctx.state.limit),
                message: '',
                requestId: typeof body.request_id === 'string' ? body.request_id : ''
            };
        }
    };

    adapters.laravel = {
        names: { page: 'page', limit: 'limit', sort: 'sort', direction: 'direction', search: 'search' },
        cacheExclude: [],
        params: function (state, ctx) {
            return adapters.apiresponse.params(state, ctx);
        },
        parse: function (body, ctx) {
            if (!isPlainObject(body)) {
                throw ctx.error('invalid');
            }

            if (typeof body.success === 'boolean') {
                return adapters.apiresponse.parse(body, ctx);
            }

            var paging = isPlainObject(body.meta) && body.meta.total !== undefined ? body.meta : body;
            var total = Number(paging.total);

            if (!Array.isArray(body.data) || paging.total === null || paging.total === undefined || paging.total === '' || !isFinite(total) || total < 0) {
                throw ctx.error('invalid');
            }

            var limit = toInt(paging.per_page, 0) > 0 ? toInt(paging.per_page, 0) : ctx.state.limit;

            return {
                rows: body.data,
                total: total,
                page: toInt(paging.current_page, 0) > 0 ? toInt(paging.current_page, 0) : ctx.state.page,
                limit: limit,
                totalPages: toInt(paging.last_page, -1) >= 0 ? toInt(paging.last_page, 0) : Math.ceil(total / limit),
                message: typeof body.message === 'string' ? body.message : '',
                requestId: ''
            };
        }
    };

    function serialize(data) {
        var parts = [];

        function add(key, value) {
            if (typeof value === 'function') {
                return;
            }

            var v = value === null || value === undefined ? '' : String(value);

            parts.push(encodeURIComponent(key).replace(/%20/g, '+') + '=' + encodeURIComponent(v).replace(/%20/g, '+'));
        }

        function build(prefix, value) {
            if (Array.isArray(value)) {
                value.forEach(function (item, index) {
                    build(prefix + '[' + (item !== null && typeof item === 'object' ? index : '') + ']', item);
                });
            } else if (value !== null && typeof value === 'object') {
                Object.keys(value).forEach(function (key) {
                    build(prefix + '[' + key + ']', value[key]);
                });
            } else {
                add(prefix, value);
            }
        }

        if (data) {
            Object.keys(data).forEach(function (key) {
                build(key, data[key]);
            });
        }

        return parts.join('&');
    }

    function sameOrigin(url) {
        try {
            return new window.URL(url, window.location.href).origin === window.location.origin;
        } catch (e) {
            return true;
        }
    }

    function appendQuery(url, query) {
        if (!query) {
            return url;
        }

        var hash = '';
        var hashIndex = url.indexOf('#');

        if (hashIndex !== -1) {
            hash = url.slice(hashIndex);
            url = url.slice(0, hashIndex);
        }

        return url + (url.indexOf('?') === -1 ? '?' : '&') + query + hash;
    }

    function xhrTransport(request, done) {
        var xhr = new window.XMLHttpRequest();
        var finished = false;
        var method = request.method === 'POST' ? 'POST' : 'GET';
        var query = serialize(request.data);
        var url = method === 'GET' ? appendQuery(request.url, (query ? query + '&' : '') + '_=' + Date.now()) : request.url;
        var headers = extend({}, request.headers);

        function finish(result) {
            if (finished) {
                return;
            }

            finished = true;
            done(result);
        }

        function header(name) {
            try {
                return xhr.getResponseHeader(name) || '';
            } catch (e) {
                return '';
            }
        }

        xhr.open(method, url, true);

        if (sameOrigin(url) && !own(headers, 'X-Requested-With')) {
            headers['X-Requested-With'] = 'XMLHttpRequest';
        }

        if (!own(headers, 'Accept')) {
            headers.Accept = 'application/json, text/javascript, */*; q=0.01';
        }

        if (method === 'POST' && !own(headers, 'Content-Type')) {
            headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        }

        Object.keys(headers).forEach(function (name) {
            xhr.setRequestHeader(name, headers[name]);
        });

        if (request.timeout > 0) {
            xhr.timeout = request.timeout;
        }

        xhr.onload = function () {
            var status = xhr.status;
            var ok = (status >= 200 && status < 300) || status === 304;
            var text = xhr.responseText;
            var body;
            var parsed = false;

            if (text) {
                try {
                    body = JSON.parse(text);
                    parsed = true;
                } catch (e) {
                    body = undefined;
                }
            }

            finish({
                status: status,
                textStatus: ok ? (parsed ? 'success' : 'parsererror') : 'error',
                body: body,
                requestId: header('X-Request-Id')
            });
        };

        xhr.onerror = function () {
            finish({ status: 0, textStatus: 'error', body: undefined, requestId: '' });
        };

        xhr.ontimeout = function () {
            finish({ status: 0, textStatus: 'timeout', body: undefined, requestId: '' });
        };

        xhr.onabort = function () {
            finish({ status: 0, textStatus: 'abort', body: undefined, requestId: '' });
        };

        xhr.send(method === 'POST' ? query : null);

        return function () {
            if (!finished) {
                xhr.abort();
                finish({ status: 0, textStatus: 'abort', body: undefined, requestId: '' });
            }
        };
    }

    function dependencyError() {
        var $ = window.jQuery;

        if (!$ || !$.fn) {
            return 'jQuery não foi encontrado. Carregue nesta ordem: jQuery -> pagination.js -> hr-paginationjs.js.';
        }

        if (typeof $.fn.on !== 'function' || typeof $.fn.off !== 'function') {
            return 'o jQuery ' + ($.fn.jquery || '') + ' é antigo demais: o Pagination.js 2.6.0 exige jQuery 1.7 ou superior.';
        }

        if (typeof $.fn.pagination !== 'function') {
            return 'Pagination.js não foi encontrado. Carregue nesta ordem: jQuery -> pagination.js -> hr-paginationjs.js.';
        }

        return null;
    }

    function ConfigError(message) {
        this.name = 'HrPaginationjsError';
        this.message = 'hr-paginationjs: ' + message;
    }

    ConfigError.prototype = Object.create(Error.prototype);
    ConfigError.prototype.constructor = ConfigError;

    function showFatal(root, message) {
        for (var i = root.children.length - 1; i >= 0; i--) {
            if (root.children[i].classList.contains('hrpjs-fatal')) {
                root.removeChild(root.children[i]);
            }
        }

        var box = document.createElement('div');

        box.className = 'hrpjs-fatal';
        box.setAttribute('role', 'alert');
        box.textContent = message;
        root.insertBefore(box, root.firstChild);
    }

    function readConfig(root, options) {
        var o = options || {};
        var cfg = {};

        cfg.id = o.id || getAttr(root, 'id') || root.id || '';

        if (!cfg.id) {
            throw new ConfigError('defina um identificador estável com id="..." ou ' + attrName('id') + '="...".');
        }

        var remote = o.remote || getAttr(root, 'remote');

        cfg.remote = safeUrl(remote, 'request');

        if (!cfg.remote) {
            throw new ConfigError('"' + cfg.id + '": informe uma URL válida (http, https ou relativa) em ' + attrName('remote') + '.');
        }

        cfg.method = String(o.method || getAttr(root, 'method') || 'GET').toUpperCase();

        if (cfg.method !== 'GET' && cfg.method !== 'POST') {
            throw new ConfigError('"' + cfg.id + '": ' + attrName('method') + ' aceita somente GET ou POST.');
        }

        cfg.adapterName = String(o.adapter || getAttr(root, 'adapter') || 'apiresponse').toLowerCase();
        cfg.adapter = adapters[cfg.adapterName];

        if (!cfg.adapter) {
            throw new ConfigError('"' + cfg.id + '": adaptador "' + cfg.adapterName + '" não registrado.');
        }

        cfg.names = extend({}, cfg.adapter.names, parseJsonAttr(root, 'names', {}), o.names);
        cfg.limit = Math.max(1, toInt(o.limit !== undefined ? o.limit : getAttr(root, 'limit'), 20));
        cfg.limits = toList(o.limits || getAttr(root, 'limits')).map(function (v) {
            return toInt(v, 0);
        }).filter(function (v) {
            return v > 0;
        });

        if (!cfg.limits.length) {
            cfg.limits = [10, 20, 50, 100];
        }

        if (cfg.limits.indexOf(cfg.limit) === -1) {
            cfg.limits.push(cfg.limit);
        }

        cfg.limits.sort(function (a, b) {
            return a - b;
        });

        cfg.sort = o.sort !== undefined ? String(o.sort) : (getAttr(root, 'sort') || '');
        cfg.direction = normalizeDirection(o.direction || getAttr(root, 'direction')) || 'asc';
        cfg.debounce = Math.max(0, toInt(o.debounce !== undefined ? o.debounce : getAttr(root, 'debounce'), 400));
        cfg.minChars = Math.max(0, toInt(o.minChars !== undefined ? o.minChars : getAttr(root, 'min-chars'), 0));
        cfg.timeout = Math.max(0, toInt(o.timeout !== undefined ? o.timeout : getAttr(root, 'timeout'), 30000));
        cfg.params = extend({}, parseJsonAttr(root, 'params', {}), o.params);
        cfg.rowKey = o.rowKey || getAttr(root, 'row-key') || 'id';
        cfg.autoload = toBool(o.autoload !== undefined ? o.autoload : getAttr(root, 'autoload'), true);
        cfg.locale = o.locale || getAttr(root, 'locale') || document.documentElement.getAttribute('lang') || 'pt-BR';
        cfg.currency = o.currency || getAttr(root, 'currency') || 'BRL';
        cfg.toolbar = toList(o.toolbar || getAttr(root, 'toolbar'));
        cfg.headers = extend({}, o.headers);
        cfg.token = o.token || '';
        cfg.csrf = String(o.csrf || getAttr(root, 'csrf') || 'auto').toLowerCase() === 'header' ? 'header' : 'auto';
        cfg.transport = typeof o.transport === 'function' ? o.transport : xhrTransport;
        cfg.formatters = extend({}, o.formatters);

        var persistRaw = o.persist !== undefined ? o.persist : getAttr(root, 'persist');

        if (persistRaw === null || persistRaw === undefined || persistRaw === false || persistRaw === 'false') {
            cfg.persist = [];
        } else if (persistRaw === true || persistRaw === '' || persistRaw === 'true') {
            cfg.persist = ['columns', 'limit', 'sort'];
        } else {
            cfg.persist = toList(persistRaw).filter(function (v) {
                return ['columns', 'limit', 'sort', 'search', 'filters'].indexOf(v) !== -1;
            });
        }

        cfg.namespace = o.namespace || getAttr(root, 'namespace') || 'app';
        cfg.user = String(o.user !== undefined ? o.user : (getAttr(root, 'user') || 'anon'));
        cfg.version = Math.max(1, toInt(o.version !== undefined ? o.version : getAttr(root, 'version'), 1));
        cfg.storageKey = 'hrpaginationjs:' + cfg.namespace + ':' + cfg.user + ':' + cfg.id + ':v' + cfg.version;

        cfg.url = toBool(o.url !== undefined ? o.url : getAttr(root, 'url'), false);
        cfg.urlPrefix = o.urlPrefix !== undefined ? String(o.urlPrefix) : (getAttr(root, 'url-prefix') !== null ? getAttr(root, 'url-prefix') : String(cfg.id).replace(/[^a-zA-Z0-9_]/g, '_') + '_');
        cfg.urlHistory = String(o.urlHistory || getAttr(root, 'url-history') || 'replace') === 'push' ? 'push' : 'replace';

        cfg.cacheTtl = Math.max(0, toInt(o.cache !== undefined ? o.cache : getAttr(root, 'cache'), 0)) * 1000;
        cfg.cacheMax = Math.max(1, toInt(o.cacheMax !== undefined ? o.cacheMax : getAttr(root, 'cache-max'), 20));

        cfg.pageRange = toInt(getAttr(root, 'page-range'), 2);
        cfg.paginationOptions = extend({}, parseJsonAttr(root, 'options', {}), o.paginationOptions);

        var texts = extend({}, TEXTS);

        for (var i = 0; i < root.attributes.length; i++) {
            var a = root.attributes[i];

            if (a.name.indexOf(P + '-text-') === 0) {
                texts[camel(a.name.slice((P + '-text-').length))] = a.value;
            }
        }

        cfg.texts = extend(texts, o.texts);

        return cfg;
    }

    function readColumns(table, cfgId) {
        var head = table.tHead;

        if (!head || !head.rows.length) {
            throw new ConfigError('"' + cfgId + '": a tabela precisa de <thead> com um <th> por coluna.');
        }

        var cells = head.rows[head.rows.length - 1].cells;
        var columns = [];
        var keys = {};

        for (var i = 0; i < cells.length; i++) {
            var th = cells[i];
            var field = getAttr(th, 'field');
            var key = getAttr(th, 'key') || field;

            if (!key) {
                throw new ConfigError('"' + cfgId + '": o <th> "' + th.textContent.trim() + '" precisa de ' + attrName('key') + ' (identificador estável da coluna).');
            }

            if (keys[key]) {
                throw new ConfigError('"' + cfgId + '": a chave de coluna "' + key + '" está repetida.');
            }

            keys[key] = true;

            var templateId = getAttr(th, 'template');
            var template = null;

            if (templateId) {
                template = document.getElementById(templateId);

                if (!template || template.tagName.toLowerCase() !== 'template') {
                    throw new ConfigError('"' + cfgId + '": a coluna "' + key + '" aponta para o <template id="' + templateId + '">, que não existe.');
                }
            }

            var required = hasAttr(th, 'required') && toBool(getAttr(th, 'required'), true);
            var align = String(getAttr(th, 'align') || '').toLowerCase();

            columns.push({
                key: key,
                field: field || key,
                label: getAttr(th, 'label') || th.textContent.replace(/\s+/g, ' ').trim() || key,
                th: th,
                sortable: hasAttr(th, 'sortable') && toBool(getAttr(th, 'sortable'), true),
                sortFirst: normalizeDirection(getAttr(th, 'sort-first')) || 'asc',
                required: required,
                visibleDefault: required || !(hasAttr(th, 'hidden') && toBool(getAttr(th, 'hidden'), true)),
                actions: hasAttr(th, 'actions') && toBool(getAttr(th, 'actions'), true),
                format: getAttr(th, 'format'),
                template: template,
                align: ['left', 'center', 'right'].indexOf(align) !== -1 ? align : '',
                width: getAttr(th, 'width'),
                defaultValue: getAttr(th, 'default') !== null ? getAttr(th, 'default') : '',
                className: getAttr(th, 'class') || ''
            });
        }

        if (!columns.length) {
            throw new ConfigError('"' + cfgId + '": nenhuma coluna declarada no <thead>.');
        }

        return columns;
    }

    function createInstance(root, options) {
        var $ = window.jQuery;
        var cfg = readConfig(root, options);
        var table = root.querySelector('table[' + attrName('table') + ']') || root.querySelector('table');

        if (!table) {
            throw new ConfigError('"' + cfg.id + '": coloque uma <table> com <thead> dentro do elemento ' + attrName('') + '.');
        }

        var columns = readColumns(table, cfg.id);
        var columnMap = {};

        columns.forEach(function (c) {
            columnMap[c.key] = c;
        });

        var uid = ++uidCounter;
        var destroyed = false;
        var seq = 0;
        var settledSeq = 0;
        var currentAbort = null;
        var waiters = [];
        var timers = {};
        var listeners = [];
        var created = [];
        var restorers = [];
        var cache = [];
        var composing = false;
        var pagerReady = false;
        var hasRendered = false;
        var api;

        var state = {
            page: 1,
            limit: cfg.limit,
            search: '',
            filters: {},
            sort: '',
            direction: cfg.direction,
            visible: {},
            loading: false,
            error: null,
            total: 0,
            totalAll: 0,
            totalPages: 0,
            rows: [],
            requestId: '',
            message: ''
        };

        var base = null;

        function listen(target, type, handler, capture) {
            target.addEventListener(type, handler, !!capture);
            listeners.push([target, type, handler, !!capture]);
        }

        function setTimer(name, fn, ms) {
            clearTimer(name);
            timers[name] = window.setTimeout(function () {
                delete timers[name];
                fn();
            }, ms);
        }

        function clearTimer(name) {
            if (timers[name]) {
                window.clearTimeout(timers[name]);
                delete timers[name];
            }
        }

        function el(tag, className, text) {
            var node = document.createElement(tag);

            if (className) {
                node.className = className;
            }

            if (text !== undefined && text !== null) {
                node.textContent = text;
            }

            return node;
        }

        function track(node) {
            created.push(node);

            return node;
        }

        function forScopes() {
            var list = [];
            var ids = [cfg.id];

            if (root.id && root.id !== cfg.id) {
                ids.push(root.id);
            }

            ids.forEach(function (id) {
                var found = document.querySelectorAll('[' + attrName('for') + '="' + cssEscape(id) + '"]');

                for (var i = 0; i < found.length; i++) {
                    if (list.indexOf(found[i]) === -1 && !root.contains(found[i])) {
                        list.push(found[i]);
                    }
                }
            });

            return list;
        }

        function owns(node) {
            if (!node || !node.closest) {
                return false;
            }

            var forScope = node.closest('[' + attrName('for') + ']');

            if (forScope) {
                var value = forScope.getAttribute(attrName('for'));

                return value === cfg.id || (!!root.id && value === root.id);
            }

            return node.closest('[' + P + ']') === root;
        }

        function query(selector) {
            var result = [];
            var scopes = [root].concat(forScopes());

            scopes.forEach(function (scope) {
                if (scope !== root && scope.matches(selector)) {
                    result.push(scope);
                }

                var found = scope.querySelectorAll(selector);

                for (var i = 0; i < found.length; i++) {
                    if (result.indexOf(found[i]) === -1 && owns(found[i])) {
                        result.push(found[i]);
                    }
                }
            });

            return result;
        }

        var tbody = table.tBodies.length ? table.tBodies[0] : null;
        var createdTbody = false;
        var originalBody = [];

        if (tbody) {
            for (var ob = 0; ob < tbody.childNodes.length; ob++) {
                originalBody.push(tbody.childNodes[ob]);
            }
        } else {
            tbody = document.createElement('tbody');
            table.appendChild(tbody);
            createdTbody = true;
        }

        var hadRootClass = root.classList.contains('hrpjs');
        var hadTableClass = table.classList.contains('hrpjs-table');

        root.classList.add('hrpjs');
        table.classList.add('hrpjs-table');
        tbody.classList.add('hrpjs-body');

        var live = track(el('div', 'hrpjs-live'));

        live.setAttribute('role', 'status');
        live.setAttribute('aria-live', 'polite');
        live.setAttribute('aria-atomic', 'true');
        root.appendChild(live);

        function blockOf(node) {
            var current = node;

            while (current.parentNode && current.parentNode !== root) {
                current = current.parentNode;
            }

            return current.parentNode === root ? current : node;
        }

        function buildToolbar() {
            if (!cfg.toolbar.length) {
                return;
            }

            var bar = track(el('div', 'hrpjs-toolbar'));

            cfg.toolbar.forEach(function (item) {
                var wrap;
                var id = 'hrpjs-' + uid + '-' + item;

                if (item === 'search') {
                    wrap = el('div', 'hrpjs-field hrpjs-field--search');

                    var label = el('label', 'hrpjs-label', cfg.texts.search);
                    var input = el('input', 'hrpjs-input');

                    label.setAttribute('for', id);
                    input.type = 'search';
                    input.id = id;
                    input.setAttribute(attrName('search'), '');
                    input.setAttribute('autocomplete', 'off');

                    if (cfg.texts.searchPlaceholder) {
                        input.setAttribute('placeholder', cfg.texts.searchPlaceholder);
                    }

                    wrap.appendChild(label);
                    wrap.appendChild(input);
                } else if (item === 'limit') {
                    wrap = el('div', 'hrpjs-field hrpjs-field--limit');

                    var limitLabel = el('label', 'hrpjs-label', cfg.texts.limit);
                    var select = el('select', 'hrpjs-select');

                    limitLabel.setAttribute('for', id);
                    select.id = id;
                    select.setAttribute(attrName('page-size'), '');
                    wrap.appendChild(limitLabel);
                    wrap.appendChild(select);
                } else if (item === 'columns') {
                    wrap = el('div', 'hrpjs-field hrpjs-field--columns');
                    wrap.setAttribute(attrName('columns'), '');
                } else if (item === 'reload') {
                    wrap = el('button', 'hrpjs-button', cfg.texts.reload);
                    wrap.type = 'button';
                    wrap.setAttribute(attrName('reload'), '');
                } else if (item === 'clear') {
                    wrap = el('button', 'hrpjs-button', cfg.texts.clear);
                    wrap.type = 'button';
                    wrap.setAttribute(attrName('clear'), 'all');
                } else {
                    warn('item de toolbar desconhecido: "' + item + '" (use search, limit, columns, reload, clear).');

                    return;
                }

                bar.appendChild(wrap);
            });

            root.insertBefore(bar, root.firstChild);
        }

        buildToolbar();

        var tableBlock = blockOf(table);
        var footer = track(el('div', 'hrpjs-footer'));
        var notice = el('div', 'hrpjs-notice');

        notice.hidden = true;
        footer.appendChild(notice);

        var summaries = query('[' + attrName('summary') + ']');

        if (!summaries.length) {
            var autoSummary = el('div', 'hrpjs-summary');

            autoSummary.setAttribute(attrName('summary'), '');
            footer.appendChild(autoSummary);
        }

        var pagerHosts = query('[' + attrName('pager') + ']');
        var pager = el('div', 'hrpjs-pager');

        pager.setAttribute('role', 'navigation');
        pager.setAttribute('aria-label', cfg.texts.pagination);
        pager.hidden = true;

        if (pagerHosts.length) {
            pagerHosts[0].appendChild(track(pager));
        } else {
            footer.appendChild(pager);
        }

        tableBlock.parentNode.insertBefore(footer, tableBlock.nextSibling);

        columns.forEach(function (col) {
            var th = col.th;
            var hadHidden = th.hidden;
            var oldWidth = th.style.width;

            if (col.width) {
                th.style.width = col.width;
            }

            if (col.align) {
                th.classList.add('hrpjs-align-' + col.align);
            }

            th.setAttribute('scope', th.getAttribute('scope') || 'col');

            if (col.sortable) {
                var button = el('button', 'hrpjs-sort');
                var icon = el('span', 'hrpjs-sort-icon');

                button.type = 'button';
                button.setAttribute(attrName('sort-key'), col.key);
                icon.setAttribute('aria-hidden', 'true');

                while (th.firstChild) {
                    button.appendChild(th.firstChild);
                }

                button.appendChild(icon);
                th.appendChild(button);
                col.sortButton = button;
                col.sortIcon = icon;
            }

            restorers.push(function () {
                if (col.sortButton) {
                    if (col.sortIcon.parentNode) {
                        col.sortIcon.parentNode.removeChild(col.sortIcon);
                    }

                    while (col.sortButton.firstChild) {
                        th.insertBefore(col.sortButton.firstChild, col.sortButton);
                    }

                    th.removeChild(col.sortButton);
                }

                th.hidden = hadHidden;
                th.style.width = oldWidth;
                th.removeAttribute('aria-sort');
                th.classList.remove('hrpjs-align-' + col.align, 'hrpjs-sorted-asc', 'hrpjs-sorted-desc');
            });
        });

        function isDataColumn(col) {
            return !col.actions;
        }

        function visibleKeys() {
            return columns.filter(function (c) {
                return state.visible[c.key];
            }).map(function (c) {
                return c.key;
            });
        }

        function visibleCount() {
            return visibleKeys().length || 1;
        }

        function defaultVisibility() {
            var visible = {};

            columns.forEach(function (c) {
                visible[c.key] = c.visibleDefault;
            });

            return ensureMinimum(visible);
        }

        function ensureMinimum(visible) {
            var anyData = columns.some(function (c) {
                return isDataColumn(c) && visible[c.key];
            });

            if (!anyData) {
                var first = columns.filter(isDataColumn)[0] || columns[0];

                visible[first.key] = true;
            }

            columns.forEach(function (c) {
                if (c.required) {
                    visible[c.key] = true;
                }
            });

            return visible;
        }

        function canHide(col) {
            if (col.required) {
                return false;
            }

            if (!isDataColumn(col)) {
                return true;
            }

            return columns.some(function (c) {
                return c !== col && isDataColumn(c) && state.visible[c.key];
            });
        }

        function getStorage() {
            try {
                var s = window.localStorage;
                var k = '__hrpaginationjs__';

                s.setItem(k, k);
                s.removeItem(k);

                return s;
            } catch (e) {
                return null;
            }
        }

        function loadPrefs() {
            if (!cfg.persist.length) {
                return {};
            }

            var storage = getStorage();

            if (!storage) {
                return {};
            }

            var raw;

            try {
                raw = storage.getItem(cfg.storageKey);
            } catch (e) {
                return {};
            }

            if (!raw) {
                return {};
            }

            try {
                var parsed = JSON.parse(raw);

                if (isPlainObject(parsed)) {
                    return parsed;
                }
            } catch (e) {
                warn('preferências corrompidas em "' + cfg.storageKey + '" foram descartadas.');
            }

            try {
                storage.removeItem(cfg.storageKey);
            } catch (e) {
                return {};
            }

            return {};
        }

        function savePrefs() {
            if (!cfg.persist.length) {
                return;
            }

            var storage = getStorage();

            if (!storage) {
                return;
            }

            var data = { saved: Date.now() };

            if (cfg.persist.indexOf('columns') !== -1) {
                data.columns = {};
                columns.forEach(function (c) {
                    if (!c.required) {
                        data.columns[c.key] = !!state.visible[c.key];
                    }
                });
            }

            if (cfg.persist.indexOf('limit') !== -1) {
                data.limit = state.limit;
            }

            if (cfg.persist.indexOf('sort') !== -1) {
                data.sort = state.sort;
                data.direction = state.direction;
            }

            if (cfg.persist.indexOf('search') !== -1) {
                data.search = state.search;
            }

            if (cfg.persist.indexOf('filters') !== -1) {
                data.filters = clone(state.filters);
            }

            try {
                storage.setItem(cfg.storageKey, JSON.stringify(data));
            } catch (e) {
                return;
            }
        }

        function removePrefs() {
            var storage = getStorage();

            if (!storage) {
                return;
            }

            try {
                storage.removeItem(cfg.storageKey);
            } catch (e) {
                return;
            }
        }

        function validSort(key) {
            return !!(key && columnMap[key] && columnMap[key].sortable);
        }

        function sanitizeFilters(input) {
            var out = {};

            if (!isPlainObject(input)) {
                return out;
            }

            Object.keys(input).forEach(function (name) {
                var value = normalizeFilterValue(input[name], filterType(name));

                if (value !== undefined) {
                    out[name] = value;
                }
            });

            return out;
        }

        function applyPrefs(target, prefs) {
            if (cfg.persist.indexOf('columns') !== -1 && isPlainObject(prefs.columns)) {
                columns.forEach(function (c) {
                    if (!c.required && typeof prefs.columns[c.key] === 'boolean') {
                        target.visible[c.key] = prefs.columns[c.key];
                    }
                });
                target.visible = ensureMinimum(target.visible);
            }

            if (cfg.persist.indexOf('limit') !== -1 && cfg.limits.indexOf(toInt(prefs.limit, 0)) !== -1) {
                target.limit = toInt(prefs.limit, cfg.limit);
            }

            if (cfg.persist.indexOf('sort') !== -1 && own(prefs, 'sort')) {
                if (prefs.sort === '' || validSort(prefs.sort)) {
                    target.sort = prefs.sort;
                    target.direction = normalizeDirection(prefs.direction) || target.direction;
                }
            }

            if (cfg.persist.indexOf('search') !== -1 && typeof prefs.search === 'string') {
                target.search = prefs.search.trim();
            }

            if (cfg.persist.indexOf('filters') !== -1 && isPlainObject(prefs.filters)) {
                target.filters = sanitizeFilters(prefs.filters);
            }
        }

        function readUrl() {
            var result = {};

            if (!cfg.url || !window.URLSearchParams) {
                return result;
            }

            var params = new window.URLSearchParams(window.location.search);
            var p = cfg.urlPrefix;
            var page = toInt(params.get(p + 'page'), 0);
            var limit = toInt(params.get(p + 'limit'), 0);
            var sort = params.get(p + 'sort');
            var direction = normalizeDirection(params.get(p + 'direction'));
            var search = params.get(p + 'search');

            if (page >= 1) {
                result.page = page;
            }

            if (limit >= 1) {
                result.limit = limit;
            }

            if (sort !== null && (sort === '' || validSort(sort))) {
                result.sort = sort;
            }

            if (direction) {
                result.direction = direction;
            }

            if (search !== null) {
                result.search = search.trim();
            }

            var filters = {};
            var found = false;

            params.forEach(function (value, key) {
                if (key.indexOf(p + 'f_') === 0) {
                    found = true;

                    var name = key.slice((p + 'f_').length);
                    var all = params.getAll(key);

                    filters[name] = all.length > 1 || filterIsMultiple(name) ? all : all[0];
                }
            });

            if (found) {
                result.filters = sanitizeFilters(filters);
            }

            return result;
        }

        function writeUrl(initial) {
            if (!cfg.url || !window.URLSearchParams || !window.history || !window.history.replaceState) {
                return;
            }

            var params = new window.URLSearchParams(window.location.search);
            var p = cfg.urlPrefix;
            var remove = [];

            params.forEach(function (value, key) {
                if (key.indexOf(p) === 0) {
                    remove.push(key);
                }
            });

            remove.forEach(function (key) {
                params.delete(key);
            });

            if (state.page !== 1) {
                params.set(p + 'page', String(state.page));
            }

            if (state.limit !== base.limit) {
                params.set(p + 'limit', String(state.limit));
            }

            if (state.sort !== base.sort || state.direction !== base.direction) {
                params.set(p + 'sort', state.sort);
                params.set(p + 'direction', state.direction);
            }

            if (state.search !== '') {
                params.set(p + 'search', state.search);
            }

            Object.keys(state.filters).sort().forEach(function (name) {
                var value = state.filters[name];

                (Array.isArray(value) ? value : [value]).forEach(function (v) {
                    params.append(p + 'f_' + name, String(v));
                });
            });

            var qs = params.toString();
            var next = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash;
            var current = window.location.pathname + window.location.search + window.location.hash;

            if (next === current) {
                return;
            }

            if (cfg.urlHistory === 'push' && !initial) {
                window.history.pushState({ hrpaginationjs: cfg.id }, '', next);
            } else {
                window.history.replaceState(window.history.state, '', next);
            }
        }

        function searchInputs() {
            return query('[' + attrName('search') + ']');
        }

        function isFilterControl(node) {
            if (!node || !node.matches || !node.name || hasAttr(node, 'search') || hasAttr(node, 'ignore')) {
                return false;
            }

            if (/^(button|submit|reset|image|file)$/i.test(node.type || '')) {
                return false;
            }

            if (hasAttr(node, 'filter')) {
                return true;
            }

            var form = node.closest('form[' + attrName('filters') + ']');

            return !!form && /^(input|select|textarea)$/i.test(node.tagName);
        }

        function filterControls() {
            var list = query('[' + attrName('filter') + ']');

            query('form[' + attrName('filters') + ']').forEach(function (form) {
                var fields = form.querySelectorAll('input[name], select[name], textarea[name]');

                for (var i = 0; i < fields.length; i++) {
                    if (list.indexOf(fields[i]) === -1 && isFilterControl(fields[i])) {
                        list.push(fields[i]);
                    }
                }
            });

            return list.filter(isFilterControl);
        }

        function filterName(node) {
            return String(node.name).replace(/\[\]$/, '');
        }

        function controlsByName() {
            var groups = {};

            filterControls().forEach(function (node) {
                var name = filterName(node);

                (groups[name] = groups[name] || []).push(node);
            });

            return groups;
        }

        function filterType(name) {
            var group = controlsByName()[name];

            if (!group) {
                return 'text';
            }

            for (var i = 0; i < group.length; i++) {
                var t = getAttr(group[i], 'type');

                if (t) {
                    return String(t).toLowerCase();
                }
            }

            var first = group[0];

            if (first.type === 'number') {
                return 'number';
            }

            if (first.type === 'date') {
                return 'date';
            }

            return 'text';
        }

        function filterIsMultiple(name) {
            var group = controlsByName()[name];

            if (!group) {
                return false;
            }

            var checkboxes = group.filter(function (n) {
                return n.type === 'checkbox';
            });

            return group.some(function (n) {
                return n.multiple || /\[\]$/.test(n.name);
            }) || checkboxes.length > 1;
        }

        function readFilterControls() {
            var groups = controlsByName();
            var result = {};

            Object.keys(groups).forEach(function (name) {
                var group = groups[name];
                var type = filterType(name);
                var value;

                if (group[0].type === 'checkbox') {
                    var checked = group.filter(function (n) {
                        return n.checked;
                    }).map(function (n) {
                        return n.value && n.value !== 'on' ? n.value : '1';
                    });

                    value = filterIsMultiple(name) ? checked : (checked.length ? checked[0] : '');
                } else if (group[0].type === 'radio') {
                    var radio = group.filter(function (n) {
                        return n.checked;
                    })[0];

                    value = radio ? radio.value : '';
                } else if (group[0].tagName.toLowerCase() === 'select' && group[0].multiple) {
                    value = [];

                    for (var i = 0; i < group[0].options.length; i++) {
                        if (group[0].options[i].selected) {
                            value.push(group[0].options[i].value);
                        }
                    }
                } else {
                    value = group[0].value;
                }

                var normalized = normalizeFilterValue(value, type);

                if (normalized !== undefined) {
                    result[name] = normalized;
                }
            });

            return result;
        }

        function writeFilterControls() {
            var groups = controlsByName();

            Object.keys(groups).forEach(function (name) {
                var value = state.filters[name];
                var values = value === undefined ? [] : (Array.isArray(value) ? value : [value]).map(String);

                groups[name].forEach(function (node) {
                    if (node.type === 'checkbox' || node.type === 'radio') {
                        var optionValue = node.value && node.value !== 'on' ? node.value : '1';

                        node.checked = values.indexOf(optionValue) !== -1;
                    } else if (node.tagName.toLowerCase() === 'select' && node.multiple) {
                        for (var i = 0; i < node.options.length; i++) {
                            node.options[i].selected = values.indexOf(node.options[i].value) !== -1;
                        }
                    } else {
                        node.value = values.length ? values[0] : '';
                    }
                });
            });
        }

        function writeSearchControls() {
            searchInputs().forEach(function (input) {
                if (input.value.trim() !== state.search) {
                    input.value = state.search;
                }
            });
        }

        function limitSelects() {
            return query('select[' + attrName('page-size') + ']');
        }

        var addedOptions = [];

        function writeLimitControls() {
            limitSelects().forEach(function (select) {
                if (!select.options.length) {
                    cfg.limits.forEach(function (n) {
                        var option = el('option', '', String(n));

                        option.value = String(n);
                        select.appendChild(option);
                        addedOptions.push(option);
                    });
                }

                var exists = false;

                for (var i = 0; i < select.options.length; i++) {
                    if (toInt(select.options[i].value, 0) === state.limit) {
                        exists = true;
                    }
                }

                if (!exists) {
                    var extra = el('option', '', String(state.limit));

                    extra.value = String(state.limit);
                    select.appendChild(extra);
                    addedOptions.push(extra);
                }

                select.value = String(state.limit);
            });
        }

        var pickers = [];

        function buildPickers() {
            query('[' + attrName('columns') + ']').forEach(function (host) {
                var details = el('details', 'hrpjs-columns');
                var summary = el('summary', 'hrpjs-columns-toggle', cfg.texts.columns);
                var panel = el('div', 'hrpjs-columns-panel');
                var list = el('div', 'hrpjs-columns-list');

                list.setAttribute('role', 'group');
                list.setAttribute('aria-label', cfg.texts.columns);

                columns.forEach(function (col) {
                    var label = el('label', 'hrpjs-columns-item');
                    var box = el('input');

                    box.type = 'checkbox';
                    box.value = col.key;
                    box.setAttribute(attrName('column-toggle'), col.key);

                    if (col.required) {
                        box.disabled = true;
                        box.checked = true;
                        label.title = cfg.texts.columnRequired;
                    }

                    label.appendChild(box);
                    label.appendChild(document.createTextNode(' ' + col.label));
                    list.appendChild(label);
                });

                var reset = el('button', 'hrpjs-button hrpjs-columns-reset', cfg.texts.columnsReset);

                reset.type = 'button';
                reset.setAttribute(attrName('columns-reset'), '');
                panel.appendChild(list);
                panel.appendChild(reset);
                details.appendChild(summary);
                details.appendChild(panel);
                host.appendChild(details);
                pickers.push(details);
            });
        }

        function updatePickers() {
            pickers.forEach(function (details) {
                var boxes = details.querySelectorAll('input[' + attrName('column-toggle') + ']');

                for (var i = 0; i < boxes.length; i++) {
                    var col = columnMap[boxes[i].value];

                    boxes[i].checked = !!state.visible[col.key];
                    boxes[i].disabled = col.required || (state.visible[col.key] && !canHide(col));
                }
            });
        }

        function applyVisibility() {
            columns.forEach(function (col, index) {
                var hidden = !state.visible[col.key];

                col.th.hidden = hidden;

                for (var r = 0; r < tbody.rows.length; r++) {
                    var row = tbody.rows[r];

                    if (row.classList.contains('hrpjs-message-row')) {
                        continue;
                    }

                    if (row.cells[index]) {
                        row.cells[index].hidden = hidden;
                    }
                }
            });

            var messageCells = tbody.querySelectorAll('.hrpjs-message-row > td');

            for (var i = 0; i < messageCells.length; i++) {
                messageCells[i].colSpan = visibleCount();
            }

            updatePickers();
        }

        function updateSortUi() {
            columns.forEach(function (col) {
                if (!col.sortable) {
                    return;
                }

                var active = state.sort === col.key;

                col.th.classList.toggle('hrpjs-sorted-asc', active && state.direction === 'asc');
                col.th.classList.toggle('hrpjs-sorted-desc', active && state.direction === 'desc');

                if (active) {
                    col.th.setAttribute('aria-sort', state.direction === 'asc' ? 'ascending' : 'descending');
                    col.sortIcon.textContent = state.direction === 'asc' ? '▲' : '▼';
                } else {
                    col.th.removeAttribute('aria-sort');
                    col.sortIcon.textContent = '↕';
                }
            });
        }

        function announce(text) {
            live.textContent = '';

            if (!text) {
                return;
            }

            setTimer('announce', function () {
                live.textContent = text;
            }, 60);
        }

        function showNotice(text, isError) {
            notice.textContent = text;
            notice.classList.toggle('hrpjs-notice--error', !!isError);
            notice.hidden = !text;
            announce(text);
            setTimer('notice', function () {
                notice.hidden = true;
                notice.textContent = '';
            }, isError ? 10000 : 5000);
        }

        function messageRow(kind, text, extra) {
            var tr = el('tr', 'hrpjs-message-row');
            var td = el('td');
            var box = el('div', 'hrpjs-message hrpjs-message--' + kind);

            td.colSpan = visibleCount();

            if (text) {
                box.appendChild(el('p', 'hrpjs-message-text', text));
            }

            (extra || []).forEach(function (node) {
                box.appendChild(node);
            });

            td.appendChild(box);
            tr.appendChild(td);
            tbody.textContent = '';
            tbody.appendChild(tr);
        }

        function formatterContext(col) {
            return {
                key: col.key,
                field: col.field,
                label: col.label,
                th: col.th,
                locale: cfg.locale,
                currency: cfg.currency,
                texts: cfg.texts,
                html: html
            };
        }

        function getFormatter(name) {
            if (!name) {
                return null;
            }

            var fn = cfg.formatters[name] || formatters[name];

            if (typeof fn !== 'function') {
                warn('formatador "' + name + '" não registrado; o valor será exibido como texto.');

                return null;
            }

            return fn;
        }

        function outputToText(out) {
            if (out === null || out === undefined) {
                return '';
            }

            if (out instanceof HtmlString) {
                return out.value;
            }

            if (out && typeof out === 'object' && out.nodeType) {
                return out.textContent;
            }

            return String(out);
        }

        function placeholderValue(row, expression) {
            var parts = expression.split('|');
            var value = getPath(row, parts[0].trim());

            if (parts.length > 1) {
                var fn = getFormatter(parts[1].trim());

                if (fn) {
                    try {
                        return outputToText(fn(value, row, { key: parts[0], field: parts[0], label: '', th: null, locale: cfg.locale, currency: cfg.currency, texts: cfg.texts, html: html }));
                    } catch (e) {
                        warn('o formatador "' + parts[1].trim() + '" falhou.');

                        return '';
                    }
                }
            }

            if (value === null || value === undefined || typeof value === 'object') {
                return '';
            }

            return String(value);
        }

        function fillRow(text, row) {
            return String(text).replace(/\{([a-zA-Z0-9_$.\-]+(?:\|[a-zA-Z0-9_\-]+)?)\}/g, function (m, expression) {
                return placeholderValue(row, expression);
            });
        }

        function evaluateCondition(expression, row) {
            var expr = String(expression).trim();
            var negate = expr.charAt(0) === '!';

            if (negate) {
                expr = expr.slice(1).trim();
            }

            var result;
            var m = /^([a-zA-Z0-9_$.\-]+)\s*(!=|=)\s*(.*)$/.exec(expr);

            if (m) {
                var value = getPath(row, m[1]);
                var equals = String(value === null || value === undefined ? '' : value) === m[3].trim();

                result = m[2] === '=' ? equals : !equals;
            } else {
                var v = getPath(row, expr);

                result = !(v === null || v === undefined || v === '' || v === false || v === 0 || v === '0' || (Array.isArray(v) && !v.length));
            }

            return negate ? !result : result;
        }

        function renderTemplate(template, row) {
            var fragment = template.content.cloneNode(true);
            var conditional = fragment.querySelectorAll('[' + attrName('if') + ']');

            for (var c = 0; c < conditional.length; c++) {
                var node = conditional[c];

                if (!evaluateCondition(node.getAttribute(attrName('if')), row)) {
                    if (node.parentNode) {
                        node.parentNode.removeChild(node);
                    }
                } else {
                    node.removeAttribute(attrName('if'));
                }
            }

            var walker = document.createTreeWalker(fragment, 1 | 4, null, false);
            var nodes = [];

            while (walker.nextNode()) {
                nodes.push(walker.currentNode);
            }

            nodes.forEach(function (node) {
                if (node.nodeType === 3) {
                    if (node.nodeValue.indexOf('{') !== -1) {
                        node.nodeValue = fillRow(node.nodeValue, row);
                    }

                    return;
                }

                var attrs = [];

                for (var i = 0; i < node.attributes.length; i++) {
                    attrs.push(node.attributes[i]);
                }

                attrs.forEach(function (a) {
                    if (a.value.indexOf('{') === -1) {
                        return;
                    }

                    var name = a.name.toLowerCase();

                    if (name.indexOf('on') === 0 || name === 'style' || name === 'srcdoc') {
                        node.removeAttribute(a.name);

                        return;
                    }

                    var value = fillRow(a.value, row);

                    if (URL_ATTRIBUTES.indexOf(name) !== -1) {
                        var url = safeUrl(value, 'link');

                        if (url === null) {
                            node.removeAttribute(a.name);

                            return;
                        }

                        value = url;
                    }

                    node.setAttribute(a.name, value);
                });
            });

            return fragment;
        }

        function renderCell(col, row) {
            var td = el('td');

            td.setAttribute(attrName('cell'), col.key);
            td.setAttribute('data-label', col.label);

            if (col.align) {
                td.classList.add('hrpjs-align-' + col.align);
            }

            if (col.className) {
                col.className.split(/\s+/).forEach(function (c) {
                    if (c) {
                        td.classList.add(c);
                    }
                });
            }

            if (col.template) {
                td.appendChild(renderTemplate(col.template, row));

                return td;
            }

            var value = getPath(row, col.field);
            var fn = getFormatter(col.format);
            var out = value;

            if (fn) {
                try {
                    out = fn(value, row, formatterContext(col));
                } catch (e) {
                    warn('o formatador "' + col.format + '" falhou na coluna "' + col.key + '".');
                    out = null;
                }
            }

            if (out instanceof HtmlString) {
                td.innerHTML = out.value;
            } else if (out && typeof out === 'object' && out.nodeType) {
                td.appendChild(out);
            } else if (out === null || out === undefined || out === '' || typeof out === 'object') {
                td.textContent = col.defaultValue;
            } else {
                td.textContent = String(out);
            }

            return td;
        }

        function renderRows() {
            var fragment = document.createDocumentFragment();

            state.rows.forEach(function (row, index) {
                var tr = el('tr');
                var key = getPath(row, cfg.rowKey);

                tr.setAttribute(attrName('row-index'), String(index));

                if (key !== undefined && key !== null && typeof key !== 'object') {
                    tr.setAttribute(attrName('row-key'), String(key));
                }

                columns.forEach(function (col) {
                    var td = renderCell(col, isPlainObject(row) ? row : {});

                    td.hidden = !state.visible[col.key];
                    tr.appendChild(td);
                });

                fragment.appendChild(tr);
            });

            tbody.textContent = '';
            tbody.appendChild(fragment);
        }

        function renderSummary() {
            var text;

            if (state.total > 0 && state.rows.length) {
                var start = (state.page - 1) * state.limit + 1;

                text = fill(cfg.texts.summary, {
                    start: start,
                    end: start + state.rows.length - 1,
                    total: state.total,
                    page: state.page,
                    pages: state.totalPages
                });
            } else {
                text = cfg.texts.summaryEmpty;
            }

            query('[' + attrName('summary') + ']').forEach(function (node) {
                node.textContent = text;
            });

            return text;
        }

        function clearSummary(text) {
            query('[' + attrName('summary') + ']').forEach(function (node) {
                node.textContent = text || '';
            });
        }

        function rememberPagerFocus() {
            var active = document.activeElement;

            if (!active || !pager.contains(active)) {
                return null;
            }

            var li = active.closest('li');

            if (!li) {
                return { type: 'other' };
            }

            if (li.classList.contains('paginationjs-prev')) {
                return { type: 'prev' };
            }

            if (li.classList.contains('paginationjs-next')) {
                return { type: 'next' };
            }

            return { type: 'page' };
        }

        function restorePagerFocus(memory) {
            if (!memory) {
                return;
            }

            var target = null;

            if (memory.type === 'prev') {
                target = pager.querySelector('.J-paginationjs-previous a');
            } else if (memory.type === 'next') {
                target = pager.querySelector('.J-paginationjs-next a');
            }

            if (!target) {
                target = pager.querySelector('a[aria-current="page"]') || pager.querySelector('a[tabindex="0"]');
            }

            if (target) {
                target.focus();
            }
        }

        function enhancePager(paginationOptions) {
            var activeClass = paginationOptions.activeClassName || 'active';
            var disabledClass = paginationOptions.disableClassName || 'disabled';
            var items = pager.querySelectorAll('li');

            for (var i = 0; i < items.length; i++) {
                var li = items[i];
                var a = li.querySelector('a');

                if (!a) {
                    continue;
                }

                if (li.classList.contains('paginationjs-ellipsis')) {
                    a.setAttribute('aria-hidden', 'true');

                    continue;
                }

                var isPrev = li.classList.contains('paginationjs-prev');
                var isNext = li.classList.contains('paginationjs-next');
                var disabled = li.classList.contains(disabledClass);
                var current = !isPrev && !isNext && li.classList.contains(activeClass);
                var num = li.getAttribute('data-num') || a.textContent.trim();

                a.setAttribute('role', 'button');
                a.setAttribute('aria-label', isPrev ? cfg.texts.previous : (isNext ? cfg.texts.next : fill(cfg.texts.page, { page: num })));

                if (current) {
                    a.setAttribute('aria-current', 'page');
                    a.setAttribute('tabindex', '-1');
                } else if (disabled) {
                    a.setAttribute('aria-disabled', 'true');
                    a.setAttribute('tabindex', '-1');
                } else {
                    a.setAttribute('tabindex', '0');
                }
            }

            var goInput = pager.querySelector('.J-paginationjs-go-pagenumber');

            if (goInput && !goInput.getAttribute('aria-label')) {
                goInput.setAttribute('aria-label', fill(cfg.texts.page, { page: '' }).trim());
            }
        }

        function goFromPager(value) {
            var n = toInt(value, 0);

            if (state.totalPages > 0 && n > state.totalPages) {
                n = state.totalPages;
            }

            if (n >= 1 && n !== state.page) {
                api.setPage(n);
            }
        }

        function destroyPager() {
            if (!pagerReady) {
                return;
            }

            try {
                $(pager).pagination('destroy');
            } catch (e) {
                pager.textContent = '';
            }

            pagerReady = false;
        }

        function renderPager() {
            var user = cfg.paginationOptions || {};

            if (state.total <= 0) {
                destroyPager();
                pager.hidden = true;

                return;
            }

            var focus = rememberPagerFocus();
            var options = {
                pageRange: cfg.pageRange,
                prevText: '&lsaquo;',
                nextText: '&rsaquo;',
                hideOnlyOnePage: true
            };

            Object.keys(user).forEach(function (key) {
                if (PAGINATION_ALLOWED.indexOf(key) !== -1) {
                    options[key] = user[key];
                } else if (PAGINATION_COMBINED.indexOf(key) === -1) {
                    warn('a opção "' + key + '" do Pagination.js é controlada pelo hr-paginationjs e foi ignorada.');
                }
            });

            function combined(hook, pick) {
                return function () {
                    var args = Array.prototype.slice.call(arguments);

                    if (typeof user[hook] === 'function' && user[hook].apply(window, args) === false) {
                        return false;
                    }

                    goFromPager(pick(args));

                    return false;
                };
            }

            function fromArgs(args) {
                return args[1];
            }

            options.className = 'hrpjs-paginationjs' + (user.className ? ' ' + user.className : '');
            options.dataSource = 'hrpjs';
            options.totalNumber = state.total;
            options.pageNumber = state.page;
            options.pageSize = state.limit;
            options.triggerPagingOnInit = false;
            options.resetPageNumberOnInit = false;
            options.showSizeChanger = false;
            options.pageLink = '';
            options.classPrefix = 'paginationjs';
            options.callback = function () {};
            options.ajaxFunction = function (params) {
                var data = (params && params.data) || {};

                goFromPager(data.pageNumber);
            };
            options.beforePageOnClick = combined('beforePageOnClick', fromArgs);
            options.beforePreviousOnClick = combined('beforePreviousOnClick', fromArgs);
            options.beforeNextOnClick = combined('beforeNextOnClick', fromArgs);
            options.beforeGoButtonOnClick = combined('beforeGoButtonOnClick', fromArgs);
            options.beforeGoInputOnEnter = combined('beforeGoInputOnEnter', fromArgs);
            options.afterRender = function () {
                if (typeof user.afterRender === 'function') {
                    user.afterRender.apply(window, arguments);
                }

                enhancePager(options);
            };

            try {
                $(pager).pagination(options);
                pagerReady = true;
                enhancePager(options);
            } catch (e) {
                logError('falha ao desenhar a paginação: ' + e.message);
            }

            pager.hidden = false;
            restorePagerFocus(focus);
        }

        function makeError(kind, message, errors, status, requestId) {
            var textKey = 'error' + kind.charAt(0).toUpperCase() + kind.slice(1);
            var fallback = cfg.texts[textKey] || cfg.texts.errorApi;
            var useServer = (kind === 'api' || kind === 'http' || kind === 'session' || kind === 'permission') && typeof message === 'string' && message.trim() !== '';

            return {
                kind: kind,
                status: status || 0,
                message: useServer ? message.trim() : fill(fallback, { status: status || '' }),
                errors: isPlainObject(errors) || Array.isArray(errors) ? clone(errors) : {},
                requestId: requestId || ''
            };
        }

        function classify(result) {
            var body = result ? result.body : undefined;
            var status = result ? toInt(result.status, 0) : 0;
            var textStatus = result ? String(result.textStatus || '') : 'error';
            var requestId = (isPlainObject(body) && typeof body.request_id === 'string' && body.request_id) || (result && result.requestId) || '';
            var message = isPlainObject(body) && typeof body.mensagem === 'string' ? body.mensagem : (isPlainObject(body) && typeof body.message === 'string' ? body.message : '');
            var errors = isPlainObject(body) ? body.errors : null;

            if (textStatus === 'abort') {
                return makeError('abort', '', null, status, requestId);
            }

            if (textStatus === 'timeout') {
                return makeError('timeout', '', null, status, requestId);
            }

            if (status === 401 || status === 419) {
                return makeError('session', message, errors, status, requestId);
            }

            if (status === 403) {
                return makeError('permission', message, errors, status, requestId);
            }

            if (status === 0 && textStatus !== 'success') {
                return makeError('network', '', null, 0, requestId);
            }

            if (status >= 400 || (textStatus !== 'success' && textStatus !== 'parsererror')) {
                return makeError('http', message, errors, status, requestId);
            }

            if (textStatus === 'parsererror' || body === undefined || body === null || typeof body !== 'object') {
                return makeError('invalid', '', null, status, requestId);
            }

            return null;
        }

        function adapterContext(sequence) {
            return {
                names: cfg.names,
                sequence: sequence,
                state: { page: state.page, limit: state.limit, search: state.search, sort: state.sort, direction: state.direction, filters: clone(state.filters) },
                error: function (kind, message, errors) {
                    var e = new Error(message || kind);

                    e.hrpjsKind = kind;
                    e.hrpjsMessage = message;
                    e.hrpjsErrors = errors;

                    return e;
                }
            };
        }

        function buildParams(sequence) {
            var ctx = adapterContext(sequence);
            var params = extend({}, cfg.params);
            var reserved = cfg.adapter.params(ctx.state, ctx);

            Object.keys(state.filters).forEach(function (name) {
                if (own(reserved, name)) {
                    warn('o filtro "' + name + '" usa um nome reservado de parâmetro e foi ignorado.');

                    return;
                }

                params[name] = state.filters[name];
            });

            return extend(params, reserved);
        }

        function cacheKeyFor(params) {
            if (!cfg.cacheTtl) {
                return null;
            }

            var copy = extend({}, params);

            (cfg.adapter.cacheExclude || []).forEach(function (name) {
                delete copy[cfg.names[name] || name];
            });

            return JSON.stringify([cfg.remote, cfg.method, cfg.user, sortedEntries(copy)]);
        }

        function cacheGet(key) {
            var now = Date.now();

            cache = cache.filter(function (entry) {
                return now - entry.time < cfg.cacheTtl;
            });

            for (var i = 0; i < cache.length; i++) {
                if (cache[i].key === key) {
                    return cache[i];
                }
            }

            return null;
        }

        function cacheSet(key, body) {
            cache = cache.filter(function (entry) {
                return entry.key !== key;
            });
            cache.push({ key: key, time: Date.now(), body: clone(body) });

            while (cache.length > cfg.cacheMax) {
                cache.shift();
            }
        }

        function cancelCurrent() {
            if (currentAbort) {
                var abort = currentAbort;

                currentAbort = null;

                try {
                    abort();
                } catch (e) {
                    return;
                }
            }
        }

        function settle(error) {
            var list = waiters;

            waiters = [];
            list.forEach(function (d) {
                if (error) {
                    d.reject(error);
                } else {
                    d.resolve(api.getState());
                }
            });
        }

        function showLoading() {
            root.classList.add('hrpjs-is-loading');
            root.setAttribute('aria-busy', 'true');
            table.setAttribute('aria-busy', 'true');

            if (!hasRendered || !state.rows.length) {
                messageRow('loading', cfg.texts.loading);
            }
        }

        function endLoading() {
            state.loading = false;
            root.classList.remove('hrpjs-is-loading');
            root.removeAttribute('aria-busy');
            table.removeAttribute('aria-busy');
        }

        function renderError(error) {
            var extra = [];

            if (error.requestId) {
                extra.push(el('p', 'hrpjs-message-id', fill(cfg.texts.requestId, { id: error.requestId })));
            }

            var retry = el('button', 'hrpjs-button hrpjs-retry', cfg.texts.retry);

            retry.type = 'button';
            retry.setAttribute(attrName('retry'), '');
            extra.push(retry);
            messageRow('error', error.message, extra);
            clearSummary('');
            destroyPager();
            pager.hidden = true;
            hasRendered = true;
        }

        function startRequest(opts) {
            var mySeq = ++seq;

            cancelCurrent();
            clearTimer('cache');

            var params = buildParams(mySeq);
            var key = cacheKeyFor(params);

            state.loading = true;
            showLoading();
            emit(root, 'beforeload', { id: cfg.id, params: clone(params), state: api.getState() });

            if (key && !opts.force) {
                var hit = cacheGet(key);

                if (hit) {
                    setTimer('cache', function () {
                        finish(mySeq, { status: 200, textStatus: 'success', body: clone(hit.body) }, opts, null);
                    }, 0);
                    currentAbort = function () {
                        clearTimer('cache');
                    };

                    return;
                }
            }

            var request = {
                url: cfg.remote,
                method: cfg.method,
                data: params,
                timeout: cfg.timeout,
                headers: extend({}, cfg.headers)
            };
            var abort;

            try {
                abort = cfg.transport(request, function (result) {
                    finish(mySeq, result, opts, key);
                });
            } catch (e) {
                finish(mySeq, { status: 0, textStatus: 'error' }, opts, null);

                return;
            }

            if (settledSeq !== mySeq && mySeq === seq) {
                if (typeof abort === 'function') {
                    currentAbort = abort;
                } else if (abort && typeof abort.abort === 'function') {
                    currentAbort = function () {
                        abort.abort();
                    };
                }
            }
        }

        function finish(mySeq, result, opts, key) {
            if (destroyed || mySeq !== seq) {
                return;
            }

            settledSeq = mySeq;
            currentAbort = null;

            var error = classify(result);
            var parsed = null;

            if (error && error.kind === 'abort') {
                endLoading();
                settle(error);

                return;
            }

            if (!error) {
                try {
                    parsed = cfg.adapter.parse(result.body, adapterContext(mySeq));

                    if (!parsed || !Array.isArray(parsed.rows) || typeof parsed.total !== 'number' || !isFinite(parsed.total)) {
                        throw adapterContext(mySeq).error('invalid');
                    }
                } catch (e) {
                    var requestId = (isPlainObject(result.body) && typeof result.body.request_id === 'string' && result.body.request_id) || result.requestId || '';

                    error = makeError(e && e.hrpjsKind ? e.hrpjsKind : 'invalid', e && e.hrpjsMessage, e && e.hrpjsErrors, toInt(result.status, 0), requestId);
                }
            }

            if (error) {
                endLoading();
                state.error = error;
                state.rows = [];
                state.total = 0;
                state.totalPages = 0;
                state.requestId = error.requestId;
                renderError(error);
                announce(error.message);
                emit(root, 'error', { id: cfg.id, error: clone(error), state: api.getState() });
                settle(error);

                return;
            }

            var limit = Math.max(1, toInt(parsed.limit, state.limit));
            var lastPage = Math.max(1, Math.ceil(parsed.total / limit));

            if (!opts.correcting && parsed.rows.length === 0 && parsed.total > 0 && state.page > lastPage) {
                state.page = lastPage;
                startRequest(extend({}, opts, { correcting: true, force: true }));

                return;
            }

            if (key) {
                cacheSet(key, result.body);
            }

            endLoading();
            state.error = null;
            state.rows = parsed.rows;
            state.total = parsed.total;
            state.totalAll = typeof parsed.totalAll === 'number' ? parsed.totalAll : parsed.total;
            state.limit = limit;
            state.page = parsed.total === 0 ? 1 : Math.max(1, toInt(parsed.page, state.page));
            state.totalPages = Math.max(0, toInt(parsed.totalPages, Math.ceil(parsed.total / limit)));
            state.requestId = parsed.requestId || result.requestId || '';
            state.message = parsed.message || '';

            if (state.rows.length) {
                renderRows();
            } else {
                messageRow('empty', cfg.texts.empty);
            }

            hasRendered = true;
            applyVisibility();
            updateSortUi();
            writeLimitControls();
            renderPager();

            var summary = renderSummary();

            if (!opts.initial) {
                announce(summary);
            }

            savePrefs();

            if (!opts.fromPopstate) {
                writeUrl(!!opts.initial);
            }

            emit(root, 'load', {
                id: cfg.id,
                rows: clone(state.rows),
                total: state.total,
                totalAll: state.totalAll,
                requestId: state.requestId,
                message: state.message,
                state: api.getState()
            });
            settle(null);
        }

        function load(opts) {
            if (destroyed) {
                var gone = Promise.reject(makeError('destroyed', '', null, 0, ''));

                gone.catch(function () {});

                return gone;
            }

            var d = deferred();

            waiters.push(d);
            startRequest(opts || {});

            return d.promise;
        }

        function changed() {
            emit(root, 'statechange', { id: cfg.id, state: api.getState() });
        }

        function rejected(message) {
            var error = makeError('config', message, null, 0, '');

            error.message = message;

            var p = Promise.reject(error);

            p.catch(function () {});

            return p;
        }

        function applyControls(which) {
            var next = { search: state.search, filters: state.filters };

            if (which.search) {
                var inputs = searchInputs();
                var source = which.source && which.source.matches && which.source.matches('[' + attrName('search') + ']') ? which.source : inputs[0];

                if (source) {
                    var term = source.value.trim();

                    if (term !== '' && term.length < cfg.minChars) {
                        term = state.search;
                    }

                    next.search = term;
                }
            }

            if (which.filters) {
                var controlNames = Object.keys(controlsByName());
                var merged = {};

                Object.keys(state.filters).forEach(function (name) {
                    if (controlNames.indexOf(name) === -1) {
                        merged[name] = state.filters[name];
                    }
                });

                next.filters = extend(merged, readFilterControls());
            }

            if (next.search === state.search && sameJson(next.filters, state.filters)) {
                return null;
            }

            state.search = next.search;
            state.filters = next.filters;
            state.page = 1;
            writeSearchControls();
            changed();

            return load();
        }

        function formApplyMode(node) {
            var form = node && node.closest ? node.closest('form[' + attrName('filters') + ']') : null;

            return form && getAttr(form, 'apply') === 'submit' ? 'submit' : 'change';
        }

        function runRemoteAction(button, row, key) {
            var url = safeUrl(getAttr(button, 'action-remote'), 'request');

            if (!url) {
                showNotice(cfg.texts.errorConfig, true);

                return;
            }

            var confirmText = getAttr(button, 'action-confirm');

            if (confirmText && !window.confirm(fillRow(confirmText, row))) {
                return;
            }

            var data = {};
            var keyParam = getAttr(button, 'action-key') || 'id';

            if (key !== undefined && key !== null) {
                data[keyParam] = key;
            }

            for (var i = 0; i < button.attributes.length; i++) {
                var a = button.attributes[i];

                if (a.name.indexOf(P + '-param-') === 0) {
                    data[a.name.slice((P + '-param-').length)] = fillRow(a.value, row);
                }
            }

            var headers = extend({}, cfg.headers);
            var csrf = tokenInfo(cfg.token);

            if (csrf.token) {
                headers['X-CSRF-Token'] = csrf.token;

                if (cfg.csrf !== 'header' && csrf.source !== 'laravel') {
                    data[csrf.token] = '1';
                }
            }

            var method = String(getAttr(button, 'action-method') || 'POST').toUpperCase();
            var actionName = getAttr(button, 'action');

            button.disabled = true;
            button.setAttribute('aria-busy', 'true');

            try {
                cfg.transport({ url: url, method: method === 'GET' ? 'GET' : 'POST', data: data, timeout: cfg.timeout, headers: headers }, function (result) {
                    if (destroyed) {
                        return;
                    }

                    button.disabled = false;
                    button.removeAttribute('aria-busy');

                    var error = classify(result);
                    var body = result ? result.body : null;
                    var status = result ? toInt(result.status, 0) : 0;

                    if (error && error.kind === 'invalid' && status === 204) {
                        error = null;
                        body = {};
                    }

                    if (!error && (!isPlainObject(body) || body.success === false)) {
                        error = isPlainObject(body)
                            ? makeError('api', body.mensagem || body.message || cfg.texts.actionError, body.errors, status, body.request_id)
                            : makeError('invalid', '', null, status, '');
                    }

                    if (error) {
                        if (error.kind === 'abort') {
                            return;
                        }

                        showNotice(error.message, true);
                        emit(root, 'actionerror', { id: cfg.id, action: actionName, key: key, row: clone(row), error: clone(error) });

                        return;
                    }

                    cache = [];
                    var done = typeof body.mensagem === 'string' && body.mensagem ? body.mensagem : (typeof body.message === 'string' && body.message ? body.message : cfg.texts.actionDone);

                    showNotice(done, false);
                    emit(root, 'actiondone', { id: cfg.id, action: actionName, key: key, row: clone(row), response: clone(body) });

                    if (toBool(getAttr(button, 'action-reload'), true)) {
                        load({ force: true });
                    }
                });
            } catch (e) {
                button.disabled = false;
                button.removeAttribute('aria-busy');
                showNotice(cfg.texts.actionError, true);
            }
        }

        function handleAction(button) {
            var tr = button.closest('tr');
            var index = tr ? toInt(tr.getAttribute(attrName('row-index')), -1) : -1;

            if (index < 0 || !state.rows[index]) {
                return;
            }

            var row = state.rows[index];
            var key = getPath(row, cfg.rowKey);
            var proceed = emit(root, 'action', {
                id: cfg.id,
                action: getAttr(button, 'action'),
                key: key === undefined ? null : key,
                index: index,
                row: clone(row),
                element: button
            }, true);

            if (proceed && hasAttr(button, 'action-remote')) {
                runRemoteAction(button, row, key);
            }
        }

        function onClick(e) {
            var t = e.target;

            if (!t || !t.closest) {
                return;
            }

            var action = t.closest('[' + attrName('action') + ']');

            if (action && tbody.contains(action)) {
                e.preventDefault();
                handleAction(action);

                return;
            }

            var sortButton = t.closest('.hrpjs-sort');

            if (sortButton && table.contains(sortButton)) {
                var key = sortButton.getAttribute(attrName('sort-key'));

                api.setSort(key);

                return;
            }

            var control = t.closest('[' + attrName('reload') + '], [' + attrName('retry') + '], [' + attrName('clear') + '], [' + attrName('columns-reset') + ']');

            if (!control || !owns(control)) {
                return;
            }

            if (hasAttr(control, 'reload') || hasAttr(control, 'retry')) {
                e.preventDefault();
                api.reload();
            } else if (hasAttr(control, 'clear')) {
                e.preventDefault();
                clearControls(getAttr(control, 'clear') || 'all');
            } else if (hasAttr(control, 'columns-reset')) {
                e.preventDefault();
                api.resetColumns();
            }
        }

        function clearControls(kind) {
            var clearSearch = kind === 'all' || kind === 'search';
            var clearFilters = kind === 'all' || kind === 'filters';
            var nextSearch = clearSearch ? '' : state.search;
            var nextFilters = clearFilters ? {} : state.filters;

            clearTimer('search');

            if (nextSearch === state.search && sameJson(nextFilters, state.filters)) {
                writeSearchControls();
                writeFilterControls();

                return;
            }

            state.search = nextSearch;
            state.filters = nextFilters;
            state.page = 1;
            writeSearchControls();
            writeFilterControls();
            changed();
            load();
        }

        function onInput(e) {
            var t = e.target;

            if (!t || !t.matches || !t.matches('[' + attrName('search') + ']') || !owns(t)) {
                return;
            }

            if (composing || e.isComposing) {
                return;
            }

            setTimer('search', function () {
                applyControls({ search: true, source: t });
            }, cfg.debounce);
        }

        function onChange(e) {
            var t = e.target;

            if (!t || !t.matches || !owns(t)) {
                return;
            }

            if (t.matches('select[' + attrName('page-size') + ']')) {
                api.setLimit(toInt(t.value, state.limit));

                return;
            }

            if (t.matches('input[' + attrName('column-toggle') + ']')) {
                var ok = api.toggleColumn(t.value, t.checked);

                if (!ok) {
                    t.checked = !!state.visible[t.value];
                }

                return;
            }

            if (isFilterControl(t) && formApplyMode(t) === 'change') {
                applyControls({ filters: true });
            }
        }

        function onKeydown(e) {
            var t = e.target;

            if (!t || !t.closest) {
                return;
            }

            var key = e.key;

            if (key === 'Escape') {
                var details = t.closest('details.hrpjs-columns');

                if (details && details.open && pickers.indexOf(details) !== -1) {
                    details.open = false;
                    details.querySelector('summary').focus();
                }

                return;
            }

            if ((key === 'Enter' || key === ' ' || key === 'Spacebar') && pager.contains(t) && t.matches('a[role="button"]')) {
                e.preventDefault();

                if (t.getAttribute('aria-disabled') !== 'true' && t.getAttribute('aria-current') !== 'page') {
                    t.click();
                }

                return;
            }

            if (key !== 'Enter' || composing || e.isComposing || !owns(t)) {
                return;
            }

            if (t.matches('[' + attrName('search') + ']')) {
                e.preventDefault();
                clearTimer('search');

                var inForm = t.closest('form[' + attrName('filters') + ']');

                applyControls({ search: true, filters: !!inForm, source: t });

                return;
            }

            if (isFilterControl(t) && /^(input)$/i.test(t.tagName) && !/^(checkbox|radio)$/i.test(t.type)) {
                if (formApplyMode(t) === 'submit') {
                    return;
                }

                e.preventDefault();
                applyControls({ filters: true });
            }
        }

        function onSubmit(e) {
            var form = e.target;

            if (!form || !form.matches || !form.matches('form[' + attrName('filters') + ']') || !owns(form)) {
                return;
            }

            e.preventDefault();
            clearTimer('search');

            var hasSearch = !!form.querySelector('[' + attrName('search') + ']');
            var source = form.querySelector('[' + attrName('search') + ']');

            applyControls({ search: hasSearch, filters: true, source: source });
        }

        function onCompositionStart() {
            composing = true;
        }

        function onCompositionEnd(e) {
            composing = false;
            onInput(e);
        }

        function onPopState() {
            var fromUrl = readUrl();

            state.page = fromUrl.page || 1;
            state.limit = fromUrl.limit || base.limit;
            state.sort = own(fromUrl, 'sort') ? fromUrl.sort : base.sort;
            state.direction = fromUrl.direction || base.direction;
            state.search = own(fromUrl, 'search') ? fromUrl.search : base.search;
            state.filters = fromUrl.filters || clone(base.filters);
            writeSearchControls();
            writeFilterControls();
            writeLimitControls();
            updateSortUi();
            load({ fromPopstate: true });
        }

        function bindEvents() {
            [root].concat(forScopes()).forEach(function (scope) {
                listen(scope, 'click', onClick);
                listen(scope, 'input', onInput);
                listen(scope, 'change', onChange);
                listen(scope, 'keydown', onKeydown);
                listen(scope, 'submit', onSubmit);
                listen(scope, 'compositionstart', onCompositionStart);
                listen(scope, 'compositionend', onCompositionEnd);
            });

            if (cfg.url) {
                listen(window, 'popstate', onPopState);
            }
        }

        function html(value) {
            return new HtmlString(value);
        }

        function initialState() {
            var defaults = {
                page: 1,
                limit: cfg.limit,
                sort: validSort(cfg.sort) ? cfg.sort : '',
                direction: cfg.direction,
                search: '',
                filters: readFilterControls(),
                visible: defaultVisibility()
            };

            if (cfg.sort && !validSort(cfg.sort)) {
                warn('"' + cfg.id + '": a ordenação padrão "' + cfg.sort + '" não é uma coluna com ' + attrName('sortable') + ' e foi ignorada.');
            }

            var firstSearch = searchInputs()[0];

            if (firstSearch && firstSearch.value.trim() !== '') {
                defaults.search = firstSearch.value.trim();
            }

            applyPrefs(defaults, loadPrefs());
            base = { limit: defaults.limit, sort: defaults.sort, direction: defaults.direction, search: defaults.search, filters: clone(defaults.filters) };

            var fromUrl = readUrl();

            state.page = fromUrl.page || 1;
            state.limit = fromUrl.limit || defaults.limit;
            state.sort = own(fromUrl, 'sort') ? fromUrl.sort : defaults.sort;
            state.direction = fromUrl.direction || defaults.direction;
            state.search = own(fromUrl, 'search') ? fromUrl.search : defaults.search;
            state.filters = fromUrl.filters || defaults.filters;
            state.visible = defaults.visible;
        }

        api = {
            id: cfg.id,
            element: root,
            reload: function () {
                cache = [];

                return load({ force: true });
            },
            setPage: function (page) {
                var n = toInt(page, 0);

                if (n < 1) {
                    return rejected('setPage: informe um número de página maior ou igual a 1.');
                }

                state.page = n;
                changed();

                return load();
            },
            setLimit: function (limit) {
                var n = toInt(limit, 0);

                if (n < 1) {
                    return rejected('setLimit: informe uma quantidade maior ou igual a 1.');
                }

                state.limit = n;
                state.page = 1;
                writeLimitControls();
                changed();

                return load();
            },
            setSearch: function (term) {
                clearTimer('search');
                state.search = term === null || term === undefined ? '' : String(term).trim();
                state.page = 1;
                writeSearchControls();
                changed();

                return load();
            },
            setFilter: function (name, value) {
                if (!name) {
                    return rejected('setFilter: informe o nome do filtro.');
                }

                var normalized = normalizeFilterValue(value, filterType(name));
                var next = extend({}, state.filters);

                if (normalized === undefined) {
                    delete next[name];
                } else {
                    next[name] = normalized;
                }

                state.filters = next;
                state.page = 1;
                writeFilterControls();
                changed();

                return load();
            },
            setFilters: function (filters, replace) {
                var incoming = isPlainObject(filters) ? filters : {};
                var next = replace ? {} : extend({}, state.filters);

                Object.keys(incoming).forEach(function (name) {
                    var normalized = normalizeFilterValue(incoming[name], filterType(name));

                    if (normalized === undefined) {
                        delete next[name];
                    } else {
                        next[name] = normalized;
                    }
                });

                state.filters = next;
                state.page = 1;
                writeFilterControls();
                changed();

                return load();
            },
            clearFilters: function () {
                state.filters = {};
                state.page = 1;
                writeFilterControls();
                changed();

                return load();
            },
            setSort: function (key, direction) {
                if (key === '' || key === null) {
                    state.sort = '';
                    state.page = 1;
                    updateSortUi();
                    changed();

                    return load();
                }

                if (!validSort(key)) {
                    return rejected('setSort: a coluna "' + key + '" não existe ou não tem ' + attrName('sortable') + '.');
                }

                var dir = normalizeDirection(direction);

                if (!dir) {
                    dir = state.sort === key ? (state.direction === 'asc' ? 'desc' : 'asc') : columnMap[key].sortFirst;
                }

                state.sort = key;
                state.direction = dir;
                state.page = 1;
                updateSortUi();
                changed();

                return load();
            },
            showColumn: function (key) {
                return api.toggleColumn(key, true);
            },
            hideColumn: function (key) {
                return api.toggleColumn(key, false);
            },
            toggleColumn: function (key, force) {
                var col = columnMap[key];

                if (!col) {
                    warn('coluna "' + key + '" não existe em "' + cfg.id + '".');

                    return false;
                }

                var show = typeof force === 'boolean' ? force : !state.visible[key];

                if (show === !!state.visible[key]) {
                    return true;
                }

                if (!show && !canHide(col)) {
                    updatePickers();

                    return false;
                }

                state.visible[key] = show;
                applyVisibility();
                savePrefs();
                emit(root, 'columnschange', { id: cfg.id, visible: visibleKeys() });

                return true;
            },
            resetColumns: function () {
                state.visible = defaultVisibility();
                applyVisibility();
                savePrefs();
                emit(root, 'columnschange', { id: cfg.id, visible: visibleKeys() });

                return true;
            },
            resetPreferences: function () {
                removePrefs();
                state.visible = defaultVisibility();
                state.limit = cfg.limit;
                state.sort = validSort(cfg.sort) ? cfg.sort : '';
                state.direction = cfg.direction;

                if (cfg.persist.indexOf('search') !== -1) {
                    state.search = '';
                }

                if (cfg.persist.indexOf('filters') !== -1) {
                    state.filters = {};
                }

                base = { limit: state.limit, sort: state.sort, direction: state.direction, search: state.search, filters: clone(state.filters) };
                state.page = 1;
                applyVisibility();
                updateSortUi();
                writeLimitControls();
                writeSearchControls();
                writeFilterControls();
                emit(root, 'columnschange', { id: cfg.id, visible: visibleKeys() });
                changed();

                return load();
            },
            getState: function () {
                return {
                    id: cfg.id,
                    page: state.page,
                    limit: state.limit,
                    search: state.search,
                    filters: clone(state.filters),
                    sort: state.sort,
                    direction: state.direction,
                    columns: visibleKeys(),
                    hiddenColumns: columns.filter(function (c) {
                        return !state.visible[c.key];
                    }).map(function (c) {
                        return c.key;
                    }),
                    loading: state.loading,
                    error: state.error ? clone(state.error) : null,
                    total: state.total,
                    totalPages: state.totalPages,
                    requestId: state.requestId
                };
            },
            getRows: function () {
                return clone(state.rows);
            },
            destroy: function () {
                if (destroyed) {
                    return;
                }

                emit(root, 'destroy', { id: cfg.id });
                destroyed = true;
                seq++;
                cancelCurrent();

                Object.keys(timers).forEach(clearTimer);
                listeners.forEach(function (l) {
                    l[0].removeEventListener(l[1], l[2], l[3]);
                });
                listeners = [];
                destroyPager();
                pickers.forEach(function (p) {
                    if (p.parentNode) {
                        p.parentNode.removeChild(p);
                    }
                });
                addedOptions.forEach(function (o) {
                    if (o.parentNode) {
                        o.parentNode.removeChild(o);
                    }
                });
                created.slice().reverse().forEach(function (node) {
                    if (node.parentNode) {
                        node.parentNode.removeChild(node);
                    }
                });
                restorers.forEach(function (fn) {
                    fn();
                });

                if (createdTbody) {
                    if (tbody.parentNode) {
                        tbody.parentNode.removeChild(tbody);
                    }
                } else {
                    tbody.textContent = '';
                    originalBody.forEach(function (node) {
                        tbody.appendChild(node);
                    });
                    tbody.classList.remove('hrpjs-body');
                }

                if (!hadRootClass) {
                    root.classList.remove('hrpjs');
                }

                if (!hadTableClass) {
                    table.classList.remove('hrpjs-table');
                }

                root.classList.remove('hrpjs-is-loading');
                root.removeAttribute('aria-busy');
                root.removeAttribute(attrName('ready'));
                table.removeAttribute('aria-busy');
                settle(makeError('destroyed', '', null, 0, ''));

                instances = instances.filter(function (item) {
                    return item.root !== root;
                });

                state.rows = [];
                cache = [];
                waiters = [];
                pickers = [];
                created = [];
                restorers = [];
                addedOptions = [];
                originalBody = [];
            }
        };

        buildPickers();
        initialState();
        writeSearchControls();
        writeFilterControls();
        writeLimitControls();
        applyVisibility();
        updateSortUi();
        bindEvents();
        root.setAttribute(attrName('ready'), '');
        instances.push({ root: root, api: api });
        emit(root, 'init', { id: cfg.id, state: api.getState() });

        if (cfg.autoload) {
            load({ initial: true });
        } else if (cfg.texts.idle) {
            messageRow('idle', cfg.texts.idle);
        }

        return api;
    }

    function resolveElement(target) {
        if (!target) {
            return null;
        }

        if (typeof target === 'string') {
            var byId = document.getElementById(target);

            if (byId) {
                return byId;
            }

            for (var i = 0; i < instances.length; i++) {
                if (instances[i].api.id === target) {
                    return instances[i].root;
                }
            }

            try {
                return document.querySelector(target);
            } catch (e) {
                return null;
            }
        }

        if (target.jquery) {
            return target[0] || null;
        }

        return target.nodeType === 1 ? target : null;
    }

    function get(target) {
        var root = resolveElement(target);

        for (var i = 0; i < instances.length; i++) {
            if (instances[i].root === root) {
                return instances[i].api;
            }
        }

        return null;
    }

    function init(target, options) {
        var root = resolveElement(target);

        if (!root) {
            throw new ConfigError('elemento não encontrado: ' + target);
        }

        var existing = get(root);

        if (existing) {
            return existing;
        }

        var missing = dependencyError();

        if (missing) {
            showFatal(root, 'hr-paginationjs: ' + missing);
            throw new ConfigError(missing);
        }

        try {
            return createInstance(root, options);
        } catch (e) {
            showFatal(root, e.message);
            throw e;
        }
    }

    function scan(context) {
        var scope = context || document;
        var roots = scope.querySelectorAll('[' + P + ']');
        var result = [];

        for (var i = 0; i < roots.length; i++) {
            var mode = roots[i].getAttribute(P);

            if (mode === 'manual' || get(roots[i])) {
                continue;
            }

            try {
                result.push(init(roots[i]));
            } catch (e) {
                logError(String(e.message).replace(/^hr-paginationjs: /, ''));
            }
        }

        return result;
    }

    var currentScript = document.currentScript;
    var autoInit = !(currentScript && currentScript.getAttribute(P + '-autoinit') === 'false');

    var HrPaginationjs = {
        version: VERSION,
        texts: TEXTS,
        init: init,
        get: get,
        scan: scan,
        instances: function () {
            return instances.map(function (item) {
                return item.api;
            });
        },
        formatter: function (name, fn) {
            if (typeof fn !== 'function') {
                throw new ConfigError('formatter("' + name + '"): informe uma função.');
            }

            formatters[name] = fn;
        },
        adapter: function (name, definition) {
            if (!definition || typeof definition.params !== 'function' || typeof definition.parse !== 'function') {
                throw new ConfigError('adapter("' + name + '"): informe um objeto com params(state, ctx) e parse(body, ctx).');
            }

            adapters[String(name).toLowerCase()] = {
                names: extend({}, definition.names),
                cacheExclude: definition.cacheExclude || [],
                params: definition.params,
                parse: definition.parse
            };
        },
        html: function (value) {
            return new HtmlString(value);
        },
        serialize: serialize,
        findToken: function () {
            return findToken('');
        }
    };

    window.HrPaginationjs = HrPaginationjs;

    if (autoInit) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () {
                scan(document);
            });
        } else {
            scan(document);
        }
    }
})(window, document);
```
