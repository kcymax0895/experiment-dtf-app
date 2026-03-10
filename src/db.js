import { openDB } from 'idb';

const DB_NAME = 'ExpLoggerDB_V4';
const DB_VERSION = 1;

export async function initDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('experiments')) {
                const store = db.createObjectStore('experiments', {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                store.createIndex('date', 'date');
                // We might want to filter by temp or rating later
                // It's easier to just fetch all and filter in memory for a prototype,
                // but let's create a basic index on date for sorting.
            }
        },
    });
}

export async function addExperiment(experiment) {
    const db = await initDB();
    return db.add('experiments', experiment);
}

export async function updateExperiment(experiment) {
    const db = await initDB();
    return db.put('experiments', experiment);
}

export async function getAllExperiments() {
    const db = await initDB();
    return db.getAllFromIndex('experiments', 'date'); // sorts by date ascending
}

export async function getExperiment(id) {
    const db = await initDB();
    return db.get('experiments', id);
}

export async function deleteExperiment(id) {
    const db = await initDB();
    return db.delete('experiments', id);
}

// Helper to get the most recent experiment for cloning
export async function getLatestExperiment() {
    const db = await initDB();
    const tx = db.transaction('experiments', 'readonly');
    const store = tx.objectStore('experiments');
    const index = store.index('date');
    const cursor = await index.openCursor(null, 'prev');
    return cursor ? cursor.value : null;
}
