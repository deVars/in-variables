import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import type { RouteEntry } from '../route.js';

export default function getLayout(): m.Component<{route: Record<string, RouteEntry>}> {
  return { view };
}

function view({
  attrs, children,
}: m.Vnode<{route: Record<string, RouteEntry>}>): m.Children {
  const { route } = attrs;

  return m('.sur-bg.sur-fg.sur-typo', [
    m('.header.sur-2', [
      m('.scl-suprt', [
        m('.header-main.sur-fg-1', [
          m('.title.typo-s-h1', 'in・Variables'),
          m('.title-sub.sur-typo-sub.typo-s-h4',
            "Roseller's personal page of sorts"),
        ]),
        m('.header-contact', [
          m('a.contact-email.lnk-crsr.sur-typo-mono.act-typo.typo-s-h5.typo-s-bold.act-fg',
            { href: 'mailto:ross.is.hire.able036@passinbox.com' },
            '@ email'),
        ]),
        m('.tabs', Object.values(route).map(
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
