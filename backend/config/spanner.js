const { Spanner } = require("@google-cloud/spanner");
const dotenv = require("dotenv");

dotenv.config();

const spanner = new Spanner({
    projectId: process.env.SPANNER_PROJECT_ID,
});

const instance = spanner.instance(process.env.SPANNER_INSTANCE_ID);
const database = instance.database(process.env.SPANNER_DATABASE_ID);

module.exports = database;