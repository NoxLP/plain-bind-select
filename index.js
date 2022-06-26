import { mySelect } from './select.js'

const container = document.getElementById('container')
console.log(container)
const dataWithId = [
  {
    id: 0,
    value: 'value1',
    text: 'value 1',
  },
  {
    id: 1,
    value: 'zmyvalue2',
    text: 'z my value 2',
  },
  {
    id: 2,
    value: 'foovalue3',
    text: 'foo value 3',
  },
  {
    id: 3,
    value: 'foovalue4',
    text: 'foo value 4',
  },
]
const dataNoId = [
  {
    value: 'NoId_value1',
    foo: 'NoId_value 1',
  },
  {
    value: 'NoId_zmyvalue2',
    foo: 'NoId_z my value 2',
  },
  {
    value: 'NoId_foovalue3',
    foo: 'NoId_foo value 3',
  },
]

let selectData

document.getElementById('butCreateId').addEventListener('click', () => {
  console.log(dataWithId)
  selectData = new mySelect({
    container,
    dataWithId,
    id: 'testSelect',
    allow_clear: true,
    placeholder: 'Mi placeholder',
    limit: 3,
    title: 'PRUEBA',
    on_selected: (selected) => console.log('SELECTED EVENT: ', selected),
  })
  console.log('======================== SELECT DATA', selectData)
  window.selectData = selectData
})

document.getElementById('butCreateNoId').addEventListener('click', () => {
  console.log(dataNoId)
  selectData = new mySelect({
    container,
    dataNoId,
    id: 'testSelect',
    field_text: 'foo',
    allow_clear: true,
    on_selected: (selected) => console.log('SELECTED EVENT: ', selected),
  })
  console.log('======================== SELECT DATA', selectData)
  window.selectData = selectData
})

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

document.getElementById('butTestLog').addEventListener('click', () => {
  console.log('======================== SELECT DATA', selectData)
})

let lastId = 3
const validateGeneralTest = () => {
  const index = document.getElementById('testIndex').value
  const value = document.getElementById('testValue').value

  if (index == '' || value == '')
    throw new Error('General test lack some input')

  return true
}
const logGeneralTest = (target) => {
  const index = document.getElementById('testIndex').value
  const value = document.getElementById('testValue').value
  console.groupCollapsed(`TEST`)
  console.log('target: ', target)
  console.log('index: ', index)
  console.log('value: ', value)
  console.groupEnd()
}
document.getElementById('testButProp').addEventListener('click', () => {
  validateGeneralTest()
  logGeneralTest('text')
  const index = document.getElementById('testIndex').value
  const value = document.getElementById('testValue').value
  const prop = document.getElementById('testProp').value

  selectData.data[index][prop] = value
})
document.getElementById('testButSelected').addEventListener('click', () => {
  const index = document.getElementById('testIndex').value
  if (index == '') throw new Error('General test lack some input')
  logGeneralTest('selected')

  selectData.selectedId = index
})

const validateArrayTest = () => {
  const text = document.getElementById('testArrayText').value
  const value = document.getElementById('testArrayValue').value

  if (text == '' || value == '') throw new Error('General test lack some input')
}
const logArrayTest = (action) => {
  const text = document.getElementById('testArrayText').value
  const value = document.getElementById('testArrayValue').value
  console.groupCollapsed(`TEST`)
  console.log('action: ', action)
  console.log('text: ', text)
  console.log('value: ', value)
  console.groupEnd()
}
document.getElementById('testButArrayPush').addEventListener('click', () => {
  validateArrayTest()
  logArrayTest('push')
  const text = document.getElementById('testArrayText').value
  const value = document.getElementById('testArrayValue').value
  const fieldText = document.getElementById('testArrayFieldText').value
  const fieldId = document.getElementById('testArrayFieldId').value

  const obj = {
    value,
  }
  if (fieldText && fieldText != '') obj[fieldText] = text
  if (fieldId && fieldId != '') obj[fieldId] = lastId
  console.log('push ', obj)
  ++lastId
  console.log('========= ', JSON.stringify(selectData.options, null, 4))
  selectData.data.push(obj)
})
document.getElementById('testButArrayPop').addEventListener('click', () => {
  logArrayTest('pop')
  console.log('pop')
  selectData.data.pop()
})
document.getElementById('testButArrayUnshift').addEventListener('click', () => {
  validateArrayTest()
  logArrayTest('unshift')
  const text = document.getElementById('testArrayText').value
  const value = document.getElementById('testArrayValue').value
  const fieldText = document.getElementById('testArrayFieldText').value
  const fieldId = document.getElementById('testArrayFieldId').value

  const obj = {
    value,
  }
  if (fieldText && fieldText != '') obj[fieldText] = text
  if (fieldId && fieldId != '') obj[fieldId] = lastId
  console.log('unshift ', obj)
  ++lastId
  selectData.data.unshift(obj)
})
document.getElementById('testButArrayShift').addEventListener('click', () => {
  logArrayTest('shift')
  console.log('shift')
  selectData.data.shift()
})

document.getElementById('testButSort').addEventListener('click', () => {
  console.groupCollapsed('sorting')
  const text = document.getElementById('testSortEval').value
  selectData.data = selectData.data.sort((a, b) => eval(text))
  console.groupEnd()
})
