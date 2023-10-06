import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import type { StrictAttributeModel } from '../models/AttributeModel.js';
import type { ProjectEntry } from '../models/Project.js';
import type { WithHomePath } from './NotFound.js';
import { getProjectEntry, initialProjectEntry, notFoundProjectEntry } from '../models/Project.js';
import getNotFound from './NotFound.js';
import getIcon from './FriconixIcon.js';
import type { WithId } from '../models/helpers/WithId';
import Loading from './Loading.js';

export interface ProjectView extends WithHomePath {
  listPath: string;
  project: StrictAttributeModel<ProjectEntry>;
}

const assetsRoot = '../../assets/images';
export function getProjectView({
  homePath, listPath, project,
}: ProjectView): m.ClosureComponent<WithId> {
  return () => ({ oninit, view });

  async function oninit({ attrs: { id } }: m.Vnode<WithId>) {
    project.set(initialProjectEntry);
    project.set(await getProjectEntry(id));
  }

  function view() {
    if (project.value === initialProjectEntry) {
      return m(Loading());
    }

    if (project.value === notFoundProjectEntry) {
      return m(getNotFound(), { homePath });
    }

    const { title, sub, link, imagePath, features, description } = project.value;

    return m('.mgn-t-0-5.mgn-l-2-0.mgn-r-2-0.mgn-b-3-0',
      [
        m('.sur-bg-3.pad-1-0.dsp-flex', [
          m('img.box-rad-0-5.obj-fit-c.wid-fl.wid-max-12-0', {
            src: `${assetsRoot}/${imagePath}`,
            loading: 'lazy',
          }, []),
          m('.mgn-l-2-0', [
            m('.typo-s-h2.mgn-b-0-5.dsp-flex.flx-a-c', [
              m('span', title),
              link !== '' && m('a.typo-s-h2.sur-fg-3.link', {
                href: link,
                target: '_blank',
              }, [
                m('i.fi-xnlxxm-external-link.typo-s-h4.dsp-flex.mgn-l-0-5', [
                  m(getIcon(), { iconName: 'external-link', optionsMask: 'xnlxxm' }),
                ]),
              ]),
            ]),
            m('.typo-sub.mgn-b-0-5', sub),

            m(m.route.Link, {
              href: listPath,
              selector: '.dsp-flex.flx-a-c.link.sur-fg-3.mgn-b-2-0',
            }, [
              m('i.fi-xnslxl-arrow-simple.dsp-flex', [
                m(getIcon(), { iconName: 'arrow-simple', optionsMask: 'xnslxl' }),
              ]),
              m('.typo-s-h5', 'back to list'),
            ]),
            m('.dsp-flex.flx-rap.typo-mono.typo-s-h6', features.map(
              (feature) => m('.box-c-100.box-rad-0-5.box-w-1.box-s-s.pad-0-5.mgn-r-0-5.mgn-b-0-5', feature),
            )),
          ]),
        ]),
        m('.sur-bg-2.pad-1-0', [
          m('.dsp-flex.flx-rap', description.map(
            (paragraph) => m('p', paragraph),
          )),
        ]),
      ]);
  }
}
