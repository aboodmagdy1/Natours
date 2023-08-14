const mongoose = require('mongoose')
const Tour = require('./tourModle')

const reviewSchema = new mongoose.Schema({
    review : {type : String ,required : [true,'Review can not be empty!']},
    rating : {type : Number, min : 1,max : 5},
    createdAt : {type:Date,default:Date.now()},
    //review must be belongs to a tour and nead a author (user) so we will use parent refranceign(the tour can't access to the reviews but reviews points to tour)
    tour :
        {
            type : mongoose.Schema.ObjectId ,
            ref :'Tour',
            required : [true , 'Review must be belongs to a tour']
        }
    ,
    user :
        {
            type : mongoose.Schema.ObjectId ,
            ref :'User',
            required : [true , 'Review must be belongs to a user']

        }
    
},{//to not save the virtual fields in the db but show them in any output
    toJSON:{virtuals :true},
    toObject:{virtuals :true}
})
//make the user can make one review for one tour 
reviewSchema.index({tour:1,user:1},{unique:true})

reviewSchema.pre(/^find/,function(next){
    this.populate({
        path:'user',
        select : 'name photo'
    })
    next()
})

reviewSchema.statics.calcAverageRatings = async function ( tourId){
    const stats = await this.aggregate([
        {$match : {tour:tourId}}
        ,{$group : {
            _id : '$tour',//هقسم الريفييوا بناءا علي كل رحله 
            nRating:{$sum : 1},//add one for each review document belong to this tour
            avrRating : {$avg:'$rating'}
        }}
    ])
    if(stats.length>0){

        await Tour.findByIdAndUpdate(tourId,{ratingQuantity:stats[0].nRating,ratingsAverage:stats[0].avrRating})
    }else{
        await Tour.findByIdAndUpdate(tourId,{ratingQuantity:0,ratingsAverage:4.5})

    }
}

reviewSchema.post('save',async function(){
    //this.tour is refer to the tour id that saved in the review modle
    await this.constructor.calcAverageRatings(this.tour) 
})
//findOneAndUpdate /findOneAndDelete to update the tour info after this query on the review doc
reviewSchema.post(/^findOneAnd/,async (doc)=>{
    await doc.constructor.calcAverageRatings(doc.tour)
})

const Review =  mongoose.model('Review',reviewSchema)

module.exports = Review