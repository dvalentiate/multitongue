var Multitongue = function (langIndex, options) {
	'use strict';
	
	if (typeof langIndex === 'number') {
		this.langIndex = langIndex;
	} else {
		options = langIndex;
		this.langIndex = options && options.langIndex || null;
	}
	
	this.delimiterMap = {
		groupStart: options && options.groupStart || '....',
		languageSeparator: options && options.languageSeparator || '..',
		groupEnd: options && options.groupEnd || '....'
	};
	
	this.filterAttribute = function (value) {
		var output = [];
		var offset = 0;
		
		while (true) {
			var startOuter = value.indexOf(this.delimiterMap.groupStart, offset);
			if (startOuter === -1) {
				break;
			}
			var startInner = startOuter + this.delimiterMap.groupStart.length;
			
			var endInner = value.indexOf(this.delimiterMap.groupEnd, startInner);
			if (endInner === -1) {
				break;
			}
			var endOuter = endInner + this.delimiterMap.groupEnd.length;
			
			var transList = value.substring(startInner, endInner).split(this.delimiterMap.languageSeparator);
			
			output.push(value.substring(offset, startOuter));
			output.push(transList[typeof transList[this.langIndex] === 'undefined' ? 0 : this.langIndex]);
			
			offset = endOuter;
		}
		
		if (output.length === 0) {
			return null;
		}
		
		output.push(value.substring(offset));
		
		return output.join('');
	};
	
	this.nodeFilter = function (node, indexOfFunction) {
		var childSetToRemove = [];
		var offset = 0;
		
		var childList = node.childNodes;
		while (true) {
			var start = indexOfFunction(childList, this.delimiterMap.groupStart, offset);
			if (start === -1) {
				break;
			}
			
			var end = indexOfFunction(childList, this.delimiterMap.groupEnd, start + 1);
			if (end === -1) {
				break;
			}
			
			var startTrans = indexOfFunction(childList, this.delimiterMap.languageSeparator, start + 1, end - 1, this.langIndex);
			if (startTrans === -1) {
				startTrans = start;
			}
			for (var i = start; i < startTrans + 1; i++) {
				childSetToRemove.push(childList[i]);
			}
			
			var endTrans = indexOfFunction(childList, this.delimiterMap.languageSeparator, startTrans + 1, end - 1);
			if (endTrans === -1) {
				endTrans = end;
			}
			for (var i = endTrans; i < end + 1; i++) {
				childSetToRemove.push(childList[i]);
			}
			
			offset = end + 1;
		}
		
		return childSetToRemove;
	};
	
	this.childNodeIndexOf = function (childList, delimiter, start, end, nth) {
		var pos = -1;
		
		if (typeof end === 'undefined') {
			end = childList.length;
		}
		nth = typeof nth === 'undefined' ? 1 : nth;
		
		for (var i = start || 0, n = 0; i < childList.length && i < end && n < nth; i++) {
			if (childList[i].nodeType !== Node.ELEMENT_NODE || childList[i].childNodes.length !== 1) {
				continue;
			}
			
			var childText = childList[i].firstChild;
			if (!childText || childText.nodeType !== Node.TEXT_NODE || childText.data.trim() !== delimiter) {
				continue;
			}
			
			n++;
			
			pos = i;
		}
		
		return pos;
	};
	
	this.nodeIndexOf = function (childList, delimiter, start, end, nth) {
		var pos = -1;
		
		if (typeof end === 'undefined') {
			end = childList.length;
		}
		nth = typeof nth === 'undefined' ? 1 : nth;
		
		for (var i = start || 0, n = 0; i < childList.length && i < end && n < nth; i++) {
			if (childList[i].nodeType !== Node.TEXT_NODE || childList[i].data !== delimiter) {
				continue;
			}
			
			n++;
			
			pos = i;
		}
		
		return pos;
	};
	
	this.reduceOld = function (node) {
		if (!node.nodeType && typeof node.length !== 'undefined') {
			// assume nodeList
			for (var i = 0; i < node.length; i++) {
				this.reduce(node[i]);
			}
			return;
		}
		
		if (node.outerHTML.indexOf(this.delimiterMap.groupStart) === -1) {
			return;
		}
		
		// handles delimiters inside attributes of node
		// Example: <input value="....Hello..Bonjour....">
		for (var i = 0; i < node.attributes.length; i++) {
			var newValue = this.filterAttribute(node.attributes[i].value);
			if (newValue !== null) {
				node.attributes[i].value = newValue;
			}
		}
		
		// handles delimiters inside child element nodes of node
		// Example:
		//     <p>....</p>
		//     <p>Hello</p>
		//     <p>..</p>
		//     <p>Bonjour</p>
		//     <p>....</p>
		var childSetToRemove = this.nodeFilter(node, this.childNodeIndexOf);
		for (var i = 0; i < childSetToRemove.length; i++) {
			node.removeChild(childSetToRemove[i]);
		}
		
		// splits text nodes into parts based on delimiters. Enables easier
		// processing of the nodes
		var childList = node.childNodes;
		var delimiterList = [this.delimiterMap.groupStart, this.delimiterMap.groupEnd, this.delimiterMap.languageSeparator];
		for (var i = 0; i < childList.length; i++) {
			var child = childList[i];
			
			if (child.nodeType !== Node.TEXT_NODE) {
				continue;
			}
			
			while (true) {
				var pos = child.data.length;
				var len = 0;
				for (var j = 0; j < delimiterList.length; j++) {
					var delimiterPos = child.data.indexOf(delimiterList[j]);
					if (delimiterPos !== -1 && delimiterPos < pos) {
						len = delimiterList[j].length;
						pos = delimiterPos;
					}
				}
				
				if (pos === child.data.length || len === child.data.length) {
					break;
				}
				
				if (pos !== 0) {
					child = child.splitText(pos);
					i++;
				}
				
				child = child.splitText(len);
				i++;
			}
		}
		
		// handles delimiters inside node
		// Example A:
		//     ....Hello..Bonjour....
		// Example B:
		//     ....
		//     <p>Hello</p>
		//     ..
		//     <p>Bonjour</p>
		//     ....
		var childrenToRemove = this.nodeFilter(node, this.nodeIndexOf);
		for (var i = 0; i < childrenToRemove.length; i++) {
			node.removeChild(childrenToRemove[i]);
		}
		
		// iterate through any child element nodes of node
		var childList = node.childNodes;
		for (var i = 0; i < childList.length; i++) {
			var child = childList[i];
			
			if (child.nodeType !== Node.ELEMENT_NODE) {
				continue
			}
			
			this.reduce(child);
		}
	};
	
	this.textNodeSeparate = function (node, delimiter) {
		var pos = node.data.indexOf(delimiter);
		if (pos === -1) {
			// no delimiter found, done
			return node;
		}
		
		// separate into pre, delimiter, and post text nodes
		if (pos > 0) {
			node = node.splitText(pos);
		}
		if (node.data.length > delimiter.length) {
			node.splitText(delimiter.length);
		}
		
		// returns node for delimiter
		return node;
	};
	
	// removes nodes not in this objects language index, expects startNode and
	// endNode parameters represent the boundaries of a language group
	this.pig = function (startNode, endNode) {
		var langIndex = 0;
		var n = startNode;
		
		do {
			if (n.nodeType === Node.TEXT_NODE) {
				n = this.textNodeSeparate(n, this.delimiterMap.languageSeparator);
				if (n.data === this.delimiterMap.languageSeparator) {
					++langIndex;
				}
			}
			if (langIndex !== this.langIndex
				|| n.nodeType === Node.TEXT_NODE && n.data === this.delimiterMap.languageSeparator
			) {
				// provides the next node using depth first search order
				var next = n.firstChild || n.nextSibling || n.parentNode.nextSibling;
				n.parentNode.removeChild(n);
				n = next;
			}
		} while (n !== endNode);
	};
	
	// reduce nodes from go through DOM in depth first search order, call 
	this.reduce = function (node) {
		if (!node.nodeType && typeof node.length !== 'undefined') {
			// assume nodeList
			for (var i = 0; i < node.length; i++) {
				this.reduce(node[i]);
			}
			return;
		}
		
		var groupStartNode = null;
		
		var n = node;
		
		while (true) {
			console.log('n', n, 'n.firstChild', n.firstChild, 'n.nextSibling', n.nextSibling, 'n.parentNode', n.parentNode);
			
			if (n.nodeType === Node.TEXT_NODE) {
				if (groupStartNode === null) {
					n = this.textNodeSeparate(n, this.delimiterMap.groupStart);
					if (n.data === this.delimiterMap.groupStart) {
						console.log('groupStartNode', n);
						groupStartNode = n;
					}
				} else {
					n = this.textNodeSeparate(n, this.delimiterMap.groupEnd);
					if (n.data === this.delimiterMap.groupEnd) {
						console.log('groupEndNode', n);
						this.pig(groupStartNode, n);
						
						groupStartNode = null;
					}
				}
			}
			
			var depthOrSibling = n.firstChild || n.nextSibling;
			if (depthOrSibling) {
				console.log('depthOrSibling');
				n = depthOrSibling;
			} else {
				console.log('ancestor');
				while (n.parentNode !== node.parentNode && !n.parentNode.nextSibling) {
					console.log('up');
					n = n.parentNode;
				}
				
				if (n.parentNode === node.parentNode) {
					break;
				}
				
				n = n.parentNode.nextSibling;
				console.log('n.parentNode.nextSibling', n);
			}
		}
	};
};
