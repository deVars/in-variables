import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import type { JourneyEntry } from '../models/Journey.js';
import type { StrictAttributeModel } from '../models/AttributeModel.js';

export interface JourneyView {
  journeyEntries: StrictAttributeModel<JourneyEntry[]>;
}

export default function getJourneyView(): m.Component<JourneyView> {
  return { view };
}

function view({ attrs: { journeyEntries } }: m.Vnode<JourneyView>) {
  if (journeyEntries.value.length === 0) {
    return m('.loading');
  }

  const entries = journeyEntries.value.map(
    ({ role, employer, location,
      empStartMonth, empStartYear, empEndMonth, empEndYear }) => (
      m('.journal-entry.sur-2.pad-1-0.mgn-b-0-5', [
        m('.role.typo-s-h2', role),
        m('.company.typo-s-h4', employer),
        m('.location.typo-s-h4.sur-typo-sub', location),
        m('.employ-dates.typo-s-h4.sur-typo-sub',
          `${empStartYear}/ ${empStartMonth} – ${empEndYear}/ ${empEndMonth}`),
      ])
    ),
  );

  return m('.box-work',
    [
      m('.journal-entry.sur-2.pad-1-0.mgn-b-0-5', [
        m('.role.typo-s-h2', '「 ...to be decided 」'),
      ]),
    ].concat(entries));
}
