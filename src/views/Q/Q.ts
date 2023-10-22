import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';

export default function getQContent(): m.ClosureComponent {
  const gameEnv = { clicks: 5, clickMax: 10 };
  return () => ({ view });

  function view() {
    return m('form', [
      m('', {
        style: 'width: 150px',
      }, [
        m('button', {
          type: 'button',
          style: 'padding: 0.75rem 0.5rem; display: block; width: 100%;',
          onclick: () => {
            gameEnv.clicks = gameEnv.clickMax > gameEnv.clicks
              ? gameEnv.clicks += 1
              : gameEnv.clicks;
          },
        }, 'Click me'),
        m('meter.meter', {
          style: 'width: calc(100% - 0.5rem); margin: 0 0.25rem; position: relative; bottom: 3.5rem',
          value: gameEnv.clicks,
          low: gameEnv.clickMax * 0.70,
          optimum: gameEnv.clickMax * 0.10,
          high: gameEnv.clickMax * 0.80,
          max: gameEnv.clickMax,
        }),
      ]),
    ]);
  }
}
