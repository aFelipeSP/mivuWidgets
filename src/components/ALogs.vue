<template>
  <div>
    <a-input
      clearable
      class="s-1"
      icon="search"
      v-model="searchText"
    />
    <div v-for="(log, index) in logs" :key="index">
      <div class="a-log">
        {{$t('logs.date')}}: {{log.date}},
        {{$t('logs.level')}}: {{log.level}},
        {{$t('logs.message')}}: {{log.message}}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      searchText: ''
    }
  },
  computed: {
    logs_ () {
      return this.$store.state.logs
    },
    logs () {
      let search = this.searchText.trim().toLowerCase()
      if (search != '') {
        return this.logs_.filter(
          x => x.name.toLowerCase().includes(search))
      } else
        return this.logs_
    }
  }
}
</script>

<style lang="sass">
.a-log
  border-top: 1px solid #d0d0d0
  padding: 15px 0px
</style>