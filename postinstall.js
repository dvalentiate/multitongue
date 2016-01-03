'use strict';

var child_process = require('child_process');
var fs = require('fs');
var packageJson = require('./package.json');

// create a minified version in the build directory
var sourceFile = 'multitongue.js';
var command = 'uglifyjs --compress --mangle --preamble "// multitongue "' + packageJson.version;
var minifiedFile = 'build/multitongue.min.js';

console.log('creating multitongue minified version and examples in build directory');

try {
	fs.mkdirSync('build');
} catch (e) {}

var source = fs.readFileSync(sourceFile, 'utf8');
var minified = child_process.execSync(command, {input: source, encoding: 'utf8'});
fs.writeFileSync(minifiedFile, minified);

// create examples
var multitongueLib = minified;

var bodyCaseMap = {
	'delimiters and translations as single text node': ''
		+ '....Who We Are..Qui nous sommes..Quiénes somos....'
	,
	'delimiters and translations as single text node, whitespace noise': ''
		+ '.... Who We Are .. Qui nous sommes .. Quiénes somos ....'
	,
	'delimiters and translations as single text node inside an immediate element': ''
		+ '<div>\n'
		+ '\t....Who We Are..Qui nous sommes..Quiénes somos....\n'
		+ '</div>'
	,
	'delimiters and translations as single text node inside a deeply nested element': ''
		+ '<div><div><div>\n'
		+ '\t....Who We Are..Qui nous sommes..Quiénes somos....\n'
		+ '</div></div></div>'
	,
	'translations in elements separated by delimiters': ''
		+ '....\n<div>Who We Are</div>\n..\n<div>Qui nous sommes</div>\n..\n<div>Quiénes somos</div>\n....'
	,
	'translations in elements separated by delimiters, all contained in element': ''
		+ '<div>\n'
		+ '\t....\n<div>Who We Are</div>\n..\n<div>Qui nous sommes</div>\n..\n<div>Quiénes somos</div>\n....\n'
		+ '</div>'
	,
	'translations in elements separated by delimiters, all contained in a deeply nested element': ''
		+ '<div><div><div>\n'
		+ '\t....\n<div>Who We Are</div>\n..\n<div>Qui nous sommes</div>\n..\n<div>Quiénes somos</div>\n....\n'
		+ '</div></div></div>'
	,
	'delimited and translations are all in their own elements': ''
		+ '<div>....</div>\n'
		+ '<div>Who We Are</div>\n'
		+ '<div>..</div>\n'
		+ '<div>Qui nous sommes</div>\n'
		+ '<div>..</div>\n'
		+ '<div>Quiénes somos</div>\n'
		+ '<div>....</div>'
	,
	'delimited and translations are all in their own elements, deeply nested': ''
		+ '<div><div><div>\n'
		+ '\t<div>....</div>\n'
		+ '\t<div>Who We Are</div>\n'
		+ '\t<div>..</div>\n'
		+ '\t<div>Qui nous sommes</div>\n'
		+ '\t<div>..</div>\n'
		+ '\t<div>Quiénes somos</div>\n'
		+ '\t<div>....</div>\n'
		+ '</div></div></div>'
	,
	'delimiters and translations in an element attribute': ''
		+ '<input type="text" value="....Who We Are..Qui nous sommes..Quiénes somos....">'
};

var environmentMap = {
	'basic': {
		head: ''
			+ '<script>\n'
			+ '\t' + multitongueLib.split('\n').join('\n\t') + '\n'
			+ '\t'
			+ '(new Multitongue({langIndex: 0})).reduce(document.getElementsByTagName("html")[0]);'
			+ '\n'
			+ '</script>'
	},
	'basic-footer': {
		bodyEnd: ''
			+ '<script>\n'
			+ '\t' + multitongueLib.split('\n').join('\n\t') + '\n'
			+ '\t'
			+ '(new Multitongue({langIndex: 0})).reduce(document.getElementsByTagName("html")[0]);'
			+ '\n'
			+ '</script>'
	},
	'squarespace': {
		bodyEnd: ''
			+ '<script>\n'
			+ '\t' + multitongueLib.split('\n').join('\n\t') + '\n'
			+ '\t'
			+ 'if (window.location === window.top.location) {'
			+ '(new Multitongue({langIndex: 0})).reduce(document.getElementsByTagName("html")[0]);'
			+ '}'
			+ '\n'
			+ '</script>'
	},
	'weebly': {
		bodyEnd: ''
			+ '<script>\n'
			+ '\t' + multitongueLib.split('\n').join('\n\t') + '\n'
			+ '\t'
			+ 'if (window.location === window.top.location) {'
			+ '(new Multitongue({langIndex: 0})).reduce(document.getElementsByTagName("html")[0]);'
			+ '}'
			+ '\n'
			+ '</script>'
	}
};

try {
	fs.mkdirSync('build/example');
} catch (e) {}

for (var i = 0, eKeyList = Object.keys(environmentMap); i < eKeyList.length; i++) {
	var filename = 'build/example/' + eKeyList[i] + '.html';
	var env = environmentMap[eKeyList[i]];
	var content = '';
	
	content += ''
		+ '<!DOCTYPE html>\n'
		+ '<html>\n'
		+ '\t<head>\n'
		+ '\t\t<meta charset="UTF-8">\n'
		+ (env.head ? '\t\t' + env.head.split('\n').join('\n\t\t') + '\n' : '')
		+ '\t</head>\n'
		+ '\t<body>\n'
	;
	
	for (var j = 0, bcKeyList = Object.keys(bodyCaseMap); j < bcKeyList.length; j++) {
		var bodyCase = bodyCaseMap[bcKeyList[j]];
		content += '\t\t<header>' + bcKeyList[j] + '<header>\n';
		content += '\t\t' + bodyCase.split('\n').join('\n\t\t');
		content += '\t\t\n\t\t\n';
	}
	
	content += ''
		+ (env.bodyEnd ? '\t\t' + env.bodyEnd.split('\n').join('\n\t\t') + '\n' : '')
		+ '\t</body>\n'
		+ '</html>\n'
	;
	
	fs.writeFileSync(filename, content);
}
