import { useReducer, useRef, useEffect, useMemo } from 'react';

const DEFAULT_FPS = 24;

const preloadImagePromise = src =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = e => reject(e);
    img.src = src;
  });

const reducer = (state, action) => ({
  ...state,
  ...action
});

function extractFrameIndexFromPath(framePath) {
  try {
    const [fileName] = framePath.split('.');
    const result = /([^._-])*\d/.exec(fileName);
    const [frameIndex] = result;
    if (!frameIndex) {
      throw Error();
    }
    return frameIndex;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`${framePath} does not contain a valid frame index`);
  }
}

function sortFramesAscending(frameA, frameB) {
  const indexA = extractFrameIndexFromPath(frameA);
  const indexB = extractFrameIndexFromPath(frameB);
  return indexA - indexB;
}

export default function useCanvasScrubber({ fps = DEFAULT_FPS, frames = [] }) {
  const sortedFrames = useMemo(() => frames.sort(sortFramesAscending), [
    frames
  ]);
  const currentFrame = useRef(null);
  const nextTickRAF = useRef();
  const canvasRef = useRef(null);
  const [state, setState] = useReducer(reducer, {
    currentFrame: 0,
    isPlaying: false,
    htmlImageElements: []
  });

  const { isPlaying, htmlImageElements } = state;

  function drawFrame(img) {
    if (!img || !canvasRef.current) return;
    canvasRef.current.width = img.width;
    canvasRef.current.height = img.height;
    canvasRef.current
      .getContext('2d')
      .drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
  }

  useEffect(() => {
    if (!canvasRef) return;
    async function load() {
      const htmlImages = await Promise.all(
        sortedFrames.map(f => preloadImagePromise(f))
      );

      if (!htmlImages || htmlImages.length === 0) return;

      const { width, height } = htmlImages[0];
      setState({
        htmlImageElements: htmlImages,
        frameSize: {
          width,
          height
        }
      });
      drawFrame(htmlImages[0]);
    }
    load();
  }, [frames, canvasRef, sortedFrames]);

  useEffect(() => {
    if (isPlaying) {
      if (!state.isPlaying) return;

      let then = performance.now();
      let now;
      let delta;

      const nextTick = () => {
        if (!state.isPlaying) return;

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
          drawFrame(htmlImageElements[currentFrame.current]);
        }

        nextTickRAF.current = requestAnimationFrame(nextTick);
      };

      // START LOOP
      nextTick();
    } else if (nextTickRAF.current) {
      cancelAnimationFrame(nextTickRAF.current);
    }
  }, [fps, frames.length, htmlImageElements, isPlaying, state.isPlaying]);

  function togglePlay() {
    const nextIsPlaying = htmlImageElements.length > 0 && !isPlaying;
    setState({ isPlaying: nextIsPlaying });
  }

  return {
    ...state,
    canvasRef,
    togglePlay
  };
}
