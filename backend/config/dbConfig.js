const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Mostrar el nombre de la base de datos en la consola
pool.connect()
    .then(client => {
        client.query('SELECT current_database()')
            .then(res => {
                console.log(`✅ Conectado a la base de datos: ${res.rows[0].current_database}`);
                client.release();
            })
            .catch(err => {
                console.error('❌ Error al obtener la base de datos:', err);
                client.release();
            });
    });
module.exports = pool;
