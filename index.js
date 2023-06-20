const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
var cors = require('cors')
const fileUpload = require('express-fileupload')
const app = express()
const port = 3000
const dir = './'
require('./db')
app.use(bodyParser.json())
app.use(cors())
// import connection from './db'

app.post('/api/createFile', (req, res) => {
  console.log('----REQ', req.body)
  const val1 = req.body.val1
  const val2 = req.body.val2
  const api = req.body.apiLink

  const bridgeContent = `
  {"name":"mybridge", "url":"${api}"}`

  const bridgeFile = 'bridge.txt'

  const jobContent = `type = "directrequest"
  schemaVersion = 1
  name = "xyz"
  externalJobID = "b87210c4-ea56-4330-8a72-3802e618dc2e"
  forwardingAllowed = false
  maxTaskDuration = "0s"
  contractAddress = "0xB1935fd559F57C973bA09Aa7b112A90Da995Cf93"
  evmChainID = "80001"
  minContractPaymentLinkJuels = "0"
  observationSource = """
      decode_log   [type=ethabidecodelog
                    abi="OracleRequest(bytes32 indexed specId, address requester, bytes32 requestId, uint256 payment, address callbackAddr, bytes4 callbackFunctionId, uint256 cancelExpiration, uint256 dataVersion, bytes data)"
                    data="$(jobRun.logData)"
                    topics="$(jobRun.logTopics)"]
      decode_cbor  [type=cborparse data="$(decode_log.data)"]
      decode_log -> decode_cbor -> fetch
      fetch        [type=bridge name="mybridge"]
  
      ${val1}_parse        [type=jsonparse path="${val1}" data="$(fetch)"]
      fetch -> ${val1}_parse 
  
      ${val2}_parse        [type=jsonparse path="${val2}" data="$(fetch)"]
      fetch -> ${val2}_parse
  
  
      ${val1}_parse  -> encode_data
      ${val2}_parse  -> encode_data
  
      
      encode_data  [type=ethabiencode abi="(bytes32 requestId, string ${val1}, string ${val2})" data="{ \\"requestId\\": $(decode_log.requestId), \\"${val1}\\": $(${val1}_parse), \\"${val2}\\": $(${val2}_parse)}"]
  
      encode_tx    [type=ethabiencode
                    abi="fulfillOracleRequest2(bytes32 requestId, uint256 payment, address callbackAddress, bytes4 callbackFunctionId, uint256 expiration, bytes data)"
                    data="{\\"requestId\\": $(decode_log.requestId), \\"payment\\": $(decode_log.payment), \\"callbackAddress\\": $(decode_log.callbackAddr), \\"callbackFunctionId\\": $(decode_log.callbackFunctionId), \\"expiration\\": $(decode_log.cancelExpiration), \\"data\\": $(encode_data)}"
                   ]
      submit_tx    [type=ethtx to="0xB1935fd559F57C973bA09Aa7b112A90Da995Cf93" data="$(encode_tx)"]
  
      encode_data -> encode_tx -> submit_tx
  """`
  const jobFile = 'job.txt'

  fs.writeFile(jobFile, jobContent, (error) => {
    if (error) {
      console.error(error)
      res.status(500).send('Error creating file')
    } else {
      console.log('File created successfully')
      res.status(200).send('File created')
    }
  })

  fs.writeFile(bridgeFile, bridgeContent, (error) => {
    if (error) {
      console.error(error)
      res.status(500).send('Error creating file')
    } else {
      console.log('File created successfully')
      res.status(200).send('File created')
    }
  })
})

app.use(
  fileUpload({
    createParentPath: true,
  })
)

app.use(bodyParser.json())

app.post('/path/upload-avatar', (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: 'No file present',
      })
    } else {
      let avatar = req.files.avatar
      avatar.mv(avatar.name, (err) => {
        console.log(err)
      })
      res.send({
        status: true,
        message: 'File is uploaded',
        data: {
          name: avatar.name,
          size: avatar.size,
        },
      })
    }
  } catch (error) {
    console.log(error)
  }
})

app.post('/path/post', (req, res) => {
  console.log(req)
  try {
    fs.appendFile(req.body.filename, req.body.content, function (err) {
      if (err) throw err
    })
    res.send('hello')
  } catch (error) {
    console.log(error)
  }
})

app.get('/path/get', (req, res) => {
  try {
    fs.readFile(req.query.fname, 'utf-8', function (err, data) {
      console.log(data)
    })
    res.send('hello again')
  } catch (error) {
    console.log(error)
  }
})

app.get('/path/count', (req, res) => {
  try {
    fs.readdir(dir, (err, files) => {
      console.log(files.length)
    })
    res.send('Hello')
  } catch (error) {
    console.log(error)
  }
})

app.listen(port, () => console.log(`Listening on ${port}`))
