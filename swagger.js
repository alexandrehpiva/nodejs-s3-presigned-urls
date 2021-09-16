const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger_output.json';
const endpointsFiles = ['./src/http/Router.ts'];

swaggerAutogen(outputFile, endpointsFiles);
