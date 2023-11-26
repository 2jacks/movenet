const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const path = require('node:path')
const fs = require('node:fs')

const moment = require('moment')

const csv = require('csv')
const { stringify } = require('csv-stringify')

const today = moment().format('DD.MM.YYYY')

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.post('/pose', async (req, res) => {
  const pose = req.body.pose
  const videoName = req.body.videoName

  if (!pose.length) {
    res.end()
    return
  }
  const person = pose[0]
  const columns = person.keypoints.map(kp => kp.name)
  const points = person.keypoints.map(kp => [kp.x, kp.y])

  const csvFilename = path.join('poses', `${videoName}_${today}.csv`)

  const writableStream = fs.createWriteStream(csvFilename, { flags: 'a' })
  const stringifier = stringify({
    header: !fs.existsSync(csvFilename),
    columns: columns
  })
  stringifier.write(points)
  stringifier.pipe(writableStream)

  res.end()
})

app.listen(3000, () => {
  console.log('Server is on 3000 port')
})
