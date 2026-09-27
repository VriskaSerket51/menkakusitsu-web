import * as api from "@/api/actions";
import { getDeviceId } from "@/utils/storage";
import { useAuth } from "@/features/auth/use-auth";
import { getTokenPayload } from "@/features/auth/session-state";
import { onMessage } from "firebase/messaging";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";

import { DefaultSnackbar } from "@/components/snackbar/default";
import * as firebase from "@/utils/firebase.client";

export function FirebaseComponent() {
  const [messaging] = useState(firebase.getFirebaseMessaging());
  const { enqueueSnackbar } = useSnackbar();
  const uid = useAuth(state => state.payload.uid);
  const sid = useAuth(state => state.payload.sid);

  useEffect(() => {
    if (!messaging || !uid) return;
    const unsubscribe = firebase.subscribePushRegistration(change => {
      const current = getTokenPayload();
      if (current.uid !== uid || current.sid !== sid || !api.getPushApproved()) return;
      const target = { deviceId: getDeviceId(), installationId: change.installationId };
      const operation = change.state === "registered"
        ? api.putUserPush(target, { silent: true })
        : api.deleteUserPush(target, { silent: true });
      // The request runner records a sanitized action outcome, without exposing the FID.
      void operation.catch(() => {});
    });
    if (api.getPushApproved() && Notification.permission === "granted") {
      void firebase.registerPush().catch(() => { /* Firebase records a sanitized error. */ });
    }
    return unsubscribe;
  }, [messaging, uid, sid]);

  useEffect(() => {
    if (messaging) {
      return onMessage(messaging, (payload) => {
        firebase.logPushEvent("foreground_received");
        enqueueSnackbar("fcm", {
          variant: "default",
          content: (key) => <DefaultSnackbar id={key} payload={payload} />,
        });
      });
    }
  }, [messaging, enqueueSnackbar]);

  return <></>;
}
