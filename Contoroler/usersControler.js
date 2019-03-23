////
////
////
var jsonfile = require('jsonfile'),
	mongoose = require('mongoose'),
	fs=require('fs');

//connect to database
mongoose.connect('mongodb://localhost/Kahkeshan', { useNewUrlParser: true });
var db=mongoose.connection;
db.on('err',function () {
        console.log("disconnect to DataBase");
});
db.once('connected',function () {
   console.log("connect to DataBase");
});


/*creeate schema user
for save user data
*/
//username:{type:String,required: true, unique: true},
var userschema=mongoose.Schema({
	username:{type:String,default:"",unique: true},
    password:{type:String,default:""},
	avatar:{type:String,default:"Data/Users/defultImageProfile/kahkeshan.jpg"},
    phone:{type:String,required: true,unique: true},
    created_at:{type: Date, default: Date.now },
	biography:{type:String,default:"بیوگرافی"},
	link:{type:String,default:"لینک"},
    library:[String],
    favorites:[String],
	following:[String],
	follower:[String],
	order:[String],
	history:[],
	alllibrary:[],
	historylibrary:[],
	income:{type:String,default:""},
	wallet:{type:String,default:""},
	event:[String],
	buyed:[String],
	socketid:{type:String,default:""},
	verifiedcode:{type:String,defult:""},
	verifiedtype:{type:Boolean,defult:false},
	block:{type:String,default:"false"}
});
//define model users
global.usermodel=mongoose.model('users',userschema);
	
	


/**
 * sign up new user
 * @param req request
 * @param res response
 */
 
 exports.signUpNewUser=(function (req,res) {
	//gerefteane data az body req
	var userdata = req.body;
	
	//baresye khali nabodane dataha
	if(userdata.username && userdata.phone && userdata.password)
	{
		//baresye mojod nabodane user dar database
		usermodel.findOne({phone:userdata.phone},function(err,user){
			
			if(err)
			{
				console.log(err);
				res.status(500).send({type: 'INTERNAL_SERVER_ERROR',description: 'Internal server error'});
			}
			//agar user ba hamchin phone mojod bashad va verifiedtype ture
			else if(user!=null && user.verifiedtype == true)
			{
				console.log("user tekrari ast");
				res.status(400).send({type: 'SOME_FIELDS_ARE_EMPTY',description: 'body field or feel field for create new tweet was empty :|'});
			}
			//agar user ba hamchin phone mojod bashad va verifiedtype false
			else if(user!= null && user.verifiedtype == false)
			{
				//create new veridiedcode and send for user
				usermodel.update({phone:userdata.phone},{$set:{username:userdata.username,verifiedcode:"3535",password:userdata.password,socketid:"20"}},function(err){
					
					if(err)
					{
						console.log(err);
						res.status(500).send({type: 'INTERNAL_SERVER_ERROR',description: 'Internal server error'});
					}
					else
					{
						console.log("user update va verifedcode ersal shod");
						//send verifiedcode for user
						res.json({verifiedcode:"3535"});
					}
					
				});
			}
			//agar hamchin useri ba in phone mojod nabashad
			else
			{
				//baresi inke aya useri ba hamchin useri daryafti mojod ya na
				usermodel.findOne({username:userdata.username},function(err,user){
					
					if(err)
					{
						console.log(err);
						res.status(500).send({type: 'INTERNAL_SERVER_ERROR',description: 'Internal server error'});
					}
					//useri ba user daryafti mojod ast va verifiedtype true
					else if(user!= null && user.verifiedtype == true)
					{
						console.log("user tekrari ast");
						res.status(400).send({type: 'SOME_FIELDS_ARE_EMPTY',description: 'body field or feel field for create new tweet was empty :|'});
					}
					//useri ba user daryafti mojod ast va verifiedtype false
					else if(user!=null && user.verifiedtype == false)
					{
						//create new veridiedcode and send for user
						usermodel.update({username:userdata.username},{$set:{phone:userdata.phone,verifiedcode:"3535",password:userdata.password,socketid:"20"}},function(err){
							
							if(err)
							{
								console.log(err);
								res.status(500).send({type: 'INTERNAL_SERVER_ERROR',description: 'Internal server error'});
							}
							else
							{
								console.log("user update va verifedcode ersal shod");
								//send verifiedcode for user
								res.json({verifiedcode:"3535"});
							}
							
						});
					}
					//kolan hamchin useri na ba phone na ba user mojod nist
					else
					{
						console.log("user tekrari nist");
				
						var newUser=new usermodel({
								username:userdata.username,
								password:userdata.password,
								phone:userdata.phone,
								created_at:new Date(),
								socketid:"20",
								verifiedtype:false,
								verifiedcode:"4545"
						});
						
						//save kardane user jadid dar data base
						newUser.save(function(err,newuser){
							
							if(err)
							{
								console.log(err);
								res.status(500).send({type: 'INTERNAL_SERVER_ERROR',description: 'Internal server error'});
							}
							
							else
							{
								console.log("newuser save in data base va verifedcode ersal shod");
								
								//start delete function
								//deleteUser(userdata.phone);
								
								
								
								//sakhte yek poshe baraye zakhire kardane image profile
								fs.mkdir(process.cwd() +'\\Data\\Users\\'+newuser._id,function(err){
									
									if(err)
									{
										console.log("err dar ghesmate sakhte poshe baraye image profile");
									}
									
									//send verifiedcode for user
									res.json({verifiedcode:"4545"});
								});
								
							}
						});
					}
					
				});
				
			}
		});
	}
	else
	{
		console.log("body field or feel field for create new tweet was empty :|");
		res.status(400).send({type: 'SOME_FIELDS_ARE_EMPTY',description: 'body field or feel field for create new tweet was empty :|'});
	}
		
});



/**
 * verified new user
 * @param req request
 * @param res response
 */
 
 exports.verifiedNewUser=(function (req,res) {
	 
	 var userdata=req.body;
	 
	 if(userdata.verifiedcode && userdata.phone)
	 {
		usermodel.findOne({phone:userdata.phone,verifiedcode:userdata.verifiedcode},function(err,user){
			
			if(err)
			{
				console.log(err);
				res.status(500).send({type: 'INTERNAL_SERVER_ERROR',description: 'Internal server error'});
			}
			else if(user!=null)
			{

				usermodel.update({phone:userdata.phone},{$set:{verifiedtype:true}},function(err){
					
					if(err)
					{
						console.log(err);
						res.status(500).send({type: 'INTERNAL_SERVER_ERROR',description: 'Internal server error'});
					}
					else
					{
						console.log("user verifed shod "+user._id);
						res.json({verifiedtype:true,userid:user._id,password:user.password,phone:user.phone});
					}
				});
			}
			else
			{
				console.log("verifiedcode ersali eshtebah ast");
				res.status(400).send({type: 'SOME_FIELDS_ARE_EMPTY',description: 'verifiedcode ersali eshtebah as'});
			}
		});
	 }
	 else
	 {
		console.log("body field or feel field for create new tweet was empty :|");
		res.status(400).send({type: 'SOME_FIELDS_ARE_EMPTY',description: 'body field or feel field for create new tweet was empty :|'}); 
	 }
	 
 });
 
 
 
 /**
 * sign in new user
 * @param req request
 * @param res response
 */
 exports.signIn = (function (req, res) {
	 
	var userdata=req.body;
	
	if(userdata.username && userdata.password)
	{
		usermodel.findOne({$or:[{username:userdata.username},{phone:userdata.username}]},function(err,user){
			
			if(err)
			{
				console.log(err);
				res.status(500).send({type: 'INTERNAL_SERVER_ERROR',description: 'Internal server error'});
			}
			else if(user!=null && user.verifiedtype == true)
			{
				if(user.password==userdata.password)
				{
					console.log("vorod ba movafaghyat anjam shood");
					res.json({loginstatus:"true",description:"vorod ba movafaghyat anjam shood",userid:user._id,password:user.password,phone:user.phone});
				}
				else
				{
					console.log("password eshtebah ast");
					res.json({loginstatus:"false",description:"password eshtebah ast"});
				}
			}
			else
			{
				console.log("hamchin karbari vojod nadarad");
				res.json({loginstatus:"false",description:"hamchin karbari vojod nadarad"});
			}
		});
	}
	else
	{
		console.log("body field or feel field for create new tweet was empty :|");
		res.status(400).send({type: 'SOME_FIELDS_ARE_EMPTY',description: 'body field or feel field for create new tweet was empty :|'}); 
	}
 });
 
 
 
 
 
 
 
 
 
 
 
 
 