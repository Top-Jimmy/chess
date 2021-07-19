import React, { useContext, useState } from 'react';

import { GameContext } from '../state/GameProvider';

import Square from './Square';
import BoardUI from './BoardUI';
import RankLabel from './RankLabel';
import FileLabel from './FileLabel';

const vals = [1, 2, 3, 4, 5, 6, 7, 8];

// const boardRanks = [1, 2, 3, 4, 5, 6, 7, 8];
// const boardFiles = [1, 2, 3, 4, 5, 6, 7, 8];
// const boardFiles = ['a', 'b' , 'c', 'd', 'e', 'f', 'g', 'h'];

// Render game board w/ current state, along w/ labels for files/ranks
const Board = props => {
	// Render from white's perspective is default;
	const [whitesPerspective, setPerspective] = useState(true);
	const togglePerspective = () => {
		setPerspective((prevState) => {
			return !prevState;
		});
	};
	const showRanksAndFiles = true;
	// const [showRanksAndFiles, setRanksAndFiles] = useState(true);

	const [state, dispatch] = useContext(GameContext);
	const { player, gameSquares, selectedSquare: ss, selectedPiece, playerMeta, currentMoveIndex } = state;
	const { legal_squares } = selectedPiece || {};
	const { selectSquare, moveToSquare } = dispatch;

	const boardFiles = whitesPerspective ? vals : vals.slice().reverse();
	const boardRanks = whitesPerspective ? vals.slice().reverse() : vals;

	// Render each rank (1-8)
	const renderGameSquares = () => {
		return boardRanks.map((rank) => {
			const squares = gameSquares[rank-1];
			const orderedSquares = whitesPerspective ? squares : squares.slice().reverse();
			// Render each square in rank (A-H)
			const renderedSquares = orderedSquares.map((square) => renderSquare(square));
			return (
				<div key={rank} className="rank" id={"rank"+rank}>
					{showRanksAndFiles && <RankLabel rank={rank} />}
					{renderedSquares}
					{showRanksAndFiles && <RankLabel rank={rank} />}
				</div>
			);
	});
	} 

	const renderSquare = (square) => {
		// Given selected piece,  Figure out if this square is a legal move, capturable, defended, etc
		const { file, rank, piece } = square;

		let capture = false;
		
		const selected = ss && ss.rank === rank && ss.file === file;
		let legalSquare;
		if (legal_squares && legal_squares.length) {
			legalSquare = legal_squares.filter((s) => s.file === file && s.rank === rank)[0];
		}
		if (legalSquare && piece && piece.color !== player) {
			capture = true;
		}
		
		const { enPassant } = legalSquare || {};
		if (enPassant) {
			console.log('x');
		}

		const defended = playerMeta[player].defended_squares.filter((s) => s.rank === rank && s.file === file).length;
		
		// TODO
		// promote (pawn)
		// castle (king)

		// limit legal squares
		// -cannot place own king in check
		// -must remove check

		let squareOnclick = () => selectSquare(file, rank);
		if (legalSquare) {
			squareOnclick = () => moveToSquare(legalSquare, enPassant);
		}

		return (
			<Square
				key={rank + '_ ' + file + '_' + currentMoveIndex}
				selected={selected}
				capture={capture}
				defended={defended}
				onClick={squareOnclick}
				legalMove={!!legalSquare}
				square={square}
				piece={piece}
			/>
		);
	};

	return (
		<div id="board">
			{showRanksAndFiles && <FileLabel files={boardFiles} />}
			{renderGameSquares()}
			{showRanksAndFiles && <FileLabel files={boardFiles} />}
			<BoardUI togglePerspective={togglePerspective} />
		</div>
	);
};

export default Board;