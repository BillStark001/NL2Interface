# View Node Specification

Views are leaf nodes in the layout and responsible for rendering data.
A view can be any type of widget (Slider, Labels, Dropdown), or visualizations (called a Chart here).  At a high level, a view is anything that renders a record or table of data that the user might look at and (crucially) interact with.

### API overview

When the client loads a spec, it renders the views, and then lays them out based on the layout spec.  If a layout is not specified (like the below example), the views are created but not rendered on screen:

```
{
  views: [ 
    {id: 1, type: "Slider", ... }, 
    {id: 2, type: "Chart", ... } 
  ]
}
```

The application can programmatically reference the views and the DOM elements:

```
viewId = 1
view = client.getView(viewId)  -- returns View object (src/view)
dom = view.domEl()             -- get rendered DOM element
$("#mycontainer").append(dom)  -- add view's DOM element to custom container
```

Methods exposed by a View

* **render(table)**: takes a table, applies the mapping, and updates the rendered view. 
* **on(m, cb)**: on the user manipulation `m`, executes callback `cb`
* **mapping()**: return the full mapping specification 
* **inputSchema()**: returns the input schema
* **manipulationSchema(m)**: given user manipulation spec `m` returns the schema of the data that `m` will produce.


  


## View Specification

A view spec is defined by a renderer, a data source, a mapping, and options that are stylistic but unrelated to the data source.

```
{
  [vid: STRING]       -- optional.  pi-client tracks an internal id for each view.  
  type: NODETYPE      -- the renderer to use.  the renderer specifies the schema it expects
  [mark: MARKTYPE]    -- option for Chart renderers
  [width: NUMBER]     -- option
  [height: NUMBER]    -- option
  data: { .... }      -- data source
  [mapping: MAPPING]  -- schema mapping from data to view's input schema
}
```



### Renderer

The renderer is implemented as a View object in this directory and registered in the view library object.  The spec specifies which renderer to use via the `type` attribute.    


The View code should define the input schema it supports.  For instance, a dropdown expects a schema containing `label` and `value`, while a bar chart expects a schema including `x, y, height, width, color, ...`.  See [below](#inputschemas) for examples.  

A View exposes an input schema as a list of attribute descriptions.  Each element in the list has the following structure: 
```
{ 
  name: STRING, 
  type: LIST<TYPE> | TYPE
  [required: BOOLEAN]   -- defaults to true
}
```

Where `TYPE` can be `num`, `string`, `tree`, or `any`. 


For instance, a drop down may specify that its input schema should be 
```
[ {name: 'label', type: string}, 
  {name: value, type: 'any'}
```

### Data Source

A data source specifies how to generate a table.  The data table is used by the renderer to render its contents.  This is done by calling `[view].render(data)`.

See the [Backend Readme](../backend/) for more info.

### Mapping

A mapping specifies how attributes in the data table are mapped to the schema that the renderer expects.   The key is the attribute in the view's input schema, and the value is the attribute in the data source.  The value can be an attribute name or a positional attribute (`$i` means the `ith` attribute in the data source).

For instance, the following maps the data attributes year and cost to the view's x and y coordinates, and maps the third attribute in the data table to color.

```
mapping: {
  x: 'year', 
  y: 'cost',
  color: '$3'
}
```

### Options

Options are additional attributes in the spec that are stylistic.  For instance, the `Chart` view can take a 'mark' attribute to specify the mark type.  Other attributes such as width, height of the view are stylistic options because they do not depend on the data source.

# Example View Specs

The following creates a dropdown with two choices -- cat and dog. If `mapping` is not specified, then we assume the identity function.

```
{
  type: 'DropDown',
  data: {
    type: array
    data: [ {label: 'cat', value: 'cat'}, {label: 'dog', value: 'dog'} ]
  }
}
```

Explicitly with the mapping spec if the data table schema is different:

```
{
  type: 'DropDown',
  mapping: {
    label: 'name',
    value: 'id'
  },
  data: {
    type: array
    data: [ {name: 'cat', id: 0}, {name: 'dog', id: 1} ]
  }
}
```

The drop down can also be populated by a query:

```
{
  type: 'DropDown',
  mapping: {
    label: '$1',   
    value: '$2'
  },
  data: {
    type: 'pg'  -- pre-defined query backend
    query: "SELECT state as label, count(*) as value FROM data"
  }
}
```

A slider can be populated by a query:
```
{
  type: '1DSlider',
  data: {
    type: 'pg',
    query: 'SELECT min(cost) as min, max(cost) as max FROM data'
  }
}
```

# <a name="inputschemas"/>View Input Schemas

An input schema defines the input to views, input to interaction transformations, and output of data sources.  A schema is defined by a list of objects that specify the attribute name and the type.  The order of the attributes is significant.

The following are examples of input schemas for different views.  In general, an HTML-based widget can derive its schema based on the attributes the HTML element expects.  

#### Label

```
[{'name': 'label', 'type': 'string'}]
```

#### Textbox

```
[]
```

#### Dropdown

If value is not specified, it should use the label as the value.

```
[ 
  {'name': 'label', 'type': 'string'}, 
  {'name': 'value', 'type': 'any', required: false}
]
```

#### Slider

```
[
  {'name': 'min', 'type': 'num'}, 
  {'name': 'max', 'type': 'num'},
  {'name': 'step', 'type': 'num'}
]
```

#### Range slider

```
[
  {'name': 'min', 'type': 'num'}, 
  {'name': 'max', 'type': 'num'},
  {'name': 'step', 'type': 'num'}
]
```

#### Check boxes/radio/button

```
[ 
  {'name': 'label', 'type': 'string'}, 
  {'name': 'value', 'type': 'any'}
]
```

#### chart(point, bar, line):

```
[ 
  {'name': 'x', 'type': ['num', 'string']}, 
  {'name': 'y', 'type': ['num', 'string']}, 
  {'name': 'xaxistitle', type: 'string' },
  {'name': 'yaxistitle', type: 'string' }
  {name: 'size', type: ['num', 'string'], required: false},
  {'name': 'color', 'type': ['num','string'], required: false},
  {'name': 'shape', 'type': ['num'|'string'], required: false}
]
``` 


