This folder contains backends used to perform query execution.  
It currently contains a backend that generates random data with schema (x, y)

The originial discussion is here: https://github.com/cudbg/pi/issues/4

## Backend Specification Overview


A backend basically takes params/queries/whatever as input, and returns a table.
They are useful to separate, say, the database from the queries.
This way, interactions can focus on transforming the queries/inputs to the backend.
The backend is defined at the top level of the specification.

    backend: {
      name: "...",
      type: array/url/db/...,
      ..params...
      backend: NESTEDBACKENDSPEC
    }

**name** is a developer chosen name for the backend so it can be used in views.

**type** is the type of the backend.  Each backend implementation has a `type` field

**params** the spec is directly passed to the corresponding Backend for initialization, so any attributes expected by the Backend should be included in the spec.

**backend** some backends are wrappers around other backends.  In these cases, the nested backend's spec is specified here.  This can either define a new backend, or reference a previously defined backend.

```
# New Backend
backend: {
  name: "foo",
  type: "difftree",
  tree: ...
  backend: {
    type: "db",
    dburi: "postgresql://..."
  }
}

# Reference Existing Backend
backend: {
  name: "foo",
  type: "difftree",
  tree: ...
  backend: "dbbackend"   // previously defined
}

```




## API overview

The purpose of a backend is to run a query (asynchronously) and update the appropriate view.   The main difference between the different backends is what the data source actually is (inlined data, fetch from a URL, or a database backend), and the representation of a query.

An example of a view using a backend:

```
view.on('manipulation', (m) => {
  query = h(m)  
  backend.execute(query, (table) => {
    view.render(table)
  })
})
```

So far the API is:

* `Backend.type`: a string that describes the backend type
* `Backend.execute(Q, cb)`: executes query `Q` and calls the callback `cb` with the query result.  
* `Backend.apply(t, h)`: takes `h(m)` and transformation `t` as input and returns a query `Q` that the Backend can execute.
  * `Backend.registerTransformation(t)`: given the interaction's transformation spec `t`, returns a function `apply(params)` that maps `params=h(m)` to a query representation that the backend supports.   In many cases, `apply` may be the identity function.
    This is an optimization of `apply()` to avoid reparsing `t` over and over again.
* `Backend.merge(Q, Q')`: Takes two queries as input and returns a merged query.
  The main use is to merge the target view's existing query Q with Q' = apply(t,h(m)) which generates a new query that is executed to update the target view's rendered output.

Backends are managed and instantiated through the BackendLibrary in [backend/index.js](./index.js).  



## Considerations for specific backends



DB Backend

* Connects to a local in-memory sqlite database, or to a server-side database end point

Diff Tree Backend

* It can internally use a DB Backend for query execution
* It needs to be able to "unparse" into a SQL query string
* It needs to access AST nodes via paths and by parameter name
* Choice nodes should have defaults
* A "query" is a dictionary of parameter name to diff subtree 
* Useful utilities
  * A function that takes two SQL queries and returns a diff tree


Random Data Backend

* It should be initialized with the intended schema, thus if two views expect different input data schemas, we would instantiate two random data backends

URL CSV backend

* URL data is loaded asynchronously.  If `backend.execute` is called before the data is loaded, it should store the callbacks and call them when the data is loaded

Backend Wrappers

* Since the API is so simple, a backend could wrap another backend.  For instance, we could create a difftree backend that takes a custom difftree query format.  It internally translates that into a SQL query string, and passes it to a DB backend.
* This means, some backends expect the spec to contain a "backend" attribute.  (This is a light-weight form of inheritence)





 

## Specifications for Each Backend Type


The following illustrate the specifications for each backend type, and how it is used with a view's `data` specification.  

### Array of objects

        backend: {
          name: "foo",
          type: "array",
          data: [ ... objects ... ]
        }
        
        // when defining the view
        data: {
          backend: "foo"
        }

As shorthand, can directly specify the data source in the view:

        // when defining the view
        data: { 
          type: array
          data: [ ... ]
        }


### CSV/URL

        backend: {
          name: "foo"
          type: "url",
          url: " ... "
        }

        data: {
          backend: "foo"
        }

As shorhand:

        data: {
          type: url
          url: " ... "
        }

### Query

        backend: {
          name: "foo",
          type: "db",
          dburi: "postgresql://...",
          schema:{
            fooX: INT,
            fooY: INT
          }
        }

        data: {
          backend: "foo",
          query: "SELECT ..."
        }

As shorthand:

        data: {
          type: "db",
          dburi: "postgresql:...",
          query: "SELECT ..."
          schema:{
            fooX: INT,
            fooY: INT
          }
        }
        
Schema is only required for alasql backends (type: "alasql").

The allowable column types for schema are: (from https://github.com/agershun/alasql/wiki/Sql) 
* Javascript types: String, Number, Boolean, Date, ISODate
* ANSI SQL Types 
* SQLite, Oracle, MySQL, SQL Server, Postgres data types mapping


### Diff Tree

The diff tree used by the precision interfaces Python system.  The Difftree is an AST augmented with "choice" nodes.  A choice node can choose between multiple children, and is used to encode differences between ASTs.  Each choice node is parameterized, and a given parameterization of the nodes corresponds to a concrete AST.  

This backend uses a socketio connection to communicate with a server-hosted difftree that actually applies the parameterizations, generates a SQL query, runs it via a database connection, and returns the results to the javascript Diff Tree Backend..   To use this backend, you also need to configure and run the [server](../../../server). 


```
backend: {
  type: "difftree",
  difftree: { JSON FORMAT OF DIFF TREE }
  backend: { SPEC FOR INNER BACKEND }
}
```


### JS Diff Tree


This is a pure-javascript version of the difftree backend.  It uses a different tree format, and the AST is generated by a [modified version of js-sql-parser](../../lib/sqlParser.js).  This is lower overhead to setup and use as compared to Diff Tree.


```
backend: {
  type: "jsdifftree",
  difftree: { JSON FORMAT OF JS DIFF TREE } | { FILE PATH TO JSON FILE}
  backend: { SPEC FOR INNER BACKEND }
}
```

* difftree: either a json format of the diff tree, or a string that is the relative path to a json file containing the diff tree.  See the [jsquerydiff](../../../jsquerydiff) folder for the utility to generate diff trees in this format.

