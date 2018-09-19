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

  updateCamImg(camImg) {
    this.camImg = camImg
    this.io.emit('cam_img', camImg)
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
