function showStats() {
  app.statsView.render()
}

function showWifi() {
  app.wifiView.render()
}

function showDev() {
  app.devView.render()
}

function enableAllButtons () {
  elems = document.getElementsByClassName('btn')
  for (elem of elems) elem.disabled = false
}

function disableAllButtons () {
  elems = document.getElementsByClassName('btn')
  for (elem of elems) elem.disabled = true
}

const app = {}

function loadApp() {
  disableAllButtons()
  setTimeout(() => {
    const elems = document.getElementsByClassName('light')
    for ( i of elems ) i.className = 'light lighton'
  }, 1000)

  setTimeout(() => {
    const elems = document.getElementsByClassName('light')
    for ( i of elems ) i.style.visibility = 'hidden'
  }, 1500)

  setTimeout(() => {
    showStats()
    enableAllButtons()
  }, 2000)

  output = document.getElementById('output')
  // create our components
  app.statsView = new StatsView(output)
  app.wifiView = new WifiView(output)
  app.devView = new DevView(output)
}
