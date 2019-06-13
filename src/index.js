import { useReducer, useRef, useCallback, useEffect, useMemo } from 'react';

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

export default function useCanvasScrubber({
  playerId = 'anni-player',
  fps = DEFAULT_FPS,
  frames = [],
}) {
  const sortedFrames = useMemo(() => frames.sort(sortFramesAscending), [
    frames,
  ]);
  const images = useRef(null);
  const currentFrame = useRef(getPlayerInitialFrameIndex(playerId));
  const nextTickRAF = useRef();
  const canvasRef = useRef(null);
  const [state, setState] = useReducer(reducer, {
    isPlaying: false,
    htmlImageElements: [],
  });

  const { isPlaying } = state;

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
      const loadedImages = await Promise.all(
        sortedFrames.map(f => preloadImagePromise(f)),
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
          currentFrame.current =
            frameIndex === frames.length - 1 ? 0 : frameIndex + 1;

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

  return {
    ...state,
    canvasRef,
    togglePlay,
    sortedFrames,
  };
}
