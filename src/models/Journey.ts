import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';
import { getYaml, getYamlListItem } from './helpers/YamlLoader.js';

const journeyEntriesPath = './static/journey-entries.yaml';

export interface JourneyEntry {
  role: string;
  employer: string;
  location: string;
  empStartYear: number;
  empEndYear: number;
  empStartMonth: number;
  empEndMonth: number;
  features: string[];
}

export const tbdJourneyId = 1000;

export const tbdEntry: JourneyEntry = {
  role: '「 ...to be decided 」',
  employer: 'N/A',
  location: 'N/A',
  empStartYear: 0,
  empEndYear: 0,
  empStartMonth: 0,
  empEndMonth: 0,
  features: [],
};

export const notFoundEntry: JourneyEntry = {
  role: '',
  employer: 'N/A',
  location: 'N/A',
  empStartYear: 0,
  empEndYear: 0,
  empStartMonth: 0,
  empEndMonth: 0,
  features: [],
};

export const initialEntry: JourneyEntry = {
  role: '',
  employer: 'N/A',
  location: 'N/A',
  empStartYear: 0,
  empEndYear: 0,
  empStartMonth: 0,
  empEndMonth: 0,
  features: [],
};

export async function getInitialJourneyEntries(): Promise<JourneyEntry[]> {
  return getYaml(journeyEntriesPath);
}

export async function getJourneyEntry(maybeId: string): Promise<JourneyEntry> {
  const id = Number(maybeId);
  if (id === tbdJourneyId) {
    const promise = Promise.resolve(tbdEntry);
    promise.then(() => m.redraw());
    return promise;
  }
  return getYamlListItem(id, journeyEntriesPath, notFoundEntry);
}
