const saveOption = (options, useIds, option, data, menu) => {
  if (useIds) {
    if (!options) options = {}

    options[data.id] = { option, data }
  }
  menu.appendChild(option)
  return options
}
const findOption = (options, useIds, propName, propValue) => {
  if (propName == 'id' && useIds) return options[propValue]
  else if (useIds) return Object.values(options).find((o) => o.data[propName] == propValue)
}
const findOptionById = (options, id) => options[id]
const createOption = (el, config) => {
  const option = document.createElement('option')
  option.classList.add('dropdown-item')
  option.id = `${config.id}_option_${el.id}`
  option.value = el.value
  option.text = el.text
  return option
}

const setOptions = (useIds, dataArray, menu, config) => {
  let options
  const dataProxiesArray = []
  dataArray.forEach((el) => {
    if (!el.value || !el.text || (useIds && !el.id)) {
      console.error('Objects must have minimum "value" and "text" properties. And "id" property if "useIds" config is activated')
      return
    }
    const returnElement = {
      value: el.value,
      text: el.text
    }
    if (useIds) returnElement.id = el.id
    dataProxiesArray.push(new Proxy(returnElement, {
      set: (target, prop, value, receiver) => {
        console.log('TAR ', target)
        if (prop == 'id') throw new Error("Can't modify id value")

        if (prop == 'value' || prop == 'text') {
          const option = useIds ? findOptionById(options, target.id) :
            findOption(options, useIds, prop, value)
          console.log(option);
          option.option[prop] = value
        }

        return Reflect.set(target, prop, value, receiver)
      }
    }))

    const option = createOption(el, config)
    options = saveOption(options, useIds, option, el, menu)
  })

  return [options, dataProxiesArray]
}

export function mySelect(container, dataArray, config) {
  if (!container || !dataArray || dataArray.length == 0) {
    console.error('Bad select params')
    return
  }

  let filteredData
  let returnObject

  const useIds = !config || !('useIds' in config) || config.useIds //default true

  const dropdown = document.createElement('div')
  dropdown.classList.add('dropdown')

  const button = document.createElement('button')
  button.classList.add('form-control', 'dropdown-toggle', 'text-left')
  button.type = 'button'
  button.id = config.id
  button.dataset.toggle = 'dropdown'

  const menu = document.createElement('div')
  menu.classList.add('dropdown-menu', 'w-100', 'p-2')
  menu.setAttribute('aria-labelledby', config.id)

  dropdown.appendChild(button)
  dropdown.appendChild(menu)

  if (!config || !('filter' in config) || config.filter) {
    const filter = document.createElement('input')
    filter.classList.add('form-control', 'mb-2')
    filter.type = 'text'

    menu.appendChild(filter)
    filter.addEventListener('change', () => {
      returnObject.data = returnObject.data.filter((el) =>
        el.text.includes(filter.value) || el.value.includes(filter.value)
      )
    })
  }

  const [options, dataProxiesArray] = setOptions(useIds, dataArray, menu, config)

  console.log('options ', options)
  console.log('proxies ', dataProxiesArray)
  filteredData = [...dataProxiesArray]
  returnObject = new Proxy({
    data: filteredData
  }, {
    set: (target, prop, value, receiver) => {
      console.log('set data')
      if (prop == 'data') {
        if (!Array.isArray(value)) throw new Error('Data must be an array')

        value.forEach((el) => {
          const oldOption = findOptionById(options, el.id)
          if (oldOption) oldOption.option.style.display = "none"
          else {
            const newOption = createOption(el, config)
            saveOption(options, useIds, newOption, el, menu)
          }
        })
      }

      return Reflect.set(target, prop, value, receiver)
    }
  })

  container.appendChild(dropdown)
  return returnObject
}