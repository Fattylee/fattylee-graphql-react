// const { graphql } = require("react-apollo");
const _axios = require("axios");
const express = require("express");

const axios = _axios.create({ baseURL: "http://localhost:3000" });
const {
  graphql,
  GraphQLSchema,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLObjectType,
  GraphQLInputObjectType,
} = require("graphql");
const { graphqlHTTP } = require("express-graphql");

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLNonNull(GraphQLString) },
    company: {
      type: GraphQLNonNull(CompanyType),
      resolve(parent) {
        return axios
          .get(`/companies/${parent.companyId}`)
          .then((res) => res.data);
      },
    },
  }),
});
const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLNonNull(GraphQLString) },
    employees: {
      type: GraphQLList(GraphQLNonNull(UserType)),
      resolve(parent) {
        return axios
          .get("/companies/" + parent.id + "/users")
          .then((res) => res.data);
      },
    },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
    users: {
      type: GraphQLNonNull(GraphQLList(UserType)),
      resolve() {
        return axios.get("users").then((res) => res.data);
      },
    },
    user: {
      type: GraphQLNonNull(UserType),
      args: { id: { type: GraphQLNonNull(GraphQLID) } },
      resolve(_, { id }) {
        return axios.get("users/" + id).then((res) => res.data);
      },
    },
    company: {
      type: GraphQLNonNull(CompanyType),
      args: { id: { type: GraphQLNonNull(GraphQLID) } },
      resolve(_, { id }) {
        return axios.get("companies/" + id).then((res) => res.data);
      },
    },
    companies: {
      type: GraphQLNonNull(GraphQLList(CompanyType)),
      resolve() {
        return axios.get("companies").then((res) => res.data);
      },
    },
  }),
});

// const CompanyTypeInput = new GraphQLInputObjectType({
//   name: "mama",
//   args: {
//     name: { type: GraphQLNonNull(GraphQLString) },
//     description: { type: GraphQLNonNull(GraphQLString) },
//   },
// });
const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  fields() {
    return {
      createCompany: {
        type: GraphQLNonNull(CompanyType),
        args: {
          name: { type: GraphQLNonNull(GraphQLString) },
          description: { type: GraphQLNonNull(GraphQLString) },
        },
        resolve(_, args) {
          return axios.post("companies", args).then((res) => res.data);
        },
      },
      deleteCompany: {
        type: GraphQLNonNull(GraphQLBoolean),
        args: { id: { type: GraphQLNonNull(GraphQLID) } },
        resolve: (_, { id }) =>
          axios.delete("companies/" + id).then((res) => true),
      },
    };
  },
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

let query = `
  query {
    users{
      id
      name
      email
      company{
        id
        name
        description
      }
    }
    companies{
      id
      name
      description
    }
    baba:companies{
      id
      name
      employees{
        id
        name
      }
    }
  }
`;
query = `
  query findUser {
    user(id:3){
      id
      name
      email
      company{
        id
        name
      }
    }
    company(id:1){
      id
      name
      description
      employees{
        id
        name
      }
    }
  }
`;
query = `
  mutation {
    createCompany(name:"huda tv",description:"islamic knowledge") {
      id
      name
      description
      employees{
        id
        name
      }
    }
  }
`;
// runQuery();

query = `
  mutation {
    deleteCompany(id:8)
  }
`;
runQuery();
function runQuery() {
  graphql(schema, query)
    .then((res) => {
      console.log(JSON.stringify(res, null, 2));
    })
    .catch((er) => {
      console.log(er);
    });
}

const app = express();
app.use("/graphql", graphqlHTTP({ graphiql: true, schema }));
const port = process.env.PORT || 5200;
app.listen(port, console.log("Server up on port", port));
