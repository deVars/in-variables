import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';

export default function getAboutView(): m.Component {
  return { view };
}

function view() {
  return m('.box-about.box-sur-1.typo-s-h1', [
    m('img.scl-suprt-img.about-img', { src: '../../assets/images/about-1.png', loading: 'lazy' }),
    m('p.typo-s-ctr', 'I like thought experiments,'),
    m('img.scl-suprt-img.about-img', { src: '../../assets/images/about-2.png', loading: 'lazy' }),
    m('p.typo-s-ctr.typo-s-ital', '"what-ifs",'),
    m('img.scl-suprt-img.about-img', { src: '../../assets/images/about-3.png', loading: 'lazy' }),
    m('p.typo-s-ctr', 'mental maps,'),
    m('img.scl-suprt-img.about-img', { src: '../../assets/images/about-4.png', loading: 'lazy' }),
    m('p.typo-s-ctr', 'iteration and natural progression.'),
    m('img.scl-suprt-img.about-img', { src: '../../assets/images/about-5.png', loading: 'lazy' }),
  ]);
}
