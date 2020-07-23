<template>
  <div class="a-filter">
    <template class="a-filter-content" v-for="(expr, index) in value" >
      <div
        v-if="expr === '&' || expr === '|'"
        :key="index"
        class="a-filter-conjunction"
        @click="changeConjunction(index)"
      >{{expr === '&' ? 'and' : 'or'}}</div>
      <a-filter-expression
        v-else
        :key="index"
        :value="expr"
        :fields="fields"
        @input="changeExpression(index, $event)"
        @drop="drop(index)"
      />
    </template>
    <div
      style="display:flex"
      class="a-filter-conjunction mi-plus"
      @click="newItem()"
    />
  </div>
</template>

<style lang="sass">
.a-filter
  box-shadow: shadowInset(1px)
  display: flex
  padding: 4px
  flex-wrap: wrap
  align-items: center
  background-color: #eaeaea
  border: 1px solid #d0d0d0
  border-radius: 5px
  overflow: auto
  &-conjunction
    border: 1px solid #cccccc
    box-shadow: 0px 2px 6px 0px rgba(0,0,0,0.2)
    background-color: #f0f0f0
    border-radius: 5px
    text-align:center
    flex: 0 0
    margin: 0px 7px
    padding: 7px
    cursor: pointer
    &:hover
      background-color: #dddddd

    
  &-content
</style>

<script>
/* eslint-disable no-console */

import AFilterExpression from './AFilterExpression'
import { deepCopy } from '@/utils/copy'

export default {
  components: {
    AFilterExpression
  },
  props: {
    value: { type: Array, default: () => [] },
    fields: { type: Array }
  },
  data () { return { }},
  methods:{
    changeConjunction (index) {
      let value = deepCopy(this.value)
      value[index] = value[index] === '&' ? '|' : '&'
      this.$emit('input', value)
    },
    changeExpression (index, v) {
      let value = deepCopy(this.value)
      value[index] = v
      this.$emit('input', value)
    },
    drop (index) {
      let value = deepCopy(this.value)
      value.splice(index, 1)
      if (index !== 0) value.splice(index-1,1)
      else value.splice(index,1)
      this.$emit('input', value)
    },
    newItem () {
      let value = deepCopy(this.value) || []
      if (value.length > 0) value.push('&')
      value.push({field: null, operator: '==', value: null})
      this.$emit('input', value)
    }
  }
}
</script>
