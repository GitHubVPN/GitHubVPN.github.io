rate_limit();
if (window.db.token){
	if (window.db.username)
		EL(function(){
			document.querySelector("#userinfo").innerHTML = "<b><a onclick=javascript:window.open('/settings/','_blank');><img id=avatar height=64px width=64px src=" + localStorage.avatar_url + "><br>" + window.db.username + "</a></b><br>------<br><button onclick=javascript:logout();>Logout</button><br><a href=# onclick=javascript:back();>Back</a>";
			
			if (window.db.repos) {
				var args = ParseURLArgs();
				console.log(args);
				var repo_id = args.repo_id; 
				var repo_data = window.db["repos_" + repo_id];
				if (typeof(repo_data) == "undefined") {
					document.querySelector("#workspace").innerHTML = "<font color=red>The project is not in the local database.</font><br><a href=# onclick=javascript:getrepodata(" + repo_id + ");>Fetch</a>";
					return -1;
				} else repo_data = JSON.parse(repo_data);
				document.querySelector("#workspace").innerHTML = "<b>" + repo_data.name + "</b>/<a href=# onclick=javascript:ToMainBranch();>main</a>/<span id=path>" + args.path + "</span><p id=tools style='text-align:right'><input type=button value='Edit' onclick=javascript:go_edit_file(); id=edit_button><input type=button value='Open it on GitHub' onclick=javascript:open_github(); id=edit_button><input type=button value='Download' onclick=javascript:download_file(); id=download_button><input type=button value='Delete' onclick=javascript:go_delete_file();></p><hr><div id=content>Fetching your file from <font color=red>api.github.com</font>.<br>Please wait a moment.</div>";
				buildPathLink();
				var req_url = args.url;
				req_url = req_url.substring(23).split("?")[0];
				window.current_file = req_url;
				getfile(req_url).then(function(res){
					var info = JSON.parse(res.response);
					console.log(res,info);
					if (typeof(info.content) == "undefined"){
						var dat = location.href.substring(location.origin.length + 6);
						location.href = "/tree/" + dat;
					};
					if (info.encoding == "base64") {
						var content = utf8to16(atob(info.content));
						console.log(content);
						var link = req_url.split("?")[0].split(".");	
						window.current_file = blob([content]);
						var blob_url = window.URL.createObjectURL(window.current_file);
						var suffix = link[link.length - 1];
						if (suffix == "jpg" || suffix == "png" || suffix == "webp" || suffix == "bmp" || suffix == "jpeg" || suffix == "ico" || suffix == "gif" || suffix == "svg") {
							document.querySelector("#edit_button").disabled = true;
							window.current_file = req_url;
							document.querySelector("#content").innerHTML = "<img src=" + replaceURL(geturl()) + " alt=Image>";
						} else if (suffix == "mp4") {
									document.querySelector("#edit_button").disabled = true;
									var blob_url = window.URL.createObjectURL(xhr.response);
									window.current_file = xhr.response;
									document.querySelector("#content").innerHTML = "<video src=" + blob_url + " height=100% width=100% controls>";
						} else if (suffix == "mp3" || suffix == "wmv") {
									document.querySelector("#edit_button").disabled = true;
									var blob_url = window.URL.createObjectURL(xhr.response);
									window.current_file = xhr.response;
									document.querySelector("#content").innerHTML = "<audio src=" + blob_url + " controls>";
						} else {
							if (isBinaryFile(content)){
								document.querySelector("#edit_button").disabled = true;
								document.querySelector("#content").innerHTML = "<p style='text-align:center'>Binary File</p>";
								window.current_file = req_url;
							} else {
								document.querySelector("#content").innerHTML = "<textarea id=code readonly cols=200 rows=120></textarea>";
								document.querySelector("#code").value = content;
							};
						};			
					};
				}).catch(function(err){
					console.error(err);
					if (err.status == 401 || err.status == 404) {
						document.querySelector("#workspace").innerHTML = "<font color=red>Failed to load data.</font><br><a href=# onclick=javascript:location.reload();>Reload</a>";
						document.querySelector("#edit_button").disabled = true;
						document.querySelector("#delete_button").disabled = true;
						document.querySelector("#download_button").disabled = true;
					} else if (err.status == 403) {
						//File is too large
						document.querySelector("#edit_button").disabled = true;
						if (window.XMLHttpRequest){
							var xhr = new XMLHttpRequest();
						} else {
							var xhr = new ActiveXObject("Microsoft.XMLHTTP");
						};
						var args = ParseURLArgs();
						var url = args.url.split("?")[0].split("/");
						var i = 4;
						var link = "https://raw.githubusercontent.com/";
						while (i < url.length){
							if (i == 4 || i > 6)	
								link += url[i] + "/";
							if (i == 5)
								link += url[i] + "/main/";
							i++;
						};
						link = link.substring(link.length-1,-1);
						var suffix = url[url.length-1].split(".");
						suffix = suffix[suffix.length - 1];
						if (suffix == "jpg" || suffix == "png" || suffix == "webp" || suffix == "bmp" || suffix == "jpeg" || suffix == "ico" || suffix == "gif" || suffix == "svg" || suffix == "mp3" || suffix == "wmv" || suffix == "mp4") {
							link = replaceURL(link);
							document.querySelector("#content").innerHTML = "<font color=red>File is too large. (More than 1MB)</font><br>Fetching your file from <font color=red>cdn.jsdelivr.net</font>......<br>Please wait a moment.";
						} else {
							document.querySelector("#content").innerHTML = "<font color=red>File is too large. (More than 1MB)</font><br>Fetching your file from <font color=red>raw.githubusercontent.com</font>......<br>Please wait a moment.";
						};
						console.log(link);
						xhr.open("GET",link,true);
						xhr.send();
						xhr.responseType = "blob";
						xhr.onload = function(){
							if (xhr.status >= 200 && xhr.status < 400){
								var suffix = url[url.length-1].split(".");
								suffix = suffix[suffix.length - 1].toLowerCase();
								if (suffix == "jpg" || suffix == "png" || suffix == "webp" || suffix == "bmp" || suffix == "jpeg" || suffix == "ico" || suffix == "gif" || suffix == "svg") {
									var blob_url = window.URL.createObjectURL(xhr.response);
									window.current_file = xhr.response;
									document.querySelector("#content").innerHTML = "<img src=" + blob_url + " alt=Image>";
								} else if (suffix == "mp4") {
									var blob_url = window.URL.createObjectURL(xhr.response);
									window.current_file = xhr.response;
									document.querySelector("#content").innerHTML = "<video src=" + blob_url + " height=100% width=100% controls>";
								} else if (suffix == "mp3" || suffix == "wmv") {
									var blob_url = window.URL.createObjectURL(xhr.response);
									window.current_file = xhr.response;
									document.querySelector("#content").innerHTML = "<audio src=" + blob_url + " controls>";
								} else {
									document.querySelector("#content").innerHTML = "Sorry! The file is so large that we can't show it.";
								};
							} else {
								document.querySelector("#workspace").innerHTML = "<font color=red>Failed to load data.</font><br><a href=# onclick=javascript:location.reload();>Reload</a>";
								document.querySelector("#delete_button").disabled = true;
								document.querySelector("#download_button").disabled = true;
							};
						};
					};
				});
			} else {
				localStorage.repos = "[]";
				location.reload();
			};
		});
	 else EL(function(){
			document.querySelector("#userinfo").innerHTML = "<button onclick=javascript:logout();>Logout</button>";
			getfile("user").then(function(res){
				var dat = JSON.parse(res.response);
				console.log(res,dat);
				localStorage.username = dat.login;
				localStorage.userid = dat.id;
				localStorage.avatar_url = dat.avatar_url;
				location.reload();
			}).catch(function(err){
				console.error(err);
				alert("Failed to load your user data.");
			});
		});
	;
} else {
	EL(function(){
		document.querySelector("#userinfo").innerHTML = "Please login first.";
		document.querySelector("#workspace").innerHTML = "<center><p style='font-size:1.5em'>GitHub VPN Login System<br>Please input your GitHub API Access Token<br><input type=text id=github_access_token placeholder=ghp_xxxxxxxx style='width:400px'></p><a href=/aritcle/how_to_ask_for_my_github_api_access_token.html target=_blank>How to ask for my GitHub API Access Token</a><br><button onclick=login();>Confirm</button></center>";
	});
};
function back(){
	var args = buildBackURL(ParseURLArgs());
	if (typeof(args) == "string")
		location.href = args;
	else
		location.href = "/tree/?repo_id=" + args.repo_id + "&path=" + args.path + "&url=" + args.url;
};
function buildBackURL(args){
	if (args.path.indexOf("/") == -1)
		return "/repo/?id=" + args.repo_id;
	else {
		var last_dict_position = args.path.lastIndexOf("/");
		var current_path = args.path.substring(0,last_dict_position);
		var cau = args.url.split("?")[0];
		var cau_ldp = cau.lastIndexOf("/");
		cau = cau.substring(0,cau_ldp);
		return {repo_id:args.repo_id,path:current_path,url:cau};
	};	
};
function ToMainBranch(){
	var args = ParseURLArgs();
	location.href = "/repo/?id=" + args.repo_id;
};
function buildPathLink(){
	var path = document.querySelector("#path").innerHTML;
	path = path.split("/");
	var current_path = "";
	var str = "";
	var i = 0;
	while (i < path.length){
		current_path += path[i] + "/";
		str += "<a class=path_link data-link=" + current_path.substring(current_path.length-1,-1) + ">" + path[i] + "</a>/";
		i++;
	};
	document.querySelector("#path").innerHTML = str.substring(str.length-1,-1);
	var eles = document.querySelectorAll(".path_link");
	i = eles.length - 1;
	var args = ParseURLArgs();
	while (i >= 0){
		eles[i].href = "/tree/?repo_id=" + args.repo_id + "&path=" + args.path + "&url=" + args.url;
		args = buildBackURL(args);
		i--;
	};
	eles[eles.length-1].href = "/blob/" + eles[eles.length-1].href.substring(6 + location.origin.length);
	
};
function download_file(){
	var blob_url = geturl();
	var suffix = blob_url.split("/");
	suffix = suffix[suffix.length-1].split(".");
	suffix = suffix[suffix.length - 1];
	if (suffix == "jpg" || suffix == "png" || suffix == "webp" || suffix == "bmp" || suffix == "jpeg" || suffix == "ico" || suffix == "gif" || suffix == "svg" || suffix == "mp3" || suffix == "wmv" || suffix == "mp4" || suffix == "pdf") {
		blob_url = replaceURL(blob_url);
		window.open(blob_url,"_blank");
	} else {
		var ele = document.createElement("a");
		ele.href = blob_url;
		var args = ParseURLArgs();
		var url = args.url.split("?")[0];
		url = url.split("/");
		ele.download = url[url.length - 1]
		ele.click();
	};
};
function geturl(){
	if (typeof(window.current_file) == "string") {
		var url = "https://api.github.com/" + window.current_file;
		url = url.split("?")[0].split("/");
		var i = 4;
		var link = "https://raw.githubusercontent.com/";
		while (i < url.length){
			if (i == 4 || i > 6)	
				link += url[i] + "/";
			if (i == 5)
				link += url[i] + "/main/";
			i++;
		};
		link = link.substring(link.length-1,-1);
		console.log(url,link,window.current_file);
		return link;
	} else return window.URL.createObjectURL(window.current_file);
	
};
function isBinaryFile(content){
	var len = content.length;
	var bin_char = 0;
	var i = 0;
	while (i < content.length){
		var ascii_code = content.charCodeAt(i);
		if ((ascii_code < 32) && (content[i] != "\n" && content[i] != "\r" && content[i] != "\t" && content[i] != "\b"))
			bin_char++;
		i++;
	};
	var ratio = bin_char / len;
	console.log(bin_char,len,ratio);
	return (ratio > 0.15);
};
function go_edit_file(){
	var dat = location.href.substring(location.origin.length + 6);
	location.href = "/edit/" + dat;
};
function go_delete_file(){
	var dat = location.href.substring(location.origin.length + 6);
	location.href = "/delete/" + dat;
};
function open_github(){
	var path = "https://www.github.com/";
	var args = ParseURLArgs();
	path += JSON.parse(window.db["repos_" + args.repo_id]).fullname;
	path += "/blob/main/";
	path += args.path;
	window.open(path,"_blank");
};