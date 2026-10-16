# Exemplos

Receitas prontas para **implementar** cada recurso na sua tela. Todo bloco tem o botão **Copiar**.
O código é o que vai na view (HTML + atributos `data-paginationjs-*`); JavaScript só aparece quando o recurso é
específico de JavaScript.

Os blocos **⇄ Requisição gerada** mostram o que a tela envia ao endpoint, para você saber o que o controller recebe.
Os blocos **👁 Como fica na tela** são ilustrações do resultado.

## Como funciona

<div class="flow"><svg viewBox="0 0 860 170" role="img" aria-labelledby="flow-t flow-d" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="13"><title id="flow-t">Fluxo de uma listagem</title><desc id="flow-d">A view declara a tela em HTML; o hr-paginationjs monta a requisição, chama o endpoint, valida a resposta do ApiResponseHelper e desenha tabela, resumo e paginação.</desc><defs><marker id="seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#5d6b82"/></marker></defs><g stroke="#5d6b82" stroke-width="1.5" fill="none"><rect x="10" y="40" width="170" height="90" rx="10" fill="#e8f0fc" stroke="#1f5fbf"/><rect x="250" y="40" width="190" height="90" rx="10" fill="#ecfdf3" stroke="#12b76a"/><rect x="510" y="40" width="160" height="90" rx="10" fill="#fff8e6" stroke="#f2c94c"/><rect x="740" y="40" width="110" height="90" rx="10" fill="#f4f3ff" stroke="#7a5af8"/><path d="M180 85 H246" marker-end="url(#seta)"/><path d="M440 72 H506" marker-end="url(#seta)"/><path d="M510 100 H444" marker-end="url(#seta)"/><path d="M670 85 H736" marker-end="url(#seta)"/></g><g fill="#1d2939" text-anchor="middle"><text x="95" y="70" font-weight="700">Sua view</text><text x="95" y="92">HTML +</text><text x="95" y="110">data-paginationjs-*</text><text x="345" y="70" font-weight="700">hr-paginationjs</text><text x="345" y="92">estado, busca, filtros,</text><text x="345" y="110">ordenação, colunas</text><text x="590" y="70" font-weight="700">Seu endpoint</text><text x="590" y="92">ApiResponseHelper</text><text x="590" y="110">::paginated()</text><text x="795" y="70" font-weight="700">Tela</text><text x="795" y="92">tabela, resumo,</text><text x="795" y="110">Pagination.js</text></g><g fill="#5d6b82" font-size="11" text-anchor="middle"><text x="473" y="64">page, limit, sort…</text><text x="473" y="122">JSON</text></g></svg></div>

## Índice dos exemplos

<div class="cards">
<a href="exemplos-telas.html"><strong>Montando a tela</strong><span>Mínimo, toolbar, posição dos controles, POST, parâmetros fixos, nomes</span></a>
<a href="exemplos-colunas.html"><strong>Colunas</strong><span>Campos, formatadores, templates, condições, colunas ocultas e obrigatórias</span></a>
<a href="exemplos-busca.html"><strong>Busca</strong><span>Debounce, mínimo de caracteres, campo externo, nome do parâmetro</span></a>
<a href="exemplos-filtros.html"><strong>Filtros</strong><span>Select, checkbox, radio, número, data, múltiplos, aplicar no envio, limpar</span></a>
<a href="exemplos-ordenacao-paginacao.html"><strong>Ordenação e paginação</strong><span>Ordem inicial, quantidade por página, botões do Pagination.js</span></a>
<a href="exemplos-acoes.html"><strong>Ações por linha</strong><span>Evento, ação remota com confirmação e token, modal próprio</span></a>
<a href="exemplos-estados-textos.html"><strong>Estados e textos</strong><span>Carregando, vazio, erro, sessão expirada, textos personalizados</span></a>
<a href="exemplos-preferencias-url-cache.html"><strong>Preferências, URL e cache</strong><span>Lembrar colunas, estado no link, voltar/avançar, cache</span></a>
<a href="exemplos-javascript.html"><strong>JavaScript</strong><span>Cada método da API, eventos, init manual, destruir e recriar</span></a>
<a href="exemplos-integracoes.html"><strong>Integrações</strong><span>Joomla 3, DataTables legado, adaptador próprio, abas, tema</span></a>
</div>

## O modelo usado nos exemplos

Para não repetir, os exemplos usam uma listagem de clientes cujo endpoint devolve estes campos:

```json Uma linha de data[]
{
    "id": 42,
    "nome": "Ana Silva",
    "email": "ana.silva42@exemplo.com.br",
    "uf": "SP",
    "cidade": "São Paulo",
    "endereco": { "cidade": "São Paulo", "uf": "SP", "cep": "01000-420" },
    "limite_credito": 12500.5,
    "status": "ativo",
    "vip": true,
    "categoria": "varejo",
    "nascimento": "1984-07-12",
    "created_at": "2025-03-14 10:32:00",
    "site": "https://www.exemplo.com.br/cliente/42"
}
```

E a resposta completa segue o `ApiResponseHelper::paginated()`:

```json Resposta do endpoint
{
    "success": true,
    "status": "sucesso",
    "mensagem": "Registros carregados.",
    "data": [ { "id": 42, "nome": "Ana Silva" } ],
    "errors": [],
    "request_id": "6bf735c3d97b99f4",
    "meta": { "paginacao": { "total": 137, "por_pagina": 20, "pagina_atual": 1, "total_paginas": 7 } }
}
```

> **Dica:** em todos os exemplos, os scripts são carregados uma vez por página, nesta ordem:
> `jQuery` → `pagination-2.6.0.min.js` → `hr-paginationjs.min.js`. Veja [Instalação](instalacao.md).
