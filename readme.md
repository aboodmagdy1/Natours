<h1 align="center">
  <br>
  <a href="https://lakshman-natours.herokuapp.com/"><img src="https://github.com/lgope/Natours/blob/master/public/img/logo-green-round.png" alt="Natours" width="200"></a>
  <br>
  Natours
  <br>
</h1>

<h4 align="center">An awesome tour booking site built on top of <a href="https://nodejs.org/en/" target="_blank">NodeJS</a>.</h4>

## Key Features 📝

* Authentication and Authorization
  - Sign up, Log in, Logout, Update, and reset password.
* User profile
  - Update username, photo, email, password, and other information
  - A user can be either a regular user or an admin or a lead guide or a guide.
  - When a user signs up, that user by default regular user.
* Tour
  - Manage booking, check tour map, check users' reviews and rating
  - Tours can be created by an admin user or a lead-guide.
  - Tours can be seen by every user.
  - Tours can be updated by an admin user or a lead guide.
  - Tours can be deleted by an admin user or a lead-guide.
* Bookings
  - Only regular users can book tours (make a payment).
  - Regular users can not book the same tour twice.
  - Regular users can see all the tours they have booked.
  - An admin user or a lead guide can see every booking on the app.
  - An admin user or a lead guide can delete any booking.
  - An admin user or a lead guide can create a booking (manually, without payment).
  - An admin user or a lead guide can not create a booking for the same user twice.
  - An admin user or a lead guide can edit any booking.
* Reviews
  - Only regular users can write reviews for tours that they have booked.
  - All users can see the reviews of each tour.
  - Regular users can edit and delete their own reviews.
  - Regular users can not review the same tour twice.
  - An admin can delete any review.
* Favorite Tours
  - A regular user can add any of their booked tours to their list of favorite tours.
  - A regular user can remove a tour from their list of favorite tours.
  - A regular user can not add a tour to their list of favorite tours when it is already a favorite.
* Credit card Payment


## Demonstration 🖥️
#### Home Page :
![natoursHomePageonline-video-cutt](https://user-images.githubusercontent.com/58518192/72606801-7ebe0680-3949-11ea-8e88-613f022a64e5.gif)

#### Tour Details :
![tourOverviewonline-video-cutterc](https://user-images.githubusercontent.com/58518192/72606859-a0b78900-3949-11ea-8f0d-ef44c789957b.gif)

#### Payment Process :
![paymentprocess-1-ycnhrceamp4-7fW](https://user-images.githubusercontent.com/58518192/72606973-d9eff900-3949-11ea-9a2e-f84a6581bef3.gif)

#### Booked Tours :
![rsz_bookedtours](https://user-images.githubusercontent.com/58518192/72607747-6a7b0900-394b-11ea-8b9f-5330531ca2eb.png)


#### User Profile :
![rsz_userprofile](https://user-images.githubusercontent.com/58518192/72607635-44edff80-394b-11ea-8943-64c48f6f19aa.png)

#### Admin Profile :
![rsz_adminprofile](https://user-images.githubusercontent.com/58518192/72607648-4d463a80-394b-11ea-972f-a73160cfaa5b.png)


## How To Use 🤔

### Book a tour
* Login to the site
* Search for tours that you want to book
* Book a tour
* Proceed to the payment checkout page
* Enter the card details (Test Mood):
  ```
  - Card No. : 4242 4242 4242 4242
  - Expiry date: 02 / 22
  - CVV: 222
  ```
* Finished!



### Manage your booking

* Check the tour you have booked on the "Manage Booking" page in your user settings. You'll be automatically redirected to this
  page after you have completed the booking.

### Update your profile

* You can update your own username, profile photo, email, and password.


## Build With 🏗️

* [NodeJS](https://nodejs.org/en/) - JS runtime environment
* [Express](http://expressjs.com/) - The web framework used
* [Mongoose](https://mongoosejs.com/) - Object Data Modelling (ODM) library
* [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Cloud database service
* [Pug](https://pugjs.org/api/getting-started.html) - High performance template engine
* [JSON Web Token](https://jwt.io/) - Security token
* [ParcelJS](https://parceljs.org/) - Blazing fast, zero configuration web application bundler
* [Stripe](https://stripe.com/) - Online payment API and Making payments on the app.
* [Postman](https://www.getpostman.com/) - API testing
* [Mailtrap](https://mailtrap.io/) & [Sendgrid](https://sendgrid.com/) - Email delivery platform
* [Mapbox](https://www.mapbox.com/) - Displaying the different locations of each tour.




## Setting Up Your Local Environment ⚙️
![demo-env-file](https://github.com/lgope/Natours/assets/58518192/cf5b833f-2a48-48a1-aeb3-5ffea8967e33)


## Installation 🛠️
You can fork the app or you can git-clone the app into your local machine. Once done, please install all the
dependencies by running
```
$ npm i
Set your env variables
$ npm run watch:js
$ npm run build:js
$ npm run start:dev (for development)
$ npm run start:prod (for production)
$ npm run debug (for debug)
$ npm start
