/**
 * Request queue manager
 *
 * @author Allex Wang (allex.wxn@gmail.com)
 * MIT Licensed
 */

import { param } from './param'

const noop = () => {}

class Inter {
  constructor () {
    this._l = new Image()
    this._r = false
  }
  load (url, cb) {
    this._r = true
    const l = this._l
    const reset = (err, e) => {
      cb(err, e)
      l.onload = l.onerror = noop
      this.reset()
    }
    l.onload = e => reset(null, e)
    l.onerror = e => reset(e)
    l.src = url
  }
  reset () {
    this._r = false
  }
}

const pool = []
const getLoader = () => {
  let l
  for (let i = -1, l = pool.length; ++i < l;) {
    l = pool[i]
    if (!l._r) {
      return l
    }
  }
  l = new Inter()
  pool.push(l)
  return l
}

const RequestQueue = () => {
  var MAX_PARALLEL_COUNT = 5, // The max parallel size of network request
    currentCount = 0,
    queue = [],
    next = () => {
      setTimeout(() => {
        --currentCount
        process()
      })
    },
    process = () => {
      if (queue.length > 0 && currentCount < MAX_PARALLEL_COUNT) {
        var o = queue.shift()
        ++currentCount
        request(o, () => { next() })
      }
    },
    request = ([ url, args ], cb) => {
      const query = param(args)
      const src = url + (query ? ((~url.indexOf('?') ? '&' : '?') + query) : '')
      getLoader().load(src, (err) => cb(err))
    }

  return {
    // Send request by parallel count limited with a queue FIFO.
    // @param {String} url The target url to request
    push (src, args) {
      queue.push([ src, args ])
      process()
    }
  }
}

// default request queue
const defaultQueue = new RequestQueue()

const nextRequest = (url, args) => defaultQueue.push(url, args)

export {
  RequestQueue, nextRequest
}
