<template>
  <div class="a-pipeline">
    <div class="a-label">{{$tc('Category', 2)}}</div>
    <a-select
      :search="true"
      :placeholder="$tc('Category', 1)"
      :value="value.categories"
      @input="update_('categories', $event)"
      :values="categories"
      labelField="name"
      idField="_id"
      :returnObject="false"
      :multiple="true"
    >
      <template #item="{item}">
        {{item.name}}
        <span class="a-desc">
          {{item.workspace.name}}
        </span>
      </template>
    </a-select>
    <div class="a-label">{{$tc('Pipeline', 1)}}</div>
    <div class="a-pipeline-container">
      <a-ordered-list
        :value="value.pipeline || []"
        @input="update_('pipeline', $event)"
        :newValueExample="['filter', '']"
        group="pipeline"
      >
        <template #default="{ item, index }">
          <div class="a-pipeline-item">
            <a-select
              :value="item[0]"
              @input="update(index,0,$event)"
              :values="stepNames"
              class="a-pipeline-select"
            />
            <div v-if="item[0] === 'project'" style="padding:10px;">
              <a-unordered-list
                :value="item[1]"
                @input="update(index, 1, $event)"
                :newValueExample="''"
              >
                <template #default="obj">
                  <div
                    style="display:flex;align-items:center"
                    class="a-pipeline-border"
                  >
                    <a-key-input
                      style="flex:1;padding:10px"
                      :value="obj.index"
                      @input="updateProject(index, obj.index, 'key', $event)"
                    />
                    <a-expression-editor
                      class="a-pipeline-left"
                      style="flex:1;padding:10px"
                      :value="obj.item"
                      @input="updateProject(index, obj.index, 'value', $event)"
                      :suggestions="categoryNames"
                    />
                  </div>
                </template>
              </a-unordered-list>
            </div>
            <a-expression-editor
              style="padding:10px"
              v-if="item[0] === 'filter'"
              :value="item[1]"
              @input="update(index, 1, $event)"
              :suggestions="categoryNames"
            />
            <div v-if="item[0] === 'group'">
              <div style="padding:10px">
                <a-ordered-list
                  :value="(item[1]||{})._id"
                  @input="updateGroup(index, '_id', $event)"
                  :newValueExample="''"
                  group="group"
                >
                  <template #default="obj">
                    <a-input
                      class="a-pipeline-border"
                      style="padding:10px"
                      :value="obj.item"
                      @input="updateGroupId(index, obj.index, $event)"
                      :suggestions="categoryNames"
                    />
                  </template>
                </a-ordered-list>
              </div>
              <div style="padding:10px">
                <a-unordered-list
                  :value="(item[1]||{}).fields"
                  @input="updateGroup(index, 'fields', $event)"
                  :newValueExample="['count', '']"
                >
                  <template #default="obj">
                    <div style="display:flex" class="a-pipeline-border">
                      <a-select
                        class="a-pipeline-select"
                        :value="obj.item[0]"
                        @input="updateGroupField(index, obj.index, 0, $event)"
                        :values="groupOps"
                      />
                      <a-key-input
                        style="padding:10px"
                        :value="obj.index"
                        placeholder="Group field name"
                        @input="updateGroupField(index, obj.index,'key', $event)"
                      />
                      <a-input
                        class="a-pipeline-left"
                        style="padding:10px"
                        placeholder="Field"
                        :value="obj.item[1]"
                        @input="updateGroupField(index, obj.index, 1, $event)"
                        :suggestions="categoryNames"
                      />
                    </div>
                  </template>
                </a-unordered-list>
              </div>
              <a-select
                :value="(item[1]||{}).type"
                @input="updateGroup(index, 'type', $event)"
                :values="groupTypes"
              />
            </div>
            <div v-if="item[0] === 'sort'" style="padding:10px">
              <a-ordered-list
                :value="item[1]"
                @input="update(index, 1, $event)"
                :newValueExample="1"
                group="sort"
              >
                <template #default="obj">
                  <div  style="display:flex" class="a-pipeline-border">
                    <a-key-input
                      style="padding:10px"
                      :value="obj.index"
                      @input="updateSort(index, obj.index, 'key', $event)"
                      :suggestions="categoryNames"
                    />
                    <div
                      style="padding:10px;cursor:pointer"
                      :class="'a-pipeline-left mi-sort-' +
                        (obj.item === 1 ? 'asc' : 'desc')"
                      @click="updateSort(
                        index, obj.index, 'value', obj.item === 1 ? -1 : 1)"
                    />
                  </div>
                </template>
              </a-ordered-list>
            </div>
            <a-input
              class="a-pipeline-border"
              style="padding:10px"
              v-if="item[0] === 'path'"
              :value="item[1]"
              @input="update(index, 1, $event)"
            />
          </div>
          <div style="margin-bottom:10px"/>
        </template>
      </a-ordered-list>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-console */

import { deepCopy } from '@/utils/copy'
import { getCategoryProperties_ } from '@/utils/category'
import { changeKeyName } from '@/utils/object'
import { groupOps } from '@/indexeddb/group'
import AOrderedList from '@/components/AOrderedList'
import AUnorderedList from '@/components/AUnorderedList'
import AExpressionEditor from '@/components/AExpressionEditor'
import AKeyInput from '@/components/AKeyInput'

export default {
  components: {
    AOrderedList,
    AUnorderedList,
    AExpressionEditor,
    AKeyInput
  },
  props: {
    value: {type: Object, default: () => ({})},
    categories: Array
  },
  data () {
    return {
      stepNames: ['project', 'filter', 'group', 'sort', 'path'],
      groupTypes: ['flat', 'non-flat', 'object'],
      groupOps
    }
  },
  computed: {
    categoryNames () {
      return getCategoryProperties_(this.categories).map(el => el.name)
    }
  },
  methods: {
    update_ (key, value) {
      let data = deepCopy(this.value)
      data[key] = value
      this.$emit('input', data)
    },
    update (idx1, idx2, value) {
      let data = deepCopy(this.value)
      if (idx2 === 0 && data.pipeline[idx1][idx2] !== value) {
        if (value === 'project') data.pipeline[idx1] = [value, {}]
        if (value === 'filter') data.pipeline[idx1] = [value, '']
        if (value === 'group')
          data.pipeline[idx1] = [value, {_id: [], fields: {}, type: null}]
        if (value === 'sort') data.pipeline[idx1] = [value, {}]
        if (value === 'path') data.pipeline[idx1] = [value, '']
      } else {
        data.pipeline[idx1][idx2] = value
      }
      this.$emit('input', data)
    },
    updateProject (idx1, idx2, part, value) {
      let data = deepCopy(this.value)
      if (part === 'key') {
        data.pipeline[idx1][1] = changeKeyName(
          data.pipeline[idx1][1], idx2, value
        )
      } else if (part === 'value') {
        data.pipeline[idx1][1][idx2] = value
      }
      this.$emit('input', data)
    },
    updateGroup (idx1, idx2, value) {
      let data = deepCopy(this.value)
      data.pipeline[idx1][1][idx2] = value
      this.$emit('input', data)
    },
    updateGroupId (idx1, idx2, value) {
      let data = deepCopy(this.value)
      data.pipeline[idx1][1]._id[idx2] = value
      this.$emit('input', data)
    },
    updateGroupField (idx1, idx2, part, value) {
      let data = deepCopy(this.value)
      if (part === 'key') {
        let newFields = changeKeyName(
          data.pipeline[idx1][1].fields, idx2, value
        )
        data.pipeline[idx1][1].fields = newFields
      } else {
        data.pipeline[idx1][1].fields[idx2][part] = value
      }
      this.$emit('input', data)
    },
    updateSort (idx1, idx2, part, value) {
      let data = deepCopy(this.value)
      if (part === 'key') {
        data.pipeline[idx1][1] = changeKeyName(
          data.pipeline[idx1][1], idx2, value
        )
      } else {
        data.pipeline[idx1][1][idx2] = value
      }
      this.$emit('input', data)
    }
  }
}
</script>

<style lang="sass">
$default-border: #e0e0e0

.a-pipeline
  .a-pipeline-container
    box-shadow: shadowInset(1.2px)
    background-color: #eaeaea
    border-radius: 10px
    padding: 20px
    padding-left: 10px
  .a-pipeline-item
    box-shadow: shadow(1.2px)
    border-radius: 10px
    overflow: hidden
    background-color: #ffffff
  .a-pipeline-border
    border: 1px solid $default-border
  .a-pipeline-left
    border-left: 1px solid $default-border
  .a-pipeline-select .a-resp-dropdown-clickable
      border-radius: 0px
      background-color: #f0f0f0
</style>