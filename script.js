document.addEventListener('DOMContentLoaded', function () {

    const products = [
        { id: 1, name: 'Product 1', price: 10.00 },
        { id: 2, name: 'Product 2', price: 15.00 },
        { id: 3, name: 'Product 3', price: 20.00 },
        { id: 4, name: 'Product 4', price: 25.00 }
    ];

    const cart = [];

    const productList = document.getElementById('product-list');
    const cartItems = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart');
    const cartTotalMessage = document.getElementById('cart-total');
    const totalPriceDisplay = document.getElementById('total-price');
    const checkoutButton = document.getElementById('checkout-btn');


    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');
        productDiv.innerHTML = `
            <h3>${product.name}</h3>
            <p>Price: $${product.price.toFixed(2)}</p>
            <button data-id="${product.id}">Add to Cart</button>
        `;
        productList.appendChild(productDiv);
    });


    productList.addEventListener('click', function (event) {
        if (event.target.tagName === 'BUTTON') {
            // console.log('Button clicked');
            // console.log(event.target.getAttribute('data-id'));
            const productId = parseInt(event.target.getAttribute('data-id'));
            const product = products.find(p => p.id === productId);
            if (product) {
                // console.log('Adding to cart:', product);
                addToCart(product);
            }
        }
    });


    function addToCart(product) {
        cart.push(product);
        // console.log('Cart:', cart);
        renderCart();
    }

    function renderCart() {
        cartItems.innerHTML = '';

        let totalPrice = 0;
        if(cart.length>0) {
            emptyCartMessage.classList.add('hidden');
            cartTotalMessage.classList.remove('hidden');

            cart.forEach((item, index) => {
                totalPrice += item.price;
                const cartItemDiv = document.createElement('div');
                cartItemDiv.innerHTML = `
                ${item.name} - $${item.price.toFixed(2)}
                `;
                cartItems.appendChild(cartItemDiv);



            });
            totalPriceDisplay.textContent = `$${totalPrice.toFixed(2)}`;
        }else{
            emptyCartMessage.classList.add('hidden');
            totalPriceDisplay.textContent = `$${0.00.toFixed(2)}`;
            
        }

    }



checkoutButton.addEventListener('click', function () {
    cart.length = 0; // Clear the cart
    alert('Thank you for your purchase!');
    renderCart();
})





})