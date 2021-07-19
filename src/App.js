import './App.css';

import { GameProvider } from './state/GameProvider';
import Board from './components/Board';
import GameUI from './components/GameUI';
import Victory from './components/Victory';
import PawnPromotion from './components/PawnPromotion';

function App() {
  return (
    <GameProvider >
      <div className="App">
        <Board />
        <GameUI />
        <PawnPromotion />
        <Victory />
      </div>
    </GameProvider>
  );
};

export default App;
