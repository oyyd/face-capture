const faceapi = window.faceapi
async function main() {
  const canvas = document.getElementById('test')
  const image = document.getElementById('testimg')
  const ctx = canvas.getContext('2d')

  console.log('ctx', ctx)

  ctx.drawImage(image, 0, 0)

  const data = ctx.getImageData(0, 0, 200, 200)

  console.log('faceapi', data)

  await faceapi.loadFaceLandmarkModel('/weights')
  await faceapi.loadFaceDetectionModel('/weights')

  const now = Date.now()
  const result = await faceapi.locateFaces(canvas)
  const currentImg = await faceapi.bufferToImage(canvas)
  const landmarks = await faceapi.detectLandmarks(currentImg)
  console.log('result', result, Date.now() - now)
  console.log('landmarks', landmarks)
}

module.exports = {
  main,
}
