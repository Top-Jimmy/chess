import React from 'react';

// UI cell at start/end of every rank (1-8)
const RankLabel = (props) => {
    const { rank } = props;

    return (
        <div className="cell rankLabel">
            <div className="rankLabelDisplay">
                {rank}
            </div>
        </div>
    );
};

export default RankLabel;