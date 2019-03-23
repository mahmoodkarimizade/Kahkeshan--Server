///
///
///
var jsonfile = require('jsonfile');


exports.SocketLogin= (function (socket){
	
	
	socket.on("libraryInfo",function(data){
		
		var userdata=data;
		
		usermodel.findOne({_id:userdata.userid},function(err,user){
			
			if(err)
			{
				console.log(err);
				socket.emit("resLibraryInfo",{status:false});
			}
			
			productmodel.find({},{_id:1},function(err,aproductid){
				
				if(err)
				{
					console.log(err);
					socket.emit("resLibraryInfo",{status:false});
				}
				
				productmodel.find({hashtag:{$in:user.history}},{_id:1},function(err,hproductid){
							
					if(err)
					{
						console.log(err);
						socket.emit("resLibraryInfo",{status:false});
					}
					
					var alllibrary=aproductid.slice(0,300);
					var hproductid=hproductid.slice(0,300);
					
					usermodel.update({_id:userdata.userid},{$set:{alllibrary:alllibrary}},function(err){
						
						if(err)
						{
							console.log(err);
							socket.emit("resLibraryInfo",{status:false});
						}
						usermodel.update({_id:userdata.userid},{$set:{historylibrary:hproductid}},function(err){
							
							if(err)
							{
								console.log(err);
								socket.emit("resLibraryInfo",{status:false});
							}
							
							socket.emit("resLibraryInfo",{status:true,countLibraryHistory:hproductid.length,countLibraryAll:alllibrary.length});
							
						});
						
					});	
							
				}).sort({rate:-1});
				
			}).sort({rate:-1});
		});
		
	});
	
	socket.on("loadMoreFragmentLibrary",function(data)
	{
		
		var userdata=data;
		
		usermodel.findOne({_id:userdata.userid},function(err,user){
			
			if(err)
			{
				console.log(err);
				socket.emit("resloadMoreFragmentLibrary",{status:false});
			}
			
			if(userdata.fromOf=="history")
			{
				var arrayId=user.historylibrary.slice(userdata.start,userdata.end+1);
				productmodel.find({_id:{$in:arrayId}},{_id:1,userid:1,image:1,block:1},function(err,product){
					
					if(err)
					{
						console.log(err);
						socket.emit("resloadMoreFragmentLibrary",{status:false});
					}
					
					console.log(product.length);
					
					socket.emit("resloadMoreFragmentLibrary",{status:true,resProducts:product,fromOf:"history"});
					
				}).sort({rate:-1});
			}
			else
			{
				var arrayId=user.alllibrary.slice(userdata.start,userdata.end+1);
				productmodel.find({_id:{$in:arrayId}},{_id:1,userid:1,image:1,block:1},function(err,product){
					
					if(err)
					{
						console.log(err);
						socket.emit("resloadMoreFragmentLibrary",{status:false});
					}
					
					console.log(product.length);
					
					socket.emit("resloadMoreFragmentLibrary",{status:true,resProducts:product,fromOf:"all"});
					
				}).sort({rate:-1});
			}
			
		});
		
	});
	
	
	socket.on("search",function(data)
	{
		var userdata=data;
		var arrayHashtag=new Array();
		var arrayHashtag=userdata.searchContent.split(" ");
		
		productmodel.find({$and:[{hashtag:{$in:arrayHashtag}},{block:"0"}]},{_id:1},function(err,product){
					
			if(err)
			{
				console.log(err);
				socket.emit("resSearch",{status:false});
			}
					
			console.log(product.length);
			
			if(product.length>=600)
			{
				var arrayProductId=product.slice(0,599);
			}
			
			else
			{
				var arrayProductId=product;
			}
					
			socket.emit("resSearch",{status:true,resProductsId:arrayProductId});
					
		}).sort({rate:-1});
	});
	
	socket.on("loadMoreSearch",function(data)
	{
		var userdata=data;
		
		productmodel.find({_id:{$in:userdata.productId}},function(err,product){
					
			if(err)
			{
				console.log(err);
				socket.emit("resLoadMoreSearch",{status:false});
			}
					
			console.log(product.length);
					
			socket.emit("resLoadMoreSearch",{status:true,resProducts:product});
					
		}).sort({rate:-1});
	});
	
	
});