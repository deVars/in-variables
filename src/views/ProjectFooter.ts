import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import { type RouteEntry } from '../route.js';

interface Footer {
  routeMap: Record<string, RouteEntry>;
}

export default function getProjectFooter({ routeMap }: Footer): m.ClosureComponent {
  return (_vnode: m.Vnode) => ({ view });

  function view({ children: _ }: m.Vnode) {
    return m('.sur-bg-5.sur-fg-1.typo-std', [
      m('.pad-t-1-0.pad-b-3-0', [
        m('.wid-max.mgn-cntr', [
          m('section.typo-s-h1', [
            m('.typo-s-h1.pad-b-0-5', 'Experiment Q'),
            m('.typo-s-h3.pad-b-0-5.pad-l-1-0', 'cool things to try on HTML5'),
            m('.typo-s-h2.pad-b-0-5', 'Links'),
            m('.typo-s-h3.pad-b-0-5.pad-l-1-0', 'in・Variables'),
            m('.typo-s-h3.pad-b-0-5.pad-l-1-0', 'Contact Email'),
            m('.typo-s-h3.pad-b-0-5.pad-l-1-0', `${routeMap.experimental001.path}`),
          ]),
        ]),
      ]),
    ]);
  }
}
