import('./AResponsiveModal.sass')
import AOverlay from '@/components/AOverlay/AOverlay.js'
import APortal from '@/components/APortal'

export default {
  props: {
    value: { type: Boolean, default: false },
    width: { type: Number, default: 700 }
  },
  data () {
    return {
      timeoutId: null,
      modalMode: false
    }
  },
  methods: {
    onresize () {
      clearTimeout(this.timeoutId)
      this.timeoutId = setTimeout(() => {
        this.modalMode = window.matchMedia(this.mediaString).matches
        this.$emit('modalMode', this.modalMode)
      }, 100)
    }
  },
  computed: {
    mediaString () {return `(max-width: ${this.width}px)`}
  },
  render (h) {
    if (this.modalMode) {
      return h(APortal, {props: { value: this.value }}, [h(AOverlay,
        {
          class: 'a-responsivemodal',
          props: { value: this.value },
          on: { input: (e) => this.$emit('input', e) }
        }, this.$slots.default
      )])
    } else {
      return this.$slots.default
    }
  },
  mounted () {
    this.onresize()
    window.addEventListener('resize', this.onresize)
  },
  destroyed () {
    window.removeEventListener('resize', this.onresize)
  }
}
