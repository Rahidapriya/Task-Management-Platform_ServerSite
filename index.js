const express = require('express');
const cors = require('cors');
const app=express();
//require jwt
const jwt =require('jsonwebtoken')
//cookie
const cookieParser=require('cookie-parser')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port=process.env.PORT || 5009;

//middleware
app.use(cors({
  origin:[
    'https://task-management-platform-b52bd.web.app',
    'http://localhost:5173'
  ],
  credentials:true,
  optionSuccessStatus: 200
}));
app.use(cookieParser());
app.use(express.json());





//const uri = "mongodb+srv://<username>:<password>@cluster0.wv2vf1c.mongodb.net/?retryWrites=true&w=majority";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wv2vf1c.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// console.log(uri);
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

//middleware for cookie parser
const logger=(req,res,next)=>{
  console.log('cookiee',req.method,req.url);
  next();
}

const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  // console.log('token in the middleware', token);
  // no token available 
  if (!token) {
      return res.status(401).send({ message: 'unauthorized access' })
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
          return res.status(401).send({ message: 'unauthorized access' })
      }
      req.user = decoded;
      next();
  })
}



async function run() {
    try {
     
    const TaskCollection =client.db('TaskManagementPlatform').collection('addtask')
    

//jwt login
app.post('/jwt',async(req,res)=>{
  const user=req.body;
  console.log('user for token',user);
  const token =jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
  res.cookie('token',token,{
    httpOnly:true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  })
  .send({success:true});
 })

 //jwt logout
 app.post('/logout',async(req,res)=>{
  const user = req.body;
  // res.clearCookie('token',{maxAge:0,secure: process.env.NODE_ENV === 'production', 
  // sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',})
  // send({success:true})
 res.clearCookie('token', { maxAge: 0, sameSite: 'none', secure: true }).send({ success: true })
 })
  
  app.get('/addtask',async(req,res)=>{
    const cursor=TaskCollection.find();
    const result = await cursor.toArray();
    res.send(result);
})
app.post('/addtask',async(req,res)=>{
  const newTask=req.body;
  console.log(newTask); 

 const result=await TaskCollection.insertOne(newTask);
 res.send(result)
 
})

app.delete('/addtask/:id', async(req,res)=>{
  const id =req.params.id;
  console.log(id);
  const query={_id:new ObjectId(id)}
  const result = await TaskCollection.deleteOne(query);
  res.send(result);
})



      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
     
    }
  }
  run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('task is running in server')
})
app.listen(port,()=>{
    console.log(`pet adoptionis running on port : ${port}`);
})


