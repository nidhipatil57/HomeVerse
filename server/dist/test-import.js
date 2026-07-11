"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mock_db_seed_1 = require("../src/data/mock-db-seed");
try {
    const db = (0, mock_db_seed_1.getInitialDb)();
    console.log("✅ Import successful! Users count:", db.users.length);
}
catch (error) {
    console.error("❌ Import failed:", error);
}
