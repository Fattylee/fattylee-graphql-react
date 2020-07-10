const {
  GraphQLSchema,
  GraphQLString,
  GraphQLObjectType,
  GraphQLInt,
} = require("graphql");

const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
  },
});

const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve(parentArg, args) {
        return { id: 1, name: "fattylee", age: 12 };
      },
    },
  },
});

module.exports = new GraphQLSchema({ query: RootQuery });
