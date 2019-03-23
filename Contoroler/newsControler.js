///
///
///
var jsonfile = require('jsonfile'),
	mongoose = require('mongoose');

	
/*creeate schema save
for save save data
*/
var newsschema=mongoose.Schema({
	userid:{type:String,default:""},
	subject:{type:String,default:""},
    description:{type:String,default:""},
	link:{type:String,default:""},
    created_at:{type: Date, default: Date.now },
	block:{type:String,default:"0"}
});
//define model users
global.newsmodel=mongoose.model('news',newsschema);

exports.SocketLogin= (function (socket){
	
	socket.on("createNews",function(data){
		
		var newsdata=data;
		
		var newNews=new newsmodel(
		{
			userid:newsdata.userid,
			subject:newsdata.subject,
			description:newsdata.description,
			link:newsdata.link,
			created_at:new Date()
			
		});
		
		//save kardane news jadid dar data base
		newNews.save(function(err,newnews)
		{
										
			if(err)
			{
				console.log('err', err);
				socket.emit("resCreateNews",{status:false});
			}
			
			console.log("new news is save in data base ");
			io.emit("resCreateNews",{status:true,resNews:newnews});
				
		});
		
	});
	
	socket.on("getLastNewsId",function(data){
		
		newsmodel.find({},function(err,news){
			
			if(err)
			{
				console.log(err);
				socket.emit("resGetLastNewsId",{status:false});
			}
			
			console.log(news.length);
			
			if(news.length!=0)
			{
				socket.emit("resGetLastNewsId",{status:true,lastNewsId:news[news.length-1]._id});
			}
			else
			{
				socket.emit("resGetLastNewsId",{status:true,lastNewsId:0});
			}
			
			
		});
		
	});
	
	socket.on("loadMoreNews",function(data)
	{
		var newsdata=data;
		var resNewsArray=new Array();
		
		if(newsdata.status=="0")
		{
			newsmodel.find({_id:{$lte:newsdata.newsId}},function(err,news)
			{
				if(err)
				{
					console.log(err);
					socket.emit("resLoadMoreNews",{status:false});
				}
				
				resNewsArray=news.slice(0,16);
				console.log(resNewsArray.length);
				socket.emit("resLoadMoreNews",{status:true,resNews:resNewsArray,newsLength:resNewsArray.length});	
				
			}).sort({_id:-1});
		}
		else
		{
			newsmodel.find({_id:{$lt:newsdata.newsId}},function(err,news)
			{
				if(err)
				{
					console.log(err);
					socket.emit("resLoadMoreNews",{status:false});
				}
				
				resNewsArray=news.slice(0,16);
				console.log(resNewsArray.length);
				socket.emit("resLoadMoreNews",{status:true,resNews:resNewsArray,newsLength:resNewsArray.length});	
				
			}).sort({_id:-1});
		}
		
		
	});
	
});