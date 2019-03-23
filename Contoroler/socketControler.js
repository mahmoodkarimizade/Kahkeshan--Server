////
////
////
var jsonfile = require('jsonfile'),
	mongoose = require('mongoose'),
	fs=require('fs');
	
var base64 = require('file-base64');
	
const SocketIOFile = require('socket.io-file');
	
	
 exports.SocketLogin= (function (socket){
	 
	 console.log("a user is login "+socket.id);
	 
	 socket.emit("userConnect",{connect:true});
	 
	 socket.on('disconnect',function()
	 {
		 console.log(socket.id+' is offline');
	 }); 
	 
	 
	 socket.on('uploadProfileImage',function(data){
		 
		var userdata=data;
		
		var date = new Date();
		var name="upi"+date.getFullYear()+date.getMonth()+date.getDate()+date.getHours()+date.getMinutes()+date.getSeconds();

		fs.writeFile(process.cwd() +'\\Data\\Users\\'+userdata.userid+'\\'+name+'.'+userdata.typeFileImage, userdata.encodedImage, 'binary', function(err, data) 
		{
			if (err) 
			{
				console.log('err', err);
				socket.emit("resUploadProfileImage",{status:false});
			}
			
			fs.exists(process.cwd() +'\\Data\\Users\\'+userdata.userid+'\\'+name+'.'+userdata.typeFileImage, function(exists) 
			{
				if (exists) 
				{
				  usermodel.update({_id:userdata.userid},{$set:{avatar:'Data/Users/'+userdata.userid+'/'+name+'.'+userdata.typeFileImage}},function(err)
				  {
			
						if(err)
						{
							console.log(err);
							socket.emit("resUploadProfileImage",{status:false});
						}
						console.log("Directory is created");
						socket.emit("resUploadProfileImage",{status:true,profileImage:'Data/Users/'+userdata.userid+'/'+name+'.'+userdata.typeFileImage});
					
					});
					
					fs.exists(process.cwd() +'\\Data\\Users\\'+userdata.userid+'\\'+userdata.profileImage, function(exists) 
					{
						if (exists) 
						{
							fs.unlink(process.cwd() +'\\Data\\Users\\'+userdata.userid+'\\'+userdata.profileImage);
							console.log("Old directory is deleted");
						}
					});
				}
				
			});
			
		});
		
	 });
	 
	 socket.on('userProfileInfo',function(data){
		 
		 //console.log(socket.id);
		 
		var userdata=data
		usermodel.findOne({_id:userdata},function(err,user){
			
			if(err)
			{
				console.log(err);
			}
			
			else if(user!=null)
			{
				
				socket.emit('resUserProfileInfo',{profileImage:user.avatar,username:user.username,biography:user.biography,link:user.link,countLibrary:user.library.length,countFavorites:user.favorites.length,countFollowing:user.following.length,countFollower:user.follower.length});
			}
			else
			{
				console.log("hamchin useri mojod nemibashad");
			}
			
		});
	 });
	 
	 
	socket.on('otherProfileInfo',function(data){
		 
		 console.log(data.userid);
		 
		 var flagMark=false;
		 
		var userdata=data
		usermodel.findOne({_id:userdata.userid},function(err,user){
			
			if(err)
			{
				console.log(err);
				socket.emit("resOtherProfileInfo",{status:false});
			}
			
			else if(user!=null)
			{
			usermodel.findOne({_id:userdata.userid,following:{$in:[userdata.useridSee]}},function(err,user1){
				
				if(err)
				{
					console.log(err);
				}
				else if(user1!=null)
				{
					flagMark=true;
				}
				else
				{
					flagMark=false;
				}
				
				socket.emit('resOtherProfileInfo',{status:true,profileImage:user.avatar,username:user.username,biography:user.biography,link:user.link,countLibrary:user.library.length,countFollowing:user.following.length,flagMark:flagMark,countFollower:user.follower.length});
				
			});
			}
			else
			{
				console.log("hamchin useri mojod nemibashad");
				socket.emit("resOtherProfileInfo",{status:false});
			}
			
		});
	 });
	 
	 
	 socket.on('updateUserProfileInfo',function(data){
		 
		var userdata=data;
		
		console.log(data.userid);
		
		usermodel.update({_id:userdata.userid},{$set:{biography:userdata.biography,link:userdata.link}},function(err){
			
			if(err)
			{
				console.log(err);
				socket.emit("resUpdateUserProfileInfo",{status:false});
			}
			
			socket.emit("resUpdateUserProfileInfo",{status:true,biography:userdata.biography,link:userdata.link});
		});
		
		
	 });
	 
	 socket.on('changePassword',function(data){
		 
		var userdata=data;
		
		usermodel.update({_id:userdata.userid},{$set:{password:userdata.newpassword}},function(err){
			
			if(err)
			{
				console.log(err);
				socket.emit("resChangePassword",{status:false});
			}
			
			socket.emit("resChangePassword",{status:true,password:userdata.newpassword});
		});
		
		
	 });
	 
	 
	 socket.on('loadMore',function(data){
		 
		 userdata=data;
		 var id=new Array();
		 var res=new Array();
		 //console.log(userdata);
		 
		 usermodel.findOne({_id:userdata.userid},function(err,user){
			 
			 if(err)
			 {
				 console.log(err);
				 socket.emit("resLoadMore",{status:false})
			 }
			 
			 switch(userdata.curentPage)
			 {
				 case "library":
				 id=user.library.slice(userdata.start,userdata.end+1);
				 break;
				 
				 case "favorites":
				 id=user.favorites.slice(userdata.start,userdata.end+1);
				 break;
				 
				 case "following":
				 id=user.following.slice(userdata.start,userdata.end+1);
				 break;
				 
				 case "follower":
				 id=user.follower.slice(userdata.start,userdata.end+1);
				 break;
				 
				 
			 }
			 //console.log(id);
			 
			 if(userdata.curentPage=="library"||userdata.curentPage=="favorites")
			 {
				 productmodel.find({_id:{$in:id}},function(err,product){
					 
					 if(err)
					 {
						console.log(err);
						socket.emit("resLoadMore",{status:false})
					 }
					 
					var productArray=new Array();
					
					for(var i=0;i<id.length;i++)
					{
						for(var j=0;j<product.length;j++)
						{
							if(id[i]==product[j]._id)
							{
								var productObject={_id:product[j]._id,userid:product[j].userid,image:product[j].image,block:product[j].block};
								productArray.push(productObject);
								break;
							}
						}
					}
					console.log(productArray.length);
				
					socket.emit("resLoadMore",{status:true,resProducts:productArray});
						
				});
				
			 }
			 else
			 {
				usermodel.find({_id:{$in:id}},function(err,user){
					
					if(err)
					 {
						console.log(err);
						socket.emit("resLoadMore",{status:false})
					 }
					
					var userArray=new Array();
					for(var i=0;i<user.length;i++)
					{
						var userObject={_id:user[i]._id,username:user[i].username,avatar:user[i].avatar,block:user[i].block};
						userArray.push(userObject);
					}
					
					console.log(userArray.length);
				
					socket.emit("resLoadMore",{status:true,resUsers:userArray});
					
				});
			 }
			 
			 
		 });
		 
	 });
	 
	 
	 socket.on('otherLoadMore',function(data){
		 
		 userdata=data;
		 var id=new Array();
		 var res=new Array();
		 
		 usermodel.findOne({_id:userdata.userid},function(err,user){
			 
			 if(err)
			 {
				 console.log(err);
				 socket.emit("resOtherLoadMore",{status:false})
			 }
			 
			 id=user.library.slice(userdata.start,userdata.end+1);
			 
			 productmodel.find({_id:{$in:id}},function(err,product){
					 
					if(err)
					{
						console.log(err);
						socket.emit("resOtherLoadMore",{status:false})
					}
					 
					var productArray=new Array();
					
					for(var i=0;i<id.length;i++)
					{
						for(var j=0;j<product.length;j++)
						{
							if(id[i]==product[j]._id)
							{
								var productObject={_id:product[j]._id,userid:product[j].userid,image:product[j].image,block:product[j].block};
								productArray.push(productObject);
								break;
							}
						}
					}
					console.log(productArray.length);
				
					socket.emit("resOtherLoadMore",{status:true,resProducts:productArray});
						
				});
			 
		 });
		 
		 
	 });
	 
	 
	 socket.on('markUser',function(data){
		 
		 var userdata=data;
		 
		 console.log(userdata.markStatus);
		 
		 
		 //mark
		 if(userdata.markStatus)
		 {
			 usermodel.update({_id:userdata.userId},{$push:{following:userdata.userIdMarker}},function(err){
				 if(err)
				 {
					 console.log(err);
					 socket.emit("resmMrkUser",{status:false});
				 }
				 
				 usermodel.update({_id:userdata.userIdMarker},{$push:{follower:userdata.userId}},function(err){
					 
					 if(err)
					 {
						console.log(err);
						socket.emit("resmMrkUser",{status:false}); 
					 }
					 
					 console.log("mark");
					 socket.emit("resmMrkUser",{status:true,mark:"mark"}); 
					 
				 });
			 });
		 }
		 //unmark
		 else
		 {
			 usermodel.update({_id:userdata.userId},{$pull:{following:userdata.userIdMarker}},function(err){
				 if(err)
				 {
					 console.log(err);
					 socket.emit("resmMrkUser",{status:false});
				 }
				 
				 usermodel.update({_id:userdata.userIdMarker},{$pull:{follower:userdata.userId}},function(err){
					 
					 if(err)
					 {
						console.log(err);
						socket.emit("resmMrkUser",{status:false}); 
					 }
					 
					 console.log("unmark");
					 socket.emit("resmMrkUser",{status:true,mark:"unmark"}); 
					 
				 });
			 });
		 }
	 });
	 
 });