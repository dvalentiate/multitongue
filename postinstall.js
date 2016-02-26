'use strict';

var child_process = require('child_process');
var fs = require('fs');
var packageJson = require('./package.json');

// create a minified version in the build directory
var minifierCmd = 'uglifyjs --compress --mangle';

var libMap = {
	mt: {sourceFile: 'multitongue.js'},
	loader: {sourceFile: 'content-loaded.js'},
	element: {sourceFile: 'element.js'},
	language: {sourceFile: 'language-index.js'}
};

console.log('creating multitongue minified version and examples in build directory');

try {
	fs.mkdirSync('build');
} catch (e) {}

for (var i = 0, libKeySet = Object.keys(libMap); i < libKeySet.length; i++) {
	var lib = libMap[libKeySet[i]];
	lib.source = fs.readFileSync(lib.sourceFile, 'utf8');
	
	lib.minified = ''
		+ (libKeySet[i] === 'mt' ? '// ' + packageJson.name + ' ' + packageJson.version  + '\n' : '')
		+ child_process.execSync(minifierCmd, {input: lib.source, encoding: 'utf8'})
	;
	lib.minifiedFile = 'build/' + lib.sourceFile.replace(/[.]js$/, '') + '.min.js';
	fs.writeFileSync(lib.minifiedFile, lib.minified);
}

function weld() {// first param is the indentation amount, following params are strings to be joined
	var args = new Array(arguments.length);
	for (var i = 0; i < args.length; ++i) {
		args[i] = arguments[i];
	}
	
	return args.slice(1).join('').split('\n').join('\n' + args[0]).trim();
}

// create examples

var bodyCaseMap = {
	'delimiters and translations as single text node': ''
		+ '....Who We Are..Qui nous sommes..Quiénes somos....'
	,
	'multiple groups of delimiters and translations in a single text node': ''
		+ '....Who We Are..Qui nous sommes..Quiénes somos.... ....Blog..Blogue..Blog....'
	,
	'multiple groups of delimiters and translations, run together, in a single text node': ''
		+ '....Who We Are..Qui nous sommes..Quiénes somos........Blog..Blogue..Blog....'
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
	'delimited and translations are all deep in their own elements': ''
		+ '<div><div>....</div></div>\n'
		+ '<div><div>Who We Are</div></div>\n'
		+ '<div><div>..</div></div>\n'
		+ '<div><div>Qui nous sommes</div></div>\n'
		+ '<div><div>..</div></div>\n'
		+ '<div><div>Quiénes somos</div></div>\n'
		+ '<div><div>....</div></div>'
	,
	'delimited and translations are all deep in their own elements, with distractor elements cluttering things up': ''
		+ '<div>\n'
		+ '\t<div>distractor pre translation</div>\n'
		+ '\t<div>....</div>\n'
		+ '</div>\n'
		+ '<div><div>Who We Are</div></div>\n'
		+ '<div><div>..</div></div>\n'
		+ '<div><div>Qui nous sommes</div></div>\n'
		+ '<div><div>..</div></div>\n'
		+ '<div><div>Quiénes somos</div></div>\n'
		+ '<div>\n'
		+ '\t<div>....</div>\n'
		+ '\t<div>distractor post translation</div>\n'
		+ '</div>'
	,
	'delimiters and translations in an element attribute': ''
		+ '<input type="text" value="....Who We Are..Qui nous sommes..Quiénes somos...." title="distractor">'
};

var environmentMap = {
	'basic-head': {
		head: ''
			+ '<script>\n'
			+ '\t' + weld('\t', libMap.mt.minified, libMap.loader.minified) + '\n'
			+ '\t'
			+ 'Multitongue.contentLoaded(function () {'
			+ '(new Multitongue({langIndex: 0})).reduce(document.getElementsByTagName("html"));'
			+ '})'
			+ '\n'
			+ '</script>'
	},
	'basic-end-of-body': {
		bodyEnd: ''
			+ '<script>\n'
			+ '\t' + weld('\t', libMap.mt.minified) + '\n'
			+ '\t'
			+ '(new Multitongue({langIndex: 0})).reduce(document.getElementsByTagName("html"));'
			+ '\n'
			+ '</script>'
	},
	'squarespace': {
		bodyEnd: ''
			+ '<script>\n'
			+ '\tvar langCodeList = ["en", "fr", "es"];\n'
			+ '\t' + weld('\t', libMap.mt.minified, libMap.element.minified, libMap.language.minified) + '\n'
			+ '\t// do not translate Squarespace preview uses an iframe, unfortunately other iframe uses also wont render\n'
			+ '\tvar Mt = Multitongue;\n'
			+ '\tvar mtl = new Mt.LanguageIndex(langCodeList);\n'
			+ '\tvar langIndex = mtl.getLangIndex();\n'
			+ '\tmtl.setCookie(langIndex);\n'
			+ '\tif (window.location === window.top.location) {\n'
			+ '\t\t(new Mt(langIndex)).reduce(Mt.element("body, title"));\n'
			+ '\t}\n'
			+ '</script>'
	},
	'squarespace-with-selector': {
		bodyStart: '<div><div id="email"></div></div>',
		bodyEnd: ''
			+ '<script>\n'
			+ '\tvar langMap = {\n'
			+ '\t\ten: "English",\n'
			+ '\t\tfr: "Français",\n'
			+ '\t\tes: "Español"\n'
			+ '\t};\n'
			+ '\tvar langCodeList = Object.keys(langMap);\n'
			+ '\t' + weld('\t', libMap.mt.minified, libMap.element.minified, libMap.language.minified) + '\n'
			+ '\t// do not translate Squarespace preview uses an iframe, unfortunately other iframe uses also wont render\n'
			+ '\tvar Mt = Multitongue;\n'
			+ '\tvar mtl = new Mt.LanguageIndex(langCodeList);\n'
			+ '\tvar langIndex = mtl.getLangIndex();\n'
			+ '\tmtl.setCookie(langIndex);\n'
			+ '\tif (window.location === window.top.location) {\n'
			+ '\t\t(new Mt(langIndex)).reduce(Mt.element("body, title"));\n'
			+ '\t}\n'
			+ '\tvar languageSelectList = [];\n'
			+ '\tfor (var i = 0; i < langCodeList.length; i++) {\n'
			+ '\t\tif (i === langIndex) {\n'
			+ '\t\t\tcontinue;\n'
			+ '\t\t}\n'
			+ '\t\tlanguageSelectList.push(\'<a href="\' + location.pathname + \'?lang=\' + langCodeList[i] + location.hash + \'" style="font-size: larger; margin-left: 1em;">\' + langMap[langCodeList[i]] + \'</a>\');\n'
			+ '\t}\n'
			+ '\tvar langEl = document.createElement("div");\n'
			+ '\tlangEl.innerHTML = languageSelectList.join();\n'
			+ '\tvar emailEl = document.getElementById("email");\n'
			+ '\temailEl.parentNode.appendChild(langEl);\n'
			+ '\temailEl.style.display = "none";\n'
			+ '</script>'
	},
	'weebly': {
		bodyEnd: ''
			+ '<script>\n'
			+ '\t' + weld('\t', libMap.mt.minified) + '\n'
			+ '\t'
			+ 'if (window.location === window.top.location) {'
			+ '(new Multitongue({langIndex: 0})).reduce(document.getElementsByTagName("html"));'
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
		+ '\t\t<style>\n'
		+ '\t\t\tsection {border-bottom: 1px solid grey; padding: 0.5em 1em 0.5em 1em; margin: 1em 0 0 0;}\n'
		+ '\t\t\theader {margin: 0 -1em 0 -1em;}\n'
		+ '\t\t</style>\n'
		+ (env.head ? '\t\t' + env.head.split('\n').join('\n\t\t') + '\n' : '')
		+ '\t</head>\n'
		+ '\t<body>\n'
		+ (env.bodyStart ? '\t\t' + env.bodyStart.split('\n').join('\n\t\t') + '\n' : '')
	;
	
	for (var j = 0, bcKeyList = Object.keys(bodyCaseMap); j < bcKeyList.length; j++) {
		var bodyCase = bodyCaseMap[bcKeyList[j]];
		content += '\t\t<section>\n'
		content += '\t\t\t<header><strong>' + bcKeyList[j] + '</strong></header>\n';
		content += '\t\t\t' + bodyCase.split('\n').join('\n\t\t\t') + '\n';
		// content += '\t\t\t<textarea class="multitongue-ignore">' + bodyCase.replace(/\.\.\.\./g, '&#46; ...') + '</textarea>\n'
		content += '\t\t</section>\n\t\t\n';
	}
	
	content += ''
		+ (env.bodyEnd ? '\t\t' + env.bodyEnd.split('\n').join('\n\t\t') + '\n' : '')
		+ '\t</body>\n'
		+ '</html>\n'
	;
	
	fs.writeFileSync(filename, content);
}
