const { gql } = require('graphql-tag');

const typeDefs = gql`
  type Checkpoint {
    id: Int
    name: String
    area: String
    latitude: Float
    longitude: Float
    current_status: String
    created_at: String
  }

  type Incident {
    id: Int
    title: String
    description: String
    incident_type: String
    severity: String
    status: String
    area: String
    latitude: Float
    longitude: Float
    created_at: String
  }

  type Report {
    id: Int
    title: String
    description: String
    location: String
    category: String
    status: String
    created_at: String
  }

  type Query {
    checkpoints(area: String, current_status: String): [Checkpoint]
    checkpoint(id: Int!): Checkpoint
    incidents(incident_type: String, severity: String, status: String): [Incident]
    incident(id: Int!): Incident
    reports(category: String, status: String): [Report]
    report(id: Int!): Report
  }
`;

module.exports = typeDefs;
