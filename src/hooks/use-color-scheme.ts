import { create } from "zustand";

import * as storage from "@/utils/storage";
import { setColorScheme } from "@/utils/storage";

type ColorSchemeState = {
  scheme: storage.ColorScheme;
};

export const useColorScheme = create<ColorSchemeState>(() => ({
  scheme: typeof window === "undefined" ? "light" : storage.getColorScheme(),
}));

export function changeColorScheme(scheme: storage.ColorScheme) {
  useColorScheme.setState({
    scheme: scheme,
  });
  setColorScheme(scheme);
}
