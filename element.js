Multitongue.element = function (tag) {
	'use strict';
	
	var tagSet = tag.split(',');
	var elementSet = [];
	for (var i = 0; i < tagSet.length; i++) {
		elementSet.push(document.getElementsByTagName(tagSet[i].trim()));
	}
	return elementSet;
}
