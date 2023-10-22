import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import { getInitialProjectEntries, type ProjectEntry } from '../models/Project.js';
import { type StrictAttributeModel } from '../models/AttributeModel.js';
import type { WithOnClick } from './helpers/ComponentHandler';
import Loading from './Loading.js';
import getIcon from './FriconixIcon.js';

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
      return m(Loading());
    }

    return m('.mgn-t-0-5.mgn-l-2-0.mgn-r-2-0.mgn-b-3-0', projects.map(({
      title, sub, imagePath,
    }, index) => m('.link-card-b-101-102.box-l-s-s.box-w-8.pad-l-0-5.mgn-b-2-0', {
      onclick: () => onclick(index),
    }, [
      m('.link-card.sur-bg-2.pad-t-1-0.pad-l-1-0.pad-r-1-0.pad-b-0-5.dsp-flex', [
        m('img.box-rad-0-5.wid-4-0.obj-fit-c', {
          src: `${assetsRoot}/${imagePath}`,
          loading: 'lazy',
        }, []),
        m('.mgn-l-2-0', [
          m('.typo-s-h2.mgn-b-0-5', title),
          m('.typo-sub', sub),
        ]),
      ]),
      m('.link-card-detail-hint.sur-fg-3.typo-s-h4.typo-sub.typo-s-ctr', [
        m(getIcon(), { iconName: 'double-chevron-wide', optionsMask: 'xnldxl' }),
      ]),
    ])));
  }
}
