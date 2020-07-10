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
        return global
          .fetch("http://localhost.com/3000/users/" + args.id)
          .then((res) => res.json());
      },
    },
    hello: {
      type: GraphQLString,
      args: { name: { type: GraphQLString } },
      resolve: (parentValue, args) => "Hello, " + args.name,
    },
  },
});

module.exports = new GraphQLSchema({ query: RootQuery });
