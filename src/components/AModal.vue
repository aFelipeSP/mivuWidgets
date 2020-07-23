<template>
  <a-portal :value="value">
    <a-overlay
      :value="value"
      :strict="strict"
      @input="$emit('input', $event)"
      class="a-modal"
      :canClose="canClose"
    >
      <div>
        <slot></slot>
      </div>
    </a-overlay>
  </a-portal>
</template>

<script>
export default {
  props: {
    value: { type: Boolean, default: false },
    strict: { type: Boolean, default: true },
    canClose: { type: Boolean, default: true }
  }
}
</script>

<style lang="sass">
.a-modal
  display: flex
  justify-content: center
  align-items: center
  >div
    max-height: 80%
    max-width: 80%
    border-radius: 7px
    box-shadow: shadow(2.5px)
    background-color: white
    overflow: auto
</style>
