<template>
  <a-resp-dropdown class="a-datepicker" v-model="opened">
    <template #clickable>
      {{dateString || '----'}}
    </template>
    <template #dropdown>
      <div class="a-datepicker-box">
        <a-calendar
          class="a-datepicker-calendar"
          :value="value"
          @input="$emit('input', $event)"
        />
        <a-time v-if="includeTime"
          class="a-datepicker-time"
          :value="value"
          @input="$emit('input', $event)"
        />
      </div>
    </template>
  </a-resp-dropdown>
</template>

<script>
import ARespDropdown from '@/components/ARespDropdown'
import ACalendar from '@/components/ACalendar'
import ATime from '@/components/ATime'
import {date2str} from '@/utils/date.js'

export default {
  components: {
    ARespDropdown,
    ACalendar,
    ATime
  },
  props: {
    value: Date,
    includeTime: { type: Boolean, default: () => true }
  },
  data () {
    return {
      opened: false
    }
  },
  computed: {
    dateString () {
      let dateString = null
      if (this.value != null) {
        let d = this.value
        dateString = date2str(d, this.includeTime)
      }
      return dateString
    }
  }
}
</script>

<style lang="sass">
.a-datepicker
  .a-resp-dropdown-clickable
    @extend %box-1
    width: 100%
    cursor: pointer
  &-box
    padding: 5px
    max-width: 400px
    display: flex
    align-items: center
  &-calendar
    flex: 6
  &-time
    margin-left: 10px
    flex: 2
</style>
