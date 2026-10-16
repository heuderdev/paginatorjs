# Preferências, estado na URL e cache

Os três são **opcionais** e desligados por padrão. A listagem funciona igual sem nenhum deles.

## Preferências (`localStorage`)

```html
<div id="clientes" data-paginationjs ...
     data-paginationjs-persist
     data-paginationjs-namespace="com_loja"
     data-paginationjs-user="<?php echo (int) JFactory::getUser()->id; ?>"
     data-paginationjs-version="1">
```

| `data-paginationjs-persist` | Salva |
|---|---|
| (ausente) ou `false` | nada |
| (sem valor) ou `true` | `columns,limit,sort` |
| `columns,limit` | só o que for listado |
| `…,search,filters` | também busca e filtros — **decisão explícita**: não use com dados sensíveis (CPF, nomes de pacientes etc.), porque ficam gravados no navegador |

Chave: `hrpaginationjs:{namespace}:{usuario}:{id}:v{versao}` — ex.: `hrpaginationjs:com_loja:42:clientes:v1`.
Assim, usuários diferentes no mesmo navegador não compartilham preferências.

Robustez:

| Situação | Comportamento |
|---|---|
| `localStorage` indisponível / bloqueado / cota cheia | Ignora silenciosamente; a listagem funciona. |
| JSON corrompido | Descarta a chave (aviso no console) e usa o padrão. |
| Quantidade salva fora de `data-paginationjs-limits` | Ignorada. |
| Ordenação salva em coluna que não existe / não é ordenável | Ignorada. |
| Colunas mudaram | Ver [colunas.md → mudança de esquema](colunas.md#mudança-de-esquema-o-que-acontece-com-preferências-salvas). |
| Mudança incompatível | Aumente `data-paginationjs-version`. |

`resetPreferences()` apaga a chave e volta ao padrão do HTML.

## Estado na URL

```html
<div id="clientes" data-paginationjs ... data-paginationjs-url data-paginationjs-url-prefix="cli_">
```

Exemplo: `index.php?option=com_loja&view=clientes&cli_page=3&cli_sort=nome&cli_direction=asc&cli_f_status=ativo`

| Parâmetro | Conteúdo | Quando aparece |
|---|---|---|
| `{prefixo}page` | página | diferente de 1 |
| `{prefixo}limit` | quantidade | diferente do padrão |
| `{prefixo}sort` + `{prefixo}direction` | ordenação | diferente do padrão |
| `{prefixo}search` | busca | não vazia |
| `{prefixo}f_{filtro}` | filtros (repetido para listas) | quando definidos |

- Prefixo padrão: `{id}_` (caracteres fora de `[A-Za-z0-9_]` viram `_`). Com duas listagens na página, cada uma
  usa o seu prefixo e não toca nos parâmetros da outra.
- Parâmetros alheios (`option`, `view`, `Itemid`…) e o `#hash` são preservados.
- A URL só é escrita depois de uma resposta **bem-sucedida**, e só se mudou (sem histórico redundante).
- `data-paginationjs-url-history="replace"` (padrão): atualiza a URL sem criar entradas.
  `push`: cada mudança cria uma entrada; voltar/avançar restauram o estado e fazem **uma** requisição, sem
  reescrever a URL (sem loop). A carga inicial nunca cria entrada.
- Precedência na abertura: **URL > preferências > HTML**.
- Valores da URL passam pela mesma validação (página ≥ 1, ordenação só em colunas ordenáveis, filtros tipados).

## Cache

```html
<div ... data-paginationjs-cache="60" data-paginationjs-cache-max="20">
```

- Desligado por padrão (cada navegação consulta o servidor).
- Validade em segundos (`cache`) e limite de respostas por instância (`cache-max`; a mais antiga sai primeiro).
- Chave: endpoint + método + usuário (`data-paginationjs-user`) + todos os parâmetros (página, quantidade, busca,
  filtros, ordenação, fixos). O `draw` do DataTables é ignorado na chave.
- Fica só na memória da instância (não vai para `localStorage`) e some no `destroy()`.
- Invalidação: `reload()` e o botão Atualizar limpam o cache e vão ao servidor; ações remotas bem-sucedidas
  limpam o cache antes de recarregar.
- Não há prefetch: só a página pedida é carregada.
