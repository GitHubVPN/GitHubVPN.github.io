function ParseURLArgs()
{
	var query = location.search;
	//得到URL中的参数
	var result = {};
	if (query == "" || query == "?")
	{
		//参数为空
		console.warn("The argvments in URL are null. ");
		return result;
	};
	query = query.substring(1);
	query = query.split("&");
	var i = 0;
	while (i < query.length)
	{
		var arr = query[i].split("=");
		//得到Key和Value
		if (arr.length < 2)
		{
			console.error("Connot parse the argvments in URL.");
			return result;
		};
		result[arr[0]] = arr[1];
		i++;
	};
	return result;
	
};
