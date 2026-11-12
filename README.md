# Site da Clau (@diasdaclaudia)

Site pessoal de links da Clau: apresentação, cupons das marcas parceiras com botão de copiar, fotos e contato pelo Instagram.

É um site estático: só HTML, CSS e JavaScript. Não tem servidor, login, banco de dados nem serviço pago.

- Endereço planejado: **https://claudiadmm7-bit.github.io/**. Ele ainda não existe. Só passa a existir depois do passo "Publicar no GitHub Pages".
- Repositório planejado: `claudiadmm7-bit.github.io`, na conta `claudiadmm7-bit`.

---

## 1. Ver o site no computador

O site lê os textos e cupons de um arquivo de dados. Por isso **não funciona com clique duplo no `index.html`**: o navegador bloqueia essa leitura e a página mostra um aviso.

**Jeito mais fácil (Windows):** dê clique duplo em **`abrir-site.cmd`**, nesta pasta, ou no atalho **"Abrir site da Clau"** da Área de Trabalho. Uma janela preta se abre e o navegador mostra **http://localhost:8000**. Deixe a janela aberta enquanto estiver vendo o site. Para desligar, feche a janela.

**Para ver no celular:** dê clique duplo em **`abrir-site-celular.cmd`** ou no atalho **"Site da Clau no celular"**. A janela mostra um endereço como `http://192.168.0.67:8001`. Digite esse endereço no navegador de um celular conectado no mesmo Wi-Fi. Na primeira vez, o Windows pergunta sobre o firewall: clique em "Permitir acesso". Se usar VPN e não abrir, desligue a VPN e tente de novo.

**Pelo terminal:**

1. Abra um terminal na pasta do projeto (`C:\Users\Andrade\site-claudia`).
2. Rode:

   ```bash
   python -m http.server 8000 --directory docs
   ```

3. Abra **http://localhost:8000** no navegador.
4. Para desligar, volte ao terminal e aperte `Ctrl + C`.

Se o Python não estiver instalado, este comando faz o mesmo (precisa do Node.js):

```bash
npx serve docs
```

Depois de editar algum arquivo, recarregue a página com `Ctrl + F5`.

---

## 2. Qual pasta é publicada

**Só a pasta `docs/` vai para a internet.**

```
site-claudia/
├── docs/                    ← É ISTO QUE É PUBLICADO
│   ├── index.html           estrutura da página
│   ├── styles.css           visual (cores, fontes, espaçamentos)
│   ├── app.js               monta a página a partir do site.json
│   ├── data/site.json       ★ textos, links, cupons e fotos (o que você vai editar)
│   ├── assets/images/       fotos otimizadas para a web
│   ├── assets/fonts/        fontes (licença livre, ver LICENCAS.txt)
│   ├── favicon.svg          ícone da aba
│   └── .nojekyll            avisa o GitHub para servir os arquivos como estão
├── tools/otimizar_fotos.py  gera as fotos otimizadas a partir dos originais
├── materials/               originais, prints e vídeos. NÃO vai para o GitHub (.gitignore)
└── README.md                este guia
```

A pasta `materials/` está no `.gitignore`. Conversas, prints, vídeos de referência e fotos originais nunca são enviados ao GitHub. Não remova essa linha do `.gitignore`.

---

## 3. Trocar links e cupons

Tudo fica em **`docs/data/site.json`**. Abra esse arquivo no VS Code. Cada marca é um bloco assim, e cada bloco vira um cartão no site:

```json
{
  "id": "ysy",
  "name": "YSY Acessórios",
  "enabled": true,
  "coupon": "CLAU10",
  "url": "https://creaty.la/claudiadmm7/O4winju",
  "ctaLabel": "Visitar a loja",
  "destinationNote": "",
  "image": { ... }
}
```

| Campo | O que é |
|---|---|
| `name` | Nome da marca no cartão |
| `coupon` | O código exatamente como deve ser copiado. **Maiúsculas e minúsculas contam:** `claudia13` é diferente de `CLAUDIA13` |
| `url` | Para onde o botão grande leva. Cole o link inteiro, com tudo depois do `?` |
| `ctaLabel` | Texto do botão grande, por exemplo "Visitar a loja" ou "Ver no Instagram" |
| `destinationNote` | Aviso opcional embaixo do nome. Deixe `""` para não mostrar nada |
| `enabled` | `true` mostra a marca, `false` esconde |
| `image` | A foto pequena do cartão (ver seção 5) |

Cada cupom aparece **uma vez só** no arquivo, e o cartão e o botão de copiar são montados a partir dele.

Cuidados ao editar:

- Mantenha as aspas `"` em volta de cada texto e a vírgula entre os campos. Não coloque vírgula depois do último campo de um bloco.
- Se o arquivo ficar com erro de formatação, o site **não fica em branco**: mostra "Não foi possível carregar os cupons agora" e o link do Instagram. Para achar o erro, veja o sublinhado vermelho no VS Code ou cole o conteúdo em https://jsonlint.com.
- Se faltar o cupom de uma marca, ou se o link dela não começar com `https://`, só essa marca some da página. O motivo aparece no console do navegador (`F12` → Console).

Os outros textos do site ficam no mesmo arquivo:

- `profile`: o topo da página.
- `coupons`: o título "Meus cupons", a frase de como usar e o aviso de validade.
- `work`: o bloco "Vamos trabalhar juntos?".
- `labels`: os textos dos botões.

---

## 4. Adicionar, esconder, reordenar ou remover marcas

- **Esconder sem apagar:** troque `"enabled": true` por `"enabled": false`. Útil quando um cupom expira e pode voltar depois.
- **Reordenar:** a ordem dos blocos dentro de `"partners": [ ... ]` é a ordem dos cartões. Recorte o bloco inteiro, das chaves `{` até `}`, e cole na nova posição. Confira as vírgulas entre os blocos.
- **Remover:** apague o bloco inteiro e a vírgula que o separava do vizinho.
- **Adicionar:** copie um bloco existente, cole depois do último (com uma vírgula entre os dois) e troque `id`, `name`, `coupon`, `url`, `ctaLabel` e a foto.
  - O `id` deve ser curto, sem espaços nem acentos (exemplo: `"marca-nova"`).
  - O `id` também cria um link direto para o cartão: `https://claudiadmm7-bit.github.io/#parceiro-marca-nova`. Esse link é útil para os stories.

Uma marca pode ficar sem foto: apague a linha `"image"`. O cartão fica só com o nome.

---

## 5. Trocar fotos

O site usa **poucas fotos**: a foto redonda do topo e uma foto pequena em cada cartão. Cada foto no `site.json` tem este formato:

```json
"image": {
  "src": "assets/images/ysy/ysy-04-480.jpg",
  "srcset": "assets/images/ysy/ysy-04-240.webp 240w, assets/images/ysy/ysy-04-480.webp 480w",
  "width": 480,
  "height": 640,
  "alt": "Descrição da foto para quem usa leitor de tela.",
  "position": "50% 45%"
}
```

- `alt` descreve a foto em português. Escreva o que aparece nela, como se contasse para alguém que não pode ver a imagem.
- `position` escolhe qual parte da foto aparece no quadradinho: `"50% 0%"` mostra o topo e `"50% 100%"` mostra a base.
- Use caminhos **relativos**, sem `/` no começo, como no exemplo.

### Jeito recomendado (gera as versões leves automaticamente)

1. Coloque a foto original em `materials/photos/<marca>/`, por exemplo `materials/photos/ysy/ysy-05.jpg`.
2. No começo de `tools/otimizar_fotos.py`, na linha `CARD_PHOTOS = (...)`, troque o nome da foto daquela marca, por exemplo `"ysy/ysy-05"`.
3. Rode na pasta do projeto (precisa do [uv](https://docs.astral.sh/uv/)):

   ```bash
   uv run --with pillow python tools/otimizar_fotos.py
   ```

   O script corrige a rotação do celular, converte as cores para o padrão da web e **remove os metadados, inclusive a localização GPS**. As versões leves ficam em `docs/assets/images/`, e no final ele mostra a largura e a altura de cada foto.
4. No `site.json`, atualize `src`, `srcset`, `width`, `height` e `alt` da foto.
5. Apague de `docs/assets/images/` os arquivos da foto antiga, para não publicar fotos que não aparecem no site.

### Jeito manual (sem rodar nada)

1. Exporte a foto em JPG com cerca de 480 px de largura e menos de 80 KB.
2. Salve em `docs/assets/images/...`.
3. No bloco da foto, preencha `src`, `width`, `height` e `alt`, e apague a linha `srcset`.

Nunca publique o arquivo original do celular: ele é pesado e pode conter a localização.

### Foto do topo e imagem de compartilhamento

A foto redonda do topo está em `profile.portrait`. É um recorte quadrado do rosto na foto `ysy-02`, feito pelo script.

A imagem que aparece quando o link é compartilhado no WhatsApp ou em outras redes é `docs/assets/images/compartilhamento.jpg`. Ela é gerada pelo mesmo script.

---

## 6. Mudar as cores

As cores ficam no começo de `docs/styles.css`:

```css
:root {
  --color-bg: #F1EAE0;        /* fundo off-white (creme) */
  --color-card: #FBF8F3;      /* cartões, um pouco mais claros que o fundo */
  --color-sand: #E9DFD2;      /* caixa do cupom */
  --color-espresso: #302622;  /* texto */
  --color-burgundy: #753B49;  /* destaque, botões */
  --color-rose: #D8B9B1;      /* só decorativo */
  --color-text-soft: #5E4F49; /* texto secundário */
  ...
}
```

Troque o código da cor e salve. O site todo muda junto. Se trocar o fundo, troque também `theme-color` em `docs/index.html`: é a cor da barra do navegador no celular.

Contraste medido (o mínimo recomendado para texto é 4,5:1):

| Combinação | Contraste |
|---|---|
| Texto marrom-escuro no fundo creme / no cartão | 12,3:1 / 13,9:1 |
| Vinho no fundo creme / letra clara no botão vinho | 7,1:1 / 8,0:1 |
| Texto secundário no fundo / no cartão / na caixa do cupom | 6,5:1 / 7,4:1 / 5,9:1 |
| Rosa no fundo | baixo, por isso o rosa **nunca** é usado em texto |

Se trocar uma cor, confira o contraste em https://webaim.org/resources/contrastchecker/.

---

## 7. Publicar no GitHub Pages

Os passos seguem a documentação oficial do GitHub, conferida em 12/11/2026:
[Criar um site do GitHub Pages](https://docs.github.com/pt/pages/getting-started-with-github-pages/creating-a-github-pages-site) e
[Configurar a fonte de publicação](https://docs.github.com/pt/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

### 7.1 Criar o repositório (uma vez só)

1. Entre no GitHub com a conta **claudiadmm7-bit**.
2. Clique no **+** no canto superior direito e depois em **New repository**.
3. Em *Repository name*, digite exatamente **`claudiadmm7-bit.github.io`**, tudo em minúsculas. Esse nome especial faz o site abrir em `https://claudiadmm7-bit.github.io/`.
4. Marque **Public**. No plano gratuito, o GitHub Pages só funciona em repositório público. Por isso o `.gitignore` protege a pasta `materials/`.
5. Clique em **Create repository**.

### 7.2 Enviar os arquivos (a partir desta pasta)

No terminal, dentro de `C:\Users\Andrade\site-claudia`:

```bash
git init -b main
git add .
git status          # confira: NÃO pode aparecer nada de "materials/"
git commit -m "Primeira versão do site da Clau"
git remote add origin https://github.com/claudiadmm7-bit/claudiadmm7-bit.github.io.git
git push -u origin main
```

### 7.3 Ligar o GitHub Pages (uma vez só)

1. No repositório, clique em **Settings**.
2. Na barra lateral, na seção *Code, planning, and automation*, clique em **Pages**.
3. Em **Build and deployment** → **Source**, escolha **Deploy from a branch**.
4. Em **Branch**, escolha **main** e, na caixinha ao lado, troque **/(root)** por **/docs**.
5. Clique em **Save**.

Depois de alguns minutos aparece o botão **Visit site** nessa mesma página. Segundo o GitHub, a publicação pode levar **até 10 minutos**.

### 7.4 Atualizações depois disso

Com o Pages configurado, **cada commit enviado para a branch `main` publica o site de novo sozinho**. Não precisa repetir o passo 7.3:

```bash
git add .
git commit -m "Atualiza cupom da Avvi"
git push
```

A mudança também pode levar alguns minutos para aparecer, e o navegador pode mostrar a versão antiga por um tempo. Recarregue com `Ctrl + F5` ou abra numa aba anônima. Para acompanhar, veja a aba **Actions** do repositório: cada publicação aparece lá, e uma falha fica marcada em vermelho.

### 7.5 Colocar o link na bio do Instagram

Este é o mesmo esquema da página de referência: o site fica hospedado no GitHub, e o Instagram só aponta para ele.

1. Depois que **Visit site** funcionar, abra `https://claudiadmm7-bit.github.io/` no celular e confira se está tudo certo.
2. No app do Instagram, entre no perfil **@diasdaclaudia** e toque em **Editar perfil**.
3. Toque em **Links** → **Adicionar link externo**.
4. Em URL, cole `https://claudiadmm7-bit.github.io/`. Em título, coloque algo como **Meus cupons**.
5. Salve. O link aparece embaixo da bio, e quem tocar nele cai direto na página.

Dica para os stories: o adesivo de **Link** pode apontar direto para o cartão de uma marca, por exemplo `https://claudiadmm7-bit.github.io/#parceiro-avvi`.

### Coisas que não mudam o endereço do site

- **Trocar o link de uma marca** no `site.json` muda só para onde aquele botão leva. O site continua em `https://claudiadmm7-bit.github.io/`, e a bio do Instagram não precisa ser alterada.
- O endereço do site só depende do **nome do repositório** e da conta. Renomear o repositório muda o endereço. Por exemplo, um repositório chamado `site` vira `https://claudiadmm7-bit.github.io/site/`. O site funciona nesse formato também, porque todos os caminhos são relativos (isso foi testado).

### Prévia de compartilhamento

As tags de compartilhamento em `docs/index.html` (`og:url` e `og:image`) apontam para `https://claudiadmm7-bit.github.io/`. Se o site for publicado em outro endereço, troque essas duas linhas.

---

## 8. Pontos para a Claudia revisar

Estas decisões foram tomadas sem confirmação. Vale a Claudia olhar cada uma:

1. **Foto de cada marca.** Para o site ficar compacto, cada cartão mostra **uma** foto: `ysy-04` na YSY, `avvi-02` na Avvi e `gloss-01` na Gloss Vyllage. Elas foram escolhidas entre as fotos que vieram em cada grupo (4 da YSY, 3 da Avvi, 3 da Gloss), seguindo a ordem dos anexos. Os tamanhos dos arquivos nos prints da conversa batem com essa ordem, o que reforça a divisão, mas não prova qual foto é de qual marca. Confirmar se a foto de cada cartão combina com a marca.
2. **Cupons e links.** Os códigos (`CLAU10`, `CLAU`, `claudia13`) e os links foram copiados exatamente como enviados. **Ninguém testou se os cupons funcionam nas lojas**, nem quais são o desconto, a validade ou as condições. O site não promete percentual nem prazo.
3. **Gloss Vyllage** leva ao perfil da marca no Instagram, não a uma loja. Por isso o botão diz "Ver no Instagram" e há um aviso no cartão.
4. **Link da Avvi.** O endereço tem parâmetros de anúncio do Google (`gad_source`, `gclid`), que foram mantidos como enviados. Se a Avvi tiver um link próprio de parceira, é melhor usá-lo.
5. **Textos.** A apresentação e o bloco "Vamos trabalhar juntos?" foram escritos a partir da bio dela: criadora de conteúdo, videomaker, social media e modelo publicitária; treino, beleza e lifestyle; parcerias via direct. Não há números de seguidores, cidade, depoimentos nem selo de verificado.
6. **Cores e fontes.** O fundo creme, os cartões claros, o vinho e o marrom-escuro são uma **proposta**, assim como as fontes Fraunces (títulos) e DM Sans (texto). Ela ainda não aprovou.
7. **Contato só pelo Instagram.** Não há e-mail, WhatsApp, TikTok nem formulário. Se ela quiser outro canal, ele precisa ser adicionado no `site.json` e no `app.js`.
