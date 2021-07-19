import { calculateMoves } from "./movement";

export function calculateNotation(startSquare, endSquare, movingPiece, capturedPiece, checked, promotionType) {
  const files = 'abcdefgh';
  const { file, rank } = endSquare;
  const { type } = movingPiece;
  const pieceNotation = notationMap[type];

  let checkedNotation = '';
  if (checked) {
    checkedNotation = '+';
  }

  let promotionNotation = promotionType ? notationMap[promotionType] : '';

  const notationPostfix = files[file-1] + rank.toString() + promotionNotation + checkedNotation

  if (capturedPiece) {
    const startFileNotation = files[startSquare.file-1];
    return (pieceNotation || startFileNotation) + 'x' + notationPostfix;
  }
  
  return pieceNotation + notationPostfix;
  
};

const notationMap = {
  pawn: '',
  rook: 'R',
  bishop: 'B',
  knight: 'N',
  queen: 'Q',
  king: 'K',
};

export function calculateLegalSquares(gameData, kingMeta) {
  // console.log('calculateLegalSquares');
  const { gameSquares } = gameData;
  // Given squares, pieces, and piece meta data, calculate for each piece their current legal moves
  // Also insert list of legal_moves each player has into gameData (to determine checkmate)
  let newSquares = [...gameSquares];
  let playerLegalSquares = {
    black: [],
    white: [],
  };

  newSquares.forEach((rankSquares, rank) => {
    rankSquares.forEach((square, file) => {
      if (square.piece) {
        const { piece } = square;
        const { type, color, available_squares, pinned_squares} = piece;
        const player = color;
        const otherPlayer = color === 'white' ? 'black' : 'white';
        let newPiece = { ...piece };

        // Default to available moves
        let legal_squares = [];
        if (available_squares && available_squares.length) { 
          legal_squares.push(...available_squares);
        }

        if (type === 'king') {
          // King can't move into defended square
          legal_squares = filterNegativeMoves(legal_squares, gameData[otherPlayer].defended_squares);
          // TODO: probably figure out castling here
          let castleSquares = calcCastleSquares(gameSquares, color, gameData[otherPlayer].defended_squares, kingMeta);
          if (castleSquares.length) {
            legal_squares.push(...castleSquares);
          }
        } else {
          // Have to cover check by moving to something in checked_squares
          if (gameData[player].checked_squares && gameData[player].checked_squares.length) {
            if (gameData[player].checked_squares.length === 1) {
              // Normal check. Can block
              legal_squares = filterLegalMoves(legal_squares, gameData[player].checked_squares[0]);
            } else if (gameData[player].checked_squares.length > 1) {
              // player in double check. Moving king is only legal move
              newPiece.legal_squares = [];
              newSquares[rank][file].piece = newPiece;
              return;
            }
          }
          
          // Cannot reveal check by moving out of pin
          legal_squares = filterLegalMoves(legal_squares, pinned_squares);
          
        }
        newPiece.legal_squares = legal_squares;
        playerLegalSquares[color].push(...legal_squares);
        newSquares[rank][file].piece = newPiece;
      }
    });
  });

  // Checkmated when in check (checked_squares.length) but no legal moves
  let whiteCheckmated = false;
  let blackCheckmated = false;
  if (gameData.white.checked_squares && gameData.white.checked_squares.length) {
    if (playerLegalSquares.white.length === 0) {
      whiteCheckmated = true;
    }
  } else if (gameData.black.checked_squares && gameData.black.checked_squares.length) {
    if (playerLegalSquares.black.length === 0) {
      blackCheckmated = true;
    }
  }

  return {
    gameSquares: newSquares,
    white: gameData.white,
    black: gameData.black,
    checkmated: {
      black: blackCheckmated,
      white: whiteCheckmated,
    },
  };
};

export function calculateAvailableSquares(gameSquares) {
  // console.log('calculateAvailableSquares');

  // Given piece position (ranks), calculate for each player...
    // defended_squares: Array of squares black/white's pieces are defending/attacking
    // When you are checked, which squares can block it (checked_squares)
  let newPlayerMeta = {
    white: {
      defended_squares: [], // i.e. squares king can't move to
      checked_squares: [], // i.e. squares that can stop check (includes attacking square)
    },
    black: {
      defended_squares: [],
      checked_squares: [], // NOTE! Array of arrays. i.e. one array = check, two = double check
    },
  };

  // For each square (with a piece), calculate basic moves each piece can do (ignore all special movement rules/restrictions)
  // If pinning a piece to king, update (pinned) square with list of squares that can block pin (pinned_squares)
  let newSquares = [...gameSquares];
  
  gameSquares.forEach((rankSquares, rank) => {
    rankSquares.forEach((square, file) => {
      if (square.piece) {
        let newPiece = { ...square.piece };
        const otherPlayer = newPiece.color === 'white' ? 'black' : 'white';

        let updated = false;
        
        // Determine squares piece defends, can move to, pieces it pins, castling
        let moveData = calculateMoves(square, gameSquares);

        if (moveData.available_squares.length) {
          updated = true;
          newPiece.available_squares = moveData.available_squares;
          newPlayerMeta[newPiece.color].defended_squares.push(...moveData.available_squares);
        }
        if (moveData.checked_squares.length) {
          newPlayerMeta[otherPlayer].checked_squares.push(moveData.checked_squares);
        }
        if (moveData.pinned_square) {
          // Update the pinned square with any moves that can block pin
          const { file: pinned_file, rank: pinned_rank, pinned_squares } = moveData.pinned_square;
          newSquares[pinned_rank-1][pinned_file-1].piece.pinned_squares = pinned_squares;
          console.log(newSquares[pinned_rank-1][pinned_file-1].piece.type + ' is pinned');
        }

        if (updated) {
          newSquares[rank][file].piece = newPiece;
        }
      }
    })
  })

  return {
    gameSquares: newSquares,
    ...newPlayerMeta,
  }
}

function calcCastleSquares(ranks, player, defendedSquares, playerKingMeta) {
  // Return valid squares king can castle to
  // squares also contain before/after positions of rooks used to re-calculate position after castling king
  let castle_squares = [];

  if (playerKingMeta.moved) {
    return [];
  }

  const rank = player === 'white' ? 1 : 8;

  const validOptions = validCastleOptions(ranks, rank, defendedSquares);
  const { validKingside, valideQueenside } = validOptions;
  
  if (validKingside && !playerKingMeta.kingsideRookMoved) {
    castle_squares.push(
      {file: 2, rank, rookBeforeSquare: {file: 1, rank }, rookAfterSquare: {file: 3, rank}}
    );
  }
  if (valideQueenside && !playerKingMeta.queensideRookMoved) {
    castle_squares.push(
      {file: 6, rank, rookBeforeSquare: {file: 8, rank }, rookAfterSquare: {file: 5, rank}}
    );
  }

  return castle_squares;
}

const validCastleOptions = (ranks, rank, defendedSquares) => {
  // Verify pieces aren't in the way, squares aren't defended for both king/queenside
  let validKingside = true;
  let valideQueenside = true;

  // King/Queenside options must traverse empty squares
  // King cannot traverse defended square

  
  const kingsideSquares = [
    ranks[rank - 1][1],
    ranks[rank - 1][2],
  ];
  kingsideSquares.forEach((s) => {
    if (s.piece) {
      validKingside = false;
    } else if (defendedSquares.filter((ds) => ds.rank === s.rank && ds.file === s.file).length) {
      validKingside = false;
    }
  });
  
  // Add queenside castle square if not blocked
  const queensideSquares = [
    ranks[rank - 1][6],
    ranks[rank - 1][5],
    ranks[rank - 1][4],
  ];
  // King doesn't cross G file (7) on queenside castle
  queensideSquares.forEach((s) => {
    if (s.piece) {
      valideQueenside = false;
    } else if (s.file !== 7 && defendedSquares.filter((ds) => ds.rank === s.rank && ds.file === s.file).length) {
      valideQueenside = false;
    }
  });
  
  return {
    validKingside,
    valideQueenside,
  };
}

const filterNegativeMoves = (legal_moves, filter_list) => {
  // Return legal moves that are not in filter_list
  if (!filter_list || filter_list.length === 0) {
    return legal_moves;
  }
  // console.log('filterNegativeMoves');
  let filtered_legal_moves = [];
  legal_moves.forEach((lm) => {
    let keep = true;
    filter_list.forEach((fm) => {
      if (fm.rank === lm.rank && fm.file === lm.file) {
        keep = false;
      }
    });
    if (keep) {
      filtered_legal_moves.push(lm);
      // console.log('king can move to ' + lm.file.toString() + ' ' + lm.rank.toString());
    } else {
      // console.log('king cannot move to ' + lm.file.toString() + ' ' + lm.rank.toString());
    }
  });
  return filtered_legal_moves;
}

const filterLegalMoves = (legal_moves, filter_list) => {
  // Return values that are in both lists
  if (!filter_list || filter_list.length === 0) {
    return legal_moves;
  }
  console.log('filterLegalMoves');
  let filtered_legal_moves = [];

  legal_moves.forEach((lm) => {
    filter_list.forEach((fm) => {
        // Has to exist in filter_list
        if (fm.rank === lm.rank && fm.file === lm.file) {
          filtered_legal_moves.push(lm);
        }
    });
  });
  return filtered_legal_moves;
}
