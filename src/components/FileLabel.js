import React from 'react';

const labels = 'ABCDEFGH';

// UI row across top/bottom of board (A-H)
const FileLabel = (props) => {
    const { files } = props;

    const renderedRankLabels = files.map((file, i) => {
        return (
            <div key={i} className="cell fileLabel">
                {labels[file - 1]}
            </div>
        );
    });
    return (
        <div className="rank">
            <div className="cell cornerFiller" />
            {renderedRankLabels}
            <div className="cell cornerFiller" />
        </div>
    );
};

export default FileLabel;