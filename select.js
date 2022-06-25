const isDataOfOption = (option, data) =>
  option.data.text == data.text || option.data.value == data.value

const saveOption = (select, option, data, index = undefined) => {
  if (!select.options) select.options = {}
  if (select.useIds) {
    select.options[data.id] = { option, data }
  } else {
    select.options[select.lastId] = { option, data }
  }

  if (
    index == undefined ||
    index == null ||
    index > select.menu.children.length
  )
    select.menu.appendChild(option)
  else select.menu.insertBefore(option, select.menu.children[index + 1])
  return select.options
}

const removeOptionById = (select, returnObject, id) => {
  if (returnObject.selectedId == id) {
    returnObject.selectedId = undefined
    returnObject.selectedOption = undefined
  }
  select.options[id].option.remove()
  delete select.options[id]
}

const removeOption = (select, returnObject, data) => {
  if (isDataOfOption(returnObject.selectedOption, data)) {
    returnObject.selectedOption.option.remove()
    delete select.options[returnObject.selectedId]
    returnObject.selectedOption = undefined
    returnObject.selectedId = undefined
  } else {
    const key = findOption(select, null, null, data, true)
    select.options[key].option.remove()
    delete select.options[key]
  }
}

const findOption = (select, propName, propValue, data, returnId = false) => {
  if (propName && propValue) {
    return Object.values(select.options).find(
      (o) => o.data[propName] == propValue
    )
  } else {
    if (!data) {
      throw new Error(
        "Data not provided. If prop name and value aren't provided, data must be provided to check for text or value"
      )
    }

    return !returnId
      ? Object.values(select.options).find((o) => isDataOfOption(o, data))
      : Object.keys(select.options).find((key) =>
          isDataOfOption(select.options[key], data)
        )
  }
}

const findOptionById = (select, id) => select.options[id]

const setSelectedOptionById = (select, id) => {
  if (select.returnObject.selectedId != undefined) {
    select.returnObject.selectedOption.option.classList.remove('active')
  }

  select.selectedByScript = true
  if (id !== undefined && id !== null) {
    select.returnObject.selectedId = id
    console.log('selectid ', select.returnObject.selectedId)
    const option = findOptionById(select, id)
    select.button.innerHTML = option.option.text

    select.returnObject.selectedOption = option
    console.log('selected option ', select.returnObject.selectedOption)
    select.returnObject.selectedOption.option.classList.add('active')
  } else {
    select.returnObject.selectedId = undefined
    select.returnObject.selectedOption = undefined
    select.button.innerHTML = ''
  }

  if (select.returnObject.config && select.returnObject.config.onSelected)
    select.returnObject.config.onSelected(select.returnObject.selectedOption)
  select.selectedByScript = false
}

const setSelectedOption = (select, el) => {
  if (select.returnObject.selectedOption != undefined) {
    select.returnObject.selectedOption.option.classList.remove('active')
  }

  select.selectedByScript = true
  if (el !== undefined && el !== null) {
    const key = findOption(select, null, null, el, true)
    const option = select.options[key]
    select.button.innerHTML = option.option.text

    select.returnObject.selectedId = key
    select.returnObject.selectedOption = option
    console.log('selected option ', select.returnObject.selectedOption)
    select.returnObject.selectedOption.option.classList.add('active')
  } else {
    select.returnObject.selectedId = undefined
    select.returnObject.selectedOption = undefined
    select.button.innerHTML = ''
  }

  if (select.returnObject.config && select.returnObject.config.onSelected)
    select.returnObject.config.onSelected(select.returnObject.selectedOption)
  select.selectedByScript = false
}

const buildDOMOptionId = (configid, elid) => `${configid}_option_${elid}`

const createOption = (select, el) => {
  const option = document.createElement('option')
  option.classList.add('dropdown-item')
  option.id = buildDOMOptionId(select.config.id, el.id)
  option.value = el.value
  option.text = el.text
  option.addEventListener(
    'click',
    select.useIds
      ? () => setSelectedOptionById(select, el.id)
      : () => setSelectedOption(select, el)
  )
  return option
}

const createDataProxy = (select, data) =>
  new Proxy(data, {
    get: (target, prop, receiver) => {
      console.log('ELEM GET ', prop)
      return Reflect.get(target, prop, receiver)
    },
    set: (target, prop, value, receiver) => {
      console.log('TAR ', prop, target)
      if (prop == 'id') throw new Error("Can't modify id value")

      if (prop == 'value' || prop == 'text') {
        const option = select.useIds
          ? findOptionById(select, target.id)
          : findOption(select, prop, value)
        console.log(option)
        option.option[prop] = value

        console.log('Selected: ', select.returnObject.selectedId)
        console.log(target.id)
        if (
          select.returnObject.selectedId != undefined &&
          select.returnObject.selectedId == target.id
        ) {
          console.log('changing selected ', value)
          select.button.innerHTML = value
        }
      }

      return Reflect.set(target, prop, value, receiver)
    },
  })

const filter = (select) => {
  console.log('FILTER ', select)
  select.returnObject.data = select.dataProxiesArray.filter(
    (el) =>
      el.text.includes(select.filterInput.value) ||
      el.value.includes(select.filterInput.value)
  )
}

const setOptions = (select, dataArray) => {
  let options
  const dataProxiesArray = []
  dataArray.forEach((el) => {
    console.log('> el ', el)
    if (!el.value || !el.text || (select.useIds && !('id' in el))) {
      console.error(
        'Objects must have minimum "value" and "text" properties. And "id" property if "useIds" config is activated'
      )
      return
    } else if (!select.useIds) {
      if (!('lastId' in select)) select.lastId = -1

      select.lastId++
    }

    dataProxiesArray.push(createDataProxy(select, el))
    const option = createOption(select, el)
    options = saveOption(select, option, el)
  })

  return [options, dataProxiesArray]
}

export function mySelect(container, dataArray, configObject) {
  if (!container || !dataArray || dataArray.length == 0) {
    console.error('Bad select params')
    return
  }

  this.config = configObject
  this.useIds =
    (!this.config || !('useIds' in this.config) || this.config.useIds) &&
    dataArray.every((d) => 'id' in d)

  const dropdown = document.createElement('div')
  dropdown.classList.add('dropdown')

  this.button = document.createElement('button')
  this.button.classList.add('form-control', 'dropdown-toggle', 'text-left')
  this.button.type = 'button'
  this.button.id = this.config.id
  this.button.dataset.toggle = 'dropdown'

  this.menu = document.createElement('div')
  this.menu.classList.add('dropdown-menu', 'w-100')
  this.menu.setAttribute('aria-labelledby', this.config.id)

  if (this.config && this.config.clearButton) {
    const group = document.createElement('div')
    group.classList.add('input-group')
    const clearButton = document.createElement('button')
    clearButton.type = 'button'
    clearButton.classList.add(
      'btn',
      'shadow-none',
      'bg-transparent',
      'select-clear-button',
      'my-auto',
      'd-flex',
      'align-items-center',
      'justify-content-center'
    )
    const icon = document.createElement('i')
    icon.classList.add('fa', 'fa-times', 'fa-xs')
    clearButton.appendChild(icon)
    clearButton.addEventListener(
      'click',
      this.useIds
        ? () => {
            setSelectedOptionById(this, undefined)
          }
        : () => {
            setSelectedOption(this, undefined)
          }
    )

    this.button.classList.add('rounded')

    group.appendChild(this.button)
    group.appendChild(clearButton)
    group.appendChild(this.menu)
    dropdown.appendChild(group)
  } else {
    dropdown.appendChild(this.button)
    dropdown.appendChild(this.menu)
  }

  if (!this.config || !('filter' in this.config) || this.config.filter) {
    this.filterInput = document.createElement('input')
    this.filterInput.classList.add('form-control', 'mb-3', 'mx-auto')
    this.filterInput.style.width = '97%'
    this.filterInput.type = 'text'

    this.menu.appendChild(this.filterInput)
    this.filterInput.addEventListener('keyup', () => {
      console.log('filterInput')
      filter(this)
    })
  }

  ;[this.options, this.dataProxiesArray] = setOptions(this, dataArray)

  console.log('options ', this.options)
  console.log('proxies ', this.dataProxiesArray)
  const mySelect = this
  const filteredDataProxy = new Proxy(this.dataProxiesArray, {
    get: (target, prop, receiver) => {
      console.log('FiltData GET ', prop)
      if (prop == 'push') {
        return (...args) => {
          args.forEach((value) => {
            dataArray.push(value)
            mySelect.dataProxiesArray.push(value)

            const option = createOption(mySelect, value)
            mySelect.options = saveOption(mySelect, option, value)
          })
          filter(mySelect)
        }
      } else if (prop == 'pop') {
        return () => {
          const data = dataArray.pop()
          mySelect.dataProxiesArray.pop()
          console.log('DATA ', data)

          if (mySelect.useIds)
            removeOptionById(mySelect, mySelect.returnObject, data.id)
          else removeOption(mySelect, mySelect.returnObject, data)

          filter(mySelect)
        }
      } else if (prop == 'unshift') {
        return (...args) => {
          args.forEach((value, idx) => {
            dataArray.splice(idx, 0, value)
            mySelect.dataProxiesArray.splice(
              idx,
              0,
              createDataProxy(mySelect, value)
            )

            const option = createOption(mySelect, value)
            mySelect.options = saveOption(mySelect, option, value, idx)
          })
          filter(mySelect)
        }
      } else if (prop == 'shift') {
        return () => {
          const data = dataArray.shift()
          mySelect.dataProxiesArray.shift()
          console.log('DATA ', data)

          if (mySelect.useIds)
            removeOptionById(mySelect, mySelect.returnObject, data.id)
          else removeOption(mySelect, mySelect.returnObject, data)

          filter(mySelect)
        }
      } else if (prop == 'sort') {
        return (...args) => {
          dataArray.sort(...args)
          mySelect.dataProxiesArray.sort(...args)

          mySelect.menu.innerHTML = ''
          dataArray.forEach((data) => {
            const option = findOptionById(mySelect, data.id).option
            if (option) mySelect.menu.appendChild(option)
          })
          filter(mySelect)
          return mySelect.dataProxiesArray
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

  this.returnObject = new Proxy(
    {
      options: this.options,
      menu: this.menu,
      button: this.button,
      filterInput: this.filterInput,
      dropdown,
      data: filteredDataProxy,
      selectedId: mySelect.selectedId,
      selectedOption: mySelect.selectedOption,
      findOption,
      findOptionById,
    },
    {
      get: (target, prop, receiver) => {
        console.log('GET ', prop)
        return Reflect.get(target, prop, receiver)
      },
      set: (target, prop, value, receiver) => {
        console.log('set data ', prop, value)

        if (prop == 'length') return true

        if (prop == 'data') {
          console.log('data changed')
          if (!Array.isArray(value)) throw new Error('Data must be an array')

          value.forEach((el) => {
            // add new options
            const oldOption = mySelect.useIds
              ? findOptionById(mySelect, el.id)
              : findOption(mySelect, null, null, el)
            if (oldOption) oldOption.option.style.display = ''
            else {
              const newOption = createOption(mySelect, el)
              console.log('new option ', el)
              saveOption(mySelect, newOption, el)
            }
          })
          Object.values(target.options).forEach((opt) => {
            // remove old options
            if (
              (mySelect.useIds && !value.some((v) => v.id == opt.data.id)) ||
              (!mySelect.useIds && !value.some((v) => isDataOfOption(opt, v)))
            ) {
              console.log('NOT IN ', opt)
              opt.option.style.display = 'none'
            }
          })

          return filteredDataProxy
        } else if (prop == 'selectedId') {
          if (!mySelect.selectedByScript) setSelectedOptionById(mySelect, value)
          return Reflect.set(target, prop, value, receiver)
        } else if (prop == 'selectedOption') {
          if (!mySelect.selectedByScript) setSelectedOption(mySelect, value)
          return Reflect.set(target, prop, value, receiver)
        }

        return true
      },
    }
  )

  container.appendChild(dropdown)
  return this.returnObject
}
