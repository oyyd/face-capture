
const port = 0
const cap = new cv.VideoCapture(port)

let done = false

const id = setInterval(() => {
  let frame = cap.read()

  if (frame.empty) {
    cap.reset()
    frame = cap.read()
  }

  console.log(frame)

  const key = cv.waitKey(1)
  done = key !== -1 && key !== 255
  if (done) {
    clearInterval(id)
    console.log('Key pressed, exiting.')
  }
}, 0)
