import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import type { JourneyEntry } from '../models/Journey.js';
import type { AttributeModel } from '../models/AttributeModel.js';
import getNotFound, { type WithHomePath } from './NotFound.js';
import { tbdEntry } from '../models/Journey.js';
import getIcon from './FriconixIcon.js';

export interface JourneyDetailView extends WithHomePath {
  id: string;
  listPath: string;
  journeyEntry: AttributeModel<JourneyEntry>;
}

export default function getJourneyEntryView(): m.Component<JourneyDetailView> {
  return { view };
}

function view({ attrs: { journeyEntry, homePath, listPath } }: m.Vnode<JourneyDetailView>) {
  if (!journeyEntry.value) {
    return m(getNotFound(), { homePath });
  }

  if (journeyEntry.value === tbdEntry) {
    return getTBDView(listPath);
  }

  const { role, employer, location,
    empStartMonth, empStartYear, empEndMonth, empEndYear } = journeyEntry.value;

  return m('.box-work',
    [
      m('.sur-3.pad-1-0', [
        m('.role.typo-s-h1', role),
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
        m(m.route.Link, { href: listPath, selector: '.dsp-flex.flx-a-c.lnk-crsr.act-fg' }, [
          m('i.fi-xnslxl-arrow-simple.dsp-flex', [
            m(getIcon(), { iconName: 'arrow-simple', optionsMask: 'xnslxl' }),
          ]),
          m('.typo-s-h5', 'back to list'),
        ]),
      ]),
      m('.sur-2.pad-1-0.sur-typo-mono.typo-s-h6', [
        m('.dsp-flex.flx-rap', journeyEntry.value.features.map(
          (feature) => m('.box-fg-100.box-rad-0-5.box-wd-1.box-s-s.pad-0-5.mgn-r-0-5.mgn-b-0-5', feature),
        )),
      ]),
    ]);
}

function getTBDView(listPath: string) {
  return m('.box-work',
    [
      m('.sur-3.pad-1-0', [
        m('.role.typo-s-h1', '「 ...to be decided 」'),
        m('.company.typo-s-h4.dsp-flex', [
          m('i.fi-xnsxxm-building.dsp-flex', [
            m(getIcon(), { iconName: 'building', optionsMask: 'xnsxxm' }),
          ]),
          m('.mgn-l-0-5', '???'),
        ]),
        m('.location.typo-s-h4.sur-typo-sub.dsp-flex', [
          m('i.fi-xnlxxm-map-marker-solid.dsp-flex', [
            m(getIcon(), { iconName: 'map-marker-solid', optionsMask: 'xnlxxm' }),
          ]),
          m('.mgn-l-0-5', 'Earth, but might be space'),
        ]),
        m('.employ-dates.typo-s-h4.sur-typo-sub.dsp-flex', [
          m('i.fi-xnlxxm-calendar.dsp-flex', [
            m(getIcon(), { iconName: 'calendar', optionsMask: 'xnlxxm' }),
          ]),
          m('.mgn-l-0-5', '??? – ???'),
        ]),
        m(m.route.Link, { href: listPath, selector: '.dsp-flex.flx-a-c.lnk-crsr.act-fg' }, [
          m('i.fi-xnslxl-arrow-simple.dsp-flex', [
            m(getIcon(), { iconName: 'arrow-simple', optionsMask: 'xnslxl' }),
          ]),
          m('.typo-s-h5', 'back to list'),
        ]),
      ]),
      m('.sur-2.pad-1-0', [
        m('.mgn-b-0-5', '"There was rarely an obvious branching point in a person\'s life.  People changed slowly over time.'),
        m('.mgn-l-0-5.mgn-b-0-5', 'You didn\'t take one step, then find yourself in a completely new location.'),
        m('.mgn-l-0-5.mgn-b-0-5', 'You first took a little step off the path to avoid some rocks.'),
        m('.mgn-b-0-5', 'For a while, you walked alongside the path, but then you wandered out a little way to step on softer soil. Then you stopped paying attention as you drifted farther and farther away.'),
        m('.mgn-b-0-5', 'Finally, you found yourself in the wrong city, wondering why the signs on the roadway hadn\'t led you better."'),
        m('', [
          m('span', '― Brandon Sanderson, '),
          m('span.typo-s-ital', 'The Emperor\'s Soul'),
        ]),
      ]),
    ]);
}
