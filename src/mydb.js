import Dexie from 'https://cdn.skypack.dev/dexie'

const db = new Dexie('myDb');
db.version(1).stores({
    friends: `name, age`
});

export default db;