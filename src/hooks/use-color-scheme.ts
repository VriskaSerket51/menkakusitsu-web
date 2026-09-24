import { create } from "zustand";

import { storage } from "@/utils";
import { setColorScheme } from "@/utils/storage";

type ColorSchemeProps = {
  scheme: storage.ColorScheme;
};

export const useColorScheme = create<ColorSchemeProps>(() => ({
  scheme: storage.getColorScheme(),
}));

export function changeColorScheme(scheme: storage.ColorScheme) {
  useColorScheme.setState({
    scheme: scheme,
  });
  setColorScheme(scheme);
}
