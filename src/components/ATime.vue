<template>
  <div class="a-time">
    <div class="a-time-box">
      <div class="btn b-up a-icon mi-angle-double-up" @click="changeHour(-6)"/>
      <div class="btn b-down a-icon mi-angle-up" @click="changeHour(-1)" />
      <div class="field" ref="hour">
        <div v-for="(hour, index) in hours"
          :ref="'h' + index"
          :key="'h' + index"
        >{{hour}}</div>
      </div>
      <div class="btn b-up a-icon mi-angle-down" @click="changeHour(1)" />
      <div class="btn b-down a-icon mi-angle-double-down" @click="changeHour(6)" />
    </div>
    <div>:</div>
    <div class="a-time-box">
      <div class="btn b-up a-icon mi-angle-double-up" @click="changeMinute(-15)"/>
      <div class="btn b-down a-icon mi-angle-up" @click="changeMinute(-1)" />
      <div class="field" ref="minute">
        <div v-for="(minute, index) in minutes"
          :ref="'m' + index"
          :key="'m' + index"
        >{{minute}}</div>
      </div>
      <div class="btn b-up a-icon mi-angle-down" @click="changeMinute(1)" />
      <div class="btn b-down a-icon mi-angle-double-down" @click="changeMinute(15)" />
    </div>
  </div>
</template>

<style lang="sass">
$size: 40px
.a-time
  display: flex
  align-items: center
  cursor: pointer
  user-select: none
  .a-time-box
    flex: 1
    .btn
      height: 30px
      background-color: #efefef
      border: 1px solid #e1e1e1
      justify-content: center
      &:before
        font-weight: bold
    .b-up
      border-radius: 5px 5px 0px 0px
    .b-down
      border-radius: 0px 0px 5px 5px
    .field
      height: $size
      overflow: hidden
      > div
        line-height: $size
        text-align: center
        height: $size
</style>

<script>
/* eslint-disable no-console */

export default {

  props: {
    value: Date,
    animationDuration: { type: Number, default: 100 }
  },
  computed: {
    hour () {
      return this.value.getHours()
    },
    minute () {
      return this.value.getMinutes()
    }
  },
  data () {
    return {
      hours: [...Array(24).keys(), ...Array(24).keys(), ...Array(24).keys()],
      minutes: [...Array(60).keys(), ...Array(60).keys(), ...Array(60).keys()],
      start: null,
      currentWidget: null,
      initialScroll: null,
      targetScroll: null,
      correctScroll: false
    }
  },
  methods: {
    changeHour(amount) {
      let moveTo = this.hour + amount
      this.initialScroll = this.$refs.hour.scrollTop
      this.targetScroll = this.$refs['h' + (24 + moveTo)][0].offsetTop - this.$refs.hour.offsetTop
      this.currentWidget = 'hour'
      this.start = null
      this.correctScroll = moveTo < 0 || moveTo > 23
      let date = new Date(this.value)
      date.setHours((24 + moveTo) % 24, this.minute, 0)
      this.$emit('input', date)
      // this.$refs.hour.scrollTop = this.targetScroll
      window.requestAnimationFrame(this.animationStep)
    },
    changeMinute(amount) {
      let moveTo = this.minute + amount
      this.initialScroll = this.$refs.minute.scrollTop
      this.targetScroll = this.$refs['m' + (60 + moveTo)][0].offsetTop - this.$refs.minute.offsetTop
      this.currentWidget = 'minute'
      this.start = null
      this.correctScroll = moveTo < 0 || moveTo > 59
      let date = new Date(this.value)
      date.setHours(this.hour, (60 + moveTo) % 60 , 0)
      this.$emit('input', date)
      // this.$refs.minute.scrollTop = this.targetScroll
      window.requestAnimationFrame(this.animationStep)
    },
    animationStep(timestamp) {
      if (!this.start) this.start = timestamp
      let progress = timestamp - this.start
      let fraction = 0.5 + 0.5*Math.sin(Math.PI * (progress / this.animationDuration - 0.5))
      this.$refs[this.currentWidget].scrollTop = this.initialScroll + (this.targetScroll - this.initialScroll)*fraction
      if (progress < this.animationDuration) {
        window.requestAnimationFrame(this.animationStep)
      } else {
        if (this.correctScroll) {
          if (this.currentWidget === 'hour') {
            this.$refs.hour.scrollTop = this.$refs['h' + (24 + this.hour)][0].offsetTop - this.$refs.hour.offsetTop
          } else if (this.currentWidget === 'minute') {
            this.$refs.minute.scrollTop = this.$refs['m' + (60 + this.minute)][0].offsetTop - this.$refs.minute.offsetTop
          }
        } else {
          this.$refs[this.currentWidget].scrollTop = this.targetScroll
        }
      }
    }
  },
  mounted () {
    let value = this.value
    let date = null
    if (value == null) {
      date = new Date()
      this.$emit('input', date)
    } else {
      date = value
    }
    this.$refs.hour.scrollTop = this.$refs['h' + (24 + date.getHours())][0].offsetTop - this.$refs.hour.offsetTop
    this.$refs.minute.scrollTop = this.$refs['m' + (60 + date.getMinutes())][0].offsetTop - this.$refs.minute.offsetTop
  }
}
</script>
