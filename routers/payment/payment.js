import express from 'express';
import Stripe from 'stripe';

const stripe = new Stripe("sk_test_51QywKOGbmdnPZHMsRnsq2HA340Z1mYjSay0EbOb3MGNEgrmLAcFtTebDsvQ8jOMYWVMgELGXgDFpINU664cY2P80007mgfrSTo");
const Router = express.Router();

Router.use(express.json());

const YOUR_DOMAIN = 'https://lumeo-e-commerce.vercel.app/';

Router.post("/create-payment-intent", async (req, res) => {
  const { price, quantity, products } = req.body; // Extract products to send to Stripe
  console.log("Price:", price, "Quantity:", quantity, "Products:", products);

  try {
    const line_items = products.map(product => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.name,
          description: product.description || '',
          images: [product.image] // Optional: can be used to show product images in Stripe checkout
        },
        unit_amount: product.price * 100, // Convert to cents
      },
      quantity: 1,  // or based on the quantity from the cart
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}?success=true`,
      cancel_url: `${YOUR_DOMAIN}?canceled=true`,
    });

    res.json({ url: session.url }); // Respond with the session URL
  } catch (error) {
    console.error("Stripe Payment Error:", error);
    res.status(500).send("Payment creation failed.");
  }
});

export default Router;
