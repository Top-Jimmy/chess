import React, { createContext, useState } from 'react';

import { defaultGamePositions, defaultKingMeta, } from '../util/setup';
import { calculateAvailableSquares, calculateLegalSquares, calculateNotation } from '../util/meta';

const basicSquares = defaultGamePositions();
const basicGameData = calculateAvailableSquares(basicSquares, defaultKingMeta);
const defaultPlayerMeat = {
    'white': basicGameData.white,
    'black': basicGameData.black,
};
const defaultGameData = calculateLegalSquares(basicGameData, defaultKingMeta);

const initialMove = {
    gameSquares: defaultGameData.gameSquares,
    playerMeta: defaultPlayerMeat,
    kingMeta: defaultKingMeta,
};

// Change turn

// setCurrentMoveIndex(something) 
// clearSelection()

export const GameContext = createContext();
export const GameProvider = props => {
    // Store state for every move
    const [moveHistory, setMoveHistory] = useState([initialMove]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

    // Derive values from moveIndex
    const mod = currentMoveIndex % 2;
    const player = mod ? 'black' : 'white';
    const otherPlayer = player === 'white' ? 'black' : 'white';
    
    // Display these values
    const currentMove = moveHistory[currentMoveIndex];
    const currentGameSquares = currentMove.gameSquares;
    const currentPlayerMeta = currentMove.playerMeta;
    const currentKingMeta = currentMove.kingMeta;

    // Modify UI based on square/piece selected
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [selectedSquare , setSelectedSquare] = useState(null);
    const clearSelection = () => {
        setSelectedPiece(null);
        setSelectedSquare(null);
    };

    const [pawnPromotion, setPawnPromotion] = useState(null);
    const promotePawn = (type) => {
        if (!pawnPromotion || !type) {
            return;
        }
        const newSquares = currentGameSquares.map((prevRank) => {
            const newRank = prevRank.map((s) => {
                const { file, rank } = s;
                let newSquare = { file, rank, squareColor: s.squareColor };
                if (s.piece) {
                    let newPiece = {
                            type: s.piece.type,
                            color: s.piece.color,
                    }
                    if (rank === pawnPromotion.rank && file === pawnPromotion.file) {
                        newPiece.type = type;
                    }
                    newSquare.piece = newPiece;
                }
                return newSquare;
            });
            return newRank;
        });

        const newGameData = calculateAvailableSquares(newSquares);
        const updatedGameData = calculateLegalSquares(newGameData, currentKingMeta);

        const newPlayerMeta = { black: newGameData.black, white: newGameData.white };

        const checked = updatedGameData[otherPlayer].checked_squares && updatedGameData[otherPlayer].checked_squares.length;
        // TODO let checkmate = false;

        updateMove({
            gameSquares: updatedGameData.gameSquares,
            playerMeta: newPlayerMeta,
            kingMeta: currentKingMeta,
            notation: calculateNotation(selectedSquare, pawnPromotion, selectedPiece, null, checked, type),
        });

        setPawnPromotion(null);
        clearSelection();
    };

    // state management functions

    // Game UI
    const selectMove = (moveIndex) => {
        setCurrentMoveIndex(moveIndex);
        
    };
    const restartGame = () => {
        setMoveHistory([initialMove]);
        setCurrentMoveIndex(0);
        clearSelection();
        setPawnPromotion(null);
    };
    const previousMove = () => {
        if (currentMoveIndex === 0) {
            return;
        }
        console.log('previousMove');
        setCurrentMoveIndex((prevIndex) => {
            return prevIndex - 1;
        });
        clearSelection();
        setPawnPromotion(null);
    };
    const nextMove = () => {        
        if (currentMoveIndex === moveHistory.length - 1) {
            return;
        }

        // Reinitialize game state
        const move = moveHistory[currentMoveIndex + 1];
        if (!move) {
            return;
        }
        console.log('nextMove');
        incrementMove();
        clearSelection();
        setPawnPromotion(null);
    };

    const addMove = (move) => {
        // Add a move and increment current move
        console.log(move.notation);
        setMoveHistory((prevState) => {
            return [...prevState.slice(0, currentMoveIndex + 1), move];
        });
        incrementMove();
    };
    const updateMove = (move) => {
        // Modify current move
        setMoveHistory((prevState) => {
            return [...prevState.slice(0, currentMoveIndex), move];
        });
    };
    const incrementMove = () => {
        setCurrentMoveIndex((prevIndex) => {
            return prevIndex + 1;
        });
    }

    const selectSquare = (file, rank) => {
        if (!file || !rank || file > 8 || rank > 8 || file < 1 || rank < 1) {
            clearSelection();
        }
        
        const gameSquare = currentGameSquares[rank-1][file-1];
        const { piece } = gameSquare;
        if (piece && piece.color === player) {
            setSelectedSquare({rank, file});
            setSelectedPiece(piece || null);
        } else {
            clearSelection();
        }
    };
    const moveToSquare = (newSquare, enPassantCapture=false) => {
        console.log('moving to square: ' , newSquare);
        // Move piece
        // update game state
        // end turn or display pawn promotion options
        if (!selectedPiece || !selectedSquare) {
            return;
        }

        // Move selected piece
        const { rank, file } = selectedSquare;
        const { file: newFile, rank: newRank } = newSquare;
        let capturedPiece = currentGameSquares[newRank-1][newFile-1].piece;

        // Move rook that's being castled
        const { rookAfterSquare, rookBeforeSquare } = newSquare;
        const { file: beforeFile, rank: beforeRank } = rookBeforeSquare || {};
        const { file: afterFile, rank: afterRank } = rookAfterSquare || {};

        // Remove pawn that was taken via en passant
        let enPassantCaptureSquare;
        if (enPassantCapture) {
            // Pawn is on square +/-1 rank from newSquare
            let movement = player === 'white' ? -1 : 1;
            enPassantCaptureSquare = {file: newFile, rank: newRank + movement };
            capturedPiece = true;
        }

        // Special cases
        let promotingPawn = false;
        let validEnPassantTarget = false; // Pawn has moved 2 spaces this turn

        // Moving king/rook
        let newKingSquare;
        let kingRookMoved;
        let queenRookMoved;
        
        if (selectedPiece.type === 'pawn') {
            const promotionRank = player === 'white' ? 8 : 1;
            if (newSquare.rank === promotionRank) {
                promotingPawn = true;
            }
            // Pawn just moved 2 spaces
            const rightEndRank = player === 'white' ? 4 : 5
            const rightStartRank = player === 'white' ? 2 : 7;
            if (selectedSquare.rank === rightStartRank && newRank === rightEndRank) {
                validEnPassantTarget = true;
            }

        } else if (selectedPiece.type === 'king') {
            newKingSquare = { file: newSquare.file, rank: newSquare.rank,  };
        } else if (selectedPiece.type === 'rook') {
            // Only care if rook is moving from 'original' square
            const originalRookRank = player === 'white' ? 1 : 8;
            if (selectedSquare.rank === originalRookRank) {
                if (selectedSquare.file === 1) {
                    kingRookMoved = true;
                } else if (selectedSquare.file === 8) {
                    queenRookMoved = true;
                }
            }
        }

        // Update piece placement on game squares (selectedPiece and any castled rooks)
        let newGameSquares = [];
        currentGameSquares.forEach((prevRank) => {
            // Add array of squares for each rank
            let newSquares = [];
            prevRank.forEach((s) => {
                // Add each square to newSquares after accounting for moving pieces

                // copy basic info from previousSquare
                // i.e. don't copy legal_moves, en passant from last turn etc.
                let newSquare = { file: s.file, rank: s.rank, squareColor: s.squareColor };
                if (s.piece) {
                    newSquare.piece = {
                        type: s.piece.type,
                        color: s.piece.color,
                    }
                    // if (s.piece.type === 'king') {
                    //     newKingPositions[s.piece.color] = {file: s.file, rank: s.rank};
                    // }
                }
                
                let added = false;

                // Move rooks when castling
                if (rookBeforeSquare && rookBeforeSquare) {
                    // Remove rook from old square
                    if (newSquare.rank === beforeRank && newSquare.file === beforeFile) {
                        newSquares.push({
                            ...newSquare,
                            piece: null,
                        });
                        added = true;
                    } else if (newSquare.rank === afterRank && newSquare.file === afterFile) {
                        // Add rook to new square
                        newSquares.push({
                            ...newSquare,
                            piece: { color: player, type: 'rook'},
                        });
                        added = true;
                    }
                }
                
                let eps = enPassantCaptureSquare;
                if (eps && eps.rank === newSquare.rank && eps.file === newSquare.file) {
                    // Pawn was captured via en passant
                    newSquares.push({
                        ...newSquare,
                        piece: null,
                    });
                } else if (newSquare.rank === rank && newSquare.file === file) {
                    // Old square won't have any piece on it
                    newSquares.push({
                        ...newSquare,
                        piece: null,
                    });
                } else if (newSquare.rank === newRank && newSquare.file === newFile) {
                    // New square should have selectedPiece
                    const enPassantProp = validEnPassantTarget ? { enPassant: true } : {};
                    newSquares.push({
                        ...newSquare,
                        piece: {
                            ...selectedPiece,
                            ...enPassantProp,
                        },
                    });
                } else if (!added) {
                    // Regular square that wasn't changed
                    newSquares.push(newSquare);
                }
                
            });
            newGameSquares.push(newSquares);
        });

        let newPlayerKingMeta = {
            ...currentKingMeta[player],
        }
        let newOtherPlayerKingMeta = {
            ...currentKingMeta[otherPlayer],
        };
        if (newKingSquare) {
            newPlayerKingMeta.moved = true;
            newPlayerKingMeta.position = newKingSquare;
        } else if (kingRookMoved) {
            newPlayerKingMeta.kingsideRookMoved = true;
        } else if (queenRookMoved) {
            newPlayerKingMeta.queensideRookMoved = true;
        }
        

        // Given updated newRanks, recalculate meta for each square
        
        // For each piece, calculate and inject into newRanks...
        // available_squares: squares that normally a piece would be able to move to
        // pinned_squares: a piece pinned to king can move to any of these squares and not reveal a check

        // For each player calculate and return...
        // defended_squares: a square defended (or attacked) by at least 1 of that color's pieces
        // checked_squares: a checked player must move king, or move piece to block one of these squares
        let newKingMeta = {
            [otherPlayer]: { ...newOtherPlayerKingMeta },
            [player]: { ...newPlayerKingMeta },
        };

        const basicGameData = calculateAvailableSquares(newGameSquares);
        const finalGameData = calculateLegalSquares(basicGameData, newKingMeta);
        
        
        const newPlayerMeta = { black: finalGameData.black, white: finalGameData.white };

        // Check: other player's king is in a defended square
        const checked = finalGameData[otherPlayer].checked_squares && finalGameData[otherPlayer].checked_squares.length;

        // Checkmate: other player's king is in check AND they have no legal moves
        if (finalGameData.checkmated[otherPlayer]) {
            newKingMeta[otherPlayer].newOtherPlayerKingMeta.checkmated = true;
        }

        addMove({
            gameSquares: finalGameData.gameSquares,
            playerMeta: newPlayerMeta,
            kingMeta: newKingMeta,
            notation: calculateNotation(selectedSquare, newSquare, selectedPiece, capturedPiece, checked),
        });

        if (promotingPawn) {
            setPawnPromotion(newSquare);
        } else {
            clearSelection();
        }
    };

    const state = {
        player,
        gameSquares: currentGameSquares,
        selectedSquare,
        selectedPiece,
        kingMeta: currentKingMeta,
        playerMeta: currentPlayerMeta,
        moveHistory,
        currentMoveIndex,
        pawnPromotion,
    };
    const dispatch = {
        selectSquare,
        moveToSquare,

        nextMove,
        previousMove,
        selectMove,

        setPawnPromotion,
        promotePawn,

        restartGame,
    };
    const vals = [state, dispatch];

    return (
        <GameContext.Provider value={vals}>
            {props.children}
        </GameContext.Provider>
    );
};