# AlphaCounsel — Legal Practice Operating System

**Codename:** Counsel Repos

Enterprise-grade legal practice management and multi-tenant SaaS platform for law firms, general counsel offices, and institutional legal departments. AlphaCounsel combines ethical wall authorization, legal hold preservation, a cryptographic document vault, WIP & trust accounting, and an AI drafting studio in a single React 19 + TypeScript application.

---

## Major Capabilities

| Domain | Highlights |
| :--- | :--- |
| **Multi-Tenant SaaS Licensing** | Dynamic tiers (`STARTER`, `PROFESSIONAL`, `ENTERPRISE`, `SOVEREIGN`) with seat quotas, storage meters, and INR (₹) subscription billing. |
| **RBAC & Zero-Trust Isolation** | Core roles (Administrator, Lawyer, Paralegal, Client) across 7 permission domains (Matters, Documents, Billing, Trust, Conflicts, Audit, System) with tenant-level data scoping. |
| **Conflicts & Ethical Walls** | ABA Model Rule 1.10 screening with imputed disqualification and matter access policy enforcement. |
| **Legal Hold & Document Vault** | Tamper-proof cryptographic hashing, anti-spoliation release guards with dual sign-off, AES-GCM client-side encryption, versioning, bulk operations, and auto-tagging. |
| **Financial Engine** | IOLTA/trust evergreen retainer protection, three-way reconciliation, WIP → LEDES-1998B invoicing, and Indian numbering formatting (`₹12,34,567.00`). |
| **AI Drafting Studio** | Google Gemini-powered drafting, document intelligence, heuristic auto-tagging, and AI folder-structure generation (with offline fallback engines). |
| **Client Portal & Search** | Institutional client portal, global search, chronology, audit trail, and firm dashboard. |

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Motion, Lucide React
- **Build Tooling:** Vite 8 (`@vitejs/plugin-react`, `@tailwindcss/vite`)
- **AI:** `@google/genai` (Gemini API)
- **Server / Config:** Express, dotenv
- **Testing:** Native Node.js Test Runner (`node:test`) — zero external test dependencies

See [docs/TECH_STACK.md](docs/TECH_STACK.md) for full rationale.

---

## Project Structure

```
.
├── index.html              # App entry HTML
├── metadata.json           # Applet metadata (name, capabilities)
├── vite.config.ts          # Vite + React + Tailwind config, env injection
├── src/
│   ├── App.tsx             # Root shell & navigation
│   ├── main.tsx            # React bootstrap
│   ├── components/         # Feature views: admin, auth, billing, clients,
│   │   └── matters/tabs/   #   conflicts, dashboard, matters, navigation,
│   │                       #   portal, search, trust, vault
│   ├── context/            # AppContext — reactive global state (auth, tenant, theme)
│   ├── services/           # rbac, matterPolicy, encryption, financials,
│   │                       # aiService, autoTagging, folderStructureAi, thumbnails
│   ├── data/               # mockData.ts, saasData.ts (seed/demo datasets)
│   ├── hooks/              # useAudit
│   ├── types/              # Shared domain type definitions
│   └── utils/              # currency (INR formatting), fileUpload
├── seeds/                  # seedData.mjs — scenario-based UAT seed dataset
├── test/                   # uat.test.mjs, all_scenarios.test.mjs
└── docs/                   # Full technical documentation set (see below)
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 20.12 LTS
- npm

### Installation

```bash
npm install
cp .env.example .env
```

### Environment Variables

| Variable | Description |
| :--- | :--- |
| `GEMINI_API_KEY` | Required for Gemini AI features (drafting, auto-tagging, folder structure). Falls back to heuristic engines when unset. |
| `APP_URL` | URL where the app is hosted; used for self-referential links and callbacks. |

> In AI Studio, both values are injected automatically at runtime from user secrets.

### Run Locally

```bash
npm run dev        # Start Vite dev server on http://localhost:3000
npm run build      # Production build
npm run preview    # Preview the production build
npm run lint       # Type-check with tsc --noEmit
```

---

## Testing

The test suite runs against the shared seed dataset in `seeds/seedData.mjs` using the native Node test runner.

```bash
npm test              # Run all tests (UAT + scenarios)
npm run test:uat      # Role/RBAC, ethical walls, legal holds, financials, INR formatting
npm run test:scenarios# End-to-end business scenario coverage
```

Coverage includes RBAC permission matrices, ethical wall access evaluation, legal hold preservation verification, matter financial calculations, evergreen retainer thresholds, and Indian-currency parsing/formatting.

---

## Documentation

Full technical documentation lives in [`docs/`](docs/README.md):

| Document | Contents |
| :--- | :--- |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture, multi-tenant isolation, RBAC layers, diagrams |
| [TECH_STACK.md](docs/TECH_STACK.md) | Runtime, frameworks, libraries, and selection rationale |
| [FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) | Directory layout and file-level responsibilities |
| [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | Entity definitions, constraints, Mermaid ERD |
| [DATA_FLOW.md](docs/DATA_FLOW.md) | Document pipelines, legal holds, trust accounting, billing flows |
| [PROCESS_FLOW.md](docs/PROCESS_FLOW.md) | Ethical walls, spoliation release, WIP billing, SaaS licensing workflows |
| [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) | Local setup, environment config, Docker, cloud deployment |

---

## License

Private — all rights reserved.
