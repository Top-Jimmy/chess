import React from 'react';
import AutorenewIcon from '@material-ui/icons/Autorenew';

const BoardUI = props => {
    const { togglePerspective } = props;
    
    return (
        <div onClick={togglePerspective} >
            <AutorenewIcon />
        </div>
    );
};

export default BoardUI;