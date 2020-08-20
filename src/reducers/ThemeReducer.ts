import {
  DefaultTheme as NavigationLightTheme,
  DarkTheme as NavigationDarkTheme,
  Theme as NavigationTheme
} from '@react-navigation/native';
import {
  DefaultTheme as PaperLightTheme,
  DarkTheme as PaperDarkTheme,
  Colors as PaperColors
} from 'react-native-paper';
import { Theme as PaperTheme } from 'react-native-paper/src/types';

export const TOGGLE_THEME= 'TOGGLE_THEME';

export type Action =
  | { type: 'TOGGLE_THEME'; };

export const ToggleThemeAction = (): Action => ({ type: TOGGLE_THEME });

export type Theme = {
  navigation: NavigationTheme,
  paper: PaperTheme
};

const CombinedDarkTheme: Theme = {
  paper: {
    ...PaperDarkTheme,
    colors: { ...PaperDarkTheme.colors, ...NavigationDarkTheme.colors },
  },
  navigation: {
    ...NavigationDarkTheme,
    colors: { ...PaperDarkTheme.colors, ...NavigationDarkTheme.colors },
  }
};

export const CombinedLightTheme: Theme = {
  paper: {
    ...PaperLightTheme,
    colors: { ...PaperLightTheme.colors, ...NavigationLightTheme.colors },
  },
  navigation: {
    ...NavigationLightTheme,
    colors: { ...PaperLightTheme.colors, ...NavigationLightTheme.colors },
  }
};

export const themeIsDark = (
  theme: Theme | undefined
): boolean => {
  if (theme && theme.paper && theme.paper.dark) {
    return true;
  }
  return false;
}

export const paperTheme = (theme: Theme = CombinedLightTheme) : PaperTheme => {
  const t = themeIsDark(theme) ? CombinedDarkTheme : CombinedLightTheme;

  return {
    ...t.paper,
    colors: {
      ...t.paper.colors,
      accent: themeIsDark(theme) ? 'rgb(255, 55, 95)' : 'rgb(255, 45, 85)',
    },
  };
};

export const barClassName = (
    theme: Theme | undefined
  ): "default" | "light-content" | "dark-content" | undefined => {
    if (themeIsDark(theme)) {
      return 'dark-content';
    }
    return 'light-content';
}

export const paperColors = (
  theme: Theme | undefined
): any => {
  if (themeIsDark(theme)) {
    return CombinedDarkTheme.paper.colors;
  }
  return CombinedLightTheme.paper.colors;
}

export type ThemeState = {
  theme: Theme
}

export const initialState: ThemeState = {
  theme: CombinedLightTheme
}

export default function ThemeReducer(prevState = initialState, action: Action): any {
  switch (action.type) {
    case TOGGLE_THEME:
      return {
        ...prevState,
        theme: prevState.theme && prevState.theme.paper.dark ? CombinedLightTheme : CombinedDarkTheme,
      };
    default:
      return prevState
  }
};
