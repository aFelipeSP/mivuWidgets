<template>
  <div
    class="a-slider"
  >
    <div class="a-slider-track"
      ref="aslider"
      @mousedown="onStart"
      @touchstart="onTouch"
      @touchmove="onMove($event, true)"
      @touchend="onRelease"
    />
    <div
      @mousedown="onStart"
      @touchmove="onMove($event, true)"
      @touchend="onRelease"
      class="a-slider-thumb"
      :style="thumbStyle"
    >{{value != null ? value.toPrecision(3) : ''}}</div>
  </div>
</template>

<style lang="sass">
$size: 25px
$p: 0.3
.a-slider
  position: relative
  height: $size
  padding: $size*$p 0px
  box-sizing: border-box
  >.a-slider-track
    position: relative
    height: 100%
    border-radius: 999999px
    background-color: rgba(0,0,0,0.16)
    box-shadow: 0 1.94px 3.44px rgba(0, 0, 0, 0.123) inset
  >.a-slider-thumb
    user-select: none
    font-size: $size * 0.5
    position: absolute
    display: flex
    align-items: center
    justify-content: center
    height: $size
    width: $size * 2.2
    color: white
    top: 0
    background-color: $color-2
    border-radius: 999999px
    box-shadow: 0 1.94px 2.44px rgba(0, 0, 0, 0.423)
</style>

<script>
/* eslint-disable no-console */
export default {
  props: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 10 },
    step: { type: Number, default: 1 },
    value: Number
  },
  data () {
    return {
      size: 25,
      thumbProp: 2.2,
      width: 0
    }
  },
  methods: {
    onresize () {
      this.width = this.$refs.aslider.clientWidth - this.size*this.thumbProp
    },
    onStart (ev) {
      document.addEventListener('mouseup', this.onRelease)
      document.addEventListener('mousemove', this.onMove)
      let x = ev.clientX
      this.setValue(x)
    },
    onTouch (ev) {
      let x = ev.touches[0].clientX
      this.setValue(x)
    },
    onRelease () {
      document.removeEventListener('mouseup', this.onRelease)
      document.removeEventListener('mousemove', this.onMove)
    },
    setValue (x) {
      let width = this.$refs.aslider.clientWidth
      let left = this.$refs.aslider.getBoundingClientRect().left
      let fraction = (x - left)/width
      fraction = Math.min(1, Math.max(0, fraction))
      let newValue = this.min + this.getDiscrete((this.max - this.min) * fraction)
      if (this.value !== newValue && newValue <= this.max)
        this.$emit('input', newValue)
    },
    onMove(ev, isTouch) {
      let x = (isTouch) ? ev.touches[0].clientX : ev.clientX
      this.setValue(x)
    },
    getDiscrete (value) {
      let remainder = value % this.step
      value = value - remainder
      return remainder < (this.step / 2) ?
        value : value + this.step
    }
  },
  computed: {
    thumbStyle () {
      let fraction = (this.value != null ?
        (this.value - this.min)/(this.max - this.min) : 0)
      fraction = Math.min(1, Math.max(0, fraction))
      return { left: fraction*this.width + 'px' }
    }
  },
  mounted () {
    this.onresize()
    window.addEventListener('resize', this.onresize)
  },
  destroyed () {
    window.removeEventListener('resize', this.onresize)
  }
}
</script>
