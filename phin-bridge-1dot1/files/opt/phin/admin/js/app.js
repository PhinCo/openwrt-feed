class DevTabView {
  constructor(targetDiv) {
		this.targetDiv = targetDiv
  }
  
  render() {
    const self = this
    getJSON('/stats', function(response, error) {
      if (error) return

      const { developmentMode } = response
      app.developmentMode = developmentMode
      if (developmentMode) {
        self.targetDiv.innerHTML += `<button id="dev-tab" class="tab btn" onclick="showDev()"> Development </button>`
      }
    })
  }
}

function selectTab(tab) {
  const elems = document.getElementsByClassName('tab')
  for ( i of elems ) i.className = i.className.replace('active', '')
  const selectedTab = document.getElementById(tab+'-tab')
  selectedTab.className +=  ' active'
}

function showStats() {
  selectTab('stats')
  app.monitorStats = {}
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

function refreshlogs() {
  if(app && app.logFilesView){
    app.logFilesView.refresh()
  }
}

function showWifiSelect(ssid, encryption, current) {
  app.wifiSelectView = new WifiSelectView(ssid, encryption, current)
  app.wifiSelectView.render()
}

function cancelWifiSelectForm() {
  if (app.wifiSelectView) {
    app.wifiSelectView.remove()
    app.wifiSelectView = null
  }
}

function submitWifiSelectForm() {
  if (app.wifiSelectView) {
    app.wifiSelectView.submit()
  }
}

function showMonitorStats(hardwareId) {
  if (!app.monitorStats[hardwareId]) {
    const targetDiv = document.getElementById(hardwareId+'-details')
    if(!targetDiv) return
    app.monitorStats[hardwareId] = new MonitorStatsView(targetDiv, hardwareId)  
  }

  if (app.monitorStats[hardwareId].isActive() ){
    app.monitorStats[hardwareId].hide()
  } else {
    app.monitorStats[hardwareId].render()
  }
}

function getShowingMonitors() {
  const hardwareIds = Object.keys(app.monitorStats)
  let showing = []
  if (hardwareIds.length > 0) {
    showing = hardwareIds.reduce((showing, hardwareId) => {
      if(app.monitorStats[hardwareId] && app.monitorStats[hardwareId].isActive()){
        showing.push(hardwareId)
      }
      return showing
    }, [])  
  }
  return showing
}

function refreshStats() {
  const showing = getShowingMonitors()
  app.monitorStats = {}
  app.statsView.refresh(showing)
}

function hideMonitorStats(hardwareId) {
  if (app.monitorStats[hardwareId]) {
    return
  }
  app.monitorStats[hardwareId].hide()
}

function toggleAllMonitorStats() {
  const anyWereActive = !!getShowingMonitors().length
  const monitorStatEntrys = Object.entries(app.monitorStats)
  for (monitorStatEntry of monitorStatEntrys) {
    const monitorStat = monitorStatEntry[1]
    if (monitorStat.isActive() && anyWereActive){
      monitorStat.hide()
    } else if (!anyWereActive) {
      monitorStat.render()
    }
  }
}

// turns off the css animation
function runAnimationOff() {
  function replaceClass(classRemove, classReplace) {
    const elems = document.getElementsByClassName(classRemove)
    for ( i of elems ) {
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
  const buttons = document.getElementById('buttons')
  app.DevTabView = new DevTabView(buttons)
  app.DevTabView.render()

  output = document.getElementById('output')
  // create our components
  app.statsView = new StatsView(output)
  app.monitorStats = {}
  app.wifiView = new WifiView(output)
  app.devView = new DevView(output)
  app.logFilesView = new LogFilesView(output)

  if ( animationOff ) {
    runAnimationOff()
  } else {
    runAnimation()
  }

}
