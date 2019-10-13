script = document.createElement('script');
script.src = chrome.extension.getURL('src/js/melvorIdleHelper.js');
document.body.appendChild(script);

chrome.storage.sync.set(localStorage, function(all){console.log(all)});
chrome.storage.sync.get(null, function(all){
	Object.keys(all).forEach(key=>{
		localStorage.setItem(key, all[key]);
	});
	localStorage.setItem('testing', 'testing extension');
});

console.log('Updated save data');
