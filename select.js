const ERROR_ADDED_BAD_OBJECT =
  "Bad object. If select is using ids the object must have an 'id' " +
  'property, and in any case the object must have a property ' +
  "'value' and a property as configured in field_text, and when " +
  "not configured, simply called 'text': "

const isDataOfOption = (select, option, data) => {
  console.log('-- isDataOfOption')
  if (!data)
    throw new Error("isDataOfOption: Can't compare option to undefined")

  return (
    option &&
    (option.data[select.fieldText] == data[select.fieldText] ||
      option.data.value == data.value)
  )
}

const saveOption = (
  select,
  option,
  data,
  index = undefined,
  id = undefined
) => {
  if (!select.options) select.options = {}
  if (select.useIds) {
    select.options[data[select.fieldId]] = { option, data }
  } else {
    if (id === undefined)
      throw new Error('If not using ids, saveOption function needs an id')
    select.options[id] = { option, data }
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
  console.log('********* removeOptionById ', id)
  if (returnObject.selectedId == id) {
    returnObject.selectedId = undefined
    returnObject.selectedOption = undefined
  }
  select.options[select.fieldId].option.remove()
  delete select.options[select.fieldId]
}

const removeOption = (select, returnObject, data) => {
  console.log('********* removeOptionById ', data)
  if (isDataOfOption(select, returnObject.selectedOption, data)) {
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
  console.log('- findOption')
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
      ? Object.values(select.returnObject.options).find((o) =>
          isDataOfOption(select, o, data)
        )
      : Object.keys(select.returnObject.options).find((key) =>
          isDataOfOption(select, select.options[key], data)
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
    if (select.button.classList.contains('text-muted'))
      select.button.classList.remove('text-muted')
  } else {
    select.returnObject.selectedId = undefined
    select.returnObject.selectedOption = undefined
    if (
      select.config &&
      select.config.placeholder &&
      select.config.placeholder != ''
    ) {
      if (!select.button.classList.contains('text-muted'))
        select.button.classList.add('text-muted')
      select.button.innerHTML = select.config.placeholder
    } else select.button.innerHTML = ''
  }

  if (select.returnObject.config && select.returnObject.config.on_selected)
    select.returnObject.config.on_selected(select.returnObject.selectedOption)
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
    if (select.button.classList.contains('text-muted'))
      select.button.classList.remove('text-muted')
  } else {
    select.returnObject.selectedId = undefined
    select.returnObject.selectedOption = undefined
    if (
      select.config &&
      select.config.placeholder &&
      select.config.placeholder != ''
    ) {
      if (!select.button.classList.contains('text-muted'))
        select.button.classList.add('text-muted')
      select.button.innerHTML = select.config.placeholder
    } else select.button.innerHTML = ''
  }

  if (select.returnObject.config && select.returnObject.config.on_selected)
    select.returnObject.config.on_selected(select.returnObject.selectedOption)
  select.selectedByScript = false
}

const buildDOMOptionId = (configid, elid) => `${configid}_option_${elid}`

const createOption = (select, el, id) => {
  const option = document.createElement('option')
  option.classList.add('dropdown-item')
  option.id = buildDOMOptionId(
    select.config.id,
    id !== undefined ? id : el[select.fieldId]
  )
  option.value = el.value
  option.text = el[select.fieldText]
  option.addEventListener(
    'click',
    select.useIds
      ? () => setSelectedOptionById(select, el[select.fieldId])
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
      if (prop == select.fieldId) throw new Error("Can't modify id value")

      if (prop == 'value' || prop == select.fieldText) {
        const option = select.useIds
          ? findOptionById(select, target[select.fieldId])
          : findOption(select, undefined, undefined, target)
        console.log(option)
        if (prop == select.fieldText) option.option.text = value
        else option.option.value = value

        console.log('Selected: ', select.returnObject.selectedId)
        console.log(target[select.fieldId])
        if (
          select.returnObject.selectedId != undefined &&
          select.returnObject.selectedId == target[select.fieldId]
        ) {
          console.log('changing selected ', value)
          select.button.innerHTML = value
        }
      }

      return Reflect.set(target, prop, value, receiver)
    },
  })

const filter = (select) => {
  console.log('--------- FILTER ', JSON.stringify(select, null, 4))
  select.returnObject.data = select.dataProxiesArray.filter(
    (el) =>
      el[select.fieldText].includes(select.filterInput.value) ||
      el.value.includes(select.filterInput.value)
  )
}

const setOptions = (select, dataArray) => {
  let options
  const dataProxiesArray = []
  const data = select.limit ? dataArray.slice(0, select.limit) : dataArray
  data.forEach((el) => {
    if (
      (select.useIds && !(select.fieldId in el)) ||
      !(select.fieldText in el) ||
      !('value' in el)
    ) {
      throw new Error(`${ERROR_ADDED_BAD_OBJECT}${JSON.stringify(el, null, 4)}`)
    } else if (!select.useIds) {
      if (!('lastId' in select)) select.lastId = -1

      select.lastId++
    }

    dataProxiesArray.push(createDataProxy(select, el))
    const option = createOption(
      select,
      el,
      !select.useIds ? select.lastId : undefined
    )
    options = saveOption(
      select,
      option,
      el,
      undefined,
      !select.useIds ? select.lastId : undefined
    )
  })

  return [options, dataProxiesArray]
}

export function mySelect(container, dataArray, configObject) {
  if (!container || !dataArray || dataArray.length == 0) {
    throw new Error('Bad select params')
  }

  this.config = configObject
  this.fieldText =
    this.config && this.config.field_text && this.config.field_text != ''
      ? this.config.field_text
      : 'text'
  this.fieldId =
    this.config && this.config.field_id && this.config.field_id != ''
      ? this.config.field_id
      : 'id'
  this.useIds =
    (!this.config || (this.fieldId && this.fieldId != '')) &&
    dataArray.every((d) => this.fieldId in d)
  this.limit = this.config && this.config.limit ? this.config.limit : undefined

  console.log('--- use ids: ', this.useIds)

  const dropdown = document.createElement('div')
  dropdown.classList.add('dropdown')
  if (this.config && this.config.title && this.config.title != '') {
    dropdown.setAttribute('data-toggle', this.config.title)
    if (
      !this.config ||
      !this.config['data-placement'] ||
      this.config['data-placement'] == ''
    ) {
      dropdown.setAttribute('data-placement', 'bottom')
    }
  }

  this.button = document.createElement('button')
  this.button.classList.add('form-control', 'dropdown-toggle', 'text-left')
  this.button.type = 'button'
  this.button.id = this.config.id
  this.button.dataset.toggle = 'dropdown'
  if (this.config && this.config.placeholder && this.config.placeholder != '') {
    this.button.classList.add('text-muted')
    this.button.innerHTML = this.config.placeholder
  }

  this.menu = document.createElement('div')
  this.menu.classList.add('dropdown-menu', 'w-100')
  this.menu.setAttribute('aria-labelledby', this.config.id)

  if (this.config && this.config.allow_clear) {
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

  if (
    !this.config ||
    !('search_box' in this.config) ||
    this.config.search_box
  ) {
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
  let mySelect = this
  const filteredDataProxy = new Proxy(this.dataProxiesArray, {
    get: (target, prop, receiver) => {
      console.log('$$$$$$$ FiltData GET ', prop, target)
      if (prop == 'push') {
        return (...args) => {
          args.forEach((value) => {
            console.groupCollapsed('------------ push: ', value)
            if (
              (mySelect.useIds && !(mySelect.fieldId in value)) ||
              !(mySelect.fieldText in value) ||
              !('value' in value)
            ) {
              throw new Error(
                `${ERROR_ADDED_BAD_OBJECT}${JSON.stringify(value, null, 4)}`
              )
            }

            dataArray.push(value)
            mySelect.dataProxiesArray.push(createDataProxy(mySelect, value))

            const option = createOption(mySelect, value)
            mySelect.options = saveOption(
              mySelect,
              option,
              value,
              undefined,
              !mySelect.useIds ? ++mySelect.lastId : undefined
            )
          })
          filter(mySelect)
          console.groupEnd()
        }
      } else if (prop == 'pop') {
        return () => {
          const data = dataArray.pop()
          mySelect.dataProxiesArray.pop()
          console.log('DATA ', data)

          if (mySelect.useIds)
            removeOptionById(
              mySelect,
              mySelect.returnObject,
              data[mySelect.fieldId]
            )
          else removeOption(mySelect, mySelect.returnObject, data)

          filter(mySelect)
        }
      } else if (prop == 'unshift') {
        return (...args) => {
          args.forEach((value, idx) => {
            if (
              (mySelect.useIds && !(mySelect.fieldId in value)) ||
              !(mySelect.fieldText in value) ||
              !('value' in value)
            ) {
              throw new Error(
                `${ERROR_ADDED_BAD_OBJECT}${JSON.stringify(value, null, 4)}`
              )
            }

            dataArray.splice(idx, 0, value)
            mySelect.dataProxiesArray.splice(
              idx,
              0,
              createDataProxy(mySelect, value)
            )

            const option = createOption(mySelect, value)
            mySelect.options = saveOption(
              mySelect,
              option,
              value,
              idx,
              !mySelect.useIds ? ++mySelect.lastId : undefined
            )
          })
          filter(mySelect)
        }
      } else if (prop == 'shift') {
        return () => {
          const data = dataArray.shift()
          mySelect.dataProxiesArray.shift()
          console.log('DATA ', data)

          if (mySelect.useIds)
            removeOptionById(
              mySelect,
              mySelect.returnObject,
              data[mySelect.fieldId]
            )
          else removeOption(mySelect, mySelect.returnObject, data)

          filter(mySelect)
        }
      } else if (prop == 'sort') {
        return (...args) => {
          dataArray.sort(...args)
          mySelect.dataProxiesArray.sort(...args)

          mySelect.menu.innerHTML = ''
          dataArray.forEach((data) => {
            const option = mySelect.useIds
              ? findOptionById(mySelect, data[mySelect.fieldId]).option
              : findOption(mySelect, null, null, data).option
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

  mySelect = this
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
        console.log('set data ', prop, target, value)

        if (prop == 'length') return true

        if (prop == 'data') {
          console.log('>> data changed: ', value)
          if (!Array.isArray(value)) throw new Error('Data must be an array')

          value.forEach((el) => {
            // add new options
            console.log('add new options ', el)
            const oldOption = mySelect.useIds
              ? findOptionById(mySelect, el[mySelect.fieldId])
              : findOption(mySelect, null, null, el)
            if (oldOption) oldOption.option.style.display = ''
            else {
              const newOption = createOption(mySelect, el)
              saveOption(
                mySelect,
                newOption,
                el,
                undefined,
                !mySelect.useIds ? ++mySelect.lastId : undefined
              )
            }
          })
          Object.values(target.options).forEach((opt) => {
            // remove old options
            console.log('>> remove old options')
            if (
              (mySelect.useIds &&
                !value.some((v) => {
                  console.log('>>> SOME: ', v)
                  return v[mySelect.fieldId] == opt.data[mySelect.fieldId]
                })) ||
              (!mySelect.useIds &&
                !value.some((v) => isDataOfOption(mySelect, opt, v)))
            ) {
              console.log('NOT IN ', opt)
              opt.option.style.display = 'none'
            }
          })

          return filteredDataProxy
        } else if (prop == 'selectedId') {
          if (value && value < 0) value = undefined

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
