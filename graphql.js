const _axios = require("axios");
const { v4: uuid } = require("uuid");
const _ = require("lodash");
const {
  GraphQLSchema,
  GraphQLString,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList,
} = require("graphql");

const axios = _axios.create({
  baseURL: "http://localhost:3000/",
  timeout: 1000,
  // headers: {'X-Custom-Header': 'foobar'}
});

// const books = [
//   { id: "1", title: "book 1", authorId: "2" },
//   { id: "2", title: "book 2", authorId: "2" },
//   { id: "3", title: "book 3", authorId: "1" },
//   { id: "4", title: "book 4", authorId: "3" },
//   { id: "4", title: "book 4", authorId: "3" },
// ];

// const users = [
//   { id: "1", name: "abu lulu", age: 101 },
//   { id: "2", name: "ummu abdillah", age: 55 },
//   { id: "3", name: "abdullah ibn AbdulFattah", age: 01 },
// ];

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    age: { type: new GraphQLNonNull(GraphQLInt) },
    books: {
      type: new GraphQLList(new GraphQLNonNull(BookType)),
      resolve: async (parent) => {
        const { data: books } = await axios.get("/books");
        return _.filter(books, { authorId: parent.id });
      },
    },
  }),
});

const BookType = new GraphQLObjectType({
  name: "Book",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    authorId: {
      type: new GraphQLNonNull(UserType),
      resolve: async (parent) => {
        const { data: authors } = await axios.get("authors");
        const author = _.find(authors, { id: parent.authorId });
        return author;
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "Query",
  fields: {
    authors: {
      type: new GraphQLList(new GraphQLNonNull(UserType)),
      resolve: () => axios.get("authors").then((res) => res.data),
    },
    author: {
      type: new GraphQLNonNull(UserType),
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(parentArg, { id }) {
        const { data: authors } = await axios.get("authors");
        const author = _.find(authors, { id });
        if (!author) throw new Error("User not found!");
        return author;
      },
    },
    books: {
      type: new GraphQLList(new GraphQLNonNull(BookType)),
      resolve: async () => {
        const { data: books } = await axios("/books");
        return books;
      },
    },
    book: {
      type: new GraphQLNonNull(BookType),
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(parent, { id }) {
        const { data: books } = await axios.get("/books");
        const book = _.find(books, { id });
        if (!book) throw new Error("Book not found!");
        return book;
      },
    },
  },
});

const RootMutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    createBook: {
      type: new GraphQLNonNull(BookType),
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, { title, authorId }) {
        const id = uuid();
        const { data: authors } = await axios.get("/authors");
        const author = _.find(authors, { id: authorId });
        if (!author)
          throw new Error(`User with the Author id(${authorId}) was not found`);
        const book = {
          id,
          title,
          authorId,
        };

        await axios.post("books", book);
        return book;
      },
    },
    addUser: {
      type: new GraphQLNonNull(UserType),
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (parent, { firstName, age }) => {
        const id = uuid();
        const author = { id, firstName, age };
        await axios.post("authors", author);
        return author;
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});
