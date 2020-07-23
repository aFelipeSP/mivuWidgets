<template>
  <div class="item-search-box">
    <a-select
      v-if="!lockCategory"
      :search="true"
      :placeholder="$tc('Category', 1)"
      :value="value"
      @input="$emit('input', $event)" 
      :values="categories"
      labelField="name"
      idField="_id"
      :returnObject="false"
    >
      <template #item="{item}">
        {{item.name}}
        <span class="a-desc">
          {{item.workspace.name}}
        </span>
      </template>
    </a-select>
    <div v-else class="a-title">{{(category || {}).name}}</div>
    <a-expression-editor
      class="item-search-box-filter"
      v-model="filter"
      :suggestions="suggestions"
      @function="filterFunction = $event"
    />
    <div class="item-search-box-fields">
      <a-unordered-list :value="fields || []" :newValueExample="''"
        @input="$emit('fields', $event)" group="categoryFields"
      >
        <template #default="obj">
          <a-input class="item-search-box-field-item"
            @input="updateFields(obj.index, $event)"
            :value="obj.item" :suggestions="suggestions"
          />
        </template>
      </a-unordered-list>
    </div>
    <a-push-button
      class="item-search-box-button mi-search"
      style="margin-top:10px"
      @click="search"
    />
    <div class="item-search-box-items">
      <div
        class="item-search-box-item"
        v-text="'SELF ITEM'"
        @click="$emit('select', undefined)"
      />
      <div
        v-for="(item, index) in items"
        :key="'i' + index"
        class="item-search-box-item"
        @click="$emit('select', item)"
      >
        <div
          v-for="(field, index) in fields"
          :key="'r' + index"
          class="item-search-box-item-field"
        >
          <span class="a-label" v-text="field + ':'" />&nbsp;
          {{item[field]}}
        </div>
      </div>
    </div>
  </div>
</template>

<style>
</style>

<script>
/* eslint-disable no-console */
import { deepCopy } from '@/utils/copy'
import { getCategoryProperties_ } from '@/utils/category'
import AExpressionEditor from '@/components/AExpressionEditor'
import AUnorderedList from '@/components/AUnorderedList'

export default {
  components: {
    AExpressionEditor,
    AUnorderedList
  },
  props: {
    value: String,
    categories: {type: Array, default: () => []},
    lockCategory: { type: Boolean, default: false},
    fields: {type: Array, default: () => []}
  },
  data () {
    return {
      category: {},
      suggestions: [],
      filter: null,
      filterFunction: null,
      items: []
    }
  },
  watch: {
    value: {
      async handler (newVal) {
        if (newVal) {
          this.category = await this.$db.get('category', newVal)
          this.suggestions = getCategoryProperties_([this.category]).map(
            el => el.name
          )
        }
      },
      immediate: true
    }
  },
  methods: {
    async search () {
      let query = ['item']
      if (this.filter != null && this.filter != '') {
        if (this.filterFunction) query.push([['filter', this.filter]])
        else {
          this.$notify(this.$t('itemSearch.error.wrongFilter'), {type: 'error'})
          this.items = []
          return
        }
      } else query.push(null)
      if (this.value) query.push({category: {'=': this.value}})
      this.items = await this.$db.getList(...query)
    },
    updateFields (index, value) {
      let fields = deepCopy(this.fields)
      fields[index] = value
      this.$emit('fields', fields)
    }
  }
}
</script>

<style lang="sass">
.item-search-box
  height: 100%
  display: flex
  flex-direction: column
  .item-search-box-fields
    margin-top: 10px
    padding: 15px
    border-radius: 5px
    background-color: #e0e0e0
    .item-search-box-field-item
      padding: 10px
      background-color: white
      border: 1px solid #eeeeee
  .item-search-box-filter
    border: 1px solid #f0f0f0
    padding: 5px
    margin-top: 5px
  .item-search-box-items
    margin-top: 10px
    flex: 1
    overflow: auto
    .item-search-box-item
      display: flex
      align-items: center
      flex-wrap: wrap
      border-radius: 5px
      overflow: hidden
      padding: 7px 2px
      cursor: pointer
      border-top: 1px solid #eeeeee
      .item-search-box-item-field
        flex: 1 0 auto
      &:first-child
        border-top: none
  .item-search-box-button
    border-radius: 5px
    display: flex
    align-items: center
    justify-content: center
    padding: 5px
</style>
