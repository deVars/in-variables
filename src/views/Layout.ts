import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import { routeUnlistedActionLabel, type RouteEntry } from '../route.js';
import getIcon from './FriconixIcon.js';

export default function getLayout(): m.Component<{route: Record<string, RouteEntry>}> {
  return { view };
}

function view({
  attrs: { route }, children,
}: m.Vnode<{route: Record<string, RouteEntry>}>) {
  return m('.sur-bg.sur-fg.sur-typo', [
    m('.header.sur-3', [
      m('.scl-suprt', [
        m('.main.sur-fg-1.dsp-flex.flx-s-b', [
          m('section.title.typo-s-h1', 'in・Variables'),
          m('section.controls', [
            m('.box-ctrl', [
              m('a.contact-email.lnk-crsr.sur-typo-mono.act-typo.typo-s-h5.typo-s-bold.act-fg',
                { href: 'mailto:ross.is.hire.able036@passinbox.com' },
                [
                  m('i.fi-xnlxxm-close-envelope.typo-s-h1.dsp-flex', [
                    m(getIcon(), { iconName: 'close-envelope', optionsMask: 'xnlxxm' }),
                  ]),
                ]),
            ]),
          ]),
        ]),
        m('.header-sub.sur-typo-sub.typo-s-h4',
          "Roseller's personal page of sorts"),
        m('.tabs', Object.values(route)
          .filter(({ label }) => label !== routeUnlistedActionLabel)
          .map(
            ({ label, path }) => m(m.route.Link, {
              href: path,
              selector: `.lnk-crsr.act-typo.typo-s-h5.typo-s-bold.rout-pnl${getActiveRouteClass(path)}`,
            }, label),
          )),
      ]),
    ]),
    m('.content', [
      m('.scl-suprt', [
        m('section.box-1', children),
      ]),
    ]),
  ]);
}

function getActiveRouteClass(path: string) {
  return m.route.get() !== path
    ? '.act-fg'
    : '.rout-activ.sel-fg';
}
