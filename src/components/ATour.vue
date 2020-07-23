<template>
  <div class="a-tour" v-if="show">
    <div ref="back" @click="clicked" class="a-tour-back"
      :style="backStyle"
    />
    <div
      class="a-tour-tile"
      ref="top"
      :style="topStyle"
    >
    </div>
    <div
      class="a-tour-tile"
      ref="left"
      :style="leftStyle"
    >
    </div>
    <div
      class="a-tour-tile"
      ref="bottom"
      :style="bottomStyle"
    >
    </div>
    <div
      class="a-tour-tile"
      ref="right"
      :style="rightStyle"
    >
    </div>
    <div
      ref="box"
      class="a-tour-box"
      :style="boxStyle"
    >
      <div
        class="a-tour-p"
        v-for="(par, i) in item.content"
        :key="i" v-text="par"
      />
      <div v-if="item.type !== 'click'" class="a-tour-button">
        <a-push-button
          class="mi-arrow-right"
          @click="next"
        />
      </div>
    </div>
    <div ref="arrow" class="a-tour-arrow" :style="arrowStyle">
      <svg
        style="display:block"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        width="100%" height="100%"
      >
        <path d="M 0 0 L 0.5 1 L 1 0 Z" fill="white"
          :transform="`rotate(${90*arrowIndex}, 0.5,0.5)`"
        />
      </svg>
    </div>
  </div>
</template>
<script>
/* eslint-disable no-console */
import { deepCopy } from '@/utils/copy'

let elem, clone

export default {
  props: {
    value: Number,
    data: {type: Array, default: ()=>[]}
  },
  data () {
    return {
      boxStyle: {display: 'none'},
      topStyle: {display: 'none'},
      leftStyle: {display: 'none'},
      rightStyle: {display: 'none'},
      bottomStyle: {display: 'none'},
      backStyle: {display: 'none'},
      arrowStyle: {display: 'none'},
      arrowIndex: 0,
      clone: null,
      arrowHeight: 10,
      arrowWidth: 30,
      maxWidth: 500,
      maxHeight: 500,
      elem: null,
      elStyle: {},
      n: 100,
      i: 0,
      resizeObserver: null,
      intersetObserver: null,
      show: false,
      started: false
    }
  },
  computed: {
    item () {
      return this.data[this.value] || {}
    }
  },
  watch: {
    value () {
      this.indexChanged()
    },
    $route () {
      this.close()
      this.indexChanged()
    }
  },
  methods: {
    close () {
      window.removeEventListener('resize', this.setupTour_)
      this.resetElStyle ()
      this.show = false
      this.boxStyle = {display: 'none'}
      this.arrowStyle = {display: 'none'}
      this.topStyle = {display: 'none'}
      this.leftStyle = {display: 'none'}
      this.rightStyle = {display: 'none'}
      this.bottomStyle = {display: 'none'}
      this.backStyle = {display: 'none'},
      this.arrowStyle = {display: 'none'}
      this.arrowIndex = 0
    },
    resetElStyle () {
      if (elem == null) return
      this.resizeObserver.unobserve(elem)
      this.intersectObserver.unobserve(elem)
      if (this.item.type !== 'edit' || clone == null) return
      
      this.resizeObserver.unobserve(clone)
      this.intersectObserver.unobserve(clone)
      if (elem.parentNode.contains(elem))
        elem.parentNode.removeChild(elem)

      let nextNode = clone.nextSibling

      if (clone.parentNode.contains(clone))
        clone.parentNode.removeChild(clone)
      clone = null

      nextNode.parentNode.insertBefore(elem, nextNode)

      elem.style.width = this.elStyle.w || ''
      elem.style.height = this.elStyle.h || ''
      elem.style.left = this.elStyle.l || ''
      elem.style.top = this.elStyle.top || ''
      elem.style.position = this.elStyle.p || ''
      elem.style.zIndex = this.elStyle.z || ''
    },
    next () {
      if (typeof this.item.continue === 'function') {
        Promise.resolve(this.item.continue(elem)).then( res => {
          if (res) this.next_()
        })
      } else {
        this.next_()
      }
    },
    next_ () {
      if (this.value < this.data.length - 1) {
        this.close()
        setTimeout(
          () => this.$emit('input', this.value + 1), this.item.wait || 0)
      } else {
        this.$emit('input', null)
        this.$emit('end')
      }
    },
    clicked () {
      if (this.item.type === 'click') {
        var clickEvent = new MouseEvent("click", {
          view: window,
          bubbles: true,
          cancelable: true,
        })
        elem.dispatchEvent(clickEvent)
        this.next()
      }
    },
    indexChanged () {
      if (this.value != null) {
        if (this.item.route) {
          this.$router.push(this.item.route).then(() => {
            this.i = 0
            this.delay()
          }).catch( (error) => {
            if ((error || {}).name !== 'NavigationDuplicated') {
              this.$emit('input', null)
              return
            } else {
              this.i = 0
              this.delay()
            }
          })
        } else {
          this.i = 0
          this.delay()
        }
      } else {
        this.close()
      }
    },
    delay () {
      if (this.item.delay != null) {
        setTimeout(this.runBefore, this.item.delay)
      } else {
        this.runBefore()
      }
    },
    runBefore () {
      if (typeof this.item.before === 'function') {
        try {
          this.item.before()
        } catch {
          this.$emit('input', null)
          return
        }
      }
      this.continueIfQueryExists()
    },
    continueIfQueryExists () {
      elem = this.item.query === undefined
        ? undefined
        : document.querySelector(this.item.query)

      if (elem === null) {
        if (this.i < this.n) {
          this.i++
          this.continueIfQueryExists_()
        } else {
          this.$emit('input', null)
        }
      } else {
        this.startTour()
      }
    },
    continueIfQueryExists_ () {
      setTimeout(this.continueIfQueryExists, 10)
    },
    startTour () {
      window.addEventListener('resize', this.setupTour_)
      if (elem != null) {
        elem.scrollIntoView()
        if (this.item.type !== 'edit') {
          this.resizeObserver.observe(elem)
          this.intersectObserver.observe(elem)
        }
      }
      if (this.item.type === 'edit') {
        clone = elem.cloneNode(true)
        clone.id = 'a-tour-clone'
        elem.parentNode.insertBefore(clone, elem)
      }
      this.show = true
      this.$nextTick(() => {
        if (this.item.type === 'edit') {
          this.elStyle = {}
          if (elem.style.width != '') this.elStyle.w = elem.style.width
          if (elem.style.height != '') this.elStyle.h = elem.style.height
          if (elem.style.left != '') this.elStyle.l = elem.style.left
          if (elem.style.top != '') this.elStyle.t = elem.style.top
          if (elem.style.position != '') this.elStyle.p = elem.style.position
          if (elem.style.zIndex != '') this.elStyle.z = elem.style.zIndex

          elem.parentNode.removeChild(elem)
          this.$refs.box.parentNode.insertBefore(elem, this.$refs.arrow.nextSibling)

          elem.style.position = 'fixed'; elem.style.zIndex = ''
          this.resizeObserver.observe(clone)
          this.intersectObserver.observe(clone)
          
        }
        this.setupTour()
      })
    },
    setupTour_ () {
      clearTimeout(this.setupId)
      this.setupId = setTimeout(this.setupTour, 250)
    },
    setupTour () {
      if (this.value == null) {
        this.show = false
        return
      }
      if (this.$refs.box == null) return
      let docEl = document.documentElement
      let ww = docEl.clientWidth, wh = docEl.clientHeight
      if (elem === undefined) {
        this.topStyle = { top: '0', left: '0', right: '0', bottom: '0' }
        this.leftStyle = { width: '0', height: '0' }
        this.rightStyle = { width: '0', height: '0' }
        this.bottomStyle = { width: '0', height: '0' }
        let boxStyle = { top: '0', left: '0',
          maxWidth: Math.min(ww-30, this.maxWidth)+'px',
          maxHeight: Math.min(wh-30, this.maxHeight)+'px' }
        this.boxStyle = boxStyle
        this.$nextTick(() => {
          let q = this.$refs.box.getBoundingClientRect()
          if (q.width < ww) { boxStyle.left = (ww/2 - q.width/2)+'px' }
          if (q.height < wh) { boxStyle.top = (wh/2 - q.height/2)+'px' }
  
          this.boxStyle = deepCopy(boxStyle)
          this.arrowStyle = {display: 'none'}
        })
        return
      }

      let rect
      if (this.item.type === 'edit') rect = clone.getBoundingClientRect()
      else rect = elem.getBoundingClientRect()

      let h = rect.height, w = rect.width, t = rect.y, l = rect.x,
        r = ww-w-l, b = wh-h-t, aw = this.arrowWidth, ah = this.arrowHeight,
        _ww = Math.min(ww, this.maxWidth), _wh = Math.min(wh, this.maxHeight)

      this.backStyle = {width:w+'px', height:h+'px', top:t+'px', left:l+'px'}

      if (this.item.type === 'edit') {
        elem.style.width = w+'px'; elem.style.height = h+'px';
        elem.style.top = t+'px'; elem.style.left = l+'px'
        this.backStyle.backgroundColor = 'white'
      } else if (this.item.type === 'click') {
        this.backStyle.cursor = 'pointer'
      }

      let m = 0
      this.topStyle = { top: '0', left: '0', right: '0', height: (t-m)+'px' }
      this.leftStyle = { top: (t-m)+'px', left: '0', width: (l-m)+'px', bottom: '0' }
      this.rightStyle = {top:(t-m)+'px', width:(r-m)+'px', right:'0', height: (h+2*m)+'px'}
      this.bottomStyle = {top:(t+h+m)+'px', left:(l-m)+'px', right:'0', bottom:'0'}

      let o = {c: w*h, t: _ww*t, r: r*_wh, b: _ww*b, l: l*_wh}

      let places = Object.keys(o).reduce((a, b) => {
        let c = (o[a[0]] || -Infinity)
        if (o[b] > c) a = [b]
        else if (o[b] === c) a.push(b)
        return a
      }, [])

      if (places.length > 1 && places.includes('c'))
        places = places.filter(e => e !== 'c')

      let boxStyle
      let arrowStyle
      let mode = 'h'
      if (places[0] === 't') {
        boxStyle = { bottom: (b+h+ah)+'px', left: '0', maxWidth: Math.min(ww-30, this.maxWidth)+'px',
          maxHeight: Math.min(t-ah, this.maxHeight-ah)+'px'}
        mode = 'v'
        arrowStyle = {top: (t-ah)+'px', left: (l+w/2-aw/2)+'px'}
        this.arrowIndex = 0
      } else if (places[0] === 'b') {
        boxStyle = { top: (t+h+ah)+'px', left: '0', maxWidth: Math.min(ww-30, this.maxWidth)+'px',
          maxHeight: Math.min(b-ah, this.maxHeight-ah)+'px'}
        mode = 'v'
        arrowStyle = {bottom: (b-ah)+'px', left: (l+w/2-aw/2)+'px'}
        this.arrowIndex = 2
      } else if (places[0] === 'l') {
        boxStyle = { right: (r+w+ah)+'px', top: '0', maxHeight: Math.min(wh-30, this.maxHeight)+'px',
          maxWidth: Math.min(l-ah, this.maxWidth-ah)+'px'}
        arrowStyle = {left: (l-ah)+'px', top: (t+h/2-aw/2)+'px'}
        this.arrowIndex = 3
      } else if (places[0] === 'r') {
        boxStyle = { left: (l+w+ah)+'px', top: '0', maxHeight: Math.min(wh-30, this.maxHeight)+'px',
          maxWidth: Math.min(r, this.maxWidth)+'px'}
        arrowStyle = {right: (r-ah)+'px', top: (t+h/2-aw/2)+'px'}
        this.arrowIndex = 1
      } else if (places[0] === 'c') {
        let _h = Math.min(h-20,this.maxHeight), _w = Math.min(w-20, this.maxWidth)
        boxStyle = { left: '0', top: '0', maxHeight: _h+'px',
          maxWidth: _w+'px'}
        arrowStyle = {display: 'none'}
      }

      this.boxStyle = boxStyle
      this.$nextTick(() => {
        let q = this.$refs.box.getBoundingClientRect()
  
        if (mode === 'v' || places[0] === 'c') {
          arrowStyle.width = aw+'px'; arrowStyle.height = ah+'px'
          if (l+w/2+q.width/2 > ww) {
            delete boxStyle.left
            boxStyle.right = '0'
          } else if (l+w/2-q.width/2 > 0) {
            boxStyle.left = (l+w/2-q.width/2)+'px'
          }
        }
        
        if (mode === 'h' || places[0] === 'c'){
          arrowStyle.width = ah+'px'; arrowStyle.height = aw+'px'
          if (t+h/2+q.height/2 > wh) {
            delete boxStyle.top
            boxStyle.bottom = '0'
          } else if (t+h/2-q.height/2 > 0) {
            boxStyle.top = (t+h/2-q.height/2)+'px'
          }
        }
        
        this.arrowStyle = arrowStyle
        this.boxStyle = deepCopy(boxStyle)
      })
    }
  },
  mounted () {
    this.started = true
    this.resizeObserver = new ResizeObserver(this.setupTour_)
    this.intersectObserver = new IntersectionObserver(this.setupTour_, {
      root: this.$refs.back,
      threshold: [0,1]
    })
    this.indexChanged()
  }
}
</script>

<style lang="sass">
.a-tour
  position: fixed
  z-index: 5000
  left: 0
  top: 0
  width: 1px
  height: 1px
.a-tour-back
  position: fixed
  left: 0
  top: 0
  width: 100%
  height: 100%
.a-tour-arrow
  position: fixed
.a-tour-tile
  position: fixed
  background-color: rgba(0,0,0,0.5)
.a-tour-p
  margin-top: 20px
  &:first-child
    margin-top: 0px
.a-tour-box
  border-radius: 5px
  box-shadow: shadow(2.5px)
  position: fixed
  background-color: white
  overflow: auto
  padding: 30px
.a-tour-button
  margin-top: 20px
  display: flex
  flex-direction: row-reverse
  justify-content: flex-start
  >div
    border-radius: 5px
    display: flex
    align-items: center
    justify-content: center
    padding: 10px
</style>
