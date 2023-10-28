import { type KVNamespace, type EventContext } from '@cloudflare/workers-types';

interface Env {
  dv_pre_us: KVNamespace;
}

const secondsPerDay = 86400;
const millisPerSecond = 1000;
const seeds = [ 2 ** 31 - 1, 2 ** 19 - 1, 2 ** 17 - 1, 2 ** 13 - 1 ];
export async function onRequestGet(
  context: EventContext<Env, string, Record<string, unknown>>,
): Promise<Response> {
  const day = Math.floor(Date.now() / secondsPerDay / millisPerSecond);
  const wordListJson = await context.env.dv_pre_us.get('words');
  if (wordListJson === null) {
    return new Response(JSON.stringify({
      words: [],
    }));
  }

  const wordlist = JSON.parse(wordListJson);
  const words = seeds.map((seed) => {
    const word = wordlist[(day * seed) % wordlist.length];
    return { word, shuffled: shuffle(word) };
  });
  return new Response(JSON.stringify({ words }));
}

function shuffle(og: string): string {
  const letters = og.split('');

  letters.forEach((_letter, index) => {
    if (index === 0) {
      return;
    }
    const newIndex = Math.floor(Math.random() * index);
    [ letters[index], letters[newIndex] ] = [ letters[newIndex], letters[index] ];
  });

  return letters.join('');
}
