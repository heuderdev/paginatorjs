# 📄 `scripts/build-docs.js`

- **Camada:** [📄 OUTROS ARQUIVOS](../../outros.md)
- **Linguagem:** javascript
- **Linhas:** 262

## Imports

- `fs`
- `path`

## Funções / Métodos

- `load(name)`
- `htmlName(base)`
- `escapeHtml(text)`
- `slug(text)`
- `rewriteHref(href)`
- `highlightCss()`
- `navTitle(page)`
- `codeBlock(code, info)`
- `render(page, index)`

## Código-fonte

```javascript
'use strict';

var fs = require('fs');
var path = require('path');

function load(name) {
    try {
        return require(name);
    } catch (e) {
        console.error(name + ' não encontrado. Rode "npm install" na raiz do projeto.');
        process.exit(2);
    }
}

var marked = load('marked').marked;
var hljs = load('highlight.js');

var root = path.resolve(__dirname, '..');
var srcDir = path.join(root, 'docs', 'md');
var outDir = path.join(root, 'docs');

var NAV = [
    { group: 'Guia', pages: ['README', 'instalacao', 'primeira-tela', 'laravel'] },
    {
        group: 'Exemplos',
        pages: [
            'exemplos', 'exemplos-telas', 'exemplos-colunas', 'exemplos-busca', 'exemplos-filtros', 'exemplos-ordenacao-paginacao',
            'exemplos-acoes', 'exemplos-estados-textos', 'exemplos-preferencias-url-cache', 'exemplos-javascript', 'exemplos-integracoes'
        ]
    },
    {
        group: 'Referência',
        pages: [
            'atributos', 'colunas', 'busca-filtros-ordenacao', 'controles', 'acoes', 'api-js', 'eventos', 'backend',
            'preferencias-url-cache', 'paginationjs-opcoes', 'acessibilidade-seguranca', 'testes'
        ]
    }
];

var LANGS = {
    html: { hl: 'xml', label: 'HTML' },
    xml: { hl: 'xml', label: 'HTML' },
    js: { hl: 'javascript', label: 'JavaScript' },
    javascript: { hl: 'javascript', label: 'JavaScript' },
    php: { hl: 'php', label: 'PHP' },
    css: { hl: 'css', label: 'CSS' },
    json: { hl: 'json', label: 'JSON' },
    bash: { hl: 'bash', label: 'Terminal' },
    sql: { hl: 'sql', label: 'SQL' },
    http: { hl: 'http', label: 'Requisição gerada' },
    text: { hl: 'plaintext', label: 'Texto' }
};

function htmlName(base) {
    return base === 'README' ? 'index.html' : base + '.html';
}

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}

function slug(text) {
    return String(text)
        .toLowerCase()
        .replace(/<[^>]+>/g, '')
        .replace(/&[a-z0-9#]+;/g, '')
        .trim()
        .replace(/[^\p{L}\p{N}\s_-]/gu, '')
        .replace(/\s/g, '-');
}

function rewriteHref(href) {
    return href.replace(/^(?:\.\/)?([A-Za-z0-9_-]+)\.md(#.*)?$/, function (m, base, hash) {
        return htmlName(base) + (hash || '');
    });
}

function highlightCss() {
    var stylesDir = path.join(path.dirname(require.resolve('highlight.js/package.json')), 'styles');
    var light = fs.readFileSync(path.join(stylesDir, 'github.css'), 'utf8');
    var dark = fs.readFileSync(path.join(stylesDir, 'github-dark.css'), 'utf8');

    return '/* highlight.js 11 — temas github e github-dark (BSD-3-Clause) */\n' + light +
        '\n@media (prefers-color-scheme: dark) {\n' + dark + '\n}\n';
}

var sources = {};

fs.readdirSync(srcDir).filter(function (f) {
    return /\.md$/.test(f);
}).forEach(function (f) {
    sources[f.replace(/\.md$/, '')] = fs.readFileSync(path.join(srcDir, f), 'utf8');
});

var ordered = [];

NAV.forEach(function (g) {
    g.pages.forEach(function (base) {
        if (!sources[base]) {
            console.error('Página do menu sem arquivo: docs/md/' + base + '.md');
            process.exit(1);
        }

        ordered.push(base);
    });
});

Object.keys(sources).forEach(function (base) {
    if (ordered.indexOf(base) === -1) {
        console.error('Arquivo fora do menu: docs/md/' + base + '.md (adicione em NAV no scripts/build-docs.js)');
        process.exit(1);
    }
});

var pages = ordered.map(function (base) {
    var title = (/^#\s+(.+)$/m.exec(sources[base]) || [null, base])[1].trim();

    return { base: base, title: title, file: htmlName(base), source: sources[base] };
});

function navTitle(page) {
    return page.base === 'README' ? 'Início' : page.title.replace(/^hr-paginationjs\s+—\s+/, '');
}

function codeBlock(code, info) {
    var parts = String(info || '').trim().split(/\s+/);
    var lang = (parts.shift() || 'text').toLowerCase();
    var title = parts.join(' ');

    if (lang === 'preview') {
        return '<figure class="preview"><figcaption>' + escapeHtml(title || 'Como fica na tela') + '</figcaption>' +
            '<div class="preview-body">' + code + '</div></figure>\n';
    }

    var def = LANGS[lang] || { hl: hljs.getLanguage(lang) ? lang : 'plaintext', label: lang.toUpperCase() };
    var html = hljs.highlight(code, { language: def.hl, ignoreIllegals: true }).value;
    var label = escapeHtml(def.label) + (title ? ' <span class="code-file">' + escapeHtml(title) + '</span>' : '');

    return '<div class="code-block code-' + escapeHtml(lang) + '">' +
        '<div class="code-head"><span class="code-lang">' + label + '</span>' +
        '<button type="button" class="copy" data-label="Copiar" aria-label="Copiar código">Copiar</button></div>' +
        '<pre><code class="hljs language-' + escapeHtml(def.hl) + '">' + html + '</code></pre></div>\n';
}

function render(page, index) {
    var headings = [];
    var used = {};
    var renderer = new marked.Renderer();

    renderer.heading = function (text, level) {
        var id = slug(text);

        if (used[id] !== undefined) {
            used[id]++;
            id += '-' + used[id];
        } else {
            used[id] = 0;
        }

        if (level === 2) {
            headings.push({ id: id, text: text.replace(/<[^>]+>/g, '') });
        }

        return '<h' + level + ' id="' + id + '">' + text + (level > 1 ? ' <a class="anchor" href="#' + id + '" aria-label="Link para esta seção">#</a>' : '') + '</h' + level + '>\n';
    };

    renderer.link = function (href, title, text) {
        var target = rewriteHref(href || '');
        var external = /^https?:/i.test(target);

        return '<a href="' + escapeHtml(target) + '"' + (title ? ' title="' + escapeHtml(title) + '"' : '') +
            (external ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + text + '</a>';
    };

    renderer.table = function (header, body) {
        return '<div class="table-wrap"><table>\n<thead>\n' + header + '</thead>\n<tbody>\n' + body + '</tbody>\n</table></div>\n';
    };

    renderer.code = function (code, info) {
        return codeBlock(code, info);
    };

    renderer.blockquote = function (quote) {
        var kind = 'note';
        var m = /^\s*<p><strong>(Dica|Atenção|Importante|Resultado|Como funciona)/.exec(quote);

        if (m) {
            kind = { 'Dica': 'tip', 'Atenção': 'warn', 'Importante': 'warn', 'Resultado': 'result', 'Como funciona': 'info' }[m[1]];
        }

        return '<blockquote class="callout callout-' + kind + '">' + quote + '</blockquote>\n';
    };

    var body = marked.parse(page.source, { renderer: renderer, gfm: true });
    var prev = pages[index - 1];
    var next = pages[index + 1];

    var nav = NAV.map(function (g) {
        return '<p class="nav-group">' + g.group + '</p><ul>' + g.pages.map(function (base) {
            var p = pages.filter(function (x) {
                return x.base === base;
            })[0];

            return '<li><a href="' + p.file + '"' + (p === page ? ' aria-current="page"' : '') + '>' + escapeHtml(navTitle(p)) + '</a></li>';
        }).join('') + '</ul>';
    }).join('\n');

    var toc = headings.length > 1 ? '<nav class="toc" aria-label="Nesta página"><p>Nesta página</p><ul>' + headings.map(function (h) {
        return '<li><a href="#' + h.id + '">' + escapeHtml(h.text) + '</a></li>';
    }).join('') + '</ul></nav>' : '';

    var pager = '<nav class="pager" aria-label="Navegação entre páginas">' +
        (prev ? '<a class="prev" href="' + prev.file + '"><span>Anterior</span>' + escapeHtml(navTitle(prev)) + '</a>' : '<span></span>') +
        (next ? '<a class="next" href="' + next.file + '"><span>Próxima</span>' + escapeHtml(navTitle(next)) + '</a>' : '<span></span>') +
        '</nav>';

    return '<!doctype html>\n' +
        '<html lang="pt-BR">\n' +
        '<head>\n' +
        '    <meta charset="utf-8">\n' +
        '    <meta name="viewport" content="width=device-width, initial-scale=1">\n' +
        '    <title>' + escapeHtml(page.base === 'README' ? 'hr-paginationjs — documentação' : page.title + ' — hr-paginationjs') + '</title>\n' +
        '    <link rel="stylesheet" href="../dist/hr-paginationjs.min.css">\n' +
        '    <link rel="stylesheet" href="assets/highlight.css">\n' +
        '    <link rel="stylesheet" href="assets/docs.css">\n' +
        '    <script src="assets/docs.js" defer></script>\n' +
        '</head>\n' +
        '<body>\n' +
        '    <a class="skip" href="#conteudo">Pular para o conteúdo</a>\n' +
        '    <header class="topbar">\n' +
        '        <a class="brand" href="index.html">hr-paginationjs <small>docs</small></a>\n' +
        '        <span class="source">Fonte: <code>docs/md/' + page.base + '.md</code></span>\n' +
        '    </header>\n' +
        '    <div class="layout">\n' +
        '        <nav class="sidebar" aria-label="Documentação">\n' + nav + '\n        </nav>\n' +
        '        <main id="conteudo" class="content">\n' +
        toc + '\n' + body + '\n' + pager + '\n' +
        '        </main>\n' +
        '    </div>\n' +
        '</body>\n' +
        '</html>\n';
}

fs.writeFileSync(path.join(outDir, 'assets', 'highlight.css'), highlightCss(), 'utf8');

fs.readdirSync(outDir).filter(function (f) {
    return /\.html$/.test(f);
}).forEach(function (f) {
    if (!pages.some(function (p) {
        return p.file === f;
    })) {
        fs.unlinkSync(path.join(outDir, f));
        console.log('removido docs/' + f + ' (sem fonte em docs/md)');
    }
});

pages.forEach(function (page, index) {
    fs.writeFileSync(path.join(outDir, page.file), render(page, index), 'utf8');
    console.log('docs/' + page.file + '  <-  docs/md/' + page.base + '.md');
});
```
