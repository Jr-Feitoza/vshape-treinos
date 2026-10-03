# Changelog

## 2026-10-03 — Feat: Fase 4 — Consolidação (Semanas 13-16)

**Arquivos alterados:** `fase4.html` (novo), `index.html`, `fase2.html`, `fase3.html` (link na barra de fases), `sw.js`, `manifest.json`

### Adicionado

- **Fase 4** na estrutura comum (`app.js`/`app.css`): A4 Empurrar · B4 Perna (quadríceps) · C4 Puxar · D4 Perna (posterior + glúteo)
- Cada treino: bike 10 min + prancha 3×45s + 3 estações (bloco de força 4×6–8 com 90 s — Hack 2 min — e trisets/bi-sets de 12 com 60 s, 45 s na Sem 15) + finalização; HIIT 15 min no fim do B4 e do D4
- Carga por exercício (chave `<treino>-g<estação>-<exercício>`), sem campo nos de peso do corpo
- Semanas 13–16 sem deload (`semanaDeload:0`) e com nota por semana (cargas novas → subir → rest-pause e 45 s → retestar e medir)
- A4 Estação 3 com crucifixo inclinado ↔ tríceps francês (alternativa ao crossover); C4 Estação 3 com pulldown de braço estendido (dorsais)
- Tema verde-azulado (`#0f766e`); `fase4.html` no pré-cache, `CACHE_NAME` v11→v12

### Vídeos

- Todos conferidos pelo título no YouTube antes de entrar. Novos: Hack, panturrilha no leg press, crucifixo inclinado, tríceps francês sentado, crucifixo inverso com halteres, mesa flexora, panturrilha unilateral e bike (regulagem)

### Fora do app (de propósito)

- Repositório e site são públicos: medidas pessoais, medicação e metas numéricas não entram

### Pendências encontradas (Fases 1–3, não alteradas)

- Fase 3 "Pulldown no cabo": texto descreve tríceps, vídeo `Lgr9JqdRp3M` mostra pulldown de braço estendido (dorsais)
- Fase 3 "Remada curvada com halteres": vídeo `G2gbM0N2ey8` é de remada serrote
- Fase 1 "Elevação pélvica": vídeo `1gVulBzh43o` é de ponte de glúteo no step
- Fases 1/2 bike: vídeo `v_h7lHYsV_U` é propaganda de bicicleta, não aula de execução

---

## 2026-10-02 — Refactor: motor pronto para a Fase 4

**Arquivos alterados:** `app.js`, `app.css`, `index.html` (Fase 1), `fase2.html` (Fase 2), `fase3.html` (Fase 3)

### Como

- Semana de deload deixa de ser fixa (`semana===4`): vem de `FASE.semanaDeload` (Fases 1–3 = 4)
- Nota por semana: elementos `[data-semana-nota="N"]` aparecem só na semana N (sem efeito nas Fases 1–3)
- CSS de técnica (`.tec-*`, Fases 1/2), de triset (`.triset-*`, Fase 3) e do box de cardio (Fase 3) passa para `app.css`

### Verificação

- Fases 1–3: telas idênticas pixel a pixel e HTML gerado idêntico; suíte de testes sem diferença

---

## 2026-10-02 — Refactor: estilo comum das 3 fases em `app.css`

**Arquivos alterados:** `app.css` (novo), `index.html` (Fase 1), `fase2.html` (Fase 2), `fase3.html` (Fase 3), `sw.js`

### Como

- As 143 regras CSS idênticas nas 3 páginas (mesma ordem) saem para `app.css`, carregado antes do `<style>` de cada página
- Cada página mantém as cores (`:root`) e as regras próprias; regras iguais mas com comentário diferente acima ficaram na página
- `sw.js`: `app.css` no pré-cache; `CACHE_NAME` v10→v11

### Verificação

- Screenshots de todas as abas das 3 fases idênticos pixel a pixel à versão anterior à reorganização (`f661839`)

---

## 2026-10-02 — Refactor: motor comum das 3 fases em `app.js`

**Arquivos alterados:** `app.js` (novo), `index.html` (Fase 1), `fase2.html` (Fase 2), `fase3.html` (Fase 3), `sw.js`

### Por quê

- As 3 páginas carregavam cópias do mesmo motor (286 linhas idênticas + 8 funções que só mudavam um valor); toda correção era feita 3x e bugs ficavam numa fase só (`A2`, respiração)

### Como

- `app.js`: helpers, cargas, timers, painel, rotação, backup, desfazer, Wake Lock e a inicialização. As diferenças entre fases vêm de `FASE` (`n`, `semanaOffset`, `pranchaPadrao`, `metaDescanso`, `extraTreino`), declarado em cada página
- Cada página mantém só os dados e a montagem própria: `FASE`, `ORDEM`, `TREINOS`, `TEC`, `RESPIRA_PADRAO`, `PRANCHA_*`, `exercicioHTML`, `restTimerHTML`, `trisetVideoHTML`/`cardioBoxHTML` (Fase 3)
- `sw.js`: `app.js` no pré-cache; `.js`/`.css` network-first (senão o motor ficaria preso no cache); `CACHE_NAME` v9→v10
- Mesmas chaves de `localStorage` — dados salvos continuam valendo

### Verificação

- HTML gerado idêntico ao anterior nas 3 páginas, exceto acentos em `aria-label`/`title` da prancha nas Fases 1/2 ("Cronômetro", "Série")
- Screenshots de todas as abas idênticos pixel a pixel
- Suíte de testes da sessão (timers, XSS, backup, desfazer, cargas, deload, vírgula, SW/offline) sem diferença

---

## 2026-10-02 — Fix: carga com vírgula era salva 10x maior

**Arquivos alterados:** `index.html` (Fase 1), `fase2.html` (Fase 2), `fase3.html` (Fase 3)

### Corrigido

- Campo `type="number"`: o navegador descartava a vírgula antes do JS — "37,5" virava **375 kg** sem aviso (pt-BR e en-US)

### Como

- `pesoTrackHTML()`: `type="number"` → `type="text"` (`inputmode="decimal"` mantém o teclado numérico no celular)
- `salvar()`: trim, vírgula → ponto e só aceita `37` / `37.5` / `37,5`; o resto dá "Digite uma carga válida"

### Atenção

- Cargas já salvas com o bug não têm como ser detectadas: conferir se alguma ficou 10x maior

---

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
