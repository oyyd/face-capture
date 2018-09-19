const RM = 0.4
const RN = 0.6

function getImageNormal(gazePoints) {
  const { leftEye, rightEye, noseTip, mouthLeft, mouthRight } = gazePoints

  const noseBase = [
    (leftEye[0] + rightEye[0]) / 2,
    (leftEye[1] + rightEye[1]) / 2,
  ]
  const mouth = [
    (mouthLeft[0] + mouthRight[0]) / 2,
    (mouthLeft[1] + mouthRight[1]) / 2,
  ]

  const n = [
    mouth[0] + (noseBase[0] - mouth[0]) * RM,
    mouth[1] + (noseBase[1] - mouth[1]) * RM,
  ]

  const theta = Math.acos(
    ((noseBase[0] - n[0]) * (noseTip[0] - n[0]) +
      (noseBase[1] - n[1]) * (noseTip[1] - n[1])) /
      Math.hypot(noseTip[0] - n[0], noseTip[1] - n[1]) /
      Math.hypot(noseBase[0] - n[0], noseBase[1] - n[1]),
  )
  const tau = Math.atan2(n[1] - noseTip[1], n[0] - noseTip[0])

  const m1 =
    ((noseTip[0] - n[0]) * (noseTip[0] - n[0]) +
      (noseTip[1] - n[1]) * (noseTip[1] - n[1])) /
    ((noseBase[0] - mouth[0]) * (noseBase[0] - mouth[0]) +
      (noseBase[1] - mouth[1]) * (noseBase[1] - mouth[1]))
  const m2 = Math.cos(theta) * Math.cos(theta)
  const a = RN * RN * (1 - m2)
  const b = m1 - RN * RN + 2 * m2 * RN * RN
  const c = -m2 * RN * RN

  const delta = Math.acos(
    Math.sqrt((Math.sqrt(b * b - 4 * a * c) - b) / (2 * a)),
  )

  const fn = []
  const sfn = []
  fn.push(Math.sin(delta) * Math.cos(tau))
  fn.push(Math.sin(delta) * Math.sin(tau))
  fn.push(-Math.cos(delta))

  const alpha = Math.PI / 12
  sfn.push(0)
  sfn.push(Math.sin(alpha))
  sfn.push(-Math.cos(alpha))

  // PITCH:X YAW:Y ROLL:X

  /*
    live2d rotation order: ZXY
    live2d coordinate           my coordinate           my coordinate
    angle Z                     z axis                  Yaw
    angle X                     y axis                  Pitch
    angle Y                     x axis                  Roll
    my coordinate is same as the paper:
    Estimating Gaze from a Single View of a Face
    link: ieeexplore.ieee.org/document/576433/
     */

  // (w, x, y, z) is Euler quaternion
  //
  const angle = Math.acos(
    (sfn[0] * fn[0] + sfn[1] * fn[1] + sfn[2] * fn[2]) /
      Math.sqrt(sfn[0] * sfn[0] + sfn[1] * sfn[1] + sfn[2] * sfn[2]) /
      Math.sqrt(fn[0] * fn[0] + fn[1] * fn[1] + fn[2] * fn[2]),
  )
  const w = Math.cos(0.5 * angle)
  let x = sfn[1] * fn[2] - sfn[2] * fn[1]
  let y = sfn[2] * fn[0] - sfn[0] * fn[2]
  let z = sfn[0] * fn[1] - sfn[1] * fn[0]

  const l = Math.sqrt(x * x + y * y + z * z)
  x = Math.sin(0.5 * angle) * x / l
  y = Math.sin(0.5 * angle) * y / l
  z = Math.sin(0.5 * angle) * z / l

  let yaw
  let pitch
  let roll
  roll = Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y))
  pitch = Math.asin(2 * (w * y - z * x))
  yaw = Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z))

  if (sfn[0] < 0.1 && sfn[1] < 0.1) {
    roll = 1.5 * Math.atan2(rightEye[1] - leftEye[1], rightEye[0] - leftEye[0])
  }

  yaw = Math.max(-30, Math.min(30, yaw * 180 / Math.PI))
  pitch = Math.max(-30, Math.min(30, pitch * 180 / Math.PI))
  roll = Math.max(-30, Math.min(30, roll * 180 / Math.PI))

  // console.log('Yaw: ' + yaw + ' Pitch: ' + pitch + ' Roll: ' + roll)

  return {
    yaw,
    pitch,
    roll,
  }
}

module.exports = {
  getImageNormal,
}
