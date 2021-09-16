import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition: swaggerJSDoc.SwaggerDefinition = {
  swagger: '2.0',
  info: {
    version: '1.0.0',
    title: 'Upload service',
    description: 'AWS S3 pre-signed urls generator service',
  },
  schemes: ['http'],
  tags: [],
  basePath: '/',
};

const swaggerOptions: swaggerJSDoc.Options = {
  swaggerDefinition,
  apis: ['**/http/routes/**/*.ts'],
  explorer: true,
};

export const swaggerDocs = swaggerJSDoc(swaggerOptions);
