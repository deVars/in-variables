import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';

const observerRootSelector = '.observed-root';

interface Viewport {
  /** initially height, but can be width when we add the support */
  entrySize: number;
  size: number;
  offset: number;
}

const startLowerCaseAOffset = 97;
const alphabetList = Array.from(new Array(26)).map(
  (_, index) => String.fromCharCode(startLowerCaseAOffset + index),
);
const rootSelector = `.hgt-7-0.box-s-s.box-w-1.oflo-hx-ay.mgn-l-4-0${observerRootSelector}`;

const initialEntrySize = 0;
let viewport: Viewport = { offset: 0, size: 6, entrySize: initialEntrySize };
export default function getTableVirtualizationDemo(): m.ClosureComponent {
  let observer: IntersectionObserver;

  return () => ({ oncreate, view });

  function oncreate() {
    const observerOptions = {
      root: document.querySelector(observerRootSelector),
      rootMargin: '0px',
      threshold: 0.25,
    };

    observer = new IntersectionObserver(callback, observerOptions);
  }

  function getViewableList(list: string[]) {
    const outOfViewElementCount = 2;
    const { offset, size } = viewport;

    /** needs 2x of buffers, so we have a safe buffer
     *  + immediate buffer from top or bottom
     */
    const viewableWidth = offset + size + (2 * outOfViewElementCount);

    return list.slice(offset, viewableWidth);
  }

  function view() {
    const sliderHeightpx = Math.ceil(viewport.entrySize * alphabetList.length);
    const styleSliderHeight = `height: ${sliderHeightpx}px;`;
    const virtualElementHook = {
      oncreate: (vnode: m.VnodeDOM) => observer.observe(vnode.dom),
      onremove: (vnode: m.VnodeDOM) => observer.unobserve(vnode.dom),
    };
    const virtualElementHookWithStyle = {
      ...virtualElementHook,
      style: `top: ${viewport.entrySize * viewport.offset}px`,
    };

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
              (content) => m('.wid-16-0.typo-s-ctr',
                virtualElementHook,
                content),
            ))
            : m(rootSelector, [
              m('.slider.wid-16-0.typo-s-ctr', { style: styleSliderHeight }, viewableList.map(
                (content) => m('.pos-rel',
                  virtualElementHookWithStyle,
                  content),
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
    return null;
  }

  const intersectIndex = getIntersectIndex(entries);
  const newOffset = getOffsetFromIntersectIndex(intersectIndex);

  if (newOffset === viewport.offset) {
    return null;
  }

  viewport.offset = newOffset;
  return m.redraw();
}

function getViewportParams(entries: IntersectionObserverEntry[]): Viewport {
  let isViewableEntryFound = false;
  let intersectIndex = 0;

  if (entries.length === 0) {
    return { offset: 0, size: 0, entrySize: 0 };
  }

  const [ entrySample ] = entries;
  const viewableCount = Math.ceil(
    (entrySample.rootBounds?.height ?? 0)
    / entrySample.boundingClientRect.height,
  );
  const entrySize = entrySample.boundingClientRect.height;

  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      if (!isViewableEntryFound) {
        isViewableEntryFound = true;
      }
      return;
    }
    if (isViewableEntryFound) {
      return;
    }
    intersectIndex += 1;
  });
  const offset = getOffsetFromIntersectIndex(intersectIndex);
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
  const distanceToTop = entryTop - parentTop - bottomDistance;
  return Math.floor(distanceToTop / entryHeight);
}

function getIsInTopRange(entry: IntersectionObserverEntry) {
  const { top: rootTop } = entry.rootBounds ?? defaultRootBounds;
  const { top: entryTop, height: entryHeight } = entry.boundingClientRect;
  const rootTopBoundary = rootTop + entryHeight;
  return entryTop < rootTopBoundary;
}

const indexBufferCount = 2;
function getOffsetFromIntersectIndex(index: number) {
  return Math.max(index - indexBufferCount, 0);
}
