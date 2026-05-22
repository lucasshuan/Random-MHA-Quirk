# Roadmap

Itens planejados para não perder de vista.

---

## Infra / backend — migrar de Vite-only para Next (ou similar)

**Contexto hoje**

- App: SPA Vite + React.
- Fusões (híbrido): geração via middleware do Vite em dev (`/api/fusion/generate`) + cache em `src/data/fusion-cache.json`.
- Scripts CLI: `pnpm fusion:generate`, `research:*`, etc.
- Secrets: `.env` local (OpenAI / Gemini) — nunca no client.

**Problema**

- API de fusão **só existe em `pnpm dev`** (plugin Vite).
- `pnpm build` / `pnpm preview` / deploy estático **não** geram fusão na hora — só cache prévio ou comando manual.

**Meta**

- Backend real (Route Handler / API Route) para gerar fusão on-demand em produção.
- Mesma lógica de `scripts/lib/fusion-generate-core.mjs`, sem duplicar prompt/validação.

**Candidatos**

| Opção | Prós | Contras |
|--------|------|---------|
| **Next.js (App Router)** | API routes, deploy Vercel, ecossistema React | Migração do wizard/rotas |
| **Vite + servidor separado** (Express/Hono) | Menos refactor do front | Dois deploys |
| **Vite + Vercel Edge Functions** | Mantém Vite no front | Config extra |

**Checklist da migração (quando for fazer)**

- [ ] Escolher stack (Next full vs front Vite + API mínima).
- [ ] Mover `fusion-generate-core` para módulo compartilhado server-only.
- [ ] `POST /api/fusion/generate` com env no servidor (OpenAI/Gemini).
- [ ] Cache: JSON em disco (dev) → DB ou KV (prod), ou manter arquivo no repo.
- [ ] Rate limit / custo (evitar abuso da API).
- [ ] Remover ou manter plugin Vite só em dev.
- [ ] Atualizar `research/FUSION.md` e `.env.example`.
- [ ] CI: build sem expor keys; testes do endpoint.

**Até lá (workaround)**

- Desenvolvimento: `pnpm dev` + `.env` → gera na hora.
- Preview/prod estático: `pnpm fusion:generate -- ...` antes, ou aceitar só cache existente.

---

## Conteúdo / i18n (opcional)

- [ ] Completar PT-BR das ~234 quirks ainda em inglês (`pnpm research:sync-pt` com delay, ou `research:translate-pt` com OpenAI válida).
- [ ] Revisar qualidade das traduções MyMemory vs LLM.

---

## UX (backlog leve)

- [ ] Tier toggles / cards — ajustes finos de cor se quiser.
- [ ] Híbrido: reroll só da fusão (mesmos pais, novo seed) sem rerollar pais.

---

*Última atualização: maio/2026 — adicionar data ao editar.*
