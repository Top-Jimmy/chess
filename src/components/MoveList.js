import React, { useContext } from 'react';
import { GameContext } from '../state/GameProvider';

const turnStyle = {
  height: '35px',
};
const labelStyle = {
  width: '30px',
};
const moveStyle = {
  width: '60px',
  cursor: 'pointer',
};
const selectedStyle = {
  backgroundColor: 'lightgray',
};

const MoveList = props => {
    const [state, dispatch] = useContext(GameContext);
    const { selectMove } = dispatch;
    const { moveHistory, currentMoveIndex } = state;

    let sortedMoves = [];
    let moveSet = [];
    moveHistory.forEach((move, i) => {
      // Ignore game setup
      if (i === 0) return;
      if (moveSet.length < 2) {
        moveSet.push(move);
      } else {
        sortedMoves.push(moveSet);
        moveSet = [move];
      }
      if (i+1 === moveHistory.length && moveSet) {
        // Add last move
        sortedMoves.push(moveSet);
      }
    });

    let moveCount = 1;
    const renderedList = sortedMoves.map((moves, turnNumber) => {
      const moveCells = moves.map((move) => {
        const this_move_index = moveCount;
        const onClickFn = () => {
          selectMove(this_move_index);
        };
        let cellStyle = moveStyle;
        if (currentMoveIndex === moveCount) {
          cellStyle = { ...cellStyle, ...selectedStyle };
        }
        moveCount++;
        return (
          <td
            key={moveCount + '_' + move.notation}
            onClick={onClickFn}
            style={cellStyle}
          >{move.notation}</td>
        );
      });

      return (
          <tr key={turnNumber} style={turnStyle}><td style={labelStyle}>{turnNumber + 1}</td>{moveCells}</tr>
      );
    });

    return (
      <React.Fragment>
        <div>currentMoveIndex: { currentMoveIndex }</div>
        <table>
          <tbody>
            {renderedList}
          </tbody>
        </table>
      </React.Fragment>
    );
};

export default MoveList;