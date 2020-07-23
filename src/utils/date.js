export function padDate (date) {
  return date.toString().padStart(2, '0')
}

export function date2str (d, withTime) {
  let dateString = d.getFullYear() + '‑' + padDate(d.getMonth() + 1) + '‑' + padDate(d.getDate())
  if (withTime == null || withTime === true)
    dateString += ' ' + padDate(d.getHours()) + ':' + padDate(d.getMinutes()) + ':' + padDate(d.getSeconds())
  return dateString
}