window.db = {};
for (var i in localStorage){
	window.db[i] = localStorage[i];
};
window.session = {};
for (var i in session){
	window.session[i] = sessionStorage[i];
};
//Load data from disk to the memory.
window.EL_dat = [];
function EL(func){
	window.EL_dat[window.EL_dat.length] = func;
};
onload = function(){
	var i = 0;
	while (i < window.EL_dat.length){
		window.EL_dat[i]();
		i++;
	};
};
function getrepodata(repoid){
	getfile("repositories/" + repoid + "").then(function(res){
		console.log(res);
		res.response = JSON.parse(res.response);
		var repos = {name:res.response.name,is_private:res.response.private,id:res.response.id};
		localStorage.setItem("repos_" + repoid,JSON.stringify(repos));
		location.reload();
	}).catch(function(err){
		console.error(err);
		alert("Failed to fetch.");
	});
};
var blob = function(buffer,cfg){
	if (Blob)
		return new Blob(buffer,cfg);
	else if (BlobBuilder)
		return new BlobBuilder(buffer,cfg);
	else if (WebKitBlobBuilder)
		return new WebKitBlobBuilder(buffer,cfg);
	else if (MozBlobBuilder)
		return new MozBlobBuilder(buffer,cfg);
	else if (MSBlobBuilder)
		return new MSBlobBuilder(buffer,cfg);
	else return null;
};