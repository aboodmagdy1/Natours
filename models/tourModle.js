
const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')// this is a package for validate stirings only by some costoem validator

const tourSchema = new mongoose.Schema({
    
    name :{type : String , required : [true , 'tour must have a name '] , unique: true, trim : true, 
    maxlength: [40,"A Tour Name must have less or equal then 40 characters"],
    minlength: [5,"A Tour Name must have more or equal then 10 characters"]
},
    slug:String,
    secretTour:{type:Boolean ,default :false},
    duration:{type : Number ,required : [true, "a tour mus have  a duration"] },  
    maxGroupSize : {type : Number ,required : [true , "a tour mus have a group size"]},
    difficulty:{type :String ,required : [true , "a tour mus have a difficulty"], trim : true ,enum :{values:['easy', 'medium', 'difficult'],message:'Difficulty is either :easy ,medium , difficult'}},
    price : {type : Number , required :[true, 'tour must have a price']},
    ratingsAverage  : {type :Number , default : 4.5,
        max :[5,'tour Rating must be below 5.0 not ({VALUE})'],
        min :[1,'tour rating must be above 1.0 not ({VALUE})'],
        set:val=>Math.round(val* 10 )/10
},
    ratingQuantity  : {type :Number , default : 0},

    priceDicoutn: {type :Number ,
        validate :{validator :function(val){return val<this.price }}     //This only point to current doc on new doc creation 
    ,message:"Discount price ({VALUE}) must be below regular price"},
    summary: {type :String  , trim : true , required :[true, "tour must have a discription"]},
    description: {type: String,trim: true},
    imageCover: {type: String,required: [true, 'A tour must have a cover image']},//name of image to read it from DB
    images :[String],
    createdAt:{type:Date,default:Date.now(),select :false},
    startDates :[Date],
    startLocation:{//start location for every tour
        //GeoJSON to specify geospatial data (الجغرافيه او الجيومكانيه)
        type : {type :String , default:'Point',enum :['Point']},
        coordinates :[Number],
        adress:String,
        description:String
    },
    //embeded documents for locations array of objects each object is a embeded document
    locations:[{
        type:{type : String, default:'Point'},
        coordinates :[Number],
        adress:String,
        description:String,
        day:Number
    }

    ],
    guides:[
    {   type : mongoose.Schema.ObjectId ,
        ref:'User'//refrence to the modle tha we want to create the relationship with it 
    }
    ]
},{
    toJSON:{virtuals :true},
    toObject:{virtuals :true}
})
//indexes 
tourSchema.index({price : 1, ratingsAverage:1})
tourSchema.index({slug:1})
tourSchema.index({startLocation: '2dsphere'})//we do that for geospatial data 

tourSchema.virtual('durationWeeks').get(function()  {
    return this.duration /7
    
})
//virtual populating 
tourSchema.virtual ("reviews",{
    ref:'Review',
    foreignField:'tour',//the name of the field in the other model(in the Review model)
    localField:'_id'
})

//Document middleware :run before save and create
tourSchema.pre('save',function(next)
{
    this.slug = slugify(this.name)
    next()
})

// embeding users : but this approach is not good because the update in this approach is not allowed

// tourSchema.pre('save',async function(next){
//     const guidesPromises = this.guides.map(async id => await User.findById(id))
//     this.guides = await Promise.all(guidesPromises)
//     next()
// })


//Query middleware


tourSchema.pre(/^find/,function(next)
{
    this.find({secretTour :{$ne:true}})
    next()
})
tourSchema.pre(/^find/,function(next){
    this.populate({path : 'guides', select:'-__v -passwordChangedAt  '})
    next()
})

// //aggregation middleware 
// tourSchema.pre('aggregate',function(next)
// {
//     this.pipeline().unshift({$match:{secretTour :{$ne:true}}})
//     next()
// })

const Tour = mongoose.model('Tour',tourSchema);

module.exports = Tour;
