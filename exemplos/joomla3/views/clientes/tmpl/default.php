<?php

defined('_JEXEC') or die;

$base = 'index.php?option=com_loja&task=clientes.';
$url = function ($task) use ($base) {
    return JRoute::_($base . $task, false);
};

JHtml::_('jquery.framework');
JHtml::_('script', 'com_loja/pagination-2.6.0.min.js', array('relative' => true, 'version' => 'auto'));
JHtml::_('script', 'com_loja/hr-paginationjs.js', array('relative' => true, 'version' => 'auto'));
JHtml::_('stylesheet', 'com_loja/hr-paginationjs.css', array('relative' => true, 'version' => 'auto'));

$usuario = (int) JFactory::getUser()->id;
?>

<?php echo JHtml::_('form.token'); ?>

<div id="clientes"
     data-paginationjs
     data-paginationjs-remote="<?php echo htmlspecialchars($url('listar'), ENT_QUOTES, 'UTF-8'); ?>"
     data-paginationjs-limit="20"
     data-paginationjs-limits="10,20,50,100"
     data-paginationjs-sort="criado"
     data-paginationjs-direction="desc"
     data-paginationjs-persist="columns,limit,sort"
     data-paginationjs-namespace="com_loja"
     data-paginationjs-user="<?php echo $usuario; ?>"
     data-paginationjs-version="1"
     data-paginationjs-url
     data-paginationjs-url-prefix="cli_">

    <form class="form-inline" data-paginationjs-filters>
        <label>Buscar
            <input type="search" data-paginationjs-search autocomplete="off">
        </label>
        <label>Status
            <select name="status">
                <option value="">Todos</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
            </select>
        </label>
        <label>UF
            <select name="uf[]" multiple size="3">
                <option value="SP">SP</option>
                <option value="RJ">RJ</option>
                <option value="MG">MG</option>
                <option value="PR">PR</option>
                <option value="RS">RS</option>
            </select>
        </label>
        <label>Limite mínimo
            <input name="limite_min" data-paginationjs-type="number" inputmode="decimal">
        </label>
        <label>De <input type="date" name="de"></label>
        <label>Até <input type="date" name="ate"></label>
        <button type="button" class="btn" data-paginationjs-clear>Limpar</button>
        <button type="button" class="btn" data-paginationjs-reload>Atualizar</button>
        <label>Por página <select data-paginationjs-page-size></select></label>
        <div data-paginationjs-columns></div>
    </form>

    <table class="table table-striped">
        <thead>
            <tr>
                <th data-paginationjs-key="id" data-paginationjs-sortable data-paginationjs-required>ID</th>
                <th data-paginationjs-key="nome" data-paginationjs-sortable data-paginationjs-required>Nome</th>
                <th data-paginationjs-key="email" data-paginationjs-sortable data-paginationjs-format="email">E-mail</th>
                <th data-paginationjs-key="cidade" data-paginationjs-sortable data-paginationjs-template="tpl-cidade">Cidade</th>
                <th data-paginationjs-key="limite" data-paginationjs-field="limite_credito" data-paginationjs-sortable data-paginationjs-format="money" data-paginationjs-align="right">Limite</th>
                <th data-paginationjs-key="status" data-paginationjs-sortable data-paginationjs-template="tpl-status">Status</th>
                <th data-paginationjs-key="criado" data-paginationjs-field="created_at" data-paginationjs-sortable data-paginationjs-sort-first="desc" data-paginationjs-format="datetime">Cadastro</th>
                <th data-paginationjs-key="acoes" data-paginationjs-actions data-paginationjs-template="tpl-acoes">Ações</th>
            </tr>
        </thead>
    </table>
</div>

<template id="tpl-cidade">{cidade}/{uf}</template>
<template id="tpl-status"><span class="label label-{status}">{status}</span></template>
<template id="tpl-acoes">
    <a class="btn btn-small" href="<?php echo htmlspecialchars(JRoute::_('index.php?option=com_loja&view=cliente&layout=edit', false), ENT_QUOTES, 'UTF-8'); ?>&amp;id={id}">Editar</a>
    <button type="button" class="btn btn-small" data-paginationjs-if="status=ativo"
            data-paginationjs-action="desativar"
            data-paginationjs-action-remote="<?php echo htmlspecialchars($url('alterarStatus'), ENT_QUOTES, 'UTF-8'); ?>"
            data-paginationjs-param-status="inativo">Desativar</button>
    <button type="button" class="btn btn-small" data-paginationjs-if="status=inativo"
            data-paginationjs-action="ativar"
            data-paginationjs-action-remote="<?php echo htmlspecialchars($url('alterarStatus'), ENT_QUOTES, 'UTF-8'); ?>"
            data-paginationjs-param-status="ativo">Ativar</button>
    <button type="button" class="btn btn-small btn-danger"
            data-paginationjs-action="excluir"
            data-paginationjs-action-remote="<?php echo htmlspecialchars($url('excluir'), ENT_QUOTES, 'UTF-8'); ?>"
            data-paginationjs-action-confirm="Excluir o cliente {nome}?">Excluir</button>
</template>
