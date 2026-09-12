# 🎮 Duo Games Hub

A multi-game serverless WebRTC 2-player co-op platform built with **React**, **Three.js / Canvas**, **PeerJS (WebRTC)**, and **Supabase**.

Repository: [https://github.com/manialgo/duo-games-hub](https://github.com/manialgo/duo-games-hub)

---

## 📁 Project Architecture & File Organization

The project is structured with strict modular isolation for each game to ensure existing games never collapse or interfere when adding new games:

```
duo-games-hub/
├── public/                     # Static assets (favicons, icons)
├── src/
│   ├── App.jsx                 # Central router (adds /play/<game-id> routes)
│   ├── main.jsx                # React root entry point
│   ├── index.css               # Global Tailwind / Canvas styles & fonts
│   │
│   ├── lib/                    # Shared core infrastructure
│   │   └── supabase.js         # Supabase client (leaderboards & auth)
│   │
│   ├── store/                  # Global shared hub state
│   │   └── userStore.js        # Auth session & user profile state
│   │
│   ├── components/             # Global shared UI components
│   │   ├── Hub.jsx             # Games Selection Hub
│   │   ├── Auth.jsx            # User registration & login page
│   │   └── AdBanner.jsx        # Shared bottom ad banner
│   │
│   └── games/                  # 🚀 Independent Games Directory
│       │
│       ├── tilt-tower/         # GAME 1: Tilt Tower Co-Op (3D Physics)
│       │   ├── TiltTowerWrapper.jsx
│       │   ├── components/     # Game-specific UI (Lobby, HUD, Scene, etc.)
│       │   ├── hooks/          # Game-specific PeerJS & Control hooks
│       │   └── store/          # Game-specific Zustand state store
│       │
│       └── laser-grid/         # GAME 2: Laser Grid Co-Op (2D Optics)
│           ├── LaserGridWrapper.jsx
│           ├── components/     # Game-specific UI (Canvas, HUD, Victory)
│           ├── hooks/          # Game-specific PeerJS hook
│           └── store/          # Game-specific Zustand state store
```

---

## ➕ How to Add a New Game to the Hub

To add a new multiplayer game in the future without touching existing games:

1. **Create a new folder** under `src/games/<your-game-name>/`
2. **Add your game components**:
   - `src/games/<your-game-name>/<YourGame>Wrapper.jsx`
   - `src/games/<your-game-name>/components/`
   - `src/games/<your-game-name>/hooks/`
   - `src/games/<your-game-name>/store/`
3. **Register the route** in `src/App.jsx`:
   ```jsx
   <Route path="/play/<your-game-name>" element={<YourGameWrapper />} />
   ```
4. **Add the card** to `GAMES` list in `src/components/Hub.jsx`:
   ```javascript
   {
     id: 'your-game-name',
     title: 'YOUR GAME TITLE',
     desc: 'SHORT DESCRIPTION',
     color: '#00ff88',
     active: true,
     path: '/play/your-game-name'
   }
   ```

---

## 🛠️ Development & Build Instructions

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production (Vercel deployment)
npm run build
```

---

## 🌐 Environment Variables (Supabase)

Configure in `.env.local` or Vercel Environment Variables:
```env
VITE_SUPABASE_URL=https://wkpneyjlayzzigdmmbso.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```
