<template>
<div class="a-line-chart">
  <div class="a-line-chart-legend">
    <div
      v-for="(serie, name, i) of data" :key="'l' + name"
      @click="legendClicked(name)"
    >
      <svg width="20px" viewBox="0 0 20 10">
        <circle cx="10" cy="5" r="3" :fill="data[name].color || getColor(i)" />
        <path d="M 0 5 H 20" fill="none" stroke-width="2"
          :stroke="data[name].color || getColor(i)"
        />
      </svg>
      <span
        :style="hiddenSeries.includes(name)?'text-decoration:line-through':''"
      >{{name}}</span>
    </div>
  </div>
  <div style="min-height:10px" />
  <div class="a-line-chart-box" ref="svgBox">
    <svg width="100%" height="100%" ref="svg">
      <g v-for="(tick, index) of xTicks_" :key="'xtick' + index">
        <line style="stroke-width:1;stroke:#e0e0e0"
          :x1="tick.position" :y1="0"
          :x2="tick.position" :y2="chartHeight + 3"
        />
        <g v-if="xType === 'datetime'">
          <text
            :x="tick.position" :y="chartHeight+10"
            text-anchor="middle" dominant-baseline="hanging"
          >{{tick.value.split(' ')[0]}}</text>
          <text
            :x="tick.position" :y="chartHeight+10+xTicksHeight"
            text-anchor="middle" dominant-baseline="hanging"
          >{{tick.value.split(' ')[1]}}</text>
        </g>
        <text
          v-else
          :x="tick.position" :y="chartHeight+10"
          text-anchor="middle" dominant-baseline="hanging"
        >{{tick.value}}</text>
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
        <template v-for="(serie, name, i) of data">
          <g v-if="!hiddenSeries.includes(name)" :key="name">
            <path :d="getPath(data_[name])" fill="none" :stroke="data[name].color || getColor(i)" />
            <circle v-for="(point, index) of data_[name]" :key="index"
              :cx="point.x" :cy="point.y"
              :r="data[name].size || 3"
              :fill="data[name].color || getColor(i)"
              :opacity="0.8"
            />
            <circle v-for="(point, index) of data_[name]" :key="'tc' + index"
              style="cursor:pointer"
              :cx="point.x" :cy="point.y"
              :r="data[name].size || 6"
              :opacity="0"
              @click="pointClicked(name, index)"
            />
          </g>
        </template>
        <g x="0" y="0" ref="pointInfo" fill="white" style="cursor:pointer"
          @click="$refs.pointInfo.setAttribute('visibility', 'hidden')"
        >
          <rect x="0" y="0" style="fill:black" rx="8" ref="pointInfoBox"/>
          <text :x="pointInfoPad" :y="pointInfoPad+xTicksHeight" dominant-baseline="hanging"
            ref="pointInfoX" alignment-baseline="after-edge"
          />
          <text :x="pointInfoPad" :y="pointInfoPad+xTicksHeight" dominant-baseline="hanging"
            ref="pointInfoY" alignment-baseline="before-edge"
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
.a-line-chart
  width: 100%
  height: 100%
  display: flex
  flex-direction: column
  .a-line-chart-legend
    display: flex
    align-items: center
    justify-content: center
    flex-wrap: wrap
    >div
      cursor: pointer
      display: flex
      align-items: center
      margin: 2px 10px
  .a-line-chart-box
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
    xMin: Number,
    xMax: Number,
    yMin: Number,
    yMax: Number,
    xLabel: String,
    yLabel: String,
    xType: {type: String, default: 'number', validator: (v) => {
      return ['number', 'datetime', 'date', 'time'].includes(v)
    }},
    xTicks: Array,
    yTicks: Array
  },
  data () {
    return {
      svgHeight: null,
      svgWidth: null,
      resizeTimeout: null,
      xMin_: null,
      xMax_: null,
      yMin_: null,
      yMax_: null,
      hiddenSeries: [],
      pointInfoPad: 10,
      xLabelHeight: 0,
      yLabelHeight: 0,
      xTickswidth: 0,
      xTicksHeight: 0,
      yTicksWidth: 0,
      yTicksHeight: 0,
      resizeObserver: null
    }
  },
  watch: {
    data: { handler (v) {
      this.setLimits(v)
      if (this.$refs.svgBox != null) this.$nextTick( () => this.setSvgSize_())
    }, immediate: true },
    hiddenSeries: { handler () { this.setLimits() }, immediate: true },
    xMin: { handler () { this.setLimits() }, immediate: true },
    xMax: { handler () { this.setLimits() }, immediate: true },
    yMin: { handler () { this.setLimits() }, immediate: true },
    yMax: { handler () { this.setLimits() }, immediate: true },
    xLabel: { handler () { this.xLabelUpdated() }, immediate: true },
    yLabel: { handler () { this.yLabelUpdated() }, immediate: true },
    xTicks_: { handler () { this.xTicksUpdated() }, immediate: true },
    yTicks_: { handler () { this.yTicksUpdated() }, immediate: true }
  },
  computed: {
    chartHeight () { return Math.max(0, this.svgHeight - this.chartY) },
    chartWidth () { return Math.max(0, this.svgWidth - this.chartX - this.xTickswidth / 2) },
    chartX () {
      return this.yTicksWidth + 10 + (this.yLabelHeight > 0 ? 12 + this.yLabelHeight : 0)
    },
    chartY () {
      let y = 10 + (this.xLabelHeight > 0 ? 12 + this.xLabelHeight : 0)
      y += (this.xType === 'datetime') ? this.xTicksHeight*2 : this.xTicksHeight
      return y
    },
    data_ () {
      let rangex = this.xMax_ - this.xMin_
      let rangey = this.yMax_ - this.yMin_
      let nobj = {}
      for (let serie in this.data) {
        if (this.hiddenSeries.includes(serie)) continue
        let o = this.data[serie]
        nobj[serie] = []
        for (let el of o.data) {
          let x = el[o.xField], y = el[o.yField]
          if (x == null || y == null) continue
          x = ((x - this.xMin_) / rangex) * this.chartWidth
          y = (1 - (y - this.yMin_) / rangey) * this.chartHeight
          if (isNaN(x) || isNaN(y)) continue
          nobj[serie].push({x, y})
        }
      }
      return nobj
    },
    xTicks_ () {
      let ticks = []
      let range = this.xMax_ - this.xMin_
      if (this.xTicks != null) {
        for (let tick of this.xTicks) {
          if (tick < this.xMin_ || tick > this.xMax_) continue
          let value = this.formatValue(tick, this.xType)
          let pos = this.chartX + ((tick-this.xMin_)/range) * this.chartWidth
          ticks.push({
            value,
            position: isNaN(pos) ? 0 : pos
          })
        }
      } else {
        let n = Math.round(this.chartWidth / 100)
        let step = range / n
        for (let i = 0; i <= n; i++) {
          let value
          let pos = this.chartX + (step*i / range) * this.chartWidth
          if (this.xType === 'number') {
            value = this.formatValue(this.xMin_ + step*i, 'number')
          } else if (['datetime', 'date', 'time'].includes(this.xType)) {
            value = this.formatValue(new Date(this.xMin_.getTime() + step*i), this.xType)
          }
          ticks.push({
            value,
            position: isNaN(pos) ? 0 : pos
          })
        }
      }
      return ticks
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
      let box = this.$refs.svg.getBoundingClientRect()
      this.svgHeight = box.height
      this.svgWidth = box.width
    },
    setSvgSize () {
      clearInterval(this.resizeTimeout)
      this.resizeTimeout = setTimeout(this.setSvgSize_, 100)
    },
    setLimits (v) {
      v = v || this.data
      let xmin = Infinity
      let xmax = -Infinity
      let ymin = Infinity
      let ymax = -Infinity
      for (let name in v) {
        if (this.hiddenSeries.includes(name)) continue
        for (let el of v[name].data) {
          if (el[v[name].xField] < xmin) {
            xmin = el[v[name].xField]
          }
          if (el[v[name].xField] > xmax) {
            xmax = el[v[name].xField]
          }
          if (el[v[name].yField] < ymin) {
            ymin = el[v[name].yField]
          }
          if (el[v[name].yField] > ymax) {
            ymax = el[v[name].yField]
          }
        }
      }
      this.xMin_ = this.xMin || (xmin === Infinity ? 0 : xmin)
      this.xMax_ = this.xMax || (xmax === -Infinity ? 1 : xmax)
      this.yMin_ = this.yMin || (ymin === Infinity ? 0 : ymin)
      this.yMax_ = this.yMax || (ymax === -Infinity ? 1 : ymax)
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
      let value = tick.value
      if (this.xType === 'datetime') {
        value = JSON.stringify(value).slice(1,11)
      }
      let s = getTextSize(this.$refs.svg, value)
      this.xTicksHeight = s.h
      this.xTickswidth = s.w
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
    pointClicked (name, index) {
      let r = this.$refs
      r.pointInfo.setAttribute('visibility', 'visible')
      let o = this.data[name]
      r.pointInfoX.textContent = o.xField + ' : ' + this.formatValue(o.data[index][o.xField], this.xType)
      r.pointInfoY.textContent = o.yField + ' : ' + this.formatValue(o.data[index][o.yField], 'number')
      r.pointInfoBox.setAttribute('width', '0')
      r.pointInfoBox.setAttribute('height', '0')
      let b = r.pointInfo.getBBox()
      let width = b.width + this.pointInfoPad*2
      let height = b.height + this.pointInfoPad*2
      r.pointInfoBox.setAttribute('width', `${width}`)
      r.pointInfoBox.setAttribute('height', `${height}`)

      let x = this.data_[name][index].x
      let y = this.data_[name][index].y

      if (x > this.chartWidth/2) x -= width
      if (y > this.chartHeight/2) y -= height

      r.pointInfo.setAttribute('transform', `translate(${x}, ${y})`)
    },
    getColor (i) {
      return index2hsl(i)
    },
    getPath (serie) {
      if (serie.length > 0)
        return 'M ' + serie.map(p => p.x + ' ' + p.y).join(' L ')
      else
        return ''
    }
  },
  mounted () {
    this.setSvgSize_()
    this.setLimits()
    this.xLabelUpdated ()
    this.yLabelUpdated ()
    this.xTicksUpdated()
    this.yTicksUpdated()
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
