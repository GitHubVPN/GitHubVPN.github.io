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
				document.querySelector("#workspace").innerHTML = "<b>" + repo_data.name + "</b>/main/<span id=path>" + args.path + "</span><p id=tools style='text-align:right'></p><hr><div id=content><div id=api_status></div><br><textarea id=code cols=180 rows=60></textarea><br><input type=button value='Commit changes' onclick=javascript:commit_code();><input type=button value='Cancel' onclick=javascript:cancel();></div>";
				buildPathLink();
				
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
	var dat = location.href.substring(location.origin.length + 9);
	location.href = "/tree/" + dat;
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
	var code = document.querySelector("#code").value;
	code = utf16to8(code);
	code = btoa(code);
	getfile(commit_path).then(function(res){
		document.querySelector("#api_status").innerHTML = "<font color=red>Failed to commit changes.</font><br>The file already exists.<br>Please change your filename.";
	}).catch(function(err){
		console.error(err);
		if (err.status == 404){
			//The file is not exist.
			//Continue.
			putfile(commit_path,code).then(function(res){
				console.log(res);
				//Commit successful.
				var args = ParseURLArgs();
				var url = "https://api.github.com/" + commit_path;
				var path = JSON.parse(res.response).content.path;
				location.href = "/blob/?repo_id=" + args.repo_id + "&path=" + path + "&url=" + url;
			}).catch(function(err){
				console.error(err);
				document.querySelector("#api_status").innerHTML = "<font color=red>Failed to commit changes.</font>";
			});
		} else document.querySelector("#api_status").innerHTML = "<font color=red>Failed to commit changes.</font><br>The file already exists.<br>Please change your filename.";
	});
};