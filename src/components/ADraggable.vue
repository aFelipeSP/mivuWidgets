<template>
<div>
  <div
    v-for="(item, index, objIndex) in value"
    :key="'l' + index"
    class="a-draggable"
    :ref="'item' + index"
    :data-index="JSON.stringify({index, objIndex})"
    data-draggable
    :data-group="group"
    @adraggableitemdropped="itemDropped"
  >
    <div
      class="a-draggable-dots"
      v-show="draggable"
      @mousedown="onMouseDown($event, item, index, objIndex)"
      @mousemove="onMouseMove($event, item, index, objIndex)"
      @touchmove="onMove($event, item, index, objIndex, true)"
      @touchend="onDrop($event, item, index, objIndex, true)"
    />
    <slot :item="item" :index="index" :objIndex="objIndex">{{item}}</slot>
  </div>
</div>
</template>

<style lang="sass">
$dotSize: 2px
$size: 3
$nx: 2
$ny: 2
.a-draggable
  display: flex
  align-items: center
  > :nth-child(2n)
    flex: 1
  &-dots
    cursor: grab
    margin: 0px 5px
    height: $dotSize * $size * $ny
    width: $dotSize * $size * $nx
    background-image:  radial-gradient(closest-side at $dotSize $dotSize, #AAA $dotSize, transparent 1px)
    background-size: $dotSize*$size $dotSize*$size
    background-position: 0px 0px
</style>


<script>
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import { deepCopy } from '@/utils/copy'

export default {
  props: {
    value: [Array, Object],
    draggable: {type: Boolean, default: true},
    horizontal: {type: Boolean, default: false},
    time: {type: Number, default: 0.1},
    group: {type: String, default: 'drag1'}
  },
  data () {
    return {
      draggedItem: null,
      dragging: false,
      spaceBetween: 10,
      tempFuncMove: null,
      tempFuncUp: null,
      started: false,
      firstMoved: false,
      movingCoords: null
    }
  },
  methods: {
    onMouseDown (ev, item, index, objIndex) {
      this.dragging = true
      this.tempFuncUp = (event) => this.onDrop(event, item, index, objIndex)
      document.addEventListener('mouseup', this.tempFuncUp)
    },
    onMouseMove (ev, item, index, objIndex) {
      if (this.dragging && !this.firstMoved) {
        this.firstMoved = true
        this.tempFuncMove = (event) => this.onMove(event, item, index, objIndex)
        document.addEventListener('mousemove', this.tempFuncMove)
      }
    },
    onMove (ev, item, index, objIndex, isTouch) {
      if (this.dragging || isTouch) {
        let x = (isTouch) ? ev.touches[0].clientX : ev.clientX
        let y = (isTouch) ? ev.touches[0].clientY : ev.clientY

        if (isTouch) {
          this.movingCoords = [x,y]
        }

        let clone
        if (!this.started) {
          this.started = true
          this.draggedItem = {item, index, objIndex}

          let el = ev.target.parentNode
          clone = el.cloneNode(true)
          delete clone.dataset.draggable
          clone.style.maxWidth = "150px"
          clone.style.position = 'fixed'
          clone.style.opacity = 0.6
          clone.style.zIndex = 10000
          clone.style.border = '0.5px dashed rgba(0,0,0,0.3)'
          clone.id = 'a-draggable-item-moving'
          document.body.appendChild(clone)

          let box = clone.getBoundingClientRect()
          clone.style.left = ev.clientX + 'px'
          clone.style.top = (ev.clientY - box.height/2) + 'px'

          let list = deepCopy(this.value)
          if (Array.isArray(this.value)) {
            list.splice(index, 1)
          } else {
            delete list[index]
          }
          this.$emit('input', list)
        } else
          clone = document.getElementById('a-draggable-item-moving')

        let box = clone.getBoundingClientRect()

        clone.style.left = x + 'px'
        clone.style.top = (y - box.height/2) + 'px'

        let elements = document.elementsFromPoint(x, y)
        let isDroppable = false
        for (let el of elements) {
          if (el.dataset.draggable === "" && el.dataset.group === this.group) {
            isDroppable = true
            let elbox = el.getBoundingClientRect()
            if (this.horizontal) {
              let center = elbox.left + elbox.width/2
              if (x > center && (el.nextSibling == null || el.nextSibling.id !== 'a-draggable-empty')) {
                this.updateEmptyDiv(el, false)
              } else if (x < center && (el.previousSibling == null || el.previousSibling.id !== 'a-draggable-empty')) {
                this.updateEmptyDiv(el, true)
              }
            } else {
              let center = elbox.top + elbox.height/2
              if (y > center && (el.nextSibling == null || el.nextSibling.id !== 'a-draggable-empty')) {
                this.updateEmptyDiv(el, false)
              } else if (y < center && (el.previousSibling == null || el.previousSibling.id !== 'a-draggable-empty')){
                this.updateEmptyDiv(el, true)
              }
            }
            break
          } else if (el.id === 'a-draggable-empty') {
            isDroppable = true
            break
          }
        }

        if (!isDroppable) {
          let empty = document.getElementById('a-draggable-empty')
          if (empty != null) {
            empty.parentNode.removeChild(empty)
          }
        }
        ev.preventDefault()
      }
    },
    onDrop (ev, item, index, objIndex, isTouch) {
      if (this.dragging || isTouch) {
        this.dragging = false
        if (!isTouch) {
          document.removeEventListener('mousemove', this.tempFuncMove)
          document.removeEventListener('mouseup', this.tempFuncUp)
          this.tempFuncMove = null
          this.tempFuncUp = null
        }
        let x = (isTouch) ? this.movingCoords[0] : ev.clientX
        let y = (isTouch) ? this.movingCoords[1] : ev.clientY
        let elements = document.elementsFromPoint(x, y)
        let el = null
        let idx = null
        for (el of elements) {
          if (el.dataset.draggable === "" && el.dataset.group === this.group) {
            let elbox = el.getBoundingClientRect()
            let center = (this.horizontal) ? elbox.left + elbox.width/2 : elbox.top + elbox.height/2
            let pos = (this.horizontal) ? x : y
            idx = JSON.parse(el.dataset.index)
            if (pos > center) {
              if (Array.isArray(this.value)) idx = idx.index + 1
              else idx = idx.objIndex + 1
            }

            break
          } else if (el.id === 'a-draggable-empty') {
            let node = el.nextSibling
            if (node == null) {
              el = el.previousSibling
              idx = JSON.parse(el.dataset.index)
              if (Array.isArray(this.value)) idx = idx.index + 1
              else idx = idx.objIndex + 1
            } else {
              el = el.nextSibling
              idx = JSON.parse(node.dataset.index)
              if (Array.isArray(this.value)) idx = idx.index
              else idx = idx.objIndex
            }
            break
          }
        }

        if (idx != null && el != null) {
          el.dispatchEvent(new CustomEvent(
            'adraggableitemdropped', { detail:
              { item: this.draggedItem, index: idx }
            }
          ))
        } else {
          let list
          if (Array.isArray(this.value)) {
            list = deepCopy(this.value)
            list.splice(this.draggedItem.index, 0, this.draggedItem.item)
          } else {
            list = this.objInsert(this.value, this.draggedItem.item,
              this.draggedItem.index, this.draggedItem.objIndex
            )
          }
          this.$emit('input', list)
        }
        let clone = document.getElementById('a-draggable-item-moving')
        clone.parentNode.removeChild(clone)
        let empty = document.getElementById('a-draggable-empty')
        if (empty != null) {
          empty.parentNode.removeChild(empty)
        }
        this.draggedItem = null
        this.started = false
        this.firstMoved = false
      }
    },
    objInsert (obj, item, index, objIndex) {
      let keys = [...Object.keys(obj)]
      keys.splice(objIndex, 0, index)
      let nobj = {}
      for (let key of keys) {
        if (key === index) nobj[key] = item
        else nobj[key] = obj[key]
      }
      return nobj
    },
    itemDropped (ev) {
      let list
      if (Array.isArray(this.value)) {
        list = deepCopy(this.value)
        list.splice(ev.detail.index, 0, ev.detail.item.item)
      } else {
        list = this.objInsert(this.value, ev.detail.item.item,
          ev.detail.item.index, ev.detail.index
        )
      }
      this.$emit('input', list)
    },
    updateEmptyDiv (el, before) {
      let empty = document.getElementById('a-draggable-empty')
      if (empty == null) {
        empty = document.createElement("div")
        // empty.style.backgroundColor = "rgba(0,0,0,0.16)"
        empty.id = 'a-draggable-empty'
      }
      empty.style[(this.horizontal) ? 'height' : 'width'] = '100%'
      empty.style[(this.horizontal) ? 'width' : 'height'] = this.spaceBetween + 'px'
      el.parentNode.insertBefore(empty, (before) ? el : el.nextSibling)
    }
  }
}
</script>
