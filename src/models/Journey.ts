import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';

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

export async function getInitialJourneyEntries(): Promise<JourneyEntry[]> {
  const [ { parse }, journeyYamlBlob ] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/yaml@2/+esm'),
    m.request<string>(journeyEntriesPath, {
      responseType: 'text',
    }),
  ]);
  return parse(journeyYamlBlob);
}
