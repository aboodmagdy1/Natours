//this is the entry file
import 'core-js';
import 'regenerator-runtime';

import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import{bookTour} from './stripe'
import { async } from 'regenerator-runtime';

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');

const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

const bookBtn = document.getElementById('book-tour')

//VALUES be carful when we want to read a valuse of domElement don't place them in here start of script

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}
if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}
if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    console.log(form);
    updateSettings(form, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating....';

    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { currentPassword, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save Password';

    //to make the input field empty after update
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}


if(bookBtn){
  bookBtn.addEventListener('click',e=>{
    //e.target the elemnt that  was clicked (bookBtn)
    e.target.textContent = 'Processing...'
    const tourId = e.target.dataset.tourId 
    bookTour(tourId)

  })
}