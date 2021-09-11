import axios from 'axios';
import { renderAlert } from './alert';

const stripe = Stripe(
  'pk_test_51JY3ZpSEnWLXGl16WnSOKVfBS0V9ked1X59IimsZLm9LzI0KHui6k0jV8tv2l9OsUYWB5OrL870s5oRFjJbfmwAw003RAKFVd4'
);

export const bookTour = async tourId => {
  try {
    // 1) Get the checkout session from our API
    const session = await axios(
      `http://localhost:8000/api/v1/bookings/checkout-session/${tourId}`
    );

    // 2) Checkout form + charge credit card
    stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } 
  
  catch (err) { 
    renderAlert('error', err);
  }
};
