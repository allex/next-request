/**
 * Request queue manager
 *
 * @author Allex Wang (allex.wxn@gmail.com)
 * MIT Licensed
 */

import { param } from './param'

const global = window
const noop = () => {}
const nextTick = global.setImmediate || (f => setTimeout(f, 1))
const isFunction = f => typeof f === 'function'

// fast to array
const toArray = a => {
  for (var l = a.length, args = Array(l), i = 0; i < l; i++) args[i] = a[i]
  return args
}

class Inter {
  constructor () {
    this._l = new Image()
    this._r = false
  }
  load (url, cb) {
    this._r = true
    const l = this._l
    const reset = (err, e) => {
      l.onload = l.onerror = noop
      cb(err, e)
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
  if (pool.length < 5) { // just keep first 5 for reuse
    pool.push(l)
  }
  return l
}

const RequestQueue = (options = {}) => {
  let currentCount = 0

  const
    MAX_PARALLEL_COUNT = options.concurrent || 5, // The max parallel size of network request
    queue = [],

    next = () => {
      if (queue.length && currentCount < MAX_PARALLEL_COUNT) {
        var o = queue.shift()
        ++currentCount
        request(o, () => {
          --currentCount
          next()
        })
      }
    },

    request = ([ url, args, cb ], end) => {
      const query = args && param(args)
      const src = url + (query ? ((~url.indexOf('?') ? '&' : '?') + query) : '')
      nextTick(
        () => getLoader().load(src, (err, e) => {
          if (isFunction(cb)) {
            // Use try to protect the main queue tasks been terminated by some
            // specified cb exception.
            try { cb(err, e) } catch (e) {}
          }
          end(err)
        })
      )
    }

  return {
    // Send request by parallel count limited with a queue FIFO.
    // @param {String} url The target url to request
    push () {
      const args = toArray(arguments), t = args[1]
      // swap if args[1] is a function
      if (args.length === 2 && isFunction(t)) {
        args[2] = t
        args[1] = null
      }
      queue.push(args) // [ src, params, cb ]
      next()
    }
  }
}

const gName = '$nextRequest'

// default queue (globally with cross runntime)
const defaultQueue = global[gName] || (global[gName] = new RequestQueue())

// shortcut api
const nextRequest = function (url, args, cb) {
  return defaultQueue.push.apply(defaultQueue, arguments)
}

export {
  RequestQueue, nextRequest
}
