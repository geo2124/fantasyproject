import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

import firebaseConfig from "../../firebase-applet-config.json";

let app;
let auth;
let provider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
} catch (e) {
  console.warn("Failed to init firebase client", e);
}

export { app, auth, provider };
