
<template>
  <div>
    <div
      contenteditable="true" 
      tabindex="0"
      @keyup="onkeyup"
      @paste="textPasted"
      ref="editor"
      spellCheck="false"
      autocapitalize="off"
      autocomplete="off"
      autocorrect="off"
      data-gramm="false"
      class="a-line-editor"
    />
    <a-portal :value="showAutocomplete">
      <a-overlay v-model="showAutocomplete" :opacity="0" >
        <div
          class="a-dropdown-box"
          :style="autocompleteStyle"
        >
          <div
            v-for="(item, index) in autocompleteValues"
            class="a-line-editor-suggestion"
            :key="index"
            v-text="item.content"
            @click="autocompleteClicked(item)"
          />
        </div>
      </a-overlay>
    </a-portal>
  </div>
</template>

<script>
/* eslint-disable no-console */
export default {
  props: {
    content: { type: Array, default: () => [] },
    autocompleteDef: { type: Object, default: () => ({}) },
    autocompleteTypes: { type: Object, default: () => ({}) }
  },
  data () {
    return {
      showAutocomplete: false,
      autocompleteStyle: {},
      autocompleteValues: [],
      currentNode: null,
      absolutePosition: null,
      relativePosition: null
    }
  },
  watch: {
    content: {
      handler (value) {
        if (this.$refs.editor && Array.isArray(value)) {
          this.changeStructure(value)
        }
      },
      immediate: true
    },
    showAutocomplete (nvalue) {
      if (nvalue) {
        window.addEventListener('resize', this.onresize)
      } else {
        window.removeEventListener('resize', this.onresize)
      }
      this.onresize()
    }
  },
  methods: {
    autocompleteClicked (item) {
      if (typeof this.autocompleteTypes[item.type] === 'string') {
        let offset = this.relativePosition
        let length = this.currentNode.innerText.length
        let pos = this.absolutePosition
        let code = this.$refs.editor.innerText
        let replace = this.autocompleteTypes[item.type].replace('##', item.content)
        let value = code.substr(0, pos - offset) + replace + code.substr(pos - offset + length)
        this.$emit('change', value)
        this.showAutocomplete = false
        // this.$refs.editor.focus()
        this.$nextTick(() => {
          this.setCurrentCursorPosition(pos - offset + replace.length)
        })
      }
    },
    changeStructure (value) {
      let pos = this.getCurrentCursorPosition()
      this.$refs.editor.innerText = ''

      for (let item of value) {
        this.addSpan(item)
      }
      if (pos != null) {
        this.setCurrentCursorPosition(pos)
        let node = window.getSelection().focusNode.parentNode
        if (
          node.dataset.type &&
          this.autocompleteDef[node.dataset.type]
        ) {
          this.currentNode = node
          this.absolutePosition = this.getCurrentCursorPosition()
          let selection = window.getSelection()
          this.relativePosition = selection.focusOffset
          let values = this.autocompleteDef[
            node.dataset.type]
          let text = this.currentNode.innerText
          if (text != '') {
            this.autocompleteValues = values.filter(
              el => el.content.startsWith(text))
          }
          this.showAutocomplete = true
        }
      }

    },
    onkeyup (e) {
      this.showAutocomplete = false
      let value = e.target.innerText
      this.$emit('change', value)
    },
    addSpan (data) {
      let newSpan = document.createElement('span')
      if (/^ +$/.test(data.content)) {
        newSpan.innerHTML = ''
      }
      newSpan.innerText = data.content
      for (let prop in (data.style || {})) {
        newSpan.style[prop] = data.style[prop]
      }
      if (data.type) newSpan.dataset.type = data.type
      this.$refs.editor.appendChild(newSpan)
    },
    textPasted (e) {
      e.stopPropagation()
      e.preventDefault()
      let clipboardData = e.clipboardData || window.clipboardData
      let pos = this.getCurrentCursorPosition()
      let text = clipboardData.getData('Text')
      document.execCommand("insertHTML", false, text)
      this.setCurrentCursorPosition(pos + text.length)
    },
    setCurrentCursorPosition(count) {
      let selection = window.getSelection()
      let node = this.$refs.editor
      let range = document.createRange()
      range.selectNode(node)
      range.setStart(node, 0)
      for (let i = 0; i < node.childNodes.length; i++) {
        let child = node.childNodes[i]
        let l = child.textContent.length
        if (l < count) count -= l
        else if (child.firstChild){
          range.setEnd(child.firstChild, count)
          break
        }
      }
      range.collapse(false)
      selection.removeAllRanges()
      selection.addRange(range)
    },
    isChildOf(node) {
      while (node !== null) {
        if (node === this.$refs.editor) {
          return true
        }
        node = node.parentNode
      }
      return false
    },
    getCurrentCursorPosition() {
      let selection = window.getSelection(),
        charCount = null
      
      if (selection.focusNode && this.isChildOf(selection.focusNode)) {
        let node = selection.focusNode.parentNode
        charCount = selection.focusOffset

        while (node) {
          if (node.previousSibling) {
            node = node.previousSibling
            charCount += node.textContent.length
          } else { break }
        }
        return charCount
      }
    },
    onresize () {
      try {
        if (this.showAutocomplete) {
          let docEl = document.documentElement
          let rect = this.currentNode.getBoundingClientRect()
          let h = rect.height
          let rel_pos_y = (rect.y + h*0.5) / docEl.clientHeight
          let rel_pos_x = rect.x / docEl.clientWidth
          let boxPosition = {}
          if (this.sameWidth) boxPosition.width = rect.width + 'px'
          if (rel_pos_y > 0.5) {
            boxPosition.maxHeight = rect.y + 'px'
            boxPosition.bottom = 'calc(100vh - ' + rect.y + 'px)'
          } else {
            boxPosition.maxHeight = 'calc(100vh - ' + (rect.y + h) + 'px)'
            boxPosition.top = (rect.y + h) + 'px'
          }
          if (rel_pos_x > 0.5) {
            boxPosition.right = 'calc(100vw - ' + rect.right + 'px)'
          } else {
            boxPosition.left = rect.x + 'px'
          }
          this.autocompleteStyle = boxPosition
        }
      } catch {
        // nothing
      }
    }
  },
  mounted () {
    if (Array.isArray(this.value)) this.changeStructure(this.value)
  }
}
</script>

<style lang="sass">
.a-line-editor
  white-space: pre-wrap
  font-family: "Courier New", Courier, monospace
  &:focus
    outline: none
.a-dropdown-box
  border-radius: 3px
  box-shadow: shadow(2.5px)
  position: absolute
  background-color: white
  overflow: auto
  .a-line-editor-suggestion
    padding: 10px
    background-color: white
    cursor: pointer
</style>