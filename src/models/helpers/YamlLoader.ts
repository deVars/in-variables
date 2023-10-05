import m from 'https://cdn.jsdelivr.net/npm/mithril@2/+esm';

export async function getYaml<T>(path: string): Promise<T> {
  const [ { parse }, yamlDocument ] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/yaml@2/+esm'),
    m.request<string>(path, {
      responseType: 'text',
    }),
  ]);
  return parse(yamlDocument);
}

export async function getYamlListItem<T>(
  index: number, path: string, defaultValue: T,
): Promise<T> {
  const yamlList: T[] = await getYaml(path);
  return !yamlList[index] ? defaultValue : yamlList[index];
}
