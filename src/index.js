/* eslint-disable */
require('babel-polyfill')

const { main } = require('./video')
const { solveFacePose } = require('./resolve_landmarks')
// const { main } = require('./test_html')

main(landmarks => {
  const marks = landmarks._faceLandmarks

  window.normal = solveFacePose({
    leftEye: [marks[0].x, marks[0].y],
    rightEye: [marks[1].x, marks[1].y],
    noseTip: [marks[2].x, marks[2].y],
    mouthLeft: [marks[3].x, marks[3].y],
    mouthRight: [marks[4].x, marks[4].y],
  })

  // console.log('window.normal', window.normal)
})
