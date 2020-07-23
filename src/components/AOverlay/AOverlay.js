import('./AOverlay.sass')

export default {
  props: {
    value: { type: Boolean, default: false },
    strict: { type: Boolean, default: true },
    opacity: { type: Number, default: 0.4 },
    canClose: { type: Boolean, default: true }
  },
  render (h) {
    let style = {
      backgroundColor: `rgba(0,0,0,${this.opacity})`
    }
    if (!this.strict && !this.value) style.display = 'none'
    else if (!this.strict || (this.strict && this.value)) {
      return h(
        'div', {
          ref: 'overlay',
          on: { click: (ev) => {
            if (this.canClose && ev.target == this.$refs.overlay) {
              this.$emit('input', false)
            }
          }},
          class: 'a-overlay',
          style
        },
        this.$slots.default
      )
    }
  }
}
