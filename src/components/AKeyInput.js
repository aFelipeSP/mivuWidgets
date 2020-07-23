import AInput from './AInput'
export default {
  props: { value: String, placeholder: String, suggestions: Array },
  watch: { value: { handler (nv) { this.nvalue = nv }, immediate: true } },
  data () { return { nvalue: this.value } },
  render (h) { return h(AInput, {
    props: { value: this.nvalue, placeholder: this.placeholder,
      suggestions: this.suggestions, clearable: true },
    on: { input: (v) => this.nvalue = v,
      blur: (v) => this.$emit('input', v.target.value),
      selected: (v) => this.$emit('input', v)}
  })}
}