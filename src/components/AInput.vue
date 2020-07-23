<template>
  <a-dropdown class="a-input" v-model="opened">
    <template #clickable>
      <div v-if="icon" :class="(icon) ? 'icon a-icon mi-' + icon : ''" />
      <div v-if="type === 'textarea'"
        tabindex="0"
        contenteditable="true"
        :class="'a-input-box '+type"
        @blur="onBlur"
        @paste="textPasted"
        ref="textarea"
      />
      <input v-else
        ref="input"
        :type="type"
        :min="min"
        :max="max"
        :class="'a-input-box '+type"
        :value="value"
        :placeholder="placeholder"
        @blur="$emit('blur', $event)"
        @keyup="onkeyup"
        @click="onclick"
      >
      <div
        v-if="clearable"
        class="clear a-icon mi-clear"
        @click="clear"
      />
    </template>
    <template #dropdown>
      <div
        v-for="(el, index) in suggestions_"
        :key="index"
        :class="[
          'a-input-suggestion',
          (suggestionsPos === index) ? 'selected' : ''
        ]"
        v-text="el"
        @click="clicked(el)"
      />
    </template>
  </a-dropdown>
</template>

<script>
import ADropdown from '@/components/ADropdown'
/* eslint-disable no-console */

export default {
  components: {
    ADropdown
  },
  props: {
    type: {
      type: String,
      default: 'text',
      validator: function (value) {
        return ['number', 'text', 'textarea', 'password'].indexOf(value) !== -1
      }
    },
    debounce: { type: Number, default: 0 },
    value: [String, Number],
    placeholder: String,
    icon: String,
    clearable: Boolean,
    suggestions: Array,
    min: Number,
    max: Number
  },
  data () {
    return {
      opened: false,
      suggestionsPos: null,
      suggestions_: null,
      timeout: null
    }
  },
  watch: {
    value (value) {
      if (this.type === 'textarea') {
        value = value || ''
        this.$refs.textarea.innerText = value
      }
    }
  },
  methods: {
    clicked (el) {
      this.opened = false
      this.$emit('input', el)
      this.$emit('selected', el)
    },
    onclick () {
      if (this.type === 'text')
        this.updateSuggestions(this.value)
    },
    filterSuggestions (value) {
      if (this.suggestions == null) return null 
      if (value !== '' && value != null) {
        return this.suggestions.filter(
          el => el.toLowerCase()
            .includes(value.toLowerCase())
        )
      } else 
        return this.suggestions
    },
    updateSuggestions (value) {
      let suggestions_ = this.filterSuggestions(value)
      this.opened = suggestions_ != null && suggestions_.length > 0
      this.suggestions_ = suggestions_
    },
    async onkeyup (e) {
      let value = e.target.value

      if (this.type === 'text') {
        this.updateSuggestions(value)
        if (this.opened) {
          if (e.key === 'ArrowDown') {
            if (this.suggestionsPos == null)
              this.suggestionsPos = 0
            else
              this.suggestionsPos = Math.min(this.suggestionsPos + 1, this.suggestions_.length - 1)
            e.preventDefault()
            return
          } else if (e.key === 'ArrowUp') {
            if (this.suggestionsPos == null)
              this.suggestionsPos = this.suggestions_.length - 1
            else
              this.suggestionsPos = Math.max(this.suggestionsPos - 1, 0)
            e.preventDefault()
            return
          } else if (e.key === 'Enter' && this.suggestionsPos != null) {
            this.$emit('input', this.suggestions_[this.suggestionsPos])
            this.opened = false
            this.suggestionsPos = null
            e.preventDefault()
            return
          }
        }
      } else if (this.type === 'number') {
        if (value === '' || Number.isNaN(value))
          e.preventDefault()
        else {
          let newValue = Number(value)
          if (this.value !== newValue)
            this.emitInput(newValue)
          else
            this.$emit('keyup', e)
        }
        return
      }
      if (this.value !== value)
        this.emitInput(value)
      else
        this.$emit('keyup', e)
    },
    onBlur (e) {
      let value = e.target.innerText.trim()
      this.$emit('input', value)
    },
    textPasted (e) {
      // Stop data actually being pasted into div
      e.stopPropagation()
      e.preventDefault()

      let clipboardData = e.clipboardData || window.clipboardData
      document.execCommand("insertHTML", false, clipboardData.getData('Text'))
    },
    emitInput (value) {
      if (this.debounce === 0) {
        this.$emit('input', value)
      } else {
        clearTimeout(this.timeout)
        this.timeout = setTimeout(
          () => this.$emit('input', value), this.debounce)
      }
    },
    clear () {
      this.opened = false
      this.$emit('input', null)
      this.focus()
    },
    focus () {
      try {
        if (this.type === 'textarea')
          // TODO: test focus for textarea
          this.$refs.textarea.focus()
        else
          this.$refs.input.focus()
        // eslint-disable-next-line
      } catch (e) {}
    }
  },
  mounted () {
    if (this.type === 'textarea' && this.value) {
      this.$refs.textarea.innerText = this.value
    }
  }
}
</script>

<style lang="sass">
.a-input
  width: 100%
  box-sizing: border-box
  > .a-dropdown-clickable
    width: 100%
    box-sizing: border-box
    margin: 0px
    height: 100%
    align-items: center
    display: flex
    .icon
      flex: 0 1
      padding-right: 7px
      // &:before
      //   flex: 1
    .clear
      cursor: pointer
      flex: 0 1
      padding-left: 7px
      // &:before
      //   flex: 1
    .a-input-box
      width: 100%
      white-space: pre-line
      color: inherit !important
      min-height: 1em
      flex: 1
      text-align: inherit
      display: block
      overflow: hidden
      box-sizing: border-box
      border: 0
      padding: 0px
      font-family: inherit
      font-size: inherit
      background: none
      &:focus
        background: none
        outline: none
      &.text
      &.number
      &.textarea
  &.s-1
    > .a-dropdown-clickable
      height: auto
      .a-input-box
        padding: 5px 1px
        border-bottom: 1px solid hsl(0,0, 80%)
  &.s-2
    > .a-dropdown-clickable
      @extend %box-1
.a-input-suggestion
  padding: 10px
  background-color: white
  cursor: pointer
  &.selected
    background-color: rgba(0,0,0,0.2)
  &:hover
    background-color: rgba(0,0,0,0.1)
</style>