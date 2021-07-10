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
				document.querySelector("#workspace").innerHTML = "<b>" + repo_data.name + "</b>/<a href=# onclick=javascript:ToMainBranch();>main</a>/<span id=path>" + args.path + "</span><p id=tools style='text-align:right'><input type=button value='New File' onclick=javascript:new_file();><input type=button value='Upload files' onclick=javascript:go_upload_files();><input type=button value='Open it on GitHub' onclick=javascript:open_github();></p><hr><div id=content>Fetching your file from <font color=red>api.github.com</font>.<br>Please wait a moment.</div>";
				buildPathLink();
				var req_url = args.url;
				req_url = req_url.substring(23).split("?")[0];
				getfile(req_url).then(function(res){
					var info = JSON.parse(res.response);
					console.log(res,info);
					if (typeof(info.content) != "undefined"){
						var dat = location.href.substring(location.origin.length + 6);
						location.href = "/blob/" + dat;
					};
					var i = 0;
					var s = "<table border=0>";
					while (i < info.length){
						var f_name = info[i].name;
						var f_sha = info[i].sha;
						var f_size = info[i].size;
						var is_file = (info[i].type == "file");
						var svg = (is_file)?"<svg aria-label='File' aria-hidden='true' viewBox='0 0 16 16' version='1.1' data-view-component='true' height='16' width='16' class='octicon octicon-file color-icon-tertiary'>\n    <path fill-rule='evenodd' d='M3.75 1.5a.25.25 0 00-.25.25v11.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25V6H9.75A1.75 1.75 0 018 4.25V1.5H3.75zm5.75.56v2.19c0 .138.112.25.25.25h2.19L9.5 2.06zM2 1.75C2 .784 2.784 0 3.75 0h5.086c.464 0 .909.184 1.237.513l3.414 3.414c.329.328.513.773.513 1.237v8.086A1.75 1.75 0 0112.25 15h-8.5A1.75 1.75 0 012 13.25V1.75z'></path>\n</svg>":"<svg aria-label='Directory' aria-hidden='true' viewBox='0 0 16 16' version='1.1' data-view-component='true' height='16' width='16' class='octicon octicon-file-directory hx_color-icon-directory'>\n    <path fill-rule='evenodd' d='M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3h-6.5a.25.25 0 01-.2-.1l-.9-1.2c-.33-.44-.85-.7-1.4-.7h-3.5z'></path>\n</svg>";
						s += "<tr><td>" + svg + "<a href='/" + ((is_file)?"blob":"tree") + "/?repo_id=" + repo_id + "&path=" + info[i].path + "&url=" + info[i].url + "'>" + f_name + "</a></td><td>     " + f_size + "</td><td>          " + f_sha + "</td></tr>";
						i++;
					};
					s += "</table>";
					document.querySelector("#content").innerHTML = s;
				}).catch(function(err){
					console.error(err);
					if (err.status == 403){
						//File is too large.
						var dat = location.href.substring(location.origin.length + 6);
						location.href = "/blob/" + dat;
					};
					document.querySelector("#workspace").innerHTML = "<font color=red>Failed to load data.</font><br><a href=# onclick=javascript:location.reload();>Reload</a>";
				});
			} else location.href = "/";
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
	
};
function open_github(){
	var path = "https://www.github.com/";
	var args = ParseURLArgs();
	path += JSON.parse(window.db["repos_" + args.repo_id]).fullname;
	path += "/tree/main/";
	path += args.path;
	window.open(path,"_blank");
};
function go_delete_dict(){
	var dat = location.href.substring(location.origin.length + 6);
	location.href = "/delete/" + dat;
};
function new_file(){
	var dat = location.href.substring(location.origin.length + 6);
	location.href = "/newfile/" + dat;
};