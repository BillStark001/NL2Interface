
# Installation and Setup

Setup

    npm install .

Compile js into a single distributable file [./dist/pi-client.js](./dist/pi-client.js) or [./dist/pi-client.min.js](./dist/pi-client.min.js):

    npm run build

See webpage (using python2.7):

    python -m SimpleHTTPServer    
    # Go to localhost:8000/index.html

We have two main interface examples that illustrate the difference between the two main backends (jsdifftree and difftree).  

* [index.html](./index.html) is a browser-only example.  It loads the example spec file [specs/wu.json](./specs/wu.json) and renders the interface. This spec file uses the JS difftree backend, so queries and interactions are all handled within the browser.  
* The [difftree backend](./src/backend/difftree.js) communicates with a [python server](../server/) via socketio.  The python server transforms a  diff tree representation (different than the one used by jsdifftree) and runs queries on a server-side database instance.  To run this example, go to [../server](../server) and follow its instructions.  


# Documentation

## Backends

Moved to the [Backend README](./src/backend/README.md)


## Specification

An interface specification is a JSON object that defines the layout, views, and interactions
on the interface.   You can find examples in [./specs](./specs).

It always has the following top level structure:

    {
	  "id": STRING
      "backends": ARRAY<BACKEND>
	  "views": ARRAY<NODE>
	  "layout": NODE
	  ["interactions":  ARRAY<INTERACTION> ]
    }

A NODE defines the layout and views in the interface.  Leaf nodes define views and widgets, and interior nodes define layouts.  By default, a node has the following properties (key values in square brackets are optional):

    {
      "id": STRING         -- a unique ID for the node.  
      "type": NODETYPE
      "width": NUMBER
      "height": NUMBER
      "options": { ... }   -- specs passed as options to the implementation of the node type
      ["children": ARRAY<node>]
    }
 
### Layout Nodes

Layout nodes have the following types.  

* HLayout: horizontal layout.  Same as hconcat in vegalite
* VLayout: vertical layout.  Same as vconcat in vegalite

Layout nodes are allowed to have `children`.  A child may be a layout node, an in-lined view node (below), or a reference to a view.    A reference specifies a `ref` attribute that refers to a view.

    {
      ref: VID OF A VIEW NODE
    }

As a full example, the following defines a single view, and a layout that references the view:

	{
	  views: [{
		id: "foo",
		type: "Slider",
		width: 100,
		height: 20
	  }],
	  layout: {
		type: "VLayout",
		width: 400,
		height: 100,
		children: [{ref: "foo"}]
	  }
	}

### View Nodes

See the document in [src/view/README.md](./src/view)
 

## Interactions


Interactions define how to take user manipulations in a source view to transform the data source of the target view.  At a high level, the interaction is defined as follows:

    {
      interaction_id: NUMBER
      source: NUMBER
      target: NUMBER
      m: MANIPULATION
      t: SUBTREEXFORM
      h: PROJECTION
    }

* source and target are the ids of the corresponding views
* `m` defines the user manipulation, which generates a stream of tables.
* `t` is the parameterized query subtree that takes as input a table with a well-defined schema and returns a concrete query subtree with no parameters.  
* `h` is a query/transformation that massages the data from `m` into a table that's schema compatible with `t`.

### Commiting and Aborting Interactions

Recall that the state of a view is defined by its input dataset, which is typically defined by its query or AST.   The main idea behind interactions is that the target view's state is redefined to also dependent on the user manipulations in the source view.  One way to think about it is that the original view corresponds to:

```
visualization = targetview.render(targetview.query(DB))
```

whereas, as long as the user is actively manipulating the source view, we wish the target view's query to be defined based on the manipulation `m`
```
targetview.query = interaction(m)
```

However, once the user manipulation is completed, should its effects be permanently applied to `targetview.query`?  The answer depends on the specific source view and user manipulation.  Thus, we introduce the semantics of commits and aborts.

* **Commit**: persist the changes by updating `targetview.query`.  This is achieved by [Backend.merge()](./src/backend/README.md)
* **Abort**: Revert `targetview.query` to its state before the user manipulation started.


This is akin to transaction commit and abort in databases.  During the user manipulation, the state of the target view changes (aka writes to the target view), however whether those writes are permanent depends on if the manipulation is committed or aborted.




### m: user manipulations

Each view type exposes a set of manipulation types that they support.  For instance, a slider may only support the type "Drag", whereas a vega-lite chart supports a small language.  Thus, the value of the `m` attribute is passed to the corresponding view, which will internally process the manipulation specification.
 
Each view exposes a well-defined schema for every valid manipulation specification, accessible by calling `view.manipulationSchema(m)`.

#### Widget Views

Widget views are views that are populated by a static table rather than a query.  Thus their cardinality is fixed.  If a widget view is intended to be used as the source of an interaction, we expect that the table provided by its `data` includes a special `subtree` attribute.

Their manipulation spec expects the attributes `type` and `space`:

    m: {
      type: CLICK | DRAG
      space: SPATIAL | MARK | DATA
    }

* `type`: the type of mouse/interaction event
* `space`: the representation space of the manipulation. 

Expected output for each `space` attribute:

A data table is an array of rows along with a schema, where a row is a javascript object and a schema is well defined for any view's `m`. 

  * `Data`: A data table with the same schema as the table defined by the view's `data` attribute
  * `Mark`: A data table where each element is a DOM object representing the mark(s).  Thus for a dropdown, it is a table of `SELECT` elements, for a bar chart, it's a list of `RECT` elements. A DOM element is just a row (element name, attributes and values)
  * `Spatial`: A table with one row, where the schema is defined based on the dimensionality of the manipulation.

For instance, let's say a dropdown is used to pick between three queries.  The view may be defined as:

    {
      name: "Dropdown"
      data: {
        type: "url"
        url:  "..."
      }
    }

Where the schema of the table at the url is

    (id:int, label:string, subtree:tree)

Its corresponding `m` in `data` space would be: 

	m: {
      type: CLICK 
      space: DATA
    }
And if the query we selected had label "cat", then we can expect something like:

	[{
      id: 0,
      label: "cat",
      subtree: catsubtree
    }]
  
#### Chart Views

For a chart, the specification expects several attributes:

    m: {
      type: BRUSH | MULTI | SINGLE
      encodings: [ x, y, ...] -- list visual encodings for brush interactions
      space: SPATIAL | MARK | DATA
    }

* `type`: `BRUSH` is a brush that selects across the x & y axes. `MULTI` allows the user to select multiple data points at a time. `SINGLE` allows the user to select a single data point. 
* `encodings` specifies the dimensions the manipulation should occur across. These can be visual, such as color (though a brush will always need to have the encoding along axes to be specified). 
* `space` is defined the same as in Widget Views. 

For instance, a 1-D brush along the x-axis that returns the marks after dragging would be:

    m: {
      type: BRUSH
      encodings: x
      space: MARK
    }

A 1-D brush along the x-axis that returns the min and max pixel values on submit (e.g. through a button) would be:

    m: {
      type: BRUSH
      encodings: x
      space: SPATIAL
    }

A 2-D brush that returns the data records corresponding to the selected marks after dragging would be:

    m: {
      type: BRUSH
      encodings: [x, y]
      space: DATA
    }




### t: transformations

A transformation is a function that takes as input a table (the output of `h(m)`) and uses it to generate the target view's new query.  In practice, we only support transformations based on [diff trees](./src/backend#diff-tree) (tranforming a SQL AST).  Thus our discussion will be centered around diff trees.

Currently, all of the important transformation information is embedded in the diff tree backends, thus `t`'s main job is to define a schema, and check that `h(m)` conforms to the schema.    Since we have not yet written the code to check the schema, `t`  is basically a noop right now.

For example the following transformation expects a schema with two float values. 
```
t:{
  "schema": [
    {
      "name": "p1",
      "type": "float"
    },
    {
      "name": "p2",
      "type": "float"
    }
  ]
}
```

### h: mapping from manipulations to transformations

The user manipulation may generate tables whose schemas are incompatible with the transformation's expected schema.  `h` functions are a mapping function intended to address this incompatibility.  The key is the attribute in `t`'s input schema, and the value is either a named or positional attribute in the output of `m`.   The following maps label, and value to p1 and p2.    We would expect that the diff tree has choice nodes with ids `p1` and `p2`.


    {
      h: {
        p1: 'label',
        p2: 'value'
      }
    }



Currently, `h` only supports simply mapping functions.  In some cases, we may wish to transform `m` using a query, or to apply aggregation or data transformations to `m`.  These extension are currently not supported, and will be added as needed.



## Example: Lifecycle of an Interaction Example


In this simple example, we are going to illustrate the how interaction on radio works. 

![Screen Shot 2020-05-20 at 00 00 45](https://user-images.githubusercontent.com/13096451/82403507-036e7d80-9a2d-11ea-9bd9-cfbd5dd8b479.png)

The interaction definition is as follows

```
{
  interaction_id: 1 
  source: 1
  target: 3
  m: {
    type: "click",
    space: "data"
  },
  t: {    
    "schema": [ {
        "name": "p1",
        "type": "float"
     } ]
  }
  h: {
    p1: "value"
  }
}
```



When the user clicks on the "10" radio button, the following sequence occurs, along with pseudocode.

1. `m` generates a table based on the data that generated the radio button view:
2. `h` renames `value` and ignores `label`:
3. Apply `t` to generate a query `q'`
  * Note that `q'` corresponds to the parameter assignmens for the parts of the diff tree that have been modified by the interaction.  Here, q' is `{2: 0}`
4. Q is target view's query (`{1 : 1,  2 : 1 }`, see the image).  `merge()` combines the target view's query `Q` with the interaction's choices `q'`.  Here, `q'` overwrites part of `Q` by replacing `{2:1}` with `{2: 0}`.   Thus the result is `Q' = {1:1, 2:0}`.  
5. Finally, execute the query


```
  srcView.on("click", (m) => {           // [ { label: "10", value: 0 } ]
    h_m = h(m)                           // [ { p1: 0 } ]
    q' = backend.apply(t, h_m)           // { 2: 0 }
    Q' = backend.merge(targetView.Q, q') // { 1:1, 2:0 }
    backend.execute(Q', (data) => { 
      targetView.render(data) 
    })
  });
```

The point of separating `Q` and `q'` is so that the client can manage the state of any view by changing the view's query.  If the view commits the interaction, it will issue a commit message.  The client then updates the target view's state accordingly:

```
  // when the target view issues a commit message
  // update its query state with Q'
  client.updateState(targetView.id, Q');
```

  

