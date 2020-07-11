const axios = require("axios");
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

const books = [
  { id: "1", title: "book 1", author: "2" },
  { id: "2", title: "book 2", author: "2" },
  { id: "3", title: "book 3", author: "1" },
  { id: "4", title: "book 4", author: "3" },
];

const users = [
  { id: "1", name: "abu lulu", age: 101 },
  { id: "2", name: "ummu abdillah", age: 55 },
  { id: "3", name: "abdullah ibn AbdulFattah", age: 01 },
];

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    age: { type: new GraphQLNonNull(GraphQLInt) },
    books: {
      type: new GraphQLList(BookType),
      resolve: (parent, args) => {
        console.log("parent USerType:", parent);
        return _.filter(books, { author: parent.id });
      },
    },
  }),
});

const BookType = new GraphQLObjectType({
  name: "Book",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    author: {
      type: new GraphQLNonNull(UserType),
      resolve: (parent, args) => {
        console.log("parent:", parent);
        return _.find(users, { id: parent.author });
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "Query",
  fields: {
    user: {
      type: new GraphQLNonNull(UserType),
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(parentArg, { id }) {
        const user = _.find(users, { id });
        if (!user) throw new Error("User not found!");
        return user;
      },
    },
    books: {
      type: new GraphQLList(new GraphQLNonNull(BookType)),
      resolve: () => {
        const allBooks = books.map((book) => {
          return {
            ...book,
            author: _.find(users, { id: book.author }),
          };
        });
        console.log(allBooks);
        return books;
      },
    },
    book: {
      type: new GraphQLNonNull(BookType),
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(parent, { id }) {
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
        author: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, { title, author }) {
        const id = books.length + 1;
        return {
          id,
          title,
          author: { id: "2", name: "ummu abdillah", age: 55 },
        };
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});
