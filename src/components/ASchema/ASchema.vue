<template>
  <div class="a-schema">
    <a-tree-item :data="value" childrenLabel="properties">
      <template #title="{item, index}">
        <div
          class="a-schema-title"
          :class="{object: item.type === 'object'}"
          :style="{backgroundColor: error ? '#ffcccc' : '#e1e1e1'}"
        >
          <a-select
            class="select"
            :values="types"
            :value="item.type"
            @input="update('type', index, $event)"
          />
          <a-input
            v-if="isNew"
            class="name"
            type="text"
            :value="item.name"
            @input="update('name', index, $event)"
            clearable
          />
          <div 
            v-else
            class="name-button"
            v-text="item.name"
            @click="changeFieldName(index)"
          />
          <a-button
            class="corner-button"
            icon="minus"
            @click="dropItem(index)"
          />
        </div>
      </template>
      <template #content="{item, index}">
        <div v-if="item.type !== 'object'" class="a-schema-content-box"
          :style="{
            backgroundColor: error ? '#ffdddd' : '#eeeeee'
          }"
        >
          <a-schema-item v-if="visibleFields.has(index)" :item=item
            :askDefault=askDefault :categories=categories
            @input="updateItem(index, $event)" 
            :style="{
              backgroundColor: error ? '#ffdddd' : '#eeeeee'
            }"
          />
          <div
            :class="['a-schema-content-closed', 'mi-caret-down', 
              visibleFields.has(index) ? 'selected' : ''
            ]"
            @click="toggleContent(index)"
          />
        </div>
        <div style="margin-bottom:10px"/>
      </template>
      <template #children="{item, index}">
        <a-schema
          :value="item.properties"
          :askDefault="askDefault"
          :isNew="isNew"
          @input="update('properties', index, $event)"
          @error="updateChildrenErrors(item.name, $event)"
          @fieldNameChanged="childFieldNameChanged(index, $event)"
        />
      </template>
    </a-tree-item>
    <div class="add-button">
      <a-button
        class="circular-button"
        icon="plus"
        @click="newItem"
      />
    </div>
    <a-modal
      class="a-schema-name-editor"
      v-model="nameEditorModal"
    >
      <div style="padding:15px;">
        <div>{{$t('schema.updateFieldName')}}</div>
        <a-input
          class="s-1"
          type="text"
          v-model="nameEditorValue"
          clearable
        />
        <div class="a-button-box">
          <a-button
            text="Update"
            @click="updateFieldName"
          />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
/* eslint-disable no-console */
import { deepCopy } from '@/utils/copy'
import ATreeItem from '@/components/ATree/ATreeItem'
import ASchemaItem from './ASchemaItem'

export default {
  name: 'a-schema',
  components: {
    ATreeItem,
    ASchemaItem
  },
  props: {
    value: {type: Array, default: () => []},
    root: Boolean,
    askDefault: Boolean,
    isNew: { type: Boolean, default: true },
    categories: Array,
    canItem: { type: Boolean, default: true }
  },
  data () {
    return {
      timeout: null,
      error: false,
      childrenErrors: {},
      errorDelay: 1000,
      forbiddenNames: [
        '_id',
        'category',
        'date_created',
        'date_modified',
        'date_uploaded',
        '_reminders'
      ],
      varRegex: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
      nameEditorModal: false,
      nameEditorValue: null,
      nameEditorIndex: null,
      visibleFields: new Set()
    }
  },
  computed: {
    types () {
      let ops = ['string', 'number', 'boolean', 'datetime', 'object']
      if (this.canItem) ops.push('item')
      return ops
    }
  },
  methods: {
    toggleContent(index) {
      if (this.visibleFields.has(index)) {
        this.visibleFields.delete(index)
      } else {
        this.visibleFields.add(index)
      }
      this.visibleFields = new Set(this.visibleFields)
    },
    changeFieldName (index) {
      this.nameEditorIndex = index
      this.nameEditorModal = true
    },
    updateFieldName () {
      let name = this.nameEditorValue.trim()
      if (name === '') {
        this.$notify(this.$t('schema.error.emptyName'), {type: 'error'})
        return
      }
      for (let prop of this.value) {
        if (prop.name === name) {
          this.$notify(this.$t('schema.error.existingName'), {type: 'error'})
          return
        }
      }
      if (this.forbiddenNames.includes(name)) {
        this.$notify(this.$t('schema.error.forbiddenName', {name}), {type: 'error'})
        return
      }
      if (!this.varRegex.test(name)) {
        this.$notify(this.$t('schema.error.invalidName', {name}), {type: 'error'})
        return
      }

      this.$emit('fieldNameChanged',
        { old: this.value[this.nameEditorIndex].name, new: name, renamePath: '',
          setPath: 'properties.' + this.nameEditorIndex.toString() + '.name' })
      
      let schema = deepCopy(this.value)
      schema[this.nameEditorIndex].name = name
      this.$emit('input', schema)

      this.nameEditorIndex = null
      this.nameEditorValue = null
      this.nameEditorModal = false
    },
    childFieldNameChanged (index, child) {
      child.renamePath = this.value[index].name + '.' + child.renamePath
      child.setPath = 'properties.' + index.toString() + '.' + child.setPath
      this.$emit('fieldNameChanged', child)
    },
    updateChildrenErrors (prop, value) {
      this.childrenErrors[prop] = value
      this.checkErrors()
    },
    checkErrors () {
      let seen = new Set()
      for (let prop of this.value) {
        if (seen.has(prop.name)) {
          this.error = true
          this.$emit('error', this.$t('schema.error.duplicate'))
          return
        } else seen.add(prop.name)

        if (this.forbiddenNames.includes(prop.name)) {
          this.error = true
          this.$emit('error', this.$t('schema.error.forbiddenName', {name: prop.name}))
          return
        }
        if (!this.varRegex.test(prop.name)) {
          this.error = true
          this.$emit('error', this.$t('schema.error.invalidName', {name: prop.name}))
          return
        }
      }

      for (let child of Object.values(this.childrenErrors)) {
        if (child != null) {
          this.error = true
          this.$emit('error', child)
          return
        }
      }

      this.error = false
      this.$emit('error', null)
    },
    updateItem (index, value) {
      let schema = deepCopy(this.value)
      for (let key in value) {
        let v = value[key]
        if (v === undefined) delete schema[index][key]
        else schema[index][key] = v
      }
      this.$emit('input', schema)
    },
    update (key, index, value) {
      let schema = deepCopy(this.value)
      if (key === 'name') {
        clearTimeout(this.timeout)
        this.timeout = setTimeout(this.checkErrors, this.errorDelay)
      }
      if (key === 'type') {
        schema[index] = {type: value, name: schema[index].name}
        if (value === 'object') {
          schema[index].properties = [{type: 'string'}]
        }
      } else {
        schema[index][key] = value
      }
      
      this.$emit('input', schema)
    },
    newItem () {
      let schema = deepCopy(this.value)
      schema.push({name: '', type: 'string'})
      this.$emit('input', schema)
    },
    dropItem (index) {
      let schema = deepCopy(this.value)
      schema.splice(index, 1)
      this.$emit('input', schema)
      this.$nextTick(() => this.checkErrors())
    },
    toggleEnum (index) {
      let schema = deepCopy(this.value)
      if (schema[index].enum != null) {
        delete schema[index].enum
      } else {
        schema[index].enum = []
      }
      this.$emit('input', schema)
    }
  }
}
</script>

<style lang="sass">
.a-schema
  .a-schema-title
    flex: 1
    display: flex
    overflow: hidden
    align-items: center
    border-radius: 15px 15px 0px 0px
    box-shadow: shadow(1.5px)
    &.object
      border-radius: 15px
    >.name
      flex: 1
      padding: 7px
    >.name-button
      flex: 1
      padding: 7px
      min-height: 1em
      &:hover
        cursor: pointer
  .a-schema-button
    text-align: center
    padding: 5px 0px
    cursor: pointer
    border: 1px solid rgba(0,0,0,0.1)
    &:hover
      background-color: #dddddd
    &.selected
      background-color: #cccccc
      &:hover
        background-color: #dddddd
  .a-schema-content-closed
    padding: 2px
    width: 100%
    cursor: pointer
    display: flex
    align-items: center
    justify-content: center
    &.selected:before
      transform: rotate(180deg)
    &:hover
      background-color: #dddddd
  .corner-button
    background-color: #eeeeee
    height: 100%
    padding: 10px
    &:hover
      background-color: #ffdddd
  .selectcorner-button
    >.a-resp-dropdown-clickable
      border-radius: 0px
      border: 1px solid rgba(0,0,0,0.05)
  >.add-button
    padding: 0px 0px 10px 26px
  .select
    >.a-resp-dropdown-clickable
      border-radius: 0px
      border: 1px solid rgba(0,0,0,0.05)
</style>
