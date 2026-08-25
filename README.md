# Caderno de Bits CLP

App web estático (HTML/CSS/JS puro, sem dependências, sem backend) para treinar
tipos de dados de CLP: bits, bytes, hexadecimal, complemento de dois, conversões
entre tipos e endereçamento de memória no estilo Siemens (M, MB, MW, MD).

Funciona como **PWA instalável**, 100% offline depois do primeiro acesso — pensado
para treinar em campo, sem sinal confiável.

![Tela inicial com a escada de níveis](docs/screenshot.png)

## Os 10 níveis

Cada nível gera questões infinitas (texto, múltipla escolha ou toggle de bits) e
corrige na hora, com a resolução explicada. Oito acertos seguidos liberam o
próximo nível.

| # | Nível | O que cobra |
|---|-------|-------------|
| 1 | Peso dos bits | A tabuada base 2 (2^N). Sem isso automático, nada acima fecha. |
| 2 | Binário e decimal | Ler e montar um padrão de 8 bits. |
| 3 | Hexadecimal | Cada dígito hex é exatamente 4 bits (um nibble). |
| 4 | MSB, LSB e endereço | Onde mora cada bit dentro do byte (M*b*.*k*). |
| 5 | Complemento de dois | Como o número negativo é construído. |
| 6 | Com sinal vs sem sinal | Os mesmos bits, duas leituras diferentes. |
| 7 | Alargamento 16 → 32 | Extensão de sinal contra preenchimento com zeros. |
| 8 | Estreitamento 32 → 16 | O que se perde ao encolher, e por que isso é perigoso. |
| 9 | REAL e arredondamento | IEEE 754 e as funções TRUNC/FLOOR/CEIL/ROUND. |
| 10 | Endereços sobrepostos | Como MB, MW e MD dividem a mesma memória (big-endian). |

## App publicado

<!-- Preencher apos habilitar o GitHub Pages -->
https://omarcosvitor.github.io/ByteLearn/

No celular: abra o link no navegador e use "Adicionar à tela inicial" /
"Instalar app". Depois do primeiro acesso o app abre e funciona sem internet.

## Rodar local

Service worker não funciona em `file://`, então é preciso servir por HTTP:

```bash
python3 -m http.server 8000
```

Depois abra `http://localhost:8000/`.

## Como editar

O `index.html` é **gerado**, nunca deve ser editado à mão. A fonte real fica em
`parts/`, dividida em 6 arquivos:

```
parts/01-head.html     <head>, CSP, meta tags, manifest
parts/02-styles.html   estilos + @font-face locais
parts/03-header.html   cabeçalho
parts/04-main.html     área principal (escada de níveis, cartão de questão, tabelas)
parts/05-footer.html   rodapé
parts/06-scripts.html  geradores de questão + registro do service worker
```

Depois de editar qualquer parte, rode:

```bash
./build.sh
```

Isso regenera `index.html` e recalcula um hash curto do conteúdo, gravando-o
como versão do cache em `sw.js`. Assim toda mudança real invalida sozinha o
cache antigo — nenhuma versão velha sobrevive no celular de quem já instalou
o app. Commite `index.html` e `sw.js` junto com as mudanças em `parts/`.

Fontes (`fonts/*.woff2`) e ícones (`icons/*.png`) já estão versionados no
repositório; não é preciso baixá-los de novo a menos que a fonte ou o ícone
mudem.

## Estrutura

```
index.html              build final (gerado por build.sh)
build.sh                concatena parts/ e sincroniza a versão do cache
manifest.webmanifest    metadados do PWA
sw.js                   service worker (cache-first para assets, network-first para o HTML)
parts/                  fonte modular do HTML
fonts/                  IBM Plex Sans, IBM Plex Mono, Saira Condensed (.woff2 locais)
icons/                  ícone do app (SVG fonte + PNG 192/512)
```

## Segurança

- Nenhuma chave, token ou credencial no código — é um app 100% estático.
- CSP restritiva em `parts/01-head.html` (`default-src 'self'`); nenhuma
  requisição sai para domínio externo.
- Resposta digitada pelo usuário só é escrita via `textContent`, nunca via
  `innerHTML`.
- HTTPS forçado pelo GitHub Pages.
