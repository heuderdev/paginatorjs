# Laravel

A biblioteca funciona igual no Laravel (Blade). O navegador não depende do framework; o que muda é **o que o
endpoint devolve** e **como o token CSRF é enviado**. Há dois caminhos para o endpoint:

| Caminho | Quando usar | Na view |
|---|---|---|
| **A.** `ResponseService::paginated()` | Projetos que usam o `ResponseService.php` (mesmo contrato do `ApiResponseHelper` do Joomla) — [classe completa abaixo](#a-classe-responseservice-completa) | nada a configurar |
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

### A classe `ResponseService` completa

Copie o bloco abaixo inteiro para `app/Services/ResponseService.php` (o mesmo arquivo está em
[`exemplos/laravel/ResponseService.php`](https://github.com/heuderdev/paginatorjs/blob/main/exemplos/laravel/ResponseService.php)).
Não depende de nada além do Laravel: **PHP 8.1+ e Laravel 10+**. Se colocar em outra pasta, ajuste só o `namespace`.

`paginated()` aceita o paginator puro, um API Resource ou uma transformação por linha — o envelope sai sempre igual:

```php Formas de chamar paginated()
// 1. Linhas como o Eloquent serializa ($hidden, $casts e $appends valem)
return ResponseService::paginated($query->paginate($limite));

// 2. Linhas pelo API Resource ($this->when(), relações carregadas, additional() → meta)
return ResponseService::paginated(ClienteResource::collection($query->paginate($limite)));

// 3. O mesmo, passando só a classe
return ResponseService::paginated($query->paginate($limite), transform: ClienteResource::class);

// 4. Transformação simples por linha, com meta extra
return ResponseService::paginated(
    $query->paginate($limite),
    meta: ['filtros_aplicados' => $request->only('status', 'uf')],
    transform: fn (Cliente $c) => ['id' => $c->id, 'nome' => $c->nome, 'limite' => (float) $c->limite_credito],
);
```

| Garantia | Como |
|---|---|
| `data` é sempre lista e `meta.paginacao` sempre tem os 4 números | `array_values()` + `paginationMeta()`, aplicado por último (uma `meta` do controller não sobrescreve a paginação) |
| `simplePaginate()` / `cursorPaginate()` são recusados | `InvalidArgumentException` com mensagem clara — sem total a listagem não tem como paginar |
| Página além da última | `data: []` com o `total` real; a biblioteca pede a última página uma vez |
| Nenhuma lista vazia sem páginas | `total_paginas` é no mínimo 1 |
| Dados de banco legado (latin1) não derrubam a resposta | `JSON_INVALID_UTF8_SUBSTITUTE`: o byte inválido vira `�` em vez de erro 500 |
| Rastreável | `request_id` no corpo, no cabeçalho `X-Request-Id` e no log (reaproveita o do proxy quando seguro) |
| Nada vaza em produção | 500 com mensagem pública; detalhes só com `APP_DEBUG=true`, em `meta.debug` |
| Resposta sem cache | `Cache-Control: no-store` |
| `throw new HttpResponseException(...)` (ex.: `failedValidation` de FormRequest) | repassada como foi montada, não vira 500 |

> **Resultado:** verificado num Laravel 13.37 real: as quatro formas de chamar, Resource com `$this->when()` e
> `additional()`, `meta` do controller preservada, `simplePaginate()` recusado, lista vazia, página 99 de 14, UTF-8
> inválido, `HttpResponseException`, `findOrFail` (404 sem vazar a mensagem interna), exceção (500 público), `abort(401)`
> e token ausente (419) — 21 de 21 verificações.

```php app/Services/ResponseService.php
<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

/*
 * Envelope JSON único para a API (mesmo contrato do ApiResponseHelper do
 * Joomla), lido sem configuração pelo hr-paginationjs:
 *
 * {
 *     "success": true,
 *     "status": "sucesso",              // sucesso | erro | aviso | info
 *     "mensagem": "Registros carregados.",
 *     "data": [ ... ],
 *     "errors": {},                     // { "email": ["..."], "_general": ["..."] }
 *     "request_id": "9f2c...",
 *     "meta": { "paginacao": { "total": 137, "por_pagina": 20, "pagina_atual": 1, "total_paginas": 7 } }
 * }
 *
 * Requisitos: PHP 8.1+ e Laravel 10+.
 *
 * Instalação:
 *   1. Copie para app/Services/ResponseService.php (ajuste o namespace se usar outra pasta).
 *   2. Para que exceções (422, 401, 403, 404, 419, 429, 500...) também saiam
 *      neste formato, registre ResponseService::fromThrowable() (veja o método).
 *
 * Uso no controller:
 *   return ResponseService::paginated(Cliente::query()->paginate($limite));
 *   return ResponseService::paginated($query->paginate($limite), transform: ClienteResource::class);
 *   return ResponseService::created('Pedido salvo.', ['id' => $pedido->id]);
 *   return ResponseService::validationError(['email' => 'Já está em uso.']);
 */
final class ResponseService
{
    public const STATUS_SUCCESS = 'sucesso';
    public const STATUS_ERROR = 'erro';
    public const STATUS_WARNING = 'aviso';
    public const STATUS_INFO = 'info';

    public const GENERAL = '_general';

    // Dados vindos de bancos legados (latin1) não derrubam a resposta: o byte
    // inválido vira U+FFFD em vez de uma exceção de JSON.
    private const JSON_FLAGS = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE;

    private function __construct()
    {
    }

    // ------------------------------------------------------------------
    // Sucesso
    // ------------------------------------------------------------------

    public static function success(string $message = 'Operação realizada com sucesso.', mixed $data = null, array $meta = [], int $httpStatus = 200): JsonResponse
    {
        return self::respond(true, self::STATUS_SUCCESS, $message, $data, [], $httpStatus, $meta);
    }

    public static function created(string $message = 'Registro criado com sucesso.', mixed $data = null, array $meta = []): JsonResponse
    {
        return self::success($message, $data, $meta, 201);
    }

    public static function updated(string $message = 'Registro atualizado com sucesso.', mixed $data = null, array $meta = []): JsonResponse
    {
        return self::success($message, $data, $meta);
    }

    public static function deleted(string $message = 'Registro excluído com sucesso.', mixed $data = null, array $meta = []): JsonResponse
    {
        return self::success($message, $data, $meta);
    }

    public static function info(string $message, mixed $data = null, array $meta = []): JsonResponse
    {
        return self::respond(true, self::STATUS_INFO, $message, $data, [], 200, $meta);
    }

    public static function warning(string $message, mixed $data = null, array $meta = []): JsonResponse
    {
        return self::respond(true, self::STATUS_WARNING, $message, $data, [], 200, $meta);
    }

    /*
     * Listagem paginada: as linhas vão em "data" (sempre lista) e os números
     * em "meta.paginacao" — exatamente o que o hr-paginationjs lê.
     *
     * $source:
     *   $query->paginate($limite)                        → linhas como o Eloquent serializa
     *   ClienteResource::collection($query->paginate())  → linhas resolvidas pelo Resource
     *
     * $transform (opcional, quando $source é o paginator):
     *   ClienteResource::class                           → cada linha passa pelo Resource
     *   fn (Cliente $c) => ['id' => $c->id, ...]         → cada linha passa pela função
     *
     * Exige total: simplePaginate()/cursorPaginate() não informam quantas
     * páginas existem e são recusados aqui (erro do desenvolvedor, não do usuário).
     *
     * A página além da última volta com data: [] e o total real; o
     * hr-paginationjs detecta e pede a última página uma vez.
     */
    public static function paginated(
        LengthAwarePaginator|ResourceCollection $source,
        string $message = 'Registros carregados.',
        array $meta = [],
        callable|string|null $transform = null,
    ): JsonResponse {
        $request = request();

        if ($source instanceof LengthAwarePaginator && is_string($transform) && is_subclass_of($transform, JsonResource::class)) {
            $source = $transform::collection($source);
            $transform = null;
        }

        if ($source instanceof ResourceCollection) {
            $paginator = $source->resource;

            if (!$paginator instanceof LengthAwarePaginator) {
                throw new InvalidArgumentException('ResponseService::paginated() exige um Resource::collection() sobre paginate(); simplePaginate() e cursorPaginate() não informam o total.');
            }

            if ($transform !== null) {
                throw new InvalidArgumentException('ResponseService::paginated(): use $transform só com o paginator; o Resource já transforma as linhas.');
            }

            $rows = $source->resolve($request);

            // with() e additional() do Resource vão para "meta", sem sobrescrever o que o controller passou.
            $meta = array_merge($source->with($request), $source->additional, $meta);
        } elseif ($transform !== null) {
            if (!is_callable($transform)) {
                throw new InvalidArgumentException('ResponseService::paginated(): $transform deve ser uma classe JsonResource ou um callable.');
            }

            $paginator = $source;
            $rows = array_map($transform, $source->items());
        } else {
            $paginator = $source;
            $rows = $source->items();
        }

        // Por último: o controller não consegue sobrescrever a paginação real por engano.
        $meta['paginacao'] = self::paginationMeta($paginator);

        return self::success($message, array_values($rows), $meta);
    }

    // Os números de "meta.paginacao", para quem montar a resposta à mão.
    public static function paginationMeta(LengthAwarePaginator $paginator): array
    {
        return [
            'total' => $paginator->total(),
            'por_pagina' => $paginator->perPage(),
            'pagina_atual' => $paginator->currentPage(),
            'total_paginas' => max(1, $paginator->lastPage()),
        ];
    }

    // ------------------------------------------------------------------
    // Erros
    // ------------------------------------------------------------------

    /*
     * $errors aceita:
     *   'mensagem'                       → _general
     *   ['msg 1', 'msg 2']               → _general
     *   ['email' => 'msg']               → email: ['msg']
     *   ['email' => ['msg 1', 'msg 2']]
     */
    public static function error(string $message = 'Não foi possível concluir a operação.', mixed $data = null, array|string $errors = [], int $httpStatus = 400): JsonResponse
    {
        return self::respond(false, self::STATUS_ERROR, $message, $data, $errors, $httpStatus);
    }

    // 422 com a primeira mensagem em "mensagem" (é o que a listagem e o aviso mostram).
    public static function validationError(array|string $errors, ?string $message = null): JsonResponse
    {
        $errors = self::normalizeErrors($errors);

        return self::respond(false, self::STATUS_ERROR, $message ?? self::firstError($errors), null, $errors, 422);
    }

    public static function fromValidator(Validator $validator, ?string $message = null): JsonResponse
    {
        return self::validationError($validator->errors()->toArray(), $message);
    }

    public static function badRequest(string $message = 'Requisição inválida.', mixed $data = null): JsonResponse
    {
        return self::error($message, $data, [], 400);
    }

    public static function unauthorized(string $message = 'Usuário não autenticado.'): JsonResponse
    {
        return self::error($message, null, [], 401);
    }

    public static function forbidden(string $message = 'Você não possui permissão para esta operação.'): JsonResponse
    {
        return self::error($message, null, [], 403);
    }

    public static function notFound(string $message = 'Registro não encontrado.'): JsonResponse
    {
        return self::error($message, null, [], 404);
    }

    public static function methodNotAllowed(string $message = 'Método de requisição não permitido.'): JsonResponse
    {
        return self::error($message, null, [], 405);
    }

    public static function conflict(string $message = 'A operação não pode ser concluída devido a um conflito de dados.', mixed $data = null): JsonResponse
    {
        return self::error($message, $data, [], 409);
    }

    // Token CSRF vencido (status próprio do Laravel).
    public static function sessionExpired(string $message = 'Sua sessão expirou. Recarregue a página.'): JsonResponse
    {
        return self::error($message, null, [], 419);
    }

    public static function tooManyRequests(string $message = 'Muitas tentativas. Aguarde alguns instantes e tente novamente.', ?int $retryAfter = null): JsonResponse
    {
        $response = self::error($message, null, [], 429);

        if ($retryAfter) {
            $response->headers->set('Retry-After', (string) $retryAfter);
        }

        return $response;
    }

    public static function serviceUnavailable(string $message = 'Serviço temporariamente indisponível.'): JsonResponse
    {
        return self::error($message, null, [], 503);
    }

    /*
     * Registra a exceção no log (com o request_id) e devolve 500 com mensagem
     * pública. Só com APP_DEBUG=true os detalhes vão em meta.debug.
     */
    public static function exception(Throwable $error, string $publicMessage = 'Ocorreu um erro interno ao processar a solicitação.', array $context = []): JsonResponse
    {
        Log::error($error->getMessage(), array_merge($context, [
            'request_id' => self::requestId(),
            'exception' => $error,
        ]));

        $meta = [];

        if (config('app.debug')) {
            $meta['debug'] = [
                'tipo' => $error::class,
                'mensagem' => $error->getMessage(),
                'arquivo' => $error->getFile(),
                'linha' => $error->getLine(),
            ];
        }

        return self::respond(false, self::STATUS_ERROR, $publicMessage, null, [], 500, $meta);
    }

    /*
     * Converte qualquer exceção para o contrato.
     *
     * Laravel 11+ (bootstrap/app.php):
     *   ->withExceptions(function (Exceptions $exceptions): void {
     *       $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
     *           if ($request->expectsJson()) {
     *               return \App\Services\ResponseService::fromThrowable($e);
     *           }
     *       });
     *   })
     *
     * Laravel 10 (app/Exceptions/Handler.php, método register()):
     *   $this->renderable(function (\Throwable $e, $request) {
     *       if ($request->expectsJson()) {
     *           return \App\Services\ResponseService::fromThrowable($e);
     *       }
     *   });
     *
     * O hr-paginationjs envia X-Requested-With e Accept: application/json,
     * então expectsJson() é verdadeiro nas requisições dele.
     */
    public static function fromThrowable(Throwable $e): Response
    {
        return match (true) {
            // response()->json(...) lançado de propósito (ex.: failedValidation de um FormRequest) sai como foi montado.
            $e instanceof HttpResponseException => $e->getResponse(),
            $e instanceof ValidationException => self::validationError($e->errors()),
            $e instanceof AuthenticationException => self::unauthorized(),
            $e instanceof AuthorizationException => self::forbidden($e->getMessage() ?: 'Você não possui permissão para esta operação.'),
            $e instanceof ModelNotFoundException => self::notFound(),
            $e instanceof TokenMismatchException => self::sessionExpired(),
            $e instanceof ThrottleRequestsException => self::tooManyRequests(retryAfter: (int) ($e->getHeaders()['Retry-After'] ?? 0) ?: null),
            $e instanceof HttpExceptionInterface => self::fromHttpException($e),
            default => self::exception($e),
        };
    }

    /*
     * Um id por requisição: reaproveita o X-Request-Id recebido (proxy, load
     * balancer) quando é seguro, ou gera um; fica guardado na Request para o
     * log e todas as respostas da mesma requisição usarem o mesmo.
     */
    public static function requestId(): string
    {
        /** @var Request $request */
        $request = request();

        $id = $request->attributes->get('request_id');

        if (!is_string($id) || $id === '') {
            $header = (string) $request->headers->get('X-Request-Id', '');
            $id = preg_match('/^[A-Za-z0-9._-]{8,128}$/', $header) ? $header : bin2hex(random_bytes(16));
            $request->attributes->set('request_id', $id);
        }

        return $id;
    }

    // ------------------------------------------------------------------
    // Internos
    // ------------------------------------------------------------------

    private static function fromHttpException(HttpExceptionInterface $e): JsonResponse
    {
        $status = $e->getStatusCode();

        // abort(404), rota inexistente, 405, model não encontrado... chegam aqui.
        $message = match ($status) {
            401 => 'Usuário não autenticado.',
            403 => 'Você não possui permissão para esta operação.',
            404 => 'Registro não encontrado.',
            405 => 'Método de requisição não permitido.',
            413 => 'Os arquivos enviados ultrapassam o tamanho máximo permitido pelo servidor.',
            419 => 'Sua sessão expirou. Recarregue a página.',
            429 => 'Muitas tentativas. Aguarde alguns instantes e tente novamente.',
            503 => 'Serviço temporariamente indisponível.',
            default => $status >= 500 ? 'Ocorreu um erro interno ao processar a solicitação.' : 'Requisição inválida.',
        };

        // abort(403, 'Mensagem própria') mantém a mensagem; nas demais, a mensagem
        // interna do framework ("No query results for model...") nunca vaza.
        if ($status < 500 && $e->getMessage() !== '' && !in_array($status, [404, 405, 413, 419], true)) {
            $message = $e->getMessage();
        }

        $response = self::respond(false, self::STATUS_ERROR, $message, null, [], $status);
        $response->headers->add($e->getHeaders());

        return $response;
    }

    private static function respond(bool $success, string $status, string $message, mixed $data, array|string $errors, int $httpStatus, array $meta = []): JsonResponse
    {
        $errors = self::normalizeErrors($errors);

        if (!$success && trim($message) === '') {
            $message = self::firstError($errors);
        }

        $payload = [
            'success' => $success,
            'status' => $status,
            'mensagem' => $message,
            'data' => $data,
            // {} e não [] quando vazio, como no exemplo do contrato.
            'errors' => $errors === [] ? new \stdClass() : $errors,
            'request_id' => self::requestId(),
        ];

        if ($meta !== []) {
            $payload['meta'] = $meta;
        }

        return new JsonResponse($payload, $httpStatus, [
            'X-Request-Id' => $payload['request_id'],
            'Cache-Control' => 'no-store, no-cache, must-revalidate',
        ], self::JSON_FLAGS);
    }

    private static function normalizeErrors(array|string|null $errors): array
    {
        if ($errors === null || $errors === '' || $errors === []) {
            return [];
        }

        if (is_string($errors)) {
            return [self::GENERAL => [$errors]];
        }

        // Lista simples: ['msg 1', 'msg 2'] → _general
        if (array_is_list($errors) && count(array_filter($errors, 'is_scalar')) === count($errors)) {
            $errors = [self::GENERAL => $errors];
        }

        $normalized = [];

        foreach ($errors as $field => $messages) {
            $messages = array_values(array_filter(
                array_map('strval', (array) $messages),
                static fn (string $message): bool => $message !== ''
            ));

            if ($messages !== []) {
                $normalized[(string) $field] = $messages;
            }
        }

        return $normalized;
    }

    private static function firstError(array $errors, string $default = 'Corrija os campos informados.'): string
    {
        foreach ($errors as $messages) {
            if (!empty($messages)) {
                return (string) reset($messages);
            }
        }

        return $default;
    }
}
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
