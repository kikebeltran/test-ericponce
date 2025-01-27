import {FirebaseApp, initializeApp} from "firebase/app";
import {
    getDatabase,
    ref,
    set,
    get,
    remove,
    update,
    Database, onValue, off, push,
    runTransaction,
} from "firebase/database";

const firebaseConfig = {
    apiKey: "changeme",
    authDomain: "changeme",
    databaseURL: "changeme",
    projectId: "changeme",
    storageBucket: "changeme",
    messagingSenderId: "changeme",
    appId: "changeme"
};

export default class FirebaseService {
    private readonly app: FirebaseApp;
    private readonly db: Database;

    constructor() {
        this.app = initializeApp(firebaseConfig);
        this.db = getDatabase(this.app);
    }

    public async read<T>(path: string): Promise<any> {
        try {
            const snapshot = await get(ref(this.db, path));
            if (snapshot.exists()) {
                return snapshot.val() as T;
            } else {
                console.log("No data available at path:", path);
                return null;
            }
        } catch (error) {
            console.error("Error reading from Firebase:", error);
            throw error;
        }
    }

    public async write(path: string, data: any): Promise<void> {
        try {
            await set(ref(this.db, path), data);
            console.log(`Data written successfully to ${path}`);
        } catch (error) {
            console.error("Error writing to Firebase:", error);
        }
    }

    public async update(path: string, data: any): Promise<void> {
        try {
            const dataRef = ref(this.db, path);
            await update(dataRef, data);
        } catch (error) {
            throw error;
        }
    }

    public async append(path: string, newData: any): Promise<void> {
        const dataRef = ref(this.db, path);

        await runTransaction(dataRef, (data) => {
            if (!Array.isArray(data)) {
                data = [];
            }

            // Append the new player to the array
            data.push(newData);

            return data; // Return the updated array to be written back to Firebase
        });
    }

    public subscribe<T>(path: string, callback: (data: T | null) => void): () => void {
        const roomRef = ref(this.db, path);

        const unsubscribe = onValue(roomRef, (snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.val() as T);
            } else {
                callback(null);
            }
        });

        // Return an unsubscribe function
        return () => off(roomRef, "value", unsubscribe);
    }

    public async deleteData(path: string): Promise<void> {
        try {
            await remove(ref(this.db, path));
            console.log(`Data deleted successfully from ${path}`);
        } catch (error) {
            console.error("Error deleting from Firebase:", error);
        }
    }
}
