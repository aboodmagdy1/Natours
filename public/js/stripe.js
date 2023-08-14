/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe(
  'pk_test_51NdXkAIWcciXmlGW03WBuNeoPTsvPRFTdXifbn16s1KG8LD9XhHLGhlIKDHT6AxlR2IGP3GPiFubD8qTrvaxmr0i004opqhCl2'
);

export const bookTour = async (tourId) => {
  try {
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });

    //works as expected
    // window.location.replace(session.data.session.url);
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
