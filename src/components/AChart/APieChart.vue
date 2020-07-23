<template>
<div class="a-pie-chart">
  <div class="a-pie-chart-legend">
    <div
      v-for="(slice, index) of data" :key="'l' + index"
      @click="legendClicked(index)"
    >
      <svg width="20px" viewBox="0 0 10 10">
        <circle cx="5" cy="5" r="4" :fill="getColor(index)" />
      </svg>
      <span
        :style="hiddenSlices.includes(index)?'text-decoration:line-through':''"
      >{{slice[labelField]}}</span>
    </div>
  </div>
  <div style="min-height:10px" />
  <div class="a-pie-chart-box" ref="svgBox">
    <svg width="100%" height="100%" ref="svg">
      <defs>
        <filter id="shadow">
          <feDropShadow dx="0" dy="0" stdDeviation="2"/>
        </filter>
      </defs>
      <g v-for="(slice) in data_" :key="slice.index"
        :transform="
          selectedSlice === slice.index ?
          `translate(${svgWidth/2}, ${svgHeight/2}) scale(1.02)` +
          ` translate(-${svgWidth/2}, -${svgHeight/2})` : ''
        "
      >
        <path
          @click="sliceClicked(slice.index)"
          :style="'cursor:pointer;' +
            (selectedSlice === slice.index ? 'filter:url(#shadow)' : '')
          "
          :transform="`rotate(${slice.angle},${svgWidth/2},${svgHeight/2})`"
          :d="slice.path" :fill="slice.color"
        />
        <text
          v-if="selectedSlice === slice.index"
          style="filter:url(#shadow);font-weight:bold;fill:white"
          :x="slice.textPos.x"
          :y="slice.textPos.y-1"
          text-anchor="middle"
          alignment-baseline="after-edge"
        >{{slice.value}}</text>
        <text
          v-if="selectedSlice === slice.index"
          style="filter:url(#shadow);font-weight:bold;fill:white"
          :x="slice.textPos.x"
          :y="slice.textPos.y + 1"
          text-anchor="middle"
          alignment-baseline="before-edge"
        >{{slice.fraction}}</text>
      </g>
    </svg>
  </div>
</div>
</template>

<style lang="sass">
.a-pie-chart
  width: 100%
  height: 100%
  display: flex
  flex-direction: column
  .a-pie-chart-legend
    display: flex
    align-items: center
    justify-content: center
    flex-wrap: wrap
    >div
      cursor: pointer
      display: flex
      align-items: center
      margin: 2px 10px
  .a-pie-chart-box
    flex: 1
    width: 100%
    >svg
      overflow: visible
      fill: currentColor
</style>

<script>
/* eslint-disable no-console */
import { index2hsl } from '@/utils/colors'

export default {
  components: {
  },
  props: {
    data: { type: Array, default: () => [] },
    labelField: {type: String, default: 'label'},
    valueField: {type: String, default: 'value'}
  },
  data () {
    return {
      svgHeight: null,
      svgWidth: null,
      resizeTimeout: null,
      total: null,
      hiddenSlices: [],
      pointInfo: null,
      selectedSlice: null,
      resizeObserver: null
    }
  },
  watch: {
    data: { handler (v) {
      this.setTotal(v)
      if (this.$refs.svgBox != null) this.$nextTick( () => this.setSvgSize_())
    }, immediate: true },
    hiddenSlices: {
      handler () {
        this.setTotal()
      },
      immediate: true
    }
  },
  computed: {
    data_ () {
      let arr = []
      let angle = 0
      let c = {x: this.svgWidth/2, y: this.svgHeight/2}
      let r = Math.min(c.x, c.y)
      let path = `M ${c.x} ${c.y} h -${r} A ${r} ${r} 0 `
      for (let i = 0; i < this.data.length; i++) {
        if (this.hiddenSlices.includes(i)) continue
        let v = this.data[i][this.valueField]
        let a = 2 * Math.PI * v / this.total
        let x = Math.max(c.x, r) - r*Math.cos(a*0.9999)
        let y = Math.max(c.y, r) - r*Math.sin(a*0.9999)
        arr.push({
          index: i,
          angle: angle * 180 / Math.PI,
          path: path + `${(a > Math.PI) ? 1 : 0} 1 ${x} ${y} Z`,
          value: `${v.toPrecision(3)}`,
          fraction: `${(100*v/this.total).toPrecision(3)}%`,
          textPos: {
            x: Math.max(c.x, r) - 0.7*r*Math.cos(angle + a/2),
            y: Math.max(c.y, r) - 0.7*r*Math.sin(angle + a/2)
          },
          color: this.getColor(i)
        })
        angle += a
      }
      arr = [
        ...arr.slice(this.selectedSlice + 1, arr.length),
        ...arr.slice(0, this.selectedSlice + 1)
      ]
      return arr
    }
  },
  methods: {
    sliceClicked (index) {
      if (this.selectedSlice !== index) this.selectedSlice = index
      else this.selectedSlice = null
    },
    setSvgSize_ () {
      let box = this.$refs.svgBox.getBoundingClientRect()
      this.svgHeight = box.height
      this.svgWidth = box.width
    },
    setSvgSize () {
      clearInterval(this.resizeTimeout)
      this.resizeTimeout = setTimeout(this.setSvgSize_, 100)
    },
    setTotal (v) {
      v = v || this.data
      let total = 0
      for (let i = 0; i < this.data.length; i++) {
        if (this.hiddenSlices.includes(i)) continue
        total += v[i][this.valueField]
      }
      this.total = total
    },
    legendClicked(index) {
      if (this.hiddenSlices.includes(index)) {
        this.hiddenSlices = this.hiddenSlices.filter(e => e !== index)
      } else {
        this.hiddenSlices.push(index)
      }
    },
    pointClicked (name, index) {
      let o = this.data[name]
      this.pointInfo = {
        x: this.data_[name][index].x,
        y: this.data_[name][index].y,
        descX: o.xField + ' : ' + o.data[index][o.xField],
        descY: o.yField + ' : ' + o.data[index][o.yField]
      }
    },
    getColor (i) {
      return index2hsl(i)
    }
  },
  mounted () {
    this.setSvgSize_()
    this.resizeObserver = new ResizeObserver(this.setSvgSize)
    this.resizeObserver.observe(this.$refs.svgBox)
  },
  destroyed () {
    try {
      this.resizeObserver.unobserve(this.$refs.svgBox)
    } catch {
      //
    }
  }
}
</script>
