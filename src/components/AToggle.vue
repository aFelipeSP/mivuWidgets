<template>
  <div
    :class="['a-toggle', value ? 'checked' : '']"
    :style="toggleStyle"
    @click="$emit('input', !value)"
  >
    <div class="a-toggle-slider" :style="sliderStyle" />
  </div>
</template>

<script>
/* eslint-disable */
export default {
  props: {
    value: Boolean,
    size: { type: Number, default: () => 20 }
  },
  data () {
    return {
      factor: 2.3
    }
  },
  computed: {
    toggleStyle () {
      return {
        width: (this.size * (this.factor + 1/7)) + 'px',
        padding: (this.size / 7) + 'px'
      }
    },
    sliderStyle () {
      return {
        height: this.size + 'px',
        width: this.size + 'px',
        transform: 'translateX(' + (
          (this.value) ? 
          this.size * (this.factor - 1 - 1/7): 
          0
        ) + 'px)'
      }
    }
  },
  methods: {
  }
}
</script>

<style lang="sass">
$time: 0.3s
.a-toggle
  border-radius: 999999px
  background-color: #d0d0d0
  box-sizing: border-box
  transition:  background-color $time
  &.checked
    background-color: $color-2
    transition:  background-color $time
  > .a-toggle-slider
    background-color: white
    border-radius: 50%
    transition:  transform $time
</style>
