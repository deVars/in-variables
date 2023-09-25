import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';

export interface RouteEntry {
  label: string;
  path: string;
}

const routePath = './route.yaml';
export default async function getRoute(): Promise<Record<string, RouteEntry>> {
  const routeYamlBlob = await m.request<string>(routePath, {
    responseType: 'text',
  });
  const { parse } = await import('https://cdn.jsdelivr.net/npm/yaml@2/+esm');
  return parse(routeYamlBlob);
}
