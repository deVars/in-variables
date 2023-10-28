import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import getIcon from './FriconixIcon.js';

export default function Loading(): m.ClosureComponent {
  return () => ({ view });
}

function view() {
  return m('.mgn-t-4-0.mgn-b-3-0.typo-s-ctr', [
    m('i.fi-xnlxxl-circle-notch-wide.mgn-cntr', [
      m(getIcon, {
        iconName: 'circle-notch-wide',
        optionsMask: 'xnlxsh',
      }),
    ]),
  ]);
}
