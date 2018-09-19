// NOTE: It's hard to transfer the video stream to the server
// so that we transfer images instead.
const cv = require('opencv4nodejs')
const assert = require('assert')

const VIDEO_STREAM_INTERVAL = 100
const RESIZE = 250

class VideoReceiver {
  constructor(onFrame) {
    if (onFrame) {
      assert(typeof onFrame === 'function')
    }

    this.onFrame = onFrame
    this.done = false
    this.cap = null
    this.id = null
  }

  start() {
    this.cap = new cv.VideoCapture(0)
    this.id = setInterval(() => {
      const { cap } = this
      let frame = cap.read()

      if (typeof this.onFrame === 'function') {
        this.onFrame(frame)
      }

      if (frame.empty) {
        cap.reset()
        frame = cap.read()
      }
    }, VIDEO_STREAM_INTERVAL)
  }

  destroy() {
    clearInterval(this.id)
  }
}

module.exports = {
  VideoReceiver,
}

if (module === require.main) {
  const fr = require('face-recognition').withCv(cv)
  const { ModelParameter } = require('./ModelParameter')

  const model = new ModelParameter()

  let show = false
  const v = new VideoReceiver((frame) => {
    if (!show) {
      const win = new fr.ImageWindow()
      win.setImage(fr.CvImage(frame.resize(RESIZE, RESIZE)))
      show = true
    }

    // These operations are fast.
    const cvImage = fr.CvImage(frame.resize(RESIZE, RESIZE))
    const rbgImg = fr.cvImageToImageRGB(cvImage)
    model.updateImage(rbgImg)
    // console.log(model.getFrameParams())
  })

  v.start()
}
