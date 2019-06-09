import React from 'react';
import { render } from '@testing-library/react';
import useCanvasScrubber, { extractFrameIndexFromPath } from '.';

const loading = 'Loading...';

function TestPlayer(props) {
  const { isReady } = useCanvasScrubber(props);
  if (isReady) {
    return <canvas />;
  }

  return loading;
}

describe('useCanvasScrubber', () => {
  describe('no frames', () => {
    it('knows when its not ready', () => {
      const { getByText } = render(<TestPlayer frames={[]} />);

      getByText(loading);
    });
  });

  describe('helper functions', () => {
    describe('extractFrameIndexFromPath', () => {
      it('pulls the correct integer from the frame url provided', () => {
        expect(
          extractFrameIndexFromPath('https://anni.com/frame5.123.jpg'),
        ).toEqual(5);
      });
    });
  });
});
