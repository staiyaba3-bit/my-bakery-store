window.onload = function () {

let cart = [];
let totalPrice = 0;
document.querySelectorAll('.card').forEach(card => {

    const plus = card.querySelector('.plus');
    const minus = card.querySelector('.minus');
    const qty = card.querySelector('.qty');
    const addBtn = card.querySelector('.add-to-cart');

    if (!plus || !minus || !qty || !addBtn) return;

    let count = 1;

    plus.onclick = () => {
        count++;
        qty.textContent = count;
    };

    minus.onclick = () => {
        if (count > 1) {
            count--;
            qty.textContent = count;
        }
    };

    addBtn.onclick = () => {

    const name = card.querySelector('h4').innerText;
    const unit = card.getAttribute("data-unit");
    const qtyValue = parseInt(qty.textContent);

    const priceText = card.querySelectorAll('p')[0].innerText;
    const price = parseInt(priceText.replace(/[^0-9]/g, ''));

    const existing = cart.find(item => item.name === name);

    if (existing) {
        existing.qty += qtyValue;
    } else {
        cart.push({
            name: name,
            qty: qtyValue,
            unit: unit,
            price: price
        });
    }

    alert("Added to cart");
};
});

const viewCartBtn = document.getElementById("viewCartBtn");
const popup = document.getElementById("cartPopup");
const cartItems = document.getElementById("cartItems");
const closeCart = document.getElementById("closeCart");
const sendWhatsApp = document.getElementById("sendWhatsApp");

if (closeCart) {
    closeCart.onclick = () => {
        popup.classList.remove("show");
    };
}

if (!viewCartBtn) {
    console.log("❌ Button not found");
    return;
}

viewCartBtn.onclick = () => {

    cartItems.innerHTML = "";
    totalPrice = 0;

    cart.forEach(item => {

    const itemTotal = item.price * item.qty;
    totalPrice += itemTotal;

    const li = document.createElement("li");
    li.textContent = `${item.name} - ${item.qty} ${item.unit} = ₹${itemTotal}`;

    // 🗑 REMOVE BUTTON
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.style.marginLeft = "10px";

    removeBtn.onclick = () => {
        cart = cart.filter(i => i.name !== item.name);
        viewCartBtn.click(); // refresh
    };

    li.appendChild(removeBtn);
    cartItems.appendChild(li);
});
    // TOTAL LINE
    const totalLi = document.createElement("li");
    totalLi.style.fontWeight = "bold";
    totalLi.textContent = "Total = ₹" + totalPrice;

    cartItems.appendChild(totalLi);

    popup.classList.add("show");
};

sendWhatsApp.onclick = () => {

    let message = "Hello, I want to order:\n\n";

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        message += `${item.name} - ${item.qty} ${item.unit} = ₹${itemTotal}\n`;
    });

    message += `\nTOTAL: ₹${totalPrice}`;
    message += "\n\nPlease confirm order and delivery.";

    const url = `https://wa.me/917322073770?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
};

};