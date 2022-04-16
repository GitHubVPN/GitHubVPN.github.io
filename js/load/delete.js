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
				document.querySelector("#workspace").innerHTML = "<b>" + repo_data.name + "</b>/<a href=# onclick=javascript:ToMainBranch();>main</a>/<span id=path>" + args.path + "</span><p id=tools style='text-align:right'><input type=button value='Download' onclick=javascript:download_file(); id=download_button></p><hr><div id=api_status></div><div id=content>Checking whether the file exists</div>";
				buildPathLink();
				var req_url = args.url;
				req_url = req_url.substring(23).split("?")[0];
				window.current_file = req_url;
				getfile(req_url).then(function(res){
					load_del_page();
					getSha(JSON.parse(res.response).sha,function(sha){
						window.current_file_sha = sha;
					});
				}).catch(function(err){
					console.error(err);
					if (err.status == 401 || err.status == 404) {
						document.querySelector("#workspace").innerHTML = "<font color=red>Failed to load data.</font><br><a href=# onclick=javascript:location.reload();>Reload</a>";
						document.querySelector("#download_button").disabled = true;
					} else load_del_page();
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
	var dat = location.href.substring(location.origin.length + 8);
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
	eles[eles.length-1].href = "/delete/" + eles[eles.length-1].href.substring(6 + location.origin.length);
	
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
function cancel(){
	back();
};
function load_del_page(){
	document.querySelector("#content").innerHTML = "<font color=red>Are you sure you want to delete this file?</font><br>If you delete this file, you can't find it on GitHubVPN.<br>(If you are fortunate, you may find it on GitHub.)<br><br><br><br><input type=button value=Confirm onclick=javascript:delete_file();><input type=button value=Cancel onclick=javascript:cancel();>";
};
function delete_file(){
	var paths = "repos/" + JSON.parse(window.db["repos_" + ParseURLArgs().repo_id]).fullname + "/contents/" + ParseURLArgs().path;
	deletefile(paths).then(function(res){
		console.log(res);
		var args = buildBackURL(ParseURLArgs());
		if (typeof(args) == "string")
			location.href = args;
		else
			location.href = "/tree/?repo_id=" + args.repo_id + "&path=" + args.path + "&url=" + args.url;
	}).catch(function(err){
		console.error(err);
		document.querySelector("#api_status").innerHTML = "<font color=red>Failed to delete this file.</font>";
	});
};
function getSha(s,callback){
	if (s) {
		callback(s);
		return;
	} else back();
	var args = ParseURLArgs();
	var url = args.url;
	var last_dict_position = url.lastIndexOf("/");
	url = url.substring(23,last_dict_position);
	getfile(url).then(function(res){
		var dat = JSON.parse(res.response);
		var i = 0;
		var p = ParseURLArgs().path;
		while (i < dat.length){
			if (dat[i].path == p)
				callback(dat[i].sha);
			i++;
		};
	}).catch(function(err){
		callback(err);
	});
};