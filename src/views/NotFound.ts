import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import getIcon from './FriconixIcon.js';

export interface WithHomePath {
  homePath: string;
}

export default function getNotFound(): m.Component<WithHomePath> {
  return { view };
}

function view({ attrs: { homePath } }: m.Vnode<WithHomePath>) {
  return m('.mgn-t-0-5.mgn-l-2-0.mgn-r-2-0.mgn-b-3-0.sur-bg-2.pad-1-0', [
    m('.dsp-flex.flx-a-c.typo-s-h1', [
      m('i.fi-tnlxxl-warning-solid.dsp-flex', [
        m(getIcon(), { iconName: 'warning-solid', optionsMask: 'tnlxxl' }),
      ]),
      m('.box-ctrl.mgn-l-1-0', '404: Page Not Found'),
    ]),
    m('hr.sur-fg-100'),
    m('.typo-sub.mgn-b-2-0.pad-t-0-5', [
      m('span', 'The page requested cannot be found.  Double check if there is a typo or you can '),
      m(m.route.Link, {
        href: homePath,
        selector: 'span.link.sur-fg-3-2',
      }, 'return home'),
      m('span', '.'),
    ]),
  ]);
}
