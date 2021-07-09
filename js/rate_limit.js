function rate_limit(){
	if (!window.db.token){
		return null;	
	};
	getfile("rate_limit").then(function(res){
		var dat = JSON.parse(res.response);
		console.log(res,dat);
		document.querySelector("#rate_limit").innerHTML = "<details><summary>Remaining API request number:" + dat.rate.remaining + "</summary>Remaining Restful API request number:" + dat.resources.core.remaining + "<br>Remaining search API request number:" + dat.resources.search.remaining + "<br>Remaining GraphQL API request number:" + dat.resources.graphql.remaining + "</details>";
	}).catch(function(err){
		console.log(err);
		document.querySelector("#rate_limit").innerHTML = "<details><summary>Failed to load data.</summary>" + err.response + "</details>";
	});
};