<?php

/*
 * API legada de demonstração no formato DataTables (server-side):
 *   GET api-datatables.php?draw=&start=&length=&search_value=&order_col=&order_dir=&status[]=&uf[]=
 *   Resposta: { draw, recordsTotal, recordsFiltered, data }
 * Usada com data-paginationjs-adapter="datatables".
 */

require __DIR__ . '/dados.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$draw = (int) demo_texto('draw', '0');
$inicio = max(0, (int) demo_texto('start', '0'));
$tamanho = (int) demo_texto('length', '10');
$tamanho = $tamanho <= 0 ? 10 : min($tamanho, 100);
$direcao = strtoupper(demo_texto('order_dir', 'ASC')) === 'DESC' ? 'DESC' : 'ASC';

$todos = demo_clientes();
$lista = demo_filtrar($todos, demo_texto('search_value'));
$lista = demo_ordenar($lista, demo_texto('order_col', 'id'), $direcao);

echo json_encode(array(
    'draw' => $draw,
    'recordsTotal' => count($todos),
    'recordsFiltered' => count($lista),
    'data' => array_slice($lista, $inicio, $tamanho),
), JSON_UNESCAPED_UNICODE);
