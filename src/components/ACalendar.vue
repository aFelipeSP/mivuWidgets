<template>
  <div class="a-calendar">
    <div class="a-calendar-header">
      <div class="arrow" @click="move(-1)" v-text="'<'" />
      <div class="year" @click="view=0">{{year}},&nbsp;</div>
      <div class="month" @click="view=1">{{months[month]}}</div>
      <div class="arrow" @click="move(1)" v-text="'>'"/>
    </div>
    <div class="a-calendar-body">
      <div v-if="view == 0" class="year-view">
        <div :key="'y' + index" v-text="nyear"
          v-for="(nyear, index) in years"
          @click="year = nyear; view=1"
          :class="{selected: nyear === year}"
        />
      </div>
      <div v-if="view == 1" class="month-view">
        <div :key="'m' + index" v-text="nmonth"
          v-for="(nmonth, index) in months"
          @click="month = index; view=2"
          :class="{selected: index === month}"
        />
      </div>
      <div v-if="view == 2" class="calendar">
        <div class="day-names">
          <div v-for="(dayName, index) in weekDays"
            v-text="dayName" :key="'n' + index"
          />
        </div>
        <div class="weeks">
          <div :key="'d' + index" v-text="nday.day"
            v-for="(nday, index) in calendar"
            @click="dayClicked(nday)"
            :class="{
              grayed: nday.grayed,
              selected: nday.day === day
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="sass">
$selected: #dfdfdf
$height: 25px

.a-calendar
  text-align: center
  cursor: pointer
  user-select: none
  .a-calendar-header
    display: flex
    align-items: center
    height: 30px
    line-height: 30px
    .arrow
      width: 40px
      font-weight: bolder
    .year
      flex: 1
      text-align: right
      font-weight: bold
    .month
      flex: 1
      text-align: left
      font-weight: bold
  .a-calendar-body
    height: 200px
    .year-view
      display: flex
      flex-wrap: wrap
      height: 100%
      &>div
        flex: 0 1 20%
        display: flex
        align-items: center
        justify-content: center
        &.selected
          background-color: $selected
    .month-view
      display: flex
      flex-wrap: wrap
      height: 100%
      &>div
        display: flex
        align-items: center
        justify-content: center
        flex: 0 1 25%
        &.selected
          background-color: $selected
    .calendar
      display: flex
      flex-direction: column
      height: 100%
      .day-names
        display: flex
        &>div
          font-weight: bold
          background-color: #b5b5b5
          color: white
          height: $height
          line-height: $height
          flex: 0 1 14.2857%
      .weeks
        flex: 1
        display: flex
        flex-wrap: wrap
        &>div
          display: flex
          align-items: center
          justify-content: center
          flex: 0 1 14.2857%
          &.selected
            background-color: $selected
          &.grayed
            color: #afafaf
            background-color: white
</style>

<script>
/* eslint-disable no-console */

export default {
  props: {
    value: Date,
    locale: String
  },
  data () {
    return {
      day: null,
      month: null,
      year: null,
      view: 2,
      viewYear: null
    }
  },
  methods: {
    getDate (value) {
      let date = null
      if (value == null)
        date = new Date()
      else {
        date = value
      }
      this.year = date.getFullYear()
      this.viewYear = this.year
      this.month = date.getMonth()
      this.day = date.getDate()
    },
    dayClicked(day) {
      let date = null
      if (this.value == null)
        date = new Date()
      else {
        date = new Date(this.value)
      }
      this.day = day.day
      date.setFullYear(day.year)
      date.setMonth(day.month)
      date.setDate(day.day)
      this.$emit('input', date)
    },
    move (amount) {
      if (this.view === 0) {
        this.viewYear = this.viewYear + 15*amount
      } else {
        let newDate = new Date(this.year, this.month + amount, 1)
        this.month = newDate.getMonth()
        this.year = newDate.getFullYear()
      }
    }
  },
  computed: {
    locale_ () {
      return (this.locale != null) ? this.locale : this.$root.$i18n.locale
    },
    years () {
      let years = []
      for (let i = this.viewYear - 7; i < this.viewYear + 8; i++)
        years.push(i)
      return years
    },
    months () {
      let baseDate = new Date(2017, 0, 2)
      var months = [];
      for (let i = 0; i < 12; i++) {
        months.push(baseDate.toLocaleDateString(this.locale_, { month: 'short' }))
        baseDate.setMonth(baseDate.getMonth() + 1)
      }
      return months;
    },
    weekDays () {
      let baseDate = new Date(2017, 0, 1)
      var weekDays = [];
      for (let i = 0; i < 7; i++) {
        weekDays.push(baseDate.toLocaleDateString(this.locale_, { weekday: 'short' }).slice(0, 2))
        baseDate.setDate(baseDate.getDate() + 1)
      }
      return weekDays;
    },
    calendar () {
      let lastDay = new Date(this.year, this.month + 1, 0)
      let ndays = lastDay.getDate()
      let lastWeekDay = lastDay.getDay()
      let firstWeekDay = new Date(this.year, this.month, 1).getDay()
      let lastMonthNdays = new Date(this.year, this.month, 0).getDate()

      let days = []
      for (let i = lastMonthNdays - firstWeekDay + 1; i < lastMonthNdays + 1; i++)
        days.push({year: this.year, month: this.month - 1, day: i, grayed: true})
      for (let i = 1; i < ndays + 1; i++)
        days.push({year: this.year, month: this.month, day: i})
      for (let i = 1; i < 7 - lastWeekDay; i++)
        days.push({year: this.year, month: this.month + 1, day: i, grayed: true})

      return days
    }
  },
  watch: {
    value (value) {
      this.getDate(value)
    }
  },
  mounted () {
    this.getDate(this.value)
  }
}
</script>
