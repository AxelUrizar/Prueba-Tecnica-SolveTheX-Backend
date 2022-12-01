import knex, { Knex } from 'knex';

const connectedKnex: Knex = knex({
    client: "sqlite3",
    connection: {
        filename: "db.sqlite3"
    }
});

module.exports = connectedKnex;