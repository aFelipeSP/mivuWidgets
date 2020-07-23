<template>
<div>
  <div
    ref="adropdown"
    class="a-resp-dropdown-clickable"
    @click="open"
  >
    <slot name="clickable"></slot>
  </div>
  <a-portal :value="value">
    <a-overlay
      :value="value"
      @input="$emit('input', $event)"
      :opacity="isModal ? 0.4 : 0"
      :class="[isModal ? 'a-resp-dropdown-modal' : 'a-resp-dropdown-box']"
    >
      <div :style="boxPosition">
        <slot name="dropdown"></slot>
      </div>
    </a-overlay>
  </a-portal>
</div>
</template>

<script>
/* eslint-disable no-console */
import APortal from './APortal.js'
import AOverlay from './AOverlay/AOverlay.js'

export default {
  components: {
    APortal,
    AOverlay
  },
  props: {
    value: Boolean,
    sameWidth: Boolean
  },
  data () {
    return {
      isModal: false,
      boxPosition: {}
    }
  },
  methods: {
    onresize () {
      try {
        if (window.matchMedia("(max-width: 700px)").matches) {
          this.isModal = true
        } else {
          this.isModal = false
          let docEl = document.documentElement
          let rect = this.$refs.adropdown.getBoundingClientRect()
          let h = this.$refs.adropdown.clientHeight
          let rel_pos_y = (rect.y + h*0.5) / docEl.clientHeight
          let rel_pos_x = rect.x / docEl.clientWidth
          let boxPosition = {}
          if (this.sameWidth) boxPosition.width = rect.width + 'px'
          if (rel_pos_y > 0.5) {
            boxPosition.maxHeight = rect.y + 'px'
            boxPosition.bottom = 'calc(100vh - ' + rect.y + 'px)'
          } else {
            boxPosition.maxHeight = 'calc(100vh - ' + (rect.y + h) + 'px)'
            boxPosition.top = (rect.y + h) + 'px'
          }
          if (rel_pos_x > 0.5) {
            boxPosition.right = 'calc(100vw - ' + rect.right + 'px)'
          } else {
            boxPosition.left = rect.x + 'px'
          }
          this.boxPosition = boxPosition
        }
      } catch {
        // nothing
      }
    },
    open () {
      if (this.value) {
       this.$emit('input', false)
       window.removeEventListener('resize', this.onresize)
      }
      else {
        this.onresize()
        window.addEventListener('resize', this.onresize)
        this.$emit('input', true)
      }
    }
  },
  destroyed () {
    window.removeEventListener('resize', this.onresize)
  }
}
</script>

<style lang="sass">
.a-resp-dropdown
  &-modal
    display: flex
    justify-content: center
    align-items: center
    &>div
      max-height: 80%
      max-width: 80%
      border-radius: 3px
      box-shadow: shadow(2.5px)
      background-color: white
      overflow: auto
  &-box
    &>div
      border-radius: 3px
      box-shadow: shadow(2.5px)
      position: absolute
      background-color: white
      overflow: auto
</style>
