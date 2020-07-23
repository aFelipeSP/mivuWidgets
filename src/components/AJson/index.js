import('./AJson.sass')

let isParent = (v) => Array.isArray(v) || (typeof v === 'object' && v != null)

const AJsonItem = {
  props: {
    name: String,
    value: [Array, Number, String, Boolean, Object],
  },
  data () {
    return {
      closed: true
    }
  },
  render (h) {
    let isPar = isParent(this.value)
    let title = [
      h('div', {class: 'a-json-title-before a-json-l-line'}),
      h('div', {
        class: ['a-json-title-' + (isPar ? 'tick' : 'ntick'), {'collapsed': this.closed}],
        on: { click: () => this.closed = !this.closed }
      }),
      h('div', {class: 'a-json-title-after a-json-h-line'})
    ]

    title.push(h('div',
      {style: 'font-weight:bold;margin-right:5px;display:flex;align-items:center'},
      [this.name + (isPar ? '' : ':')])
    )

    if (!isPar) {
      title.push(h('div', {style: 'flex:1'}, 
        [h(AJson, {props:{ value: this.value}})]))
    } else title.push(h('div', {style: 'flex:1'}))

    let els = [h('div', {class: 'a-json-title'}, title)]

    if (isPar && !this.closed) els.push(h('div', {class: 'a-json-content'},
      [h(AJson, {props: {value: this.value}})]))

    return h('div', {class: 'a-json-item'}, els)
  }
}


const AJson = {
  name: 'a-json',
  props: {
    value: [Array, Number, String, Boolean, Object]
  },
  render (h) {
    if (typeof this.value === 'number') {
      return h('span', {style: 'color:#cc6666'}, [this.value])
    } else if (typeof this.value === 'string') {
      return h('span', {style: 'color:#739900'}, [this.value])
    } else if (typeof this.value === 'boolean') {
      return h('span', {style: 'color:blue'}, [String(this.value)])
    } else if (isParent(this.value)) {
      let els = []
      for (let key in this.value) {
        els.push(h(AJsonItem, {props: {name: key, value: this.value[key]}}))
      }
      return h('div', {}, els)
    }
  }
}

export default AJson