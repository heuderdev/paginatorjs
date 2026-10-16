<?php

/*
 * Base falsa compartilhada pelas APIs de demonstração (sem Joomla e sem banco).
 * Reproduz o envelope do ApiResponseHelper e a paginação do OrmBase::paginate():
 * filtra, conta com os mesmos filtros, ordena de forma estável e só então corta a página.
 * Exclusões e mudanças de status ficam na sessão para a demonstração ser interativa.
 */

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

function demo_token()
{
    if (empty($_SESSION['demo_token'])) {
        $_SESSION['demo_token'] = bin2hex(random_bytes(16));
    }

    return $_SESSION['demo_token'];
}

function demo_clientes()
{
    $nomes = array('Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Fábio', 'Gabriela', 'Heitor', 'Íris', 'João', 'Karina', 'Lucas', 'Marina', 'Nicolas', 'Olívia', 'Paulo', 'Quésia', 'Rafael', 'Sofia', 'Tiago');
    $sobrenomes = array('Silva', 'Souza', 'Oliveira', 'Pereira', 'Costa', 'Rodrigues', 'Almeida', 'Nascimento', 'Lima', 'Araújo');
    $ufs = array('SP', 'RJ', 'MG', 'PR', 'RS', 'BA', 'GO');
    $cidades = array('SP' => 'São Paulo', 'RJ' => 'Rio de Janeiro', 'MG' => 'Belo Horizonte', 'PR' => 'Curitiba', 'RS' => 'Porto Alegre', 'BA' => 'Salvador', 'GO' => 'Goiânia');
    $excluidos = isset($_SESSION['demo_excluidos']) ? $_SESSION['demo_excluidos'] : array();
    $status = isset($_SESSION['demo_status']) ? $_SESSION['demo_status'] : array();
    $lista = array();

    for ($i = 1; $i <= 237; $i++) {
        if (isset($excluidos[$i])) {
            continue;
        }

        $nome = $nomes[($i * 7) % count($nomes)] . ' ' . $sobrenomes[($i * 3) % count($sobrenomes)];
        $uf = $ufs[$i % count($ufs)];
        $email = strtolower(iconv('UTF-8', 'ASCII//TRANSLIT', str_replace(' ', '.', $nome))) . $i . '@exemplo.com.br';

        $lista[] = array(
            'id' => $i,
            'nome' => $i === 13 ? '<img src=x onerror=alert("xss")> Cliente malicioso' : $nome,
            'email' => preg_replace('/[^a-z0-9.@]/', '', $email),
            'uf' => $uf,
            'cidade' => $cidades[$uf],
            'limite_credito' => round(500 + (($i * 7919) % 50000) + ($i % 100) / 100, 2),
            'status' => isset($status[$i]) ? $status[$i] : ($i % 5 === 0 ? 'inativo' : 'ativo'),
            'created_at' => date('Y-m-d H:i:s', mktime(9 + ($i % 9), ($i * 13) % 60, 0, 1 + ($i % 12), 1 + ($i % 28), 2025)),
            'site' => $i % 4 === 0 ? 'https://www.exemplo.com.br/cliente/' . $i : null,
        );
    }

    return $lista;
}

function demo_texto($nome, $padrao = '')
{
    if (!isset($_REQUEST[$nome]) || is_array($_REQUEST[$nome])) {
        return $padrao;
    }

    return trim((string) $_REQUEST[$nome]);
}

function demo_lista($nome)
{
    if (!isset($_REQUEST[$nome])) {
        return array();
    }

    $valores = is_array($_REQUEST[$nome]) ? $_REQUEST[$nome] : array($_REQUEST[$nome]);

    return array_values(array_filter(array_map('strval', $valores), 'strlen'));
}

function demo_filtrar(array $lista, $busca)
{
    $status = array_values(array_intersect(demo_lista('status'), array('ativo', 'inativo')));
    $ufs = array_values(array_intersect(demo_lista('uf'), array('SP', 'RJ', 'MG', 'PR', 'RS', 'BA', 'GO')));
    $limiteMin = demo_texto('limite_min');
    $de = demo_texto('de');
    $ate = demo_texto('ate');

    return array_values(array_filter($lista, function ($c) use ($busca, $status, $ufs, $limiteMin, $de, $ate) {
        if ($busca !== '' && mb_stripos($c['nome'], $busca, 0, 'UTF-8') === false && mb_stripos($c['email'], $busca, 0, 'UTF-8') === false) {
            return false;
        }

        if ($status && !in_array($c['status'], $status, true)) {
            return false;
        }

        if ($ufs && !in_array($c['uf'], $ufs, true)) {
            return false;
        }

        if ($limiteMin !== '' && is_numeric($limiteMin) && $c['limite_credito'] < (float) $limiteMin) {
            return false;
        }

        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $de) && substr($c['created_at'], 0, 10) < $de) {
            return false;
        }

        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $ate) && substr($c['created_at'], 0, 10) > $ate) {
            return false;
        }

        return true;
    }));
}

function demo_ordenar(array $lista, $campo, $direcao)
{
    $mapa = array(
        'id' => 'id',
        'nome' => 'nome',
        'email' => 'email',
        'cidade' => 'cidade',
        'limite' => 'limite_credito',
        'status' => 'status',
        'criado' => 'created_at',
    );

    $coluna = isset($mapa[$campo]) ? $mapa[$campo] : 'created_at';
    $fator = strtoupper($direcao) === 'ASC' ? 1 : -1;

    usort($lista, function ($a, $b) use ($coluna, $fator) {
        $cmp = is_string($a[$coluna]) ? strcmp($a[$coluna], $b[$coluna]) : ($a[$coluna] < $b[$coluna] ? -1 : ($a[$coluna] > $b[$coluna] ? 1 : 0));

        if ($cmp === 0) {
            return $b['id'] - $a['id'];
        }

        return $cmp * $fator;
    });

    return $lista;
}

function demo_paginar(array $lista, $porPagina, $pagina)
{
    $porPagina = max(1, (int) $porPagina);
    $pagina = max(1, (int) $pagina);
    $total = count($lista);

    return array(
        'itens' => array_slice($lista, ($pagina - 1) * $porPagina, $porPagina),
        'total' => $total,
        'por_pagina' => $porPagina,
        'pagina_atual' => $pagina,
        'total_paginas' => (int) ceil($total / $porPagina),
    );
}

function demo_responder($httpStatus, $success, $status, $mensagem, $data, $errors = array(), $meta = array())
{
    $requestId = bin2hex(random_bytes(8));

    http_response_code($httpStatus);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Request-Id: ' . $requestId);

    $resposta = array(
        'success' => $success,
        'status' => $status,
        'mensagem' => $mensagem,
        'data' => $data,
        'errors' => $errors,
        'request_id' => $requestId,
    );

    if (!empty($meta)) {
        $resposta['meta'] = $meta;
    }

    echo json_encode($resposta, JSON_UNESCAPED_UNICODE);
    exit;
}

function demo_simular()
{
    $simular = demo_texto('simular');

    if ($simular === 'lento') {
        usleep(1500000);
    }

    if ($simular === 'erro') {
        demo_responder(500, false, 'erro', 'Ocorreu um erro interno ao processar a solicitação.', null);
    }

    if ($simular === 'falha') {
        demo_responder(200, false, 'erro', 'O filtro informado não é aceito por esta listagem.', null, array('simular' => array('Valor não permitido.')));
    }

    if ($simular === 'sessao') {
        demo_responder(401, false, 'erro', 'Usuário não autenticado.', null);
    }

    if ($simular === 'invalida') {
        http_response_code(200);
        header('Content-Type: text/html; charset=utf-8');
        echo '<html><body>Página de login do Joomla</body></html>';
        exit;
    }
}

function demo_exigir_token()
{
    $token = demo_token();

    if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_POST[$token]) || $_POST[$token] !== '1') {
        demo_responder(403, false, 'erro', 'Sua sessão expirou. Recarregue a página e tente novamente.', null);
    }
}
