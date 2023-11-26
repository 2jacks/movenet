import './style.css'

const startStreamBtn = document.querySelector('#runStreamBtn')
const stopStreamBtn = document.querySelector('#stopStreamBtn')

startStreamBtn.disabled = true
stopStreamBtn.disabled = true

const runBtn = document.querySelector('#runBtn')
const stopBtn = document.querySelector('#stopBtn')

const video = document.querySelector('#video')
const canvas = document.querySelector('#canvas')

runBtn.disabled = true
stopBtn.disabled = true

const detector = await poseDetection.createDetector(
  poseDetection.SupportedModels.MoveNet
)

runBtn.disabled = false
stopBtn.disabled = true

startStreamBtn.disabled = false
stopStreamBtn.disabled = true

let localStream = null

let intervalId = null

function onLoadedData() {
  console.log('DATA')
}
function onFrame() {
  console.log('SEEKED')
  generateThumbnail()
}

runBtn.addEventListener('click', () => {
  // video.addEventListener('loadeddata', onLoadedData)
  // video.addEventListener('seeked', onFrame)
})
runBtn.addEventListener('click', () => {
  intervalId = setInterval(async () => {
    const poses = await detector.estimatePoses(video)

    if (poses.length) {
      generateThumbnail(poses[0].keypoints)
    }

    fetch('http://localhost:3000/pose', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        pose: poses,
        videoName: 'live'
      })
    })

    console.log(poses)
  }, 150)
  runBtn.disabled = true
  stopBtn.disabled = false
})

stopBtn.addEventListener('click', () => {
  clearInterval(intervalId)
  runBtn.setAttribute('disabled', 'false')
  stopBtn.setAttribute('disabled', 'true')

  runBtn.disabled = false
  stopBtn.disabled = true

  // video.removeEventListener('loadeddata', onLoadedData)
  // video.removeEventListener('seeked', onFrame)
})

startStreamBtn.addEventListener('click', () => {
  navigator.mediaDevices
    .getUserMedia({
      video: true
    })
    .then(stream => {
      localStream = stream
      video.srcObject = stream
      video.play()

      startStreamBtn.disabled = true
      stopStreamBtn.disabled = false

      runBtn.click()
    })
    .catch(err => {
      console.log(err)
    })
})

stopStreamBtn.addEventListener('click', () => {
  localStream.getTracks().forEach(track => {
    track.stop()
  })

  startStreamBtn.disabled = false
  stopStreamBtn.disabled = true
})

function generateThumbnail(keypoints) {
  let ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  keypoints.forEach(kp => {
    ctx.fillStyle = 'red'
    ctx.fillRect(kp.x, kp.y, 4, 4)

    ctx.fillStyle = 'blue'
    ctx.font = 'bold 16px Arial'
    ctx.fillText(kp.name, kp.x + 5, kp.y + 5)
  })

  // Голова
  _drawLinesBetweenKeypoints(0, 1)
  _drawLinesBetweenKeypoints(0, 2)
  _drawLinesBetweenKeypoints(1, 2)

  _drawLinesBetweenKeypoints(1, 3)
  _drawLinesBetweenKeypoints(2, 4)

  // Руки
  _drawLinesBetweenKeypoints(5, 7)
  _drawLinesBetweenKeypoints(7, 9)

  _drawLinesBetweenKeypoints(6, 8)
  _drawLinesBetweenKeypoints(8, 10)

  // Ноги
  _drawLinesBetweenKeypoints(11, 13)
  _drawLinesBetweenKeypoints(13, 15)

  _drawLinesBetweenKeypoints(12, 14)
  _drawLinesBetweenKeypoints(14, 16)

  function _drawLinesBetweenKeypoints(kp1, kp2) {
    ctx.strokeStyle = 'green'
    ctx.lineWidth = 2

    ctx.beginPath()
    ctx.moveTo(keypoints[kp1].x, keypoints[kp1].y)
    ctx.lineTo(keypoints[kp2].x, keypoints[kp2].y)
    ctx.stroke()
  }
}
