const Review = require('../models/reviewModle')
const Factory = require('./handlerFactory')

exports.setTourUserIds = (req,res,next) => {
    //allow nested routes 
    if(!req.body.tour)req.body.tour = req.params.tourId
    if(!req.body.user)req.body.user = req.user.id//==>from protect method \
    
    next()
}
exports.getAllReviews = Factory.getAll(Review)
exports.getReview = Factory.getOne(Review)
exports.createReview =Factory.createOne(Review)
exports.updateReview = Factory.updateOne(Review)
exports.deleteReview = Factory.deleteOne(Review)