import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import getIcon from './FriconixIcon.js';

const observerRootSelector = '.observed-root';

interface WithReturnPath {
  returnPath: string;
}

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
const rootSelector = `.hgt-7-0.box-s-s.box-c-100.box-w-1.oflo-hx-ay.sur-bg-1${observerRootSelector}`;

const initialEntrySize = 0;
let viewport: Viewport = { offset: 0, size: 6, entrySize: initialEntrySize };
export default function getTableVirtualizationDemo({
  returnPath,
}: WithReturnPath): m.ClosureComponent {
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
    return m('.mgn-t-0-5.mgn-l-2-0.mgn-r-2-0.mgn-b-3-0.pad-t-0-5.sur-bg-2', [
      m(m.route.Link, {
        href: returnPath,
        selector: '.dsp-flex.flx-a-c.link.sur-fg-3.pad-l-1-0',
      }, [
        m('i.fi-xnslxl-arrow-simple.dsp-flex', [
          m(getIcon(), { iconName: 'arrow-simple', optionsMask: 'xnslxl' }),
        ]),
        m('.typo-s-h5', 'back to list'),
      ]),
      m('.dsp-flex.flx-a-c.flx-j-c.flx-rap', [
        m('.simple-table.mgn-l-2-0.mgn-r-2-0.mgn-b-2-0', [
          m('.mgn-b-0-5', 'Vanilla list of letters'),
          m('.hgt-7-0.box-s-s.box-c-100.box-w-1.oflo-hx-ay.sur-bg-1', alphabetList.map(
            (content) => m('.wid-16-0.typo-s-ctr', content),
          )),
        ]),
        m('.virtualized-table.mgn-l-2-0.mgn-r-2-0.mgn-b-2-0', [
          m('.mgn-b-0-5', 'Virtual list of letters'),
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
      m('.pad-1-0', [
        m('p', 'List virtualization is a way to reduce off-screen elements drawn by the browser.  The lesser the elements the browser has to take care of, the more resources it will have to support the more important portions of the page.'),
        m('p', 'In the vanilla list of letters to the left, the browser has to draw an element for each letter, a to z. At any one time, all of these 26 letters are present in that section and some parts, around six or seven letters, of it will be shown when the user scrolls the list.'),
        m('p', 'Although the vanilla and virtualized lists look identical, the virtualized list on the right has 11 elements available at any one time.  The set of elements shown changes depending on where the user scrolls.  This method eliminates more that 50% of the elements that the browser needs to keep.'),
        m('hr.sur-fg-100'),
        m('.typo-s-h2', 'The technical nitty-gritty'),
        m('p', 'We can think of the list virtualizer as a bi-directional sliding window with the input as the scroll amount of the user and the output as a subset of available data.  All the data is present and available at the time but not rendered.  This sliding window differentiates what subset gets rendered to the browser.'),
        m('p', '(WIP)'),
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
