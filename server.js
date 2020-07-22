const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { resolve } = require("path");
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("."));
app.use(express.json());

// Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require('stripe')('sk_test_51H1SMCBlI39yeMOpdEfEruD3DAl0no8YIISwZovcWcfU9PTsTg5xLf1TJhPGGGrE6W8NZU0RumIqz0O5JilyWYVY00jdvVkRnj');

var customer1;
var product1,price1;


app.get('/', (req,res) => {
  res.render('index');
})


app.post('/create-customer', async (req, res) => {
  // Create a new customer object
  const customer = await stripe.customers.create({
    name: req.body.name,
    email: req.body.email,
  });

  // save the customer.id as stripeCustomerId
  // in your database.
  
  customer1 = customer;
  res.send({customer});
});

app.get('/create-subscription', async (req,res) => {

  var oneKindPack = await stripe.products.retrieve(
    'prod_HhBy7Xdh1bqTps'
  );
  var oneKindPrice = await stripe.prices.retrieve(
    'price_1H7naRBlI39yeMOpzUYbLrAp'
  );

  var allAccessPack = await stripe.products.retrieve(
    'prod_HhBx0EBOrQyoNj'
  );
  var allAccessPrice = await stripe.prices.retrieve(
    'price_1H7nZWBlI39yeMOpImY4WnOY'
  );

  var trainerPack = await stripe.products.retrieve(
    'prod_HhBxYBbMoMJ1tG'
  );
  var trainerPrice = await stripe.prices.retrieve(
    'price_1H7nZwBlI39yeMOpgmAykNNE'
  );
  
  res.render('subscriptions', {
    customerId: customer1.name,
    oneKind: {
      name: oneKindPack.name,
      price: oneKindPrice.unit_amount/100
    },
    trainer: {
      name: trainerPack.name,
      price: trainerPrice.unit_amount/100
    },
    allAccess: {
      name: allAccessPack.name,
      price: allAccessPrice.unit_amount/100
    }
  });
})

app.post('/create-subscription', async (req,res) => {
  //Create the product/sub package
  var product; 
  var price;
  switch(req.body.packageType) {
    case "All Access":
      product = await stripe.products.create(
        {name: req.body.packageType}
        );
      price = await stripe.prices.create(
        {
          unit_amount: 9900,
          currency: 'eur',
          recurring: {interval: 'month'},
          product: product.id,     
        });
        product1 = product;
        price1 = price;    
      break;
    case "Category":
      product = await stripe.products.create(
        {name: req.body.packageType}
        );
      price = await stripe.prices.create(
        {
          unit_amount: 6900,
          currency: 'eur',
          recurring: {interval: 'month'},
          product: product.id,     
        });
        product1 = product;
        price1 = price;    
      break;
    case "Trainer":
      product = await stripe.products.create(
        {name: req.body.packageType}
        );
      price = await stripe.prices.create(
        {
          unit_amount: 4900,
          currency: 'eur',
          recurring: {interval: 'month'},
          product: product.id,     
        });
        product1 = product;
        price1 = price;    
      break;
    
  }  
  res.send({product,price});
})

app.get('/paySubscriptions', (req,res) => {

  res.render('checkout',
    { customerName: customer1.name,
      product: product1.name,
      price: price1.unit_amount
    });
})

app.post('/paySubscriptions', async (req, res) => {
    
    // Attach the payment method to the customer
    try {
      await stripe.paymentMethods.attach(req.body.paymentMethodId, {
        customer: customer1.id,
      });
    } catch (error) {
      return res.status('402').send({ error: { message: error.message } });
    }
  
    // Change the default invoice settings on the customer to the new payment method
    await stripe.customers.update(
      customer1.id,
      {
        invoice_settings: {
          default_payment_method: req.body.paymentMethodId,
        },
      }
    );
  
    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer1.id,
      items: [{ price: price1.id }],
      expand: ['latest_invoice.payment_intent'],
      coupon: '9K19kCGB'
    });
  
    res.json(subscription);
  });

app.listen(4242, () => console.log('Node server listening on port 4242!'));