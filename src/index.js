import React, { Fragment } from "react";
import { render } from "react-dom";
// import gql from "graphql-tag";
import ApolloClient, { gql } from "apollo-boost";
import { ApolloProvider, graphql } from "react-apollo";
// import { flowRight as compose } from "lodash";
import { compose } from "recompose";

const query = gql`
  query($salary: String!) {
    hello(name: $salary)
  }
`;

const App = compose(
  graphql(query, {
    name: "ummu",
    options: (prop) => {
      // console.log("this is option", prop);
      return { variables: { salary: "for ummu ok" } };
    },
  }),
  graphql(query, {
    name: "abu",
    options: { variables: { salary: "648794927486789" } },
  })
)((props) => {
  // props.ummu.variables.salary = "overrides";
  // console.log(props);
  // console.log(props.ummu());

  return (
    <Fragment>
      <h1>React application</h1>
      <div>this is a div</div>
      <h6>HI went</h6>
      <h3>header bext</h3>
      <p>{props.ummu.hello}</p>
    </Fragment>
  );
});
const client = new ApolloClient({ uri: "http://localhost:4000/graphql" });
render(
  <ApolloProvider client={client}>
    <App gender="hi gender" />
  </ApolloProvider>,
  document.getElementById("root")
);
