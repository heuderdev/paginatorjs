<?php

/*
 * API de demonstração no contrato do ApiResponseHelper::paginated().
 *   GET  api.php?page=&limit=&sort=&direction=&search=&status[]=&uf[]=&limite_min=&de=&ate=
 *   POST api.php?task=excluir  (id + token)
 *   POST api.php?task=status   (id, status + token)
 * Parâmetro extra só da demo: simular=lento|erro|falha|sessao|invalida
 */

require __DIR__ . '/dados.php';

$task = demo_texto('task', 'listar');

if ($task === 'excluir') {
    demo_exigir_token();

    $id = (int) demo_texto('id', '0');
    $existe = false;

    foreach (demo_clientes() as $cliente) {
        if ($cliente['id'] === $id) {
            $existe = true;
        }
    }

    if (!$existe) {
        demo_responder(404, false, 'erro', 'Este cliente não existe mais.', null);
    }

    $_SESSION['demo_excluidos'][$id] = true;

    demo_responder(200, true, 'sucesso', 'Cliente excluído.', null);
}

if ($task === 'status') {
    demo_exigir_token();

    $id = (int) demo_texto('id', '0');
    $status = demo_texto('status');

    if ($id <= 0 || !in_array($status, array('ativo', 'inativo'), true)) {
        demo_responder(400, false, 'erro', 'Informe o cliente e o novo status.', null);
    }

    $_SESSION['demo_status'][$id] = $status;

    demo_responder(200, true, 'sucesso', $status === 'ativo' ? 'Cliente ativado.' : 'Cliente desativado.', null);
}

if ($task === 'reiniciar') {
    demo_exigir_token();
    unset($_SESSION['demo_excluidos'], $_SESSION['demo_status']);

    demo_responder(200, true, 'sucesso', 'Dados da demonstração restaurados.', null);
}

demo_simular();

$limite = (int) demo_texto('limit', '20');
$limite = $limite <= 0 ? 20 : min($limite, 100);
$pagina = max(1, (int) demo_texto('page', '1'));
$direcao = strtoupper(demo_texto('direction', 'DESC')) === 'ASC' ? 'ASC' : 'DESC';

$lista = demo_filtrar(demo_clientes(), demo_texto('search'));
$lista = demo_ordenar($lista, demo_texto('sort', 'criado'), $direcao);
$resultado = demo_paginar($lista, $limite, $pagina);

demo_responder(200, true, 'sucesso', 'Registros carregados.', $resultado['itens'], array(), array(
    'paginacao' => array(
        'total' => $resultado['total'],
        'por_pagina' => $resultado['por_pagina'],
        'pagina_atual' => $resultado['pagina_atual'],
        'total_paginas' => $resultado['total_paginas'],
    ),
));
