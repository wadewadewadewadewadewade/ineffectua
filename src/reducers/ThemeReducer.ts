import {
  DefaultTheme as NavigationLightTheme,
  DarkTheme as NavigationDarkTheme,
  Theme
} from '@react-navigation/native';
import {
  DefaultTheme as PaperLightTheme,
  DarkTheme as PaperDarkTheme,
} from 'react-native-paper';

export const TOGGLE_THEME= 'TOGGLE_THEME';

export type Action =
  | { type: 'TOGGLE_THEME'; };

export const ToggleThemeAction = (): Action => ({ type: TOGGLE_THEME });

const CombinedDarkTheme = {
  ...PaperDarkTheme,
  ...NavigationDarkTheme,
  colors: { ...PaperDarkTheme.colors, ...NavigationDarkTheme.colors },
};

export const CombinedLightTheme = {
  ...PaperLightTheme,
  ...NavigationLightTheme,
  colors: { ...PaperLightTheme.colors, ...NavigationLightTheme.colors },
};

export const paperTheme = (theme: Theme = CombinedLightTheme) => {
  const t = theme.dark ? CombinedDarkTheme : CombinedLightTheme;

  return {
    ...t,
    colors: {
      ...t.colors,
      ...theme.colors,
      surface: theme.colors.card,
      accent: theme.dark ? 'rgb(255, 55, 95)' : 'rgb(255, 45, 85)',
    },
  };
};

export type ThemeState = {
  theme: Theme | undefined
}

export const initialState: ThemeState = {
  theme: undefined
}

export default function ThemeReducer(prevState = initialState, action: Action): any {
  switch (action.type) {
    case TOGGLE_THEME:
      return {
        ...prevState,
        theme: (prevState.theme !== undefined) ? prevState.theme.dark ? CombinedLightTheme : CombinedDarkTheme : CombinedLightTheme,
      };
    default:
      return prevState
  }
};
