function getfile(url){
	if (window.XMLHttpRequest)
		var xhr = new XMLHttpRequest();
	else
		var xhr = new ActiveXObject("Microsoft.XMLHTTP");
	return new Promise(function(resolve,reject){
		xhr.open("GET","https://api.github.com/" + url + "?access_token=" + window.db.token + "&random=" + Math.random().toString(),true);
		xhr.send();
		xhr.onload = function(){
			if (xhr.status >= 200 && xhr.status < 400)
				resolve({status:xhr.status,response:xhr.response,url:url,async:true});
			else
				reject({status:xhr.status,response:xhr.response,url:url,async:true});
		};
	});
};
function logout(){
	var key = ["username","userid","token","avatar_url","repos"];
	var i = 0;
	while (i < key.length){
		localStorage.removeItem(key[i]);
		i++;
	};
	location.reload();
};
function login(){
	var access_token = document.querySelector("#github_access_token").value;
	localStorage.token = access_token;
	location.reload();
};
function deletefile(url){
	if (window.XMLHttpRequest)
		var xhr = new XMLHttpRequest();
	else
		var xhr = new ActiveXObject("Microsoft.XMLHTTP");
	return new Promise(function(resolve,reject){
		xhr.open("DELETE","https://api.github.com/" + url + "?access_token=" + window.db.token + "&random=" + Math.random().toString(),true);
		xhr.send(JSON.stringify({message:"Delete file (GitHubVPN API)",sha:window.current_file_sha}));
		xhr.onload = function(){
			if (xhr.status >= 200 && xhr.status < 400)
				resolve({status:xhr.status,response:xhr.response,url:url,async:true});
			else
				reject({status:xhr.status,response:xhr.response,url:url,async:true});
		};
	});
};
function putfile(url,content,sha){
	if (window.XMLHttpRequest)
		var xhr = new XMLHttpRequest();
	else
		var xhr = new ActiveXObject("Microsoft.XMLHTTP");
	return new Promise(function(resolve,reject){
		xhr.open("PUT","https://api.github.com/" + url + "?access_token=" + window.db.token + "&random=" + Math.random().toString(),true);
		xhr.send(JSON.stringify({message:"Put file (GitHubVPN API)",sha:sha,content:content}));
		xhr.onload = function(){
			if (xhr.status >= 200 && xhr.status < 400)
				resolve({status:xhr.status,response:xhr.response,url:url,async:true});
			else
				reject({status:xhr.status,response:xhr.response,url:url,async:true});
		};
	});
};
