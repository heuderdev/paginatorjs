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
