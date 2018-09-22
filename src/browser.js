const { drawDetection } = require('tfjs-image-recognition-base')
const { drawLandmarks } = require('face-api.js')
const { IMG_SIZE } = require('./common/constants')

const socket = io()
const imgEle = document.getElementById('cam')
const canvasEle = document.getElementById('landmarks')

canvasEle.width = IMG_SIZE
canvasEle.height = IMG_SIZE

function wrap(points) {
  return Object.assign({}, {
    getPositions: () => points,
  })
}

socket.on('cam_img', (msg) => {
  const { points, img } = msg

  const b64 = `data:image/jpg;base64,${img}`

  canvasEle.getContext('2d').clearRect(0, 0, IMG_SIZE, IMG_SIZE)
  drawLandmarks('landmarks', wrap(points), {})

  imgEle.setAttribute('src', b64)
})

socket.on('param', (msg) => {
  window.normal = msg
  // console.log('msg', msg)
})

console.log('drawDetection', drawDetection)
