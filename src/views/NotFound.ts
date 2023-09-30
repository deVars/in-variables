import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import getIcon from './FriconixIcon.js';

export interface WithHomePath {
  homePath: string;
}

export default function getNotFound(): m.Component<WithHomePath> {
  return { view };
}

function view({ attrs: { homePath } }: m.Vnode<WithHomePath>) {
  return m('.box-work.sur-2.pad-1-0', [
    m('.dsp-flex.flx-a-c.typo-s-h1', [
      m('i.fi-tnlxxl-warning-solid.dsp-flex', [
        m(getIcon(), { iconName: 'warning-solid', optionsMask: 'tnlxxl' }),
      ]),
      m('.box-ctrl', '404: Page Not Found'),
    ]),
    m('hr.sur-fg-100'),
    m('.sur-typo-sub', [
      m('span', 'The page requested cannot be found.  Double check if there is a typo or you can '),
      m(m.route.Link, {
        href: homePath,
        selector: 'span.lnk-crsr.act-fg',
      }, 'return home'),
      m('span', '.'),
    ]),
  ]);
}
