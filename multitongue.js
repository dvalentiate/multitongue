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
	
	this.walk = function (startNode, endNode, beforeFn, afterFn, enterDepthFn, childFn, parentFn) {
		var n = startNode;
		
		do {
			if (typeof beforeFn === 'function') {
				beforeFn(n);
			}
			
			var next;
			if ((typeof enterDepthFn !== 'function' || enterDepthFn(n)) && n.firstChild) {
				next = n.firstChild;
				if (typeof childFn === 'function') {
					childFn(n, next);
				}
			} else if (n.nextSibling) {
				next = n.nextSibling;
			} else {
				next = n;
				do {
					var parent = next.parentNode;
					if (typeof parentFn === 'function') {
						parentFn(next, parent);
					}
					next = parent;
				} while (next !== endNode && !next.nextSibling);
				
				if (next !== endNode) {
					next = next.nextSibling;
				}
			}
			
			if (typeof afterFn === 'function') {
				afterFn(n, next);
			}
			
			n = next;
		} while (n !== endNode);
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
		var self = this;
		var langIndex = 0;
		var depthWithRemovalLanguage = 0;
		var beforeFn = function(n) {
			if (n === startNode || n === endNode) {
				return; // exclude ends
			}
			if (n.nodeType === Node.TEXT_NODE) {
				if (n.data === self.delimiterMap.languageSeparator) {
					++langIndex;
					if (langIndex === self.langIndex) {
						depthWithRemovalLanguage = 0;
					}
				}
				n = self.textNodeSeparate(n, self.delimiterMap.languageSeparator);
			}
		};
		var childFn = function () {
			if (langIndex !== self.langIndex) {
				++depthWithRemovalLanguage;
			}
		};
		var parentFn = function (n) {
			if (depthWithRemovalLanguage > 0) {
				n.parentNode.removeChild(n);
				--depthWithRemovalLanguage;
			}
		};
		var afterFn = function (n) {
			if (n === startNode || n === endNode) {
				return; // exclude ends
			}
			
			if (n.firstChild || n.parentNode === null) {
				return;
			}
			
			if (langIndex !== self.langIndex
				|| n.nodeType === Node.TEXT_NODE && n.data === self.delimiterMap.languageSeparator
			) {
				n.parentNode.removeChild(n);
			}
		};
		
		this.walk(startNode, endNode, beforeFn, afterFn, null, childFn, parentFn);
	};
	
	this.reduce = function (node) {
		if (!node.nodeType && typeof node.length !== 'undefined') {
			// assume nodeList
			for (var i = 0; i < node.length; i++) {
				this.reduce(node[i]);
			}
			return;
		}
		
		var groupStartNode = null;
		var self = this;
		var beforeFn = function (n) {
			if (n.nodeType === Node.TEXT_NODE) {
				if (groupStartNode === null) {
					n = self.textNodeSeparate(n, self.delimiterMap.groupStart);
				} else {
					n = self.textNodeSeparate(n, self.delimiterMap.groupEnd);
				}
			}
		};
		var afterFn = function (n) {
			if (n.nodeType === Node.TEXT_NODE) {
				if (groupStartNode === null) {
					if (n.data === self.delimiterMap.groupStart) {
						groupStartNode = n;
					}
				} else {
					if (n.data === self.delimiterMap.groupEnd) {
						self.pig(groupStartNode, n);
						groupStartNode.parentNode.removeChild(groupStartNode);
						n.parentNode.removeChild(n);
						
						groupStartNode = null;
					}
				}
			} else if (n.nodeType === Node.ELEMENT_NODE) {
				for (var i = 0; i < n.attributes.length; i++) {
					if (['href', 'src'].indexOf(n.attributes[i].name) !== -1) {
						continue;
					}
					var newValue = self.filterAttribute(n.attributes[i].value);
					if (newValue !== null) {
						n.attributes[i].value = newValue;
					}
				}
			}
		};
		
		var enterDepthFn = function (n) {
			return n.tagName !== 'SCRIPT';
		};
		
		this.walk(node, node, beforeFn, afterFn, enterDepthFn);
	};
};
