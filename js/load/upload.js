/**
 * @Author          : lihugang
 * @Date            : 2022-04-15 12:08:34
 * @LastEditTime    : 2022-04-16 17:02:11
 * @LastEditors     : lihugang
 * @Description     : 
 * @FilePath        : c:\Servers\vpn\GitHubVPN.github.io\js\load\upload.js
 * @Copyright (c) lihugang
 * @长风破浪会有时 直挂云帆济沧海
 * @There will be times when the wind and waves break, and the sails will be hung straight to the sea.
 * @ * * * 
 * @是非成败转头空 青山依旧在 几度夕阳红
 * @Whether it's right or wrong, success or failure, it's all empty now, and it's all gone with the passage of time. The green hills of the year still exist, and the sun still rises and sets.
 */

rate_limit();
if (window.db.token) {
	if (window.db.username)
		EL(function () {
			document.querySelector("#userinfo").innerHTML = "<b><a onclick=javascript:window.open('/settings/','_blank');><img id=avatar height=64px width=64px src=" + localStorage.avatar_url + "><br>" + window.db.username + "</a></b><br>------<br><button onclick=javascript:logout();>Logout</button><br><a href=# onclick=javascript:back();>Back</a>";

			if (window.db.repos) {
				var args = ParseURLArgs();
				console.log(args);
				var repo_id = args.repo_id;
				var repo_data = window.db["repos_" + repo_id];
				if (typeof (repo_data) == "undefined") {
					document.querySelector("#workspace").innerHTML = "<font color=red>The project is not in the local database.</font><br><a href=# onclick=javascript:getrepodata(" + repo_id + ");>Fetch</a>";
					return -1;
				} else repo_data = JSON.parse(repo_data);
				document.querySelector("#workspace").innerHTML = "<b>" + repo_data.name + "</b>/<a href=# onclick=javascript:ToMainBranch();>main</a>/<span id=path>" + args.path + "</span><hr><div id=content>Rendering.<br>Please wait a moment.</div>";
				buildPathLink();
				var req_url = args.url;
				req_url = req_url.substring(23).split("?")[0];
                document.querySelector("#content").innerHTML = "Please select files:<br><input type=file accept=* multiple id=upload_files_button><br><div id=filelist></div><br><button onclick=javascript:do_upload_files();>Confirm</button><button onclick=javascript:back();>Cancel</button>";
				window.filelist = [];
				document.querySelector("#upload_files_button").onchange = function(){
					var files = document.querySelector("#upload_files_button").files;
					for (var i = 0; i < files.length; i++){
						window.filelist.push(files[i]);
					};
					renderFileList();
				};

			} else location.href = "/";
		});
	else EL(function () {
		document.querySelector("#userinfo").innerHTML = "<button onclick=javascript:logout();>Logout</button>";
		getfile("user").then(function (res) {
			var dat = JSON.parse(res.response);
			console.log(res, dat);
			localStorage.username = dat.login;
			localStorage.userid = dat.id;
			localStorage.avatar_url = dat.avatar_url;
			location.reload();
		}).catch(function (err) {
			console.error(err);

			alert("Failed to load your user data.");
		});
	});
	;
} else {
	EL(function () {
		document.querySelector("#userinfo").innerHTML = "Please login first.";
		document.querySelector("#workspace").innerHTML = "<center><p style='font-size:1.5em'>GitHub VPN Login System<br>Please input your GitHub API Access Token<br><input type=text id=github_access_token placeholder=ghp_xxxxxxxx style='width:400px'></p><a href=/aritcle/how_to_ask_for_my_github_api_access_token.html target=_blank>How to ask for my GitHub API Access Token</a><br><button onclick=login();>Confirm</button></center>";
	});
};
function back() {
	if (ParseURLArgs().path == "") location.href = "/repo/?id=" + ParseURLArgs().repo_id;
	else location.href = "/tree/" + location.search;
};
function buildBackURL(args) {
	if (args.path.indexOf("/") == -1)
		return "/repo/?id=" + args.repo_id;
	else {
		var last_dict_position = args.path.lastIndexOf("/");
		var current_path = args.path.substring(0, last_dict_position);
		var cau = args.url.split("?")[0];
		var cau_ldp = cau.lastIndexOf("/");
		cau = cau.substring(0, cau_ldp);
		return { repo_id: args.repo_id, path: current_path, url: cau };
	};
};
function ToMainBranch() {
	var args = ParseURLArgs();
	location.href = "/repo/?id=" + args.repo_id;
};
function buildPathLink() {
	var path = document.querySelector("#path").innerHTML;
	path = path.split("/");
	var current_path = "";
	var str = "";
	var i = 0;
	while (i < path.length) {
		current_path += path[i] + "/";
		str += "<a class=path_link data-link=" + current_path.substring(current_path.length - 1, -1) + ">" + path[i] + "</a>/";
		i++;
	};
	document.querySelector("#path").innerHTML = str.substring(str.length - 1, -1);
	var eles = document.querySelectorAll(".path_link");
	i = eles.length - 1;
	var args = ParseURLArgs();
	while (i >= 0) {
		eles[i].href = "/tree/?repo_id=" + args.repo_id + "&path=" + args.path + "&url=" + args.url;
		args = buildBackURL(args);
		i--;
	};

};
function open_github() {
	var path = "https://www.github.com/";
	var args = ParseURLArgs();
	path += JSON.parse(window.db["repos_" + args.repo_id]).fullname;
	path += "/tree/main/";
	path += args.path;
	window.open(path, "_blank");
};
function go_delete_dict() {
	var dat = location.href.substring(location.origin.length + 6);
	location.href = "/delete/" + dat;
};
function new_file() {
	var dat = location.href.substring(location.origin.length + 6);
	location.href = "/newfile/" + dat;
};
function renderFileList() {
	var list = window.filelist || [];
	var s = "<table><tr><td>Filename</td><td>Size</td><td>UploadSize</td><td>Status</td><td>Operation</td>";
	for (var i = 0; i < list.length; i++){
		s += `<tr><td>${list[i].name}</td><td>${list[i].size}</td><td><span class=upload-group>Not uploaded</span></td><td><span class=upload-status>Not uploaded</span></td><td><span><button onclick=javascript:removeNode(${i});>Remove</button></span></td></tr>`;
	};
	s += "</table>";
	document.querySelector("#filelist").innerHTML = s;
};
function removeNode(i){
	window.filelist.splice(i,1);
	renderFileList();
};
function do_upload_files(){
	document.querySelectorAll("button").forEach(function(val,key){
		val.disabled = true;
	});
	document.querySelector("button").disabled = false;
	document.querySelectorAll(".upload-status").forEach(function(val){
		val.innerHTML = "Reading";
	});
	document.querySelector("#upload_files_button").disabled = true;
	var files = window.filelist;
	window.upload_status = [];
	for (var i = 0 ; i < files.length ; i++) {
		extendScope(function(i){
			window.upload_status[i] = 1;
			var reader = new FileReader();
			reader.readAsDataURL(files[i]);
			reader.onerror = function(){
				window.upload_status[i] = -1;
			};
			reader.onload = function(){
				window.upload_status[i] = 2;
				var dataurl = reader.result;
				document.querySelectorAll(".upload-status")[i].innerHTML = "Uploading";
				var content = dataurl.substring(dataurl.indexOf("base64,") + "base64,".length);
				getfile(ParseURLArgs().url.substring("https://api.github.com/".length) + "/" + files[i].name).then(function(res){
					var sha = JSON.parse(res.response).sha;
					return uploadFile(i,content,sha);
				}).catch(function(err){
					console.log(err);
					if (err.status == 404){
						return uploadFile(i,content,null);
					};
				});
			};

		},i);
	};
	var sti = setInterval(function(){
		var finish_tick = 0;
		var success_flag = true;
		for (var i = 0 ; i < window.upload_status.length; i++){
			if (window.upload_status[i] == 200) finish_tick++;
			if (window.upload_status[i] == -1) {
				success_flag = false;
				finish_tick++;
				document.querySelectorAll(".upload-status")[i].innerHTML = "Cannot read the file";
			};
			if (window.upload_status[i] == -2) {
				success_flag = false;
				finish_tick++;
				document.querySelectorAll(".upload-status")[i].innerHTML = "Cannot upload the file";
			};
		};
		console.log(finish_tick,success_flag,window.filelist.length);
		if (finish_tick == window.filelist.length) { 
			clearInterval(sti);
			if (success_flag) {
				//Upload successfully
				back();
			} else {
				alert("Failed to upload the file. (Partial succeeded)");
			};
		};
	},500);
};
function extendScope(func,...args){
	return func(...args);
};
function uploadFile(index,content,sha) {
	if (window.XMLHttpRequest) var xhr = new XMLHttpRequest();
	else var xhr = new ActiveXObject("Microsoft.XMLHTTP");
	xhr.open("PUT",`${ParseURLArgs().url}/${window.filelist[index].name}`.replace("//","/"));
	xhr.setRequestHeader("Authorization", "token " + window.db.token);
	xhr.onerror = function(){ 
		window.upload_status[index] = -2;
	};
	xhr.upload.onprogress = function(evt){
		document.querySelectorAll(".upload-group")[index].innerHTML = evt.loaded;
	};
	xhr.onload = function(){
		if (xhr.status >= 200 && xhr.status < 400){
			document.querySelectorAll(".upload-group")[index].innerHTML = window.filelist[index].size;
			document.querySelectorAll(".upload-status")[index].innerHTML = "Uploaded";
			window.upload_status[index] = 200;
		} else window.upload_status[index] = -2;
	};
	xhr.onreadystatechange = function(){
		if (xhr.readyState == 4){
			if (xhr.status >= 200 && xhr.status < 400){
				document.querySelectorAll(".upload-group")[index].innerHTML = window.filelist[index].size;
				document.querySelectorAll(".upload-status")[index].innerHTML = "Uploaded";
				window.upload_status[index] = 200;
			} else window.upload_status[index] = -2;			
		} else console.log(xhr.readyState);
	}
	xhr.send(JSON.stringify({message:"Upload file (GitHubVPN API)",content:content,sha:sha}));
	

};