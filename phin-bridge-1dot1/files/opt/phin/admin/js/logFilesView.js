class LogFilesView {
	constructor(targetDiv) {
		this.targetDiv = targetDiv
	}

	renderLogs (logs) {
		return logs.map((log) => `<li>${log}</li>`).join('')
	}

	render() {
		const self = this
		self.targetDiv.innerHTML = ''
		const progresser = new Progresser(self.targetDiv)
		progresser.start(self.targetDiv)

		getJSON('retrieveLogFiles?maximumNumberOfRecords=100', function(response, error) {
			progresser.stop()
			if (!error){
				self.targetDiv.innerHTML =
					`<div>
						<h2>Log Files</h2>
						<ul class="logData">
							${self.renderLogs(response)}
						</ul>
					</div>`
			} else {
				self.targetDiv.innerHTML = 'error: ' + error.message
			}
		})
	}
}
