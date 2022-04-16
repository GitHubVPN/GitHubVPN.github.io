/**
 * @Author          : lihugang
 * @Date            : 2022-04-12 13:01:25
 * @LastEditTime    : 2022-04-16 17:12:26
 * @LastEditors     : lihugang
 * @Description     : 
 * @FilePath        : c:\Servers\vpn\GitHubVPN.github.io\js\load\repo.js
 * @Copyright (c) lihugang
 * @长风破浪会有时 直挂云帆济沧海
 * @There will be times when the wind and waves break, and the sails will be hung straight to the sea.
 * @ * * * 
 * @是非成败转头空 青山依旧在 几度夕阳红
 * @Whether it's right or wrong, success or failure, it's all empty now, and it's all gone with the passage of time. The green hills of the year still exist, and the sun still rises and sets.
 */
rate_limit();
if (window.db.token){
	if (window.db.username)
		EL(function(){
			document.querySelector("#userinfo").innerHTML = "<b><a onclick=javascript:window.open('/settings/','_blank');><img id=avatar height=64px width=64px src=" + localStorage.avatar_url + "><br>" + window.db.username + "</a></b><br>------<br><button onclick=javascript:logout();>Logout</button><br><a href=/>Back</a>";
			
			if (window.db.repos) {
				var repo_id = location.search.substring(4); 
				var repo_data = window.db["repos_" + repo_id];
				if (typeof(repo_data) == "undefined") {
					document.querySelector("#workspace").innerHTML = "<font color=red>The project is not in the local database.</font><br><a href=# onclick=javascript:getrepodata(" + repo_id + ");>Fetch</a>";
					return -1;
				} else repo_data = JSON.parse(repo_data);
				document.querySelector("#workspace").innerHTML = "<b>" + repo_data.name + "</b><p id=tools style='text-align:right'><input type=button value='New File' onclick=javascript:new_file();><input type=button value='Upload files' onclick=javascript:go_upload_files();></p><hr>";
				getfile("repositories/" + repo_id + "/contents").then(function(res){
					console.log(res);
					var info = JSON.parse(res.response);
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
					document.querySelector("#workspace").innerHTML += s;
				}).catch(function(err){
					console.error(err);
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
function new_file(){
	var dat = location.href.substring(location.origin.length + 6);
	var args = ParseURLArgs();
	location.href = "/newfile/" + dat.split("?")[0] + "?repo_id=" + args.id + "&path=&url=https://api.github.com/repos/" + JSON.parse(window.db["repos_" + args.id]).fullname + "/contents/";
};
function go_upload_files(){
	var dat = location.href.substring(location.origin.length + 6);
	var args = ParseURLArgs();
	location.href = "/upload/" + dat.split("?")[0] + "?repo_id=" + args.id + "&path=&url=https://api.github.com/repos/" + JSON.parse(window.db["repos_" + args.id]).fullname + "/contents";
}