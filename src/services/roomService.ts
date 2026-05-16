import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  getDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface RoomState {
  id: string;
  name: string;
  movieSlug: string;
  movieName: string;
  activeEpisodeSlug: string;
  activeEpisodeName: string;
  playbackState: 'playing' | 'paused';
  currentTime: number;
  lastUpdated: any;
  hostId: string;
  users: Record<string, { nickname: string; lastActive: any }>;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: any;
}

const ROOMS_COLLECTION = 'rooms';

export const roomService = {
  async createRoom(name: string, movieSlug: string, movieName: string, episodeSlug: string, episodeName: string) {
    if (!auth.currentUser) throw new Error("Must be signed in to create a room");
    
    const roomId = Math.random().toString(36).substring(2, 10);
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    
    const initialState: RoomState = {
      id: roomId,
      name,
      movieSlug,
      movieName,
      activeEpisodeSlug: episodeSlug,
      activeEpisodeName: episodeName,
      playbackState: 'paused',
      currentTime: 0,
      lastUpdated: serverTimestamp(),
      hostId: auth.currentUser.uid,
      users: {
        [auth.currentUser.uid]: {
          nickname: auth.currentUser.displayName || "Anonymous",
          lastActive: serverTimestamp()
        }
      }
    };
    
    await setDoc(roomRef, initialState);
    return roomId;
  },

  async joinRoom(roomId: string) {
    if (!auth.currentUser) throw new Error("Must be signed in to join a room");
    
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) throw new Error("Room not found");
    
    const userId = auth.currentUser.uid;
    const nickname = auth.currentUser.displayName || "Anonymous";
    
    await updateDoc(roomRef, {
      [`users.${userId}`]: {
        nickname,
        lastActive: serverTimestamp()
      }
    });
  },

  subscribeToRoom(roomId: string, callback: (room: RoomState) => void) {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    return onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as RoomState);
      }
    });
  },

  async updatePlayback(roomId: string, state: 'playing' | 'paused', currentTime: number) {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    await updateDoc(roomRef, {
      playbackState: state,
      currentTime,
      lastUpdated: serverTimestamp()
    });
  },

  async updateEpisode(roomId: string, episodeSlug: string, episodeName: string) {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    await updateDoc(roomRef, {
      activeEpisodeSlug: episodeSlug,
      activeEpisodeName: episodeName,
      playbackState: 'paused',
      currentTime: 0,
      lastUpdated: serverTimestamp()
    });
  },

  async sendMessage(roomId: string, text: string) {
    if (!auth.currentUser) return;
    
    const chatRef = collection(db, ROOMS_COLLECTION, roomId, 'chat');
    await addDoc(chatRef, {
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || "Anonymous",
      text,
      timestamp: serverTimestamp()
    });
  },

  subscribeToChat(roomId: string, callback: (messages: ChatMessage[]) => void) {
    const chatRef = collection(db, ROOMS_COLLECTION, roomId, 'chat');
    const q = query(chatRef, orderBy('timestamp', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];
      callback(messages);
    });
  }
};
