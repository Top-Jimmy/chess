import React, { useEffect } from 'react';

import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';

import { images } from '../util/pieceImages';
import useHover from './useHover';

const Square = props => {
    const { square, piece, selected, capture, onClick, defended, legalMove } = props;
    const { color, type } = piece || {};
    const { rank, file, squareColor} = square || {};

    const [hoverRef, isHovered] = useHover();

    // useEffect(() => {

    //     window.addEventListener('onHover', onHover);
    // }, [selected]);

    // Display piece on this square
    let piece_img;
    if (color && type) {
        let img_src = images[color][type];
        piece_img = <img className="piece_img" src={img_src} alt={color + '_' + type} />;
    }

    // Display rank and file of current square (test)
    const labelCell = false;
    let label;
    if (labelCell) {
        label = <p>{file.toUpperCase()}{rank}</p>;
    }

    // Show selected square
    let squareClass = "cell " + squareColor;
    if (selected) {
        squareClass += " selected";
    }
    if (defended) {
        // squareClass += " defended";
    }
    
    // Show if square is legal move or can be captured
    let squareIcon;
    if (capture) {
        const captureStyle = {
          fontSize: '62px',
          position: 'absolute',
          left: 'calc(50% - 31px)',
          top: 'calc(50% - 31px)',
          color: 'rgb(100, 141, 174)',
          zIndex: 98,
        };
        squareIcon = <RadioButtonUncheckedIcon style={captureStyle} className="captureSquare" />;
    } else if (legalMove) {
        if (isHovered) {
            squareClass += " hover";
        }
        squareIcon = <div className="legalMove" />;
    }
    return (
        <div ref={hoverRef} onClick={onClick} className={squareClass}>
            {piece_img}
            {squareIcon}
            {label}
        </div>
    );
};
export default Square;