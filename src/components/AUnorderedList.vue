<template>
  <div style="width:100%">
    <div
      class="a-unordered-list-item"
      v-for="(item, index, objIndex) in value"
      :key="index"
    >
      <div style="position:relative">
        <slot :item="item" :index="index" :objIndex="objIndex">{{item}}</slot>
        <a-button
          class="circular-button"
          style="position:absolute;right:-10px;top:-10px;--s:20px"
          icon="minus"
          @click="drop(index)"
        />
      </div>
    </div>
    <a-button
      style="margin-top: 6px;--s:20px"
      class="circular-button"
      icon="plus"
      @click="add"
    />
  </div>
</template>

<script>
/* eslint-disable no-console */
import { deepCopy } from '@/utils/copy'
import AButton from './AButton.vue'

export default {
  components: {
    AButton
  },
  props: {
    value: {type: [Array, Object]},
    newValueExample: {
      type: [String, Number, Date, Object, Array],
      default: null
    }
  },
  methods: {
    drop (index) {
      let value = deepCopy(this.value)
      if (Array.isArray(value)) {
        value.splice(index, 1)
      } else {
        delete value[index]
      }
      this.$emit('input', value)
    },
    add () {
      let value = deepCopy(this.value)
      if (Array.isArray(value)) {
        value.push(deepCopy(this.newValueExample))
      } else {
        let i = 1
        while (value.hasOwnProperty('new' + i)) i++
        value['new' + i] = deepCopy(this.newValueExample)
      }
      this.$emit('input', value)
    }
  }
}
</script>

<style lang="sass">

</style>
