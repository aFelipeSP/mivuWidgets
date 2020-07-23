<template>
<div class="a-bar-chart">
  <div class="a-bar-chart-legend">
    <div
      v-for="(serie, name, i) of data" :key="'l' + name"
      @click="legendClicked(name)"
    >
      <svg width="20px" viewBox="0 0 10 10">
        <circle cx="5" cy="5" r="4" :fill="data[name].color || getColor(i)" />
      </svg>
      <span
        :style="hiddenSeries.includes(name)?'text-decoration:line-through':''"
      >{{name}}</span>
    </div>
  </div>
  <div style="min-height:10px" />
  <div class="a-bar-chart-box" ref="svgBox">
    <svg width="100%" height="100%" ref="svg">
      <g v-for="(tick, index) of xTicks_" :key="'xtick' + index">
        <text
          :ref="'xtick' + index"
          :style="getTickStyle(index, false)"
          :x="chartX + tilePad/2 + (index + 0.5)*tileSize"
          :y="chartHeight+10" text-anchor="middle"
          dominant-baseline="hanging"
        >{{tick.slice(0,20)}}</text>
        <circle
          @click="tickClicked(index)"
          :cx="chartX + tilePad/2 + (index + 0.5)*tileSize"
          :cy="chartHeight+10" r="5" fill="gray"
          :style="'cursor:pointer;' + getTickStyle(index, true)"
        />
      </g>
      <g v-for="(tick, index) in yTicks_" :key="'ytick' +index">
        <line style="stroke-width:1;stroke:#e0e0e0"
          :y1="tick.position" :x1="chartX - 3"
          :y2="tick.position" :x2="chartX + chartWidth"
        />
        <text
          dominant-baseline="middle" :x="chartX-4"
          :y="tick.position" text-anchor="end"
        >{{tick.value}}</text>
      </g>
      <svg :x="chartX" y="0" :width="chartWidth" :height="chartHeight" ref="chart">
        <g v-for="(serie, name, i) of data_" :key="name">
          <rect v-for="(tick, index) of xTicks_" :key="index"
            :x="tilePad + tileSize*index + barSize*i" :y="serie.data[tick].pos"
            :width="barSize" :height="chartHeight - serie.data[tick].pos"
            style="cursor:pointer" :fill="serie.color" @click="
              barClicked(serie.data[tick], tilePad + tileSize*index + barSize*i)
            "
          />
        </g>
        <g x="0" y="0" ref="barInfo" fill="white"
          @click="$refs.barInfo.setAttribute('visibility', 'hidden')"
          style="cursor:pointer"
        >
          <rect x="0" y="0" style="fill:black" rx="8" ref="barInfoBox"/>
          <text :x="pointInfoPad" :y="pointInfoPad" dominant-baseline="hanging"
            ref="barInfoX"
          />
        </g>
        <g x="0" y="0" ref="tickInfo" fill="white"
          @click="$refs.tickInfo.setAttribute('visibility', 'hidden')"
          style="cursor:pointer"
        >
          <rect x="0" y="0" style="fill:black" rx="8" ref="tickInfoBox"/>
          <text :x="pointInfoPad" :y="pointInfoPad" dominant-baseline="hanging"
            ref="tickInfoX"
          />
        </g>
      </svg>
      <svg x="0" :y="chartHeight/2" style="overflow:visible">
        <text font-weight="bold" text-anchor="middle"
          transform="rotate(-90)" alignment-baseline="before-edge"
        >{{yLabel || ''}}</text>
      </svg>
      <text font-weight="bold"
        :x="chartX + chartWidth/2" y="100%"
        text-anchor="middle" alignment-baseline="after-edge"
      >{{xLabel || ''}}</text>
    </svg>
  </div>
</div>
</template>

<style lang="sass">
.a-bar-chart
  width: 100%
  height: 100%
  display: flex
  flex-direction: column
  .a-bar-chart-legend
    display: flex
    align-items: center
    justify-content: center
    flex-wrap: wrap
    >div
      cursor: pointer
      display: flex
      align-items: center
      margin: 2px 10px
  .a-bar-chart-box
    flex: 1
    width: 100%
    >svg
      overflow: visible
      fill: currentColor
</style>

<script>
/* eslint-disable no-console */
import { index2hsl } from '@/utils/colors'
import { getTextSize } from '@/utils/svg'


export default {
  components: {
  },
  props: {
    data: { type: Object, default: () => ({}) },
    yMin: Number,
    yMax: Number,
    xLabel: String,
    yLabel: String,
    xTicks: Array,
    yTicks: Array
  },
  data () {
    return {
      svgHeight: null,
      svgWidth: null,
      resizeTimeout: null,
      xTicks_: [],
      yMin_: null,
      yMax_: null,
      hiddenSeries: [],
      pointInfoPad: 10,
      selectedTick: null,
      xLabelHeight: 0,
      yLabelHeight: 0,
      xTicksHeight: 0,
      yTicksWidth: 0,
      yTicksHeight: 0,
      resizeObserver: null
    }
  },
  watch: {
    data: { handler (v) {
      this.setLimits(v)
      if (this.$refs.svgBox != null)
      this.$nextTick( () => this.setSvgSize_())
    }, immediate: true },
    hiddenSeries: { handler () { this.setLimits() }, immediate: true },
    yMin: { handler () { this.setLimits() }, immediate: true },
    yMax: { handler () { this.setLimits() }, immediate: true },
    xLabel: { handler () { this.xLabelUpdated() }, immediate: true },
    yLabel: { handler () { this.yLabelUpdated() }, immediate: true },
    xTicks: { handler () { this.setLimits() }, immediate: true },
    yTicks: { handler () { this.setLimits() }, immediate: true },
    xTicks_: { handler () { this.xTicksUpdated() }, immediate: true },
    yTicks_: { handler () { this.yTicksUpdated() }, immediate: true }
  },
  computed: {
    chartHeight () { return Math.max(0, this.svgHeight - this.chartY) },
    chartWidth () { return Math.max(0, this.svgWidth - this.chartX) },
    chartX () {return this.yLabelHeight + this.yTicksWidth + 10 + (this.yLabelHeight > 0 ? 12 : 0)},
    chartY () {return this.xLabelHeight + this.xTicksHeight + 10 + (this.xLabelHeight > 0 ? 12 : 0)},
    tileSize () { return (this.chartWidth - this.tilePad) / this.xTicks_.length },
    tilePad () {
      return 0.2*this.chartWidth /( Object.keys(this.data_).length + this.xTicks_.length)
    },
    barSize () {
      return (this.tileSize - this.tilePad)/Object.keys(this.data_).length
    },
    data_ () {
      let rangey = this.yMax_ - this.yMin_
      let nobj = {}
      let i = -1
      for (let serie in this.data) {
        i++
        if (this.hiddenSeries.includes(serie)) continue
        let o = this.data[serie]
        nobj[serie] = {
          color: this.getColor(i),
          data: this.xTicks_.reduce((ob, e) => {
            let v = o.data.find(el => el[o.xField] === e)
            if (v != null) {
              ob[e] = {
                value: v[o.yField],
                pos:  (1 - (v[o.yField]-this.yMin_) /rangey) * this.chartHeight
              }
            } else {
              ob[e] = {
                value: null,
                pos: this.chartHeight
              }
            }
            return ob
          }, {})
        }
      }
      return nobj
    },
   yTicks_ () {
      let ticks = []
      let range = this.yMax_ - this.yMin_
      if (this.yTicks != null) {
        for (let tick of this.yTicks) {
          if (tick < this.yMin_ || tick > this.yMax_) continue
          let value = this.formatValue(tick, 'number')
          let pos = (1 - (tick-this.yMin_)/range) * this.chartWidth
          ticks.push({
            value,
            position: isNaN(pos) ? 0 : pos
          })
        }
      } else {
        let n = Math.round(this.chartHeight / 50)
        let step = range/n
        for (let i = 0; i <= n; i++) {
          let pos = (1 - step*i/range) * this.chartHeight
          ticks.push({
            value: this.formatValue(this.yMin_ + step*i, 'number'),
            position: isNaN(pos) ? 0 : pos
          })
        }
      }
      return ticks
    }
  },
  methods: {
    getTickStyle (index, visible) {
      let v1 = 'visibility:hidden'
      let v2 = ''
      if (visible) {
        v1 = ''
        v2 = 'visibility:hidden'
      }
      let xtick = this.$refs['xtick' + index]
      if ((xtick || [])[0] != null ) {
        return xtick[0].getBBox().width > this.tileSize
          ? v1
          : v2
      } else return visible ? 'visibility:hidden' : ''
    },
    formatValue (v, type) {
      if (type === 'number') return v.toPrecision(3)
      else if (type === 'datetime')
        return JSON.stringify(v).slice(1,20).replace('T', ' ')
      else if (type === 'date') return JSON.stringify(v).slice(1,11)
      else if (type === 'time') return JSON.stringify(v).slice(13,22)
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
    setLimits (v) {
      v = v || this.data
      let ymin = Infinity
      let ymax = -Infinity
      let xTicks = new Set()
      for (let name in v) {
        if (this.hiddenSeries.includes(name)) continue
        for (let el of v[name].data) {
          if (el[v[name].yField] < ymin) {
            ymin = el[v[name].yField]
          }
          if (el[v[name].yField] > ymax) {
            ymax = el[v[name].yField]
          }
          xTicks.add(el[v[name].xField])
        }
      }
      this.yMin_ = this.yMin || (ymin === Infinity ? 0 : ymin)
      this.yMax_ = this.yMax || (ymax === -Infinity ? 1 : ymax)

      let range = this.yMax_ - this.yMin_
      if (this.yMin == null) {
        this.yMin_ -= range*0.05
      }
      if (this.yMax == null) {
        this.yMax_ += range*0.05
      }

      this.xTicks_ = this.xTicks || [...xTicks] 
    },
    xLabelUpdated () {
      if (this.xLabel != null) {
        let s = getTextSize(this.$refs.svg, this.xLabel)
        this.xLabelHeight = s.h
      } else {
        this.xLabelHeight = 0
      }
    },
    yLabelUpdated () {
      if (this.yLabel != null) {
        let s = getTextSize(this.$refs.svg, this.yLabel)
        this.yLabelHeight = s.h
      } else {
        this.yLabelHeight = 0
      }
    },
    xTicksUpdated () {
      let tick = this.xTicks_[0]
      let s = getTextSize(this.$refs.svg, tick)
      this.xTicksHeight = s.h
    },
    yTicksUpdated () {
      let max = 0
      let s = null
      for (let tick of this.yTicks_) {
        s = getTextSize(this.$refs.svg, tick.value)
        if (s.w > max) max = s.w
      }
      this.yTicksHeight = s.h
      this.yTicksWidth = max
    },
    legendClicked(name) {
      if (this.hiddenSeries.includes(name)) {
        this.hiddenSeries = this.hiddenSeries.filter(e => e !== name)
      } else {
        this.hiddenSeries.push(name)
      }
    },
    barClicked (value, x) {
      let r = this.$refs
      r.barInfo.setAttribute('visibility', 'visible')
      r.barInfoX.textContent = this.formatValue(value.value, 'number')
      r.barInfoBox.setAttribute('width', '0')
      r.barInfoBox.setAttribute('height', '0')
      let b = r.barInfo.getBBox()
      let width = b.width + this.pointInfoPad*2
      let height = b.height + this.pointInfoPad*2
      r.barInfoBox.setAttribute('width', `${width}`)
      r.barInfoBox.setAttribute('height', `${height}`)

      let y = value.pos - height

      if (x > this.chartWidth/2) x -= width
      else x += this.barSize
      if (y < this.chartHeight/2) y += height

      r.barInfo.setAttribute('transform', `translate(${x}, ${y})`)
    },
    tickClicked (index) {
      let r = this.$refs
      r.tickInfo.setAttribute('visibility', 'visible')
      r.tickInfoX.textContent = this.xTicks_[index]
      r.tickInfoBox.setAttribute('width', '0')
      r.tickInfoBox.setAttribute('height', '0')
      let b = r.tickInfo.getBBox()
      let width = b.width + this.pointInfoPad*2
      let height = b.height + this.pointInfoPad*2
      r.tickInfoBox.setAttribute('width', `${width}`)
      r.tickInfoBox.setAttribute('height', `${height}`)

      let x = (this.chartWidth / this.xTicks_.length) * (index + 0.5)
      let y = this.chartHeight - height

      if (x > this.chartWidth/2) x -= width

      r.tickInfo.setAttribute('transform', `translate(${x}, ${y})`)
    },
    getColor (i) {
      return index2hsl(i)
    }
  },
  async mounted () {
    await this.$nextTick()
    this.setSvgSize_()
    this.setLimits()
    this.xLabelUpdated ()
    this.yLabelUpdated ()
    this.xTicksUpdated()
    this.yTicksUpdated()
    this.resizeObserver = new ResizeObserver(this.setSvgSize)
    this.resizeObserver.observe(this.$refs.svgBox)
    // window.addEventListener('resize', this.setSvgSize)
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
