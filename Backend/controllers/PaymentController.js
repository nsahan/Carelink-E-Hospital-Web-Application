import stripe from '../config/stripe.js';

export const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'lkr',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({
      message: 'Error creating payment intent',
      error: error.message
    });
  }
};
