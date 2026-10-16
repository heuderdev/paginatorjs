<?php

defined('_JEXEC') or die;

/*
 * Controller do exemplo Joomla 3 (com_loja) para hr-paginationjs.
 * Rotas (sem &format=json: o ApiResponseHelper responde JSON porque o jQuery envia
 * X-Requested-With: XMLHttpRequest e Accept: application/json):
 *   GET  index.php?option=com_loja&task=clientes.listar
 *   POST index.php?option=com_loja&task=clientes.alterarStatus  (id, status, token)
 *   POST index.php?option=com_loja&task=clientes.excluir        (id, token)
 */
class LojaControllerClientes extends JControllerLegacy
{
    private function tabela()
    {
        return OrmTables::table('#__loja_clientes', array(
            'fillable' => array('nome', 'email', 'uf', 'cidade', 'limite_credito', 'status'),
            'casts' => array('id' => 'int', 'limite_credito' => 'float'),
        ));
    }

    private function ordenaveis()
    {
        return array(
            'id' => 'id',
            'nome' => 'nome',
            'email' => 'email',
            'cidade' => 'cidade',
            'limite' => 'limite_credito',
            'status' => 'status',
            'criado' => 'created_at',
        );
    }

    public function listar()
    {
        try {
            if (!PermissionHelper::require('core.manage', 'com_loja')) {
                return;
            }

            $mapa = $this->ordenaveis();
            $pagina = InputHelper::pagination(20, 100);
            $ordem = InputHelper::sorting(array_keys($mapa), 'criado', 'DESC');

            $query = $this->filtrar(
                $this->tabela()->select('id, nome, email, uf, cidade, limite_credito, status, created_at')
            )
                ->orderBy($mapa[$ordem['field']], $ordem['direction'])
                ->orderBy('id', 'DESC');

            return ApiResponseHelper::paginated($query->paginate($pagina['limit'], $pagina['page']));
        } catch (Throwable $e) {
            return ApiResponseHelper::exception($e);
        }
    }

    private function filtrar($query)
    {
        $filtros = InputHelper::filters(array(
            'search' => 'string',
            'status' => 'array',
            'uf' => 'array',
            'limite_min' => 'float',
            'de' => 'string',
            'ate' => 'string',
        ));

        if (!empty($filtros['search'])) {
            $busca = $filtros['search'];

            $query->whereGroup(function ($g) use ($busca) {
                $g->whereLike('nome', $busca)->orWhereLike('email', $busca);
            });
        }

        if (!empty($filtros['status'])) {
            $status = array_values(array_intersect((array) $filtros['status'], array('ativo', 'inativo')));

            if ($status) {
                $query->whereIn('status', $status);
            }
        }

        if (!empty($filtros['uf'])) {
            $ufs = array_values(array_intersect((array) $filtros['uf'], array('SP', 'RJ', 'MG', 'PR', 'RS', 'BA', 'GO')));

            if ($ufs) {
                $query->whereIn('uf', $ufs);
            }
        }

        if (isset($filtros['limite_min']) && $filtros['limite_min'] > 0) {
            $query->where('limite_credito', '>=', (float) $filtros['limite_min']);
        }

        if (!empty($filtros['de']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $filtros['de'])) {
            $query->where('created_at', '>=', $filtros['de'] . ' 00:00:00');
        }

        if (!empty($filtros['ate']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $filtros['ate'])) {
            $query->where('created_at', '<=', $filtros['ate'] . ' 23:59:59');
        }

        return $query;
    }

    public function alterarStatus()
    {
        try {
            if (!PermissionHelper::requireToken() || !PermissionHelper::require('core.edit.state', 'com_loja')) {
                return;
            }

            $id = InputHelper::int('id', 0, 'post');
            $status = InputHelper::oneOf('status', array('ativo', 'inativo'), null, 'post');

            if ($id <= 0 || $status === null) {
                return ApiResponseHelper::badRequest('Informe o cliente e o novo status.');
            }

            $this->tabela()->findOrFail($id);
            $this->tabela()->update($id, array('status' => $status));

            return ApiResponseHelper::updated($status === 'ativo' ? 'Cliente ativado.' : 'Cliente desativado.');
        } catch (Throwable $e) {
            return (int) $e->getCode() === 404
                ? ApiResponseHelper::notFound('Este cliente não existe mais.')
                : ApiResponseHelper::exception($e);
        }
    }

    public function excluir()
    {
        try {
            if (!PermissionHelper::requireToken() || !PermissionHelper::require('core.delete', 'com_loja')) {
                return;
            }

            $id = InputHelper::int('id', 0, 'post');

            if ($id <= 0) {
                return ApiResponseHelper::badRequest('Informe o cliente.');
            }

            $this->tabela()->findOrFail($id);
            $this->tabela()->delete($id);

            return ApiResponseHelper::deleted('Cliente excluído.');
        } catch (Throwable $e) {
            return (int) $e->getCode() === 404
                ? ApiResponseHelper::notFound('Este cliente não existe mais.')
                : ApiResponseHelper::exception($e);
        }
    }
}
