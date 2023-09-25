import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import { type HierarchyNode } from 'https://cdn.jsdelivr.net/npm/d3-hierarchy@3/+esm';
import { type SkillEntry } from '../models/Skill.js';
import { type AttributeModel, type StrictAttributeModel } from '../models/AttributeModel.js';

export interface SkillView {
  skills: StrictAttributeModel<SkillEntry[]>;
  root: AttributeModel<HierarchyNode<SkillEntry>>;
}
export default function getSkillView(): m.Component<SkillView> {
  return { view };
}

function view({ attrs: { root } }: m.Vnode<SkillView>): m.Children {
  if (!root.value) {
    // TODO: loading
    return m('.loading');
  }
  return m('#skillContainer');
}
