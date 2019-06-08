import 'babel-polyfill';
import ReactDOM from 'react-dom';
import React from 'react';
import PropTypes from 'prop-types';
import { Router, Link } from '@reach/router';
import useCanvasScrubber from '.';
import groundWorkFramesMap from 'image-sequence/the-groundwork/*.jpg';
import magicFramesMap from 'image-sequence/magic/*.jpg';

const groundWorkFrames = Object.values(groundWorkFramesMap);
const magicFrames = Object.values(magicFramesMap);

const canvasStyle = {
  maxWidth: '100%'
};

function CanvasContainer({ children }) {
  return <div style={{ position: 'relative', maxWidth: 800 }}>{children}</div>;
}

CanvasContainer.propTypes = {
  children: PropTypes.node
};

const buttonStyle = {
  padding: 16,
  background: 'limegreen',
  fontSize: 24
};

function Player({ frames }) {
  const { canvasRef, togglePlay, isPlaying } = useCanvasScrubber({
    frames
  });
  return (
    <CanvasContainer>
      <div style={{ padding: '8px 0 8px' }}>
        <button onClick={togglePlay} style={buttonStyle}>
          <span className={`fa ${isPlaying ? 'fa-pause' : 'fa-play'}`} />
        </button>
      </div>
      <canvas style={canvasStyle} ref={canvasRef} />
    </CanvasContainer>
  );
}

function DemoA({ frames }) {
  return <Player frames={frames} />;
}

function DemoB({ frames }) {
  return <Player frames={frames} />;
}

Player.propTypes = {
  frames: PropTypes.arrayOf(PropTypes.string)
};

function App() {
  return (
    <div>
      <nav>
        <Link to="/">home</Link>&nbsp;
        <Link to="/magic">Magic</Link>
      </nav>
      <Router>
        <DemoA path="/" frames={groundWorkFrames} />
        <DemoB path="/magic" frames={magicFrames} />
      </Router>
    </div>
  );
}

ReactDOM.render(<App />, document.querySelector('#root'));
