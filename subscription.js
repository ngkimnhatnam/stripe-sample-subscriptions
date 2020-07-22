document.querySelector("#toCheckout").style.visibility = "hidden";

function createSubPackge(packageType) {

    return fetch('/create-subscription', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        packageType
      }),
    })
    .then((response) => {
      return response.json();
    })
    .then((result) => {
   
      onCreateSubPackageSuccess(result.product, result.price);
    });
  }
  
  function onCreateSubPackageSuccess(product, price) {
    document.querySelector("#subResult").textContent = product.name + " is priced at €" + price.unit_amount/100;
    document.querySelector("#toCheckout").style.visibility = "";
  }
  
  let allAccess = document.querySelector("#allAccess");
  allAccess.addEventListener('click', function(e) {
    createSubPackge("All Access");
  })
  
  let category = document.querySelector("#category");
  category.addEventListener('click', function(e) {
    createSubPackge("Category");
  })
  
  let trainer = document.querySelector("#trainer");
  trainer.addEventListener('click', function(e) {
    createSubPackge("Trainer");
  })


