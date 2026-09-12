# Veloso Solar — site institucional

Site estático de uma página para a Veloso Solar (São Raimundo Nonato — PI).

## Rodar localmente

```
npx serve -l 4321 .
```

Abra http://localhost:4321

## Estrutura

```
index.html        markup completo da página
styles.css        design system (cores, tipografia, layout)
script.js         menu, contadores, reveal, simulador, FAQ
assets/logo.svg   logotipo em SVG
assets/img/       fotos das seções
```

## Publicar

É um site estático — basta subir a pasta. Na Vercel:

```
npx vercel --prod
```

Também funciona em Netlify, GitHub Pages ou qualquer hospedagem comum.

## O que ajustar antes de publicar

- **Fotos**: as imagens em `assets/img/` são de banco de imagens (Unsplash).
  Troque pelas fotos reais das obras — mesmos nomes de arquivo, nada mais muda.
- **Depoimentos**: os três textos em `index.html` são de exemplo. Substitua pelas
  avaliações reais do Google Meu Negócio.
- **Números**: "1.000+ sistemas", "48h para o orçamento" e "5,8 kWh/m²·dia" estão
  em `index.html` na seção `.numbers`.
- **Simulador**: as premissas de cálculo (tarifa por tipo de ligação, irradiação,
  performance ratio e custo por kWp) ficam no topo do bloco do simulador em
  `script.js` — ajuste conforme os preços praticados.
- **WhatsApp**: o número `5586981789161` aparece em `index.html` e `script.js`.
