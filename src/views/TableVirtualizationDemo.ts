import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import getIcon from './FriconixIcon.js';
import getListVirtualizer from './helpers/IntersectListener.js';

interface WithReturnPath {
  returnPath: string;
}

const startLowerCaseAOffset = 97;
const alphabetList = Array.from(new Array(26)).map(
  (_, index) => String.fromCharCode(startLowerCaseAOffset + index),
);
const largeCountList = Array.from(new Array(1000)).map(
  (_, index) => index.toString(),
);

export default function getTableVirtualizationDemo({
  returnPath,
}: WithReturnPath): m.ClosureComponent {
  const listVirtualizer = getListVirtualizer({
    elementContents: alphabetList, rootMargin: '0px', onTriggerRedraw: m.redraw,
  });
  const largeCountListVirtualizer = getListVirtualizer({
    elementContents: largeCountList, rootMargin: '0px', onTriggerRedraw: m.redraw,
  });

  return () => ({ view });

  function view() {
    return m('.mgn-t-0-5.mgn-l-2-0.mgn-r-2-0.mgn-b-3-0.pad-t-0-5.sur-bg-2', [
      m(m.route.Link, {
        href: returnPath,
        selector: 'a.dsp-flex.flx-a-c.link.sur-fg-3-2.pad-l-1-0',
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
          listVirtualizer.isInitialized()
            ? m('.hgt-7-0.box-s-s.box-c-100.box-w-1.oflo-hx-ay.sur-bg-1', {
              oncreate: (vnode: m.VnodeDOM) => listVirtualizer.setObserver(vnode.dom),
              onremove: listVirtualizer.cleanUpObserver,
            }, listVirtualizer.getViewableList().map(
              (content) => m('.wid-16-0.typo-s-ctr', {
                oncreate: (vnode: m.VnodeDOM) => listVirtualizer
                  .getObserver()?.observe(vnode.dom),
                onremove: (vnode: m.VnodeDOM) => listVirtualizer
                  .getObserver()?.unobserve(vnode.dom),
              }, content),
            ))
            : m('.hgt-7-0.box-s-s.box-c-100.box-w-1.oflo-hx-ay.sur-bg-1', [
              m('.slider.wid-16-0.typo-s-ctr', {
                style: listVirtualizer.getSliderStyle(),
              }, listVirtualizer.getViewableList().map(
                (content) => m('', {
                  oncreate: (vnode: m.VnodeDOM) => listVirtualizer
                    .getObserver()?.observe(vnode.dom),
                  onremove: (vnode: m.VnodeDOM) => listVirtualizer
                    .getObserver()?.unobserve(vnode.dom),
                  style: listVirtualizer.getElementStyle(),
                }, content),
              )),
            ]),
        ]),
      ]),
      m('.pad-1-0', [
        m('p', 'List virtualization is a way to reduce off-screen elements drawn by the browser.  The lesser the elements the browser has to take care of, the more resources it will have to support the more important portions of the page.'),
        m('p', 'In the vanilla list of letters to the left, the browser has to draw an element for each letter, a to z. At any one time, all of these 26 letters are present in that section and some parts, around six or seven letters, of it will be shown when the user scrolls the list.'),
        m('p', 'Although the vanilla and virtualized lists look identical, the virtualized list on the right has 11 elements available at any one time.  The set of elements shown changes depending on where the user scrolls.  This method eliminates more than 50% of the elements that the browser needs to keep.'),
        m('hr.sur-fg-100'),
        m('.typo-s-h2', 'The technical nitty-gritty'),
        m('p', 'We can think of the list virtualizer as a bi-directional sliding window with the input as the scroll amount of the user and the output as a subset of available data.  All the data is present and available at the time but not rendered.  This sliding window differentiates what subset gets rendered to the browser.'),
        m('p', '(WIP)'),
        m('.virtualized-table.mgn-l-2-0.mgn-r-2-0.mgn-b-2-0', [
          m('.mgn-b-0-5', '1000 entry list'),
          largeCountListVirtualizer.isInitialized()
            ? m('.hgt-7-0.box-s-s.box-c-100.box-w-1.oflo-hx-ay.sur-bg-1', {
              oncreate: (vnode: m.VnodeDOM) => largeCountListVirtualizer.setObserver(vnode.dom),
              onremove: largeCountListVirtualizer.cleanUpObserver,
            }, largeCountListVirtualizer.getViewableList().map(
              (content) => m('.wid-16-0.typo-s-ctr', {
                oncreate: (vnode: m.VnodeDOM) => largeCountListVirtualizer
                  .getObserver()?.observe(vnode.dom),
                onremove: (vnode: m.VnodeDOM) => largeCountListVirtualizer
                  .getObserver()?.unobserve(vnode.dom),
              }, content),
            ))
            : m('.hgt-7-0.box-s-s.box-c-100.box-w-1.oflo-hx-ay.sur-bg-1', [
              m('.slider.wid-16-0.typo-s-ctr', {
                style: largeCountListVirtualizer.getSliderStyle(),
              }, largeCountListVirtualizer.getViewableList().map(
                (content) => m('', {
                  oncreate: (vnode: m.VnodeDOM) => largeCountListVirtualizer
                    .getObserver()?.observe(vnode.dom),
                  onremove: (vnode: m.VnodeDOM) => largeCountListVirtualizer
                    .getObserver()?.unobserve(vnode.dom),
                  style: largeCountListVirtualizer.getElementStyle(),
                }, content),
              )),
            ]),
        ]),
      ]),
    ]);
  }
}
