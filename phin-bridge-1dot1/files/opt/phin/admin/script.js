function responseHandler(xhr, callback) {
  var DONE = 4 
  if (xhr.readyState === DONE) {
    if (xhr.status === 200) {
      const response = JSON.parse(xhr.responseText)
      if (callback) callback(response)
    } else if (callback) {
      callback(null,  {status: xhr.status, message: xhr.responseText})
    }
  }
}

function postJSON(path, data, callback) {
  var xhr = new XMLHttpRequest()
  
  xhr.open('POST', path, true)
  xhr.setRequestHeader('Content-type', 'application/json')
  xhr.send(JSON.stringify(data))

  xhr.onreadystatechange = function () {
    responseHandler(xhr, callback)
  }
}

function getJSON(path, callback) {
  var xhr = new XMLHttpRequest()
  console.log(path)
  xhr.open('GET', path)
  xhr.send(null)

  xhr.onreadystatechange = function () {
    responseHandler(xhr, callback)
  }
}

class Progresser {

  constructor () {
    this.timeout = null
    this.count = 0 
  }

  start (targetDiv) {
    this.timeout = setTimeout(() => {
      if (this.count === 0 ) document.getElementById(targetDiv).innerHTML = 'Loading'
      this.count++
      document.getElementById(targetDiv).innerHTML += '.'
      this.start(targetDiv)
    }, 500)
  }

  stop() {
    clearTimeout(this.timeout)
  }
}

function getStats(targetDiv) {
  console.log('getting stats')
  document.getElementById(targetDiv).innerHTML = ''

  const progresser = new Progresser()
  progresser.start(targetDiv)

  getJSON('stats', function(response, error) {
    progresser.stop()
    if (!error) {
      const hardwareIdList = []
      for (let hId in response.monitorHardwareIDs) {
        hardwareIdList.push('<li>' + hId, '</li>')
      }

      const sampleStats = ({samplesReceived, samplesSent, lastSampleReceivedAt, lastSampleSentAt}) => {
        var template = `<tr><td>samplesReceived</td><td>${samplesReceived}</td></tr>`
        if (samplesReceived > 0) {
          template += `<tr><td>lastSampleReceivedAt</td><td>${lastSampleReceivedAt}</td></tr>`
        }
        template += `<tr><td>samplesSent</td><td>${samplesSent}</td></tr>`
        if (samplesSent > 0) {
          template += `<tr><td>lastSampleSentAt</td><td>${lastSampleSentAt}</td></tr>`
        }
        return template
      }

      const monitors = () => {
        if ( hardwareIdList.length > 0 ) {
            return `<h2> Monitors </h2> <ul> ${hardwareIdList.join('')} </ul>`
        }
        return ``
      }

      const outPut =
        `<div class="stats">
        <table><thead><th>Status</th><th></th></thead>
        <tr><td>Provisioned</td><td>${response.provisioned}</td></tr>
        <tr><td>workerStartTime</td><td>${response.workerStartTime}</td></tr>
        ${sampleStats(response)}

        </td></tr></table>
        ${monitors()} </div>`

      document.getElementById(targetDiv).innerHTML = outPut
    } else {
      document.getElementById(targetDiv).innerHTML = 'error: ' + error.message
    }
  })
}

function listWifi(targetDiv) {
  console.log('listing wifi networks in range.')
  document.getElementById(targetDiv).innerHTML = ''

  const progresser = new Progresser()
  progresser.start(targetDiv)

  const ssIDs = ({ssid}) => `<li><a href="/selectNetwork/${ssid}">${ssid}</a></li>`
  getJSON('wifiscan', function(response, error) {
    progresser.stop()
    if (!error){
      const outPut =
        `<div class="wifiList">
          <h3>SSID</h3>
          <ul>
            ${response.map(ssIDs)}
          </ul>
        </div>`

      document.getElementById(targetDiv).innerHTML = outPut
    } else {
      document.getElementById(targetDiv).innerHTML = 'error: ' + error.message
    }
  })
}

function listIp(targetDiv) {
  console.log('getting device ip address.')
  document.getElementById(targetDiv).innerHTML = ''

  const progresser = new Progresser()
  progresser.start(targetDiv)

  getJSON('ip', function(response, error) {
    progresser.stop()
    if (!error) {
      const outPut = 
        `<div class="ipList"> <h3> IP </h3> <ul><li>
        ${response.ipaddress}
        </li></ul></div>`

      document.getElementById(targetDiv).innerHTML = outPut
    } else {
      document.getElementById(targetDiv).innerHTML = 'error: ' + error.message
    }
  })
}

function listIp(targetDiv) {
  console.log('getting device ip address.')
  document.getElementById(targetDiv).innerHTML = ''

  const progresser = new Progresser()
  progresser.start(targetDiv)

  getJSON('ip', function(response, error) {
    progresser.stop()
    if (!error) {
      const outPut = 
        `<div class="ipList"> <h3> IP </h3> <ul><li>
        ${response.ipaddress}
        </li></ul></div>`

      document.getElementById(targetDiv).innerHTML = outPut
    } else {
      document.getElementById(targetDiv).innerHTML = 'error: ' + error.message
    }
  })
}

function provision() {
  console.log(1)
  const elem = document.getElementsByName('provisionUrl')[0]
  const identifyURL = elem.value
  console.log(identifyURL)

  postJSON('/dev/provision', {identifyURL}, (response, error) => {
    console.log(2)
    console.log('provision response: ' + response)
    console.log(' error: ', error)
  })

}
function changeSerialNumber(){
  console.log('unsupported')
}

function createSampleGenerator(){
  console.log('unsupported')
}

function getDevForm(targetDiv) {
  document.getElementById(targetDiv).innerHTML = 
  `
  <div>
    <label for="provisionUrl"> provisionUrl </url>
    <input name="provisionUrl" class="txtin txtin-lg"> 
    <button name="provision" class="btn btn-sm" onclick="provision()"> Provision </button>
  </div>

  <div>
    <label for="serialNumber"> serial number </url>
    <input name="serialNumber" class="txtin txtin"> 
    <button name="changeSerialNumber" class="btn btn-sm" onclick="changeSerialNumber()"> change </button>
  </div>

  <div>
    <h3> mock a monitor </h3>
    <input name="hardwareId" class="txtin txtin"> 
    <button name="changeSerialNumber" class="btn btn-sm" onclick="createSampleGenerator()"> add sample generator </button>
  </div>
  `
}

function loadPage() {
  setTimeout(() => {
    const elems = document.getElementsByClassName('light')
    for ( i in elems ) i.className = 'lighton'
  }, 750)

  setTimeout(() => {
    getStats('output')
  }, 3000)
}
