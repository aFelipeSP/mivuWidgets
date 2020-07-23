export function hue2rgb (hue) {
  return [
    Math.max(Math.min(Math.abs(-4.25*hue+765) - 255, 255),0),
    Math.max(Math.min(-Math.abs(4.25*hue-510) + 510, 255),0),
    Math.max(Math.min(-Math.abs(4.25*hue-1020) + 510, 255),0)
  ]
}

export function index2hsl (i, s, l) {
  let B = Math.floor(i/3)
  let C = Math.floor(2+Math.log(B)/Math.log(2)) -1
  let D = 2**(C-1) - (2**C-B)
  let E = 2**(C-2) + (Math.floor((D+1)/2)-2**(C-2)) * (-1)**D
  let F = 1/2**C + 1/2**(C-1)*E
  let h = (i%3)*120 + (isNaN(F) ? 0 : F)*120
  s = s || 100
  l = l || 65
  return `hsl(${h}, ${s}%, ${l}%)`
}