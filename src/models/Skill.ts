import { getYaml } from './helpers/YamlLoader.js';

const skillListPath = './static/skills.yaml';

export interface SkillEntry {
  text: string;
  sub: SkillEntry[];
}

export async function getInitialSkillList(): Promise<SkillEntry[]> {
  return getYaml(skillListPath);
}
