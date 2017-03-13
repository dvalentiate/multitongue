Multitongue.squarespace = function (langCodeList) {
	'use strict';
	
	var mtl = new Multitongue.LanguageIndex(langCodeList, {cookie: {path: "/"}});
	var langIndex = mtl.getLangIndex();
	mtl.setCookie(langIndex);
	
	if (window.location !== window.top.location) {
		// do not translate Squarespace preview, its uses an iframe,
		// unfortunately other iframe uses also won't render
		return;
	}
	
	var mt = new Multitongue(langIndex);
	mt.reduce(Multitongue.element('body, title'));
	
	// translating dates propertly is hard, instead use YYYY-MM-DD
	var timeElementSet = document.getElementsByTagName('time');
	for (var i = 0; i < timeElementSet.length; i++) {
		timeElementSet[i].innerHTML = timeElementSet[i].getAttribute('datetime');
	}
	
	var oddsAndEnds = function () {
		var findReplaceByClassSet = [
			{class: 'like-count', find: 'Likes', replace: '....Likes..Aime..Gustos....'},
			{class: 'like-count', find: 'Like', replace: '....Like..Aime..Gusto....'},
			{class: 'ss-social-button', find: 'Share', replace: '....Share..Partager..Compartir....'},
			{class: 'tags-cats', find: 'categories', replace: '....categories..catégories..categorías....'},
			{class: 'sqs-system-button', find: 'Submit', replace: '....Submit..Soumettre..Enviar....'}
		];
		
		for (var i = 0; i < findReplaceByClassSet.length; i++) {
			var frbc = findReplaceByClassSet[i];
			var elementSet = document.getElementsByClassName(frbc.class);
			for (var j = 0; j < elementSet.length; j++) {
				var element = elementSet[j];
				var before, after;
				if (element.tagName.toLowerCase() === 'input' && element.type === 'submit') {
					var before = element.getAttribute('value');
					var after = before.replace(frbc.find, frbc.replace);
					if (before !== after) {
						element.setAttribute('value', after);
						mt.reduce(element);
					}
				} else {
					var before = element.innerHTML;
					var after = before.replace(frbc.find, frbc.replace);
					if (before !== after) {
						element.innerHTML = after;
						mt.reduce(element);
					}
				}
			}
		}
	};
	// hacky, but where we are at
	setTimeout(oddsAndEnds, 3000);
	
	return langIndex;
};
