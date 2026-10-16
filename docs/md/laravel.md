# Laravel

A biblioteca funciona igual no Laravel (Blade). O navegador não depende do framework; o que muda é **o que o
endpoint devolve** e **como o token CSRF é enviado**. Há dois caminhos para o endpoint:

| Caminho | Quando usar | Na view |
|---|---|---|
| **A.** `ResponseService::paginated()` | Projetos que já usam o `ResponseService.php` (mesmo contrato do `ApiResponseHelper` do Joomla) | nada a configurar |
| **B.** `paginate()` puro ou API Resource | Projetos Laravel comuns | `data-paginationjs-adapter="laravel"` |

> **Resultado:** verificado num Laravel 13.37 real (SQLite, `VerifyCsrfToken` ativo): listagem, paginação,
> ordenação, filtros `uf[]`, busca, ações `POST` e `DELETE` (via `_method`), validação 422, 401, token vencido
> (419), `paginate()` puro e API Resource — 16 de 16 verificações.

## Layout Blade

```html resources/views/layouts/app.blade.php
<head>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="stylesheet" href="{{ asset('vendor/hr-paginationjs/hr-paginationjs.min.css') }}">
</head>
<body>
    @yield('content')

    <script src="{{ asset('js/jquery.min.js') }}"></script>
    <script src="{{ asset('vendor/hr-paginationjs/pagination-2.6.0.min.js') }}"></script>
    <script src="{{ asset('vendor/hr-paginationjs/hr-paginationjs.min.js') }}"></script>
</body>
```

Copie `dist/hr-paginationjs.min.js`, `dist/hr-paginationjs.min.css` e `dist/pagination-2.6.0.min.js` para
`public/vendor/hr-paginationjs/`. O jQuery pode ser qualquer versão de 1.7 a 4.x (inclusive *slim*), inclusive o
que já vem no seu `vite`/`app.js` — desde que esteja em `window.jQuery` antes do Pagination.js.

## A. Com ResponseService (mesmo contrato do Joomla)

```php routes/web.php
use App\Http\Controllers\ClienteController;

Route::get('/clientes', [ClienteController::class, 'index'])->name('clientes.index');
Route::get('/clientes/dados', [ClienteController::class, 'listar'])->name('clientes.listar');
Route::post('/clientes/{cliente}/status', [ClienteController::class, 'status'])->name('clientes.status');
Route::delete('/clientes/{cliente}', [ClienteController::class, 'destroy'])->name('clientes.destroy');
```

```php app/Http/Controllers/ClienteController.php
<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Services\ResponseService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClienteController extends Controller
{
    private const ORDENAVEIS = ['id' => 'id', 'nome' => 'nome', 'limite' => 'limite_credito', 'criado' => 'created_at'];

    public function index()
    {
        return view('clientes.index');
    }

    public function listar(Request $request)
    {
        $this->authorize('viewAny', Cliente::class);

        $limite = min(100, max(1, $request->integer('limit', 20)));
        $sort = array_key_exists((string) $request->input('sort'), self::ORDENAVEIS) ? (string) $request->input('sort') : 'criado';
        $direcao = $request->input('direction') === 'asc' ? 'asc' : 'desc';
        $busca = trim((string) $request->input('search'));

        $query = Cliente::query()
            ->select('id', 'nome', 'email', 'uf', 'limite_credito', 'status', 'created_at')
            ->when($busca !== '', fn ($q) => $q->where(fn ($g) => $g
                ->where('nome', 'like', "%{$busca}%")
                ->orWhere('email', 'like', "%{$busca}%")))
            ->when($request->filled('status'), fn ($q) => $q->whereIn('status',
                array_intersect((array) $request->input('status'), ['ativo', 'inativo'])))
            ->when($request->filled('uf'), fn ($q) => $q->whereIn('uf', (array) $request->input('uf')))
            ->orderBy(self::ORDENAVEIS[$sort], $direcao)
            ->orderBy('id', 'desc');

        return ResponseService::paginated($query->paginate($limite));
    }

    public function status(Request $request, Cliente $cliente)
    {
        $this->authorize('update', $cliente);

        $dados = $request->validate(['status' => ['required', Rule::in(['ativo', 'inativo'])]]);
        $cliente->update($dados);

        return ResponseService::updated($dados['status'] === 'ativo' ? 'Cliente ativado.' : 'Cliente desativado.');
    }

    public function destroy(Cliente $cliente)
    {
        $this->authorize('delete', $cliente);
        $cliente->delete();

        return ResponseService::deleted('Cliente excluído.');
    }
}
```

> **Dica:** o `paginate()` do Laravel já lê o parâmetro `page` sozinho; você só lê `limit`, `sort`, `direction`,
> `search` e os filtros.

Para que validação (422), `abort(401/403)`, token vencido (419) e exceções também saiam no envelope, registre o
`ResponseService::fromThrowable()`:

```php bootstrap/app.php (Laravel 11+)
->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
        if ($request->expectsJson()) {
            return \App\Services\ResponseService::fromThrowable($e);
        }
    });
})
```

## B. Com `paginate()` puro ou API Resource

Sem `ResponseService`, basta indicar o adaptador `laravel`:

```html
<div id="clientes" data-paginationjs
     data-paginationjs-adapter="laravel"
     data-paginationjs-remote="{{ route('clientes.listar') }}">
    ...
</div>
```

```php O controller pode devolver qualquer um destes
return Cliente::query()->orderBy('id')->paginate($limite);                     // paginate() puro

return ClienteResource::collection(Cliente::query()->paginate($limite));       // API Resource

return ResponseService::paginated(Cliente::query()->paginate($limite));        // envelope (também aceito)
```

```json paginate() puro — o que o adaptador lê
{ "current_page": 2, "data": [ ... ], "per_page": 20, "total": 137, "last_page": 7, "...": "..." }
```

```json API Resource — o que o adaptador lê
{ "data": [ ... ], "links": { ... }, "meta": { "current_page": 2, "per_page": 20, "total": 137, "last_page": 7 } }
```

> **Atenção:** use `paginate()`. `simplePaginate()` e `cursorPaginate()` não informam o total, então a listagem
> mostra “resposta inválida” em vez de uma lista incompleta.

## A view

```html resources/views/clientes/index.blade.php
@extends('layouts.app')

@section('content')
<div id="clientes"
     data-paginationjs
     data-paginationjs-remote="{{ route('clientes.listar') }}"
     data-paginationjs-csrf="header"
     data-paginationjs-sort="criado"
     data-paginationjs-direction="desc"
     data-paginationjs-persist
     data-paginationjs-user="{{ auth()->id() }}"
     data-paginationjs-toolbar="search,limit,columns,reload">

    <form data-paginationjs-filters>
        <select name="status" aria-label="Status">
            <option value="">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
        </select>
        <label><input type="checkbox" name="uf[]" value="SP"> SP</label>
        <label><input type="checkbox" name="uf[]" value="RJ"> RJ</label>
    </form>

    <table class="table">
        <thead>
            <tr>
                <th data-paginationjs-key="id" data-paginationjs-sortable data-paginationjs-required>ID</th>
                <th data-paginationjs-key="nome" data-paginationjs-sortable>Nome</th>
                <th data-paginationjs-key="limite" data-paginationjs-field="limite_credito"
                    data-paginationjs-sortable data-paginationjs-format="money">Limite</th>
                <th data-paginationjs-key="criado" data-paginationjs-field="created_at"
                    data-paginationjs-sortable data-paginationjs-format="datetime">Cadastro</th>
                <th data-paginationjs-key="acoes" data-paginationjs-actions data-paginationjs-template="tpl-acoes">Ações</th>
            </tr>
        </thead>
    </table>
</div>

<template id="tpl-acoes">
    <button type="button" data-paginationjs-if="status=ativo"
            data-paginationjs-action="desativar"
            data-paginationjs-action-remote="{{ url('/clientes') }}/{id}/status"
            data-paginationjs-param-status="inativo">Desativar</button>

    <button type="button"
            data-paginationjs-action="excluir"
            data-paginationjs-action-remote="{{ url('/clientes') }}/{id}"
            data-paginationjs-param-_method="DELETE"
            data-paginationjs-action-confirm="Excluir {nome}?">Excluir</button>
</template>
@endsection
```

> **Atenção:** no Blade, `{{ }}` é do Laravel e `{id}` / `{nome}` (chave simples) são da biblioteca — os dois
> convivem sem conflito. Se precisar escrever `{{` literal dentro de um template, use `@{{`.

## Token CSRF no Laravel

| Na página | O que a biblioteca envia |
|---|---|
| `<meta name="csrf-token" content="{{ csrf_token() }}">` | cabeçalho `X-CSRF-Token` (o `VerifyCsrfToken` aceita) |
| `@csrf` (campo `_token`) na página | cabeçalho `X-CSRF-Token` |

```http Ação "Desativar" com data-paginationjs-csrf="header"
POST /clientes/42/status
X-CSRF-Token: m3Jq…Yv0a
X-Requested-With: XMLHttpRequest

id=42&status=inativo
```

> **Dica:** use `data-paginationjs-csrf="header"` nas listagens do Laravel. Sem ele, quando o token vem só da
> `<meta>`, a biblioteca também acrescenta o campo `<token>=1` no corpo (formato do Joomla) — o Laravel ignora,
> mas o campo aparece em `$request->all()`. Com `@csrf` na página, só o cabeçalho é enviado automaticamente.

## PUT, PATCH e DELETE

As ações saem como `POST` (ou `GET`). Para rotas `Route::delete`/`put`/`patch`, envie `_method`:

```html
<button type="button"
        data-paginationjs-action="excluir"
        data-paginationjs-action-remote="{{ url('/clientes') }}/{id}"
        data-paginationjs-param-_method="DELETE">Excluir</button>
```

## Respostas de erro

| O Laravel responde | A listagem mostra / `kind` |
|---|---|
| 401 (não autenticado) | `session` — mensagem do servidor |
| 419 (token/sessão vencidos) | `session` — mensagem do servidor |
| 403 (`authorize`) | `permission` |
| 422 (`validate`) | `http` — com `ResponseService`, a primeira mensagem de validação; sem ele, o `message` do Laravel |
| 500 | `http` — mensagem pública (nunca o stack trace) |

```js Levar ao login quando a sessão acabar (401 ou 419)
document.addEventListener('hrpaginationjs:error', function (e) {
    if (e.detail.error.kind === 'session') {
        window.location.href = '/login';
    }
});
```

Ações aceitam como sucesso: envelope com `success: true`, qualquer JSON 2xx sem `success` (ex.:
`response()->json(['message' => 'Excluído.'])`, a mensagem aparece no aviso) e `204 No Content`
(`response()->noContent()`).
