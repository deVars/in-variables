import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';

const observerRootSelector = '.observed-root';
const observerTargetSelector = '.observed-target';

interface Viewport {
  /** initially height, but can be width when we add the support */
  entrySize: number;
  size: number;
  offset: number;
}
const initialEntrySize = 0;
let viewport: Viewport = { offset: 0, size: 6, entrySize: initialEntrySize };
export default function getTableVirtualizationDemo(): m.ClosureComponent {
  let observer: IntersectionObserver;

  return () => ({ oncreate, onupdate, view });

  function oncreate() {
    const observerOptions = {
      root: document.querySelector(observerRootSelector),
      rootMargin: '0px',
      threshold: 0.25,
    };

    observer = new IntersectionObserver(callback, observerOptions);
  }

  function onupdate() {
    console.log('update trigger');
  }

  function getViewableList(list: string[]) {
    const outOfViewElementCount = 2;
    const { offset, size } = viewport;
    const viewableWidth = offset + size + (2 * outOfViewElementCount);
    // console.log('new viewable list', viewport.offset, list.slice(offset, viewableWidth));
    /** needs 2x of this, so we have safe buffer
     *  + immediate buffer from top or bottom
     */

    return list.slice(offset, viewableWidth);
  }

  function view() {
    const startLowerCaseAOffset = 97;
    const alphabetList = Array.from(new Array(26)).map(
      (_, index) => String.fromCharCode(startLowerCaseAOffset + index),
    );
    const rootSelector = `.hgt-7-0.box-s-s.box-w-1.oflo-hx-ay.mgn-l-4-0${observerRootSelector}`;
    const sliderHeightpx = Math.ceil(viewport.entrySize * alphabetList.length);
    const padHeightpx = viewport.entrySize * viewport.offset;
    const styleSliderHeight = `height: ${sliderHeightpx - padHeightpx}px; padding-top: ${padHeightpx}px`;

    const viewableList = getViewableList(alphabetList);
    return m('.test', [
      m('.dsp-flex.flx-a-c.flx-j-c', [
        m('.simple-table', [
          m('.hgt-7-0.box-s-s.box-w-1.oflo-hx-ay', alphabetList.map(
            (content) => m('.wid-16-0.typo-s-ctr', content),
          )),
        ]),
        m('.virtualized-table', [
          viewport.entrySize === 0
            ? m(rootSelector, viewableList.map(
              (content) => m(`.wid-16-0.typo-s-ctr${observerTargetSelector}`, {
                oncreate: (vnode) => observer.observe(vnode.dom),
                onremove: (vnode) => observer.unobserve(vnode.dom),
              }, content),
            ))
            : m(rootSelector, [
              m('.slider', { style: styleSliderHeight }, viewableList.map(
                (content) => m(`.wid-16-0.typo-s-ctr${observerTargetSelector}`, {
                  id: content,
                  oncreate: (vnode) => observer.observe(vnode.dom),
                  onremove: (vnode) => observer.unobserve(vnode.dom),
                }, content),
              )),
            ]),
        ]),
      ]),
      m('.sur-bg-2', [
        m('', `text text text ${alphabetList.join(' ')}`),
      ]),
    ]);
  }
}
const defaultRootBounds = { top: 0, height: 0 };
function callback(entries: IntersectionObserverEntry[], _observer: IntersectionObserver) {
  const isInitialChange = viewport.entrySize === initialEntrySize;
  const isRenderUpdate = entries.length > viewport.size;
  if (isInitialChange) {
    viewport = getViewportParams(entries);
    return m.redraw();
  }

  if (isRenderUpdate) {
    // console.log('render update. nothing to do');
    return null;
  }

  const intersectIndex = getIntersectIndex(entries);
  const newOffset = Math.max(intersectIndex - 2, 0);

  if (newOffset === viewport.offset) {
    return null;
  }

  viewport.offset = newOffset;
  // console.log('new offset', newOffset);
  return m.redraw();
}

function getViewportParams(entries: IntersectionObserverEntry[]): Viewport {
  let isViewableEntryFound = false;
  // let uboundbuffercount = 0;
  let lboundbuffercount = 0;

  if (entries.length === 0) {
    return { offset: 0, size: 0, entrySize: 0 };
  }

  const [ entrySample ] = entries;
  const viewableCount = Math.ceil(
    (entrySample.rootBounds?.height ?? 0)
    / entrySample.boundingClientRect.height,
  );
  const entrySize = entrySample.boundingClientRect.height;

  /** TODO: only lbound is enough.  we just need to figure out the start offset
   *  from the scroll state.
   */
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      if (!isViewableEntryFound) {
        isViewableEntryFound = true;
      }
      return;
    }
    if (isViewableEntryFound) {
      // uboundbuffercount += 1;
      return;
    }
    lboundbuffercount += 1;
  });
  const offset = Math.max(lboundbuffercount - 2, 0);
  return { offset, size: viewableCount, entrySize };
}

function getIntersectIndex(entries: IntersectionObserverEntry[]): number {
  const [ sampleEntry ] = entries;
  const { parentElement } = sampleEntry.target;
  if (!parentElement) {
    return 0;
  }

  const [ entry ] = getIsInTopRange(sampleEntry)
    ? entries
    : [ ...entries ].reverse();

  const { top: parentTop } = parentElement.getBoundingClientRect();
  const { top: rootTop, height: rootHeight } = entry.rootBounds ?? defaultRootBounds;
  const { top: entryTop, height: entryHeight } = entry.boundingClientRect;
  const rootTopBoundary = rootTop + entryHeight;
  const isInTopRange = entryTop < rootTopBoundary;
  const bottomDistance = isInTopRange ? 0 : rootHeight;
  // const topOnViewCorrection = isInTopRange && entry.isIntersecting ? viewport.entrySize : 0;
  // console.log('e, p, b', entryTop, parentTop, bottomDistance, isInTopRange);
  const distanceToTop = entryTop - parentTop - bottomDistance;
  return Math.floor(distanceToTop / entryHeight);
}

function getIsInTopRange(entry: IntersectionObserverEntry) {
  const { top: rootTop } = entry.rootBounds ?? defaultRootBounds;
  const { top: entryTop, height: entryHeight } = entry.boundingClientRect;
  const rootTopBoundary = rootTop + entryHeight;
  return entryTop < rootTopBoundary;
}
