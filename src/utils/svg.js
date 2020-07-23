let NS = "http://www.w3.org/2000/svg"

export function getTextSize (svg, text) {
  if (svg == null) return {h:0, w:0}
  let g = document.createElementNS(NS, 'g')
  let text_ = document.createElementNS(NS, 'text')
  g.setAttribute('x','0')
  g.setAttribute('y','0')
  text_.setAttribute('x','0')
  text_.setAttribute('y','0') 
  svg.appendChild(g)
  g.appendChild(text_)
  text_.textContent = text
  let b = g.getBBox()
  let s = {h: b.height, w: b.width}
  svg.removeChild(g)
  return s
}
