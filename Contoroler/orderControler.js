///
///
///
var jsonfile = require('jsonfile'),
	mongoose = require('mongoose'),
	fs=require('fs');
	
	
	
/*creeate schema order
for save order data
*/
var orderschema=mongoose.Schema({
	userid:{type:String,default:""},
	typeorder:{type:String,default:""},
    description:{type:String,default:""},
    created_at:{type: Date, default: Date.now },
	verifiedcode:{type:String,defult:""},
	verifiedtype:{type:Boolean,defult:false},
	price:{type:String,default:""},
	status:{type:String,defult:"false"}
});
//define model users
global.ordermodel=mongoose.model('order',orderschema);


exports.SocketLogin= (function (socket){
	
	
	socket.on("createOrder",function(data){
		
		orderdata=data;
		
		var newOrder=new ordermodel({
			userid:orderdata.userid,
			typeorder:orderdata.typeOrder,
			description:orderdata.description,
			created_at:new Date(),
			verifiedcode:"5454",
			price:"5000",
			verifiedtype:false
			
		});
		
		//save new order in data base
		newOrder.save(function(err,newOrder)
		{
										
			if(err)
			{
				console.log('err', err);
				socket.emit("resCreateOrder",{status:false});
			}
			
			console.log("new Order save in data base");
			socket.emit("resCreateOrder",{status:true,orderid:newOrder._id,verifiedcode:newOrder.verifiedcode});
		});
		
	});
	
	
	
	socket.on("verifiedNewOrder",function(data){
		
		var orderdata=data;
		
		ordermodel.findOne({_id:orderdata.orderid},function(err,order){
			
			if(err)
			{
				console.log('err', err);
				socket.emit("resVerifiedNewOrder",{status:false});
			}
			
			else if(order==null)
			{
				console.log("hamchin order vojod nadarad");
				socket.emit("resVerifiedNewOrder",{status:false});
			}
			else
			{
				if(order.verifiedcode==orderdata.verifiedcode)
				{
					ordermodel.update({_id:orderdata.orderid},{$set:{verifiedtype:true}},function(err){
						
						if(err)
						{
							console.log(err);
							socket.emit("resVerifiedNewOrder",{status:false});
						}
						
						usermodel.update({_id:order.userid},{$push:{order:order._id}},function(err){
							
							if(err)
							{
								console.log(err);
								socket.emit("resVerifiedNewOrder",{status:false});
							}
							
							console.log("Verified New Order");
							socket.emit("resVerifiedNewOrder",{status:true});
							
						});
					});
				}
				else
				{
					console.log("code vared shode eshtebah ast");
					socket.emit("resVerifiedNewOrder",{status:false,description:"کد وارد شده اشتباه است"});
				}
			}
			
		});
		
	});
	
	
	socket.on("removeOrder",function(data){
		
		orderdata=data;
		
		ordermodel.deleteOne({_id:orderdata},function(err,order){
			
			if(err)
			{
				console.log(err);
			}
			
			console.log("delete order: "+orderdata);
		});
		
	});
	
	socket.on("orderInfo",function(data){
		
		var userdata=data;
		
		usermodel.findOne({_id:userdata},function(err,user){
			
			if(err)
			{
				console.log(err);
				socket.emit("resOrderInfo",{status:false});
			}
			
			socket.emit("resOrderInfo",{status:true,orderlength:user.order.length});
			
		});
		
	});
	
	socket.on('loadMoreOrder',function(data)
	{
		
		userdata=data;
		 var id=new Array();
		 var res=new Array();
		 
		 usermodel.findOne({_id:userdata.userid},function(err,user){
			 
			 if(err)
			 {
				 console.log(err);
				 socket.emit("resLoadMoreOrder",{status:false})
			 }
			 
			 id=user.order.slice(userdata.start,userdata.end+1);
			 
			 ordermodel.find({_id:{$in:id}},function(err,order){
					 
					if(err)
					{
						console.log(err);
						socket.emit("resLoadMoreOrder",{status:false})
					}
					 
					var orderArray=new Array();
					
					for(var i=0;i<id.length;i++)
					{
						for(var j=0;j<order.length;j++)
						{
							if(id[i]==order[j]._id)
							{
								var orderObject={_id:order[j]._id,userid:order[j].userid,username:user.username,avatar:user.avatar,typeorder:order[j].typeorder,description:order[j].description,created_at:order[j].created_at};
								orderArray.push(orderObject);
								break;
							}
						}
					}
					
					console.log(orderArray.length);
					socket.emit("resLoadMoreOrder",{status:true,resOrder:orderArray});
						
				});
			 
		 });
		
	});
	
	
});