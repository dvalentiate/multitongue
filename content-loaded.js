Multitongue.contentLoaded = function (readyCallback) {
	// Mozilla, Opera and webkit nightlies currently support this event
	if (document.addEventListener) {
		// Use the handy event callback
		document.addEventListener('DOMContentLoaded', function () {
			document.removeEventListener('DOMContentLoaded', arguments.callee, false);
			readyCallback();
		}, false);
	// If IE event model is used
	} else if (document.attachEvent) {
		// ensure firing before onload,
		// maybe late but safe also for iframes
		document.attachEvent('onreadystatechange', function () {
			if (document.readyState === 'complete') {
				document.detachEvent('onreadystatechange', arguments.callee);
				readyCallback();
			}
		});
	}
	
	// A fallback to window.onload, that will always work
	window.onload = readyCallback;
}
