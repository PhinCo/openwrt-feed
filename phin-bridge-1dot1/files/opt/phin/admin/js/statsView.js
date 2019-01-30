class StatsView {
	constructor(targetDiv, currentSSID) {
		this.targetDiv = targetDiv
		this.currentSSID = currentSSID
	}

	monitorsList (monitorHardwareIDs) {
		const hardwareIdList = []
		for (let hId of monitorHardwareIDs) {
			hardwareIdList.push('<li>' + hId, '</li>')
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
		self = this
		console.log('getting stats')
		self.targetDiv.innerHTML = ''

		const progresser = new Progresser(self.targetDiv)
		progresser.start()

		getJSON('stats', function(response, error) {
			progresser.stop()
			const {provisioned, workerStartTime, ipaddress, monitorHardwareIDs } =response
			if (!error) {
				self.targetDiv.innerHTML =
					`<div class="stats">
					<h2> Bridge Status </h2>
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