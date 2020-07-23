<template>
  <div style="width:100%">
    <a-draggable
      :value="value"
      @input="$emit('input', $event)"
      :group="group"
    >
      <template #default="{ item, index, objIndex }">
        <div class="a-ordered-list-item">
          <slot :item="item" :index="index" :objIndex="objIndex">{{item}}</slot>
          <a-button
            class="circular-button"
            style="position:absolute;right:-10px;top:-10px;--s:20px"
            icon="minus"
            @click="drop(index)"
          />
        </div>
      </template>
    </a-draggable>
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
import ADraggable from '@/components/ADraggable'
import { deepCopy } from '@/utils/copy'

export default {
  components: {
    ADraggable
  },
  props: {
    value: [Array, Object],
    newValueExample: {type: [String,Number,Date,Object,Array], required: true},
    group: {type: String, default: (new Date()).getTime().toString()}
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
.a-ordered-list-item
  position: relative
</style>
