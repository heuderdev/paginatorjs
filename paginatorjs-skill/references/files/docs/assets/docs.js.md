# 📄 `docs/assets/docs.js`

- **Camada:** [📄 OUTROS ARQUIVOS](../../../outros.md)
- **Linguagem:** javascript
- **Linhas:** 55

## Funções / Métodos

- `copiarTexto(texto)`

## Código-fonte

```javascript
(function (window, document) {
    'use strict';

    function copiarTexto(texto) {
        if (window.navigator.clipboard && window.isSecureContext) {
            return window.navigator.clipboard.writeText(texto);
        }

        return new Promise(function (resolve, reject) {
            var area = document.createElement('textarea');

            area.value = texto;
            area.setAttribute('readonly', '');
            area.style.position = 'fixed';
            area.style.top = '-1000px';
            document.body.appendChild(area);
            area.select();

            try {
                if (document.execCommand('copy')) {
                    resolve();
                } else {
                    reject(new Error('copy'));
                }
            } catch (e) {
                reject(e);
            } finally {
                document.body.removeChild(area);
            }
        });
    }

    document.addEventListener('click', function (e) {
        var botao = e.target.closest ? e.target.closest('.copy') : null;

        if (!botao) {
            return;
        }

        var code = botao.closest('.code-block').querySelector('pre code');
        var original = botao.getAttribute('data-label');

        copiarTexto(code.textContent).then(function () {
            botao.textContent = 'Copiado ✓';
            botao.classList.add('is-ok');
        }, function () {
            botao.textContent = 'Use Ctrl+C';
        }).then(function () {
            window.setTimeout(function () {
                botao.textContent = original;
                botao.classList.remove('is-ok');
            }, 1800);
        });
    });
})(window, document);
```
