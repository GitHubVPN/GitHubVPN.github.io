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
				document.querySelector("#workspace").innerHTML = "<b>" + repo_data.name + "</b>/main/<span id=path>" + args.path + "</span><p id=tools style='text-align:right'><input type=button value='Download' onclick=javascript:download_file(); id=download_button><input type=button value='Delete' onclick=javascript:go_delete_file();></p><hr><div id=content>Fetching your file from <font color=red>api.github.com</font>.<br>Please wait a moment.</div>";
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
						window.current_file_sha = info.sha;
						var blob_url = window.URL.createObjectURL(window.current_file);
						if (isBinaryFile(content)){
							document.querySelector("#content").innerHTML = "Sorry! This is a binary file. You can't edit it.<br><a href=# onclick=javascript:back();>Back</a>";
							window.current_file = req_url;
						} else {
							document.querySelector("#content").innerHTML = "<div id=api_status></div><br><textarea id=code cols=180 rows=60></textarea><br><input type=button value='Commit changes' onclick=javascript:commit_code();><input type=button value='Cancel' onclick=javascript:cancel();>";
							document.querySelector("#code").value = content;
						};			
					};
				}).catch(function(err){
					console.error(err);
					if (err.status == 401 || err.status == 404) {
						document.querySelector("#workspace").innerHTML = "<font color=red>Failed to load data.</font><br><a href=# onclick=javascript:location.reload();>Reload</a>";
						//document.querySelector("#edit_button").disabled = true;
						document.querySelector("#delete_button").disabled = true;
						document.querySelector("#download_button").disabled = true;
					} else if (err.status == 403) {
						//File is too large
						//document.querySelector("#edit_button").disabled = true;
						if (window.db.cdn == "true")
							document.querySelector("#content").innerHTML = "<font color=red>File is too large. (More than 1MB)</font><br>Fetching your file from <font color=red>cdn.jsdelivr.net</font>......<br>Please wait a moment.";
						else document.querySelector("#content").innerHTML = "<font color=red>File is too large. (More than 1MB)</font><br>Fetching your file from <font color=red>raw.githubusercontent.com</font>......<br>Please wait a moment.";
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
								document.querySelector("#content").innerHTML = "Sorry! The file is so large that we can't show it.";
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
	var dat = location.href.substring(location.origin.length + 6);
	location.href = "/blob/" + dat;
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
		str += "<input type=text class=path_link data-link=" + current_path.substring(current_path.length-1,-1) + " value=" + path[i] + ">/";
		i++;
	};
	document.querySelector("#path").innerHTML = str.substring(str.length-1,-1);
	
};
function download_file(){
	var blob_url = geturl();
	var suffix = blob_url.split("/");
	suffix = suffix[suffix.length-1].split(".");
	suffix = suffix[suffix.length - 1];
	if (suffix == "jpg" || suffix == "png" || suffix == "webp" || suffix == "bmp" || suffix == "jpeg" || suffix == "ico" || suffix == "gif" || suffix == "svg" || suffix == "mp3" || suffix == "wmv" || suffix == "mp4") {
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
function cancel(){
	back();
};
function commit_code(){
	var path_eles = document.querySelectorAll(".path_link");
	var i = 0;
	var args = ParseURLArgs();
	var dat = JSON.parse(window.db["repos_" + args.repo_id]);
	var commit_path = "repos/" + dat.fullname + "/contents/";
	while (i < path_eles.length){
		commit_path += path_eles[i].value + "/";
		i++; 
	};
	commit_path = commit_path.substring(commit_path.length-1,-1);
	var old_path = "repos/" + dat.fullname + "/contents/" + args.path;
	var code = document.querySelector("#code").value;
	code = utf16to8(code);
	code = btoa(code);
	if (old_path != commit_path){
		//Old path and commit path aren't matched.
		//Delete the old file and commit the new file.
		//---------------------------------------------
		//1.Delete the old file.
		deletefile(old_path).then(function(res){
			//Delete successful
			console.log(res);
			//2. Upload the new file.
			//Get the sha value
			getfile(commit_path).then(function(res){
				var sha = JSON.parse(res.response).sha;
				putfile(commit_path,code,sha).then(function(res){
					//Update successful
					var location_path = commit_path.substring(16 + dat.fullname.length);
					var location_url = "https://api.github.com/" + commit_path;
					location.href = "/blob/?repo_id=" + args.repo_id + "&path=" + location_path + "&url=" + location_url;			
				}).catch(function(err){
					console.error(err);
					//Failed to put new file.
					//Try undo
					var reader = new FileReader();
					reader.readAsText(window.current_file);
					reader.onload = function(){
						var content = reader.result;
						putfile(old_path,content,window.current_file_sha).then(function(res){
							//Undo successful
							document.querySelector("#api_status").innerHTML = "<font color=red>Failed to commit changes.</font>\nTry <a href=# onclick=javascript:location.reload();>reload</a> the page.";
						}).catch(function(err){
							if (err.status == 409)
								document.querySelector("#api_status").innerHTML = "<font color=red>Failed to commit changes.</font><br>Someone made a submission when you were editing your file.<br>So,this file is locked.You can't commit it.<br>If you want to commit , please try to <a href=# onclick=javascript:location.reload();>reload</a> this page to unlock it.";
							else document.querySelector("#api_status").innerHTML = "<font color=red>Failed to commit changes.\nFatal Error!</font>\nError report:Cannot commit the old file.";
						});
					};
					reader.onerror = function(){
						document.querySelector("#api_status").innerHTML = "<font color=red>Failed to commit changes.\nFatal Error!</font>\nError report:Cannot read file.";
					};
				});
			}).catch(function(err){
				//Failed to get the sha value of new file.
				console.error(err);
					
				putfile(commit_path,code,"").then(function(res){
					//Update successful
					var location_path = commit_path.substring(16 + dat.fullname.length);
					var location_url = "https://api.github.com/" + commit_path;
					location.href = "/blob/?repo_id=" + args.repo_id + "&path=" + location_path + "&url=" + location_url;			
				}).catch(function(err){
					console.error(err);
					//Failed to put new file.
					//Try undo
					var reader = new FileReader();
					reader.readAsText(window.current_file);
					reader.onload = function(){
						var content = reader.result;
						putfile(old_path,content,window.current_file_sha).then(function(res){
							//Undo successful
							document.querySelector("#api_status").innerHTML = "<font color=red>Failed to commit changes.</font>\nTry <a href=# onclick=javascript:location.reload();>reload</a> the page.";
						}).catch(function(err){
							if (err.status == 409)
								document.querySelector("#api_status").innerHTML = "<font color=red>Failed to commit changes.</font><br>Someone made a submission when you were editing your file.<br>So,this file is locked.You can't commit it.<br>If you want to commit , please try to <a href=# onclick=javascript:location.reload();>reload</a> this page to unlock it.";
							else document.querySelector("#api_status").innerHTML = "<font color=red>Failed to commit changes.\nFatal Error!</font>\nError report:Cannot commit the old file.";
						});
					};
					reader.onerror = function(){
						document.querySelector("#api_status").innerHTML = "<font color=red>Failed to commit changes.\nFatal Error!</font>\nError report:Cannot read file.";
					};
				});
			});
			
		}).catch(function(err){
			console.error(err);
			//Failed to delete old file.
			if (err.status == 409)
				document.querySelector("#api_status").innerHTML = "<font color=red>Failed to commit changes.</font><br>Someone made a submission when you were editing your file.<br>So,this file is locked.You can't commit it.<br>If you want to commit , please try to <a href=# onclick=javascript:location.reload();>reload</a> this page to unlock it."
			 else document.querySelector("#api_status").innerHTML = "<font color=red>Failed to commit changes.</font>";
			return -1;
		});
	} else {
		//Old path and commit path are matched.
		putfile(commit_path,code,window.current_file_sha).then(function(res){
			back();
			//Update successful
		}).catch(function(err){
				
			//Failed to put file.
			if (err.status == 409)
				document.querySelector("#api_status").innerHTML = "<font color=red>Failed to commit changes.</font><br>Someone made a submission when you were editing your file.<br>So,this file is locked.You can't commit it.<br>If you want to commit , please try to <a href=# onclick=javascript:location.reload();>reload</a> this page to unlock it.";
			else document.querySelector("#api_status").innerHTML = "<font color=red>Failed to commit changes.</font>";
		});
	};
};
function go_delete_file(){
	var dat = location.href.substring(location.origin.length + 6);
	location.href = "/delete/" + dat;
};