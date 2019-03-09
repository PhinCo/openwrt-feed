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
    bridgeContent = document.getElementById('bridgeContent')
    bridgeContent.className = 'bridgeContent'
  }, 2000)

  output = document.getElementById('output')
  // create our components
  app.statsView = new StatsView(output)
  app.wifiView = new WifiView(output)
  app.devView = new DevView(output)
  app.logFilesView = new LogFilesView(output)
}
