const { makeAugmentedSchema, cypher } = require("neo4j-graphql-js");
const { ApolloServer } = require("apollo-server");
const neo4j = require("neo4j-driver");
const axios = require("axios")

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
    wikipedia: String @cypher(statement: """ 
      MATCH (this)-->(t:OSMTags)
      WHERE EXISTS(t.wikipedia) WITH t LIMIT 1
      CALL apoc.load.json('https://en.wikipedia.org/w/api.php?action=parse&prop=text&formatversion=2&format=json&page=' + apoc.text.urlencode(t.wikipedia)) YIELD value
      RETURN value.parse.text
    """)
    photos(first: Int = 10, radius: Int = 100): [String] @neo4j_ignore
    tags: [Tag] @cypher(statement: """ 
    MATCH (this)-->(t:OSMTags)
    UNWIND keys(t) AS key
    RETURN {key: key, value: t[key]} AS tag
    """)
    routeToPOI(poi: Int!): [Step] @cypher(${cypher`
    MATCH (other:PointOfInterest {node_osm_id: $poi})
    MATCH p=shortestPath( (this)-[:ROUTE*..200]-(other) )
    UNWIND nodes(p) AS n
    RETURN {latitude: n.location.latitude, longitude: n.location.longitude} AS route
    `})
  }
`;

const resolvers = {
  PointOfInterest: {
    photos: async (poi, args) => {
      const requestURL = `https://a.mapillary.com/v3/images?client_id=${process.env.MAPILLARY_KEY}&lookat=${poi.location.longitude},${poi.location.latitude}&closeto=${poi.location.longitude},${poi.location.latitude}&radius=${args.radius}&per_page=${args.first}`
      const response = await axios.get(requestURL)
      const features = response.data.features

      return features.map((v) => {
        return `https://images.mapillary.com/${v.properties.key}/thumb-640.jpg`
      })
    }
  }
}

const schema = makeAugmentedSchema({ typeDefs, resolvers });

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

const server = new ApolloServer({ schema, context: { driver } });

server.listen(3003, "0.0.0.0").then(({ url }) => {
  console.log(`GraphQL ready at ${url}`);
});
