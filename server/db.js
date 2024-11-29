const fs = require('fs');
const Sequelize = require('sequelize');

const db =  new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',

  ssl: {
    rejectUnauthorized: false,
    ca: fs.readFileSync('../server/server.crt').toString()
  }
});

module.exports = db;