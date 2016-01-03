'use strict';

var child_process = require('child_process');
var fs = require('fs');
var packageJson = require('./package.json');

// create a minified version in the build directory
var minifierCmd = 'uglifyjs --compress --mangle';

var libSourceFile = 'multitongue.js';
var libMinifiedFile = 'build/multitongue.min.js';

var loaderSourceFile = 'content-loaded.js';
var loaderMinifiedFile = 'build/content-loaded.min.js';

console.log('creating multitongue minified version and examples in build directory');

try {
	fs.mkdirSync('build');
} catch (e) {}

var libSource = fs.readFileSync(libSourceFile, 'utf8');
var libMinified = ''
	+ '// ' + packageJson.name + ' ' + packageJson.version  + '\n'
	+ child_process.execSync(minifierCmd, {input: libSource, encoding: 'utf8'})
;
fs.writeFileSync(libMinifiedFile, libMinified);

var loaderSource = fs.readFileSync(loaderSourceFile, 'utf8');
var loaderMinified = ''
	+ child_process.execSync(minifierCmd, {input: loaderSource, encoding: 'utf8'})
;
fs.writeFileSync(loaderMinifiedFile, loaderMinified);

// create examples
var lib = libMinified;
var loader = loaderMinified;

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
	'basic-head': {
		head: ''
			+ '<script>\n'
			+ '\t' + lib.split('\n').join('\n\t').trim() + loader.split('\n').join('\n\t').trim() + '\n'
			+ '\t'
			+ 'Multitongue.contentLoaded(function () {'
			+ '(new Multitongue({langIndex: 0})).reduce(document.getElementsByTagName("html")[0]);'
			+ '})'
			+ '\n'
			+ '</script>'
	},
	'basic-end-of-body': {
		bodyEnd: ''
			+ '<script>\n'
			+ '\t' + lib.split('\n').join('\n\t').trim() + '\n'
			+ '\t'
			+ '(new Multitongue({langIndex: 0})).reduce(document.getElementsByTagName("html")[0]);'
			+ '\n'
			+ '</script>'
	},
	'squarespace': {
		bodyEnd: ''
			+ '<script>\n'
			+ '\t' + lib.split('\n').join('\n\t').trim() + '\n'
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
			+ '\t' + lib.split('\n').join('\n\t').trim() + '\n'
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
		content += '\t\t<header>' + bcKeyList[j] + '</header>\n';
		content += '\t\t' + bodyCase.split('\n').join('\n\t\t') + '\n';
		// content += '\t\t<textarea class="multitongue-ignore">' + bodyCase.replace(/\.\.\.\./g, '&#46; ...') + '</textarea>\n'
		content += '\t\t\n<hr>\t\t\n';
	}
	
	content += ''
		+ (env.bodyEnd ? '\t\t' + env.bodyEnd.split('\n').join('\n\t\t') + '\n' : '')
		+ '\t</body>\n'
		+ '</html>\n'
	;
	
	fs.writeFileSync(filename, content);
}
