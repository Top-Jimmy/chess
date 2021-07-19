
// Basic Movement functions
// Return list of all squares piece could possibly move to (ignores other pieces on board)

function filterBasicSquares(possible_moves) {
  // Filter for squares that are actually on the board
  return possible_moves.filter((s) => {
    const { rank: r, file: f } = s;
    if (!r || !f || r > 8 || f > 8 || r < 1 || f < 1) {
      return false;
    }
    return true;
  });
};
function basicPawnMoves(file, rank, color) {
  let board_moves = [];

  // Move 1 space (if not on last rank)
  let movement = color === 'white' ? 1 : -1;
  if (color === 'white' ? rank !== 8 :  rank !== 1) {
    board_moves.push({file, rank: rank + movement});
  }

  // Move 2 spaces (if on starting rank)
  if (color === 'white' ? rank === 2 :  rank === 7) {
    movement = color === 'white' ? 2 : -2;
    board_moves.push({file, rank: rank + movement});
  }

  return board_moves;
};
function basicKingMoves(file, rank) {
  let possible_moves = [
    {file, rank: rank+1},
    {file: file+1, rank},
    {file: file+1, rank: rank+1},
    {file: file+1, rank: rank-1},
    {file, rank: rank-1},
    {file: file-1, rank: rank-1},
    {file: file-1, rank,},
    {file: file-1, rank: rank+1},
  ];
  return filterBasicSquares(possible_moves);
};
function basicKnightMoves(file, rank) {
  const possible_moves = [
    {file: file - 1, rank: rank + 2 },
    {file: file + 1, rank: rank + 2 },
    {file: file + 2, rank: rank + 1 },
    {file: file + 2, rank: rank - 1 },
    {file: file + 1, rank: rank - 2 },
    {file: file - 1, rank: rank - 2 },
    {file: file - 2, rank: rank - 1 },
    {file: file - 2, rank: rank + 1 },
  ];
  return filterBasicSquares(possible_moves);
};

function calcDiagonalSquares(file, rank, fileMovement, rankMovement, underCheck) {
  // Used to calculate squares in a particular direction until edge of board (ignores pieces)
  // Pass in...
  // current file/rank 
  // direction file/rank should move each iteration

  if (underCheck) {
    console.log('x');
  }
  let board_squares = [];
  let newRank = rank + rankMovement;
  let newFile = file + fileMovement;
  let safetyCount = 0;
  while (newRank < 9 && newRank > 0 && newFile < 9 && newFile > 0 && safetyCount < 8) {
    board_squares.push({
      rank: newRank,
      file: newFile,
    });
    newRank += rankMovement;
    newFile += fileMovement;
    safetyCount++;
  }
  return board_squares;
};

export function calculateMoves(square, gameSquares) {
  const { piece, rank, file } = square;
  if (!piece) {
    return;
  }
  const { type, color } = piece;
  
  let available_squares = []; // Squares piece can normally move to (ignores check, pins, etc)
  let checked_squares = []; // Squares that other player can move to, blocking check
  let pinned_square; // info about any piece that is pinned to other player's king

  let possible_moves = [];
  let directions = [];

  if (type === 'pawn') {
    // Forward movement
    let blocked = false;
    possible_moves = basicPawnMoves(file, rank, color);
    possible_moves.forEach((square) => {
      if (blocked) return;
      const nextSquare = gameSquares[square.rank-1][square.file-1];
      if (nextSquare.piece) {
        blocked = true;
        return;
      }
      available_squares.push({file: square.file, rank: square.rank});
    });

    // Attacking
    const direction = color === 'white' ? 1 : -1;

    // Normal attacks
    let possible_attacks = [
      {rank: rank + direction, file: file + 1}, 
      {rank: rank + direction, file: file - 1},
    ];

    // En passant attacks
    // Only available to pawns on certain rank
    if (rank === color ? 4 : 5) {
      // Check for adjacent pawn w/ en passant
      possible_attacks.push(...[
        {rank, file: file + 1, enPassantAttempt: true },
        {rank, file: file - 1, enPassantAttempt: true },
      ]);
    }

    // Check if a valid piece to attack exists at any possible squares
    possible_attacks.forEach((square) => {
      const { file: attackFile, rank: attackRank, enPassantAttempt } = square;
      if (attackRank < 9 && attackRank > 0 && attackFile < 9 && attackFile > 0) {
        const attackedSquare = gameSquares[attackRank-1][attackFile-1];
        const { piece: attackedPiece } = attackedSquare;
        if (!attackedPiece || attackedPiece.color === color) {
          return;
        }

        // regular or en passant
        if (enPassantAttempt) {
          const { enPassant: validEnPassant } = attackedPiece;
          if (validEnPassant) {
            const movement = color === 'white' ? 1 : -1;
            available_squares.push({file: square.file, rank: square.rank + movement, enPassant: true});
          }
        } else {
          available_squares.push({file: square.file, rank: square.rank});
          if (attackedPiece.type === 'king') {
            checked_squares.push({attackFile, attackRank});
          }
        } 
          
      }
    });

  } else if (type === 'king') {
    possible_moves = basicKingMoves(file, rank);
    possible_moves.forEach((square) => {
      // Cannot move into defended square
      const landingSquare = gameSquares[square.rank-1][square.file-1];
      if (landingSquare.piece && landingSquare.piece.color === color) {
        return;
      }
      available_squares.push({file: square.file, rank: square.rank});
    });

    // castling


  } else if (type === 'knight') {
    possible_moves = basicKnightMoves(file, rank);

    possible_moves.forEach((square) => {
      const gameSquare = gameSquares[square.rank-1][square.file-1];
      const { piece: nextPiece } = gameSquare;
      if (nextPiece && nextPiece.color === color) {
        return;
      }
      available_squares.push({file: square.file, rank: square.rank});
      if (nextPiece && nextPiece.type === 'king') {
        checked_squares.push({file, rank});
      }
    });
  } else { // rook, bishop, queen
    
    if (type === 'rook' || type === 'queen') {
      directions.push(calcDiagonalSquares(file, rank, 0, 1));
      directions.push(calcDiagonalSquares(file, rank, 0, -1));
      directions.push(calcDiagonalSquares(file, rank, 1, 0));
      directions.push(calcDiagonalSquares(file, rank, -1, 0));
    }
    if (type === 'bishop' || type === 'queen') {
      directions.push(calcDiagonalSquares(file, rank, 1, 1));
      directions.push(calcDiagonalSquares(file, rank, 1, -1));
      directions.push(calcDiagonalSquares(file, rank, -1, 1));
      directions.push(calcDiagonalSquares(file, rank, -1, -1));
    }
  }

  // Figure out how many moves are available in each direction and if first piece found is pinned to king
  // If 'firstPiece' is pinned, save squares that block pin to pinned_squares
  directions.forEach((possible_squares) => {
    let blocked = false;
    possible_squares.forEach((ps, i) => {
      if (blocked) return;

      const gameSquare = gameSquares[ps.rank-1][ps.file-1];
      const { piece: firstPiece } = gameSquare;
      const { type: firstPieceType, color: firstColor } = firstPiece || {};
      if (firstPiece) {
        
        if (firstPieceType === 'king' && firstColor !== color) {
          console.log('check!');
          checked_squares.push(square, ...possible_squares.slice(0, i));
        } else {
          blocked = true;
        }
        if (firstColor === color) {
          return;
        } else {
          // Check if piece is pinned to king
          let foundPiece = false;
          for (let nextSquareIndex = i + 1; nextSquareIndex < possible_squares.length; nextSquareIndex++) {
            // Stop looking once next piece is found
            if (foundPiece) break;
            const nextSquare = possible_squares[i + 1];
            if (!nextSquare) {
              continue;
            }
            const nextGameSquare = gameSquares[nextSquare.rank-1][nextSquare.file-1];
            const { piece: nextPiece } = nextGameSquare;

            // Piece is pinned if next piece is other player's king
            if (nextPiece) {
              if (nextPiece.type === 'king' && nextPiece.color !== color) {
                pinned_square = {
                  rank: gameSquare.rank,
                  file: gameSquare.file,
                  pinned_squares: [square, ...possible_squares.slice(0, i), {file: gameSquare.file, rank: gameSquare.rank}]
                }
              }
              foundPiece = true;
            }
          }
          
        }
      }
      available_squares.push({file: ps.file, rank: ps.rank});
    });
  });

  return {
    available_squares,
    pinned_square,
    checked_squares,
  }
};
