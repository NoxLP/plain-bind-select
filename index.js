import { mySelect } from "./select.js";

const container = document.getElementById('container')
console.log(container)
const data = [
  {
    id: 0,
    value: 'value1',
    text: 'value 1'
  },
  {
    id: 1,
    value: 'myvalue2',
    text: 'my value 2'
  },
  {
    id: 2,
    value: 'foovalue3',
    text: 'foo value 3'
  }
]
console.log(data);
const selectData = mySelect(container, data, {
  id: 'testSelect',
  onSelected: (selected) => console.log('SELECTED EVENT: ', selected)
})
console.log('SD ', selectData)
console.groupCollapsed('TESTING SELECTED')
selectData.selectedId = 1
selectData.selectedId = undefined
console.groupEnd()

document.getElementById('butTestClass').addEventListener('click', () => {
  console.groupCollapsed('TESTING MENU CLASS add .bg-dark')
  selectData.button.classList.toggle('bg-dark')
  console.groupEnd()
})

document.getElementById('butTestStyle').addEventListener('click', () => {
  console.groupCollapsed('TESTING BACKG COLOR STYLE to transparent')
  selectData.button.style.backgroundColor = 'transparent'
  console.groupEnd()
})

let lastId = 3
document.getElementById('testBut').addEventListener('click', () => {
  const index = document.getElementById('testIndex').value
  const value = document.getElementById('testValue').value
  const text = document.getElementById('testTypeText').checked
  const selected = document.getElementById('testTypeSelected').checked

  console.groupCollapsed(`TEST`)
  console.log('index: ', index)
  console.log('value: ', value)
  console.log('target: ', text ? 'text' : 'value')
  console.groupEnd()

  if (index && !selected) selectData.data[index][text ? 'text' : 'value'] = value
  else if (index && selected) selectData.selectedId = index
  else {
    const obj = {
      id: lastId,
      value,
      text: value
    }
    console.log('push ', obj)
    ++lastId
    selectData.data.push(obj)
  }
})