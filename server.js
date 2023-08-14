const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException',err=>
{
    console.log(err.name , err.message )
    console.log('uncaught Exeption  ! 💥 Shutting down')
    process.exit(1) 
})


dotenv.config({path:'./confeg.env'});
const app = require('./app');

//connect database 
mongoose.connect(process.env.DATABASE).
then(connObj=>{ console.log('database establish successful ')})

const port = 3000 ;   

const server =app.listen(port, ()=>{console.log(`listening on ${port}`) })

process.on('unhandledRejection',err=>
{
    console.log(err.name , err.message )
    console.log('UNHANDLED REJECTION ! 💥 Shutting down')
    server.close(()=>{process.exit(1)})
})


