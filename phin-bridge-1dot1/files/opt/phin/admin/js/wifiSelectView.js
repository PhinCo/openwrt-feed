class WifiSelectView {

	constructor(ssid, encryption, current) {
		this.ssid = ssid
		this.encryption = encryption
		this.current = current
	}

	render() {
		// TODO: decide if we want the wifi to be selectable for users
		// if not, uncomment this line / change the css for the wifi view and devrestrict the bridgeadmin rest api
		// if (!app || !app.developmentMode) return

		const renderIfCurrent = () => this.current ? `<div class="note"> You are currently connected to this network. Use this if you want to change the auth key</div>` : ''
		const template = `
		<div class="popupFormOverlayContainer">
			<div class="popUpForm" id="wifiSelectContent">
				${renderIfCurrent()}
				<ul>
				<li> Connect to ${this.ssid} </li>
				<li> </li>
				<li> please enter your network key </li>
				<li> <input name="wifikey" type="password"> </li>
				</ul>
				<br />
				<div class="buttons">
					<input type="button" class="btn" onClick="submitWifiSelectForm()" value="Connect"/>
					<input type="button" class="btn" onClick="cancelWifiSelectForm()" value="Cancel"/>
				</div>
			</div>
		</div>`

		const parser = new DOMParser()
		const newNode = parser.parseFromString(template, "text/html")
		document.body.appendChild(newNode.documentElement)
	}

	wifiKey() {
		let wifiKey = ""
		let elems = document.getElementsByName("wifikey")
		if (elems[0]) {
			wifiKey = elems[0].value
		}
		
		return wifiKey
	}

	submit() {
		self = this
		const {ssid, encryption} = this
		const key = this.wifiKey()

		const epoch = Math.floor(new Date().getTime() / 1000) + "" // this call expects a string
		
		postJSON('/wificonfigure', {ssid, encryption, key, epoch} , (data) => {
			if (data.success) {
				const content = document.getElementById('wifiSelectContent')
				content.innerHTML = "Connected"
				setTimeout(() => { 
					self.remove() 
					showWifi() 
				}, 1500)
			}
		})
	}

	remove () {
		const elems = document.getElementsByClassName("popupFormOverlayContainer")
		for (let elem of elems) {
			elem.parentElement.removeChild(elem)
		}
	}
}