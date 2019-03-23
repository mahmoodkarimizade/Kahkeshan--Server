///
///
///
var jsonfile = require('jsonfile'),
	mongoose = require('mongoose'),
	fs=require('fs')
	convertString=require('convert-string');
	
var base64 = require('file-base64');


/*creeate schema product
for save product data
*/
//username:{type:String,required: true, unique: true},
var productschema=mongoose.Schema({
	userid:{type:String,default:""},
	image:{type:String,default:""},
    description:{type:String,default:""},
	pathfile:{type:String,default:""},
    created_at:{type: Date, default: Date.now },
    like:[String],
	see:[String],
	hashtag:[],
	rate:{type:Number},
	price:{type:String,default:"0"},
	block:{type:String,default:"0"}
});
//define model users
global.productmodel=mongoose.model('product',productschema);

exports.SocketLogin= (function (socket){
	
	socket.on("createProduct",function(data){
		
		var productdata=data;
		var date = new Date();
		var foldername="fpdt"+date.getFullYear()+date.getMonth()+date.getDate()+date.getHours()+date.getMinutes()+date.getSeconds();
		var productnamei="pdti"+date.getFullYear()+date.getMonth()+date.getDate()+date.getHours()+date.getMinutes()+date.getSeconds();
		var productnamef="pdtf"+date.getFullYear()+date.getMonth()+date.getDate()+date.getHours()+date.getMinutes()+date.getSeconds();
		
		var hashtagList=productdata.hashtag.split(",");
		
		
		fs.mkdir(process.cwd() +'\\Data\\Products\\'+foldername,function(err)
		{
			
			if(err)
			{
				console.log('err', err);
				socket.emit("resCreateProduct",{status:false});
			}
			console.log('folder created..');
			fs.writeFile(process.cwd() +'\\Data\\Products\\'+foldername+'\\'+productnamei+'.'+productdata.typeFileImage, productdata.encodedImage, 'binary', function(err, data) 
			{
				if (err) 
				{
					console.log('err', err);
					socket.emit("resCreateProduct",{status:false});
				}
				
				fs.exists(process.cwd() +'\\Data\\Products\\'+foldername+'\\'+productnamei+'.'+productdata.typeFileImage, function(exists) 
				{
					if(exists)
					{
					
						fs.writeFile(process.cwd() +'\\Data\\Products\\'+foldername+'\\'+productnamef+'.'+productdata.typeFileDocument, productdata.encodedFile, 'binary', function(err, data) 
						{
							if (err) 
							{
								console.log('err', err);
								socket.emit("resCreateProduct",{status:false});
							}
							
							fs.exists(process.cwd() +'\\Data\\Products\\'+foldername+'\\'+productnamef+'.'+productdata.typeFileDocument, function(exists) 
							{
								if(exists)
								{
									console.log("file is uplodid")
									
									var newProduct=new productmodel({
										userid:productdata.userid,
										image:'Data/Products/'+foldername+'/'+productnamei+'.'+productdata.typeFileImage,
										pathfile:'Data/Products/'+foldername+'/'+productnamef+'.'+productdata.typeFileDocument,
										created_at:new Date(),
										description:productdata.description,
										hashtag:hashtagList,
										rate:0
									});
									
									//save kardane product jadid dar data base
									newProduct.save(function(err,newproduct)
									{
										
										if(err)
										{
											console.log('err', err);
											socket.emit("resCreateProduct",{status:false});
										}
										
										console.log("new product is save in data base ");
										
										usermodel.update({_id:productdata.userid},{$push:{library:newproduct._id}},function(err){
											
											if(err)
											{
												console.log('err', err);
												socket.emit("resCreateProduct",{status:false});
											}
											console.log("new product id is save in data base user ");
											socket.emit("resCreateProduct",{status:true});
											
										});

									});
									
								}
							});
							
						});
					}
				});
				
			});
		});
		
	});
	
	
	socket.on("likeProduct",function(data){
		
		var productdata=data;
		
		
		//like
		if(productdata.likestatus)
		{
			productmodel.update({_id:productdata.productid},{$push:{like:productdata.userid}},function(err){
			
				if(err)
				{
					console.log(err);
					socket.emit("resLikeProduct",{status:false});
				}
				
				productmodel.update({_id:productdata.productid},{$inc:{rate:.2}},function(err){
					
					if(err)
					{
						console.log(err);
						socket.emit("resLikeProduct",{status:false});
					}
					
					console.log("product rate like increment");
					
					usermodel.update({_id:productdata.userid},{$push:{favorites:productdata.productid}},function(err){
					
						if(err)
						{
							console.log(err);
							socket.emit("resLikeProduct",{status:false});
						}
						console.log("like");
						
						socket.emit("resLikeProduct",{status:true,like:"like"});
					});
					
				});
			
			});
			
			//push to history user product id
			productmodel.findOne({_id:productdata.productid},function(err,product){
				
				if(err)
				{
					console.log(err)
				}
				else
				{
					var randomList=getRandomNumber(product.hashtag.length);
					var historyList=new Array(product.hashtag[randomList[0]],product.hashtag[randomList[1]],product.hashtag[randomList[2]]);
					usermodel.update({_id:productdata.userid},{$pull:{history:{$in:historyList}}},function(err){
									
						if(err)
						{
							console.log(err);
						}
						else
						{
							usermodel.update({_id:productdata.userid},{$push:{history:{$each:historyList}}},function(err){
								
								if(err)
								{
									console.log(err);
								}
								else
								{
									usermodel.findOne({_id:productdata.userid},function(err,user){
										
										if(err)
										{
											console.log(err);
										}
										else
										{
											for(var i=user.history.length;i>300;i--)
											{
												usermodel.update({_id:productdata.userid},{$pop:-1},function(err){
																
													if(err)
													{
																	console.log(err);
													}
													console.log("for is working");
												});
											}
											console.log("push to history user product hashtag");
										}
										
									});
								}
							});
						}
									
					});
				}
			});
		}
		//unlike
		else
		{
			productmodel.update({_id:productdata.productid},{$pull:{like:productdata.userid}},function(err){
			
				if(err)
				{
					console.log(err);
					socket.emit("resLikeProduct",{status:false});
				}
				
				productmodel.update({_id:productdata.productid},{$inc:{rate:-.2}},function(err){
					
					if(err)
					{
						console.log(err);
						socket.emit("resLikeProduct",{status:false});
					}
					
					console.log("product rate unlike decrement");
					
					usermodel.update({_id:productdata.userid},{$pull:{favorites:productdata.productid}},function(err){
					
						if(err)
						{
							console.log(err);
							socket.emit("resLikeProduct",{status:false});
						}
						
						console.log("unlike");
						socket.emit("resLikeProduct",{status:true,like:"unlike"});
					});
					
				});
			
			});
			
			//pull to history user product id
			productmodel.findOne({_id:productdata.productid},function(err,product){
				
				if(err)
				{
					console.log(err)
				}
				else
				{
					var randomList=getRandomNumber(product.hashtag.length);
					var historyList=new Array(product.hashtag[randomList[0]],product.hashtag[randomList[1]],product.hashtag[randomList[2]]);
					usermodel.update({_id:productdata.userid},{$pull:{history:{$in:historyList}}},function(err){
									
						if(err)
						{
							console.log(err);
						}
						else
						{
							console.log("pull to history user product hashtag");
						}
									
					});
				}
			});
		}
		
	});
	
	

	socket.on('seeProduct',function(data){
		 
		var productdata=data;
		var flagLike=false;
		
		var date=new Date();
		var date1=date.getFullYear()+date.getMonth()+date.getDate()+date.getHours()+date.getMinutes()+date.getSeconds();
		var date2=0;
		var dateRate=0;
		
		console.log(productdata.productid);
		 
		productmodel.findOne({_id:productdata.productid},function(err,product){

			date2=product.created_at.getFullYear()+product.created_at.getMonth()+product.created_at.getDate()+product.created_at.getHours()+product.created_at.getMinutes()+product.created_at.getSeconds();
			 
			if(err)
			{
				socket.emit("resSeeProduct",{status:false});
			}
			 
			 usermodel.findOne({_id:productdata.userid},function(err,user){
				 
				 if(err)
				 {
					 socket.emit("resSeeProduct",{status:false});
				 }
				 
				 productmodel.findOne({_id:productdata.productid,like:{$in:[productdata.useridSee]}},function(err,product1){
					 
					 if(err)
					 {
						 socket.emit("resSeeProduct",{status:false});
					 }
					 else if(product1==null)
					 {
						 flagLike=false;
					 }
					 else
					 {
						 flagLike=true;
					 }
					 
					 var hashtag=product.hashtag.join(" ");
					 socket.emit("resSeeProduct",{status:true,avatar:user.avatar,description:product.description,hashtag:hashtag,pathfile:product.pathfile,created_at:product.created_at,countLike:product.like.length,flagLike:flagLike,price:product.price});
					 
				 });
				 
			 });
			 
		});
		
		//see prouct or no by user
		productmodel.findOne({_id:productdata.productid,see:{$in:[productdata.useridSee]}},function(err,product){
			
			if(err)
			{
				console.log(err)
			}
			else if(product==null)
			{
				
				dateRate=(1/(date1-date2))*.4;
				var rate=dateRate+.1;
				
				productmodel.update({_id:productdata.productid},{$inc:{rate:rate}},function(err){
					
					if(err)
					{
						console.log(err);
					}
					
					productmodel.update({_id:productdata.productid},{$push:{see:productdata.useridSee}},function(err){
						
						if(err)
						{
							console.log(err);
						}
						
						console.log("increment rate (see,date)");
						
						productmodel.findOne({_id:productdata.productid},function(err,product){
							
							if(err)
							{
								console.log(err);
							}
							
							var randomList=getRandomNumber(product.hashtag.length);
							var historyList=new Array(product.hashtag[randomList[0]],product.hashtag[randomList[1]],product.hashtag[randomList[2]]);
							usermodel.update({_id:productdata.useridSee},{$pull:{history:{$in:historyList}}},function(err){
							
								if(err)
								{
									console.log(err);
								}
								usermodel.update({_id:productdata.useridSee},{$push:{history:{$each:historyList}}},function(err){
									
									if(err)
									{
										console.log(err);
									}
									
									usermodel.find({_id:productdata.useridSee},function(err,user){
									
										if(err)
										{
											console.log(err);
										}
										
										for(var i=user[0].history.length;i>300;i--)
										{
											usermodel.update({_id:productdata.useridSee},{$pop:-1},function(err){
												
												if(err)
												{
													console.log(err);
												}
												console.log("for is working");
											});
										}
										
										console.log("hashtag product to user history");
										
									});

								});
							
							});

						});

					});
					
				});
			}
			
		});
		
	});
	
	
	
	socket.on("editProduct",function(data){
		
		var productdata=data;
		
		
		var oldfoldername;
		var oldproductnamei;
		var oldproductnamef;
		var arrayproductnamei=new Array();
		var arrayproductnamef=new Array();
		var date = new Date();
		var productnamei="pdti"+date.getFullYear()+date.getMonth()+date.getDate()+date.getHours()+date.getMinutes()+date.getSeconds();
		var productnamef="pdtf"+date.getFullYear()+date.getMonth()+date.getDate()+date.getHours()+date.getMinutes()+date.getSeconds();
		
		if(productdata.encodedImage.length!=0&&productdata.encodedFile.length!=0&&productdata.description!=""&&productdata.hashtag!="")
		{
			var hashtagList=productdata.hashtag.split(",");
			
			productmodel.findOne({_id:productdata.productid},function(err,product){
				
				arrayproductnamei=product.image.split("/");
				arrayproductnamef=product.pathfile.split("/");
				oldfoldername=arrayproductnamei[2];
				oldproductnamei=arrayproductnamei[3];
				oldproductnamef=arrayproductnamef[3];
				
				fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername, function(exists)
				{
					if(exists)
					{
						console.log('folder exist..');
						fs.writeFile(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamei+'.'+productdata.typeFileImage, productdata.encodedImage, 'binary', function(err, data){
							
							if (err) 
							{
								console.log('err', err);
								socket.emit("resEditProduct",{status:false});
							}
							
							fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamei+'.'+productdata.typeFileImage, function(exists) 
							{
								if(exists)
								{
								
									fs.writeFile(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamef+'.'+productdata.typeFileDocument, productdata.encodedFile, 'binary', function(err, data) 
									{
										if (err) 
										{
											console.log('err', err);
											socket.emit("resEditProduct",{status:false});
										}
										
										fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamef+'.'+productdata.typeFileDocument, function(exists) 
										{
											if(exists)
											{
												productmodel.update({_id:productdata.productid},{$set:{image:'Data/Products/'+oldfoldername+'/'+productnamei+'.'+productdata.typeFileImage,pathfile:'Data/Products/'+oldfoldername+'/'+productnamef+'.'+productdata.typeFileDocument,description:productdata.description,hashtag:hashtagList}},function(err){
													
													if(err)
													{
														console.log('err', err);
														socket.emit("resEditProduct",{status:false});
													}
													
													console.log("product file and image and description and hashtag updated");
													
													fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamei, function(exists) 
													{
														if (exists) 
														{
															fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamef, function(exists) 
															{
																if (exists) 
																{
																	fs.unlink(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamei);
																	fs.unlink(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamef);
																	console.log("Old image and file drectory is deleted");
																	socket.emit("resEditProduct",{status:true});
																}
															});
														}
													});
												});
											}
										});
									});
								}
							});
							
						}); 
					}
				});	
			});
		}
		
		else if(productdata.encodedImage.length!=0&&productdata.encodedFile.length!=0&&productdata.hashtag!="")
		{
			var hashtagList=productdata.hashtag.split(",");
			
			productmodel.findOne({_id:productdata.productid},function(err,product){
				
				arrayproductnamei=product.image.split("/");
				arrayproductnamef=product.pathfile.split("/");
				oldfoldername=arrayproductnamei[2];
				oldproductnamei=arrayproductnamei[3];
				oldproductnamef=arrayproductnamef[3];
				
				fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername, function(exists)
				{
					if(exists)
					{
						console.log('folder exist..');
						fs.writeFile(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamei+'.'+productdata.typeFileImage, productdata.encodedImage, 'binary', function(err, data){
							
							if (err) 
							{
								console.log('err', err);
								socket.emit("resEditProduct",{status:false});
							}
							
							fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamei+'.'+productdata.typeFileImage, function(exists) 
							{
								if(exists)
								{
								
									fs.writeFile(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamef+'.'+productdata.typeFileDocument, productdata.encodedFile, 'binary', function(err, data) 
									{
										if (err) 
										{
											console.log('err', err);
											socket.emit("resEditProduct",{status:false});
										}
										
										fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamef+'.'+productdata.typeFileDocument, function(exists) 
										{
											if(exists)
											{
												productmodel.update({_id:productdata.productid},{$set:{image:'Data/Products/'+oldfoldername+'/'+productnamei+'.'+productdata.typeFileImage,pathfile:'Data/Products/'+oldfoldername+'/'+productnamef+'.'+productdata.typeFileDocument,hashtag:hashtagList}},function(err){
													
													if(err)
													{
														console.log('err', err);
														socket.emit("resEditProduct",{status:false});
													}
													
													console.log("product file and image and hashtag updated");
													
													fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamei, function(exists) 
													{
														if (exists) 
														{
															fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamef, function(exists) 
															{
																if (exists) 
																{
																	fs.unlink(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamei);
																	fs.unlink(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamef);
																	console.log("Old image and file drectory is deleted");
																	socket.emit("resEditProduct",{status:true});
																}
															});
														}
													});
												});
											}
										});
									});
								}
							});
							
						}); 
					}
				});	
			});
		}
		
		else if(productdata.encodedImage.length!=0&&productdata.encodedFile.length!=0&&productdata.description!="")
		{
			productmodel.findOne({_id:productdata.productid},function(err,product){
				
				arrayproductnamei=product.image.split("/");
				arrayproductnamef=product.pathfile.split("/");
				oldfoldername=arrayproductnamei[2];
				oldproductnamei=arrayproductnamei[3];
				oldproductnamef=arrayproductnamef[3];
				
				fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername, function(exists)
				{
					if(exists)
					{
						console.log('folder exist..');
						fs.writeFile(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamei+'.'+productdata.typeFileImage, productdata.encodedImage, 'binary', function(err, data){
							
							if (err) 
							{
								console.log('err', err);
								socket.emit("resEditProduct",{status:false});
							}
							
							fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamei+'.'+productdata.typeFileImage, function(exists) 
							{
								if(exists)
								{
								
									fs.writeFile(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamef+'.'+productdata.typeFileDocument, productdata.encodedFile, 'binary', function(err, data) 
									{
										if (err) 
										{
											console.log('err', err);
											socket.emit("resEditProduct",{status:false});
										}
										
										fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamef+'.'+productdata.typeFileDocument, function(exists) 
										{
											if(exists)
											{
												productmodel.update({_id:productdata.productid},{$set:{image:'Data/Products/'+oldfoldername+'/'+productnamei+'.'+productdata.typeFileImage,pathfile:'Data/Products/'+oldfoldername+'/'+productnamef+'.'+productdata.typeFileDocument,description:productdata.description}},function(err){
													
													if(err)
													{
														console.log('err', err);
														socket.emit("resEditProduct",{status:false});
													}
													
													console.log("product file and image and description updated");
													
													fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamei, function(exists) 
													{
														if (exists) 
														{
															fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamef, function(exists) 
															{
																if (exists) 
																{
																	fs.unlink(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamei);
																	fs.unlink(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamef);
																	console.log("Old image and file drectory is deleted");
																	socket.emit("resEditProduct",{status:true});
																}
															});
														}
													});
												});
											}
										});
									});
								}
							});
							
						}); 
					}
				});	
			});
		}
		
		else if(productdata.encodedImage.length!=0&&productdata.description!=""&&productdata.hashtag!="")
		{
			var hashtagList=productdata.hashtag.split(",");
			productmodel.findOne({_id:productdata.productid},function(err,product){
				
				arrayproductnamei=product.image.split("/");
				oldfoldername=arrayproductnamei[2];
				oldproductnamei=arrayproductnamei[3];
				
				fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername, function(exists)
				{
					if(exists)
					{
						console.log('folder exist..');
						fs.writeFile(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamei+'.'+productdata.typeFileImage, productdata.encodedImage, 'binary', function(err, data){
							
							if (err) 
							{
								console.log('err', err);
								socket.emit("resEditProduct",{status:false});
							}
							
							fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamei+'.'+productdata.typeFileImage, function(exists) 
							{
								if(exists)
								{
								
									productmodel.update({_id:productdata.productid},{$set:{image:'Data/Products/'+oldfoldername+'/'+productnamei+'.'+productdata.typeFileImage,description:productdata.description,hashtag:hashtagList}},function(err)
									{
													
										if(err)
											{
												console.log('err', err);
												socket.emit("resEditProduct",{status:false});
											}
													
											console.log("product image and description and hashtag updated");
													
											fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamei, function(exists) 
											{
												if (exists) 
												{
													fs.unlink(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamei);
													console.log("Old image drectory is deleted");
													socket.emit("resEditProduct",{status:true});
												}
											});
									});
								}
							});
							
						}); 
					}
				});	
			});
		}
		
		else if(productdata.encodedFile.length!=0&&productdata.description!=""&&productdata.hashtag!="")
		{
			var hashtagList=productdata.hashtag.split(",");
			productmodel.findOne({_id:productdata.productid},function(err,product){
				
				arrayproductnamef=product.pathfile.split("/");
				oldfoldername=arrayproductnamef[2];
				oldproductnamef=arrayproductnamef[3];
				
				fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername, function(exists)
				{
					if(exists)
					{
						console.log('folder exist..');
						fs.writeFile(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamef+'.'+productdata.typeFileDocument, productdata.encodedFile, 'binary', function(err, data){
							
							if (err) 
							{
								console.log('err', err);
								socket.emit("resEditProduct",{status:false});
							}
							
							fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamef+'.'+productdata.typeFileDocument, function(exists) 
							{
								if(exists)
								{
								
									productmodel.update({_id:productdata.productid},{$set:{pathfile:'Data/Products/'+oldfoldername+'/'+productnamef+'.'+productdata.typeFileDocument,description:productdata.description,hashtag:hashtagList}},function(err)
									{
													
										if(err)
											{
												console.log('err', err);
												socket.emit("resEditProduct",{status:false});
											}
													
											console.log("product  file and description and hashtag updated");
													
											fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamef, function(exists) 
											{
												if (exists) 
												{
													fs.unlink(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamef);
													console.log("Old file drectory is deleted");
													socket.emit("resEditProduct",{status:true});
												}
											});
									});
								}
							});
							
						}); 
					}
				});	
			});
		}
		
		else if(productdata.encodedImage.length!=0&&productdata.encodedFile.length!=0)
		{
			productmodel.findOne({_id:productdata.productid},function(err,product){
				
				arrayproductnamei=product.image.split("/");
				arrayproductnamef=product.pathfile.split("/");
				oldfoldername=arrayproductnamei[2];
				oldproductnamei=arrayproductnamei[3];
				oldproductnamef=arrayproductnamef[3];
				
				fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername, function(exists)
				{
					if(exists)
					{
						console.log('folder exist..');
						fs.writeFile(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamei+'.'+productdata.typeFileImage, productdata.encodedImage, 'binary', function(err, data){
							
							if (err) 
							{
								console.log('err', err);
								socket.emit("resEditProduct",{status:false});
							}
							
							fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamei+'.'+productdata.typeFileImage, function(exists) 
							{
								if(exists)
								{
								
									fs.writeFile(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamef+'.'+productdata.typeFileDocument, productdata.encodedFile, 'binary', function(err, data) 
									{
										if (err) 
										{
											console.log('err', err);
											socket.emit("resEditProduct",{status:false});
										}
										
										fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamef+'.'+productdata.typeFileDocument, function(exists) 
										{
											if(exists)
											{
												productmodel.update({_id:productdata.productid},{$set:{image:'Data/Products/'+oldfoldername+'/'+productnamei+'.'+productdata.typeFileImage,pathfile:'Data/Products/'+oldfoldername+'/'+productnamef+'.'+productdata.typeFileDocument}},function(err){
													
													if(err)
													{
														console.log('err', err);
														socket.emit("resEditProduct",{status:false});
													}
													
													console.log("product file and image updated");
													
													fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamei, function(exists) 
													{
														if (exists) 
														{
															fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamef, function(exists) 
															{
																if (exists) 
																{
																	fs.unlink(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamei);
																	fs.unlink(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamef);
																	console.log("Old image and file drectory is deleted");
																	socket.emit("resEditProduct",{status:true});
																}
															});
														}
													});
												});
											}
										});
									});
								}
							});
							
						}); 
					}
				});	
			});
		}
		else if(productdata.encodedImage.length!=0&&productdata.description!="")
		{
			productmodel.findOne({_id:productdata.productid},function(err,product){
				
				arrayproductnamei=product.image.split("/");
				oldfoldername=arrayproductnamei[2];
				oldproductnamei=arrayproductnamei[3];
				
				fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername, function(exists)
				{
					if(exists)
					{
						console.log('folder exist..');
						fs.writeFile(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamei+'.'+productdata.typeFileImage, productdata.encodedImage, 'binary', function(err, data){
							
							if (err) 
							{
								console.log('err', err);
								socket.emit("resEditProduct",{status:false});
							}
							
							fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamei+'.'+productdata.typeFileImage, function(exists) 
							{
								if(exists)
								{
								
									productmodel.update({_id:productdata.productid},{$set:{image:'Data/Products/'+oldfoldername+'/'+productnamei+'.'+productdata.typeFileImage,description:productdata.description}},function(err)
									{
													
										if(err)
											{
												console.log('err', err);
												socket.emit("resEditProduct",{status:false});
											}
													
											console.log("product image and description updated");
													
											fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamei, function(exists) 
											{
												if (exists) 
												{
													fs.unlink(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamei);
													console.log("Old image drectory is deleted");
													socket.emit("resEditProduct",{status:true});
												}
											});
									});
								}
							});
							
						}); 
					}
				});	
			});
		}
		else if(productdata.encodedFile.length!=0&&productdata.description!="")
		{
			productmodel.findOne({_id:productdata.productid},function(err,product){
				
				arrayproductnamef=product.pathfile.split("/");
				oldfoldername=arrayproductnamef[2];
				oldproductnamef=arrayproductnamef[3];
				
				fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername, function(exists)
				{
					if(exists)
					{
						console.log('folder exist..');
						fs.writeFile(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamef+'.'+productdata.typeFileDocument, productdata.encodedFile, 'binary', function(err, data){
							
							if (err) 
							{
								console.log('err', err);
								socket.emit("resEditProduct",{status:false});
							}
							
							fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamef+'.'+productdata.typeFileDocument, function(exists) 
							{
								if(exists)
								{
								
									productmodel.update({_id:productdata.productid},{$set:{pathfile:'Data/Products/'+oldfoldername+'/'+productnamef+'.'+productdata.typeFileDocument,description:productdata.description}},function(err)
									{
													
										if(err)
											{
												console.log('err', err);
												socket.emit("resEditProduct",{status:false});
											}
													
											console.log("product  file and description updated");
													
											fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamef, function(exists) 
											{
												if (exists) 
												{
													fs.unlink(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamef);
													console.log("Old file drectory is deleted");
													socket.emit("resEditProduct",{status:true});
												}
											});
									});
								}
							});
							
						}); 
					}
				});	
			});
		}
		
		else if(productdata.encodedImage.length!=0&&productdata.hashtag!="")
		{
			var hashtagList=productdata.hashtag.split(",");
			productmodel.findOne({_id:productdata.productid},function(err,product){
				
				arrayproductnamei=product.image.split("/");
				oldfoldername=arrayproductnamei[2];
				oldproductnamei=arrayproductnamei[3];
				
				fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername, function(exists)
				{
					if(exists)
					{
						console.log('folder exist..');
						fs.writeFile(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamei+'.'+productdata.typeFileImage, productdata.encodedImage, 'binary', function(err, data){
							
							if (err) 
							{
								console.log('err', err);
								socket.emit("resEditProduct",{status:false});
							}
							
							fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamei+'.'+productdata.typeFileImage, function(exists) 
							{
								if(exists)
								{
								
									productmodel.update({_id:productdata.productid},{$set:{image:'Data/Products/'+oldfoldername+'/'+productnamei+'.'+productdata.typeFileImage,hashtag:hashtagList}},function(err)
									{
													
										if(err)
											{
												console.log('err', err);
												socket.emit("resEditProduct",{status:false});
											}
													
											console.log("product image and hashtag updated");
													
											fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamei, function(exists) 
											{
												if (exists) 
												{
													fs.unlink(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamei);
													console.log("Old image drectory is deleted");
													socket.emit("resEditProduct",{status:true});
												}
											});
									});
								}
							});
							
						}); 
					}
				});	
			});
		}
		
		else if(productdata.encodedFile.length!=0&&productdata.hashtag!="")
		{
			var hashtagList=productdata.hashtag.split(",");
			productmodel.findOne({_id:productdata.productid},function(err,product){
				
				arrayproductnamef=product.pathfile.split("/");
				oldfoldername=arrayproductnamef[2];
				oldproductnamef=arrayproductnamef[3];
				
				fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername, function(exists)
				{
					if(exists)
					{
						console.log('folder exist..');
						fs.writeFile(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamef+'.'+productdata.typeFileDocument, productdata.encodedFile, 'binary', function(err, data){
							
							if (err) 
							{
								console.log('err', err);
								socket.emit("resEditProduct",{status:false});
							}
							
							fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamef+'.'+productdata.typeFileDocument, function(exists) 
							{
								if(exists)
								{
								
									productmodel.update({_id:productdata.productid},{$set:{pathfile:'Data/Products/'+oldfoldername+'/'+productnamef+'.'+productdata.typeFileDocument,hashtag:hashtagList}},function(err)
									{
													
										if(err)
											{
												console.log('err', err);
												socket.emit("resEditProduct",{status:false});
											}
													
											console.log("product  file and hashtag updated");
													
											fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamef, function(exists) 
											{
												if (exists) 
												{
													fs.unlink(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamef);
													console.log("Old file drectory is deleted");
													socket.emit("resEditProduct",{status:true});
												}
											});
									});
								}
							});
							
						}); 
					}
				});	
			});
		}

		else if(productdata.description!=""&&productdata.hashtag!="")
		{
			var hashtagList=productdata.hashtag.split(",");
			productmodel.update({_id:productdata.productid},{$set:{description:productdata.description,hashtag:hashtagList}},function(err){
				
				if(err)
				{
					console.log('err', err);
					socket.emit("resEditProduct",{status:false});
				}
				console.log("product description and hashtag updated");
				socket.emit("resEditProduct",{status:true});
				
			});
		}
	
		else if(productdata.encodedImage.length!=0)
		{
			productmodel.findOne({_id:productdata.productid},function(err,product){
				
				arrayproductnamei=product.image.split("/");
				oldfoldername=arrayproductnamei[2];
				oldproductnamei=arrayproductnamei[3];
				
				fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername, function(exists)
				{
					if(exists)
					{
						console.log('folder exist..');
						fs.writeFile(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamei+'.'+productdata.typeFileImage, productdata.encodedImage, 'binary', function(err, data){
							
							if (err) 
							{
								console.log('err', err);
								socket.emit("resEditProduct",{status:false});
							}
							
							fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamei+'.'+productdata.typeFileImage, function(exists) 
							{
								if(exists)
								{
								
									productmodel.update({_id:productdata.productid},{$set:{image:'Data/Products/'+oldfoldername+'/'+productnamei+'.'+productdata.typeFileImage}},function(err)
									{
													
										if(err)
											{
												console.log('err', err);
												socket.emit("resEditProduct",{status:false});
											}
													
											console.log("product image updated");
													
											fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamei, function(exists) 
											{
												if (exists) 
												{
													fs.unlink(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamei);
													console.log("Old image drectory is deleted");
													socket.emit("resEditProduct",{status:true});
												}
											});
									});
								}
							});
							
						}); 
					}
				});	
			});
			
		}
		else if(productdata.encodedFile.length!=0)
		{
			productmodel.findOne({_id:productdata.productid},function(err,product){
				
				arrayproductnamef=product.pathfile.split("/");
				oldfoldername=arrayproductnamef[2];
				oldproductnamef=arrayproductnamef[3];
				
				fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername, function(exists)
				{
					if(exists)
					{
						console.log('folder exist..');
						fs.writeFile(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamef+'.'+productdata.typeFileDocument, productdata.encodedFile, 'binary', function(err, data){
							
							if (err) 
							{
								console.log('err', err);
								socket.emit("resEditProduct",{status:false});
							}
							
							fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+productnamef+'.'+productdata.typeFileDocument, function(exists) 
							{
								if(exists)
								{
								
									productmodel.update({_id:productdata.productid},{$set:{pathfile:'Data/Products/'+oldfoldername+'/'+productnamef+'.'+productdata.typeFileDocument}},function(err)
									{
													
										if(err)
											{
												console.log('err', err);
												socket.emit("resEditProduct",{status:false});
											}
													
											console.log("product  file updated");
													
											fs.exists(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamef, function(exists) 
											{
												if (exists) 
												{
													fs.unlink(process.cwd() +'\\Data\\Products\\'+oldfoldername+'\\'+oldproductnamef);
													console.log("Old file drectory is deleted");
													socket.emit("resEditProduct",{status:true});
												}
											});
									});
								}
							});
							
						}); 
					}
				});	
			});
		}
		else if(productdata.description!="")
		{
			productmodel.update({_id:productdata.productid},{$set:{description:productdata.description}},function(err){
				
				if(err)
				{
					console.log('err', err);
					socket.emit("resEditProduct",{status:false});
				}
				console.log("product description updated");
				socket.emit("resEditProduct",{status:true});
			});
		}
		
		else if(productdata.hashtag!="")
		{
			var hashtagList=productdata.hashtag.split(",");
			productmodel.update({_id:productdata.productid},{$set:{hashtag:hashtagList}},function(err){
				
				if(err)
				{
					console.log('err', err);
					socket.emit("resEditProduct",{status:false});
				}
				console.log("product hashtag updated");
				socket.emit("resEditProduct",{status:true});
				
			});
		}
		
		
	});
	

	
	//block 2 yani product delete shode ast
	socket.on("deleteProduct",function(data)
	{
		var productdata=data;
		
		productmodel.update({_id:productdata.productid},{$set:{block:"2"}},function(err){
			
			if(err)
			{
				console.log(err);
				socket.emit("resDeleteProduct",{status:false});
			}
			
			usermodel.update({_id:productdata.userid},{$pull:{library:productdata.productid}},function(err){
					
					if(err)
					{
						console.log(err);
						socket.emit("resDeleteProduct",{status:false});
					}
					
					usermodel.update({_id:productdata.userid},{$pull:{favorites:productdata.productid}},function(err){
						
						if(err)
						{
						console.log(err);
						socket.emit("resDeleteProduct",{status:false});
						}	
						
						console.log("delete");
						socket.emit("resDeleteProduct",{status:true});
						
					});
			});
			
		});
	});
	
	
	socket.on("downloadRate",function(data){
		
		var productdata=data;
		
		productmodel.update({_id:productdata.productid},{$inc:{rate:.3}},function(err){
			
			if(err)
			{
				console.log(err);
			}
			productmodel.findOne({_id:productdata.productid},function(err,product){
				
				if(err)
				{
					console.log(err);
				}
				
				var randomList=getRandomNumber(product.hashtag.length);
				var historyList=new Array(product.hashtag[randomList[0]],product.hashtag[randomList[1]],product.hashtag[randomList[2]]);
				usermodel.update({_id:productdata.useridSee},{$pull:{history:{$in:historyList}}},function(err){
				
					if(err)
					{
						console.log(err);
					}
					usermodel.update({_id:productdata.useridSee},{$push:{history:{$each:historyList}}},function(err){
						
						if(err)
						{
							console.log(err);
						}
						
						usermodel.find({_id:productdata.useridSee},function(err,user){
						
							if(err)
							{
								console.log(err);
							}
							
							for(var i=user[0].history.length;i>300;i--)
							{
								usermodel.update({_id:productdata.useridSee},{$pop:-1},function(err){
									
									if(err)
									{
										console.log(err);
									}
									console.log("for is working");
								});
							}
							
							console.log("product rate download increment and save hashtag product to user history");
							
						});

					});
				
				});
				
			});
			
		});
		
	});

	
	
	//sakhte random list bedone tekrar dar bazeye [0,size]
	
	function getRandomNumber(size)
	{
		var randomList=new Array();
		while(randomList.length!=3)
		{
			var flagExist=true;
			var randomNumber=Math.floor(Math.random() * 100)%size;
			for(var i=0;i<randomList.length;i++)
			{
				if(randomNumber==randomList[i])
				{
					flagExist=false;
				}
			}
			
			if(flagExist)
			{
				randomList.push(randomNumber);
			}
		}
		
		return randomList;
	}
	
	
		
});