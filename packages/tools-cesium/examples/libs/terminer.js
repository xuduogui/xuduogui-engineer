var { fromEventPattern } = rxjs
var cmd = {}

cmd.value = null

cmd.$bus = {
  list: [],
  emit: (type, data) => {
    cmd.$bus.list.forEach(e => e.type === type && e.func(data))
  },
  on: (type, func) => {
    if (type === 'update') {
      cmd.$bus.list.push({
        type,
        func
      })
    }
  },
  off: type => {
    cmd.$bus.list = cmd.$bus.list.filter(e => e.type !== type)
  }
}

cmd.stream$ = fromEventPattern(
  function (handler) {
    return cmd.$bus.on('update', handler)
  },
  function () {
    cmd.$bus.off('update')
  }
)

cmd.bindTarget = function (target) {
  cmd.$bus.list = []
  const handler = {
    set(obj, prop, value) {
      obj[prop] = value
      cmd.$bus.emit('update', {
        obj,
        prop,
        value
      })
      return Reflect.set(...arguments)
    }
  }
  cmd.value = new Proxy(target, handler)
  return cmd.value
}

cmd.action = function () {
  cmd.$bus.emit('update', {
    obj: cmd.value
  })
}
