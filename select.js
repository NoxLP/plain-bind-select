export function mySelect(container, dataArray, config) {
  if (!container || !dataArray || dataArray.length == 0) {
    console.error('Bad select params')
    return
  }

  const useIds = !config || !('useIds' in config) || config.useIds //default true

  const select = document.createElement('select')
  let options
  const returnArray = []

  const saveOption = (option, data) => {
    if (useIds) {
      if (!options) options = {}

      options[data.id] = { option, data }
    }
  }
  const findOption = (propName, propValue) => {
    if (propName == 'id' && useIds) return options[propValue]
    else if (useIds) return Object.values(options).find((o) => o.data[propName] == propValue)
  }
  const findOptionById = (id) => options[id]

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
    returnArray.push(new Proxy(returnElement, {
      set: (target, prop, value, receiver) => {
        console.log('TAR ', target)
        if (prop == 'id') throw new Error("Can't modify id value")

        if (prop == 'value' || prop == 'text') {
          const option = useIds ? findOptionById(target.id) : findOption(prop, value)
          console.log(option);
          option.option[prop] = value
        }

        return Reflect.set(target, prop, value, receiver)
      }
    }))

    const option = document.createElement('option')
    console.log(el)
    option.value = el.value
    option.text = el.text
    saveOption(option, el)
    select.appendChild(option)
  })


  const returnData = {
    data: returnArray
  }

  container.appendChild(select)
  return returnArray
}