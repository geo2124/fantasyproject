# ProDraft Full-Stack Architecture Outline

## 1. Folder Structure
```
/
âââ server.ts                 # Express entry point (Full-stack API layer)
âââ package.json
âââ src/
â   âââ types/
â   â   âââ index.ts          # Core shared types (Player, Squad, User)
â   âââ store/
â   â   âââ authStore.ts      # Global state using Zustand
â   âââ data/
â   â   âââ mockData.ts       # Database representations
â   âââ services/
â   â   âââ api.ts            # DataProvider Abstraction
â   â   âââ engine/
â   â       âââ fantasyEngine.ts  # Transfers, limits, constraints
â   â       âââ scoringEngine.ts  # Point calculation logic
â   âââ components/
â   â   âââ layout/
â   â       âââ PublicLayout.tsx
â   â       âââ AppLayout.tsx
â   â       âââ AdminLayout.tsx
â   âââ pages/
â   â   âââ public/
â   â       âââ Login.tsx
â   âââ router/
â   â   âââ index.tsx         # Route configuration (React Router v7)
â   âââ App.tsx             # Main entry point mounting RouterProvider
â   âââ main.tsx
```

## 2. App Architecture
- **Rendering Model**: Single Page Application (SPA).
- **Backend Layer**: An Express server running on port `3000` is responsible for serving Vite middleware in development and static assets in production, while exposing generic `/api/*` endpoints. 
- **Routing**: Client-side managed by React Router v7. Includes strict Route Guards preventing unauthorized access to (`/app/*`) and (`/admin/*`).
- **State Management**: `zustand` is used for authentication and global application state.
- **Styling**: TailwindCSS `v4` with utility-class-first methodology. `lucide-react` for iconography. 

## 3. Services Structure
- **Data Provider Interface (`IDataProvider`)**: Exposes structured API methods (e.g. `getPlayers`, `updateSquad`). 
- **Demo Data Implementation (`DemoDataProvider`)**: Provides a full synchronous replacement querying static mock arrays inside `src/data/mockData.ts`. Preparing for future implementations (e.g. `FirebaseDataProvider` or `RestDataProvider`).
- **Engines**: 
  - `FantasyEngine`: Deals with structural integrity of game mechanisms (budget cap validation, squad size validation, transfer rules).
  - `ScoringEngine`: Deals with business logic pertaining strictly to match resolution, parsing stats into standard fantasy points.

## 4. Routing System
The router is partitioned into three Layout domains.

**The Public Zone** (`/`)
- `/` - Landing site showcasing the product
- `/about` - About the platform
- `/league` - A sample template preview of what leagues look like
- `/login` & `/register`

**The Authorized User App Zone** (`/app`) -> *Requires `user` or `admin` role.*
- `/app` - The Manager Dashboard
- `/app/squad` - Visual Squad builder layout 
- `/app/transfers` - Tabular interface to swap out players based on price constraints
- `/app/fixtures` - Gameday information
- `/app/standings` - User rankings in their mini-leagues
- `/app/players` - Aggregated player exploration and metrics 
- `/app/match-center` - Live gameweek information

**The Authorized Admin CMS Zone** (`/admin`) -> *Requires `admin` role.*
- `/admin` - Overall platform dashboard
- `/admin/data` - Administrative data controls (simulation, data loading)
- Rest of CMS management (Leagues, Endpoints)

## 5. Demo Data System Overview
The current iteration uses the robust `DemoDataProvider` allowing instant testing of the application flow from signing in tracking mock users loaded inside `mockData.ts`. It acts as a singleton `db` instance simulating a live connection without waiting for actual network requests.

**Current Test Credentials**:
- User: `user123`
- Admin: `admin123`

## 6. What is Ready vs What Comes Next
**Ready**:
- Full-stack dev server implementation with Vite + Express
- Tailwind `v4` integration + `lucide-react` assets
- Zustand Auth System + User role enforcement
- The generic interface boundaries for Data mapping and Rules Engines
- Complete routing boundary for three specific scopes (Public, Player, Admin)
- Responsive layout containers designed for Mobile + Desktop 

**What Comes Next**:
- Constructing the robust Draft interface (Drag-and-Drop or structured picking)
- Filling out the generic `/api` endpoints and porting the Demo layer into actual backend logic OR a remote database.
- Building out robust component libraries (Data Tables for transfers, dynamic pitch visualizer for Squad layout).
- Implementing the AI insights layer via the newly configured API keys.
