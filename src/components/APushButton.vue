<template>
  <div @click="$emit('click', $event)" class="a-push-button"><slot/></div>
</template>

<script>
export default {
  data () {
    return {
    }
  }
}
</script>

<style lang="sass">
.a-push-button
  user-select: none
  cursor: pointer
  background-color: #dddddd
  transition: box-shadow .1s, transform .1s
  transform: translate(0px, calc(var(--h, 3px)*-1))
  box-shadow: 0px var(--h, 3px) 0px 0px #aaaaaa, calc(var(--h, 3px)*0.4) calc(var(--h, 3px)*2) var(--h, 3px) 1px rgba(0, 0, 0, 0.16)
  &:hover
    transform: translate(0px,calc(var(--h, 3px)*-0.8))
    box-shadow: 0px calc(var(--h, 3px)*0.8) 0px 0px #aaaaaa, calc(var(--h, 3px)*0.3) calc(var(--h, 3px)*1.6) var(--h, 3px) 1px rgba(0, 0, 0, 0.16)
    transition: box-shadow .1s, transform .1s
  &:active
    transform: translate(0px,-1px)
    box-shadow: 0px 1px 2px 0px #aaaaaa, 0px 0px 1px 0px rgba(0, 0, 0, 0.16)
    transition: box-shadow .1s, transform .1s
</style>
