# Roadmap

Itens planejados para não perder de vista.

---

## Infra / backend — Next.js + Supabase

**Concluído (maio/2026)**

- App migrado para **Next.js App Router** (`pnpm dev` / `pnpm build`)
- Fusões: `POST /api/fusion/generate` (Route Handler) + cache em **Supabase** (`fusion_entries`)
- Lógica compartilhada: `src/lib/server/fusion/` (app + `pnpm fusion:generate`)
- Rate limit básico no endpoint (10 req/min por IP)

**Backlog**

- [ ] Rate limit mais robusto (Upstash/KV) antes de tráfego público alto
- [ ] `GET /api/fusion/lookup` opcional para cache hit sem semântica de POST

---

## Conteúdo / i18n (opcional)

- [ ] Completar PT-BR das quirks ainda em inglês (`pnpm research:sync-pt` com delay, ou `research:translate-pt` com OpenAI válida).
- [ ] Revisar qualidade das traduções MyMemory vs LLM.

---

## UX (backlog leve)

- [ ] Tier toggles / cards — ajustes finos de cor se quiser.
- [ ] Híbrido: reroll só da fusão (mesmos pais, novo seed) sem rerollar pais.

---

*Última atualização: maio/2026 — adicionar data ao editar.*
