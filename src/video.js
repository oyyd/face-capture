let modelLoaded = false
let minFaceSize = 200
let minConfidence = 0.9
let forwardTimes = []

function onIncreaseMinFaceSize() {
  minFaceSize = Math.min(faceapi.round(minFaceSize + 50), 300)
  $('#minFaceSize').val(minFaceSize)
}

function onDecreaseMinFaceSize() {
  minFaceSize = Math.max(faceapi.round(minFaceSize - 50), 50)
  $('#minFaceSize').val(minFaceSize)
}

function updateTimeStats(timeInMs) {
  forwardTimes = [timeInMs].concat(forwardTimes).slice(0, 30)
  const avgTimeInMs = forwardTimes.reduce((total, t) => total + t) / forwardTimes.length
  $('#time').val(`${Math.round(avgTimeInMs)} ms`)
  $('#fps').val(`${faceapi.round(1000 / avgTimeInMs)}`)
}

async function onPlay(videoEl) {
  if(videoEl.paused || videoEl.ended || !modelLoaded)
    return false

  const { width, height } = faceapi.getMediaDimensions(videoEl)
  const canvas = $('#overlay').get(0)
  canvas.width = width
  canvas.height = height

  const mtcnnParams = {
    minFaceSize
  }

  const { results, stats } = await faceapi.nets.mtcnn.forwardWithStats(videoEl, mtcnnParams)
  updateTimeStats(stats.total)

  if (results) {
    results.forEach(({ faceDetection, faceLandmarks }) => {
      if (faceDetection.score < minConfidence) {
        return
      }
      onChange(faceLandmarks)
      faceapi.drawDetection('overlay', faceDetection.forSize(width, height))
      faceapi.drawLandmarks('overlay', faceLandmarks.forSize(width, height), { lineWidth: 4, color: 'red' })
    })
  }
  setTimeout(() => onPlay(videoEl))
}

let onChange = null

async function run(_onChange) {
  onChange = _onChange
  await faceapi.loadMtcnnModel('/weights')
  modelLoaded = true

  const videoEl = $('#inputVideo').get(0)
  navigator.getUserMedia(
    { video: {} },
    stream => videoEl.srcObject = stream,
    err => console.error(err)
  )
  $('#loader').hide()
}

window.onPlay = onPlay

module.exports = {
  main: run,
}
