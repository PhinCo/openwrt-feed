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
  xhr.setRequestHeader("Content-type", "application/json")
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

      const outPut =
        `<div class="stats">
        <table><thead><th>Stats</th><th></th></thead>
        <tr><td>workerStartTime</td><td>${response.workerStartTime}</td></tr>
        <tr><td>samplesReceived</td><td>${response.samplesReceived}</td></tr>
        <tr><td>samplesSent</td><td>${response.samplesSent}</td></tr>
        <tr><td>lastSampleReceivedAt</td><td>${response.lastSampleReceivedAt}</td></tr>
        </td></tr></table>
        <h2> Monitors </h2> <ul> ${hardwareIdList.join('')} </ul></div>`

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

function loadPage() {
  setTimeout(() => {
    const elems = document.getElementsByClassName('light')
    for ( i in elems ) i.className = 'lighton'
  }, 750)

}