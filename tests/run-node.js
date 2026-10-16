'use strict';

var fs = require('fs');
var path = require('path');

function loadJsdom() {
    var candidates = [process.env.HRPJS_JSDOM, 'jsdom'].filter(Boolean);

    for (var i = 0; i < candidates.length; i++) {
        try {
            return require(candidates[i]);
        } catch (e) {
            continue;
        }
    }

    console.error('jsdom não encontrado. Instale fora do projeto e informe o caminho:');
    console.error('  npm install --prefix <pasta-temporaria> jsdom');
    console.error('  HRPJS_JSDOM=<pasta-temporaria>/node_modules/jsdom node tests/run-node.js');
    process.exit(2);
}

var JSDOM = loadJsdom().JSDOM;
var root = path.resolve(__dirname, '..');
var dom = new JSDOM('<!doctype html><html lang="pt-BR"><head></head><body></body></html>', {
    url: 'http://localhost/tests/runner.html',
    runScripts: 'outside-only',
    pretendToBeVisual: true
});
var window = dom.window;
var jqueryFile = process.env.HRPJS_JQUERY ? path.resolve(process.env.HRPJS_JQUERY) : path.join(root, 'vendor/jquery-1.12.4.min.js');

window.eval(fs.readFileSync(jqueryFile, 'utf8') + '\n//# sourceURL=' + path.basename(jqueryFile));
console.log('jQuery ' + window.jQuery.fn.jquery + ' (' + path.basename(jqueryFile) + ')');

[
    'vendor/pagination-2.6.0.min.js',
    'src/hr-paginationjs.js',
    'tests/harness.js',
    'tests/hr-paginationjs.tests.js'
].forEach(function (file) {
    window.eval(fs.readFileSync(path.join(root, file), 'utf8') + '\n//# sourceURL=' + file);
});

window.HRPJS_RUN(function (result, done, total) {
    var line = (result.ok ? 'ok    ' : 'FALHOU') + ' ' + result.name + ' (' + result.ms + ' ms)';

    console.log(line);

    if (!result.ok) {
        console.log('       ' + result.error);
    }
}).then(function (results) {
    var failed = results.filter(function (r) {
        return !r.ok;
    }).length;

    console.log('\n' + (results.length - failed) + ' de ' + results.length + ' testes passaram.');
    window.close();
    process.exit(failed ? 1 : 0);
});
