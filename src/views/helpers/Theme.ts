const docElementAttribute = 'data-is-dark-theme';

export function getIsInitialThemeDark(): boolean {
  if (!window.matchMedia) { /** default dark mode if no support */
    return true;
  }

  const mediaQuery = '(prefers-color-scheme: dark)';

  const isDarkTheme = window.matchMedia(mediaQuery).matches;
  const isDarkThemeAttribute = isDarkTheme
    ? '1'
    : '0';

  document.documentElement.setAttribute(docElementAttribute, isDarkThemeAttribute);
  return isDarkTheme;
}

export function toggleDarkLightTheme(isDarkTheme: boolean): boolean {
  const isToggledDarkThemeAttribute = !isDarkTheme
    ? '1'
    : '0';
  document.documentElement.setAttribute(docElementAttribute, isToggledDarkThemeAttribute);
  return !isDarkTheme;
}
