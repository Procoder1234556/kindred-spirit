# Building ChainPulse

This document guides coding agents on how to build and expand ChainPulse.

## Architecture
- **Frontend Container:** Built via Stitch MCP
- **Framework:** React / Next.js (exported by Stitch)
- **Styling:** Vanilla CSS / Stitch styling with custom Design System tokens
- **Data Layer:** Real-time metrics integrating with Solana RPCs (Helius/Triton) to power the "Dune-like" charts.

## Workflow
1. The project scaffolding is managed through the Stitch MCP project ID `17129051265633841781`.
2. Any newly generated screens should maintain consistency with the provided Design System context.
3. Once the layout is generated, interactive charts and WebSocket data streams for Solana transactions should be hooked up to the top-level components.
