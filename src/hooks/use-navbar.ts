import { create } from "zustand";

type NavbarState = {
  noHeader?: boolean;
  noFooter?: boolean;
};

export const useNavbar = create<NavbarState>(() => ({
  noHeader: false,
  noFooter: false,
}));

export const setHeaderActive = (value: boolean) => {
  useNavbar.setState({
    noHeader: !value,
  });
};

export const setFooterActive = (value: boolean) => {
  useNavbar.setState({
    noFooter: !value,
  });
};
