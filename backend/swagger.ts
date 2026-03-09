import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Connect Web App REST API',
      version: '1.0.0',
      description: 'A REST API for Connect, a social media web app',
      contact: {
        name: 'Yael Abbo and Yishai Chen',
        email: 'yaelabbo@gmail.com',
      },
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64abc123def4567890ghijk1' },
            username: { type: 'string', example: 'yael abbo' },
            email: { type: 'string', format: 'email', example: 'yishaichen@gmail.com' },
            photoUrl: {
              type: 'string',
              example: 'http://localhost:3000/public/uploads/profiles/avatar.jpg',
            },
            googleId: { type: 'string', example: '1234567890' },
          },
        },
        Post: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64abc123def4567890ghijk2' },
            content: { type: 'string', example: 'First Post!' },
            photoUrl: {
              type: 'string',
              example: 'http://localhost:3000/public/uploads/posts/photo.jpg',
            },
            senderId: { type: 'string', example: '64abc123def4567890ghijk1' },
            likes: { type: 'array', items: { type: 'string' }, example: [] },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64abc123def4567890ghijk3' },
            content: { type: 'string', example: 'Nice post!' },
            postId: { type: 'string', example: '64abc123def4567890ghijk2' },
            senderId: { type: 'string', example: '64abc123def4567890ghijk1' },
          },
        },
        AuthTokens: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            refreshToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: { type: 'integer', example: 400 },
            message: { type: 'string', example: 'An error occurred' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.ts'],
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
