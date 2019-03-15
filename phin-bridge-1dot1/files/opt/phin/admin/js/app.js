function selectTab(tab) {
  const elems = document.getElementsByClassName('tab')
  for ( i of elems ) i.className = i.className.replace('active', '')
  const selectedTab = document.getElementById(tab+'-tab')
  selectedTab.className +=  ' active'
}

function showStats() {
  selectTab('stats')
  app.statsView.render()
}

function showWifi() {
  selectTab('wifi')
  app.wifiView.render()
}

function showDev() {
  selectTab('dev')
  app.devView.render()
}

function showLogs() {
  selectTab('logs')
  app.logFilesView.render()
}

function showWifiSelect(ssid, bssid, encryption, current) {
  app.wifiSelectView = new WifiSelectView(ssid, bssid, encryption, current)
  app.wifiSelectView.render()
}

function cancelWifiSelectForm() {
  if (app.wifiSelectView) {
    app.wifiSelectView.remove()
    app.wifiSelectView = null
  }
}

function submitWifiSelectForm() {
  console.log('submitWifiSelectForm')
  if (app.wifiSelectView) {
    app.wifiSelectView.submit()
  }
}

// turns off the css animation
function runAnimationOff() {
  function replaceClass(classRemove, classReplace) {
    const elems = document.getElementsByClassName(classRemove)
    for ( i of elems ) {
      console.log(i.id)
      i.className = [i.className.replace(classRemove, ''), ' ', classReplace].join('')
    }
  }
  replaceClass('fade-in', 'faded-in')
  replaceClass('fade-out', 'faded-out')
  replaceClass('expand-bridge', 'expanded-bridge')

  showStats()
  enableAllButtons()
  bridgeContent = document.getElementById('bridgeContent')
  bridgeContent.className = 'bridgeContent'
}

// turns on the css animation
function runAnimation(){
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
    bridgeContent = document.getElementById('bridgeContent')
    bridgeContent.className = 'bridgeContent'
  }, 2000)
}

const app = {}

const animationOff = true

function loadApp() {
  output = document.getElementById('output')
  // create our components
  app.statsView = new StatsView(output)
  app.wifiView = new WifiView(output)
  app.devView = new DevView(output)
  app.logFilesView = new LogFilesView(output)

  if ( animationOff ) {
    runAnimationOff()
  } else {
    runAnimation()
  }

}
