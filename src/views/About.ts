import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';

export default function getAboutView(): m.Component {
  return { view };
}

function view() {
  const assetsRoot = '../../assets/images';
  const aboutLabels = [
    { label: 'I like thought experiments,', isItalic: false },
    { label: '"what-if"s,', isItalic: true },
    { label: 'mental maps,', isItalic: false },
    { label: 'iteration, and natural progression.', isItalic: false },
  ];

  return m('.box-about.box-sur-1.typo-s-h1',
    aboutLabels.map(
      ({ label, isItalic }, index) => ([
        m('img.scl-suprt-img.about-img', {
          src: `${assetsRoot}/about-${index}.png`,
          loading: 'lazy',
        }),
        m(`p.typo-s-ctr${!isItalic ? '' : '.typo-s-ital'}`, label),
      ]),
    )
      .flat()
      .concat([
        m('img.scl-suprt-img.about-img', {
          src: '../../assets/images/about-4.png',
          loading: 'lazy',
        }),
      ]));
}
