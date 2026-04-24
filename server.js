require('dotenv').config();

const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const typeDefs = require('./src/graphql/schema');
const resolvers = require('./src/graphql/resolvers');

const app = express();
const db = require('./src/config/db');

const setupSwagger = require('./src/swagger');

const checkpointRoutes = require('./src/routes/checkpointRoutes');
const incidentRoutes = require('./src/routes/incidentRoutes');
const authRoutes = require('./src/routes/authRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const mobilityRoutes = require('./src/routes/mobilityRoutes');
const alertRoutes = require('./src/routes/alertRoutes');
const subscriptionRoutes = require('./src/routes/subscriptionRoutes');
const weatherRoutes = require('./src/routes/weatherRoutes');

app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/checkpoints', checkpointRoutes);
app.use('/api/v1/incidents', incidentRoutes);
app.use('/api/v1/mobility', mobilityRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/weather', weatherRoutes);

setupSwagger(app);

const PORT = 3000;

async function startServer() {
  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  await apolloServer.start();

  app.use('/graphql', expressMiddleware(apolloServer));

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`GraphQL available at http://localhost:${PORT}/graphql`);
  });
}

startServer();