class DevView{
	constructor(targetDiv, serialNumber = '') {
		this.serialNumber = serialNumber
		this.virtualMonitors = []
		this.targetDiv = targetDiv
	}

	render(){
		const { serialNumber } = this

		this.targetDiv.innerHTML = `
		<div id="devView">
			<div id="provisioning">
			</div>

			<div>
				<label for="serialNumber"> serial number </url>
				<input name="serialNumber" class="txtin txtin" value="${serialNumber}"> 
				<button name="changeSerialNumber" class="btn btn-sm" onclick="changeSerialNumber()"> change </button>
			</div>
			<hr />
			<div id="devInfo"></div>
			<hr />
			<div>
				<h3> mock a monitor </h3>
				<label for="hardwareId"> HardwareId </label>
				<input name="hardwareId" class="txtin txtin" placeholder="enter a monitor id"> 
				<br />
				<label for="internval"> Sample Send Interval </label>
				<select name="interval">
					<option value="10">10</option>
					<option value="5">5</option>
					<option value="3">3</option>
					<option value="1">1</option>
				</select>
				<br />
				<br />
				<button name="addSampleGenerator" class="btn btn-sm" onclick="createSampleGenerator()"> add sample generator </button>
				<div id="virtualMonitors"> </div>
			</div>

		</div>
		`
		this.loadDevInfo()
	}

	renderProvisioning(provisioned) {
		const pTxt = provisioned ? 'Provisioned' : 'Not provisioned'
		const title = `<div>${pTxt}</div><br />`
		if( !provisioned ){
			return `${title}
					<label for="provisionUrl"> Provision Url </url>
					<input name="provisionUrl" class="txtin txtin-lg"> 
					<button name="provision" class="btn btn-sm" onclick="provision()"> Provision </button>
				`
		}
		return `${title} <button name="provision" class="btn btn-sm" onclick="deprovision()"> deprovision </button>`
	}

	// getDevInfo
	// This calls to the get dev info rest point.
	loadDevInfo(targetDiv = 'devInfo') {
		const self = this
		const devInfo = document.getElementById(targetDiv)
		self.virtualMonitors = document.getElementById("virtualMonitors")
		if (!devInfo) return

		devInfo.innerHTML = ''

		const progresser = new Progresser(devInfo)
		progresser.start()

		getJSON('/dev', function(response, error) {

			const { generators, samplesURL, bridgeLogsURL, reportVersionURL, developmentMode, provisioned, serialNumber, phinRoot } = response

			const generateGenerators = (generators) => {
				const lItems = []
				for ( let gen of generators ) {
					if ( gen.length > 0 )
					lItems.push( `<li> ${gen}</li>` )
				}
				return lItems.join('')
			}
		
			progresser.stop()

			const sns = document.getElementsByName("serialNumber")
			if (sns) {
				const sn = sns[0] 
				if (sn) {
					sn.value = serialNumber
				}
			}

			if (generators.length) {
				virtualMonitors.innerHTML = `<ul>${generateGenerators(generators)}</ul>`
			}

			if (!error) {
				devInfo.innerHTML = 
					`
					${self.renderProvisioning(provisioned)}
					<div class="ipList"> 
						<h3> Configuration info </h3> 
						<ul>
							<li> phinRoot: ${phinRoot} </li>
							<li> samples: ${samplesURL} </li> 
							<li> bridgelogs: ${bridgeLogsURL}</li> 
							<li> report version: ${reportVersionURL}</li>
						</ul>
					</div>`
			} else {
				devInfo.innerHTML = 'error: ' + error.message
			}
		})
	}
}

function deprovision() {
  getJSON('/dev/deprovision', (response, error) => {
    if (response.success) {
			toaster(`Unprovisioned your bridge`)
		} else if (error) {
			toaster(error.status + " returned from call to deprovision")
		}
    if (app.devView) app.devView.loadDevInfo()
  })
}

function provision() {
  const elem = document.getElementsByName('provisionUrl')[0]
  const identifyURL = elem.value

  postJSON('/dev/provision', {identifyURL}, (response, error) => {
    if (response.success) {
			toaster(`Provisioned your bridge`)
		} else if (error) {
			toaster(error.status + " returned from call to provision")
		}

    if (app.devView) app.devView.loadDevInfo()
  })

}

function changeSerialNumber(){
	console.log('unsupported')
	const elem = document.getElementsByName('serialNumber')[0]
  const serialNumber = elem.value

  postJSON('/dev/serialnumber', {serialNumber}, (response, error) => {
    if (response.success) {
			toaster(response.message)
		} else if (error) {
			toaster(error.status + " returned from call to change serial number")
		}

    if (app.devView) app.devView.loadDevInfo()
  })
}

function createSampleGenerator(){
  console.log(1)
  const elem = document.getElementsByName('hardwareId')[0]
	const hardwareID = elem.value
	const intervalElem = document.getElementsByName('interval')[0]
  const interval = Number(intervalElem.value)

  console.log({ hardwareID, interval})
	
  postJSON('/dev/generator', {hardwareID, interval}, (response, error) => {
		if (response.success){
			toaster(`created generator for ${hardwareID}`)
			if (app.devView) app.devView.loadDevInfo()	
		} else if (error) {
			toaster(error.status + " returned from call to change serial number")
		}
  })
}
