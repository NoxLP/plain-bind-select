let options, useIds, config, menu, returnObject, dataProxiesArray,
  filterInput, button, selectedByScript

const saveOption = (option, data, index = undefined) => {
  if (useIds) {
    if (!options) options = {}

    options[data.id] = { option, data }
  }

  if (index == undefined || index == null || index > menu.children.length)
    menu.appendChild(option)
  else menu.insertBefore(option, menu.children[index + 1])
  return options
}

const removeOptionById = (id) => {
  if (returnObject.selectedId == id) returnObject.selectedId = undefined
  options[id].option.remove()
  delete options[id]
}

const findOption = (propName, propValue) => {
  if (propName == 'id' && useIds) return options[propValue]
  else if (useIds) return Object.values(options).find((o) => o.data[propName] == propValue)
}

const findOptionById = (id) => options[id]

const setSelectedOptionById = (id) => {
  if (returnObject.selectedId != undefined) {
    const oldSelected = findOptionById(returnObject.selectedId)
    oldSelected.option.classList.remove('active')
  }

  selectedByScript = true
  if (id !== undefined && id !== null) {
    returnObject.selectedId = id
    console.log('selectid ', returnObject.selectedId)
    const option = findOptionById(id)
    button.innerHTML = option.option.text

    returnObject.selectedOption = findOptionById(returnObject.selectedId)
    console.log('selected option ', returnObject.selectedOption)
    returnObject.selectedOption.option.classList.add('active')
  } else {
    returnObject.selectedId = undefined
    returnObject.selectedOption = undefined
    button.innerHTML = ''
  }

  if (config && config.onSelected) config.onSelected(returnObject.selectedOption)
  selectedByScript = false
}

const buildDOMOptionId = (configid, elid) => {
  `${configid}_option_${elid}`
}
const createOption = (el) => {
  const option = document.createElement('option')
  option.classList.add('dropdown-item')
  option.id = buildDOMOptionId(config.id, el.id)
  option.value = el.value
  option.text = el.text
  option.addEventListener('click', () => setSelectedOptionById(el.id))
  return option
}

const createDataProxy = (data) => (
  new Proxy(data, {
    get: (target, prop, receiver) => {
      console.log('ELEM GET ', prop)
      return Reflect.get(target, prop, receiver)
    },
    set: (target, prop, value, receiver) => {
      console.log('TAR ', prop, target)
      if (prop == 'id') throw new Error("Can't modify id value")

      if (prop == 'value' || prop == 'text') {
        const option = useIds ? findOptionById(target.id) :
          findOption(prop, value)
        console.log(option);
        option.option[prop] = value

        console.log('Selected: ', returnObject.selectedId)
        console.log(target.id);
        if (returnObject.selectedId != undefined
          && returnObject.selectedId == target.id) {
          console.log('changing selected ', value)
          button.innerHTML = value
        }
      }

      return Reflect.set(target, prop, value, receiver)
    }
  })
)

const filter = () => {
  returnObject.data = dataProxiesArray.filter((el) =>
    el.text.includes(filterInput.value) || el.value.includes(filterInput.value)
  )
}

const setOptions = (dataArray) => {
  let options
  const dataProxiesArray = []
  dataArray.forEach((el) => {
    console.log('> el ', el)
    if (!el.value || !el.text || (useIds && !('id' in el))) {
      console.error('Objects must have minimum "value" and "text" properties. And "id" property if "useIds" config is activated')
      return
    }
    const returnElement = {
      value: el.value,
      text: el.text
    }
    if (useIds) returnElement.id = el.id
    dataProxiesArray.push(createDataProxy(returnElement))

    const option = createOption(el, config)
    options = saveOption(option, el)
  })

  return [options, dataProxiesArray]
}

export function mySelect(container, dataArray, configObject) {
  if (!container || !dataArray || dataArray.length == 0) {
    console.error('Bad select params')
    return
  }

  config = configObject
  let filteredData

  useIds = !config || !('useIds' in config) || config.useIds //default true

  const dropdown = document.createElement('div')
  dropdown.classList.add('dropdown')

  button = document.createElement('button')
  button.classList.add('form-control', 'dropdown-toggle', 'text-left')
  button.type = 'button'
  button.id = config.id
  button.dataset.toggle = 'dropdown'

  menu = document.createElement('div')
  menu.classList.add('dropdown-menu', 'w-100')
  menu.setAttribute('aria-labelledby', config.id)

  if (config && config.clearButton) {
    const group = document.createElement('div')
    group.classList.add('input-group')
    const clearButton = document.createElement('button')
    clearButton.type = 'button'
    clearButton.classList.add('btn', 'shadow-none', 'bg-transparent',
      'select-clear-button', 'my-auto', 'd-flex', 'align-items-center',
      'justify-content-center')
    const icon = document.createElement('i')
    icon.classList.add('fa', 'fa-times', 'fa-xs')
    clearButton.appendChild(icon)
    clearButton.addEventListener('click', () => {
      setSelectedOptionById(undefined)
    })

    button.classList.add('rounded')

    group.appendChild(button)
    group.appendChild(clearButton)
    group.appendChild(menu)
    dropdown.appendChild(group)
  } else {
    dropdown.appendChild(button)
    dropdown.appendChild(menu)
  }

  if (!config || !('filter' in config) || config.filter) {
    filterInput = document.createElement('input')
    filterInput.classList.add('form-control', 'mb-3', 'mx-auto')
    filterInput.style.width = '97%'
    filterInput.type = 'text'

    menu.appendChild(filterInput)
    filterInput.addEventListener('keyup', () => {
      console.log('filterInput')
      filter()
    })
  }

  [options, dataProxiesArray] = setOptions(dataArray)

  console.log('options ', options)
  console.log('proxies ', dataProxiesArray)
  filteredData = [...dataProxiesArray]
  const filteredDataProxy = new Proxy(filteredData, {
    get: (target, prop, receiver) => {
      console.log('FiltData GET ', prop)
      if (prop == 'push') {
        return (...args) => {
          args.forEach((value) => {
            dataArray.push(value)
            dataProxiesArray.push(value)

            const option = createOption(value, config)
            options = saveOption(option, value)
          })
          filter()
        }
      } else if (prop == 'pop') {
        return () => {
          const data = dataArray.pop()
          dataProxiesArray.pop()
          console.log('DATA ', data)

          if (useIds) removeOptionById(data.id)
          else { }
          filter()
        }
      } else if (prop == 'unshift') {
        return (...args) => {
          args.forEach((value, idx) => {
            dataArray.splice(idx, 0, value)
            dataProxiesArray.splice(idx, 0, createDataProxy(value))

            const option = createOption(value, config)
            options = saveOption(option, value, idx)
          })
          filter()
        }
      } else if (prop == 'shift') {
        return () => {
          const data = dataArray.shift()
          dataProxiesArray.shift()
          console.log('DATA ', data)

          if (useIds) removeOptionById(data.id)
          else { }
          filter()
        }
      } else if (prop == 'sort') {
        return (...args) => {
          dataArray.sort(...args)
          dataProxiesArray.sort(...args)

          menu.innerHTML = ''
          dataArray.forEach((data) => {
            const option = findOptionById(data.id).option
            if (option)
              menu.appendChild(option)
          })
          filter()
          return dataProxiesArray
        }
      }

      return Reflect.get(target, prop, receiver)
    },
    set: (target, prop, value, receiver) => {
      console.log('FiltData SET ', prop, value)
      if (prop == 'length') return true

      return Reflect.set(target, prop, value, receiver)
    },
  })

  returnObject = new Proxy({
    menu,
    button,
    filterInput,
    dropdown,
    data: filteredDataProxy,
    selectedId: undefined,
    selectedOption: undefined,
    findOption,
    findOptionById
  }, {
    get: (target, prop, receiver) => {
      console.log('GET ', prop)
      return Reflect.get(target, prop, receiver)
    },
    set: (target, prop, value, receiver) => {
      console.log('set data ', prop, value)

      if (prop == 'length') return true

      if (prop == 'data') {
        if (!Array.isArray(value)) throw new Error('Data must be an array')

        value.forEach((el) => {
          const oldOption = findOptionById(el.id)
          if (oldOption) oldOption.option.style.display = ""
          else {
            const newOption = createOption(el)
            console.log('new option ', el)
            saveOption(newOption, el)
          }
        })
        Object.values(options).forEach((opt) => {
          if (!value.some((v) => v.id == opt.data.id)) {
            console.log('NOT IN ', opt)
            opt.option.style.display = "none"
          }
        })

        return filteredDataProxy
      } else if (prop == 'selectedId') {
        if (!selectedByScript) setSelectedOptionById(value)
        else return Reflect.set(target, prop, value, receiver)
      } else if (prop == 'selectedOption' && selectedByScript)
        return Reflect.set(target, prop, value, receiver)

      return true
    }
  })

  container.appendChild(dropdown)
  return returnObject
}