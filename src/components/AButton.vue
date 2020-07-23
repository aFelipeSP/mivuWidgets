<template>
  <div class="a-button" @click="$emit('click')">
    <div
      v-if="icon != null && icon !== ''"
      :class="'icon mi-' + icon"
    />
    <div
      v-if="text != null && text !== ''"
      class="text"
      :style="(icon) ? 'margin-left: 10px' : ''"
    >
      <slot>{{text}}</slot>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-debugger */
export default {
  props: {
    text: String,
    icon: String
  },
  methods: {
  }
}
</script>

<style lang="sass">
.a-button
  user-select: none
  cursor: pointer
  display: flex
  box-sizing: border-box
  justify-content: center
  transition: all .3s
  align-items: center
  &:hover
    transition: all .3s
  .icon
    flex: 0 1
    display: flex
    align-items: center
    &:before
      flex: 1
  .text
    flex: 1
</style>
