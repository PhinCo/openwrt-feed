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
  xhr.open('GET', path)
  xhr.send(null)

  xhr.onreadystatechange = function () {
    responseHandler(xhr, callback)
  }
}

function enableAllButtons () {
  document.getElementById('bridge').style.cursor = ''
  elems = document.getElementsByClassName('btn')
  for (elem of elems) elem.disabled = false
}

function disableAllButtons () {
  document.getElementById('bridge').style.cursor = 'wait'
  elems = document.getElementsByClassName('btn')
  for (elem of elems) elem.disabled = true
}

class Progresser {

  constructor (targetElement) {
    this.timeout = null
    this.count = 0
    this.targetElement = targetElement
  }

  start ( message = 'Loading') {
    if (!this.targetElement) return

    disableAllButtons()
    this.timeout = setTimeout(() => {
      if (this.count === 0 ) this.targetElement.innerHTML = message
      this.count++
      this.targetElement.innerHTML += '.'
      this.start(message)
    }, 500)
  }

  stop() {
    enableAllButtons()
    clearTimeout(this.timeout)
  }
}

function toaster(message) {
		const template = `
		<div class="popupFormOverlayContainer">
      <div class="popUpForm">
      <p>
      ${message}
      </p>
			</div>
		</div>`

		const parser = new DOMParser()
		const newNode = parser.parseFromString(template, "text/html")
    document.body.appendChild(newNode.documentElement)
    setTimeout(() => {
      const elems = document.getElementsByClassName("popupFormOverlayContainer")
      for (let elem of elems) {
        elem.parentElement.removeChild(elem)
      }  
    }, 2000)
}

function formatDateOutput(d) {
  if (!d) {
    return "never"
  }
  return new Date(d).toLocaleString()
}