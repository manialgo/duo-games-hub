const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'src');
const tiltTower = path.join(src, 'games', 'tilt-tower');

// 1. Create the new nested directory structure
fs.mkdirSync(path.join(tiltTower, 'components', 'three'), { recursive: true });
fs.mkdirSync(path.join(tiltTower, 'hooks'), { recursive: true });
fs.mkdirSync(path.join(tiltTower, 'store'), { recursive: true });

// 2. Move all Tilt Tower specific files into the new folder
const moves = [
  ['TiltTowerGameWrapper.jsx', 'games/tilt-tower/TiltTowerWrapper.jsx'],
  ['store/gameStore.js', 'games/tilt-tower/store/gameStore.js'],
  ['hooks/usePeer.js', 'games/tilt-tower/hooks/usePeer.js'],
  ['hooks/useGameControls.js', 'games/tilt-tower/hooks/useGameControls.js'],
  ['components/Lobby.jsx', 'games/tilt-tower/components/Lobby.jsx'],
  ['components/Game.jsx', 'games/tilt-tower/components/Game.jsx'],
  ['components/HUD.jsx', 'games/tilt-tower/components/HUD.jsx'],
  ['components/GameOverModal.jsx', 'games/tilt-tower/components/GameOverModal.jsx'],
  ['components/HowToPlay.jsx', 'games/tilt-tower/components/HowToPlay.jsx'],
  ['components/three/Platform.jsx', 'games/tilt-tower/components/three/Platform.jsx'],
  ['components/three/BlockSpawner.jsx', 'games/tilt-tower/components/three/BlockSpawner.jsx'],
  ['components/three/Scene.jsx', 'games/tilt-tower/components/three/Scene.jsx'],
  ['components/three/Environment.jsx', 'games/tilt-tower/components/three/Environment.jsx'],
  ['components/three/FallingBlock.jsx', 'games/tilt-tower/components/three/FallingBlock.jsx'],
];

moves.forEach(([oldPath, newPath]) => {
  const oldFull = path.join(src, oldPath);
  const newFull = path.join(src, newPath);
  if (fs.existsSync(oldFull)) {
    fs.renameSync(oldFull, newFull);
  }
});

// 3. Fix the import paths inside the files that moved
const replaceInFile = (filePath, replacements) => {
  const fullPath = path.join(src, filePath);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  replacements.forEach(([from, to]) => {
    content = content.replace(from, to);
  });
  fs.writeFileSync(fullPath, content);
};

// Fix App.jsx route import
replaceInFile('App.jsx', [
  ["import TiltTowerGameWrapper from './TiltTowerGameWrapper'", "import TiltTowerGameWrapper from './games/tilt-tower/TiltTowerWrapper'"]
]);

// Fix Wrapper's global userStore import
replaceInFile('games/tilt-tower/TiltTowerWrapper.jsx', [
  ["import useUserStore from './store/userStore'", "import useUserStore from '../../store/userStore'"]
]);

// Fix Game.jsx importing the global AdBanner
replaceInFile('games/tilt-tower/components/Game.jsx', [
  ["import AdBanner from '../AdBanner'", "import AdBanner from '../../../components/AdBanner'"],
  ["import AdBanner from './AdBanner'", "import AdBanner from '../../../components/AdBanner'"]
]);

// Fix HUD importing the global userStore
replaceInFile('games/tilt-tower/components/HUD.jsx', [
  ["import useUserStore from '../store/userStore'", "import useUserStore from '../../../store/userStore'"]
]);

// Fix GameOverModal importing global userStore & supabase
replaceInFile('games/tilt-tower/components/GameOverModal.jsx', [
  ["import { supabase } from '../lib/supabase'", "import { supabase } from '../../../lib/supabase'"],
  ["import useUserStore from '../store/userStore'", "import useUserStore from '../../../store/userStore'"]
]);

// 4. Cleanup old empty folders
try { fs.rmdirSync(path.join(src, 'components', 'three')); } catch(e) {}

console.log("✅ Reorganization complete! The project is now ready for multiple games.");
