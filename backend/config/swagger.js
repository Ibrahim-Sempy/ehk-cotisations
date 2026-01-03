const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Les Étoiles de Horè-Koubi',
      version: '1.0.0',
      description: 'API REST pour la gestion des cotisations de l\'association Les Étoiles de Horè-Koubi',
      contact: {
        name: 'Support API',
        email: 'support@ehk.com'
      },
    },
    servers: [
      {
        url: process.env.SERVER_URL || 'http://localhost:3000',
        description: 'Serveur de production',
      },
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js', './server.js'], // Chemin vers les fichiers de routes
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

