const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: '🗺️ Wasel Palestine API',
    version: '1.0.0',
    description: 'Smart Mobility & Checkpoint Intelligence Platform API Documentation.',
  },
  servers: [{ url: 'http://localhost:3000/api/v1', description: 'Local Server' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  paths: {
    
    //  AUTHENTICATION [A1.1 - A1.4]
    
    '/auth/register': {
      post: {
        tags: ['🔐 Authentication'],
        summary: '[A1.1] Register User',
        requestBody: {
          content: { 'application/json': { 
            examples: {
              'Ready-made example': { value: { full_name: 'Zainab Qanaze', email: 'zainab@test.com', password: 'zainab123' } },
              'Try it yourself': { value: { full_name: '', email: '', password: '' } }
            }
          } }
        },
        responses: { 201: { description: 'Success' } }
      }
    },
    '/auth/login': {
      post: {
        tags: ['🔐 Authentication'],
        summary: '[A1.2] Login',
        requestBody: {
          content: { 'application/json': { 
            examples: {
              'Ready-made example': { value: { email: 'zainab@test.com', password: 'zainab123' } },
              'Try it yourself': { value: { email: '', password: '' } }
            }
          } }
        },
        responses: { 200: { description: 'Success' } }
      }
    },
    '/auth/refresh': {
      post: {
        tags: ['🔐 Authentication'],
        summary: '[A1.3] Refresh Token',
        requestBody: { content: { 'application/json': { examples: {
          'Ready-made example': { value: { refresh_token: 'PASTE_YOUR_REFRESH_TOKEN' } },
          'Try it yourself': { value: { refresh_token: '' } }
        } } } },
        responses: { 200: { description: 'Success' } }
      }
    },
    '/auth/logout': {
      post: {
        tags: ['🔐 Authentication'],
        summary: '[A1.4] Logout',
        security: [{ bearerAuth: [] }],
        requestBody: { content: { 'application/json': { examples: {
          'Ready-made example': { value: { refresh_token: 'PASTE_YOUR_REFRESH_TOKEN' } },
          'Try it yourself': { value: { refresh_token: '' } }
        } } } },
        responses: { 200: { description: 'Success' } }
      }
    },

    
    //  CHECKPOINTS [F1.1 - F1.4]
    
    '/checkpoints': {
      get: {
        tags: ['🚧 Checkpoints'],
        summary: '[F1.1] Get All Checkpoints',
        parameters: [
          { name: 'area', in: 'query', schema: { type: 'string' }, example: 'Nablus' },
          { name: 'current_status', in: 'query', schema: { type: 'string', enum: ['open', 'delayed', 'closed', 'hazard'] } },
          { name: 'page', in: 'query', schema: { type: 'integer' }, example: 1, description: 'Page number (default: 1)' },
          { name: 'limit', in: 'query', schema: { type: 'integer' }, example: 10, description: 'Items per page (default: 10, max: 100)' },
          { name: 'sort_by', in: 'query', schema: { type: 'string', enum: ['name', 'area', 'created_at', 'updated_at', 'current_status'] }, description: 'Field to sort by' },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['ASC', 'DESC'] }, description: 'Sort order' }
        ],
        responses: { 200: { description: 'Success' } }
      },
      post: {
        tags: ['🚧 Checkpoints'],
        summary: '[F1.3] Create Checkpoint',
        security: [{ bearerAuth: [] }],
        requestBody: { content: { 'application/json': { examples: {
          'Ready-made example': { value: { name: 'حاجز قلنديا', area: 'Ramallah', latitude: 31.8, longitude: 35.2 } },
          'Try it yourself': { value: { name: '', area: '', latitude: null, longitude: null } }
        } } } },
        responses: { 201: { description: 'Success' } }
      }
    },
    '/checkpoints/{id}': {
      get: { tags: ['🚧 Checkpoints'], summary: '[F1.2] Get Checkpoint Details', parameters: [{ name: 'id', in: 'path', required: true, example: 1 }], responses: { 200: { description: 'Success' } } }
    },
    '/checkpoints/{id}/status': {
      patch: {
        tags: ['🚧 Checkpoints'],
        summary: '[F1.4] Update Status',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, example: 1 }],
        requestBody: { content: { 'application/json': { examples: {
          'Ready-made example': { value: { current_status: 'closed' } },
          'Try it yourself': { value: { current_status: '' } }
        } } } },
        responses: { 200: { description: 'Success' } }
      }
    },

    
    //  INCIDENTS [F1.5 - F1.10]
    
    '/incidents': {
      get: {
        tags: ['🚨 Incidents'],
        summary: '[F1.5] Get All Incidents',
        parameters: [
          { name: 'incident_type', in: 'query', schema: { type: 'string', enum: ['closure', 'delay', 'accident', 'weather_hazard', 'other'] }, description: 'Filter by incident type' },
          { name: 'severity', in: 'query', schema: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] }, description: 'Filter by severity' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['open', 'verified', 'closed'] }, description: 'Filter by status' },
          { name: 'checkpoint_id', in: 'query', schema: { type: 'integer' }, example: 1, description: 'Filter by checkpoint' },
          { name: 'page', in: 'query', schema: { type: 'integer' }, example: 1, description: 'Page number (default: 1)' },
          { name: 'limit', in: 'query', schema: { type: 'integer' }, example: 10, description: 'Items per page (default: 10)' },
          { name: 'sort_by', in: 'query', schema: { type: 'string', enum: ['created_at', 'updated_at', 'severity', 'incident_type', 'status'] }, description: 'Field to sort by' },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['ASC', 'DESC'] }, description: 'Sort order' }
        ],
        responses: { 200: { description: 'Success' } }
      },
      post: {
        tags: ['🚨 Incidents'],
        summary: '[F1.7] Log Incident',
        security: [{ bearerAuth: [] }],
        requestBody: { content: { 'application/json': { examples: {
          'Ready-made example': { value: { checkpoint_id: 1, title: 'إغلاق مفاجئ', description: 'بسبب الأحوال الجوية', incident_type: 'weather_hazard', severity: 'high' } },
          'Try it yourself': { value: { checkpoint_id: null, title: '', description: '', incident_type: '', severity: '' } }
        } } } },
        responses: { 201: { description: 'Success' } }
      }
    },
    '/incidents/{id}': {
      get: { tags: ['🚨 Incidents'], summary: '[F1.6] Get Incident', parameters: [{ name: 'id', in: 'path', required: true, example: 1 }], responses: { 200: { description: 'Success' } } },
      patch: {
        tags: ['🚨 Incidents'],
        summary: '[F1.8] Update Incident',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, example: 1 }],
        requestBody: { content: { 'application/json': { examples: {
          'Ready-made example': { value: { severity: 'critical', description: 'تحديث جديد' } },
          'Try it yourself': { value: { severity: '', description: '' } }
        } } } },
        responses: { 200: { description: 'Success' } }
      },
      delete: { tags: ['🚨 Incidents'], summary: '[F1.10] Delete Incident', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, example: 1 }], responses: { 200: { description: 'Success' } } }
    },
    '/incidents/{id}/status': {
      patch: {
        tags: ['🚨 Incidents'],
        summary: '[F1.9] Verify Incident Status',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, example: 1 }],
        requestBody: { content: { 'application/json': { examples: {
          'Ready-made example': { value: { status: 'verified' } },
          'Try it yourself': { value: { status: '' } }
        } } } },
        responses: { 200: { description: 'Success' } }
      }
    },

    
    //  REPORTS [F2.1 - F2.8]
    
    '/reports': {
      get: {
        tags: ['📝 Reports'],
        summary: '[F2.1] Get All Reports',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string', enum: ['checkpoint', 'accident', 'closure', 'delay', 'weather', 'other'] }, description: 'Filter by category' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'in_progress', 'resolved'] }, description: 'Filter by status' }
        ],
        responses: { 200: { description: 'Success' } }
      },
      post: {
        tags: ['📝 Reports'],
        summary: '[F2.3] Submit Citizen Report',
        security: [{ bearerAuth: [] }],
        requestBody: { content: { 'application/json': { examples: {
          'Ready-made example': { value: { title: 'أزمة خانقة', description: 'يوجد أزمة على المدخل', location: 'Nablus', category: 'delay', latitude: 32.152, longitude: 35.262 } },
          'Try it yourself': { value: { title: '', description: '', location: '', category: '', latitude: null, longitude: null } }
        } } } },
        responses: { 201: { description: 'Success' } }
      }
    },
    '/reports/{id}': {
      get: { tags: ['📝 Reports'], summary: '[F2.2] Get Report Details', parameters: [{ name: 'id', in: 'path', required: true, example: 1 }], responses: { 200: { description: 'Success' } } },
      delete: { tags: ['📝 Reports'], summary: '[F2.8] Delete Report', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, example: 1 }], responses: { 200: { description: 'Success' } } }
    },
    '/reports/{id}/vote': {
      post: {
        tags: ['📝 Reports'],
        summary: '[F2.4] Vote on Credibility',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, example: 1 }],
        requestBody: { content: { 'application/json': { examples: {
          'Ready-made example': { value: { vote_type: 'up' } },
          'Try it yourself': { value: { vote_type: '' } }
        } } } },
        responses: { 200: { description: 'Success' } }
      }
    },
    '/reports/{id}/votes': { get: { tags: ['📝 Reports'], summary: '[F2.5] Get Vote Analysis', parameters: [{ name: 'id', in: 'path', required: true, example: 1 }], responses: { 200: { description: 'Success' } } } },
    '/reports/{id}/status': {
      put: {
        tags: ['📝 Reports'],
        summary: '[F2.6] Update Report Status',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, example: 1 }],
        requestBody: { content: { 'application/json': { examples: {
          'Ready-made example': { value: { status: 'resolved' } },
          'Try it yourself': { value: { status: '' } }
        } } } },
        responses: { 200: { description: 'Success' } }
      }
    },
    '/reports/{id}/history': { get: { tags: ['📝 Reports'], summary: '[F2.7] View Audit Log', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, example: 1 }], responses: { 200: { description: 'Success' } } } },

   
    //  ALERTS & SUBS [F4.1 - F4.4]
    
    '/alerts': { get: { tags: ['🔔 Alerts'], summary: '[F4.1] Get My Inbox', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Success' } } } },
    '/alerts/{id}/read': { put: { tags: ['🔔 Alerts'], summary: '[F4.2] Mark as Read', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, example: 1 }], responses: { 200: { description: 'Success' } } } },
    '/subscriptions': {
      post: {
        tags: ['📬 Subscriptions'],
        summary: '[F4.3] Create Subscription',
        security: [{ bearerAuth: [] }],
        requestBody: { content: { 'application/json': { examples: {
          'Ready-made example': { value: { area: 'نابلس', incident_type: 'closure' } },
          'Subscribe to all areas': { value: { area: null, incident_type: 'delay' } },
          'Subscribe to everything': { value: { area: null, incident_type: null } },
          'Try it yourself': { value: { area: '', incident_type: '' } }
        } } } },
        responses: { 201: { description: 'Success' } }
      },
      delete: {
        tags: ['📬 Subscriptions'],
        summary: '[F4.4] Delete Subscription',
        security: [{ bearerAuth: [] }],
        requestBody: { content: { 'application/json': { examples: {
          'Ready-made example': { value: { area: 'نابلس', incident_type: 'closure' } },
          'Try it yourself': { value: { area: '', incident_type: '' } }
        } } } },
        responses: { 200: { description: 'Success' } }
      }
    },

    '/mobility/estimate-route': {
      get: {
        tags: ['🟡 Mobility'],
        summary: '[F3.1] Estimate Route',
        parameters: [
          { name: 'origin', in: 'query', required: true, schema: { type: 'string' }, example: 'Nablus, Palestine', description: 'City name, checkpoint name, or landmark' },
          { name: 'destination', in: 'query', required: true, schema: { type: 'string' }, example: 'Ramallah, Palestine', description: 'City name, checkpoint name, or landmark' }
        ],
        responses: { 200: { description: 'Success' } }
      }
    },
    '/weather': { get: { tags: ['🌤️ Weather'], summary: '[E1.1] Get Weather by City', parameters: [{ name: 'city', in: 'query', required: true, schema: { type: 'string' }, example: 'Nablus' }], responses: { 200: { description: 'Success' } } } },
    '/weather/checkpoint/{id}': { get: { tags: ['🌤️ Weather'], summary: '[E1.2] Get Weather at Checkpoint', parameters: [{ name: 'id', in: 'path', required: true, example: 1, description: 'Checkpoint ID' }], responses: { 200: { description: 'Success' } } } },
    '/weather/incident/{id}': { get: { tags: ['🌤️ Weather'], summary: '[E1.3] Get Weather at Incident', parameters: [{ name: 'id', in: 'path', required: true, example: 1, description: 'Incident ID' }], responses: { 200: { description: 'Success' } } } },
    '/graphql': {
      post: {
        tags: ['🔮 GraphQL'],
        summary: '[G1.1] Execute GraphQL Query',
        requestBody: { content: { 'application/json': { examples: {
          'Get all incidents': { value: { query: '{ incidents { id title severity status area } }' } },
          'Filter by severity': { value: { query: '{ incidents(severity: "critical") { id title area } }' } },
          'Get all checkpoints': { value: { query: '{ checkpoints { id name area current_status } }' } },
          'Filter checkpoints by area': { value: { query: '{ checkpoints(area: "نابلس") { id name current_status } }' } },
          'Get all reports': { value: { query: '{ reports { id title category status } }' } },
          'Get single incident': { value: { query: '{ incident(id: 1) { id title description severity status } }' } },
          'Combined query': { value: { query: '{ incidents { id title severity } checkpoints { name current_status } }' } },
          'Try it yourself': { value: { query: '' } }
        } } } },
        responses: { 200: { description: 'Success' } }
      }
    }
  }
};

const customCss = `
  .swagger-ui .topbar { display: none }
  .swagger-ui .curl-command { display: none !important }
  .swagger-ui .request-url { display: none !important }
  .swagger-ui .response-headers { display: none !important }
  .swagger-ui .download-contents { display: none !important }
  .swagger-ui .content-type { display: none !important }
  .swagger-ui section.models { display: none !important }
  .swagger-ui .responses-table .response-col_links { display: none !important }
`;

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customCss: customCss,
    swaggerOptions: { docExpansion: 'list', defaultModelsExpandDepth: -1, tryItOutEnabled: true }
  }));
}

module.exports = setupSwagger;