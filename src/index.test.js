/* eslint-disable no-console */
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

function spyConsole() {
  // https://github.com/facebook/react/issues/7047
  let spy = {};

  beforeAll(() => {
    spy.console = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    spy.console.mockRestore();
  });

  return spy;
}

describe('useCanvasScrubber', () => {
  describe('no frames', () => {
    it('knows when its not ready', () => {
      const { getByText } = render(<TestPlayer frames={[]} />);

      getByText(loading);
    });
  });

  describe('helper functions', () => {
    const spy = spyConsole();

    describe('extractFrameIndexFromPath', () => {
      it('pulls the correct integer from the frame url provided', () => {
        expect(
          extractFrameIndexFromPath('https://anni.com/frame5.123.jpg'),
        ).toEqual(5);
        expect(
          extractFrameIndexFromPath('https://anni.com/frame-foo_5.123.jpg'),
        ).toEqual(5);
        expect(extractFrameIndexFromPath('https://anni.com/5.jpg')).toEqual(5);
      });

      it('throws an error if an index cannot be determined from the file url', () => {
        extractFrameIndexFromPath('octopus');
        expect(console.error).toHaveBeenCalled();
        expect(spy.console.mock.calls[0][0]).toContain(
          '"octopus" does not contain a valid frame index',
        );
      });
    });
  });
});
