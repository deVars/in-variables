import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import getIcon from './FriconixIcon.js';
import getProjectFooter from './ProjectFooter.js';
import { type RouteEntry } from '../route.js';
import { type StrictAttributeModel } from '../models/AttributeModel.js';
import { toggleDarkLightTheme } from './helpers/Theme.js';

interface Layout {
  isDarkTheme: StrictAttributeModel<boolean>;
  label: string;
  subLabel: string;
  routeMap: Record<string, RouteEntry>;
}

const Icon = getIcon();

export default function getProjectLayout({
  isDarkTheme, label, subLabel, routeMap,
}: Layout): m.ClosureComponent {
  return (_vnode: m.Vnode) => ({ view });

  function view({ children }: m.Vnode) {
    const themeIconName = isDarkTheme.value ? 'bulb-solid' : 'bulb-hollow';
    return m('.sur-bg-1.sur-fg-1.typo-std', [
      m('.pad-t-0-5.pad-b-0-5.sur-bg-4', [
        m('.wid-max.mgn-cntr', [
          m('.sur-fg-10.dsp-flex.flx-s-b', [
            m('section.typo-s-h1', label),
            m('section.mgn-0.mgn-l-4-0.mgn-r-2-0.box-w-1.box-l-s-s.box-c-100', [
              m('.mgn-l-2-0.typo-s-h1.dsp-flex.flx-a-c.hgt-flow', [
                m('.link.typo-mono.typo-s-h5.typo-s-bold.sur-fg-3.mgn-r-2-0',
                  { onclick: () => isDarkTheme.set(toggleDarkLightTheme(isDarkTheme.value)) },
                  [
                    m('i.fi-cnluxm-bulb-solid.typo-s-h1.dsp-flex', [
                      m(Icon, { iconName: themeIconName, optionsMask: 'cnluxm' }),
                    ]),
                  ]),
                m('.link.typo-mono.typo-s-h5.typo-s-bold.sur-fg-3.mgn-r-0-5',
                  { onclick: () => console.warn('hamburger is clicked') },
                  [
                    m(getIcon(), { iconName: 'hamburger', optionsMask: 'xwlxxh' }),
                  ]),
              ]),
            ]),
          ]),
        ]),
      ]),
      m('.content.box-w-1.box-t-s-s.box-c-100', [
        m('.wid-max.mgn-cntr', [
          m('section.pad-t-0-25', children),
        ]),
      ]),
      m(getProjectFooter({ label, routeMap, subLabel })),
    ]);
  }
}
