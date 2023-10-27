const merseinne_seeds = [ 1, 2 ** 31 - 1, 2 ** 19 - 1, 2 ** 17 - 1, 2 ** 13 - 1 ];
// words[Math.floor(Date.now() / 1000) * s % words.length])
export function shuffle(og: string): string {
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
