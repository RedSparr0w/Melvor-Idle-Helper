script = document.createElement('script');
script.src = chrome.extension.getURL('src/js/melvorIdleHelper.js');
document.body.appendChild(script);

/*
 * DISABLE THE CLOUD SAVE STUFF FOR NOW
 * needs a lot more work to correctly detect when to overwrite your data
 *
 
// Load latest save
chrome.storage.sync.get(null, function(all){
	Object.keys(all).forEach(key=>{
		localStorage.setItem(key, all[key]);
	});
	console.debug('[Melvor Idle Helper] Loaded Saved Game');
});

// Upload latest save every 5 seconds
setInterval(()=>{
	chrome.storage.sync.set(localStorage, () => {
		console.debug('[Melvor Idle Helper] Saved Game');
	});
}, 5e3);
*/
