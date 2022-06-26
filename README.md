# Use
```(Javascript)
const selectData = new mySelect(container, data, {
    id: 'testSelect',
    allow_clear: true,
    onSelected: (selected) => console.log('SELECTED EVENT: ', selected),
  })

selectData.button.classList.toggle('bg-dark')
selectData.selectedId = index
selectData.data[1].text = value
selectData.data.push({id: 34, text: 'my64'})
selectData.data = selectData.data.sort((a, b) => a.value.localeCompare(b.value))
```

<br></br>

# Params
| name | description | required |
|---|---|---|
|container|DOM element that will contain the select as a child|yes|
|data|Data array for the options|yes|
|config|Config object(see below)|no|

<br></br>

# Returned object
| name | description | others |
|---|---|---|
|button|DOM element that draw as select|
|data|The data|Changes here will be seen on the DOM - proxy
|dropdown|DOM element div that enclose the select and use bootstrap's dropdown class|
|filterInput|DOM element input if search_box is activated in config|
|findOption|Function to find an option by value|
|findOptionById|Function to find an option by id|
|menu|DOM element of the menu opened by bootstrap when the select is opened|
|options|Object that contains options and respective data|
|selectedId|Id of selected option|Changes here will be seen on the DOM
|selectedOption|Selected option|Changes here will be seen on the DOM

<br></br>

# Config values
| name | description | required | default |
|---|---|---|---|
| id | Resultant select DOM element id | no | - |
| field_text | Data property name that will act as option text | no | ```text``` |
| field_id | Data property name that will act as option id | no | ```id``` |
| allow_clear | Add a button to clear selected option | no | ```false```|
| search_box | Add a search box to filter options | no | ```true``` |
| on_selected | Callback to execute when an option is selected | no | none |
| placeholder | Select placeholder | no | none|
| limit | Limit **initial** number of options. Setting it to 0 is the same as not setting it | no |none|