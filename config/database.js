const { Sequelize } = require('sequelize');

// Create a new Sequelize instance connected to your MySQL database
const sequelize = new Sequelize('sql5737786', 'sql5737786', 'aLG7eV8ieR', {
  host: 'sql5.freesqldatabase.com',
  dialect: 'mysql', // use 'mysql' for MySQL
  logging: false,   // Disable logging SQL queries, set to true for debugging
});

// Test the MySQL connection
sequelize.authenticate()
  .then(() => {
    console.log('Connection to MySQL has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to MySQL:', err);
  });

module.exports = sequelize;
