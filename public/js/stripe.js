import axios from 'axios';
import { renderAlert } from './alert';

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

export const bookTour = async (tourId) => {
  try {
    // 1) Get the checkout session from our API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // 2) Checkout form + charge credit card
    stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    renderAlert('error', err);
  }
};
