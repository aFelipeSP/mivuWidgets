
<template>
  <a-line-editor
    :content="content"
    @change="$emit('input', $event)"
    :autocompleteDef="autocompleteDef"
    :autocompleteTypes="autocompleteTypes"
  />
</template>

<script>
/* eslint-disable no-console */
import { functions } from '@/grammars/expression.js'
import ALineEditor from './ALineEditor'

let funcs = Object.keys(functions).map(el => ({content: el, type: 'functionCall'}))

export default {
  components: {
    ALineEditor
  },
  props: {
    value: String,
    suggestions: { type: Array, default: () => ([]) }
  },
  data() {
    return {
      autocompleteTypes: {
        variable: '##',
        functionCall: '##()'
      },
      content: []
    }
  },
  computed: {
    autocompleteDef () {
      return {
        variable: [
          ...this.suggestions.map(el => ({content: el, type: 'variable'})),
          ...funcs
        ]
      }
    }
  },
  watch: {
    value: {
      handler(newV, oldV) {
        if (newV != oldV)
          this.changeStructure(newV || "");
      },
      immediate: true
    }
  },
  methods: {
    changeStructure(value) {
      let error = null
      let res = {}
      try {
        res = this.$parseExpression(value)
      } catch (err) {
        error = err
      }

      if (error) {
        res.l = [
          { content: value.slice(0, error.offset) },
          {
            content: value.slice(error.offset),
            style: { backgroundColor: "#ffcccc" }
          }
        ]
      } else if (res == null) {
        res = {l: [{ content: value }]}
      }

      this.$emit("function", res.f)
      this.content = res.l || []
    }
  },
  mounted() {
    this.changeStructure(this.value || "");
  }
};
</script>

<style>
</style>