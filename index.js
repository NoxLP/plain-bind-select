import { mySelect } from "./select.js";

const container = document.getElementById('container')
console.log(container)
const data = [
  {
    id: 1,
    value: 'value1',
    text: 'value 1'
  },
  {
    id: 2,
    value: 'myvalue2',
    text: 'my value 2'
  },
  {
    id: 3,
    value: 'foovalue3',
    text: 'foo value 3'
  }
]
console.log(data);
const selectData = mySelect(container, data, {
  id: 'testSelect'
})
console.log('SD ', selectData)

let lastId = 3
document.getElementById('testBut').addEventListener('click', () => {
  const index = document.getElementById('testIndex').value
  const value = document.getElementById('testValue').value
  const text = document.getElementById('testTypeText').checked

  console.groupCollapsed(`TEST`)
  console.log('index: ', index)
  console.log('value: ', value)
  console.log('target: ', text ? 'text' : 'value')
  console.groupEnd()

  if (index) selectData.data[index][text ? 'text' : 'value'] = value
  else {
    console.log('push')
    ++lastId
    selectData.data.push({
      id: lastId,
      value,
      text: value
    })
  }
})