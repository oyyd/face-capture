const cv = require('opencv4nodejs')
const path = require('path')
const express = require('express')

class ModelParameterServer {
  constructor() {
    this.app = express()
    this.http = require('http').Server(this.app)
    this.io = require('socket.io')(this.http)

    this.app.use(express.static(path.resolve(__dirname, '../dist')))

    this.io.on('connection', (socket) => {
      socket.emit('model_param_start')
    })
  }

  updateCamImg(info) {
    const { points, mat } = info
    // console.log('points, mat', points, mat)
    const img = cv.imencode('.jpg', mat).toString('base64')
    this.io.emit('cam_img', {
      points,
      img,
    })
  }

  emitParams(params) {
    this.io.emit('param', params)
  }

  listen(...args) {
    return this.http.listen(...args)
  }
}

module.exports = {
  ModelParameterServer,
}
