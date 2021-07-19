import React, { useContext } from 'react';

import { images } from '../util/pieceImages';
import { GameContext } from '../state/GameProvider';

// Display options for promoting current player's pawn
const PawnPromotion = props => {
  const [state, dispatch] = useContext(GameContext);
  const { player, pawnPromotion } = state;
  const { promotePawn } = dispatch;

  if (!pawnPromotion) {
    return null;
  }

  const options = ['queen', 'rook', 'bishop', 'knight'];
  const promotionOptions = options.map((type, i) => {
    let img_src = images[player][type];
    const piece_img = <img className="piece_img" src={img_src} alt={'promotion_' + type} />;

    const promotionSelection = () => promotePawn(type);
    
    return (
      <div className="promotion_option" onClick={promotionSelection}>
        {piece_img}
      </div>
    )
  });

  return <div id="pawn_promotion" className={player}>{promotionOptions}</div>;
};

export default PawnPromotion