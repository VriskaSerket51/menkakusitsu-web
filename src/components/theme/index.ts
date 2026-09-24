import {
  christmasTheme,
  darkTheme,
  defaultTheme,
} from "@/components/theme/themes";
import { storage, utilities } from "@/utils";

export * from "./addon";

export type ThemeType =
  | "spring"
  | "summer"
  | "fall"
  | "winter"
  | "christmas"
  | "april-fools"
  | "none";

export const getThemeType = (): ThemeType => {
  const { month, date } = utilities.getDayInfo();

  if (month === 4 && date === 1) {
    return "april-fools";
  }
  if (month >= 3 && month <= 5) {
    return "spring";
  }

  if (month >= 6 && month <= 8) {
    return "summer";
  }

  if (month >= 9 && month <= 11) {
    return "fall";
  }

  if (month === 12) {
    return "christmas";
  }
  if (month <= 2) {
    return "winter";
  }
  return "none";
};

export const getTheme = (type: ThemeType, colorScheme: storage.ColorScheme) => {
  if (colorScheme == "dark") {
    return darkTheme;
  }

  switch (type) {
    case "spring":
    case "summer":
    case "fall":
    case "winter":
    case "april-fools":
    case "none":
      return defaultTheme;
    case "christmas":
      return christmasTheme;
  }
};

export * as default from ".";
