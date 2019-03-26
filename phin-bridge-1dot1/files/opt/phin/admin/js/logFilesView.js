class LogFilesView {
	constructor(targetDiv) {
		this.targetDiv = targetDiv
		this.recordCount = 100
	}

	renderLogs (logs) {
		return logs.map((log) => `<li>${log}</li>`).join('')
	}

	render(clear = true) {
		const self = this
		if (clear) {
			self.targetDiv.innerHTML = ''
		}
		
		const progresser = new Progresser(self.targetDiv)
		progresser.start()

		getJSON(`/logs?maximumNumberOfRecords=${this.recordCount}`, function(response, error) {
			progresser.stop()
			if (!error){
				self.targetDiv.innerHTML =
					`<div>
						<div> <span class="refresher" title="refresh log records" onclick="refreshlogs()">&#8635;</span></div>
						<label for="recordCount"> Count of records to show: </label>
						<select name="recordCount" onchange="updateLogRecordCount(this)" value="${self.recordCount}">
							<option value="100" ${self.recordCount === '100' ? 'selected': ''}>100</option>
							<option value="200" ${self.recordCount === '200' ? 'selected': ''}>200</option>
							<option value="300" ${self.recordCount === '300' ? 'selected': ''}>300</option>
							<option value="500" ${self.recordCount === '500' ? 'selected': ''}>500</option>
						</select>

						<ul class="logData devInfoDetail">
							${self.renderLogs(response)}
						</ul>
					</div>`
			} else {
				self.targetDiv.innerHTML = 'error: ' + error.message
			}
		})
	}

	refresh() {
		this.render(false)
	}
}

function updateLogRecordCount(elem) {

	if (app && app.logFilesView && elem) {
		app.logFilesView.recordCount = elem.value
		app.logFilesView.refresh()
	}
}