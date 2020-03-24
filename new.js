const express= require(`express`);
const routes= require(`./routes`);
const http= require(`http`);
const path= require(`path`);
const urlencoded= require(`url`);
const bodyParser= require(`body-parser`);
const json= require(`json`);
const logger= require(`logger`);
const methodOverride= require(`method-override`);

const nano= require(`nano`)(`http://localhost:5984`);
var db=nano.use(`address`);
var app=express();

app.set(`port`,process.env.port||3000);
app.set(`views`,path.join(__dirname,`views`));
app.set(`view engine`,`jade`);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(methodOverride());
app.use(express.static(path.join(__dirname,`public`)));

app.get(`/`,routes.index);

app.post(`/createdb`, (req,res)=>{
    nano.db.create(req.body.dbname, (err)=>{
        if(err){
            res.send("Error Creating database"+ req.body.dbname);
            console.log(err);
            return;
        }
        else{
            res.send(req.body.dbname+"Created");
            console.log("success!!!");
        }

    });
});

app.post(`/new_contact`,(req,res)=>{
    let name= req.body.name;
    let contact=req.body.contact;
    db.insert({name:name, contact:contact, crazy:true},contact,(err,body,header)=>{
        if(err){
            res.send("error")
            console.log(err);
        }
        else{
           res.send(`success`);
        }
    });
});

app.post(`/view_contact`,(req,res)=>{
    let alldoc=``;
    db.get(req.body.contact,{revs_info:true},(err,body)=>{
        if(!err){
            console.log(body);
        }
        if(body){
            alldoc +="Name: " + body.name +"contact:"+ body.contact;
        }
        else{
            alldoc="None found";
        }
        res.send(alldoc);
    });
});


app.post(`/delete_contact`,(req,res)=>{
    db.get(req.body.contact,{revs_info:true},(err,body)=>{
        if(!err){
           db.destroy(req.body.contact,body._rev,(err,body)=>{
               if(err){
                   res.send(`failed`);
               }

           });
           res.send("sucess");
        
        }
    });
});

http.createServer(app).listen(app.get(`port`),()=>{
    console.log("server listening on port"+app.get(`port`));
});






















