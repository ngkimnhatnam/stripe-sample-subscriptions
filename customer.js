document.querySelector("#toSubPicker").disabled = true;
var customer;

function createCustomer() {
    let fullName  = document.querySelector('#full_name').value;
    let billingEmail = document.querySelector('#email').value;

    return fetch('/create-customer', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: fullName,
        email: billingEmail,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((result) => {
        // result.customer.id is used to map back to the customer object
        // result.setupIntent.client_secret is used to create the payment method
        console.log('Customer id..'+result.customer.id);
        customer = result.customer;
        return result;
      })
      .then(onCreateCustomerSuccess);
      
  }

function onCreateCustomerSuccess() {
  document.querySelector('button').disabled = true;
  document.querySelector('button').textContent = 'Signed up';
  document.querySelector("#toSubPicker").disabled = false;
  
}

let signupForm = document.getElementById('signup-form');
signupForm.addEventListener('submit', function (evt) {
  evt.preventDefault();
  // Create Stripe customer
  createCustomer();
});

