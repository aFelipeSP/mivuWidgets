<template>
  <div class="a-notif">
    <div
      class="a-notif-item"
      v-for="(notif, index) in value"
      :key="index"
    >
      <div class="a-label">{{$t('reminders.fieldsToShow')}}</div>
      <a-list
        :value="notif.fields"
        @input="update('fields', index, $event)"
        :values="fields"
      />
      <div class="a-label">{{$t('reminders.message')}}</div>
      <a-input
        class="s-2"
        :value="notif.message"
        @input="update('message', index, $event)"
      />
      <div class="a-label">{{$t('reminders.type')}}</div>
      <a-select
        :values="['exact', 'repeat']"
        :value="notif.type"
        @input="update('type', index, $event)"
      />
      <div v-if="notif.type === 'exact'" class="a-label">{{$t('reminders.date')}}</div>
      <a-datepicker
        v-if="notif.type === 'exact'"
        :value="notif.at"
        @input="update('at', index, $event)"
      />
      <div
        v-if="notif.type === 'repeat'"
      >
        <div class="a-label">{{$t('reminders.every')}}</div>
        <a-select
          :values="repeatOps_"
          :value="notif.everyType"
          @input="update('everyType', index, $event)"
        />
        <div class="a-label">{{$t('reminders.at')}}</div>
        <div class="a-notif-at-box">
          <div
            class="a-notif-at"
            v-for="(dateField, index1) in getDateFields(notif.everyType)"
            :key="index1"
          >
            <div class="a-notif-at-title">{{dateField}}</div>
            <a-input
              class="a-notif-at-value"
              type="number"
              :value="notif.every[dateField]"
              @input="updateEvery(dateField, index, $event)"
            />
          </div>
        </div>
      </div>
      <a-button
        class="circular-button delete-btn"
        icon="clear"
        @click="dropReminder(index)"
      />
    </div>
    <a-button
      class="circular-button"
      style="margin-top: 5px;"
      icon="plus"
      @click="addReminder()"
    />
  </div>
</template>

<style lang="sass">
.a-notif
  .a-notif-item
    padding: 10px
    box-shadow: shadow(1.5px)
    margin-bottom: 8px
    border-radius: 5px
    position: relative
    .a-notif-at-box
      display: flex
      flex-wrap: wrap
      .a-notif-at
        display: flex
        flex: 0 1 45px
        flex-direction: column
        border-radius: 5px
        border: 1px solid rgba(0,0,0,0.15)
        .a-notif-at-title
          text-align: center
          padding: 5px
          font-weight: bold
          font-size: 85%
          border-bottom: 1px solid rgba(0,0,0,0.15)
        .a-notif-at-value
          text-align: center
          padding: 5px
          width: 100%
    .circular-button.delete-btn
      position: absolute
      min-width: 20px
      min-height: 20px
      width: 20px
      height: 20px
      right: -10px
      top: -10px
</style>

<script>
import { deepCopy } from '@/utils/copy'

export default {
  props: {
    value: { type: Array, default:()=>[] },
    fields: { type: Array, default:()=>[] }
  },
  data () {
    return {
      repeatOps: [
        'year',
        'month',
        'day',
        'hour',
        'minute'
      ],
      repeatOpsAlt: [
        'weekday',
        'weekOfMonth'
      ]
    }
  },
  methods: {
    update (field, index, value) {
      let nots = deepCopy(this.value)
      nots[index][field] = value
      if (field === 'type') {
        if (value === 'repeat') {
          try {
            delete nots[index].at
            nots[index].everyType = 'day'
            nots[index].every = {}
          } catch {
            // nothing
          }
        } else if (value === 'exact') {
          try {
            nots[index].at = new Date()
            delete nots[index].everyType
            delete nots[index].every
          } catch {
            // nothing
          }
        }
      } else if (field === 'everyType') {
        nots[index].every = {}
      }
      this.$emit('input', nots)
    },
    updateEvery (field, index, value) {
      let nots = deepCopy(this.value)
      nots[index].every[field] = value
      this.$emit('input', nots)
    },
    getDateFields (everyType) {
      if (this.repeatOps.includes(everyType)) {
        return this.repeatOps.slice(this.repeatOps.indexOf(everyType) + 1)
      } else if (everyType === 'weekday') {
        return ['weekday', 'hour', 'minute']
      } else if (everyType === 'weekOfMonth') {
        return ['weekOfMonth' ,'weekday', 'hour', 'minute']
      }
    },
    addReminder () {
      let nots = this.value == null ? [] : deepCopy(this.value)
      nots.push({ _id: new Date().getTime(), fields: [], message: '', type: 'exact', at: new Date() })
      this.$emit('input', nots)
    },
    dropReminder (index) {
      let nots = deepCopy(this.value)
      nots.splice(index, 1)
      this.$emit('input', nots)
    }
  },
  computed: {
    repeatOps_ () {
      return [...this.repeatOps.slice(0, this.repeatOps.length - 1), ...this.repeatOpsAlt]
    }
  }
}
</script>
