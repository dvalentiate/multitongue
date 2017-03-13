Multitongue.LanguageIndex = function (supportedLangCodeList, options) {
	'use strict';
	
	this.codeList = supportedLangCodeList;
	
	this.getQueryCode = function () {
		var lang = location.search.match(/[\?&]lang=([^&#]*)/);
		lang = decodeURIComponent(lang && lang[1] || '');
		return this.codeList.indexOf(lang) !== -1 && lang || null;
	};
	
	this.getCookieCode = function () {
		var value = document.cookie.replace(/(?:(?:^|.*;\s*)langCode\s*\=\s*([^;]*).*$)|^.*$/, '$1');
		return this.codeList.indexOf(value) === -1 ? null : value;
	};
	
	this.setCookie = function (langIndexOrCode) {
		if (typeof langIndexOrCode === 'number') {
			langIndexOrCode = this.codeList[langIndexOrCode];
		}
		if (this.codeList.indexOf(langIndexOrCode) === -1) {
			throw new Error('invalid value for param langIndexOrCode');
		}
		var cookie = ['langCode=' + langIndexOrCode];
		if (options && options.cookie && options.cookie.path) {
			cookie.push('path=' + options.cookie.path);
		}
		
		document.cookie = cookie.join(';');
	};
	
	this.getHashCode = function () {
		var hash = window.location.hash.substr(1);
		return this.codeList.indexOf(hash) === -1 ? null : hash;
	};
	
	this.getBrowserCode = function (exact) {
		var wantedLangCodeList = []
			.concat([window.navigator.userLanguage])
			.concat(window.navigator.languages)
			.filter(function (x) {
				return x;
			})
			.map(function (x) {
				return exact ? x : x.substr(0, 2);
			})
		;
		
		var slcl = this.codeList.map(function (x) {
			return exact ? x : x.substr(0, 2);
		});
		
		var langCode = null;
		var preferedMatchedIndex = wantedLangCodeList.length;
		for (var i = 0; i < slcl.length; i++) {
			var matchIndex = wantedLangCodeList.indexOf(slcl[i]);
			if (matchIndex !== -1 && matchIndex < preferedMatchedIndex) {
				preferedMatchedIndex = matchIndex;
				langCode = this.codeList[i];
			}
		}
		
		return langCode;
	};
	
	this.getLangCode = function () {
		return this.getQueryCode()
			|| this.getHashCode()
			|| this.getCookieCode()
			|| this.getBrowserCode(true)
			|| this.getBrowserCode(false)
		;
	};
	
	this.getLangIndex = function (langCode, defaultIndex) {
		if (typeof langCode === 'undefined') {
			langCode = this.getLangCode();
		}
		if (typeof defaultIndex === 'undefined') {
			defaultIndex = 0;
		}
		var index = this.codeList.indexOf(langCode);
		return index === -1 ? defaultIndex : index;
	};
};
