class MonitorStatsView {
	constructor(targetDiv, hardwareId) {
		this.targetDiv = targetDiv
		this.hardwareId = hardwareId
	}

	render() {
		const self = this
		self.targetDiv.innerHTML = ''
		const hardwareId = self.hardwareId
		const progresser = new Progresser(self.targetDiv)
		progresser.start()

		const listItem = document.getElementById(`${hardwareId}-listitem`)
		listItem.className = listItem.className.replace('hardwareIdListItem-inactive', 'hardwareIdListItem-active')

		postJSON('/monitorstats', {hardwareId} , (data) => {
			progresser.stop()
			if (data.hardwareId) {
				const { 
					samplesReceived = 0, 
					samplesSent = 0, 
					averageAdvertisementPerSample = 0, 
					advertisementsReceived =0, 
					sendFailures = 0, 
					lastSampleReceivedAt, 
					lastSampleSentAt, 
					mostRecentRssi } = data

				self.targetDiv.innerHTML =
					`<div> 
					<table class="monitorstats">
					<tr> <td>Samples received: </td><td> ${samplesReceived}  </td></tr>
					<tr> <td> Samples sent: </td><td> ${samplesSent} </td></tr>
					<tr> <td> Send failures: </td><td> ${sendFailures} </td></tr>
					<tr> <td> Advertisements received: </td><td> ${advertisementsReceived} </td></tr>
					<tr> <td> Advertisements per sample: </td><td> ${averageAdvertisementPerSample} </td></tr>
					<tr> <td> Last sample received at: </td><td> ${formatDateOutput(lastSampleReceivedAt)} </td></tr>
					<tr> <td> Last sample sent at: </td><td> ${formatDateOutput(lastSampleSentAt)} </td></tr>
					<tr> <td> Most Recent Rssi: </td><td> ${mostRecentRssi} </td></tr>
					</ul>
					</div>`
				} else {
					self.targetDiv.innerHTML = 'error: ' + error.message
				}
			})
	}

	hide() {
		const listItem = document.getElementById(`${this.hardwareId}-listitem`)
		listItem.className = listItem.className.replace('hardwareIdListItem-active', 'hardwareIdListItem-inactive')
		this.targetDiv.innerHTML = ''
	}

	isActive() {
		const listItem = document.getElementById(`${this.hardwareId}-listitem`)
		return listItem.className.includes('hardwareIdListItem-active')
	}

}

class StatsView {
	constructor(targetDiv) {
		this.targetDiv = targetDiv
	}

	monitorsList (monitorHardwareIDs) {
		const hardwareIdList = []
		for (let hId of monitorHardwareIDs) {
			if (hId && hId.length){
				hardwareIdList.push(`<li> 
				<span id="${hId}-listitem" 
				class="hardwareIdListItem 
				hardwareIdListItem-inactive" 
				onclick="showMonitorStats('${hId}')"
				title="hide/show monitorstats"
				>
				${hId}
				</span>
				</li>`)
				hardwareIdList.push(`<li id="${hId}-details"></li>`)	
			}
		}
		if ( hardwareIdList.length > 0 ) {
				return `
				<h3 onclick="toggleAllMonitorStats()" class="monitorToggle"> 
					<img src="https://s3-us-west-1.amazonaws.com/phin-desk-theme/pHin-ico.svg" class="monitorIcon" onerror="this.style.display='none'"> 
					Monitors
				</h3> 
				<ul> ${hardwareIdList.join('')} </ul>`
		}
		return ``
	}

	sampleStats ({samplesReceived, samplesSent, lastSampleReceivedAt, lastSampleSentAt}) {
		let ss = `<tr><td> Samples Received: </td><td>${samplesReceived}</td></tr>`
		ss += `<tr><td> Samples Sent: </td> <td>${samplesSent}</td></tr>`
		if (samplesReceived > 0) {
			ss += `<tr><td> Last Received At: </td> <td> ${formatDateOutput(lastSampleReceivedAt)} </td></tr>`
		}
		if (samplesSent > 0) {
			ss += `<tr><td> Last Sent At: </td> <td> ${formatDateOutput(lastSampleSentAt)} </td></tr>`
		}
		return ss
	}

	showAllMonitorStats(hardwareIds = []) {
		hardwareIds.map(hId => showMonitorStats(hId))
	}

	provisioned(isProvisioned) {
		const not = isProvisioned ? "" : "not"
		return `<h3>Bridge is ${not} provisioned</h3>`
	}

	processInfo(pi) {
		if (!pi) {
			return ''
		}
		return `<tr><td>Operation System: </td> <td> ${pi.osversion}</td></tr>
		<tr><td>Process ID: </td> <td> ${pi.pid}</td></tr>
		<tr><td>Active Memory: </td> <td> ${pi.activeMem} kB</td></tr>
		<tr><td>Total Memory: </td> <td> ${pi.totalMem} kB</td></tr>
		<tr><td>CPU Load: </td> <td> ${pi.cpuLoad}</td></tr>
		<tr><td>CPU Usage Time: </td> <td> ${pi.cpuUsageTimeSinceBoot} %</td></tr>
		`
	}

	wifiConfig(ssid) {
		if (ssid && ssid.length) {
			return `<tr><td>Wifi SSID: </td><td>${ssid}</td></tr>`
		} else {
			return `<tr><td>Wifi: </td><td>Not connected</td></tr>`
		}
			
	}
	
	render(showAll = true, complete) {
		const self = this
		if (showAll) { 
			self.targetDiv.innerHTML = ''
		}

		const progresser = new Progresser(self.targetDiv)
		progresser.start()

		getJSON('/stats', function(response, error) {
			progresser.stop()
			const { 
				serialNumber,
				softwareRevision,
				softwareVersion,
				deviceName,
				provisioned, 
				workerStartTime, 
				ipaddress, 
				ssid, 
				monitorHardwareIDs = [], 
				processInfo } = response

			if (!error) {
				self.targetDiv.innerHTML =
					`<div class="stats">
					<h2> <span class="refresher" title="refresh stats" onclick="refreshStats()">&#8635;</span></h2>
					${self.provisioned(provisioned)}	
					<table style="min-width: 50%;"><thead><th></th><th></th></thead>
					<tr><td>Serial Number: </td><td>${serialNumber}</td></tr>
					<tr><td>Phin Version: </td><td>${softwareVersion}</td></tr>
					<tr><td>Software Revision: </td><td>${softwareRevision}</td></tr>
					<tr><td>Device Name: </td><td>${deviceName}</td></tr>
					<tr><td>Started at: </td><td>${formatDateOutput(workerStartTime)}</td></tr>
					${self.wifiConfig(ssid)}
					<tr><td>IP Address: </td><td>${ipaddress}</td></tr>
					${self.processInfo(processInfo)}
					${self.sampleStats(response)}
					</td></tr></table>
					${self.monitorsList(monitorHardwareIDs.sort())} </div>`
					if (showAll) {
						self.showAllMonitorStats(monitorHardwareIDs.sort())
					}
			} else {
				self.targetDiv.innerHTML = 'error: ' + error.message
			}
			if (complete) {
				complete()
			}
		})
	}

	refresh(hardwareIds) {
		this.render(false, () => {
			hardwareIds.map(hId => showMonitorStats(hId))
		})
	}
}
