# 📄 `tests/run-node.js`

- **Camada:** [📄 OUTROS ARQUIVOS](../../outros.md)
- **Linguagem:** javascript
- **Linhas:** 78

## Imports

- `fs`
- `path`

## Funções / Métodos

- `loadJsdom()`
- `option(name, envName, fallback)`

## Código-fonte

```javascript
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

    console.error('jsdom não encontrado. Rode "npm install" na raiz do projeto.');
    process.exit(2);
}

var root = path.resolve(__dirname, '..');

function option(name, envName, fallback) {
    var index = process.argv.indexOf('--' + name);

    if (index !== -1 && process.argv[index + 1]) {
        return path.resolve(process.argv[index + 1]);
    }

    return process.env[envName] ? path.resolve(process.env[envName]) : path.join(root, fallback);
}

var jqueryFile = option('jquery', 'HRPJS_JQUERY', 'vendor/jquery-1.12.4.min.js');
var libFile = option('lib', 'HRPJS_LIB', 'src/hr-paginationjs.js');

if (!fs.existsSync(libFile)) {
    console.error('Arquivo não encontrado: ' + path.relative(root, libFile) + (/dist/.test(libFile) ? ' (rode "npm run build")' : ''));
    process.exit(2);
}

var JSDOM = loadJsdom().JSDOM;
var dom = new JSDOM('<!doctype html><html lang="pt-BR"><head></head><body></body></html>', {
    url: 'http://localhost/tests/runner.html',
    runScripts: 'outside-only',
    pretendToBeVisual: true
});
var window = dom.window;

window.eval(fs.readFileSync(jqueryFile, 'utf8') + '\n//# sourceURL=' + path.basename(jqueryFile));
console.log('jQuery ' + window.jQuery.fn.jquery + ' (' + path.basename(jqueryFile) + ')');
console.log('Biblioteca: ' + path.relative(root, libFile).replace(/\\/g, '/'));

[
    path.join(root, 'vendor/pagination-2.6.0.min.js'),
    libFile,
    path.join(root, 'tests/harness.js'),
    path.join(root, 'tests/hr-paginationjs.tests.js')
].forEach(function (file) {
    window.eval(fs.readFileSync(file, 'utf8') + '\n//# sourceURL=' + path.basename(file));
});

window.HRPJS_RUN(function (result) {
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
```
