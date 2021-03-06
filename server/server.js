const express = require("express");
const cors = require("cors");
const { graphqlHTTP } = require("express-graphql");
const GraphQLSchema = require("../graphql");
const app = express();
app.use(cors());
app.use("/graphql", new graphqlHTTP({ graphiql: true, schema: GraphQLSchema }));
app.listen(4000, console.log("Server is up on port 4000"));
