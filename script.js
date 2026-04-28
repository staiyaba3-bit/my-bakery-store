/**
 * Dad Bakery - Shopping Cart Logic
 * Refactored for stability, readability, and better cart management.
 */

// --- Preloader Logic ---
// We use 'load' event because it waits for ALL images and assets to finish downloading
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // A tiny 300ms delay ensures the animation feels deliberate and smooth
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, 300);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // --- Application State ---
    // Load cart from localStorage or start empty if nothing exists
    let cart = JSON.parse(localStorage.getItem('dadbakery_cart')) || [];
    let totalPrice = 0;

    // --- DOM Elements ---
    const viewCartBtn = document.getElementById("viewCartBtn");
    const popup = document.getElementById("cartPopup");
    const cartItemsList = document.getElementById("cartItems");
    const closeCartBtn = document.getElementById("closeCart");
    const sendWhatsAppBtn = document.getElementById("sendWhatsApp");
    const productCards = document.querySelectorAll('.card');

    // Make sure critical elements exist before proceeding
    if (!viewCartBtn || !popup) {
        console.error("Critical cart elements are missing from the DOM.");
        return;
    }

    // --- Toast Notification Logic ---
    let toastTimeout;
    function showToast(message) {
        let toast = document.getElementById("toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "toast";
            toast.className = "toast";
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }

    // --- Product Cards Logic ---
    productCards.forEach(card => {
        // Query interactive elements within this specific card
        const plusBtn = card.querySelector('.plus');
        const minusBtn = card.querySelector('.minus');
        const qtyDisplay = card.querySelector('.qty');
        const addBtn = card.querySelector('.add-to-cart');
        
        // Query product details
        const nameEl = card.querySelector('h4');
        const imgEl = card.querySelector('img');
        const priceEl = card.querySelectorAll('p')[0]; // Assuming first <p> contains the price
        
        // Defensive programming: skip if this card is missing expected elements
        if (!plusBtn || !minusBtn || !qtyDisplay || !addBtn || !nameEl || !priceEl) return;

        // Extract static product info once to optimize performance
        const name = nameEl.innerText.trim();
        const unit = card.getAttribute("data-unit") || "item";
        
        // UNIQUE ID CREATION: 
        // Since multiple products have the same name (e.g., "Rohit Jar Biscuit"), 
        // we combine the name and image source to create a unique identifier.
        const imgSrc = imgEl ? imgEl.getAttribute('src') : 'no-img';
        const productId = `${name}-${imgSrc}`; 
        
        // Extract numeric price from text (e.g., "₹140/jar" -> 140)
        const price = parseInt(priceEl.innerText.replace(/[^0-9]/g, ''), 10);

        let currentQty = 1;

        // Event: Increase quantity
        plusBtn.addEventListener('click', () => {
            currentQty++;
            qtyDisplay.textContent = currentQty;
        });

        // Event: Decrease quantity (prevents going below 1)
        minusBtn.addEventListener('click', () => {
            if (currentQty > 1) {
                currentQty--;
                qtyDisplay.textContent = currentQty;
            }
        });

        // Event: Add to Cart
        addBtn.addEventListener('click', () => {
            // Check if this exact item already exists in the cart array
            const existingItem = cart.find(item => item.id === productId);

            if (existingItem) {
                // If it exists, just increase the quantity
                existingItem.qty += currentQty;
            } else {
                // If it's a new item, add the object to the cart array
                cart.push({
                    id: productId,
                    name: name,
                    qty: currentQty,
                    unit: unit,
                    price: price
                });
            }

            // RESET UX: Reset the UI quantity box back to 1 after adding
            currentQty = 1;
            qtyDisplay.textContent = currentQty;

            renderCart(); // Update floating button badge immediately
            showToast(`🛒 ${name} added to cart!`);
            
            // Animate the cart badge using Web Animations API (JS only)
            const badge = viewCartBtn.querySelector('.cart-badge');
            if (badge && typeof badge.animate === 'function') {
                badge.animate([
                    { transform: 'scale(1)' },
                    { transform: 'scale(1.5)', backgroundColor: '#fff', color: 'var(--clr-accent)' },
                    { transform: 'scale(1)' }
                ], { duration: 400, easing: 'ease-out' });
            }
        });
    });

    // --- Cart Rendering Logic ---
    
    /**
     * Updates the cart popup UI based on the current cart array state.
     */
    function renderCart() {
        // Save current cart state to browser storage every time we update the UI
        localStorage.setItem('dadbakery_cart', JSON.stringify(cart));

        // Clear current list to prevent duplicates
        cartItemsList.innerHTML = "";
        totalPrice = 0;
        
        // Calculate total items for the badges
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        
        // Update Floating Button text to show item count
        viewCartBtn.innerHTML = `🛒 View Cart <span class="cart-badge">${totalItems}</span>`;

        // Update Cart Header inside popup
        const cartHeader = document.querySelector('.popup-content h2');
        if (cartHeader) {
            cartHeader.innerHTML = `Your Cart <span class="cart-badge">${totalItems} items</span>`;
        }

        if (cart.length === 0) {
            cartItemsList.innerHTML = "<li style='text-align:center; padding: 20px; color: var(--clr-text-muted);'>Your cart is empty.</li>";
            return;
        }

        // Render each item dynamically
        cart.forEach(item => {
            const itemTotal = item.price * item.qty;
            totalPrice += itemTotal;

            const li = document.createElement("li");
            li.style.marginBottom = "15px";
            li.style.alignItems = "flex-start";

            // Left side: Item Details & Controls
            const detailsDiv = document.createElement("div");
            detailsDiv.className = "cart-item-details";

            const titleSpan = document.createElement("div");
            titleSpan.className = "cart-item-title";
            titleSpan.textContent = item.name;

            const controlsDiv = document.createElement("div");
            controlsDiv.className = "cart-item-controls";

            // Decrease Quantity inside Cart
            const minusBtn = document.createElement("button");
            minusBtn.className = "cart-qty-btn";
            minusBtn.textContent = "-";
            minusBtn.addEventListener('click', () => {
                if (item.qty > 1) {
                    item.qty--;
                    renderCart(); // Re-render to instantly update totals
                    showToast("🔄 Cart updated");
                }
            });

            const qtySpan = document.createElement("span");
            qtySpan.style.fontWeight = "600";
            qtySpan.style.width = "20px";
            qtySpan.style.textAlign = "center";
            qtySpan.textContent = item.qty;

            // Increase Quantity inside Cart
            const plusBtn = document.createElement("button");
            plusBtn.className = "cart-qty-btn";
            plusBtn.textContent = "+";
            plusBtn.addEventListener('click', () => {
                item.qty++;
                renderCart(); // Re-render to instantly update totals
                showToast("🔄 Cart updated");
            });
            
            const unitPrice = document.createElement("span");
            unitPrice.style.fontSize = "0.85rem";
            unitPrice.style.color = "var(--clr-text-muted)";
            unitPrice.style.marginLeft = "10px";
            unitPrice.textContent = `(₹${item.price}/${item.unit})`;

            controlsDiv.appendChild(minusBtn);
            controlsDiv.appendChild(qtySpan);
            controlsDiv.appendChild(plusBtn);
            controlsDiv.appendChild(unitPrice);

            detailsDiv.appendChild(titleSpan);
            detailsDiv.appendChild(controlsDiv);

            // Right side: Total Price & Remove Button
            const rightDiv = document.createElement("div");
            rightDiv.style.display = "flex";
            rightDiv.style.flexDirection = "column";
            rightDiv.style.alignItems = "flex-end";

            const priceSpan = document.createElement("div");
            priceSpan.className = "cart-item-price";
            priceSpan.textContent = `₹${itemTotal}`;

            const removeBtn = document.createElement("button");
            removeBtn.className = "cart-remove-btn";
            removeBtn.textContent = "Remove";
            removeBtn.addEventListener('click', () => {
                // Filter out the specific item using its unique ID
                cart = cart.filter(i => i.id !== item.id);
                renderCart(); // Re-render the UI
            });

            rightDiv.appendChild(priceSpan);
            rightDiv.appendChild(removeBtn);

            li.appendChild(detailsDiv);
            li.appendChild(rightDiv);
            cartItemsList.appendChild(li);
        });

        // Render Total Line at the bottom
        const totalLi = document.createElement("li");
        totalLi.style.fontWeight = "bold";
        totalLi.style.fontSize = "1.2rem";
        totalLi.style.marginTop = "15px";
        totalLi.style.borderTop = "2px solid var(--clr-border)";
        totalLi.style.paddingTop = "15px";
        totalLi.style.display = "flex";
        totalLi.style.justifyContent = "space-between";
        
        const totalLabel = document.createElement("span");
        totalLabel.textContent = "Total Amount:";
        
        const totalValue = document.createElement("span");
        totalValue.style.color = "var(--clr-accent)";
        totalValue.textContent = `₹${totalPrice}`;

        totalLi.appendChild(totalLabel);
        totalLi.appendChild(totalValue);
        
        cartItemsList.appendChild(totalLi);
    }
    
    // Initialize cart state to show 0 on floating button on load
    renderCart();

    // --- Event Listeners for Cart Controls ---

    // Event: Open Cart Popup
    viewCartBtn.addEventListener('click', () => {
        renderCart(); // Always ensure fresh data is shown
        popup.classList.add("show");
    });

    // Event: Close Cart Popup
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            popup.classList.remove("show");
        });
    }

    // Event: Send WhatsApp Order
    if (sendWhatsAppBtn) {
        sendWhatsAppBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast("⚠️ Please add items to your cart first!");
                return;
            }

            // Construct professional WhatsApp message
            let message = "*Hello My Bakery Store! I would like to place an order:*\n\n";
            message += "*ORDER DETAILS:*\n";
            message += "--------------------------------------\n";

            cart.forEach(item => {
                const itemTotal = item.price * item.qty;
                message += `*${item.name}*\n`;
                message += `      Qty: ${item.qty} ${item.unit}  |  ₹${itemTotal}\n`;
            });

            message += "--------------------------------------\n";
            message += `*GRAND TOTAL: ₹${totalPrice}*\n\n`;
            
            message += "*Customer Details & Notes:*\n";
            message += "Name: [Enter Your Name]\n";
            message += "Address: [Enter Delivery Address]\n";
            message += "Notes: [Any special requests?]\n\n";
            
            message += "Please confirm my order and delivery. Thank you!";

            // Generate WhatsApp API URL
            const phoneNumber = "917905520249";
            const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            
            // Open in new tab
            window.open(url, "_blank");
        });
    }

    // --- Live Search Feature ---
    const searchInput = document.getElementById("searchInput");
    
    if (searchInput) {
        // "input" event fires immediately every time the user types or deletes a character
        searchInput.addEventListener("input", function() {
            // Get what the user typed and convert it to lowercase
            const query = searchInput.value.toLowerCase();

            // Loop through all product cards
            productCards.forEach(card => {
                // Get the product name from the <h4> tag inside this card
                const productName = card.querySelector("h4").innerText.toLowerCase();

                // Check if the product name contains the typed text
                if (productName.includes(query)) {
                    card.style.display = "block"; // Show product if it matches
                } else {
                    card.style.display = "none";  // Hide product if it doesn't match
                }
            });
        });
    }

    // --- Professional Navbar Logic ---
    const header = document.getElementById('main-header');
    const menuBtn = document.getElementById('menuBtn');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    // 1. Mobile Hamburger Toggle
    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('open');
            navMenu.classList.toggle('open');
        });
    }

    // 2. Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (menuBtn && menuBtn.classList.contains('open')) {
                menuBtn.classList.remove('open');
                navMenu.classList.remove('open');
            }
        });
    });

    // 3. Scroll Spy (Active Link) & Sticky Shadow
    if (header && sections.length > 0) {
        window.addEventListener('scroll', () => {
            // Add subtle shadow to header when scrolling down
            if (window.scrollY > 20) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            // Find out which section is currently in view
            let currentId = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                // We subtract 150 to account for the height of the sticky header
                if (window.scrollY >= (sectionTop - 150)) {
                    currentId = section.getAttribute('id');
                }
            });

            // Update active class on nav links
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (currentId && link.getAttribute('href') === `#${currentId}`) {
                    link.classList.add('active');
                }
            });
        });
    }

});