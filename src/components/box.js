import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import { setCursorPosition } from '../actions/cursorActions';
import { setAnchor, updateEdges, updateWalls, setCurShape } from '../actions/sheetActions';
import { useSelector, useDispatch } from 'react-redux';
import { getState } from '../index';

const useStyles = makeStyles({
  root: {
    padding: 0,
    height: 22,
    width: 22,
  }
});

function Box({ isPositionOutside, boxProps }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [positionOutside, setPositionOutside] = React.useState(isPositionOutside);
  const [isWall, setIsWall] = React.useState(boxProps.isWall);
  const isEdge = useSelector(state => state.sheet.data.edges[boxProps.row][boxProps.col]);
  const setWall = useSelector(state => state.sheet.data.walls[boxProps.row][boxProps.col]);
  const isAnchor = useSelector(state => state.sheet.data.anchors[boxProps.row][boxProps.col]);

  const getMouseDown = () => {
    return getState().cursor.mouseDown;
  }

  const getCurrentTool = () => {
    return getState().tool.current;
  }

  const getAnchor = () => {
    return getState().sheet.anchor;
  }

  // Returns an object with props:
  // edges = array of position objects representing each box that is part of the line
  // shape = object containing shape info
  const calcLine = (anchorPosition, cursorPosition) => {
    const scale = getState().sheet.scale;
    const edges = [];
    var shape = null;
    if (anchorPosition.x === cursorPosition.x && anchorPosition.y !== cursorPosition.y) {
      // Vertical line with length > 0
      const len = (Math.max(anchorPosition.y, cursorPosition.y) - Math.min(anchorPosition.y, cursorPosition.y) + 1) * scale;
      shape = {
        type: 'LINE',
        len
      }
      for (let i = Math.min(anchorPosition.y, cursorPosition.y) + 1; i < Math.max(anchorPosition.y, cursorPosition.y); i++) {
        edges.push({ x: anchorPosition.x, y: i });
      }
    } else if (anchorPosition.y === cursorPosition.y && anchorPosition.x !== cursorPosition.x) {
      // Horizontal line with length > 0
      shape = {
        type: 'LINE',
        len: Math.max(anchorPosition.x, cursorPosition.x) - Math.min(anchorPosition.x, cursorPosition.x)
      }
      for (let i = Math.min(anchorPosition.x, cursorPosition.x) + 1; i < Math.max(anchorPosition.x, cursorPosition.x); i++) {
        edges.push({ x: i, y: anchorPosition.y });
      }
    }
    return { edges, shape };
  }
  const calcLineWalls = (anchorPosition, cursorPosition) => {
    const edges = [];
    if (anchorPosition.x === cursorPosition.x && anchorPosition.y !== cursorPosition.y) {
      // Vertical line with length > 0
      for (let i = Math.min(anchorPosition.y, cursorPosition.y); i <= Math.max(anchorPosition.y, cursorPosition.y); i++) {
        edges.push({ x: anchorPosition.x, y: i });
      }
    } else if (anchorPosition.y === cursorPosition.y && anchorPosition.x !== cursorPosition.x) {
      // Horizontal line with length > 0
      for (let i = Math.min(anchorPosition.x, cursorPosition.x); i <= Math.max(anchorPosition.x, cursorPosition.x); i++) {
        edges.push({ x: i, y: anchorPosition.y });
      }
    }
    return edges;
  }

  const calcRect = (anchorPosition, cursorPosition) => {
    const scale = getState().sheet.scale;
    const edges = [];
    var shape = null;
    if (anchorPosition.x !== cursorPosition.x || anchorPosition.y !== cursorPosition.y) {
      // Anchor and cursor position different

      // Get shape info
      const width = (Math.max(anchorPosition.x, cursorPosition.x) - Math.min(anchorPosition.x, cursorPosition.x) + 1) * scale;
      const height = (Math.max(anchorPosition.y, cursorPosition.y) - Math.min(anchorPosition.y, cursorPosition.y) + 1) * scale;
      const area = (width - 2) * (height - 2);
      shape = {
        type: 'RECTANGLE',
        width,
        height,
        area: area >= 0 ? area : 0
      }

      // Get edges
      for (let i = Math.min(anchorPosition.x, cursorPosition.x); i <= Math.max(anchorPosition.x, cursorPosition.x); i++) {
        // changing x values, y constant
        const curPositionAnchor = { x: i, y: anchorPosition.y }
        const curPositionCursor = { x: i, y: cursorPosition.y }
        // check current box not anchor or cursor
        if (curPositionAnchor.x !== anchorPosition.x) {
          edges.push(curPositionAnchor);
        }
        if (curPositionCursor.x !== cursorPosition.x) {
          edges.push(curPositionCursor);
        }
      }
      for (let i = Math.min(anchorPosition.y, cursorPosition.y) + 1; i < Math.max(anchorPosition.y, cursorPosition.y); i++) {
        // changing y values, x constant
        edges.push({ x: anchorPosition.x, y: i });
        edges.push({ x: cursorPosition.x, y: i });
      }
    }
    return { edges, shape };
  }
  const calcRectWalls = (anchorPosition, cursorPosition) => {
    const walls = [];
    if (anchorPosition.x !== cursorPosition.x || anchorPosition.y !== cursorPosition.y) {
      // Anchor and cursor position different
      for (let i = Math.min(anchorPosition.x, cursorPosition.x); i <= Math.max(anchorPosition.x, cursorPosition.x); i++) {
        // changing x values, y constant
        walls.push({ x: i, y: anchorPosition.y });
        walls.push({ x: i, y: cursorPosition.y });
      }
      for (let i = Math.min(anchorPosition.y, cursorPosition.y) + 1; i < Math.max(anchorPosition.y, cursorPosition.y); i++) {
        // changing y values, x constant
        walls.push({ x: anchorPosition.x, y: i });
        walls.push({ x: cursorPosition.x, y: i });
      }
    }
    return walls;
  }

  React.useEffect(() => {
    if (setWall) {
      setIsWall(true);
    }
  }, [setWall])

  React.useEffect(() => {
    if (!isPositionOutside) {
      // Cursor is inside box
      const currentTool = getCurrentTool();
      const anchor = getAnchor();
      // Dispatch cursor position (add 1 to zero based index)
      dispatch(setCursorPosition({ x: boxProps.row + 1, y: boxProps.col + 1 }))
      if (anchor) {
        // Currently building a shape, must calculate edges
        if (currentTool === 'LINE') {
          const line = calcLine(anchor, { x: boxProps.row, y: boxProps.col });
          dispatch(updateEdges(line.edges));
          dispatch(setCurShape(line.shape));
        } else if (currentTool === 'RECTANGLE') {
          const rect = calcRect(anchor, { x: boxProps.row, y: boxProps.col });
          dispatch(updateEdges(rect.edges));
          dispatch(setCurShape(rect.shape));
        }
      }
      if (getMouseDown()) {
        if (currentTool === 'DRAW') {
          setIsWall(true);
        }
        if (currentTool === 'ERASE') {
          setIsWall(false);
        }
      }
    }
    setPositionOutside(isPositionOutside)
  }, [isPositionOutside, boxProps.row, boxProps.col, dispatch])

  const onMouseDown = () => {
    const currentTool = getCurrentTool();
    switch (currentTool) {
      case 'DRAW':
        setIsWall(true);
        break;
      case 'ERASE':
        setIsWall(false);
        break;
      case 'LINE':
        const anchor = getAnchor();
        if (!anchor) {
          dispatch(setAnchor({ x: boxProps.row, y: boxProps.col }))
        } else {
          dispatch(updateWalls(calcLineWalls(anchor, { x: boxProps.row, y: boxProps.col })))
          dispatch(setAnchor(null))
          dispatch(setCurShape(null))
        }
        break;
      case 'RECTANGLE':
        const anchorR = getAnchor();
        if (!anchorR) {
          dispatch(setAnchor({ x: boxProps.row, y: boxProps.col }))
        } else {
          dispatch(updateWalls(calcRectWalls(anchorR, { x: boxProps.row, y: boxProps.col })))
          dispatch(setAnchor(null))
          dispatch(setCurShape(null))
        }
        break;
      default:
        return
    }

  }

  return (
    <div className={classes.root} style={
      isWall ? {
        backgroundColor: '#000',
        borderRight: '1px solid #000',
        borderBottom: '1px solid #000',
      }
        :
        isAnchor ? {
          backgroundColor: '#a8b7c4',
          borderRight: '1px solid #a3b9cc',
          borderBottom: '1px solid #a3b9cc',
        }
          :
          isEdge ? {
            backgroundColor: '#dce4ea',
            borderRight: '1px solid #becddb',
            borderBottom: '1px solid #becddb',
          }
            :
            positionOutside ? {
              borderRight: '1px solid #becddb',
              borderBottom: '1px solid #becddb',
            }
              :
              {
                backgroundColor: '#a8b7c4',
                borderRight: '1px solid #becddb',
                borderBottom: '1px solid #becddb',
              }
    }
      onMouseDown={onMouseDown}
    >
    </div>
  );
}

export default Box;