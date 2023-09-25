import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';

export default function getAboutView(): m.Component {
  return { view };
}

function view() {
  return m('.box-about.box-sur-1', [
    m('p', [
      m('span', 'I like thought experiments, '),
      m('span.typo-s-ital', '"what-ifs", '),
      m('span', 'mental maps, iteration and natural progression.'),
    ]),
  ]);
}
