import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import { type HierarchyNode } from 'https://cdn.jsdelivr.net/npm/d3-hierarchy@3/+esm';
import getRoute from './route.js';
import { type SkillEntry } from './models/Skill.js';
import getSkillView from './views/Skill.js';
import getLayout from './views/Layout.js';
import { getAttributeModel, getStrictAttributeModel } from './models/AttributeModel.js';
import getAboutView from './views/About.js';
import getJourneyView from './views/JourneyEntries.js';
import type { JourneyEntry } from './models/Journey.js';
import { initialEntry } from './models/Journey.js';
import getAttributionView from './views/Attribution.js';
import getJourneyEntryView from './views/JourneyEntry.js';
import getProjectsView from './views/Projects.js';
import { initialProjectEntry, type ProjectEntry } from './models/Project.js';
import { getProjectView } from './views/Project.js';
import getTableVirtualizationDemo from './views/TableVirtualizationDemo.js';

declare global {
  interface Window {
    friconix_update: () => void;
    paths: Record<string, string>;
    shapes: Record<string, string>;
  }
}

m.render(document.body, m('.sur-bg-1.sur-fg-1.typo-std', 'loading'));

getRoute().then((route) => {
  const homePath = route.about.path;
  const layout = getLayout(route);
  const skillView = getSkillView({
    root: getAttributeModel<HierarchyNode<SkillEntry>>(null),
    selector: '.skill-root',
    skills: getStrictAttributeModel<SkillEntry[]>([]),
  });
  const aboutView = getAboutView();
  const journeyView = getJourneyView({
    entries: getStrictAttributeModel<JourneyEntry[]>([]),
  });
  const attributionView = getAttributionView();
  const journeyEntryView = getJourneyEntryView({
    entry: getStrictAttributeModel<JourneyEntry>(initialEntry),
    homePath,
    listPath: route.work.path,
  });
  const projectsView = getProjectsView({
    projects: getStrictAttributeModel<ProjectEntry[]>([]),
  });
  const projectView = getProjectView({
    homePath,
    listPath: route.project.path,
    project: getStrictAttributeModel<ProjectEntry>(initialProjectEntry),
  });
  const tableVirtualizationDemoView = getTableVirtualizationDemo();

  m.route.prefix = '#';
  m.route(document.body, route.about.path, {
    [route.about.path]: {
      render: () => m(layout, m(aboutView)),
    },
    [route.skill.path]: {
      render: () => m(layout, m(skillView)),
    },
    [route.work.path]: {
      render: () => m(layout, m(journeyView, {
        onclick: journeyDetailViewNavigate,
      })),
    },
    [route.project.path]: {
      render: () => m(layout, m(projectsView, {
        onclick: projectDetailViewNavigate,
      })),
    },
    [route.attribution.path]: {
      render: () => m(layout, m(attributionView)),
    },
    /** unlisted paths start here */
    [route.workDetail.path]: {
      render: (vnode) => m(layout, m(journeyEntryView, vnode.attrs)),
    },
    [route.projectDetail.path]: {
      render: (vnode) => m(layout, m(projectView, vnode.attrs)),
    },
    [route.tableVirtualization.path]: {
      render: () => m(layout, m(tableVirtualizationDemoView, '')),
    },
  });

  function journeyDetailViewNavigate(id: number) {
    /** this fn assumes the user visited the journey list already */
    const { path } = route.workDetail;
    return m.route.set(path, { id });
  }

  function projectDetailViewNavigate(id: number) {
    /** this fn assumes the user visited the project list already */
    const { path } = route.projectDetail;
    return m.route.set(path, { id });
  }
});
