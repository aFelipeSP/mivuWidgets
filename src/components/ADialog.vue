<template>
  <a-modal
    :value="value"
    @input="$emit('input', $event)"
  >
    <div class="a-dialog">
      <div v-if="title != null" class="a-dialog-title">{{title}}</div>
      <div v-if="content != null" class="a-dialog-content">{{content}}</div>
      <div class="a-dialog-buttons">
        <a-button :key="index"
          class="btn"
          v-for="(action, index) in actions"
          :text="action.name"
          @click="run(action.action)"
        />
      </div>
    </div>
  </a-modal>
</template>

<style lang="sass">
.a-dialog
  padding: 25px
  &-title
    font-size: 105%
    font-weight: bold
    margin-bottom: 15px
  &-content
    margin-bottom: 20px
  &-buttons
    display: flex
    flex-wrap: wrap
    >.btn
      padding: 7px
      background-color: rgba(0,0,0,0.1)
      box-shadow: shadow(1.2px)
      border-radius: 5px
      margin: 0px 5px
      &:hover
        background-color: rgba(0,0,0,0.15)
</style>

<script>
/* eslint-disable no-console */

export default {
  props: {
    value: Boolean,
    title: String,
    content: String,
    actions: Array
  },
  methods: {
    async run (action) {
      await action()
      this.$emit('input', false)
    }
  }
}
</script>
