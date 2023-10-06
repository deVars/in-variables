import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import { hierarchy, type HierarchyNode } from 'https://cdn.jsdelivr.net/npm/d3-hierarchy@3/+esm';
import { getInitialSkillList, type SkillEntry } from '../models/Skill.js';
import { type AttributeModel, type StrictAttributeModel } from '../models/AttributeModel.js';
import { appendSkillTree } from './SkillForceTree.helper.js';

export interface SkillView {
  root: AttributeModel<HierarchyNode<SkillEntry>>;
  selector: string;
  skills: StrictAttributeModel<SkillEntry[]>;
}

export default function getSkillView({
  root, selector, skills,
}: SkillView): m.ClosureComponent {
  return () => ({ oninit, onupdate, view });

  function oninit() {
    getInitialSkillList().then((newSkillList) => {
      skills.set(newSkillList);
      const data: SkillEntry = { text: 'skills', sub: newSkillList };
      root.set(hierarchy(data, (d: SkillEntry) => d.sub));
    });
  }

  function onupdate() {
    return appendSkillTree({ root, selector, skills });
  }

  function view() {
    if (!root.value) {
      // TODO: loading
      return m('.loading');
    }
    return m(selector);
  }
}

/** Tried converting this to a closure component
 *  The problem was that the append D3 portion isn't meant to be part of
 *  the mithril component lifecycle and will freeze the render
 *  if put in this scope */
