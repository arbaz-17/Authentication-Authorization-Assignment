import { sqlite } from "./index.js";

const tables = sqlite
  .prepare(
    `SELECT name
     FROM sqlite_master
     WHERE type = 'table'
       AND name IN ('users', 'sessions', 'resources')
     ORDER BY name`
  )
  .all();

console.log("Database tables:");
console.table(tables);

console.log(
  "Foreign keys enabled:",
  sqlite.pragma("foreign_keys", { simple: true })
);

console.log("Session foreign keys:");
console.table(
  sqlite.pragma("foreign_key_list(sessions)")
);

console.log("Resource foreign keys:");
console.table(
  sqlite.pragma("foreign_key_list(resources)")
);

sqlite.close();