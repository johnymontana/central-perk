const { makeAugmentedSchema, cypher } = require("neo4j-graphql-js");
const { ApolloServer } = require("apollo-server");
const neo4j = require("neo4j-driver");
require('dotenv').config()

const typeDefs = /* GraphQL */ `

  type Step {
      latitude: Float
      longitude: Float
  }

  type Tag {
    key: String
    value: String
  }

  type PointOfInterest {
    name: String
    location: Point
    type: String
    node_osm_id: ID!
    tags: [Tag] @cypher(statement: """ 
    MATCH (this)-[:TAGS]->(t:OSMTags)
    UNWIND keys(t) AS key
    RETURN {key: key, value: t[key]}
    """)
    routeToPOI(poi: Int!): [Step] @cypher(${cypher`
    MATCH (other:PointOfInterest {node_osm_id: $poi})
    MATCH p=shortestPath( (this)-[:ROUTE*..200]-(other) )
    UNWIND nodes(p) AS n
    RETURN {latitude: n.location.latitude, longitude: n.location.longitude} AS route
    `})
  }
`;

const schema = makeAugmentedSchema({ typeDefs });

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

const server = new ApolloServer({ schema, context: { driver } });

server.listen(3003, "0.0.0.0").then(({ url }) => {
  console.log(`GraphQL ready at ${url}`);
});
