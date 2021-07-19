const indexes = [1, 2, 3, 4, 5, 6, 7, 8];

const defaultPieces = [{
    square: {
        rank: 1,
        file: 1,
    },
    piece: {
        type: 'rook',
        color: 'white',
    },
},
{
    square: {
        rank: 1,
        file: 2,
    },
    piece: {
        type: 'knight',
        color: 'white',
    },
},
{
    square: {
        rank: 1,
        file: 3,
    },
    piece: {
        type: 'bishop',
        color: 'white',
    },
},
{
    square: {
        rank: 1,
        file: 4,
    },
    piece: {
        type: 'king',
        color: 'white',
    },
},
{
    square: {
        rank: 1,
        file: 5,
    },
    piece: {
        type: 'queen',
        color: 'white',
    },
},
{
    square: {
        rank: 1,
        file: 6,
    },
    piece: {
        type: 'bishop',
        color: 'white',
    },
},
{
    square: {
        rank: 1,
        file: 7,
    },
    piece: {
        type: 'knight',
        color: 'white',
    },
},
{
    square: {
        rank: 1,
        file: 8,
    },
    piece: {
        type: 'rook',
        color: 'white',
    },
},
{
    square: {
        rank: 2,
        file: 1,
    },
    piece: {
        type: 'pawn',
        color: 'white',
    },
},
{
    square: {
        rank: 2,
        file: 2,
    },
    piece: {
        type: 'pawn',
        color: 'white',
    },
},
{
    square: {
        rank: 2,
        file: 3,
    },
    piece: {
        type: 'pawn',
        color: 'white',
    },
},
{
    square: {
        rank: 2,
        file: 4,
    },
    piece: {
        type: 'pawn',
        color: 'white',
    },
},
{
    square: {
        rank: 2,
        file: 5,
    },
    piece: {
        type: 'pawn',
        color: 'white',
    },
},
{
    square: {
        rank: 2,
        file: 6,
    },
    piece: {
        type: 'pawn',
        color: 'white',
    },
},
{
    square: {
        rank: 2,
        file: 7,
    },
    piece: {
        type: 'pawn',
        color: 'white',
    },
},
{
    square: {
        rank: 2,
        file: 8,
    },
    piece: {
        type: 'pawn',
        color: 'white',
    },
},
{
    square: {
        rank: 8,
        file: 1,
    },
    piece: {
        type: 'rook',
        color: 'black',
    },
},
{
    square: {
        rank: 8,
        file: 2,
    },
    piece: {
        type: 'knight',
        color: 'black',
    },
},
{
    square: {
        rank: 8,
        file: 3,
    },
    piece: {
        type: 'bishop',
        color: 'black',
    },
},
{
    square: {
        rank: 8,
        file: 4,
    },
    piece: {
        type: 'king',
        color: 'black',
    },
},
{
    square: {
        rank: 8,
        file: 5,
    },
    piece: {
        type: 'queen',
        color: 'black',
    },
},
{
    square: {
        rank: 8,
        file: 6,
    },
    piece: {
        type: 'bishop',
        color: 'black',
    },
},
{
    square: {
        rank: 8,
        file: 7,
    },
    piece: {
        type: 'knight',
        color: 'black',
    },
},
{
    square: {
        rank: 8,
        file: 8,
    },
    piece: {
        type: 'rook',
        color: 'black',
    },
},
{
    square: {
        rank: 7,
        file: 1,
    },
    piece: {
        type: 'pawn',
        color: 'black',
    },
},
{
    square: {
        rank: 7,
        file: 2,
    },
    piece: {
        type: 'pawn',
        color: 'black',
    },
},
{
    square: {
        rank: 7,
        file: 3,
    },
    piece: {
        type: 'pawn',
        color: 'black',
    },
},
{
    square: {
        rank: 7,
        file: 4,
    },
    piece: {
        type: 'pawn',
        color: 'black',
    },
},
{
    square: {
        rank: 7,
        file: 5,
    },
    piece: {
        type: 'pawn',
        color: 'black',
    },
},
{
    square: {
        rank: 7,
        file: 6,
    },
    piece: {
        type: 'pawn',
        color: 'black',
    },
},
{
    square: {
        rank: 7,
        file: 7,
    },
    piece: {
        type: 'pawn',
        color: 'black',
    },
},
{
    square: {
        rank: 7,
        file: 8,
    },
    piece: {
        type: 'pawn',
        color: 'black',
    },
}];

export const defaultKingPositions = {
    white: {
        rank: 1,
        file: 4,
    },
    black: {
        rank: 8,
        file: 4,
    },
};

export function defaultGamePositions() {

    const ranks = indexes.map((rank) => {
        const squares = indexes.map((file) => {
            const currentPiece = defaultPieces.filter((p) => p.square.rank === rank && p.square.file === file)[0];

            // Use sum of 'rank' and 'file' to determine what color square should be
            // even = white
            // odd = black
            const sum = rank + file;
            const even = (sum % 2  === 0) || false;
            const squareColor = even ? 'white' : 'black';
            return {
                rank,
                file,
                squareColor,
                piece: currentPiece ? currentPiece.piece : null,
            };
        });
        return squares;
    });

    return ranks;
};

    

    // Calculate when king is selected
    // kingsideCastleBlocked: true,
    // queensideCastleBlocked: true,
export const defaultKingMeta = {
    black: {
        moved: false,
        kingsideRookMoved: false,
        queensideRookMoved: false,
        checkmated: false,
        position: {
            file: 4,
            rank: 8,
        }
    },
    white: {
        moved: false,
        kingsideRookMoved: false,
        queensideRookMoved: false,
        checkmated: false,
        position: {
            file: 4,
            rank: 1,
        }
    }
};

