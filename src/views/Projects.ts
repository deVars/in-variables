import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import { getInitialProjectEntries, type ProjectEntry } from '../models/Project.js';
import { type StrictAttributeModel } from '../models/AttributeModel.js';
import type { WithOnClick } from './helpers/ComponentHandler';

export interface ProjectsView {
  projects: StrictAttributeModel<ProjectEntry[]>;
}

const assetsRoot = '../../assets/images';
export default function getProjectsView({
  projects: projectsModel,
}: ProjectsView): m.ClosureComponent<WithOnClick> {
  return () => ({ oninit, view });

  async function oninit() {
    projectsModel.set([]);
    return projectsModel.set(await getInitialProjectEntries());
  }

  function view({ attrs: { onclick } }: m.Vnode<WithOnClick>) {
    const projects = projectsModel.value;
    if (projects.length === 0) {
      return m('.loading');
    }

    return m('.mgn-t-0-5.mgn-l-2-0.mgn-r-2-0.mgn-b-3-0', projects.map(({
      title, sub, imagePath,
    }, index) => m('.link-card-b-101-102.box-l-s-s.box-w-8.pad-l-0-5', {
      onclick: () => onclick(index),
    }, [
      m('.link-card.sur-bg-2.pad-1-0.mgn-b-0-5.dsp-flex', [
        m('img.box-rad-0-5.wid-4-0.obj-fit-c', {
          src: `${assetsRoot}/${imagePath}`,
          loading: 'lazy',
        }, []),
        m('.mgn-l-2-0', [
          m('.typo-s-h2.mgn-b-0-5', title),
          m('.typo-sub', sub),
        ]),
      ]),
    ])));
  }
}
