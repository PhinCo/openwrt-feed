class DevView{
	constructor(targetDiv, serialNumber = '') {
		this.serialNumber = serialNumber
		this.virtualMonitors = []
		this.targetDiv = targetDiv
		this.checkinInterval = 120 // default time in seconds
		this.logInterval = 600 // default time in seconds
	
	}

	render(){
		const { serialNumber } = this
		function changeSerialNumber() {
			if (!serialNumber || serialNumber.length === 0) {
				return `
				<input name="serialNumber" class="txtin" value="${serialNumber}">
				<button name="changeSerialNumber" class="btn btn-sm" onclick="changeSerialNumber()"> change </button>`
			}
			return '<input name="serialNumber" class="txtin" value="${serialNumber}" disabled>'
		}

		this.targetDiv.innerHTML = `
		<div id="devView">
			<div id="provisioning">
			</div>

			<div>
				<label for="serialNumber"> Serial Number </url>
				${changeSerialNumber()}
			</div>
			<hr />
			<div id="devInfo"></div>
			<hr />
			<div>
				<h3> mock a monitor </h3>
				<label for="hardwareId"> Hardware Id </label> 
				<input name="hardwareId" class="txtin" placeholder="enter a monitor id" onkeyup="validateMonitorHardwareId()"> <span id="hardwareId-invalid"></span>
				<br />
				<table>
					<tr>
					<td><label for="interval"> Sample Send Interval </label></td>
					<td>
					<select name="interval">
						<option value="10">10</option>
						<option value="5">5</option>
						<option value="3">3</option>
						<option value="1">1</option>
					</select>
					</td>
					</tr> 
					
					<tr> 
					<td><label for="advertisements"> Advertisements Per Sample </label></td>
					<td>
					<select name="advertisements">
						<option value="1">1</option>
						<option value="3">3</option>
						<option value="5">5</option>
						<option value="10">10</option>
					</select>
					</td>
					</tr>
					<tr><td>
					<button name="addSampleGenerator" class="btn btn-sm" onclick="createSampleGenerator()" disabled> add sample generator </button>
					</td><td></td></tr>
				</table>
				<div id="virtualMonitors"> </div>
			</div>

		</div>
		`
		this.loadDevInfo()
	}

	renderProvisioning(provisioned) {
		const pTxt = provisioned ? 'Provisioned' : 'Not provisioned'
		if( !provisioned ){
			return `<h3>${pTxt}</h3>
					<label for="provisionUrl"> Provision Url </url>
					<input name="provisionUrl" class="txtin txtin-lg"> 
					<button name="provision" class="btn btn-sm" onclick="provision()"> Provision </button>
				`
		}
		return `<h3>${pTxt} <button name="provision" class="btn btn-sm" onclick="deprovision()" style="float:right; margin-right:10px"> deprovision </button></h3>`
	}

	// getDevInfo
	// This calls to the get dev info rest point.
	loadDevInfo(targetDiv = 'devInfo') {
		const self = this
		const devInfo = document.getElementById(targetDiv)
		self.virtualMonitors = document.getElementById("virtualMonitors")
		if (!devInfo) return

		devInfo.innerHTML = ''

		const progresser = new Progresser(this.targetDiv)
		progresser.start()

		getJSON('/dev', function(response, error) {

			const { 
				generators = [], 
				samplesURL, 
				bridgeLogsURL, 
				reportVersionURL, 
				developmentMode, 
				provisioned, 
				serialNumber, 
				phinRoot,
				bridgeCheckinInterval,
				remoteLogInterval,			
			 } = response

			 self.checkinInterval = bridgeCheckinInterval
			 self.logInterval = remoteLogInterval
	 
			Generators = generators
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
							<li> pHin Bridge Root: <span class="devInfoDetail"> ${phinRoot} </span></li>
							<li> Samples URL: <span class="devInfoDetail"> ${samplesURL} </span></li> 
							<li> Logging URL: <span class="devInfoDetail"> ${bridgeLogsURL} </span></li> 
							<li> Report Version URL: <span class="devInfoDetail"> ${reportVersionURL} </span></li>
							<li>
							<label for="checkininterval"> Checkin Interval </label>
							<select name="checkininterval" onchange="changeBridgeCheckin(this)" value="${self.checkinInterval}">
								<option value="600" ${self.checkinInterval === 600 ? 'selected': ''}>10</option>
								<option value="300" ${self.checkinInterval === 300 ? 'selected': ''}>5</option>
								<option value="120" ${self.checkinInterval === 120 ? 'selected': ''}>2</option>
								<option value="60"  ${self.checkinInterval === 60 ? 'selected': ''}>1</option>
							</select>
							minutes
							</li>
							<li>
							<label for="remoteloginterval"> Logging Interval </label>
							<select name="remoteloginterval" onchange="changeRemoteLogging(this)" value="${self.logInterval}">
								<option value="600" ${self.logInterval === 600 ? 'selected': ''}>10</option>
								<option value="300" ${self.logInterval === 300 ? 'selected': ''}>5</option>
								<option value="120" ${self.logInterval === 120 ? 'selected': ''}>2</option>
								<option value="60"  ${self.logInterval === 60 ? 'selected': ''}>1</option>
							</select> 
							minutes
							</li>
		
						</ul>
					</div>`
			} else {
				devInfo.innerHTML = 'error: ' + error.message
			}

			validateMonitorHardwareId()
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
	const elem = document.getElementsByName('serialNumber')[0]
  const serialNumber = elem.value

  postJSON('/dev/serialnumber', {serialNumber}, (response, error) => {
    if (response.success) {
			toaster(response.message)
		} else if (error) {
			toaster(`${error.status} returned from call to change serial number`)
		}

    if (app.devView) app.devView.loadDevInfo()
  })
}

function createSampleGenerator(){
  const hardwareIdElem = document.getElementsByName('hardwareId')[0]
	const hardwareID = hardwareIdElem.value
	const intervalElem = document.getElementsByName('interval')[0]
	const interval = Number(intervalElem.value)
	
	const advertisementsElem = document.getElementsByName('advertisements')[0]
  const advertisements = Number(advertisementsElem.value)
	
  postJSON('/dev/generator', {hardwareID, interval, advertisements}, (response, error) => {
		if (response.success){
			hardwareIdElem.value = ''
			toaster(`created generator for ${hardwareID}`)
			if (app.devView) app.devView.loadDevInfo()	
		} else if (error) {
			toaster(error.status + " returned from call to change serial number")
		}
  })
}

let Generators = [] // this gets updated from the component
function validateMonitorHardwareId(){
	const hardwareIdFields = document.getElementsByName('hardwareId')
	const hardwareIdFieldError = document.getElementById('hardwareId-invalid')
	const addSampleGenerator = document.getElementsByName('addSampleGenerator')[0]

	const pattern = /^[0-9A-Fa-f]{16}/
	let hardwareId = (hardwareIdFields && hardwareIdFields[0] && hardwareIdFields[0]) ? hardwareIdFields[0].value : ""
	if (hardwareId.length > 0) {
		hardwareId = hardwareIdFields[0].value = hardwareId.toUpperCase()
		if (Generators.find(h => h === hardwareId)) {
			if (hardwareIdFieldError) hardwareIdFieldError.innerHTML ='<span class="fielderror">Duplicate monitor id</span>'
		} else if (hardwareId.match(pattern)) {
			if (hardwareIdFieldError) hardwareIdFieldError.innerHTML ='<span class="fieldgood">&check;</span>'
			addSampleGenerator.disabled = false
			return true
		} else {
			if (hardwareIdFieldError) hardwareIdFieldError.innerHTML = `<span class="fielderror">invalid hardware id (must be 16 hex characters)</span>`
		}		
	} else {
		hardwareIdFieldError.innerHTML = ''
	}	

	addSampleGenerator.disabled = true
	return false
}


function changeBridgeCheckin(elem) {
	if (app && app.devView) {
		let interval = app.devView.checkinInterval = Number(elem.value)
		postJSON('/dev/checkininterval', {interval} , (data) => {
			if (!data.success) {
				toaster(data.message || "failed to set checkin.")
			} else {
				toaster(`Set bridge checkin interval to ${Math.floor(interval / 60)} minutes`)
			}
		})
	}
}

function changeRemoteLogging(elem) {
	if (app && app.devView) {
		let interval = app.devView.remoteLogInterval = Number(elem.value)
		postJSON('/dev/remoteloginterval', {interval} , (data) => {
			if (!data.success) {
				toaster(data.message)
			} else {
				toaster(`Set remote log interval to ${Math.floor(interval / 60)} minutes`)
			}
		})
	}
}

