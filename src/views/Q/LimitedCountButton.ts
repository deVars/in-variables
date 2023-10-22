import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';

export interface LimitedCountButtonAttr {
  label: string;
  count: number;
  maxCount: number;
  onclick(): void | Promise<void>;
  rateBound: RateBound;
  selector?: string;
}

export enum RateBound {
  lowBound, highBound,
}

const lowBoundRateWatermark = { low: 0.1, high: 0.3, optimum: 0.7 };
const highBoundRateWatermark = { low: 0.7, high: 0.8, optimum: 0.1 };

export default function getLimitedCountButton(): m.ClosureComponent<LimitedCountButtonAttr> {
  return () => ({ view });

  function view({ attrs }: m.Vnode<LimitedCountButtonAttr>) {
    const { label, count, maxCount, onclick, rateBound, selector: maybeSelector } = attrs;
    const selector = maybeSelector ?? '';
    const watermark = rateBound === RateBound.highBound
      ? highBoundRateWatermark
      : lowBoundRateWatermark;
    return m(selector, [
      m('.pos-rel', [
        m('button.dsp-b.sur-bg-100-h101.box-s-n.box-rad-0-25.pad-t-0-75.pad-b-0-75.pad-l-0-5.pad-r-0-5.wid-fl', {
          type: 'button',
          onclick,
        }, label),
        m('meter.meter.meter--limited-count-internal', {
          value: count,
          low: maxCount * watermark.low,
          high: maxCount * watermark.high,
          optimum: maxCount * watermark.optimum,
          max: maxCount,
        }),
      ]),
    ]);
  }
}
