import React, { useContext } from 'react';
import { GameContext } from '../state/GameProvider';

const Victory = props => {
  const [state, dispatch] = useContext(GameContext);
  const { restartGame } = dispatch;
  const { kingMeta } = state;
  const { white, black } = kingMeta;
  const { checkmated: white_checkmated } = white;
  const { checkmated: black_checkmated } = black;

  if (!white_checkmated && !black_checkmated) {
    return null;
  }

  let phrase = 'Checkmate bitch';
  if (white_checkmated) {
    phrase = 'Checkmate whitey';
  }

  return (
    <div className="victory">
      <div className="details">
        {phrase}
        <button onClick={restartGame}>New Game</button>
      </div>
    </div>
  );
};

export default Victory;