import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import { routeUnlistedActionLabel, type RouteEntry } from '../route.js';
import getIcon from './FriconixIcon.js';

export default function getLayout(): m.Component<{route: Record<string, RouteEntry>}> {
  return { view };
}

function view({
  attrs: { route }, children,
}: m.Vnode<{route: Record<string, RouteEntry>}>) {
  const tabSelectorBase = '.link.dsp-i-b.pad-0-5.mgn-0.mgn-l-0-25.mgn-r-0-25.box-w-2.box-b-s-s.box-c-t';
  return m('.sur-bg-1.sur-fg-1.typo-std', [
    m('.pad-t-0-5.sur-bg-3', [
      m('.wid-max.mgn-cntr', [
        m('.sur-fg-10.dsp-flex.flx-s-b', [
          m('section.typo-s-h1', 'in・Variables'),
          m('section.mgn-0.mgn-l-4-0.mgn-r-2-0.box-w-1-0.box-l-s-s.box-c-100', [
            m('.mgn-l-2-0', [
              m('a.link.typo-mono.typo-s-h5.typo-s-bold.sur-fg-3',
                { href: 'mailto:ross.is.hire.able036@passinbox.com' },
                [
                  m('i.fi-xnlxxm-close-envelope.typo-s-h1.dsp-flex', [
                    m(getIcon(), { iconName: 'close-envelope', optionsMask: 'xnlxxm' }),
                  ]),
                ]),
            ]),
          ]),
        ]),
        m('.header-sub.typo-sub.typo-s-h4',
          "Roseller's personal page of sorts"),
        m('.tabs.typo-s-h5.typo-s-bold', Object.values(route)
          .filter(({ label }) => label !== routeUnlistedActionLabel)
          .map(
            ({ label, path }) => m(m.route.Link, {
              href: path,
              selector: `${tabSelectorBase}${getActiveRouteClass(path)}`,
            }, label),
          )),
      ]),
    ]),
    m('.content', [
      m('.wid-max.mgn-cntr', [
        m('section.pad-t-0-25.box-w-1-0.box-t-s-s.box-c-100', children),
      ]),
    ]),
  ]);
}

function getActiveRouteClass(path: string) {
  return m.route.get() !== path
    ? '.sur-fg-3'
    : '.sur-fg-2.box-w-2.box-b-s-s.box-c-2';
}
