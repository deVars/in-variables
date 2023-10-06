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
  const projectsView = getProjectsView();
  const projectView = getProjectView();
  const projects = getStrictAttributeModel<ProjectEntry[]>([]);
  const project = getAttributeModel<ProjectEntry>(null);

  // TODO:  what happens if we do a direct m(getAboutView()) inside the route tree
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
      render: (vnode) => m(layout, m(journeyEntryView, vnode.attrs)),
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
