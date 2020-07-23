<template>
  <div class="a-list">
    <a-draggable
      :value="value"
      @input="$emit('input', $event)"
      :group="group"
    >
      <template #default="{ item, index }">
        <div class="a-list-item">
          <a-input
            v-if="['number', 'text', 'textarea'].includes(type)"
            :ref="'e'+index"
            class="a-list-input"
            :type="type"
            :value="item"
            @input="update(index, $event)"
            clearable
            :suggestions="values"
          />
          <a-select
            v-else
            style="flex: 1"
            :value="item"
            @input="update(index, $event)"
            :values="values"
          />
          <a-button
            class="circular-button"
            style="margin-left: 5px;"
            icon="minus"
            @click="drop(index)"
          />
        </div>
      </template>
    </a-draggable>
    <a-button
      style="margin-top: 6px"
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
    value: Array,
    type: { type: String, default: 'text' },
    placeholder: String,
    group: (new Date()).getTime().toString(),
    values: { type: Array, default:()=>[] }
  },
  data () {
    return {
      newValue: null
    }
  },
  methods: {
    drop (index) {
      let list = deepCopy(this.value)
      list.splice(index, 1)
      this.$emit('input', list)
    },
    update (index, value) {
      let list = deepCopy(this.value)
      list[index] = value
      this.$emit('input', list)
    },
    add () {
      let list = deepCopy(this.value || [])
      list.push(null)
      this.$emit('input', list)
      if (this.type !== 'select')
        this.$nextTick(()=>this.$refs['e' + (list.length - 1)].focus())
    }
  }
}
</script>

<style lang="sass">
.a-list
  width: 100%
  .a-list-item
    display: flex
    align-items: center
    .a-list-input
      border: 1px solid hsl(0,0,80%)
      border-bottom: 0px solid hsl(0,0,80%)
      padding: 7px
      flex: 1
  .a-draggable:last-child
    .a-list-input
      border: 1px solid hsl(0,0,80%)
</style>
