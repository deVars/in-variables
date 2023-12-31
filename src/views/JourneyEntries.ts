import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import type { JourneyEntry } from '../models/Journey.js';
import type { StrictAttributeModel } from '../models/AttributeModel.js';
import { getInitialJourneyEntries, tbdJourneyId } from '../models/Journey.js';
import getIcon from './FriconixIcon.js';
import type { IdHandler, WithOnClick } from './helpers/ComponentHandler.js';
import Loading from './Loading.js';

export interface JourneyView {
  entries: StrictAttributeModel<JourneyEntry[]>;
}

export default function getJourneyView({
  entries,
}: JourneyView): m.ClosureComponent<WithOnClick> {
  return () => ({ oninit, view });

  function oninit() {
    getInitialJourneyEntries().then((newEntries) => {
      entries.set(newEntries);
    });
  }

  function view({ attrs: { onclick } }: m.Vnode<WithOnClick>) {
    if (entries.value.length === 0) {
      return m(Loading());
    }

    const mappedEntries = entries.value.map(toVnode(onclick));

    return m('.mgn-t-0-5.mgn-l-2-0.mgn-r-2-0.mgn-b-3-0',
      [
        m('.link-card-b-101-102.box-l-s-s.box-w-8.pad-l-0-5.mgn-b-2-0', {
          onclick: () => onclick(tbdJourneyId),
        }, [
          m('.link-card.sur-bg-2.pad-t-1-0.pad-l-1-0.pad-r-1-0.pad-b-0-5', [
            m('.role.typo-s-h2', '「 ...to be decided 」'),
          ]),
          m('.link-card-detail-hint.sur-fg-3.typo-s-h4.typo-sub.typo-s-ctr', [
            m(getIcon(), { iconName: 'double-chevron-wide', optionsMask: 'xnldxl' }),
          ]),
        ]),
      ].concat(mappedEntries));
  }
}

function toVnode(onclick: IdHandler) {
  return (
    { role, employer, location,
      empStartMonth, empStartYear, empEndMonth, empEndYear }: JourneyEntry,
    index: number,
  ) => (
    m('.link-card-b-101-102.box-l-s-s.box-w-8.pad-l-0-5.mgn-b-2-0', {
      onclick: () => onclick(index),
    }, [
      m('.link-card.sur-bg-2.pad-t-1-0.pad-l-1-0.pad-r-1-0.pad-b-0-5', [
        m('.role.typo-s-h2', role),
        m('.company.typo-s-h4.dsp-flex', [
          m('i.fi-xnsxxm-building.dsp-flex', [
            m(getIcon(), { iconName: 'building', optionsMask: 'xnsxxm' }),
          ]),
          m('.mgn-l-0-5', employer),
        ]),
        m('.location.typo-s-h4.typo-sub.dsp-flex', [
          m('i.fi-xnlxxm-map-marker-solid.dsp-flex', [
            m(getIcon(), { iconName: 'map-marker-solid', optionsMask: 'xnlxxm' }),
          ]),
          m('.mgn-l-0-5', location),
        ]),
        m('.employ-dates.typo-s-h4.typo-sub.dsp-flex.pad-b-0-5', [
          m('i.fi-xnlxxm-calendar.dsp-flex', [
            m(getIcon(), { iconName: 'calendar', optionsMask: 'xnlxxm' }),
          ]),
          m('.mgn-l-0-5', `${empStartYear}/ ${empStartMonth} – ${empEndYear}/ ${empEndMonth}`),
        ]),
      ]),
      m('.link-card-detail-hint.sur-fg-3.typo-s-h4.typo-sub.typo-s-ctr', [
        m(getIcon(), { iconName: 'double-chevron-wide', optionsMask: 'xnldxl' }),
      ]),
    ])
  );
}
