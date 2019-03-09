class WifiView {
	constructor(targetDiv) {
		this.targetDiv = targetDiv
	}

	isConnected(currentNetwork) {
		return (currentNetwork && currentNetwork.ssid && currentNetwork.ssid.length)
	}

	renderAvailableNetworks ({ availableNetworks}) {
		return availableNetworks.map((n) => 
		`<li onclick="showWifiSelect('${n.ssid}', '${n.bss}', '${n.encryption}', ${n.current})">
			${n.ssid} ${n.current ? '<span class="connected">&check; connected!</span>' : ''}, rssi: ${n.rssi}, quality: ${n.quality}
		</li>`).join('')
	}

	current({currentNetwork}) {
		return this.isConnected(currentNetwork) ? ` Connected to: ${currentNetwork.ssid} ` : ''
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
						<h2>WIFI ${self.current(response)}</h2>
						<h3>Available networks</h4>
						<ul>
							${self.renderAvailableNetworks(response)}
						</ul>
					</div>`
			} else {
				self.targetDiv.innerHTML = 'error: ' + error.message
			}
		})
	}
}
