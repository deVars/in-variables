import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import getLimitedCountButton, { RateBound } from './LimitedCountButton.js';

const LimitedCountBtn = getLimitedCountButton();

export default function getQContent(): m.ClosureComponent {
  const gameEnv = { clicks: 5, clickMax: 10 };
  return () => ({ view });

  function view() {
    return m('form', [
      m(LimitedCountBtn, {
        selector: '.pad-b-0-5',
        label: 'Click Me to add',
        count: gameEnv.clicks,
        maxCount: gameEnv.clickMax,
        rateBound: RateBound.highBound,
        onclick(): void | Promise<void> {
          gameEnv.clicks = gameEnv.clickMax < gameEnv.clicks
            ? gameEnv.clicks
            : gameEnv.clicks + 1;
        },
      }),
      m(LimitedCountBtn, {
        selector: '.pad-b-0-5',
        label: 'Click Me to sub',
        count: gameEnv.clicks,
        maxCount: gameEnv.clickMax,
        rateBound: RateBound.highBound,
        onclick(): void | Promise<void> {
          gameEnv.clicks = gameEnv.clicks <= 0
            ? gameEnv.clicks
            : gameEnv.clicks - 1;
        },
      }),
    ]);
  }
}
