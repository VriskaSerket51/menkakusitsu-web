import { type TokenPayload, createTokenPayload } from "@/auth";
import { create } from "zustand";

import { storage, utilities } from "@/utils";
import { getTokenPayload } from "@/utils/utilities";

type AuthProps = {
  payload: TokenPayload;
};

export const useAuth = create<AuthProps>(() => ({
  payload: getTokenPayload(),
}));

export function login(accessToken: string | null) {
  const payload = utilities.parseJwt(accessToken);
  useAuth.setState({
    payload: payload,
  });
}

export function logout() {
  useAuth.setState({
    payload: createTokenPayload(),
  });
}

const accessToken = storage.getAccessToken();
login(accessToken);
