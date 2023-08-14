const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModle');
const User = require('../../models/userModle');
const Review = require('../../models/reviewModle');
const dotenv = require('dotenv');

dotenv.config({path:'./confeg.env'});


//read thejson file 
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf8'))
const users =  JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf8'))
const reviews =  JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf8'))
//Import data into DB
mongoose.connect(process.env.DATABASE).then((connection)=>{
    console.log('connection is established ')
}).catch((err)=>console.log(err.message))

const importData = async ()=>
{
    try{
        await Tour.create(tours) 
        await Review.create(reviews) 
        await User.create(users,{validateBeforeSave : false}) 
    console.log('data loded successfully')}
    catch(err)
    {console.log(err.message)}
    process.exit()
}
const deleteData=async ()=>
{
    try{
        await Tour.deleteMany() 
        await User.deleteMany() 
        await Review.deleteMany() 

    console.log('data deleted successfully')}catch(err)
    {console.log(err)}
    process.exit()
}

//this is related to the argument that is pass to command line after node dev-data/data/import-dev-data.js (......)
if(process.argv[2]==='--import')
{
    importData()
}else if(process.argv[2]==='--delete')
{
    deleteData()
}else{console.log('no handle for this arg')}

console.log(process.argv)