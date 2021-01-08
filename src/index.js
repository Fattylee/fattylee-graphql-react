import React, { useState, Fragment } from "react";
import { render } from "react-dom";
// import gql from "graphql-tag";
import ApolloClient, { gql } from "apollo-boost";
import { ApolloProvider, graphql } from "react-apollo";
// import { flowRight as compose } from "lodash";
import { compose } from "recompose";
import { createStore, applyMiddleware, combineReducers } from "redux";
import { Provider, connect } from "react-redux";
import thunk from "redux-thunk";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
const authorReducer = (state = { firstName: "", age: 0, id: "" }, action) => {
  switch (action.type) {
    case "ADD_AUTHOR":
      return { ...state, ...action.payload };
    default:
      return state;
  }
};
const rootReducer = combineReducers({
  author: authorReducer,
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk))
);

const addAuthorAction = (payload) => (dispatch) =>
  dispatch({ type: "ADD_AUTHOR", payload });

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

// 443b 198b
const deleteAuthorQuery = gql`
  mutation deleteAuthor($id: ID!) {
    removeAuthor(id: $id)
  }
`;

const authorDetailQuery = gql`
  query getAuthor($id: ID!) {
    author(id: $id) {
      id
      firstName
      age
      books {
        id
        title
      }
    }
  }
`;

const mylist = (props) => {
  const { loading, error, authors } = props.getAuthors;
  if (loading) {
    return <div>Loading authors...</div>;
  }
  if (authors.length === 0 && !error) return <h2>No Author yet</h2>;

  return authors.map(({ id, firstName, age }) => (
    <li key={id}>
      <Link to={"/authors/" + id}>firstName: {firstName}</Link>
      <span
        onClick={() => {
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
          props.addAuthorAction(author);
        }}
        style={{ cursor: "pointer" }}
      >
        EDIT
      </span>
    </li>
  ));
};
const _AuthorList = (props) => {
  return (
    <Fragment>
      <h2>Auhors List</h2>
      <ul>{mylist(props)}</ul>
      <h1 style={{ cursor: "pointer" }}>
        <Link style={{ textDecoration: "none" }} to={"/add-author"}>
          +
        </Link>
      </h1>
    </Fragment>
  );
};

const AuthorList = compose(
  graphql(getAuthorsQuery, { name: "getAuthors" }),
  graphql(deleteAuthorQuery, { name: "deleteAuthor" }),
  connect(null, { addAuthorAction })
)(_AuthorList);

const _AuthorDetail = (props) => {
  const {
    data: { author: { firstName, age, id, books } = {} },
  } = props;
  if (props.data.loading) return <p>Loading author...</p>;
  return (
    <Fragment>
      <p>
        <Link to="/authors">Back</Link>
      </p>
      <h2>First Name: {firstName}</h2>
      <p>Age: {age}</p>
      {books.length ? <h3>Books</h3> : <h3>No books</h3>}
      <ul>
        {books.map((book) => (
          <li key={book.id}>{book.title}</li>
        ))}
      </ul>
      <p>
        <Link to={`/authors/${id}/add-book`}>+Book</Link>
      </p>
    </Fragment>
  );
};
const AuthorDetail = graphql(authorDetailQuery, {
  // name: "getAthor",
  options: (props) => {
    const {
      match: {
        params: { id },
      },
    } = props;
    return {
      variables: { id },
    };
  },
})(_AuthorDetail);

const _AddAuthor = (props) => {
  console.log("_AddUser props", props);
  const [{ firstName, age }, setAuthor] = useState({});
  return (
    <Fragment>
      <p>
        <Link to="/authors">Back</Link>
      </p>
      <h2>Create a new Author</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const author = { firstName, age: parseInt(age) };
          setAuthor({ firstName: "", age: "" });
          props
            .mutate({
              variables: author,
              refetchQueries: [{ query: getAuthorsQuery }],
            })
            .then((res) => {
              props.history.push("/authors");
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
const AddAuthor = compose(
  graphql(addUserMutation),
  connect((state) => state)
)(_AddAuthor);

const AddBook = (props) => {
  console.log("object", props);
  const { pathname } = props.location;
  const index = pathname.lastIndexOf("/");
  const url = pathname.slice(0, index);
  return (
    <Fragment>
      <p>
        <Link to={url}>Back</Link>
      </p>
      <h1>Add Book</h1>
    </Fragment>
  );
};

const LandingPage = () => (
  <Fragment>
    <h1>React Apollo GraphQL</h1>
    See the list of Authors <Link to="/authors">here</Link>
  </Fragment>
);
const Header = (props) => {
  console.log("Header:", props.children[1]);
  return (
    <Fragment>
      <Link to="/">Home</Link>
      {props.children}
    </Fragment>
  );
};
let xyz = 0;
class XYZ extends React.Component {
  state = { ab: this.props.name || "no name" };
  componentDidMount() {
    xyz += 2;
    console.log("Result:", xyz);
  }
  render() {
    return <span>{this.state.ab}</span>;
  }
}
const _App = (props) => {
  return (
    <Fragment>
      <Router>
        <Header>
          <XYZ />
          <XYZ name="son" />
          <XYZ name="baba" />
          <p>
            hi there <b>so bold</b>
          </p>
        </Header>
        <Route path="/" exact component={LandingPage} />
        <Route path="/authors" exact component={AuthorList} />
        <Route exact path="/authors/:id" component={AuthorDetail} />
        <Route path="/authors/:id/add-book" component={AddBook} />
        <Route path="/add-author" component={AddAuthor} />
      </Router>
    </Fragment>
  );
};
const App = graphql(mutation)(_App);

const client = new ApolloClient({ uri: "http://localhost:4000/graphql" });

render(
  <Provider store={store}>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </Provider>,
  document.getElementById("root")
);
