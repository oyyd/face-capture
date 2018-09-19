const { Detector } = require('./Detector')

// ms
const MOTION_INTERVAL = 500

const DEFAULT_STATE = {
  yaw: 0,
  pitch: 0,
  roll: 0,
  // TODO: default value
  mouseSize: 0,
  leftEyeSize: 0,
  rightEyeSize: 0,
}

class ModelParameter {
  constructor() {
    this.beginTs = Date.now()
    // TODO: Immutable
    this.beginState = Object.assign({}, DEFAULT_STATE)
    this.targetState = Object.assign({}, DEFAULT_STATE)
    this.detector = new Detector()
  }

  async updateImage(mat) {
    if (this.detector.isProcessing) {
      return false
    }

    // TODO: check
    const now = Date.now()
    const nextState = await this.detector.getNormal(mat)

    if (!nextState) {
      // console.log('get not')
      return false
    }

    console.log('update', nextState)

    this.beginTs = now
    this.beginState = this.targetState
    this.targetState = nextState

    return true
  }

  getFrameParams() {
    const now = Date.now()
    if (this.beginTs + MOTION_INTERVAL <= now) {
      return Object.assign({}, this.targetState)
    }

    const ratio = (this.beginTs + MOTION_INTERVAL - now) / MOTION_INTERVAL
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
  ModelParameter,
}

if (module === require.main) {
  const assert = require('assert')
  const path = require('path')
  const fr = require('face-recognition')

  // Sync operation?
  const img = fr.loadImage(path.resolve(__dirname, '../dist/imgs/dijkstra.jpg'))
  const modelPara = new ModelParameter()
  modelPara.updateImage(img).then(updated => {
    assert(updated)
    const d = modelPara.getFrameParams()
    console.log('d', d)
  })
}
