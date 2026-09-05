# Stilio

A luxury interior-design studio experience: an interactive procedural **3D room**
as the homepage centrepiece, backed by an **AI design team** the visitor briefs
through one conversation.

Monorepo (npm workspaces):

| Package | What it is |
|---|---|
| [`packages/design-agents`](packages/design-agents) | The AI agent system — Design Director + 8 specialists, shared project memory, structured workflow. Framework-agnostic TypeScript. 14 tests. |
| [`apps/web`](apps/web) | The Next.js 15 site — design system, 3D experience (React Three Fiber), portfolio, material library, and the Design Director console wired to the agents. |

## Quick start

```bash
npm install
npm run dev          # → http://localhost:3000
npm test             # agent-system tests
npm run build        # production build of the web app
```

The 3D scene and the AI console both work with **no API key** — the scene is
procedural, and the Design Director runs on a deterministic offline model.
Set `ANTHROPIC_API_KEY` + `STILIO_LLM=anthropic` in `apps/web/.env.local` to run
the real Claude-backed workflow.

## Design language

Pulled from the studio's brand kit (`brand-assets/`):

- **Palette** — Onyx `#16140F`, Espresso `#2E2A23`, Antique Gold `#B0894C`,
  Champagne `#CBAE7B`, Soft Stone `#D8CFBE`, Warm Marble `#F3EFE6`.
  ~60% cream / 30% onyx / 10% gold. No gradients, no pure black/white.
- **Type** — Cormorant Garamond (display) · Jost (text/UI, letterspaced caps).
- Tokens live in [`apps/web/src/app/globals.css`](apps/web/src/app/globals.css)
  (`@theme`) and mirrored for three.js in
  [`apps/web/src/lib/tokens.ts`](apps/web/src/lib/tokens.ts).

## The 3D experience

`apps/web/src/components/three/` — a procedural room (walls, glazing, furniture as
authored geometry, PBR-ish materials, a local reflection environment). It supports:

- Orbit / zoom / pan with a constrained rig and a cinematic **reset view**
- Six **design styles** (Warm Contemporary → Luxury) with eased transitions
- Four **lighting states** (Day / Sunset / Evening / Night) — sun, ambient,
  window glow and lamp intensity all lerp between presets
- **Click a piece** to inspect it and swap its material (linen / velvet / leather,
  oak / walnut / marble / travertine …)
- Automatic **quality tiers** (High / Medium / Low) by device, user-overridable
- A **photographic fallback** when WebGL is unavailable — the visitor can still
  step through the styles

## The AI design team

`packages/design-agents` runs the studio's real process end to end:

```
brief → Space Planner + Style Director
      → Furniture Curator + Material Specialist + Lighting Designer
      → Budget Manager → Design Director (synthesis + conflict resolution)
      → Design Critic → Design Director (resolution) → visualization → concept
```

The web console (`apps/web/src/components/ai/`) streams the run over SSER
(`/api/design`), shows the team working, asks the Director's questions when
information is missing, and presents a structured **concept** — headline,
palette, highlights, trade-offs, and what still needs the client's sign-off.

## Notes / next steps

- Real Claude runs make ~15 model calls; on a serverless host raise the function
  timeout or move the workflow to a queue. The mock has no such constraint.
- Furniture is authored geometry; swap in GLTF assets per piece when available
  (the `PIECES` catalogue in `lib/three/config.ts` is the seam).
- `/api/enquiry` records and optionally forwards to `STILIO_ENQUIRY_WEBHOOK`;
  wire a real mail provider for production.
