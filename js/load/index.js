rate_limit();
if (window.db.token){
	if (window.db.username)
		EL(function(){
			document.querySelector("#userinfo").innerHTML = "<b><a onclick=javascript:window.open('/settings/','_blank');><img id=avatar height=64px width=64px src=" + localStorage.avatar_url + "><br>" + window.db.username + "</a></b><br>------<br><button onclick=javascript:logout();>Logout</button>";
			document.querySelector("#workspace").innerHTML = "Your repositories:<br><span id=repos></span>";
			if (window.db.repos){
				var repos = JSON.parse(window.db.repos);
				var i = 0;
				var str = "<ul>";
				while (i < repos.length){
					var is_private = repos[i].private;
					var repos_id = repos[i].id;
					var repos_name = repos[i].name;
					localStorage.setItem("repos_" + repos_id,JSON.stringify({name:repos_name,is_private:is_private,id:repos_id}));
					var color = (is_private)?"red":"green";
					str += "<li><font color=" + color + ">" + repos_id + " " + "<a onclick=javascript:location.href='/repo/?id=" + repos_id + "' target=_blank>" + repos_name + "</a></font></li>";
					i++;
				};
				str += "</ul>";
				document.querySelector("#repos").innerHTML = str;
			} else {
				getfile("users/" + window.db.username + "/repos").then(function(res){
					console.log(res);
					localStorage.repos = res.response;
					location.reload();
				}).catch(function(err){
					console.error(err);
					document.querySelector("#repos").innerHTML = "Failed to load data.<br><a href=# onclick=javascript:location.reload();>Reload</a>";
				});
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
