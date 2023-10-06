import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import { type HierarchyNode } from 'https://cdn.jsdelivr.net/npm/d3-hierarchy@3/+esm';
import { type SkillEntry } from '../models/Skill.js';
import { type AttributeModel, type StrictAttributeModel } from '../models/AttributeModel.js';

export interface SkillView {
  skills: StrictAttributeModel<SkillEntry[]>;
  root: AttributeModel<HierarchyNode<SkillEntry>>;
  selector: string;
}

export default function getSkillView(): m.Component<SkillView> {
  return { view };
}

/** Tried converting this to a closure component
 *  The problem was that the append D3 portion isn't meant to be part of
 *  the mithril component lifecycle and will freeze the render
 *  if put in this scope */
function view({ attrs: { root, selector } }: m.Vnode<SkillView>): m.Children {
  if (!root.value) {
    // TODO: loading
    return m('.loading');
  }
  return m(selector);
}
