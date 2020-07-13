import React, { Fragment } from "react";
import { render } from "react-dom";
// import gql from "graphql-tag";
import ApolloClient, { gql } from "apollo-boost";
import { ApolloProvider, graphql } from "react-apollo";
// import { flowRight as compose } from "lodash";
import { compose } from "recompose";

const mutation = gql(`
  mutation addmore($title: String!){
    createBook(title:$title,author:"1") {
      id
      title
    }
  }
`);

const App = graphql(mutation)((props) => {
  // console.log(props.mutate());
  // console.log(props.ummu());
  props.mutate({ variables: { title: "keeeeee" } });
  console.log(props);

  return (
    <Fragment>
      <h1>React application</h1>
      <div>this is a div</div>
      <h6>HI went</h6>
      <h3>header bext</h3>
      {/* <p>{props.data.hello}</p> */}
    </Fragment>
  );
});

const client = new ApolloClient({ uri: "http://localhost:4000/graphql" });
render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);
