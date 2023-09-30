import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import getIcon from './FriconixIcon.js';

export default function getAttributionView(): m.Component {
  return { view };
}

function view() {
  return m('.box-work', [
    m('.sur-2.pad-1-0', [
      m('.typo-s-h2', 'Special Thanks'),
      m('hr.sur-fg-100'),
      m('ul', [
        m('li.mgn-b-0-5', [
          m('', 'Mary Frell'),
          m('.sur-typo-sub.typo-s-h4',
            'for endless support, understanding, and inspiration — through thick and thin'),
        ]),
        m('li.mgn-b-0-5', [
          m('', 'Friconix'),
          m('.sur-typo-sub.typo-s-h4',
            'for the large collection of vector icons'),
          m('a.sur-typo-sub.typo-s-h4.act-fg.lnk-crsr.dsp-flex', {
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
