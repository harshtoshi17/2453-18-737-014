var express=require('express');
var app=express();

//bodyparser
const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//for mongodb
const MongoClient=require('mongodb').MongoClient;

//connecting server file for awt
let server=require('./server');
let config=require('./config');
let middleware=require('./middleware');
const response=require('express');
//database connection
const url='mongodb://127.0.0.1:27017';
const dbName='Hospitalproj';
let db

MongoClient.connect(url,{useUnifiedTopology:true},(err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbName);
    console.log(`Connected Database:${url}`);
    console.log(`Database:${dbName}`);
});

//FETCHING HOSPITAL DETAILS
app.get("/hospitalsdetails",middleware.checkToken,function(req,res){
    console.log("Fetching data from hospital collection");
    var data = db.collection('hospitaldetails').find().toArray()
         .then(result => res.send(result));
});

//FETCHING VENTILATORS DETAILS
app.get("/ventilatordetails",middleware.checkToken,function(req,res){
    console.log("Fetching data from ventilators collection");
    var data = db.collection('ventilator').find().toArray()
         .then(result => res.send(result));
});

//SEARCH VENTILATORS BY status
app.post('/searchventilatorbystatus',middleware.checkToken,(req,res)=>{
    var status=req.body.status;
    console.log(status);
    var ventilatordetails=db.collection('ventilator')
    .find({"status":status}).toArray().then(result=>res.json(result));
});

//SEARCH VENTILATORS BY hospital name
app.post('/searchventilatorbyname',middleware.checkToken,(req,res)=>{
    var Name=req.body.Name;
    console.log(Name);
    var ventilatordetails=db.collection('ventilator')
    .find({'name':new RegExp(Name,'i')}).toArray().then(result=>res.json(result));
});

//SEARCH HOSPITAL BY name
app.post('/searchhospitalbyname',middleware.checkToken,(req,res)=>{
    var name=req.body.name;
    console.log(name);
    var hospitaldetails=db.collection('hospitaldetails')
    .find({'name':new RegExp(name,'i')}).toArray().then(result=>res.json(result));
});

//UPDATE VENTILATOR DETAILS
app.put('/updateventilator',middleware.checkToken,(req,res)=>{
    var ventid={ventilatorId:req.body.ventilatorId};
    console.log(ventid);
    var newvalues={$set:{status:req.body.status}};
    db.collection("ventilator").updateOne(ventid,newvalues,function(err,result){
        res.json('1 document updated');
        if(err)throw err;
        //console.log("1 document updated");
    });
});


//ADD VENTILATOR
app.post('/addventilatorbyuser',middleware.checkToken,(req,res)=>{
    var hId=req.body.hId;
    var ventilatorId=req.body.ventilatorId;
    var status=req.body.status;
    var Name=req.body.Name;
    var item=
    {
        hId:hId,ventilatorId:ventilatorId,status:status,Name:Name
    };
    db.collection('ventilator').insertOne(item,function(err,result){
        res.json('Item inserted');
    });
});

//DELETE VENTILATOR BY ventilatorId
app.delete('/delete',middleware.checkToken,(req,res)=>{
    var myquery=req.body.ventilatorId;
    console.log(myquery);

    var myquery1={ventilatorId:myquery};
    db.collection('ventilator').deleteOne(myquery1,function(err,obj)
    {
        if(err)throw err;
        res.json("1 document deleted");
    });

});
