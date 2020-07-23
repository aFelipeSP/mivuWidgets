<template>
  <div class="a-filter-expression">
    <a-button
      :class="['side-button', 'negation', value.negation ? 'negative' : '']"
      text=" ! "
      @click="changed('negation', !value.negation)"
    />
    <a-select
      class="dropdown"
      style="min-width:50px"
      :caret="false"
      :value="value.field"
      @input="changed('field', $event)"
      :values="fields"
      labelField="name"
      idField="name"
      :returnObject="false"
    />
    <a-select
      class="dropdown operator"
      :caret="false"
      :values="operators"
      :value="value.operator"
      @input="changed('operator', $event)"
    />
    <template v-if="value.operator !== 'exist'">
      <a-select
        v-if="field.enum != null"
        style="min-width: 2em"
        class="dropdown"
        :value="value.value"
        @input="changed('value', $event)"
        :values="field.enum"
      />
      <a-input_ v-else-if="field.type === 'string'"
        style="width:auto;padding:0px 7px"
        :value="value.value"
        @input="changed('value', $event)"
      />
      <a-input_ v-else-if="field.type === 'number'"
        style="width:auto;padding:0px 7px"
        type="number"
        :value="value.value"
        @input="changed('value', $event)"
      />
      <a-datepicker v-else-if="field.type === 'datetime'"
        style="min-width: 2em"
        class="dropdown"
        :value="value.value"
        @input="changed('value', $event)"
      />
      <div v-else-if="field.type === 'boolean'"
        :class="['boolean', value.value ? 'green' : 'red']"
        v-text="value.value ? 'true' : 'false'"
        @click="changed('value', !value.value)"
      />
      <a-item-search-widget v-else-if="field.type === 'item'"
        style="width:auto;padding:0px 7px"
        :category="field.category"
        :fields="field.fields"
        :value="value.value"
        :lockCategory="true"
        @input="changed('value', $event)"
      />
    </template>
    <a-button
      class="side-button"
      icon="clear"
      @click="$emit('drop')"
    />
  </div>
</template>

<style lang="sass">
.a-filter-expression
  box-shadow: 0px 2px 6px 0px rgba(0,0,0,0.2)
  border-radius: 7px
  margin: 4px
  display: flex
  background-color: white
  .side-button
    padding: 5px
    cursor: pointer
    background-color: #f0f0f0
    border-radius: 0px 7px 7px 0px
    &:hover
      background-color: #dddddd
  .negation
    padding: 0px 10px
    border-radius: 7px 0px 0px 7px
    &.negative
      background-color: #ffcccc
      &:hover
        background-color: #ffaaaa
  .dropdown
    .a-resp-dropdown-clickable
      border-radius: 0px
      padding: 7px
      background-color: white
      text-align: center
    &.operator
      .a-resp-dropdown-clickable
        background-color: #f0f0f0
        &:hover
          background-color: #dddddd
  .boolean
    padding: 7px
    cursor: pointer
    &.green
      background-color: #bbffbb
    &.red
      background-color: #ffbbbb

</style>

<script>
/* eslint-disable no-console */
import { deepCopy } from '@/utils/copy'
import AInput_ from '@/components/AInput_'
import AItemSearchWidget from '@/components/AItemSearch/AItemSearchWidget'

export default {
  components: {
    AInput_,
    AItemSearchWidget
  },
  props: {
    value: Object,
    fields: Array
  },
  data () {
    return {
      operators: ['contain', '==', '!=', '<', '>', '<=', '>=', 'regex', 'exist'],
      field: {type: 'string'}
    }
  },
  watch: {
    value: {
      handler (v) {
        if (v.field != null) this.setFieldType(v.field)
      },
      immediate: true
    }
  },
  methods: {
    setFieldType (name) {
      this.field = this.fields.find(el => el.name === name)
    },
    changed (key, value) {
      let expression = deepCopy(this.value)
      if (key === 'field') {
        this.setFieldType(value)
        expression.value = null
      }
      expression[key] = value
      this.$emit('input', expression)
    }
  }
}
</script>
