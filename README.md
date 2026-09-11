# Allavie Semijoias · vitrine com sacola

Site da **Allavie Semijoias** (Neyla Rodrigues · [@allavie.semijoias](https://www.instagram.com/allavie.semijoias/)).
A cliente monta a sacola no site e finaliza o pedido pelo **Direct do Instagram**: o pedido é copiado automaticamente e o Direct da Allavie é aberto para ela colar e enviar.

## Estrutura
| Caminho | O que é |
|---|---|
| `index.html` | Página única (hero, destaques, coleção, Inclusão, personalizadas, como pedir) |
| `assets/js/catalog.js` | **Catálogo** — nome, preço, código, categoria e tom de cada peça |
| `assets/js/app.js` | Filtros, sacola (salva no navegador), quick view e checkout pelo Instagram |
| `assets/css/style.css` | Identidade visual (blush, rosé e ouro) |
| `assets/img/` | Fotos das peças recortadas do catálogo do Canva (`pXX-N.webp`) |

## Como atualizar o catálogo
1. Suba a foto nova em `assets/img/` (quadrada, ~800×800, `.webp` ou `.jpg`).
2. Em `assets/js/catalog.js`, adicione uma linha: `{ id: "nome-do-arquivo-sem-extensao", cat: "brincos", tom: "dourado", nome: "...", preco: 60, cod: "000000" }`.
3. Para destacar no carrossel do topo, inclua o `id` em `ALLAVIE_DESTAQUES`.

Categorias: `brincos`, `pulseiras`, `aneis`, `colares`, `especiais`. Use `social: true` para peças da Coleção Inclusão.

Site estático, sem build — deploy automático na Vercel a cada commit na `main`.
