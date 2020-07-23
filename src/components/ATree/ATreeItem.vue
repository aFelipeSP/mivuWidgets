<template>
  <div>
    <div
      v-for="(child, index, objIndex) in data" 
      :key="index"
      class="a-tree-item"
    >
      <div class="a-tree-item-title">
        <div class="tick-before" />
        <div
          v-if="isParent(child) && hasChildren(child)"
          @click="toggle(index)"
          class="obj-tick"
          :class="{
            collapsed: isCollapsed(index)
          }"
        />
        <div v-else class="tick"></div>
        <div class="tick-after" />
        <slot name="title"
          :data="data"
          :item="child"
          :index="index"
          :objIndex="objIndex"
        >{{child}}</slot>
      </div>
      <div class="a-tree-item-content">
        <div class="content-before"
          :class="{
            show: !isCollapsed(index)
              && isParent(child)
              && hasChildren(child)
          }"
        />
        <slot name="content"
          :data="data"
          :item="child"
          :index="index"
          :objIndex="objIndex"
        >{{child}}</slot>
      </div>
      <div
        v-if="isParent(child) && !isCollapsed(index)"
        class="a-tree-item-children"
      >
        <slot name="children"
          :data="data"
          :item="child"
          :index="index"
          :objIndex="objIndex"
        ></slot>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-console */

export default {
  name: 'a-tree-item',
  props: {
    data: [Array, Object],
    childrenLabel: { type: String, default: 'children' }
  },
  data () {
    return {
      collapsed: []
    }
  },
  methods: {
    isParent (item) {
      if (Array.isArray(this.data)) {
        return Array.isArray(item[this.childrenLabel])
      } else {
        return typeof item === 'object' && item != null
      } 
    },
    hasChildren (item) {
      if (Array.isArray(this.data)) {
        return item[this.childrenLabel].length > 0
      } else {
        return Object.keys(item).length > 0
      }
    },
    isCollapsed (index) {
      return this.collapsed.includes(index)
    },
    toggle (index) {
      if (this.isCollapsed(index)) {
        this.collapsed = this.collapsed.filter(x => index !== x)
      } else {
        this.collapsed.push(index)
      }
    }
  }
}
</script>

<style lang="sass">
$padding: 10px
$tick-width: 10px
$line-width: 2px
$line-color: #d8d8d8
$total-padding: $padding*2 + $tick-width
.a-tree-item
    border-left: $line-width solid $line_color
    &-title
      display: flex
      >.tick-before
        position: relative
        min-width: $padding
        &::before
          content: ''
          position: absolute
          border-bottom: $line-width solid $line-color
          border-radius: 0px 8px
          border-left: $line-width solid $line-color
          height: calc(50% + #{$line-width})
          width: 100%
          left: -$line-width
          bottom: 50%
      >.obj-tick
        position: relative
        min-width: $tick-width
        cursor: pointer
        &::after
          content: ''
          position: absolute
          border-left: $tick-width*0.4 solid transparent
          border-top: $tick-width*0.7 solid $line-color
          border-right: $tick-width*0.4 solid transparent
          height: 0px
          width: 0px
          left: $tick-width*0.1
          bottom: calc(50% - #{$tick-width*0.3})
          transform-origin: 50% 50%
          transition: transform 0.1s
        &::before
          content: ''
          position: absolute
          border-left: $line-width solid $line-color
          width: 50%
          height: calc(50% - #{$tick-width*0.4})
          left: calc(50% - #{$line-width})
          bottom: 0
        &.collapsed
          &::after
            transform: rotate(-90deg)
            transform-origin: 50% 50%
            transition: transform 0.1s
          &::before
            border-left: none
      >.tick
        display: flex
        min-width: $tick-width
        align-items: center
        justify-content: center
        &::before
          content: ''
          background-color: $line-color
          height: $tick-width*0.8
          width: $tick-width*0.8
          border-radius: 999999px
      >.tick-after
        position: relative
        min-width: $padding
        &::before
          content: ''
          position: absolute
          border-bottom: $line-width solid $line-color
          height: calc(50% + #{$line-width})
          width: 90%
          left: 0
          bottom: 50%
    &-content
      display: flex
      >.content-before
        position: relative
        min-width: $padding*2 + $tick-width
        &::before
          border-left: none
        &.show
          &::before
            content: ''
            position: absolute
            border-left: $line-width solid $line-color
            width: 50%
            height: 100%
            left: calc(50% - #{$line-width})
            bottom: 0
      >.tick-after
        position: relative
        min-width: $padding
        &::before
          content: ''
          position: absolute
          border-bottom: $line-width solid $line-color
          height: calc(50% + #{$line-width})
          width: 90%
          left: 0
          bottom: 50%
    &-children
      padding-left: $padding + $tick-width*0.5 - $line-width
    &:last-child
      border-left: $line_width solid transparent
</style>
