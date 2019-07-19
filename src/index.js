import { useReducer, useRef, useCallback, useEffect, useMemo } from 'react';
import useKey from 'react-use/lib/useKey';
import useVideo from 'react-use/lib/useVideo';

module.exports.useVideo = useVideo;

const DEFAULT_FPS = 24;

const preloadImagePromise = src =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ [src]: img });
    img.onerror = e => reject(e);
    img.src = src;
  });

const reducer = (state, action) => ({
  ...state,
  ...action,
});

export function extractFrameIndexFromPath(frameUrl) {
  try {
    const framePath = frameUrl.split('/').pop();
    const [fileName] = framePath.split('.');
    const [frameIndex] = /\d+/.exec(fileName);
    if (!frameIndex) {
      throw Error();
    }
    return parseInt(frameIndex, 10);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`"${frameUrl}" does not contain a valid frame index`);
  }
}

function sortFramesAscending(frameA, frameB) {
  const indexA = extractFrameIndexFromPath(frameA);
  const indexB = extractFrameIndexFromPath(frameB);
  return indexA - indexB;
}

function getPlayerInitialFrameIndex(key) {
  try {
    return parseInt(sessionStorage.getItem(key)) || 0;
  } catch (e) {
    return 0;
  }
}

export function useCanvasScrubber({
  playerId = 'anni-player',
  audioSrc,
  audioStart = 0,
  fps = DEFAULT_FPS,
  frames = [],
}) {
  const sortedFrames = useMemo(() => frames.sort(sortFramesAscending), [
    frames,
  ]);
  const images = useRef(null);
  const audio = useRef(null);
  const currentFrame = useRef(getPlayerInitialFrameIndex(playerId));
  const nextTickRAF = useRef();
  const canvasRef = useRef(null);
  const [state, setState] = useReducer(reducer, {
    isPlaying: false,
    isMuted: false,
    volume: 0.75,
    htmlImageElements: [],
    loadingStatus: {
      totalLoaded: 0,
      total: frames.length,
    },
  });

  if (!audio.current) {
    const audioEl = document.createElement('audio');
    audioEl.src = audioSrc;
    audioEl.currentTime = audioStart;
    audio.current = audioEl;
  }

  const { isPlaying } = state;

  const setAudioVolume = useCallback(
    (volume = 0.75) => {
      if (!audio.current) return;
      setState({ volume });
      audio.current.volume = volume;
    },
    [audio],
  );

  const toggleMuteAudio = useCallback(() => {
    if (!audio.current) return;
    const nextMuted = !audio.current.muted;
    setState({ isMuted: nextMuted });
    audio.current.muted = nextMuted;
  }, [audio]);

  const drawFrame = useCallback(
    index => {
      if (!sortedFrames[index] || !canvasRef.current) return;

      const frameImage = images.current[sortedFrames[index]];
      const { width, height } = frameImage;
      const canvas = canvasRef.current;
      canvas.width = width;
      canvas.height = height;
      canvas
        .getContext('2d')
        .drawImage(frameImage, 0, 0, width, height, 0, 0, width, height);
    },
    [sortedFrames, canvasRef, images],
  );

  useEffect(() => {
    if (!canvasRef.current) return;
    async function load() {
      setState({
        loadingStatus: {
          total: sortedFrames.length,
          totalLoaded: 0,
        },
      });

      const loadedImages = await Promise.all(
        sortedFrames.map(async f => {
          const loadedImage = await preloadImagePromise(f);
          setState({
            loadingStatus: {
              ...state.loadingStatus,
              totalLoaded: (state.loadingStatus.totalLoaded += 1),
            },
          });
          return new Promise(resolve => {
            resolve(loadedImage);
          });
        }),
      );

      if (!loadedImages || loadedImages.length === 0) return;
      images.current = loadedImages.reduce((acc, i) => ({ ...acc, ...i }), {});
      const currentFrameImage = images.current[sortedFrames[0]];
      if (!currentFrameImage) return;
      const { width, height } = currentFrameImage;
      setState({
        frameSize: {
          width,
          height,
        },
      });
      drawFrame(currentFrame.current);
    }
    load();
  }, [frames, canvasRef, sortedFrames, drawFrame]);

  useEffect(() => {
    if (!audio.current) return;

    async function playAudio() {
      await audio.current.play();
    }
    async function pause() {
      await audio.current.pause();
    }

    if (isPlaying && audio.current.paused) {
      playAudio();
    } else if (!isPlaying && !audio.current.paused) {
      pause();
    }

    return function cleanupAudio() {
      pause();
    };
  }, [audio, isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      let then = performance.now();
      let now;
      let delta;

      const nextTick = () => {
        if (!isPlaying) return;

        now = performance.now();
        delta = now - then;
        const interval = Math.round(1000 / fps);

        if (delta > interval) {
          // Mutate next frame
          const frameIndex = currentFrame.current;
          then = now;
          const nextFrame =
            frameIndex === frames.length - 1 ? 0 : frameIndex + 1;
          if (nextFrame === 0) {
            audio.current.currentTime = audioStart;
          }
          currentFrame.current = nextFrame;

          // Draw Canvas
          drawFrame(currentFrame.current);
        }

        nextTickRAF.current = requestAnimationFrame(nextTick);
      };

      // START LOOP
      nextTick();
    } else if (nextTickRAF.current) {
      cancelAnimationFrame(nextTickRAF.current);
    }

    return () => {
      if (nextTickRAF.current) {
        cancelAnimationFrame(nextTickRAF.current);
      }
      sessionStorage.setItem(playerId, currentFrame.current);
    };
  }, [fps, frames, images, drawFrame, playerId, isPlaying]);

  function togglePlay() {
    const nextIsPlaying =
      images.current && Object.keys(images.current).length > 0 && !isPlaying;
    setState({ isPlaying: nextIsPlaying });
  }

  function seek(index) {
    setState({ isPlaying: false });
    currentFrame.current = index;
    // Draw Canvas
    drawFrame(index);
  }

  function seekNext() {
    const frameIndex = currentFrame.current;
    const nextIndex = frameIndex === frames.length - 1 ? 0 : frameIndex + 1;

    seek(nextIndex);
  }

  function seekPrev() {
    const frameIndex = currentFrame.current;
    const nextIndex = frameIndex === 0 ? frames.length - 1 : frameIndex - 1;

    seek(nextIndex);
  }

  useKey(e => e.code === 'Space', togglePlay);
  useKey(e => e.code === 'ArrowRight', seekNext);
  useKey(e => e.code === 'ArrowLeft', seekPrev);

  return {
    ...state,
    canvasRef,
    togglePlay,
    sortedFrames,
    toggleMuteAudio,
    setAudioVolume,
  };
}
