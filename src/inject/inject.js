const script = document.createElement('script');
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
//*/



/*
 * Get current cloud save from melvor cloud
 *

// NOT WORKING CURRENTLY AS SESSION IS NOT PERSISTANT

var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.responseURL.includes('actions.php') && this.readyState == 4 && this.status == 200) {
	    console.log(this);
    }
};
xhttp.open("POST", "cloud/actions.php", true);
xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
exportSave(false);
mySaveData = document.getElementById("exportSaveField").value;
xhttp.send("cloud-btn-view=");
//*/
