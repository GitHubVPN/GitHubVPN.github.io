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
		var repos = {name:res.response.name,is_private:res.response.private,id:res.response.id,fullname:res.response.full_name};
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
function replaceURL(s){
    s = s.split("/");
    var username = s[3];
    var reponame = s[4];
    var filepath = "";
    var i = 6;
    while (i < s.length){
        filepath += s[i] + "/";
        i++;
    };
    filepath = filepath.substring(filepath.length-1,-1);
    return ("https://cdn.jsdelivr.net/gh/" + username + "/" + reponame + "/" + filepath);
};