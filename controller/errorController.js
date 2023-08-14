const AppError = require('../utils/AppError.js')

const handleCastErrorDB = (err) => 
{
  const message = `Invalid ${err.path}:${err.value}`

  return new AppError(message,400)
}

const handleDuplicateFieldsDB = (err)=>
{
  const message = `Duplicate field value :${err.keyValue.name}. please use another value!`
  return new AppError(message,400)
}
const handleValidatorErrorDB = (err) =>
{
  const errors = Object.values(err.errors).map(el=>el.message)
const message =`Invalid Iput data .${errors.join('. ')}`

return new AppError(message,400)
}
const handleJWTError = () => 
{
  return new AppError('Invalid token ,please login again!',401)
}
const handleJWTExpiredError= () => 
{
  return new AppError('Your access is expired , please login again!',401)
}

const sendErrorDev = (err,req,res)=>
{
  //if the url start wiht / api this mean we are in api (like post man) 
if(req.originalUrl.startsWith('/api')){
  res.status(err.statusCode).json({error :err,status :err.status , message :err.message , stack : err.stack})
}
else{
  //Renderd website
  res.status(err.statusCode).render('error',{
    title:"Something went wrong!",
    msg:err.message
  })
}
  
}

const sendErrorProd = (err,req,res)=>
{
  // API
  if(req.originalUrl.startsWith('/api')){
    if(err.isOperational)
  {
    err.message = err.message
    return res.status(err.statusCode).json({status:err.status,message :err.message});

  }
  //operational or trusted error : send message to client
    console.error('ERROR 💥:',err)
     return res.status(500).json({status : 'error', message :'Something went wrong'})
  } 
  
   //Renderd Website 
   if(err.isOperational)
   {
    return res.status(err.statusCode).render('error',{
      title:"Something went wrong!",
      msg:err.message
    })
  
 
   }
   //programmin or other unknown eror :son't leak error datails
    return res.status(err.statusCode).render('error',{
      title:"Something went wrong!",
      msg:"Please try again later"
    })
  }


module.exports = (err,req,res,next)=>
{
  err.statusCode = err.statusCode || 500;
  err.status   = err.status || 'error'
  err.message = err.message || "no err message"

  if(process.env.NODE_ENV ==="development")
  {
    sendErrorDev(err,req,res)
  }
  else{
    let error = Object.create(err) //this line equal to {...err} 
    if(error.name ==="CastError")error = handleCastErrorDB(error)
    if(error.code ===11000) error =handleDuplicateFieldsDB(error)
    if(error.name ==="ValidationError")error = handleValidatorErrorDB(error)
    if(error.name ==="JsonWebTokenError")error = handleJWTError()
    if(error.name ==="TokenExpiredError")error = handleJWTExpiredError()
    sendErrorProd(error,req,res)
  }
}
