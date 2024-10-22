const { Sequelize } = require('sequelize');

// Create a new Sequelize instance connected to your MySQL database
const sequelize = new Sequelize('cbcs57706534_tracking', 'cbcs57706534_web', 'Badman@2024', {
  host: 'cp3.hostsilo.com',
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
