
<template>
  <div class="a-item-search">
    <div
      v-if="value == null"
      style="padding:8px;cursor:pointer;flex:1"
      class="item-search-fields mi-file"
      @click="itemSearchModal = true"
    />
    <div
      v-else
      class="a-item-search-box"
      @click="itemSearchModal = true"
    >
      <template v-if="fields_.length > 0">
        <div
          v-for="(field, index) in fields_"
          :key="index"
          style="flex:1;font-size:90%;padding-right:15px"
        >
          <b>{{field + ': '}}</b> {{item[field] + '  '}}
        </div>
      </template>
      <template v-else>
        {{value}}
      </template>
    </div>
    <a-modal
      :value="itemSearchModal"
      :strict="false"
      @input="itemSearchModal = $event"
    >
      <div
        style="padding:20px"
      >
        <a-item-search-dialog
          :value=category
          :categories=categories
          :lockCategory=lockCategory
          :fields=fields
          @input="$emit('category', $event)"
          @select="searchSelected"
        />
      </div>
    </a-modal>
  </div>
</template>

<style lang="sass">
.a-item-search-box
  flex: 1
  display: flex
  flex-wrap: wrap
  padding: 10px
  align-items: center
  cursor: pointer
</style>

<script>
/* eslint-disable no-console */
import AItemSearchDialog from './AItemSearchDialog'


export default {
  components: {
    AItemSearchDialog
  },
  props: {
    value: String,
    category: String,
    categories: {type: Array, default: () => []},
    fields: {type: Array, default: () => []},
    lockCategory: Boolean
  },
  data () { return {
    item: undefined,
    // fieldsModal: false,
    itemSearchModal: false
  }},
  watch: {
    value: {
      async handler (newVal) {
        if (this.item === undefined) {
          if (newVal) this.item = await this.$db.get('item', newVal)
          else this.item = null
        }
      },
      immediate: true
    }
  },
  computed: {
    fields_ () {
      let fields = []
      if (this.item != null) {
        for (let field of this.fields) {
          if (this.item[field]) {
            fields.push(field)
          }
        }
      }
      return fields
    }
  },
  methods: {
    searchSelected (v) {
      this.$emit('input', (v||{})._id)
      this.item = v
      this.itemSearchModal = false
    }
  }
}
</script>
