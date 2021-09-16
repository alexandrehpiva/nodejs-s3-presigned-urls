import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition: swaggerJSDoc.SwaggerDefinition = {
  // host: `${process.env.HOST}:${process.env.PORT}`,
  // openapi: '3.0.0',
  swagger: '2.0',
  info: {
    version: '1.0.0',
    title: 'Upload service',
    description: 'AWS S3 pre-signed urls generator service',
  },
  schemes: ['http'],
  tags: [],
  basePath: '/',

  // security: [
  //   {
  //     Bearer: [],
  //   },
  // ],
  // securityDefinitions: {
  //   Bearer: {
  //     description: "Please insert Auth token into header with prefix 'Bearer '",
  //     in: 'header',
  //     name: 'Authorization',
  //     type: 'apiKey',
  //   },
  // },
};

const swaggerOptions: swaggerJSDoc.Options = {
  swaggerDefinition,
  apis: ['**/http/routes/**/*.ts'],
  explorer: true,
};

export const swaggerDocs = swaggerJSDoc(swaggerOptions);
