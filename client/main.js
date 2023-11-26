const runBtn = document.querySelector('#runBtn')
const stopBtn = document.querySelector('#stopBtn')
const video = document.querySelector('#video')

runBtn.disabled = true
stopBtn.disabled = true

const detector = await poseDetection.createDetector(
  poseDetection.SupportedModels.MoveNet
)

runBtn.disabled = false
stopBtn.disabled = true

const isRunning = false

let intervalId = null

runBtn.addEventListener('click', () => {
  intervalId = setInterval(async () => {
    const poses = await detector.estimatePoses(video)

    fetch('http://localhost:3000/pose', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        pose: poses,
        videoName: 'mk'
      })
    })

    console.log(poses)
  }, 1000)
  runBtn.disabled = true
  stopBtn.disabled = false
})

stopBtn.addEventListener('click', () => {
  clearInterval(intervalId)
  runBtn.setAttribute('disabled', 'false')
  stopBtn.setAttribute('disabled', 'true')

  runBtn.disabled = false
  stopBtn.disabled = true
})
