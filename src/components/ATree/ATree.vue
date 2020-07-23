<template>
  <a-tree-item :data="value">
    <template #title="{data, item, index}">
      <slot name="title" v-bind="args"></slot>
    </template>
    <template #content="{data, item, index}">
      <slot name="content" v-bind="args"></slot>
    </template>
    <template #children="{data, item, index}">
      <a-tree :data="child[childrenLabel]" :childrenLabel="childrenLabel">
        <template #title="args">
          <slot name="title" v-bind="args"></slot>
        </template>
        <template #content="args">
          <slot name="content" v-bind="args"></slot>
        </template>
      </a-tree>
    </template>
  </a-tree-item>
</template>

<script>
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import ATreeItem from '@/components/ATree/ATreeItem'
export default {
  name: 'a-tree',
  components: {
    ATreeItem
  },
  props: {
    data: Array,
    childrenLabel: { type: String, default: 'children' }
  }
}
</script>
