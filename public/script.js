let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Function to add items to the cart
function addToCart(productName, productPrice, productImage) {
    let cartItems = document.getElementById("cart-items");

    // Create a new cart item object
    let cartItemObj = {
        product: productName,
        price: productPrice,
        image: productImage
    };

    // Add item to the cart array
    cart.push(cartItemObj);
    localStorage.setItem("cart", JSON.stringify(cart));

    // Refresh the displayed cart
    updateCart();

    alert(`${productName} has been added to your cart!`);
}

// Function to update and display the cart from localStorage
function updateCart() {
    let cartItems = document.getElementById("cart-items");
    let totalElement = document.getElementById("total");

    if (!cartItems || !totalElement) return;

    cart = JSON.parse(localStorage.getItem("cart")) || [];
    cartItems.innerHTML = "";  // Clear existing items

    let total = 0;

    cart.forEach((item, index) => {
        let cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");

        // Create product image
        let img = document.createElement("img");
        img.src = item.image;
        img.alt = item.product;
        img.classList.add("cart-img");

        // Create product name element
        let name = document.createElement("p");
        name.textContent = item.product;

        // Create product price element
        let price = document.createElement("p");
        price.textContent = `$${item.price}`;
        price.classList.add("price");

        // Create remove button
        let removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.onclick = function () {
            removeFromCart(index);
        };

        // Append elements to cart item div
        cartItem.appendChild(img);
        cartItem.appendChild(name);
        cartItem.appendChild(price);
        cartItem.appendChild(removeBtn);

        // Append the cart item to the cart list
        cartItems.appendChild(cartItem);

        total += item.price;
    });

    totalElement.textContent = `Total: $${total.toFixed(2)}`;
}

// Function to remove items from the cart
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
}

// Function to handle checkout
function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    alert("Thank you for your purchase!");
    cart = [];
    localStorage.removeItem("cart");
    updateCart();
}

// Load cart when the page loads
updateCart();