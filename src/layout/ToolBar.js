import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, IconButton, Button, Tooltip } from '@material-ui/core';
import '@fortawesome/fontawesome-free/css/all.css';
import LinearScaleIcon from '@material-ui/icons/LinearScale';
import { setTool } from '../actions/toolActions';
import { useSelector, useDispatch } from 'react-redux';

const useStyles = makeStyles({
  toolBarContainer: {
    width: 64,
    backgroundColor: '#5d6e7c',
    height: 'calc(100vh - 56px)',
    borderTop: '0px solid #000',
  },
  button: {
    color: '#fff',
    fontSize: 20,
    padding: '16px 0px 16px 0px',
    marginTop: 1,
    marginBottom: 1,
    '&:hover': {
      backgroundColor: '#43505b',
    }
  },
  activeButton: {
    color: '#fff',
    fontSize: 20,
    padding: '16px 0px 16px 0px',
    '&:hover': {
      backgroundColor: '#43505b',
    },
    backgroundColor: '#43505b'
  },
  toolTip: {
    fontSize: 14,
  }
});

function ToolBar() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const currentTool = useSelector(state => state.tool.current);

  const onClick = toolName => {
    dispatch(setTool(toolName));
  }

  return (
    <div className={classes.toolBarContainer}>
      <Tooltip title={<span className={classes.toolTip}>Select</span>} placement='right' arrow>
        <Button size='small'
          onClick={() => onClick('SELECT')}
          className={currentTool === 'SELECT' ? classes.activeButton : classes.button}
        >
          <span className="fas fa-mouse-pointer"></span>
        </Button>
      </Tooltip>

      <Tooltip title={<span className={classes.toolTip}>Draw</span>} placement='right' arrow>
        <Button size='small'
          onClick={() => onClick('DRAW')}
          className={currentTool === 'DRAW' ? classes.activeButton : classes.button}
        >
          <span className="fas fa-pen"></span>
        </Button>
      </Tooltip>

      <Tooltip title={<span className={classes.toolTip}>Line</span>} placement='right' arrow>
        <Button size='small'
          onClick={() => onClick('LINE')}
          className={currentTool === 'LINE' ? classes.activeButton : classes.button}
        >
          <LinearScaleIcon />
        </Button>
      </Tooltip>

      <Tooltip title={<span className={classes.toolTip}>Square</span>} placement='right' arrow>
        <Button size='small'
          onClick={() => onClick('SQUARE')}
          className={currentTool === 'SQUARE' ? classes.activeButton : classes.button}
        >
          <span className="fas fa-vector-square"></span>
        </Button>
      </Tooltip>

      <Tooltip title={<span className={classes.toolTip}>Erase</span>} placement='right' arrow>
        <Button size='small'
          onClick={() => onClick('ERASE')}
          className={currentTool === 'ERASE' ? classes.activeButton : classes.button}
        >
          <span className="fas fa-eraser"></span>
        </Button>
      </Tooltip>

      <Tooltip title={<span className={classes.toolTip}>Text</span>} placement='right' arrow>
        <Button size='small'
          onClick={() => onClick('TEXT')}
          className={currentTool === 'TEXT' ? classes.activeButton : classes.button}
        >
          <span className="fas fa-font"></span>
        </Button>
      </Tooltip>

      <Tooltip title={<span className={classes.toolTip}>Measure</span>} placement='right' arrow>
        <Button size='small'
          onClick={() => onClick('MEASURE')}
          className={currentTool === 'MEASURE' ? classes.activeButton : classes.button}
        >
          <span className="fas fa-ruler"></span>
        </Button>
      </Tooltip>

    </div>
  );
}

export default ToolBar;