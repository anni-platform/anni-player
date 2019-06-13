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
  maxWidth: '100%',
};

function CanvasContainer({ children }) {
  return <div style={{ position: 'relative', maxWidth: 800 }}>{children}</div>;
}

CanvasContainer.propTypes = {
  children: PropTypes.node,
};

const buttonStyle = {
  padding: 16,
  background: 'limegreen',
  fontSize: 24,
};

function Player({ frames, playerId }) {
  const { canvasRef, togglePlay, isPlaying } = useCanvasScrubber({
    frames,
    playerId,
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

Player.propTypes = {
  frames: PropTypes.arrayOf(PropTypes.string),
  playerId: PropTypes.string,
};

function DemoA(props) {
  return <Player {...props} />;
}

function DemoB(props) {
  return <Player {...props} />;
}

function App() {
  return (
    <div>
      <nav>
        <Link to="/">home</Link>&nbsp;
        <Link to="magic">Magic</Link>
      </nav>
      <Router basepath={process.env.BASE_PATH || '/'}>
        <DemoA path="/" frames={groundWorkFrames} playerId="groundwork" />
        <DemoB path="magic" frames={magicFrames} playerId="magic" />
      </Router>
    </div>
  );
}

ReactDOM.render(<App />, document.querySelector('#root'));
