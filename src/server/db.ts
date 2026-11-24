import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  deleteDoc,
  setLogLevel,
  Firestore
} from "firebase/firestore";
import fs from "fs";
import path from "path";

setLogLevel("silent");

let db: Firestore | null = null;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } else {
    console.warn(
      "firebase-applet-config.json not found, falling back to memory layer",
    );
  }
} catch (e) {
  console.warn("Failed to initialize Firebase from config:", e);
}

// In-memory fallback if Firestore is missing
const memoryFallback = {
  draftRooms: new Map<string, unknown>(),
  miniLeagues: new Map<string, unknown>(),
};

function getCircularReplacer() {
  const seen = new WeakSet();
  return (key: string, value: unknown) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return undefined; // remove circular references
      }
      seen.add(value);
    }
    if (key === "bidTimer" || key === "draftTimer") {
      return undefined; // strip out NodeJS Timers
    }
    return value;
  };
}

function cleanData(data: unknown) {
  return JSON.parse(JSON.stringify(data, getCircularReplacer()));
}

export async function saveDraftRoom(id: string, roomData: unknown) {
  if (db) {
    try {
      await setDoc(doc(db, "draftRooms", id), cleanData(roomData));
    } catch (e) {
      console.error("Firebase saveDraftRoom err:", e);
    }
  } else {
    memoryFallback.draftRooms.set(id, cleanData(roomData));
  }
}

export async function loadDraftRooms(): Promise<Map<string, unknown>> {
  const map = new Map<string, unknown>();
  if (db) {
    try {
      const qs = await getDocs(collection(db, "draftRooms"));
      qs.forEach((doc) => {
        map.set(doc.id, doc.data());
      });
    } catch (e) {
      console.error("Firebase loadDraftRooms err:", e);
    }
  } else {
    for (const [id, data] of memoryFallback.draftRooms.entries()) {
      map.set(id, data);
    }
  }
  return map;
}

export async function deleteDraftRoomDb(id: string) {
  if (db) {
    try {
      await deleteDoc(doc(db, "draftRooms", id));
    } catch (e) {
      console.error("Firebase deleteDraftRoomDb err:", e);
    }
  } else {
    memoryFallback.draftRooms.delete(id);
  }
}

export async function saveMiniLeague(id: string, leagueData: unknown) {
  if (db) {
    try {
      await setDoc(doc(db, "miniLeagues", id), cleanData(leagueData));
    } catch (e) {
      console.error("Firebase saveMiniLeague err:", e);
    }
  } else {
    memoryFallback.miniLeagues.set(id, cleanData(leagueData));
  }
}

export async function loadMiniLeagues(): Promise<Map<string, unknown>> {
  const map = new Map<string, unknown>();
  if (db) {
    try {
      const qs = await getDocs(collection(db, "miniLeagues"));
      qs.forEach((doc) => {
        map.set(doc.id, doc.data());
      });
    } catch (e) {
      console.error("Firebase loadMiniLeagues err:", e);
    }
  } else {
    for (const [id, data] of memoryFallback.miniLeagues.entries()) {
      map.set(id, data);
    }
  }
  return map;
}

export async function deleteMiniLeagueDb(id: string) {
  if (db) {
    try {
      await deleteDoc(doc(db, "miniLeagues", id));
    } catch (e) {
      console.error("Firebase deleteMiniLeagueDb err:", e);
    }
  } else {
    memoryFallback.miniLeagues.delete(id);
  }
}
