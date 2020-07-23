<template>
  <a-resp-dropdown ref="respDropdown" class="a-select" v-model="opened">
    <template #clickable>
      <div
        v-if="multiple"
        style="flex: 1;overflow: auto;"
      >
        <div v-if="value == null || value.length === 0">{{placeholder}}</div>
        <div
          class="a-select-chip"
          v-for="(el, index) in value"
          :key="'chip' + index"
          v-text="getLabel(el)"
          @click="chipClicked($event, el)"
        />
      </div>
      <div v-else style="flex: 1;overflow: auto;">
        {{label}}
      </div>
      <div v-if="caret" class="a-icon mi-caret-down" />
    </template>
    <template #dropdown>
      <div class="a-select-box">
        <div v-if="search" class="a-select-search">
          <a-input
            v-model="searchValue"
            :placeholder="searchPlaceholder_"
            icon='search'
            clearable
          />
        </div>
        <div v-if="multiple" class="a-select-multiopts">
          <div @click="selectAll(0)">
            <div class="a-select-item-tick" style="background-color:transparent"/>
          </div>
          <div @click="selectAll(1)">
            <div class="a-select-item-tick" style="background-color:#bbbbbb"/>
          </div>
        </div>
        <div
          v-for="(el, index) in nvalues"
          :key="index"
          class="a-select-item"
          @click="selectValue(el)"
        >
          <div v-if="multiple" class="a-select-item-tick" :style="{
            backgroundColor: isSelected(el) ? '#bbbbbb': 'transparent'
          }"/>
          <div style="flex:1">
            <slot name="item" :item="el" :index="index" :isSelected="isSelected(el)">
              <div v-text="getLabelField(el)" />
            </slot>
          </div>
        </div>
      </div>
    </template>
  </a-resp-dropdown>
</template>

<script>
import ARespDropdown from './ARespDropdown'
import AInput from './AInput.vue'
import { deepCopy } from '@/utils/copy'
/* eslint-disable no-console */

export default {
  components: {
    ARespDropdown,
    AInput
  },
  props: {
    value: [String, Number, Array, Object],
    placeholder: String,
    values: { type: Array, default: ()=>[] },
    multiple: Boolean,
    search: Boolean,
    caret: { type: Boolean, default: true },
    searchPlaceholder: { type: String, default: 'Search' },
    idField: { type: String, default: 'id' },
    labelField: { type: String, default: 'label' },
    returnObject: { type: Boolean, default: true }
  },
  data () {
    return {
      opened: false,
      searchValue: ''
    }
  },
  computed: {
    nvalues () {
      if (this.searchValue != null && this.searchValue.trim() !== '') {
        let self = this
        return this.values.filter((el) => {
          let value = this.getLabelField(el)
          return value.toString().toLowerCase()
            .includes(self.searchValue)
        })
      } else return this.values
    },
    label () {
      if (this.value == null) return this.placeholder
      else if (this.returnObject)
        return this.getLabelField(this.value)
      else
        if (this.values.length === 0) {
          return this.value
        } else {
          return this.values.find(
            x => x[this.idField] === this.value)[this.labelField]
        }
    },
    searchPlaceholder_ () {
      return ( this.searchPlaceholder != null
        ? this.searchPlaceholder
        : this.$t('select.defaultSearchPlaceholder'))
    }
  },
  methods: {
    selectAll (op) {
      if (op === 0) {
        this.$emit('input', [])
      } else if (op === 1) {
        if (this.returnObject) {
          this.$emit('input', deepCopy(this.values))
        } else {
          this.$emit('input', this.values.map(x => x[this.idField]))
        }
      }
    },
    getLabelField (el) {
      return (el !== null && el[this.labelField] !== undefined)
        ? el[this.labelField] : el
    },
    getLabel (item) {
      if (this.returnObject)
        return this.getLabelField(item)
      else {
        let values = this.values.find(
          x => x[this.idField] === item)
        if (values != null)
          return values[this.labelField]
        return null
      }
    },
    valueChanged (nvalue) {
      this.$emit('input', deepCopy(nvalue))
    },
    clearSearch (event) {
      this.searchValue = ''
      event.stopPropagation()
    },
    isSelected (value) {
      if (Array.isArray(this.value)) {
        if ((
            typeof value === 'object' && (
            (this.returnObject &&
            this.value.find(
              x => x[this.idField] === value[this.idField]
            ) != null) ||
            (!this.returnObject &&
            this.value.find(
              x => x === value[this.idField]
            ) != null)
          )) ||
          this.value.includes(value)
        ) return true
      }
      return false
    },
    chipClicked (event, value) {
      this.dropItem(value)
      event.stopPropagation()
    },
    dropItem (value) {
      let fn = null
      if (typeof value === 'object')
        if (this.returnObject)
          fn = x => x[this.idField] !== value[this.idField]
        else
          fn = x => x !== value[this.idField]
      else
        fn = x => x !== value
      this.valueChanged(this.value.filter(fn))
    },
    selectValue (value) {
      if (this.multiple) {
        if (
          Array.isArray(this.value) && 
          (
            typeof value === 'object' && (
              (
                this.returnObject &&
                this.value.find(
                  x => x[this.idField] === value[this.idField]
                ) != null
              ) || (
                !this.returnObject &&
                this.value.find(
                  x => x === value[this.idField]
                ) != null
              )
            ) ||
            this.value.includes(value)
          )
        ) {
          this.dropItem(value)
        } else {
          let nvalue = []
          if (Array.isArray(this.value)) {
            nvalue = deepCopy(this.value)
          }
          if (this.returnObject || typeof value !== 'object')
            nvalue.push(value)
          else
            nvalue.push(value[this.idField])
          this.$emit('input', nvalue)
        }
        this.$nextTick(
          this.$refs.respDropdown.onresize
        )
      } else {
        if (this.returnObject || typeof value !== 'object')
          this.$emit('input', value)
        else
          this.$emit('input', value[this.idField])
        this.opened = false
      }
    // },
    // upDownEvent (e) {
    //   if (e.target === this.$refs.aselect && !this.multiple) {
    //     let i = this.nvalues.indexOf(this.value)
    //     e.preventDefault()
    //     if (e.key === 'ArrowDown') {
    //       if (i < this.nvalues.length - 1) this.$emit('input', this.nvalues[i + 1])
    //     } else if (e.key === 'ArrowUp') {
    //       if (i > 0) this.$emit('input', this.nvalues[i - 1])
    //     }
    //   }
    }
  // },
  // mounted () {
  //   window.addEventListener("keydown", this.upDownEvent)
  // },
  // destroyed () {
  //   window.removeEventListener("keydown", this.upDownEvent)
  }
}
</script>

<style lang="sass">
.a-select
  .a-resp-dropdown-clickable
    height: 100%
    @extend %box-1
    width: 100%
    cursor: pointer
    display: flex
    align-items: center
  &-box
    padding: 6px
  &-search
    top: 0
    background-color: white
    position: sticky
    padding: 10px
    border-bottom: 1px solid hsl(0,0,90%)
    display: flex
    align-items: center
    margin-bottom: 5px
  &-multiopts
    display: flex
    align-items: center
    >div
      padding: 10px
      flex: 1
      cursor: pointer
      display: flex
      align-items: center
      justify-content: center
      &:hover
        background-color: #f0f0f0
  &-chip
    display: inline-block
    padding: 1px 10px
    border-radius: 15px
    background-color: rgba(0,0,0,0.16)
    margin: 2px
  &-item
    padding: 5px
    cursor: pointer
    display: flex
    align-items: center
    &-tick
      width: 10px
      height: 10px
      margin-right: 5px
      border-radius: 3px
      border: 1px solid #aaaaaa
    &:hover
      background-color: #f1f1f1
</style>
