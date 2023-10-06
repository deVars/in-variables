import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import type { JourneyEntry } from '../models/Journey.js';
import type { StrictAttributeModel } from '../models/AttributeModel.js';
import getNotFound, { type WithHomePath } from './NotFound.js';
import { getJourneyEntry, initialEntry, notFoundEntry, tbdEntry } from '../models/Journey.js';
import getIcon from './FriconixIcon.js';
import type { WithId } from '../models/helpers/WithId.js';
import Loading from './Loading.js';

export interface JourneyDetailView extends WithHomePath {
  listPath: string;
  entry: StrictAttributeModel<JourneyEntry>;
}

export default function getJourneyEntryView({
  entry, homePath, listPath,
}: JourneyDetailView): m.ClosureComponent<WithId> {
  return () => ({ oninit, view });

  async function oninit({ attrs: { id } }: m.Vnode<WithId>) {
    entry.set(initialEntry);
    return entry.set(await getJourneyEntry(id));
  }

  function view() {
    if (entry.value === initialEntry) {
      return m(Loading());
    }

    if (entry.value === notFoundEntry) {
      return m(getNotFound(), { homePath });
    }

    if (entry.value === tbdEntry) {
      return getTBDView(listPath);
    }

    const { role, employer, location,
      empStartMonth, empStartYear, empEndMonth, empEndYear } = entry.value;

    return m('.mgn-t-0-5.mgn-l-2-0.mgn-r-2-0.mgn-b-3-0',
      [
        m('.sur-bg-3.pad-1-0', [
          m('.role.typo-s-h1', role),
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
          m('.employ-dates.typo-s-h4.typo-sub.dsp-flex.mgn-b-0-5', [
            m('i.fi-xnlxxm-calendar.dsp-flex', [
              m(getIcon(), { iconName: 'calendar', optionsMask: 'xnlxxm' }),
            ]),
            m('.mgn-l-0-5', `${empStartYear}/ ${empStartMonth} – ${empEndYear}/ ${empEndMonth}`),
          ]),
          m(m.route.Link, {
            href: listPath,
            selector: '.dsp-flex.flx-a-c.link.sur-fg-3',
          }, [
            m('i.fi-xnslxl-arrow-simple.dsp-flex', [
              m(getIcon(), { iconName: 'arrow-simple', optionsMask: 'xnslxl' }),
            ]),
            m('.typo-s-h5', 'back to list'),
          ]),
        ]),
        m('.sur-bg-2.pad-1-0.typo-mono.typo-s-h6', [
          m('.dsp-flex.flx-rap', entry.value.features.map(
            (feature) => m('.box-c-100.box-rad-0-5.box-w-1.box-s-s.pad-0-5.mgn-r-0-5.mgn-b-0-5', feature),
          )),
        ]),
      ]);
  }
}

function getTBDView(listPath: string) {
  return m('.mgn-t-0-5.mgn-l-2-0.mgn-r-2-0.mgn-b-3-0',
    [
      m('.sur-bg-3.pad-1-0', [
        m('.role.typo-s-h1', '「 ...to be decided 」'),
        m('.company.typo-s-h4.dsp-flex', [
          m('i.fi-xnsxxm-building.dsp-flex', [
            m(getIcon(), { iconName: 'building', optionsMask: 'xnsxxm' }),
          ]),
          m('.mgn-l-0-5', '???'),
        ]),
        m('.location.typo-s-h4.typo-sub.dsp-flex', [
          m('i.fi-xnlxxm-map-marker-solid.dsp-flex', [
            m(getIcon(), { iconName: 'map-marker-solid', optionsMask: 'xnlxxm' }),
          ]),
          m('.mgn-l-0-5', 'Earth, but might be space'),
        ]),
        m('.employ-dates.typo-s-h4.typo-sub.dsp-flex', [
          m('i.fi-xnlxxm-calendar.dsp-flex', [
            m(getIcon(), { iconName: 'calendar', optionsMask: 'xnlxxm' }),
          ]),
          m('.mgn-l-0-5', '??? – ???'),
        ]),
        m(m.route.Link, {
          href: listPath,
          selector: '.dsp-flex.flx-a-c.link.sur-fg-3',
        }, [
          m('i.fi-xnslxl-arrow-simple.dsp-flex', [
            m(getIcon(), { iconName: 'arrow-simple', optionsMask: 'xnslxl' }),
          ]),
          m('.typo-s-h5', 'back to list'),
        ]),
      ]),
      m('.sur-bg-2.pad-1-0', [
        m('.mgn-b-0-5', '"To get through the hardest journey,'),
        m('.mgn-l-0-5.mgn-b-0-5', 'we need to take only'),
        m('.mgn-l-0-5.mgn-b-0-5', 'one step at a time ―'),
        m('.mgn-b-0-5', 'but we must keep on stepping."'),
        m('', [
          m('span', '― Chinese Proverb'),
        ]),
      ]),
    ]);
}
