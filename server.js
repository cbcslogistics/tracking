const express = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database'); // Adjust path if necessary
const trackingRoutes = require('./routes/tracking'); // New MySQL-based tracking routes

// Initialize the app
const app = express();

// Body Parser Middleware
app.use(bodyParser.json());

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Tracking API',
      version: '1.0.0',
      description: 'API for tracking shipments and adding stopovers using MySQL',
      contact: {
        name: 'API Support',
      },
      servers: [{ url: 'http://localhost:3000' }],
    },
  },
  apis: ['./routes/tracking.js'],  // Path to API docs
};
// Automatic table creation/synchronization
sequelize.sync({ force: false })  // Set force: true to recreate tables every time (for development)
  .then(() => {
    console.log('Database synchronized successfully.');
  })
  .catch((err) => {
    console.error('Error synchronizing the database:', err);
  });
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes Middleware
app.use('/', trackingRoutes);

// Server Listening
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
