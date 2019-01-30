class WifiView {
	constructor(targetDiv, currentSSID) {
		this.targetDiv = targetDiv
		this.currentSSID = currentSSID
	}

	renderSSIDs (ssids) {
		return ssids.map((ssid) => `<li><a onclick="alert('you wanna dis one? ${ssid}')">${ssid}</a></li>`).join('')
	}

	current({current}) {
		return (current && current.length) ? `<h4>Current SSID: ${current}</h4>` : ''
	}

	render() {
		const self = this
		self.targetDiv.innerHTML = ''
		const progresser = new Progresser(self.targetDiv)
		progresser.start(self.targetDiv)

		getJSON('wifiscan', function(response, error) {
			progresser.stop()
			if (!error){
				self.targetDiv.innerHTML =
					`<div class="wifiList">
						<h3>SSID</h3>
						${self.current(response)}
						<ul>
							${self.renderSSIDs(response.ssids)}
						</ul>
					</div>`
			} else {
				self.targetDiv.innerHTML = 'error: ' + error.message
			}
		})
	}
}
