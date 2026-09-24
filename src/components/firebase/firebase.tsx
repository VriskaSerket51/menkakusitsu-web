// Import the functions you need from the SDKs you need
import { onMessage } from "firebase/messaging";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";

import { DefaultSnackbar } from "@/components/snackbar/default";
import * as firebase from "@/utils/firebase.client";

export function FirebaseComponent() {
  const [messaging] = useState(firebase.getFirebaseMessaging());
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (messaging) {
      onMessage(messaging, (payload) => {
        enqueueSnackbar("fcm", {
          variant: "default",
          content: (key) => <DefaultSnackbar id={key} payload={payload} />,
        });
      });
    }
  }, [messaging, enqueueSnackbar]);

  return <></>;
}
