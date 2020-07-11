const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
} = require("graphql");
const app = express();

const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    id: { type: GraphQLInt },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
  },
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    hello: {
      type: GraphQLInt,
      args: { name: { type: GraphQLString } },
      resolve: (parentValue, args) => `Hello, ${args.name}`,
    },
    users: {
      type: UserType,
      args: { id: { type: GraphQLString, defaultValue: "jdjs" } },
      resolve: (parentValue, args) => ({
        id: "1",
        firstName: args.id,
        age: 21,
      }),
    },
  },
});
const graphqlSchema = new GraphQLSchema({ query: RootQuery });
app.use("/graphql", new graphqlHTTP({ graphiql: true, schema: graphqlSchema }));
app.listen(5000, () => console.log("Server is up on 5000"));
