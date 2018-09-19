const cv = require('opencv4nodejs')
const { ModelParameter } = require('./ModelParameter')
const { ModelParameterServer } = require('./ModelParameterServer')
const { VideoReceiver } = require('./VideoReceiver')

if (module === require.main) {
  const server = new ModelParameterServer()

  server.listen(() => {
    const href = `http://localhost:${server.http.address().port}`
    console.log(href)
  })

  const model = new ModelParameter()
  const v = new VideoReceiver((frame) => {
    // const camImg = cv.imencode('.jpg', frame).toString('base64')
    // model.updateImage(frame).then((success) => {
    //   if (success) {
    //     // console.log(success)
    //   }
    // })
  })
  v.start()

  setInterval(() => {
    const param = model.getFrameParams()
    server.emitParams(param)
  }, 50)
}
