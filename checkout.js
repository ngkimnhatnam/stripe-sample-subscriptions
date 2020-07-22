
// Set your publishable key: remember to change this to your live publishable key in production
// See your keys here: https://dashboard.stripe.com/account/apikeys
var stripe = Stripe('pk_test_51H1SMCBlI39yeMOpOaasTAeaPdcPTavR4Rch9LCmK0EqyfSIfPAYEHQTYhWLnCSgq9hkGEewcYdndk31R2XbHcQ800p6rqXHrO');
var elements = stripe.elements();

// Set up Stripe.js and Elements to use in checkout form
var style = {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4"
      }
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a"
    }
  };
  
var cardElement = elements.create("card", { style: style });
cardElement.mount("#card-element");

cardElement.on('change', showCardError);

function showCardError(event) {
  let displayError = document.getElementById('card-errors');
  if (event.error) {
    displayError.textContent = event.error.message;
  } else {
    displayError.textContent = '';
  }
}

var form = document.getElementById('subscription-form');
form.addEventListener('submit', function (ev) {
  ev.preventDefault();
  
  // If a previous payment was attempted, get the lastest invoice
  const latestInvoicePaymentIntentStatus = localStorage.getItem(
    'latestInvoicePaymentIntentStatus'
  );
  if (latestInvoicePaymentIntentStatus === 'requires_payment_method') {
    const invoiceId = localStorage.getItem('latestInvoiceId');
    const isPaymentRetry = true;
    // create new payment method & retry payment on invoice with new payment method
    createPaymentMethod({
      cardElement,
      isPaymentRetry,
      invoiceId,
    });
  } else {
    // create new payment method & create subscription
    createPaymentMethod({ cardElement });
  }
});
function createPaymentMethod({ cardElement }) {
    
  // Set up payment method for recurring usage
  stripe
    .createPaymentMethod({
      type: 'card',
      card: cardElement,
    })
    .then((result) => {
      if (result.error) {
        displayError(result);
      } else {
          // Create the subscription
          createSubscription({
            customerId: 'customerId',
            paymentMethodId: result.paymentMethod.id,
            priceId: 'priceId',
          });
      }
    });
}

function createSubscription({ customerId, paymentMethodId, priceId }) {
    return (
      fetch('/paySubscriptions', {
        method: 'post',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerId,
          paymentMethodId: paymentMethodId,
          priceId: priceId,
        }),
      })
        .then((response) => {
          return response.json();
        })
        // If the card is declined, display an error to the user.
        .then((result) => {
          if (result.error) {
            // The card had an error when trying to attach it to a customer.
            throw result;
          }
          return result;
        })
        // Normalize the result to contain the object returned by Stripe.
        // Add the addional details we need.
        .then((result) => {
          return {
            paymentMethodId: paymentMethodId,
            priceId: priceId,
            subscription: result,
          };
        })
        .then(onSubscriptionComplete)
        .catch((error) => {
          // An error has happened. Display the failure to the user here.
          // We utilize the HTML element we created.
          showCardError(error);
        })
    );
  }
function onSubscriptionComplete(result) {
    // Payment was successful.
    if (result.subscription.status === 'active') {
      // Change your UI to show a success message to your customer.
      // Call your backend to grant access to your service based on
      // `result.subscription.items.data[0].price.product` the customer subscribed to.
      document.querySelector('button').textContent = 'Subscription paid';
      document.querySelector('button').disabled = true;
      
      
    }
}
  
  

