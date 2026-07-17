# Changelog

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
