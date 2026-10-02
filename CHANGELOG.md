# Changelog

## 2026-10-02 — Fix: detalhes menores da auditoria

**Arquivos alterados:** `index.html`, `fase2.html`, `fase3.html`, `manifest.json`, `CHANGELOG.md`

### Corrigido

- Título "Meu progresso" virou `<h2>` em 10/08 mas o CSS seguia em `.painel h3` — perdeu o estilo de rótulo
- Prancha: a bolinha da série seguinte não ficava marcada como ativa
- Abas sem `role="tab"`/`aria-selected` (o `role="tablist"` já existia)
- Fase 3: hover dos exercícios e `.ex-adapt` ainda em azul
- `manifest.json` descrevia só a Fase 1
- CHANGELOG: entrada de 10/08 estava antes da de 11/08

### Como

- `.painel h3` → `.painel h2`; `proxima()` marca o dot da série atual; `role`/`aria-selected` em `render()`/`wireTabs()`
- Fase 3: `rgba(147,51,234,.05)` e `#e9d5ff`; descrição nova no manifest (`theme_color` mantido igual ao `<meta>` da Fase 1)

---

## 2026-10-02 — Fix: semana do ciclo + deload na Fase 3

**Arquivos alterados:** `fase3.html` (Fase 3)

### Corrigido

- Os botões Sem 9–12 só mostravam um toast: não salvavam, não marcavam ao reabrir e não tinham efeito

### Como

- Mesmo comportamento das Fases 1/2: semana salva em `vshape_f3_semana`, botão marcado, "Sem 12 · Deload" com cor de aviso, banner de deload e ~50% da carga sugerida em cada exercício
- Semana incluída no backup (exportar/importar)

---

## 2026-10-02 — Fix: carga por exercício nos trisets da Fase 3

**Arquivos alterados:** `fase3.html` (Fase 3)

### Corrigido

- Cada triset tinha um único campo "Triset completo" pra 3 exercícios com cargas diferentes — não dava pra acompanhar a evolução de cada um

### Como

- Um `pesoTrackHTML` por exercício, dentro do card, chave `<treino>-triset-<n>-<0|1|2>`
- `semCarga:true` (sem campo) nos exercícios com peso do corpo: flexão joelho apoiado, abdominal remador, abdominal curto, panturrilha livre, ponte glútea
- Carga salva no formato antigo (`<treino>-triset-<n>`) continua no armazenamento e no backup, e aparece como "Registro antigo do triset" no bloco

---

## 2026-10-02 — Fix: app instalado recebe atualização sem depender do CACHE_NAME

**Arquivos alterados:** `sw.js`

### Corrigido

- Páginas eram servidas cache-first: versão nova só chegava se o `CACHE_NAME` fosse trocado

### Como

- Navegação (HTML): network-first, atualiza o cache a cada visita; offline serve a página do cache, ignorando `?parâmetros` na URL (`./index.html` só como último recurso)
- Manifest e ícones continuam cache-first
- `CACHE_NAME` v8→v9

---

## 2026-10-02 — Feat: desfazer último registro + confirmação de registro repetido

**Arquivos alterados:** `index.html` (Fase 1), `fase2.html` (Fase 2), `fase3.html` (Fase 3)

### Corrigido

- Marcar um treino sem querer (ou o treino errado) avançava a rotação sem volta; um toque duplo pulava um treino

### Como

- `marcarTreino()` guarda o estado anterior em `rotacao.desfazer` (próximo, data prevista, atraso, ✓ do dia)
- Botão "↶ Desfazer último registro" no painel: restaura esse estado e tira a entrada do histórico; funciona no dia seguinte; 1 nível
- Tocar de novo num treino já registrado hoje pede confirmação

---

## 2026-10-02 — Fix: XSS do backup (sinks restantes) + validação da importação

**Arquivos alterados:** `index.html` (Fase 1), `fase2.html` (Fase 2), `fase3.html` (Fase 3)

### Corrigido

- A correção de 15/08 deixou 4 sinks sem `san()`: `p.anterior` e `diff` em `renderPesoInfo()`, `dataPrevista` e `atrasadoDe` em `textoPrevisao()`
- Importação aceitava qualquer JSON — `rotacao.proximo` inválido quebrava o `querySelector` de "Ir para o treino"

### Como

- `san()` nos 4 sinks
- `validarBackup()`: mantém só o que tem o formato esperado (treino em `ORDEM`, datas `AAAA-MM-DD`, freq 1–3, semana 1–4, cargas numéricas); o resto é descartado

---

## 2026-10-02 — Fix: timers atrasavam com a tela apagada

**Arquivos alterados:** `index.html` (Fase 1), `fase2.html` (Fase 2), `fase3.html` (Fase 3), `sw.js`

### Corrigido

- Descanso entre exercícios, prancha e descanso entre séries da prancha contavam tiques (`s--`) — com tela apagada/app em segundo plano o navegador segura o `setInterval` e o timer congelava (ex.: 40s fora do app → descanso ainda em 59s)
- A tela apagava sozinha no meio da prancha (ninguém toca no celular)

### Como

- `wireRest()` e `setupPranchaTimer()`: cada contagem guarda o horário de término e recalcula `ceil((fim − agora)/1000)` a cada 250ms; pausar guarda o restante, retomar recalcula o fim
- Wake Lock API (`pedirWakeLock()`/`telaAcesa()`): tela acesa enquanto algum timer roda, liberada quando todos param; re-pedida ao voltar pra aba; sem suporte, não faz nada
- `sw.js`: `CACHE_NAME` v7→v8 (força atualização do app instalado)

### Limite conhecido

- Se a tela apagar mesmo assim (navegador sem Wake Lock), o bipe final não toca no bloqueio e as transições da prancha (fim de série → descanso → próxima) contam a partir da volta ao app, não do horário real

---
## 2026-08-15 — Fix: top-5 achados da auditoria multi-agente

**Arquivos alterados:** `index.html` (Fase 1), `fase2.html` (Fase 2), `fase3.html` (Fase 3), `sw.js`

### Corrigido

- Fase 1 iniciava a rotação em `A2` (inexistente) em vez de `A` — default, reset e toast
- `CACHE_NAME` v6→v7 (força atualização do app instalado)
- `fase3.html` adicionado ao precache do service worker (offline mostrava a Fase 1 no lugar da Fase 3)
- XSS via import de backup: `san()` aplicado em `hist[].t` e `rotacao.proximo` no modal
- Datas locais (`getFullYear/getMonth/getDate`) em vez de `toISOString` UTC — treino às 22:30 registrava no dia errado

### Como

- `index.html`: `{proximo:'A2'}` → `{proximo:'A'}` (3 pontos), `san()` nos 2 sinks
- `fase2.html`/`fase3.html`: `san()` nos 2 sinks, `hoje()`/`addDias()` locais
- `sw.js`: `CACHE_NAME` v7, `'./fase3.html'` em `CORE_ASSETS`

---

## 2026-08-15 — Fix: respiração específica da Fase 2

**Arquivos alterados:** `fase2.html` (Fase 2)

### Corrigido

- Fase 2 ignorava o campo `respira` de Cat-Cow/Dead Bug (renderizava sempre a respiração genérica)

### Como

- `exercicioHTML()`: `RESPIRA_PADRAO` → `ex.respira||RESPIRA_PADRAO` (idêntico à Fase 1)

---

## 2026-08-11 — Fix: segurança — sanitização innerHTML + iframe sandbox

**Arquivos alterados:** `index.html`, `fase2.html`, `fase3.html`

### Corrigido

- F1 (XSS via localStorage): função `san()` remove `<`, `>`, `&` dos valores antes de `innerHTML` em `renderPesoInfo()` (p.atual e deload)
- F2 (iframe sandbox): `sandbox="allow-scripts allow-same-origin allow-presentation"` nos iframes do YouTube

---

## 2026-08-10 — Fix: Impeccable — acessibilidade e contraste (-66% anti-padrões)

**Arquivos alterados:** `index.html`, `fase2.html`, `fase3.html`

### Corrigido

- Heading hierarchy: `<h3>` → `<h2>` no painel de progresso (3 arquivos)
- Contraste accent: `#3b82f6`→`#2563eb` (F1/F2), `#a855f7`→`#9333ea` (F3)
- Texto dim: `--fg-mute` `#6b6b75` → `#7e7e8a` (3 arquivos)
- Alerta strong: `var(--roxo)` → `#e9d5ff` (texto claro sobre fundo escuro)

### Resultado

- Impeccable: 47 → 16 findings (-66%)
- Mantidos intencionalmente: side-tab (callouts segurança), gpt-thin-border-wide-shadow (modal), overused-font (Roboto)

---

## 2026-08-09 — Feat: Fase 3 — Definição (Semanas 9-12)

**Arquivos alterados:** `fase3.html` (+~950 linhas), `index.html`, `fase2.html` (nav)

### Adicionado

- **Fase 3** — Circuitos triset de alta densidade (Categoria C Sobrepeso, Semanas 9-12)
- 4 treinos A3/B3/C3/D3, cada um com 3 trisets (3 exercícios em sequência, 1x10, descanso 1 min)
- Aquecimento 20 min caminhada rápida + prancha 3x1 min
- Tema roxo (`#a855f7`) para diferenciar das fases anteriores
- Box de cardio (3x HIIT + 1x caminhada longa)
- Navegação Fase 1/2/3 em todas as páginas

### Nota

- Os 16 vídeos do YouTube foram alocados originalmente em ordem sequencial sem verificar o conteúdo real

---

## 2026-08-09 — Fix: adiciona 15 vídeos do YouTube aos exercícios sem link

**Arquivos alterados:** `fase3.html`

### Corrigido

- Exercícios sem vídeo receberam links do YouTube (A3, B3, C3, D3)

### ⚠️ Correção posterior

- Em 2026-08-15 os vídeos foram **realocados** (commit `58a80ee`) — os IDs haviam sido mapeados em ordem sequencial sem verificar o conteúdo real; os vídeos agora apontam para o exercício correspondente ao título

---

## 2026-07-17 — Fix: prancha 30s→45s na Fase 2 + vídeos Cat-Cow/Dead Bug

**Arquivos alterados:** `index.html` (Fase 1), `fase2.html` (Fase 2)

### Corrigido

- Prancha isométrica dos treinos B2, C2 e D2 estava com 30s ao invés de 45s (coreSeg + serie + seg)
- Cat-Cow e Dead Bug estavam sem vídeo (placeholder `vid:['']`)

### Como

- B2/C2/D2: `coreSeg:30` → `45`, `serie:'3x30s'` → `'3x45s'`, `seg:30` → `45`
- Cat-Cow: `vid:['GhJNN8OKrR4']` (8 ocorrências: 4 em cada arquivo)
- Dead Bug: `vid:['uwta311b4Ek']` (8 ocorrências: 4 em cada arquivo)

---

## 2026-07-17 — Fix: peso tracker em exercícios sem carga

**Arquivos alterados:** `index.html` (Fase 1), `fase2.html` (Fase 2)

### Corrigido

- Exercícios de ativação (Cat-Cow, Dead Bug) exibiam campo de peso e timer de descanso desnecessários
- Inserção desses exercícios deslocava as chaves de localStorage dos exercícios seguintes, perdendo pesos salvos

### Como

- Adicionada flag `semCarga: true` nos 8 objetos de ativação
- `exercicioHTML()` agora pula `pesoTrackHTML` e `restTimerHTML` quando `semCarga` é verdadeiro

---

## 2026-07-17 — Protocolo "Blinda Lombar"

**Arquivos alterados:** `index.html` (Fase 1), `fase2.html` (Fase 2)

### Adicionado

- **Cat-Cow Segmentar** (2x8-10 reps lentas) — mobilidade lombar segmentar
- **Dead Bug com Controle** (2x6-10 reps cada lado) — estabilidade segmentar / core profundo

Ambos inseridos no aquecimento dos dias **Lower** (B/D na Fase 1, B2/D2 na Fase 2),
entre a prancha isométrica e o primeiro exercício principal.

### Contexto

- Origem: protocolo de prevenção lombar pós-distensão (repouso médico de 5 dias + medicação, orientado em 17/07/2026).
- Exercícios com **aviso de liberação médica pendente** visível no app — não executar até confirmação de alta.
- Vídeos marcados como placeholder (`vid:['']`) — substituir por IDs do YouTube quando disponíveis.
- Não altera o treino principal nem o tempo total (ativação ~3-4 min, sem carga).
