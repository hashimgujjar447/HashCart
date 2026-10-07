import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Auth Service API',
    description: 'Auth Service API Documentation',
    version: '1.0.0',
  },
  host: 'localhost:6001',
  schemes: ['http'],
};

const outputFile = './swagger-output.json';

const endpointsFiles = ['./routes/auth.route.ts'];

swaggerAutogen(outputFile, endpointsFiles, doc);
