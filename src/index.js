import React, { useState, Fragment } from "react";
import { render } from "react-dom";
// import gql from "graphql-tag";
import ApolloClient, { gql } from "apollo-boost";
import { ApolloProvider, graphql } from "react-apollo";
// import { flowRight as compose } from "lodash";
import { compose } from "recompose";

const mutation = gql(`
  mutation addmore($title: String!){
    addBook(title:$title,author:"1") {
      id
      title
    }
  }
`);

const getAuthorsQuery = gql`
  {
    authors {
      id
      firstName
      age
    }
  }
`;
const deleteAuthorQuery = gql`
  mutation deleteAuthor($id: ID!) {
    removeAuthor(id: $id)
  }
`;

const mylist = (props) => {
  console.log("pop", props);
  const { loading, error, authors } = props.getAuthors;
  if (loading) {
    return <div>Loading authors...</div>;
  }
  if (!loading && !error) {
    return authors.map(({ id, firstName, age }) => (
      <li key={id}>
        <p>firstName: {firstName}</p>
        <small>Age: {age}</small>
        <span
          onClick={() => {
            console.log("deleted");
            props
              .deleteAuthor({
                variables: { id },
                // refetchQueries: [{ query: getAuthorsQuery }],
              })
              .then((res) => props.getAuthors.refetch());
          }}
          style={{
            fontSize: "20px",
            color: "red",
            margin: "10px",
            cursor: "pointer",
          }}
        >
          x
        </span>
        <span
          onClick={(e) => {
            const author = { id, firstName, age };
            console.log("edited", author);
          }}
          style={{ cursor: "pointer" }}
        >
          EDIT
        </span>
      </li>
    ));
  }
};
const _AuthorList = (props) => {
  return <ul>{mylist(props)}</ul>;
};

const AuthorList = compose(
  graphql(getAuthorsQuery, { name: "getAuthors" }),
  graphql(deleteAuthorQuery, { name: "deleteAuthor" })
)(_AuthorList);

const _AddUser = (props) => {
  const [{ firstName, age }, setAuthor] = useState({});
  return (
    <Fragment>
      ======================
      <br />
      ======================
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const author = { firstName, age: parseInt(age) };
          setAuthor({ firstName: "", age: "" });
          console.log(author);
          props
            .mutate({
              variables: author,
              refetchQueries: [{ query: getAuthorsQuery }],
            })
            .then((res) => {
              console.log("Successfully addded!", res);
            })
            .catch((ex) => {
              console.log("Something went wrong", ex);
            });
        }}
      >
        <div>
          Name: &nbsp;
          <input
            onChange={(e) => {
              const { value } = e.target;
              setAuthor((state) => ({
                ...state,
                firstName: value,
              }));
            }}
            value={firstName}
            placeholder="Enter first name"
            type="text"
          />
        </div>
        <div>
          Age: &nbsp;
          <input
            onChange={(e) => {
              const { value } = e.target;
              setAuthor((state) => ({
                ...state,
                age: value,
              }));
            }}
            value={age}
            placeholder="Enter age"
            type="text"
          />
        </div>
        <input type="submit" value="Submit" />
      </form>
      <p>firstName: {firstName}</p>
    </Fragment>
  );
};

const addUserMutation = gql`
  mutation addUserVAr($firstName: String!, $age: Int!) {
    addAuthor(firstName: $firstName, age: $age) {
      id
      firstName
      age
      books {
        id
      }
    }
  }
`;
const AddUser = graphql(addUserMutation)(_AddUser);

const App = graphql(mutation)((props) => {
  return (
    <Fragment>
      <h1>React Apollo GraphQL</h1>
      <AuthorList />
      <AddUser />
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
