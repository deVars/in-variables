interface ListVirtualizerInit<T> {
  elementContents: readonly T[];
  rootMargin: string;
  onTriggerRedraw(): void;
}

enum ResolveType {
  none, intersect, scrollend,
}

interface SliderWindowMetric {
  elementIndexOffset: number
  entrySize: number;
  lastResolveType: ResolveType;
  viewableElementCount: number;
}

export interface ListVirtualizer<T> {
  getElementStyle(): string;
  getObserver(): IntersectionObserver | null;
  getSliderStyle(): string;
  getViewableList(): readonly T[];
  isInitialized(): boolean;
  setObserver(e: Element | null): void;
  cleanUpObserver(): void;
}

/** entry size can be height of width depending on orientation */
const initialSlideMetric: SliderWindowMetric = {
  elementIndexOffset: 0,
  entrySize: 0,
  lastResolveType: ResolveType.none,
  viewableElementCount: 1,
};
const indexBufferCount = 2;
export default function getListVirtualizer<T>({
  elementContents, rootMargin, onTriggerRedraw,
}: ListVirtualizerInit<T>): ListVirtualizer<T> {
  const cleanUpController = new AbortController();
  let observer: IntersectionObserver | null = null;
  let slideMetric = initialSlideMetric;

  return {
    cleanUpObserver, getElementStyle, getObserver, getSliderStyle,
    getViewableList, isInitialized, setObserver,
  };

  function callback(entries: IntersectionObserverEntry[], _observer: IntersectionObserver) {
    const isInitialChange = slideMetric === initialSlideMetric;
    const isRenderUpdate = entries.length > slideMetric.viewableElementCount;
    if (isInitialChange) {
      slideMetric = getInitialSizes(entries);
      return onTriggerRedraw();
    }

    if (isRenderUpdate) {
      return null;
    }

    const intersectIndex = getIntersectIndex(entries);
    if (intersectIndex < 0) {
      return null;
    }
    const newOffset = getOffsetFromIntersectIndex(intersectIndex);

    if (newOffset === slideMetric.elementIndexOffset) {
      return null;
    }
    const offsetDifference = Math.abs(newOffset - slideMetric.elementIndexOffset);
    if (slideMetric.lastResolveType === ResolveType.scrollend
      && offsetDifference <= indexBufferCount) {
      return null;
    }

    slideMetric.elementIndexOffset = newOffset;
    slideMetric.lastResolveType = ResolveType.intersect;
    return onTriggerRedraw();
  }

  function cleanUpObserver() {
    if (!observer) {
      return;
    }
    observer.disconnect();
    cleanUpController.abort();
    observer = null;
  }

  function getElementStyle() {
    const { elementIndexOffset, entrySize } = slideMetric;
    return `top: ${entrySize * elementIndexOffset}px; position: relative;`;
  }

  function getObserver() {
    return observer;
  }

  function getSliderStyle() {
    const { entrySize } = slideMetric;
    const sliderHeightpx = Math.ceil(entrySize * elementContents.length);
    return `height: ${sliderHeightpx}px;`;
  }

  function getViewableList() {
    const { elementIndexOffset, viewableElementCount } = slideMetric;
    const viewableWidth = viewableElementCount + (2 * indexBufferCount);
    return elementContents.slice(elementIndexOffset, elementIndexOffset + viewableWidth);
  }

  function isInitialized() {
    return observer === null && slideMetric === initialSlideMetric;
  }

  function setObserver(maybeRoot: Element | null) {
    const observerOptions = { root: maybeRoot, rootMargin, threshold: 0.25 };
    observer = new IntersectionObserver(callback, observerOptions);
    const root = !maybeRoot ? window : maybeRoot;
    root.addEventListener('scrollend', updateIndexOffset, {
      signal: cleanUpController.signal,
    });
  }

  function updateIndexOffset(event: Event) {
    if (!event.target) {
      return;
    }
    const targetEl = event.target as HTMLElement;
    const { entrySize, elementIndexOffset } = slideMetric;
    const intersectIndex = Math.floor(targetEl.scrollTop / entrySize);
    const indexOffset = getOffsetFromIntersectIndex(intersectIndex);
    if (indexOffset === elementIndexOffset) {
      return;
    }

    slideMetric.elementIndexOffset = indexOffset;
    slideMetric.lastResolveType = ResolveType.scrollend;
    onTriggerRedraw();
  }
}

interface IntersectIndex {
  intersectIndex: number;
  isViewableEntryFound: boolean;
}

const initialIntersectIndex: IntersectIndex = { intersectIndex: 0, isViewableEntryFound: false };
function getInitialSizes(entries: IntersectionObserverEntry[]): SliderWindowMetric {
  if (entries.length === 0) {
    return { entrySize: 0, viewableElementCount: 0,
      elementIndexOffset: 0, lastResolveType: ResolveType.none };
  }

  const [ entrySample ] = entries;
  const { height: entrySize } = entrySample.boundingClientRect;
  const entryRootBoundHeight = entrySample.rootBounds?.height ?? window.innerHeight;
  const viewableElementCount = Math.ceil(entryRootBoundHeight / entrySize);

  const { intersectIndex } = entries.reduce<IntersectIndex>(
    intersectIndexReducer,
    initialIntersectIndex,
  );

  const elementIndexOffset = getOffsetFromIntersectIndex(intersectIndex);
  return { elementIndexOffset, viewableElementCount,
    entrySize, lastResolveType: ResolveType.none };
}

function intersectIndexReducer(
  { intersectIndex, isViewableEntryFound }: IntersectIndex,
  { isIntersecting }: IntersectionObserverEntry,
): IntersectIndex {
  if (isViewableEntryFound) {
    return { intersectIndex, isViewableEntryFound };
  }

  if (isIntersecting) {
    if (!isViewableEntryFound) {
      return { intersectIndex, isViewableEntryFound: true };
    }
    return { intersectIndex, isViewableEntryFound };
  }

  return { intersectIndex: intersectIndex + 1, isViewableEntryFound };
}

const defaultRootBounds = { top: window.screenTop, height: window.innerHeight };
function getIntersectIndex(entries: IntersectionObserverEntry[]): number {
  const [ sampleEntry ] = entries;
  const { parentElement } = sampleEntry.target;
  if (!parentElement) {
    return 0;
  }

  const newEntries = [ ...entries ]
    .filter((filterEntry) => !filterEntry.isIntersecting)
    .reverse();

  if (newEntries.length === 0) {
    return -1;
  }
  const [ entry ] = newEntries;

  const { top: parentTop } = parentElement.getBoundingClientRect();
  const { top: rootTop, height: rootHeight } = entry.rootBounds ?? defaultRootBounds;
  const { top: entryTop, height: entryHeight } = entry.boundingClientRect;
  const rootTopBoundary = rootTop + entryHeight;
  const isInTopRange = entryTop < rootTopBoundary;
  const bottomDistance = isInTopRange ? 0 : rootHeight;
  const distanceToTop = entryTop - parentTop - bottomDistance;
  return Math.floor(distanceToTop / entryHeight);
}

function getOffsetFromIntersectIndex(index: number) {
  return Math.max(index - indexBufferCount, 0);
}
