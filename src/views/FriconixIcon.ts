import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';

export interface FriconixIcon {
  iconName: string;
  optionsMask: string;
}

export default function getIcon(): m.Component<FriconixIcon> {
  return { view };
}

const role = 'img';
const xmnls = 'http://www.w3.org/2000/svg';
const svgDimension = '1000mm';
const viewBox = '0 0 1000 1000';
const fill = 'currentColor';

function view({ attrs: { iconName, optionsMask } }: m.Vnode<FriconixIcon>) {
  return m(`svg.vert-aln-mid${getSizeClass(optionsMask)}${getTransformClass(optionsMask)}`, {
    xmnls, viewBox, role,
    width: svgDimension,
    height: svgDimension,
  }, [
    m('path', {
      fill,
      d: [ getShapeOverlay(optionsMask), window.paths[iconName] ].join(' '),
      transform: getTransformAttrib(optionsMask),
    }),
  ]);
}

function getSizeClass(mask: string) {
  const size = mask.charAt(5);
  if (![ 't', 's', 'n', 'l', 'x', 'h' ].includes(size)) {
    return '.svg-s-n';
  }
  return `.svg-s-${size}`;
}

function getTransformClass(mask: string) {
  const isAnimationCounterClockwise = mask.charAt(3) === 'l';
  const classMap: Record<string, string> = {
    s: '.fi-spin',
    p: '.fi-pulse',
  };

  const maybeClassName = classMap[mask.charAt(4)];
  if (!maybeClassName) {
    return '.fi-padding';
  }

  const className = isAnimationCounterClockwise
    ? `${maybeClassName}-ccw`
    : maybeClassName;
  return `.fi-padding${className}`;
}

function getShapeOverlay(mask: string) {
  const shapeKey = mask.substring(0, 3);
  return window.shapes[shapeKey];
}

function getTransformAttrib(mask: string) {
  const effectTransformMap: Record<string, string> = {
    h: 'translate(1000,0) scale(-1,1)',
    v: 'translate(0,1000) scale(1,-1)',
  };
  const effectTransform = effectTransformMap[mask.charAt(4)] ?? null;

  const rotateTransformMap: Record<string, string> = {
    r: 'rotate(90, 500, 500)',
    d: 'rotate(180, 500, 500)',
    l: 'rotate(270, 500, 500)',
  };
  const rotateTransform = rotateTransformMap[mask.charAt(3)] ?? null;

  return [ effectTransform, rotateTransform ].filter(Boolean).join(' ');
}
