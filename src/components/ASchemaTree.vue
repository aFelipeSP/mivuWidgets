<template>
  <div class="a-schema-tree">
    <a-tree-item :data="schema" childrenLabel="properties">
      <template #title="{item}">
        <div style="padding: 5px 3px">
          {{item.name}}
        </div>
      </template>
      <template #content="{item}">
        <div style="flex:1">
          <a-unordered-list
            v-if="item.array"
            :newValueExample="(useDefault && item.default != null) ? item.default : null"
            :value="nvalue[item.name] || []"
            @input="update(item.name, $event)"
          >
            <template #default="obj">
              <a-input
                style="padding:10px;border:1px solid #e0e0e0"
                v-if="
                  item.enum == null &&
                  ['string', 'number'].includes(item.type)
                "
                :type="item.type === 'string' ? 'textarea' : 'number'"
                :value="obj.item"
                @input="updateArray(item.name, obj.index, $event)"
                clearable
              />
               <a-select
                v-else-if="
                  item.enum != null &&
                  ['string', 'number'].includes(item.type)
                "
                style="width: 100%"
                :value="obj.item"
                @input="updateArray(item.name, obj.index, $event)"
                :values="item.enum"
              />
              <div style="display:flex;align-items:center">
                <a-button
                  style="padding:10px;border:1px solid #e0e0e0"
                  icon="copy"
                  @click="copyId(obj.item)"
                />
                <a-item-search-widget
                  class="a-item-search"
                  v-if="item.type === 'item'"
                  :category="item.category"
                  :fields="item.fields"
                  :value="obj.item"
                  :lockCategory="true"
                  @input="updateArray(item.name, obj.index, $event)"
                />
              </div>
            </template>
          </a-unordered-list>
          <a-select
            v-else-if="item.enum != null && 
              (item.type === 'string' || item.type === 'number')"
            style="width: 100%"
            :value="nvalue[item.name]"
            @input="update(item.name, $event)"
            :values="item.enum"
          />
          <a-toggle v-else-if="item.type === 'boolean'"
            :value="nvalue[item.name]"
            @input="update(item.name, $event)"
          />
          <a-input
            class="s-2"
            v-else-if="(item.type === 'string' || item.type === 'number') &&
              item.enum == null && item.maximum == null"
            :type="item.type === 'string' ? 'textarea' : 'number'"
            :value="nvalue[item.name]"
            @input="update(item.name, $event)"
            clearable
          />
          <a-slider
            style="width: 100%"
            v-else-if="item.type === 'number' && item.maximum != null"
            :min="item.minimum"
            :max="item.maximum"
            :step="item.step"
            :value="nvalue[item.name]"
            @input="update(item.name, $event)"
          />
          <a-datepicker
            v-else-if="item.type === 'datetime'"
            style="width:100%"
            :value="nvalue[item.name]"
            @input="update(item.name, $event)"
          />
          <div 
            v-else-if="item.type === 'item'"
            style="display:flex;align-items:center"
          >
            <a-button
              style="padding:10px;border:1px solid #e0e0e0"
              icon="copy"
              @click="copyId(nvalue[item.name])"
            />
            <a-item-search-widget
              class="a-item-search"
              :category="item.category"
              :fields="item.fields"
              :value="nvalue[item.name]"
              :lockCategory="true"
              @input="update(item.name, $event)"
            />
          </div>
          <div style="margin-bottom:10px" />
        </div>
      </template>
      <template #children="{item}">
        <a-schema-tree
          @input="update(item.name, $event)"
          @itemSearch="$emit('itemSearch', $event)"
          :schema="item.properties"
          :value="nvalue[item.name] || null"
          :useDefault="useDefault"
          :updateDefaults="updateDefaults"
        />
      </template>
    </a-tree-item>
  </div>
</template>

<script>
/* eslint-disable no-console */
import { deepCopy } from '@/utils/copy'
import AItemSearchWidget from '@/components/AItemSearch/AItemSearchWidget'
import ATreeItem from '@/components/ATree/ATreeItem'
import AUnorderedList from '@/components/AUnorderedList'


export default {
  name: 'a-schema-tree',
  components: {
    ATreeItem,
    AUnorderedList,
    AItemSearchWidget
  },
  props: {
    schema: Array,
    value: { type: Object, default: () => ({}) },
    useDefault: { type: Boolean, default: true },
    updateDefaults: Boolean
  },
  data () {
    return {
    }
  },
  watch: {
    schema: {
      handler () { this.setDefaults() },
      immediate: true
    },
    updateDefaults: {
      handler () {this.setDefaults()},
      immediate: true
    },
  },
  computed: {
    nvalue () {
      return this.value || {}
    }
  },
  methods: {
    async copyId (id) {
      try {
        await navigator.clipboard.writeText(id)
        this.$notify(this.$t('copySuccess'), {type: 'success'})
      } catch {
        this.$notify(this.$t('copyError'), {type: 'error'})
      }
    },
    update (key, value) {
      let item = deepCopy(this.value) || {}
      item[key] = value
      this.$emit('input', item)
    },
    updateArray (key, index, value) {
      let item = deepCopy(this.value) || {}
      item[key][index] = value
      this.$emit('input', item)
    },
    setDefaults () {
      if (this.useDefault) {
        let item = deepCopy(this.value)
        if (item == null) item = {}
        for (let prop of this.schema) {
          if (
            item[prop.name] == null &&
            prop.type != 'object' &&
            !prop.array &&
            prop.default != null
          )
          {
            item[prop.name] = prop.default
          }
        }
        this.$emit('input', item)
      }
    }
  }
}
</script>

<style lang="sass">
.a-schema-tree
  .a-item-search
    background-color: #f0f0f0
    border: 1px solid #eaeaea
    flex: 1
    display: flex
    align-items: center
</style>
