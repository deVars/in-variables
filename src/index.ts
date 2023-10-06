import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import { hierarchy, type HierarchyNode } from 'https://cdn.jsdelivr.net/npm/d3-hierarchy@3/+esm';
import getRoute from './route.js';
import { getInitialSkillList, type SkillEntry } from './models/Skill.js';
import getSkillView, { type SkillView } from './views/Skill.js';
import getLayout from './views/Layout.js';
import { getAttributeModel, getStrictAttributeModel } from './models/AttributeModel.js';
import { appendSkillTree } from './views/SkillForceTree.helper.js';
import getAboutView from './views/About.js';
import getJourneyView, { type JourneyView } from './views/JourneyEntries.js';
import type { JourneyEntry } from './models/Journey.js';
import { getInitialJourneyEntries, tbdEntry, tbdJourneyId } from './models/Journey.js';
import getAttributionView from './views/Attribution.js';
import getJourneyEntryView, { type JourneyDetailView } from './views/JourneyEntry.js';
import getProjectsView from './views/Projects.js';
import { getInitialProjectEntries, getProjectEntry, type ProjectEntry } from './models/Project.js';
import type { WithId } from './models/helpers/WithId';
import { getProjectView, type ProjectView } from './views/Project.js';

declare global {
  interface Window {
    friconix_update: () => void;
    paths: Record<string, string>;
    shapes: Record<string, string>;
  }
}

m.render(document.body, m('.sur-bg-1.sur-fg-1.typo-std', 'loading'));

getRoute().then((route) => {
  const layout = getLayout(route);
  const skillView = getSkillView();
  const aboutView = getAboutView();
  const journeyView = getJourneyView();
  const attributionView = getAttributionView();
  const journeyEntryView = getJourneyEntryView();
  const projectsView = getProjectsView();
  const projectView = getProjectView();
  const skills = getStrictAttributeModel<SkillEntry[]>([]);
  const root = getAttributeModel<HierarchyNode<SkillEntry>>(null);
  const journeyEntries = getStrictAttributeModel<JourneyEntry[]>([]);
  const journeyEntry = getAttributeModel<JourneyEntry>(null);
  const projects = getStrictAttributeModel<ProjectEntry[]>([]);
  const project = getAttributeModel<ProjectEntry>(null);

  // TODO:  what happens if we do a direct m(getAboutView()) inside the route tree
  m.route.prefix = '#';
  m.route(document.body, route.about.path, {
    [route.about.path]: {
      render: () => m(layout, m(aboutView)),
    },
    [route.skill.path]: {
      render: () => m(layout, m(skillView, {
        skills, root,
        oninit: skillViewOnInit,
        onupdate: appendSkillTree,
      })),
    },
    [route.work.path]: {
      render: () => m(layout, m(journeyView, {
        journeyEntries,
        oninit: journeyViewOnInit,
        onclick: journeyDetailViewNavigate,
      })),
    },
    [route.project.path]: {
      render: () => m(layout, m(projectsView, {
        projects,
        oninit: projectListViewOnInit,
        onclick: projectDetailViewNavigate,
      })),
    },
    [route.attribution.path]: {
      render: () => m(layout, m(attributionView)),
    },
    /** unlisted paths start here */
    [route.workDetail.path]: {
      render: ({ attrs: { id } }: m.Vnode<WithId>) => m(layout, m(
        journeyEntryView, {
          id,
          journeyEntry,
          homePath: route.about.path,
          listPath: route.work.path,
          oninit: journeyEntryViewOnInit,
        },
      )),
    },
    [route.projectDetail.path]: {
      render: ({ attrs }: m.Vnode<WithId>) => m(layout, m(
        projectView, {
          id: attrs.id,
          project,
          homePath: route.about.path,
          listPath: route.project.path,
          oninit: projectDetailViewOnInit,
        },
      )),
    },
  });

  function skillViewOnInit({ attrs: { skills: skillList, root: rootNode } }: m.Vnode<SkillView>) {
    getInitialSkillList().then((newSkillList) => {
      skillList.set(newSkillList);
      const data: SkillEntry = { text: 'skills', sub: newSkillList };
      rootNode.set(hierarchy(data, (d: SkillEntry) => d.sub));
    });
  }

  function journeyViewOnInit({ attrs: { journeyEntries: entries } }: m.Vnode<JourneyView>) {
    getInitialJourneyEntries().then((newEntries) => {
      entries.set(newEntries);
    });
  }

  async function journeyEntryViewOnInit({
    attrs: { id: idParam, journeyEntry: entry },
  }: m.Vnode<JourneyDetailView>) {
    const id = Number(idParam);
    let isInitialEntriesEmpty = false;

    if (journeyEntries.value.length === 0) {
      isInitialEntriesEmpty = true;
      const entries = await getInitialJourneyEntries();
      journeyEntries.set(entries);
    }

    entry.set(getJourneyEntry(id));
    return !isInitialEntriesEmpty ? m.redraw() : null;

    function getJourneyEntry(someId: number) {
      if (someId === tbdJourneyId) {
        return tbdEntry;
      }

      const maybeJourneyEntry = journeyEntries.value[id];
      return !maybeJourneyEntry ? null : maybeJourneyEntry;
    }
  }

  function journeyDetailViewNavigate(id: number) {
    /** this fn assumes the user visited the journey list already */
    const { path } = route.workDetail;
    return m.route.set(path, { id });
  }

  async function projectDetailViewOnInit(vnode: m.Vnode<ProjectView>) {
    project.set(null);
    project.set(await getProjectEntry(vnode.attrs.id));
  }

  async function projectListViewOnInit() {
    projects.set([]);
    return projects.set(await getInitialProjectEntries());
  }

  function projectDetailViewNavigate(id: number) {
    /** this fn assumes the user visited the project list already */
    const { path } = route.projectDetail;
    return m.route.set(path, { id });
  }
});
