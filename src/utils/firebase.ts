// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import {
  deleteToken,
  getMessaging,
  getToken,
  Messaging,
} from "firebase/messaging";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAzQ_bR2dD4V1vdWoPViPXll6imyCajNCo",
  authDomain: "menkakusitsu-2d69d.firebaseapp.com",
  projectId: "menkakusitsu-2d69d",
  storageBucket: "menkakusitsu-2d69d.appspot.com",
  messagingSenderId: "382894730110",
  appId: "1:382894730110:web:ebf27b97399bec80c2612f",
  measurementId: "G-TE638S9GQ9",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
let messaging: Messaging | undefined;
try {
  messaging = getMessaging();
} catch (error) {
  console.error(`Error: Failed to initialize Firebase Messaging for ${error}`);
}

export const getFirebaseMessaging = () => {
  return messaging;
};

export const createPushToken = async (): Promise<string | null> => {
  if (messaging) {
    try {
      const token = await getToken(messaging, {
        vapidKey:
          "BG_LNhZiWNMNjuR-PTiY8pLm0SJ8itD0lVcEr3cRtkhBEOtzcDbiUVVQ3i5ZERbsmw5Q8kPDqJ1KpvvYF7nKcbk",
      });
      if (token) {
        return token;
      } else {
        return null;
      }
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  return null;
};

export const deletePushToken = async (): Promise<boolean> => {
  if (messaging) {
    try {
      const result = await deleteToken(messaging);
      return result;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
  return false;
};

export const logPageView = () => {
  logEvent(analytics, "screen_view", {
    firebase_screen: window.location.pathname,
    firebase_screen_class: window.location.pathname,
  });
  logEvent(analytics, "page_view", {
    page_title: window.location.pathname,
    page_location: window.location.pathname,
    page_path: window.location.pathname,
  });
};
