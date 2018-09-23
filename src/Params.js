const MOTION_INTERVAL = 400

const DEFAULT_STATE = {
  yaw: 0,
  pitch: 0,
  roll: 0,
  // TODO: default value
  mouseSize: 0,
  leftEyeSize: 0,
  rightEyeSize: 0,
}

class Params {
  constructor() {
    this.beginTs = Date.now()
    // TODO: Immutable
    this.beginState = Object.assign({}, DEFAULT_STATE)
    this.targetState = Object.assign({}, DEFAULT_STATE)
  }

  updateNormals(nextState) {
    if (!nextState) {
      // console.log('get not')
      return false
    }

    this.beginTs = Date.now()
    this.beginState = this.getFrameParams()
    this.targetState = nextState

    return true
  }

  getFrameParams() {
    const now = Date.now()

    if (this.beginTs + MOTION_INTERVAL <= now) {
      return Object.assign({}, this.targetState)
    }

    const ratio = 1 - (this.beginTs + MOTION_INTERVAL - now) / MOTION_INTERVAL
    const params = {}

    // linear
    Object.keys(this.beginState).forEach(name => {
      params[name] =
        (this.targetState[name] - this.beginState[name]) * ratio +
        this.beginState[name]
    })

    return params
  }
}

module.exports = {
  Params,
}
