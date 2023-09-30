import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import type { JourneyEntry } from '../models/Journey.js';
import type { StrictAttributeModel } from '../models/AttributeModel.js';
import { tbdJourneyId } from '../models/Journey.js';
import getIcon from './FriconixIcon.js';

export interface JourneyView {
  journeyEntries: StrictAttributeModel<JourneyEntry[]>;
  onclick(index: number): void;
}

export default function getJourneyView(): m.Component<JourneyView> {
  return { view };
}

function view({ attrs: { journeyEntries, onclick } }: m.Vnode<JourneyView>) {
  if (journeyEntries.value.length === 0) {
    return m('.loading');
  }

  const entries = journeyEntries.value.map(
    ({ role, employer, location,
      empStartMonth, empStartYear, empEndMonth, empEndYear }, index) => (
      m('.journal-entry.sur-2.pad-1-0.mgn-b-0-5', {
        onclick: () => onclick(index),
      }, [
        m('.role.typo-s-h2', role),
        m('.company.typo-s-h4.dsp-flex', [
          m('i.fi-xnsxxm-building.dsp-flex', [
            m(getIcon(), { iconName: 'building', optionsMask: 'xnsxxm' }),
          ]),
          m('.mgn-l-0-5', employer),
        ]),
        m('.location.typo-s-h4.sur-typo-sub.dsp-flex', [
          m('i.fi-xnlxxm-map-marker-solid.dsp-flex', [
            m(getIcon(), { iconName: 'map-marker-solid', optionsMask: 'xnlxxm' }),
          ]),
          m('.mgn-l-0-5', location),
        ]),
        m('.employ-dates.typo-s-h4.sur-typo-sub.dsp-flex', [
          m('i.fi-xnlxxm-calendar.dsp-flex', [
            m(getIcon(), { iconName: 'calendar', optionsMask: 'xnlxxm' }),
          ]),
          m('.mgn-l-0-5', `${empStartYear}/ ${empStartMonth} – ${empEndYear}/ ${empEndMonth}`),
        ]),
      ])
    ),
  );

  return m('.box-work',
    [
      m('.journal-entry.sur-2.pad-1-0.mgn-b-0-5', [
        m('.role.typo-s-h2', {
          onclick: () => onclick(tbdJourneyId),
        }, '「 ...to be decided 」'),
      ]),
    ].concat(entries));
}
