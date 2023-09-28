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
}

export async function getInitialJourneyEntries(): Promise<JourneyEntry[]> {
  const [ { parse }, journeyYamlBlob ] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/yaml@2/+esm'),
    m.request<string>(journeyEntriesPath, {
      responseType: 'text',
    }),
  ]);
  return parse(journeyYamlBlob);
}
