<template>
  <div class="item-search">
    <a-item-search-widget
      style="flex:1"
      :category=category
      :categories=categories
      :value=value
      :fields=fields
      @input="$emit('input',$event)"
      @category="category = $event"
    />
    <div
      class="item-search-fields mi-list"
      @click="fieldsModal = true"
    />
    <a-modal
      :value=fieldsModal
      @input="fieldsModal = $event"
    >
      <div style="padding:20px">
        <div class="a-title">{{this.$tc('Field', 2)}}</div>
        <a-list
          :value="fields"
          @input="fields = $event"
        />
      </div>
    </a-modal>
  </div>
</template>

<script>
import AItemSearchWidget from './AItemSearchWidget'
export default {
  components: {
    AItemSearchWidget
  },
  props: {
    value: String,
    categories: Array
  },
  data () {
    return {
      category: null,
      fieldsModal: false,
      fields: []
    }
  },
}
</script>

<style lang="sass">
.item-search
  background-color: #eeeeee
  display: flex
  align-items: center
  .item-search-fields
    padding: 10px
    cursor: pointer
    &:hover
      background-color: #e0e0e0
</style>