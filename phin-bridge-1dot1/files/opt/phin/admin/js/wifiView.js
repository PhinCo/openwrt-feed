class WifiView {
	constructor(targetDiv) {
		this.targetDiv = targetDiv
	}

	isConnected(currentNetwork) {
		return (currentNetwork && currentNetwork.ssid && currentNetwork.ssid.length)
	}

	isConfiguredButNotInScan(currentNetwork, availableNetworks) {
		let isConfigured = false
		let isInScan = false
		if (currentNetwork && currentNetwork.ssid && currentNetwork.ssid.length) {
			isConfigured = true
			if (availableNetworks && availableNetworks.length) {
				isInScan = !!availableNetworks.find(n => (n.bss == currentNetwork.bss) && (n.ssid === currentNetwork.ssid))
			}
		}
		if (isConfigured === true && isInScan == false) return true
		return false
	}

	renderAvailableNetworks ({availableNetworks}) {
		// , quality: ${n.quality} - this seems redundant with rssi
		return availableNetworks.map((n) => 
		`<li onclick="showWifiSelect('${n.ssid}', '${n.bss}', '${n.encryption}', ${n.current})">
			${n.current ? '<span class="connected">&check; CONNECTED TO: '+ n.ssid + ', rssi: '+ n.rssi +' </span>' : n.ssid + ', rssi: '+ n.rssi}
		</li>`).join('')
	}

	current({currentNetwork, availableNetworks}) {
		if (this.isConfiguredButNotInScan(currentNetwork, availableNetworks)) {
			return ` Did not find configured network <br />SSID: ${currentNetwork.ssid} <br />MAC: ${currentNetwork.bss}`
		}
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
