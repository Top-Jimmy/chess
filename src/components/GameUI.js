import React, { useContext, useEffect } from 'react';
import { GameContext } from '../state/GameProvider';
import MoveList from './MoveList';

import AddIcon from '@material-ui/icons/Add';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

const GameUI = props => {
    const [state, dispatch] = useContext(GameContext);
    const { player, currentMoveIndex } = state;
    const { restartGame, nextMove, previousMove } = dispatch;

    

    useEffect(() => {
      // Bind right/left arrow keys to next/previous moves
      // currentMoveIndex is required dependency so state management funcs reference latest state
      const onKeyDown = (e) => {
        if (e.code === 'ArrowLeft') {
          previousMove();
        } else if (e.code === 'ArrowRight') {
          nextMove();
        }
      }

      window.addEventListener('keydown', onKeyDown);

      return () => {
        window.removeEventListener('keydown', onKeyDown);
      }
    }, [currentMoveIndex]);

    return (
      <div id="gameUI">
        <div style={{display: 'flex'}} >
          <div tooltip="New Game" className="ui_option" onClick={restartGame}>
            <AddIcon className="ui_icon" />
          </div>
          <div tooltip="Previous Move" className="ui_option" onClick={previousMove}>
            <ArrowBackIcon className="ui_icon" />
          </div>
          <div tooltip="Next Move" className="ui_option" onClick={nextMove}>
            <ArrowForwardIcon className="ui_icon" />
          </div>
        </div>
        <p>{player}'s turn</p>
        <MoveList />
      </div>
        
    );
};

export default GameUI;