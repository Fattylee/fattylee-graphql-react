const {
  graphql,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} = require("graphql");
const { default: Axios } = require("axios");
const express = require("express");
const axios = Axios.create({ baseURL: "http://localhost:3000" });

const User = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    firstName: { type: GraphQLNonNull(GraphQLID) },
    age: { type: GraphQLInt },
    books: {
      type: GraphQLList(GraphQLNonNull(Book)),
      resolve: (parent) =>
        axios.get(`users/${parent.id}/books`).then((res) => res.data),
    },
  }),
});

const Book = new GraphQLObjectType({
  name: "Book",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    title: { type: GraphQLNonNull(GraphQLID) },
    author: {
      type: GraphQLNonNull(User),
      resolve(parent) {
        return axios.get(`authors/${parent.authorId}`).then((res) => res.data);
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
    authors: {
      type: GraphQLList(GraphQLNonNull(User)),
      resolve() {
        return axios.get("authors").then((res) => res.data);
      },
    },
    author: {
      type: User,
      args: { id: { type: GraphQLNonNull(GraphQLID) } },
      resolve(_, { id }) {
        return axios.get("authors/" + id).then((res) => res.data);
      },
    },
  }),
});

const RootMutation = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    createAuthor: {
      type: GraphQLNonNull(User),
      args: {
        firstName: { type: GraphQLNonNull(GraphQLString) },
        age: { type: GraphQLInt },
      },
      resolve(_, args) {
        return axios.post("authors", args).then((res) => res.data);
      },
    },
    deleteAuthor: {
      type: User,
      args: { id: { type: GraphQLNonNull(GraphQLID) } },
      resolve(_, { id }) {
        return axios.delete("authors/" + id).then((res) => res.data);
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});

// #
// #  query FetchUsers {
// #    author(id:"5844a41e-18bd-42da-93c5-e5d90449015a"){
// #      id
// #      firstName
// #      age
// #    }

//     #/ deleteAuthor{
//     #  id
//     #}
// #  }

let query = `
mutation DeleteMutation {
  createAuthor(firstName:"next lane") {
    id
    firstName
    age
  }
  deleteAuthor(id:"NshPtp5"){
    id
    firstName
    age
  }
}
`;

graphql(schema, query)
  .then((data) => {
    console.log(JSON.stringify(data, null, 1));
  })
  .catch((err) => {
    console.log(err);
  });
