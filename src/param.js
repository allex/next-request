/**
 * Serialize plain object to a querystring
 *
 * @author Allex Wang <http://iallex.com>
 * MIT Licensed.
 */

const { hasOwnProperty } = {}

const hasOwn = (o, k) => hasOwnProperty.call(o, k)

const encodeURI = (s) => {
  try {
    return encodeURIComponent(s)
  } catch (e) { }
  return s
}

const toQueryPair = (key, value, encode) =>
  value == null
    ? key
    : (key + '=' + (encode ? encodeURI(String(value)) : value))

export function param (o, encode) {
  if (typeof o !== 'object') {
    return o
  }
  var sb = [], k, v, l
  encode = encode === undefined ? 1 : 0
  for (k in o) {
    if (hasOwn(o, k)) {
      v = o[k]
      if (v && typeof v === 'object') {
        if (typeof v.length === 'number') {
          l = v.length
          while (l--) sb.push(toQueryPair(k, v[l], encode))
        }
      } else {
        sb.push(toQueryPair(k, v, encode))
      }
    }
  }
  return sb.join('&').replace(/%20/g, '+')
}
