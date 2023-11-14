import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import { type RouteEntry } from '../route.js';

interface Footer {
  label: string;
  subLabel: string;
  routeMap: Record<string, RouteEntry>;
}

export default function getProjectFooter({
  label, routeMap, subLabel,
}: Footer): m.ClosureComponent {
  return (_vnode: m.Vnode) => ({ view });

  function view({ children: _ }: m.Vnode) {
    return m('.sur-bg-5.sur-fg-1.typo-std', [
      m('.pad-t-1-0.pad-b-3-0', [
        m('.wid-max.mgn-cntr', [
          m('section.typo-s-h1', [
            m('.typo-s-h1.pad-b-0-5', label),
            m('.typo-s-h3.pad-b-0-5.pad-l-1-0', subLabel),
            m('.typo-s-h2.pad-b-0-5', 'Links'),
            m('.typo-s-h3.pad-b-0-5.pad-l-1-0', [
              m(m.route.Link, {
                href: routeMap.about.path,
                selector: 'a.dsp-flex.flx-a-c.link.sur-fg-2-3',
              }, [
                m('span', 'in・Variables'),
              ]),
            ]),
            m('.typo-s-h3.pad-b-0-5.pad-l-1-0', [
              m('a.link.sur-fg-2-3',
                { href: 'mailto:ross.is.hire.able036@passinbox.com' },
                [
                  m('span', 'Contact'),
                ]),
            ]),
          ]),
        ]),
      ]),
    ]);
  }
}
