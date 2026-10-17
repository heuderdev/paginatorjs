# 📄 `tests/harness.js`

- **Camada:** [📄 OUTROS ARQUIVOS](../../outros.md)
- **Linguagem:** javascript
- **Linhas:** 129

## Funções / Métodos

- `AssertionError(message)`
- `test(name, fn)`
- `withTimeout(promise, ms, name)`
- `cleanup(sandbox)`
- `run(onResult)`
- `next()`

## Código-fonte

```javascript
(function (window) {
    'use strict';

    var tests = [];

    function AssertionError(message) {
        this.name = 'AssertionError';
        this.message = message;
    }

    AssertionError.prototype = Object.create(Error.prototype);

    var assert = {
        ok: function (value, message) {
            if (!value) {
                throw new AssertionError(message || 'esperado verdadeiro');
            }
        },
        equal: function (actual, expected, message) {
            if (actual !== expected) {
                throw new AssertionError((message || 'valores diferentes') + ' | esperado: ' + JSON.stringify(expected) + ' | recebido: ' + JSON.stringify(actual));
            }
        },
        deepEqual: function (actual, expected, message) {
            var a = JSON.stringify(actual);
            var b = JSON.stringify(expected);

            if (a !== b) {
                throw new AssertionError((message || 'estruturas diferentes') + ' | esperado: ' + b + ' | recebido: ' + a);
            }
        },
        throws: function (fn, pattern, message) {
            try {
                fn();
            } catch (e) {
                if (pattern && !pattern.test(String(e && e.message))) {
                    throw new AssertionError((message || 'mensagem de erro inesperada') + ' | recebido: ' + e.message);
                }

                return e;
            }

            throw new AssertionError(message || 'esperado lançar erro');
        }
    };

    function test(name, fn) {
        tests.push({ name: name, fn: fn });
    }

    function withTimeout(promise, ms, name) {
        return new Promise(function (resolve, reject) {
            var timer = window.setTimeout(function () {
                reject(new AssertionError('tempo esgotado (' + ms + ' ms) em: ' + name));
            }, ms);

            Promise.resolve(promise).then(function (value) {
                window.clearTimeout(timer);
                resolve(value);
            }, function (error) {
                window.clearTimeout(timer);
                reject(error);
            });
        });
    }

    function cleanup(sandbox) {
        if (window.HrPaginationjs) {
            window.HrPaginationjs.instances().forEach(function (instance) {
                instance.destroy();
            });
        }

        if (sandbox.parentNode) {
            sandbox.parentNode.removeChild(sandbox);
        }

        try {
            window.localStorage.clear();
        } catch (e) {
            return;
        }

        if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname);
        }
    }

    function run(onResult) {
        var results = [];
        var index = 0;

        function next() {
            if (index >= tests.length) {
                return Promise.resolve(results);
            }

            var current = tests[index++];
            var sandbox = window.document.createElement('div');

            sandbox.className = 'hrpjs-test-sandbox';
            window.document.body.appendChild(sandbox);

            var started = Date.now();

            return withTimeout(Promise.resolve().then(function () {
                return current.fn(assert, sandbox);
            }), 5000, current.name).then(function () {
                return { name: current.name, ok: true, ms: Date.now() - started };
            }, function (error) {
                return { name: current.name, ok: false, ms: Date.now() - started, error: error && error.message ? error.message : String(error) };
            }).then(function (result) {
                cleanup(sandbox);
                results.push(result);

                if (onResult) {
                    onResult(result, results.length, tests.length);
                }

                return next();
            });
        }

        return next();
    }

    window.HRPJS_TEST = test;
    window.HRPJS_RUN = run;
})(window);
```
