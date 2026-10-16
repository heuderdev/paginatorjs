'use strict';

var fs = require('fs');
var path = require('path');

function loadMarked() {
    var candidates = [process.env.HRPJS_MARKED, 'marked'].filter(Boolean);

    for (var i = 0; i < candidates.length; i++) {
        try {
            return require(candidates[i]);
        } catch (e) {
            continue;
        }
    }

    console.error('marked não encontrado. Rode "npm install" na raiz do projeto.');
    process.exit(2);
}

var marked = loadMarked().marked;
var root = path.resolve(__dirname, '..');
var srcDir = path.join(root, 'docs', 'md');
var outDir = path.join(root, 'docs');

var ORDER = [
    'README', 'instalacao', 'primeira-tela', 'atributos', 'colunas', 'busca-filtros-ordenacao', 'controles',
    'acoes', 'api-js', 'eventos', 'backend', 'preferencias-url-cache', 'paginationjs-opcoes',
    'acessibilidade-seguranca', 'testes'
];

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

var files = fs.readdirSync(srcDir).filter(function (f) {
    return /\.md$/.test(f);
}).map(function (f) {
    return f.replace(/\.md$/, '');
}).sort(function (a, b) {
    var ia = ORDER.indexOf(a);
    var ib = ORDER.indexOf(b);

    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib) || a.localeCompare(b);
});

var pages = files.map(function (base) {
    var source = fs.readFileSync(path.join(srcDir, base + '.md'), 'utf8');
    var title = (/^#\s+(.+)$/m.exec(source) || [null, base])[1].trim();

    return { base: base, source: source, title: title, file: htmlName(base) };
});

function navTitle(page) {
    return page.base === 'README' ? 'Início' : page.title.replace(/^hr-paginationjs\s+—\s+/, '');
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

    renderer.blockquote = function (quote) {
        return '<blockquote class="note">' + quote + '</blockquote>\n';
    };

    var body = marked.parse(page.source, { renderer: renderer, gfm: true });
    var prev = pages[index - 1];
    var next = pages[index + 1];

    var nav = pages.map(function (p) {
        return '<li><a href="' + p.file + '"' + (p === page ? ' aria-current="page"' : '') + '>' + escapeHtml(navTitle(p)) + '</a></li>';
    }).join('\n                ');

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
        '    <link rel="stylesheet" href="assets/docs.css">\n' +
        '</head>\n' +
        '<body>\n' +
        '    <a class="skip" href="#conteudo">Pular para o conteúdo</a>\n' +
        '    <header class="topbar">\n' +
        '        <a class="brand" href="index.html">hr-paginationjs <small>docs</small></a>\n' +
        '        <span class="source">Fonte: <code>docs/md/' + page.base + '.md</code></span>\n' +
        '    </header>\n' +
        '    <div class="layout">\n' +
        '        <nav class="sidebar" aria-label="Documentação">\n' +
        '            <ul>\n                ' + nav + '\n            </ul>\n' +
        '        </nav>\n' +
        '        <main id="conteudo" class="content">\n' +
        toc + '\n' + body + '\n' + pager + '\n' +
        '        </main>\n' +
        '    </div>\n' +
        '</body>\n' +
        '</html>\n';
}

pages.forEach(function (page, index) {
    fs.writeFileSync(path.join(outDir, page.file), render(page, index), 'utf8');
    console.log('docs/' + page.file + '  <-  docs/md/' + page.base + '.md');
});
