import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import getIcon from './FriconixIcon.js';

export default function getAttributionView(): m.Component {
  return { view };
}

function view() {
  return m('.mgn-t-0-5.mgn-l-2-0.mgn-r-2-0.mgn-b-3-0', [
    m('.sur-bg-2.pad-1-0', [
      m('.typo-s-h2', 'Special Thanks'),
      m('hr.sur-fg-100'),
      m('ul', [
        m('li.mgn-b-0-5', [
          m('', 'Mary Frell'),
          m('.typo-sub.typo-s-h4',
            'for endless support, understanding, and inspiration — through thick and thin'),
        ]),
        m('li.mgn-b-0-5', [
          m('', 'Friconix'),
          m('.typo-sub.typo-s-h4',
            'for the large collection of vector icons'),
          m('a.typo-sub.typo-s-h4.sur-fg-3.link.dsp-flex', {
            href: 'https://friconix.com/',
            target: '_blank',
          }, [
            m('', 'https://friconix.com/'),
            m('i.fi-xnlxxm-external-link.typo-s-h4.dsp-flex.mgn-l-0-5', [
              m(getIcon(), { iconName: 'external-link', optionsMask: 'xnlxxm' }),
            ]),
          ]),
        ]),
      ]),
    ]),
  ]);
}
