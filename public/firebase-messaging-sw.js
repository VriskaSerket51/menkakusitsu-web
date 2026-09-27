// Local workers must not contact Firebase unless push was explicitly enabled.
const localHost = /^(localhost|.*\.localhost|.*\.local|\[?::1\]?|0\.0\.0\.0|127(?:\.\d{1,3}){3}|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})$/i.test(self.location.hostname);
const explicitlyEnabled = new URL(self.location.href).searchParams.get("firebase") === "enabled";
if (!localHost || explicitlyEnabled) {
  try {
      importScripts("https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js");
      importScripts(
          "https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js"
      );

      firebase.initializeApp({
          apiKey: "AIzaSyAzQ_bR2dD4V1vdWoPViPXll6imyCajNCo",
          authDomain: "menkakusitsu-2d69d.firebaseapp.com",
          projectId: "menkakusitsu-2d69d",
          storageBucket: "menkakusitsu-2d69d.appspot.com",
          messagingSenderId: "382894730110",
          appId: "1:382894730110:web:ebf27b97399bec80c2612f",
          measurementId: "G-TE638S9GQ9",
      });

      const messaging = firebase.messaging();
  } catch (error) {
      console.log(`Error: ${error}`);
  }

}
