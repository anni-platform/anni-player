import 'babel-polyfill';
import ReactDOM from 'react-dom';
import React from 'react';
import PropTypes from 'prop-types';
import { Router, Link } from '@reach/router';
import { useCanvasScrubber, useVideo } from '.';
import groundWorkFramesMap from './media/image-sequence/the-groundwork/*.jpg';
import magicFramesMap from './media/image-sequence/magic/*.jpg';
import tropicalWebm from './media/WEBM/Tropical.webm';
import tropicalMp4 from './media/MP4/Tropical.mp4';
import gymnopedie from './media/gymnopedie.mp3';

const groundWorkFrames = Object.values(groundWorkFramesMap);
const magicFrames = Object.values(magicFramesMap);

const canvasStyle = {
  maxWidth: '100%',
};

function PlayerContainer({ children }) {
  return <div style={{ position: 'relative', maxWidth: 800 }}>{children}</div>;
}

PlayerContainer.propTypes = {
  children: PropTypes.node,
};

const buttonStyle = {
  padding: 16,
  background: 'limegreen',
  fontSize: 24,
};

function Player({ audioSrc, audioStartSeconds = 0, frames, playerId }) {
  const { audio, canvasRef, togglePlay, isPlaying } = useCanvasScrubber({
    audioSrc,
    audioStartSeconds,
    frames,
    playerId,
  });
  return (
    <PlayerContainer>
      <div style={{ padding: '8px 0 8px' }}>
        <button onClick={togglePlay} style={buttonStyle}>
          <span className={`fa ${isPlaying ? 'fa-pause' : 'fa-play'}`} />
        </button>
      </div>
      <canvas style={canvasStyle} ref={canvasRef} />
      {audioSrc && audio.element}
      <pre>{JSON.stringify(audio.state, null, 2)}</pre>
    </PlayerContainer>
  );
}

Player.propTypes = {
  audioSrc: PropTypes.string,
  audioStartSeconds: PropTypes.number,
  frames: PropTypes.arrayOf(PropTypes.string),
  playerId: PropTypes.string,
};

function DemoA(props) {
  return <Player {...props} />;
}

function DemoB(props) {
  return <Player {...props} />;
}

function VideoDemo({ videoSource }) {
  const [video, state, controls, ref] = useVideo(
    <video controls ref={ref} style={{ maxWidth: '100%' }}>
      {videoSource.map(({ src, type }) => (
        <source key={src} src={src} type={type} />
      ))}
    </video>,
  );
  return (
    <PlayerContainer>
      {video}
      <pre>{JSON.stringify(state, null, 2)}</pre>
      <button onClick={controls.pause}>Pause</button>
      <button onClick={controls.play}>Play</button>
      <br />
      <button onClick={controls.mute}>Mute</button>
      <button onClick={controls.unmute}>Un-mute</button>
      <br />
      <button onClick={() => controls.volume(0.1)}>Volume: 10%</button>
      <button onClick={() => controls.volume(0.5)}>Volume: 50%</button>
      <button onClick={() => controls.volume(1)}>Volume: 100%</button>
      <br />
      <button onClick={() => controls.seek(state.time - 5)}>-5 sec</button>
      <button onClick={() => controls.seek(state.time + 5)}>+5 sec</button>
    </PlayerContainer>
  );
}

function App() {
  return (
    <div>
      <nav>
        <Link to="/">home</Link>&nbsp;
        <Link to="magic">Magic</Link>
        <Link to="video">Video</Link>
      </nav>
      <Router basepath={process.env.BASE_PATH || '/'}>
        <DemoA
          path="/"
          frames={groundWorkFrames}
          playerId="groundwork"
          audioSrc={gymnopedie}
          audioStartSeconds={12}
        />
        <DemoB path="magic" frames={magicFrames} playerId="magic" />
        <VideoDemo
          path="video"
          playerId="video"
          videoSource={[
            { src: tropicalWebm, type: 'video/webm' },
            { src: tropicalMp4, type: 'video/mp4' },
          ]}
        />
      </Router>
    </div>
  );
}

ReactDOM.render(<App />, document.querySelector('#root'));
