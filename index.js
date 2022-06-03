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
    value: 'value2',
    text: 'value 2'
  },
  {
    id: 3,
    value: 'value3',
    text: 'value 3'
  }
]
console.log(data);
const selectData = mySelect(container, data)
console.log(selectData)

document.getElementById('testBut').addEventListener('click', () => {
  const index = document.getElementById('testIndex').value
  const value = document.getElementById('testValue').value
  const text = document.getElementById('testTypeText').checked

  console.groupCollapsed(`TEST`)
  console.log('index: ', index)
  console.log('value: ', value)
  console.log('target: ', text ? 'text' : 'value')
  console.groupEnd()
  selectData[index][text ? 'text' : 'value'] = value
})