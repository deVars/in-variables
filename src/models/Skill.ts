import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';

const skillListPath = './skills.yaml';

export interface Skill {
  list: SkillEntry[];
  set: SetSkill;
}

export interface SkillEntry {
  text: string;
  sub: SkillEntry[];
}

interface SetSkill {
  (newSkillEntry: SkillEntry[]): SkillEntry[];
}

export async function getInitialSkillList(): Promise<SkillEntry[]> {
  const [ { parse }, skillYamlBlob ] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/yaml@2/+esm'),
    m.request<string>(skillListPath, {
      responseType: 'text',
    }),
  ]);
  const { skills } = parse(skillYamlBlob);
  return skills;
}
