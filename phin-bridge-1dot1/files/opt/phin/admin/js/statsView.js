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

		postJSON('/monitorstats', {hardwareId} , (data) => {
			console.log(data)
			if (data.hardwareId) {
				const {samplesReceived, samplesSent, advertisementAverage, sendFailures, lastSampleReceivedAt, lastSampleSentAt } = data
					self.targetDiv.innerHTML =
						`<div class="monitorstats">
						<table>
						<thead><th>received</th><th>sent</th> <th>av. advers.</th><th>sendFailures</th><th>received last at</th> <th>sent last at</th></thead>
						<tr><td>${samplesReceived}</td><td>${samplesSent}</td><td>${advertisementAverage}</td><td>${sendFailures}</td>
						<td>${lastSampleReceivedAt}</td><td>${lastSampleSentAt}</td>
						</tr></table>`
				} else {
					self.targetDiv.innerHTML = 'error: ' + error.message
				}
	
			})
	}
	
	hide() {
	}

}

class StatsView {
	constructor(targetDiv) {
		this.targetDiv = targetDiv
	}

	monitorsList (monitorHardwareIDs) {
		const hardwareIdList = []
		for (let hId of monitorHardwareIDs) {
			hardwareIdList.push(`<li onclick="showMonitorStats('${hId}')>${hId}</li>`)
			hardwareIdList.push(`<li id="${hId}-details"></li>`)
		}
		if ( hardwareIdList.length > 0 ) {
				return `<h2> Monitors </h2> <ul> ${hardwareIdList.join('')} </ul>`
		}
		return ``
	}

	sampleStats ({samplesReceived, samplesSent, lastSampleReceivedAt, lastSampleSentAt}) {
		var ss = `<tr><td>samplesReceived</td><td>${samplesReceived}</td></tr>`
		if (samplesReceived > 0) {
			ss += `<tr><td>lastSampleReceivedAt</td><td>${lastSampleReceivedAt}</td></tr>`
		}
		ss += `<tr><td>samplesSent</td><td>${samplesSent}</td></tr>`
		if (samplesSent > 0) {
			ss += `<tr><td>lastSampleSentAt</td><td>${lastSampleSentAt}</td></tr>`
		}
		return ss
	}

	render() {
		const self = this
		self.targetDiv.innerHTML = ''

		const progresser = new Progresser(self.targetDiv)
		progresser.start()

		getJSON('stats', function(response, error) {
			progresser.stop()
			const {provisioned, workerStartTime, ipaddress, monitorHardwareIDs } = response
			if (!error) {
				self.targetDiv.innerHTML =
					`<div class="stats">
					<h2> Status </h2>
					<table><thead><th></th><th></th></thead>
					<tr><td>Provisioned:</td><td>${provisioned}</td></tr>
					<tr><td>Booted at: </td><td>${workerStartTime}</td></tr>
					<tr><td>IP Address: </td><td>${ipaddress}</td></tr>
					${self.sampleStats(response)}
					</td></tr></table>
					${self.monitorsList(monitorHardwareIDs)} </div>`
			} else {
				self.targetDiv.innerHTML = 'error: ' + error.message
			}
		})
	}
}

