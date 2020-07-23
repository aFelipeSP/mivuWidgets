<template>
  <div class="a-schema-content">
    <template v-if="item.type !== 'item'">
      <div class="options-box">
        <div
          v-if="['string', 'number'].includes(item.type)"
          style="flex:1"
          :class="['a-schema-button', (item.enum !== undefined) ? 'selected' : '']"
          v-text="'Options'"
          @click="update({enum: item.enum != null ? undefined : []})"
        />
        <div
          v-if="['string', 'number'].includes(item.type)"
          style="flex:1"
          :class="['a-schema-button', (item.array === true) ? 'selected' : '']"
          v-text="'List field'"
          @click="update({array: item.array != null ? undefined : true})"
        />
        <div
          v-if="item.type === 'number'"
          style="flex:1"
          :class="['a-schema-button', (item.maximum !== undefined) ? 'selected' : '']"
          v-text="'Range'"
          @click="update(item.maximum !== undefined
            ? {minimum: undefined, maximum: undefined, step: undefined}
            :{minimum: null, maximum: null, step: 1})
          "
        />
      </div>
      <template v-if="askDefault">
        <div class="default" v-if="item.default !== undefined">
          <a-button
            class="corner-button"
            icon="minus"
            @click="update({default: undefined})"
          />
          <a-toggle
            v-if="item.type === 'boolean'"
            :value="item.default"
            @input="update({default: $event})"
          />
          <template v-else-if="item.type === 'string' || item.type === 'number'">
            <a-select
              v-if="Array.isArray(item.enum)"
              class="select"
              style="width: 100%"
              :placeholder="$t('schema.defaultValue')"
              :search="true"
              :value="item.default"
              :values="item.enum"
              @input="update({default: $event})"
            />
            <a-input
              v-else
              style="padding:0px 7px"
              :placeholder="$t('schema.defaultValue')"
              :type="item.type === 'string' ? 'textarea' : 'number'"
              :value="item.default"
              clearable
              @input="update({default: $event})"
            />
          </template>
          <a-datepicker
            v-else-if="item.type === 'datetime'"
            class="select"
            style="width:100%"
            :value="item.default"
            @input="update({default: $event})"
          />
        </div>
        <div
          v-else
          class="a-schema-button"
          v-text="'Set default value'"
          @click="update({default: null})"
        />
      </template>
      <div v-if="item.maximum !== undefined" class="range">
        <a-input
          class="input"
          :placeholder="$t('schema.minimum')"
          type="number"
          :value="item.minimum"
          @input="update({minimum: $event})"
          clearable
        />
        <a-input
          class="input"
          :placeholder="$t('schema.maximum')"
          type="number"
          :value="item.maximum"
          @input="update({maximum: $event})"
          clearable
        />
        <a-input
          class="input"
          :placeholder="$t('schema.step')"
          type="number"
          :value="item.step"
          @input="update({step: $event})"
          clearable
        />
      </div>
      <div v-if="Array.isArray(item.enum)" style="padding:10px">
        <a-list
          :value="item.enum"
          :type="item.type === 'number' ? 'number' : 'text'"
          @input="update({enum: $event})"
        />
      </div>
    </template>
    <template v-else>
      <a-select
        class="select"
        :search="true"
        :placeholder="$tc('Category', 1)"
        :value="item.category"
        @input="update({category: $event})"
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
      <div style="padding:15px">
        <a-ordered-list :value="item.fields || []" :newValueExample="''"
          @input="update({fields: $event})" group="categoryFields"
        >
          <template #default="obj">
            <a-input style="padding:10px;background-color:white;border:1px solid #eeeeee"
              @input="updateCategoryFields(obj.index, $event)"
              :value="obj.item" :suggestions="suggestions"
            />
          </template>
        </a-ordered-list>
      </div>
      <div
        :class="['a-schema-button', (item.array === true) ? 'selected' : '']"
        v-text="'List field'"
        @click="update({array: item.array != null ? undefined : true})"
      />
    </template>
  </div>
</template>

<script>
/* eslint-disable no-console */
import ATreeItem from '@/components/ATree/ATreeItem'
import { getCategoryProperties_ } from '@/utils/category'
import AOrderedList from '@/components/AOrderedList'

export default {
  name: 'a-schema',
  components: {
    ATreeItem,
    AOrderedList
  },
  props: {
    item: Object,
    askDefault: Boolean,
    categories: Array
  },
  data () {
    return {
      suggestions: []
    }
  },
  watch: {
    item: {
      async handler (newVal) {
        if ((newVal || {}).category != null) {
          let category = await this.$db.get('category', newVal.category)
          this.suggestions = getCategoryProperties_([category]).map(
            el => el.name
          )
        }
      },
      immediate: true
    }
  },
  methods: {
    update (val) { this.$emit('input', val) },
    updateCategoryFields (index, value) {
      let fields = this.item.fields
      fields[index] = value
      this.$emit('input', { fields })
    }
  }
}
</script>

<style lang="sass">
.a-schema-content-box
  flex: 1
  overflow: hidden
  margin-bottom: 10px
  border-radius: 0px 0px 15px 15px
  box-shadow: shadow(1.5px)
  >.default
    display: flex
    align-items: center
  >.options-box
    display: flex
  >.range
    display: flex
    >.input
      padding: 5px
      border: 1px solid rgba(0,0,0,0.05)
  >.enum
    padding: 5px
.a-schema-content
  >.default
    display: flex
    align-items: center
  >.options-box
    display: flex
  >.range
    display: flex
    >.input
      padding: 5px
      border: 1px solid rgba(0,0,0,0.05)
  >.enum
    padding: 5px
</style>
