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
  GraphQLBoolean,
} = require("graphql");

const axios = _axios.create({
  baseURL: "http://localhost:3000/",
  timeout: 1000,
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
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
      type: new GraphQLNonNull(AuthorType),
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
      type: new GraphQLList(new GraphQLNonNull(AuthorType)),
      resolve: () => axios.get("authors").then((res) => res.data),
    },
    author: {
      type: new GraphQLNonNull(AuthorType),
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(parentArg, { id }) {
        const { data: authors } = await axios.get("authors");
        const author = _.find(authors, { id });
        if (!author) throw new Error("Author not found!");
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
    addBook: {
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
          throw new Error(
            `Author with the Author id(${authorId}) was not found`
          );
        const book = {
          id,
          title,
          authorId,
        };

        await axios.post("books", book);
        return book;
      },
    },
    removeBook: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(parentValue, { id }) {
        try {
          const { data: book } = await axios.delete("books/" + id);
          return !!book;
        } catch (ex) {
          throw new Error("Book not found");
        }
      },
    },
    removeAuthor: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(parentValue, { id }) {
        try {
          const { data: author } = await axios.delete("authors/" + id);
          return !!author;
        } catch (ex) {
          throw new Error("Auhor not found");
        }
      },
    },
    addAuthor: {
      type: new GraphQLNonNull(AuthorType),
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

axios
  // .get("books?title=book two")
  // .get("authors", { params: { firstName: "haleemah", age: 72 } })
  .get("authors?age=72&firstName=haleemah")
  .then((res) => res.data)
  .then(console.log)
  .catch(console.log);
