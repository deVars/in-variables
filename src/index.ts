import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import { hierarchy, type HierarchyNode } from 'https://cdn.jsdelivr.net/npm/d3-hierarchy@3/+esm';
import getRoute from './route.js';
import { getInitialSkillList, type SkillEntry } from './models/Skill.js';
import getSkillView, { type SkillView } from './views/Skill.js';
import getLayout from './views/Layout.js';
import { getAttributeModel, getStrictAttributeModel } from './models/AttributeModel.js';
import { appendSkillTree } from './views/SkillForceTree.helper.js';
import getAboutView from './views/About.js';
import getJourneyView, { type JourneyView } from './views/Journey.js';
import type { JourneyEntry } from './models/Journey.js';
import { getInitialJourneyEntries } from './models/Journey.js';
import getAttributionView from './views/Attribution.js';

declare global {
  interface Window {
    friconix_update: () => void;
  }
}

m.render(document.body, m('.sur-bg.sur-fg.sur-typo', 'loading'));

getRoute().then((route) => {
  const layout = getLayout();
  const skillView = getSkillView();
  const aboutView = getAboutView();
  const journeyView = getJourneyView();
  const attributionView = getAttributionView();
  const skills = getStrictAttributeModel<SkillEntry[]>([]);
  const root = getAttributeModel<HierarchyNode<SkillEntry>>(null);
  const journeyEntries = getStrictAttributeModel<JourneyEntry[]>([]);

  m.route.prefix = '#';
  m.route(document.body, route.about.path, {
    [route.about.path]: {
      render: () => m(layout, { route }, m(aboutView)),
    },
    [route.skill.path]: {
      render: () => m(layout, { route }, m(skillView, {
        skills, root,
        oninit: skillViewOnInit,
        onupdate: appendSkillTree,
      })),
    },
    [route.work.path]: {
      render: () => m(layout, { route }, m(journeyView, {
        journeyEntries,
        oninit: journeyViewOnInit,
      })),
    },
    [route.project.path]: {
      render: () => m(layout, { route }, m('.wip.box-work', {}, [
        m('.sur-2.pad-1-0', 'This section is a work in progress'),
      ])),
    },
    [route.attribution.path]: {
      render: () => m(layout, { route }, m(attributionView)),
    },
  });

  function skillViewOnInit({ attrs: { skills, root } }: m.Vnode<SkillView>) {
    getInitialSkillList().then((skillList) => {
      skills.set(skillList);
      const data: SkillEntry = { text: 'skills', sub: skillList };
      root.set(hierarchy(data, (d: SkillEntry) => d.sub));
    });
  }

  function journeyViewOnInit({ attrs: { journeyEntries } }: m.Vnode<JourneyView>) {
    getInitialJourneyEntries().then((entries) => {
      journeyEntries.set(entries);
    });
  }
});
