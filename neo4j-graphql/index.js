const { makeAugmentedSchema, cypher } = require("neo4j-graphql-js");
const { ApolloServer } = require("apollo-server");
const neo4j = require("neo4j-driver");

const typeDefs = /* GraphQL */ `

  type Step {
      latitude: Float
      longitude: Float
  }

  type PointOfInterest {
    name: String
    location: Point
    type: String
    node_osm_id: Int
    tags: [String] @cypher(statement: """ 
    MATCH (this)-[:TAGS]->(t:OSMTags)
    RETURN keys(t)
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
  "bolt://100.26.227.192:35550",
  neo4j.auth.basic("neo4j", "radius-capacitances-spoon")
);

const server = new ApolloServer({ schema, context: { driver } });

server.listen(3003, "0.0.0.0").then(({ url }) => {
  console.log(`GraphQL ready at ${url}`);
});
