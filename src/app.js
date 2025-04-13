require('dotenv').config();
const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const authRoutes = require('./routes/auth-routes');
const dataRoutes = require('./routes/data-routes');

const app = express();
app.use(express.json());

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Mi Proyecto',
      version: '1.0.0',
      description: 'Documentación de la API para gestión de usuarios y items',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Servidor local' },
    ],
    components: {
      schemas: {
        Item: {
          type: 'object',
          properties: {
            id: { type: 'string', readOnly: true },
            nombre: { type: 'string' },
            descripcion: { type: 'string' },
            precio: { type: 'number' },
            categoria: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time', readOnly: true },
            createdBy: { type: 'string', readOnly: true }
          },
          example: {
            nombre: "Producto de ejemplo",
            descripcion: "Descripción del producto",
            precio: 19.99,
            categoria: "electrónica"
          }
        },
        User: {
          type: 'object',
          properties: {
            uid: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['user', 'admin'], default: 'user' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: { $ref: '#/components/schemas/User' }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Introduce el token JWT obtenido en /auth/login. Formato: Bearer <token>'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Configura Swagger UI con opciones personalizadas
const swaggerUiOptions = {
  swaggerOptions: {
    persistAuthorization: true, // Mantiene el token entre recargas
    docExpansion: 'none' // Controla cómo se expanden los docs
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

app.use('/auth', authRoutes);
app.use('/api', dataRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`Documentación Swagger en http://localhost:${PORT}/api-docs`);
});