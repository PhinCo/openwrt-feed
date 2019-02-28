function responseHandler(xhr, callback) {
  const DONE = 4 
  if (xhr.readyState === DONE) {
    if (xhr.status === 200) {
      let response = xhr.responseText && xhr.responseText.length ? JSON.parse(xhr.responseText) : {}
      if (callback) callback(response)
    } else if (callback) {
      callback({success: false},  {status: xhr.status, message: xhr.responseText})
    }
  }
}

function postJSON(path, data, callback) {
  const xhr = new XMLHttpRequest()
  
  xhr.open('POST', path, true)
  xhr.setRequestHeader('Content-type', 'application/json')
  xhr.send(JSON.stringify(data))

  xhr.onreadystatechange = function () {
    responseHandler(xhr, callback)
  }
}

function getJSON(path, callback) {
  const xhr = new XMLHttpRequest()
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

  start (targetElement) {
    this.timeout = setTimeout(() => {
      if (this.count === 0 ) targetElement.innerHTML = 'Loading'
      this.count++
      targetElement.innerHTML += '.'
      this.start(targetElement)
    }, 500)
  }

  stop() {
    clearTimeout(this.timeout)
  }
}

function toaster(message) {
  alert(message)
}