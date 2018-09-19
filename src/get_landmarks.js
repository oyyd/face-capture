const faceapi = window.faceapi

async function fetchImage(uri) {
  return (await fetch(uri)).blob()
}

async function main() {
  // TODO: Try MTCNN model.
  const buf = await fetchImage('./imgs/right.jpg')
  await faceapi.loadFaceLandmarkModel('/weights')
  await faceapi.loadFaceDetectionModel('/weights')

  const result = await faceapi.locateFaces(buf)
  // console.log('result', result)
  return
  const currentImg = await faceapi.bufferToImage(buf)
  const landmarks = await faceapi.detectLandmarks(currentImg)
  // console.log('landmarks', JSON.stringify(landmarks._faceLandmarks, null, 2))

  const jawOutline = landmarks.getJawOutline()
  const nose = landmarks.getNose()
  const mouth = landmarks.getMouth()
  const leftEye = landmarks.getLeftEye()
  const rightEye = landmarks.getRightEye()
  const leftEyeBbrow = landmarks.getLeftEyeBrow()
  const rightEyeBrow = landmarks.getRightEyeBrow()

  const dots = {
    jawOutline,
    nose,
    mouth,
    leftEye,
    rightEye,
    leftEyeBbrow,
    rightEyeBrow,
  }

  console.log(landmarks)
  console.log(dots)
}

module.exports = {
  main,
}
