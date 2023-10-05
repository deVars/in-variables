import { getYaml, getYamlListItem } from './helpers/YamlLoader.js';

const projectsPath = './static/projects.yaml';

export interface ProjectEntry {
  title: string;
  sub: string;
  link: string;
  imagePath: string;
  features: string[];
  description: string[];
}

export async function getInitialProjectEntries(): Promise<ProjectEntry[]> {
  return getYaml(projectsPath);
}

const defaultProjectEntry: ProjectEntry = {
  title: '',
  sub: '',
  link: '',
  imagePath: '',
  features: [],
  description: [],
};

export async function getProjectEntry(index: number): Promise<ProjectEntry> {
  return getYamlListItem(index, projectsPath, defaultProjectEntry);
}
