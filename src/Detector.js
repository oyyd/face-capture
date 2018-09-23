const Event = require('events')
const cv = require('opencv4nodejs')
const fr = require('face-recognition').withCv(cv)
const { getImageNormal } = require('./resolve_landmarks')
const { IMG_SIZE } = require('./common/constants')

// eslint-disable-next-line
const getDistence = (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
const MIN_CONFIDENCE = 1

class Detector extends Event {
  constructor() {
    super()
    this.isProcessing = false
    this.detector = fr.AsyncFaceDetector()
    this.predictor = fr.FaceLandmark68Predictor()
    this.classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2)
  }

  haarDetect(imgBuf) {
    return new Promise((resolve, reject) => {
      this.classifier.detectMultiScaleAsync(imgBuf, (err, res) => {
        if (err) {
          reject(err)
          return
        }

        if (res.objects.length === 0) {
          resolve(null)
        } else {
          resolve(res.objects[0])
        }
      })
    })
  }

  async dlibDetct(imgBuf) {
    const faceRects = await this.detector.locateFaces(imgBuf)

    if (faceRects.length === 0) {
      return null
    }

    const modRect = faceRects[0]


    if (modRect.confidence > MIN_CONFIDENCE) {
      return null
    }

    return modRect.rect
  }

  async getLandmarks(mat) {
    // These operations are fast.
    const resizedMat = mat.resize(IMG_SIZE, IMG_SIZE)
    const cvImage = fr.CvImage(resizedMat)
    const rbgImg = fr.cvImageToImageRGB(cvImage)

    let date = Date.now()

    const rect = await this.dlibDetct(rbgImg)
    // const rect = await this.haarDetect(mat)

    if (!rect) {
      return null
    }

    console.log('detect', Date.now() - date)

    // console.log('rect', rect)

    // console.log('rect', rect)
    const shape = await this.predictor.predictAsync(rbgImg, rect)

    console.log('shape', Date.now() - date)

    const points = shape.getParts()

    this.emit('update_landmarks', {
      points,
      mat: resizedMat,
    })

    // console.log('elapsed p2: ', Date.now() - date)
    return points
  }

  async getImageNormal(points) {
    const gazePoints = {
      leftEye: [points[36].x, points[36].y],
      rightEye: [points[45].x, points[45].y],
      noseTip: [points[30].x, points[30].y],
      mouthLeft: [points[48].x, points[48].y],
      mouthRight: [points[54].x, points[54].y],
    }

    return getImageNormal(gazePoints)
  }

  getMouseAndEyePoints(points) {
    const upMousePoint = points[52]
    const downMousePoint = points[58]
    const leftUpEyePoint = points[39]
    const leftDownEyePoint = points[41]
    const rightUpEyePoint = points[44]
    const rightDownEyePoint = points[48]

    const mouseSize = getDistence(upMousePoint, downMousePoint)
    const leftEyeSize = getDistence(leftUpEyePoint, leftDownEyePoint)
    const rightEyeSize = getDistence(rightUpEyePoint, rightDownEyePoint)

    return {
      mouseSize,
      leftEyeSize,
      rightEyeSize,
    }
  }

  async getNormal(imgBuf) {
    try {
      this.isProcessing = true

      const points = await this.getLandmarks(imgBuf)

      if (!points) {
        this.isProcessing = false
        return false
      }

      const imageNormal = await this.getImageNormal(points)
      const { mouseSize, leftEyeSize, rightEyeSize } = this.getMouseAndEyePoints(points)

      this.isProcessing = false

      const normals = Object.assign({
        mouseSize,
        leftEyeSize,
        rightEyeSize,
      }, imageNormal)

      this.emit('update_normals', normals)

      return normals
    } catch (e) {
      console.log(e)
      throw e
    }
  }
}

module.exports = {
  Detector,
}

if (module === require.main) {
  const assert = require('assert')
  const path = require('path')

  // Sync operation?
  const img = fr.loadImage(path.resolve(__dirname, '../dist/imgs/dijkstra.jpg'))

  const detector = new Detector()

  assert(!detector.isProcessing)

  const p = detector.getNormal(img)

  assert(detector.isProcessing)

  p.then(res => {
    // console.log('res', res)
    assert(!detector.isProcessing)
  })
}
