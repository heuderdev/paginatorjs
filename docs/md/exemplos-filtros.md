# Filtros

Todo campo com `name` dentro de `<form data-paginationjs-filters>` é um filtro. O valor é enviado com o mesmo
`name`, tipado e sem vazios. Qualquer mudança volta para a página 1 e faz **uma** requisição.

## Formulário de filtros completo

```html
<div id="clientes" data-paginationjs data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar">

    <form class="filtros" data-paginationjs-filters>
        <label>Status
            <select name="status">
                <option value="">Todos</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
            </select>
        </label>

        <fieldset>
            <legend>Estados</legend>
            <label><input type="checkbox" name="uf[]" value="SP"> SP</label>
            <label><input type="checkbox" name="uf[]" value="RJ"> RJ</label>
            <label><input type="checkbox" name="uf[]" value="MG"> MG</label>
        </fieldset>

        <label>Limite mínimo (R$)
            <input name="limite_min" inputmode="decimal" data-paginationjs-type="number">
        </label>

        <label>Cadastro de <input type="date" name="de"></label>
        <label>até <input type="date" name="ate"></label>

        <button type="button" data-paginationjs-clear="filters">Limpar filtros</button>
    </form>

    <table>...</table>
</div>
```

```preview Como fica na tela
<div class="pv-filtros"><label>Status<select><option>Ativos</option></select></label><label>Estados<span><input type="checkbox" checked> SP <input type="checkbox" checked> RJ <input type="checkbox"> MG</span></label><label>Limite mínimo (R$)<input value="10000,50"></label><label>Cadastro de<input type="date" value="2025-01-01"></label><label>até<input type="date" value="2025-06-30"></label><button type="button" class="pv-btn">Limpar filtros</button></div>
```

```http Com os valores acima
GET index.php?option=com_loja&task=clientes.listar&status=ativo&uf%5B%5D=SP&uf%5B%5D=RJ&limite_min=10000.5&de=2025-01-01&ate=2025-06-30&page=1&limit=20&_=...
```

```php No controller
$filtros = InputHelper::filters(array(
    'status' => 'cmd',
    'uf' => 'array',
    'limite_min' => 'float',
    'de' => 'string',
    'ate' => 'string',
));
```

## Select simples

```html
<select name="categoria" aria-label="Categoria">
    <option value="">Todas</option>
    <option value="varejo">Varejo</option>
    <option value="atacado">Atacado</option>
</select>
```

> **Resultado:** “Todas” (valor vazio) **não envia** o parâmetro; as outras enviam `categoria=varejo`.

## Select com várias escolhas

```html
<select name="uf[]" multiple size="4" aria-label="Estados">
    <option value="SP">SP</option>
    <option value="RJ">RJ</option>
    <option value="MG">MG</option>
    <option value="PR">PR</option>
</select>
```

```http
GET ...&uf%5B%5D=SP&uf%5B%5D=PR&page=1&limit=20
```

## Grupo de checkboxes

Vários checkboxes com o mesmo `name` viram lista (com ou sem `[]` no nome).

```html
<label><input type="checkbox" name="status" value="ativo"> Ativos</label>
<label><input type="checkbox" name="status" value="inativo"> Inativos</label>
<label><input type="checkbox" name="status" value="bloqueado"> Bloqueados</label>
```

```http Dois marcados
GET ...&status%5B%5D=ativo&status%5B%5D=bloqueado&page=1&limit=20
```

## Checkbox único (liga/desliga)

Marcado envia o `value` (ou `1`); desmarcado **não envia** (não filtra).

```html
<label><input type="checkbox" name="vip" value="1"> Somente VIP</label>
```

## Sim / Não / Todos (booleano)

```html
<select name="vip" data-paginationjs-type="bool" aria-label="VIP">
    <option value="">Todos</option>
    <option value="1">Somente VIP</option>
    <option value="0">Sem VIP</option>
</select>
```

> **Como funciona:** o tipo `bool` normaliza `1/0`, `true/false`, `sim/não`, `on/off` para `1` ou `0`.

## Radio

```html
<fieldset>
    <legend>Período</legend>
    <label><input type="radio" name="periodo" value="" checked> Todos</label>
    <label><input type="radio" name="periodo" value="7d"> 7 dias</label>
    <label><input type="radio" name="periodo" value="30d"> 30 dias</label>
</fieldset>
```

## Números (decimal e inteiro)

```html
<label>Limite mínimo <input name="limite_min" data-paginationjs-type="number" inputmode="decimal"></label>
<label>Idade mínima <input name="idade_min" data-paginationjs-type="int" inputmode="numeric"></label>
<label>Pedidos (type=number) <input type="number" name="pedidos_min" min="0"></label>
```

| Digitado | `number` | `int` |
|---|---|---|
| `10,5` | `10.5` | `10` |
| `abc` | não envia | não envia |
| (vazio) | não envia | não envia |

## Datas

`<input type="date">` já é tratado como data; para campos de texto use `data-paginationjs-type="date"`.

```html
<label>De <input type="date" name="de"></label>
<label>Até <input type="date" name="ate"></label>
<label>Vencimento <input name="vencimento" data-paginationjs-type="date" placeholder="AAAA-MM-DD"></label>
```

> **Atenção:** só `AAAA-MM-DD` válido é enviado (`2026-02-30` é descartado). Converta fuso no servidor se o
> banco grava em UTC (ex.: `DateHelper::between()`).

## Aplicar só ao clicar em “Filtrar”

```html
<form data-paginationjs-filters data-paginationjs-apply="submit">
    <select name="status" aria-label="Status">...</select>
    <input type="date" name="de" aria-label="De">
    <input type="date" name="ate" aria-label="Até">
    <button type="submit">Filtrar</button>
    <button type="button" data-paginationjs-clear="filters">Limpar</button>
</form>
```

> **Resultado:** mexer nos campos não consulta o servidor; o botão **Filtrar** (ou `Enter`) aplica tudo de uma vez.

## Campo dentro do formulário que não é filtro

```html
<form data-paginationjs-filters>
    <select name="status" aria-label="Status">...</select>
    <input type="text" name="apelido_da_busca" data-paginationjs-ignore aria-label="Salvar busca como">
</form>
```

## Filtro avulso, sem formulário

```html
<select name="categoria" data-paginationjs-filter aria-label="Categoria">
    <option value="">Todas</option>
    <option value="varejo">Varejo</option>
</select>

<label><input type="checkbox" name="vip" value="1" data-paginationjs-filter> Somente VIP</label>
```

## Filtros fora da listagem (barra lateral)

```html
<aside data-paginationjs-for="clientes">
    <form data-paginationjs-filters>
        <select name="status" aria-label="Status">...</select>
    </form>
</aside>

<div id="clientes" data-paginationjs data-paginationjs-remote="index.php?option=com_loja&task=clientes.listar">
    <table>...</table>
</div>
```

## Filtro já aplicado ao abrir

O que estiver selecionado no HTML é o filtro inicial.

```php
<select name="status" aria-label="Status">
    <option value="">Todos</option>
    <option value="ativo" <?php echo $statusPadrao === 'ativo' ? 'selected' : ''; ?>>Ativos</option>
    <option value="inativo">Inativos</option>
</select>
```

```http Primeira requisição já filtrada
GET index.php?option=com_loja&task=clientes.listar&status=ativo&page=1&limit=20&_=...
```

## Filtro escondido (definido pela tela)

Para um filtro que o usuário não vê nem muda, prefira `data-paginationjs-params`
([exemplo](exemplos-telas.md#parâmetros-fixos-em-toda-requisição)). Para um filtro que o código muda, use
`setFilter` ([exemplo](exemplos-javascript.md#setfilter-e-setfilters)).

> **Importante:** o servidor nunca deve confiar no filtro enviado: valide com lista branca
> (`array_intersect`, `InputHelper::oneOf`) e aplique a mesma regra de permissão na contagem e na consulta.
