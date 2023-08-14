module.exports =fn=>
{

    return (req,res,next) => //this the function that express will call  because we want the fn to be seted not to be called 
    {fn(req,res,next).catch(next)}//this is the result of the call is a function will assigned to the handler function (getAllTour , getTour ,......)

    //catch(err=>next(err))    equal to       catch (next)

}

