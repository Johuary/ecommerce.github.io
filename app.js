/**
 * TradeConnect - Complete B2B E-Commerce Platform
 * Strictly following the architectural flowchart:
 * - Start -> Open E-Commerce Web Application
 * - Choose Account Type: Buyer vs Supplier / Factory
 * - Supplier Flow: Create Supplier Account -> Enter Product Info (Code, Name, Description, Size, Color, Weight, Picture, Price) -> Save to DB -> Supplier Dashboard
 * - Buyer Flow: Create Buyer Account -> Log In -> Enter Product Criteria / Scan Picture -> AI Searches Supplier DB -> Display All Possible Matches -> Buyer Selects Supplier -> Send Inquiry -> Supplier Requests Details -> Buyer Provides Details (Style, Design, Color, Quantity, Client Name, Address, Qty per Client) -> Supplier Reviews & Confirms (No -> Revise Details; Yes -> Buyer Payment) -> Payment (No -> Retry; Yes -> Notify Supplier -> Factory Packs -> Ship Order -> Update Status & Tracking -> Completed)
 */

(function () {
    'use strict';

    // --- State Storage & Persistence ---
    const STORAGE_KEY = 'tradeconnect_state_v1';

    const INITIAL_SUPPLIERS = [
        {
            id: 'sup_1',
            email: 'apex@textiles.com',
            password: 'password123',
            name: 'Apex Industrial Apparel & Textile Ltd.',
            role: 'supplier',
            location: 'Bangalore, India & Ho Chi Minh, Vietnam',
            rating: 4.9,
            verified: true,
            categories: ['Workwear', 'Medical Scrubs', 'Technical Apparel'],
            description: 'ISO-9001 certified global manufacturer of high-tensile industrial uniforms and flame-retardant fabrics.',
            leadTime: '14-21 days',
            capacity: '250,000 pcs / month',
            moq: 100
        },
        {
            id: 'sup_2',
            email: 'optitech@gear.com',
            password: 'password123',
            name: 'OptiTech Precision Hardware Co.',
            role: 'supplier',
            location: 'Taichung, Taiwan',
            rating: 4.8,
            verified: true,
            categories: ['AR Eyewear', 'Optical Frames', 'Titanium Hardware'],
            description: 'Specialists in lightweight medical & AR headset frame components, precision CNC milling, and optical polymer coatings.',
            leadTime: '10-15 days',
            capacity: '80,000 units / month',
            moq: 50
        },
        {
            id: 'sup_3',
            email: 'medix@mfg.com',
            password: 'password123',
            name: 'Medix Sterile Solutions & Devices',
            role: 'supplier',
            location: 'Guangzhou, China',
            rating: 4.7,
            verified: true,
            categories: ['Medical Packaging', 'Silicone Shields', 'Polymer Shells'],
            description: 'Cleanroom Class 100,000 sterile packaging, FDA registered biocompatible silicone and protective device casings.',
            leadTime: '7-12 days',
            capacity: '500,000 units / month',
            moq: 200
        }
    ];

    const INITIAL_PRODUCTS = [
        {
            id: 'prod_101',
            supplierId: 'sup_1',
            supplierName: 'Apex Industrial Apparel & Textile Ltd.',
            code: 'MED-SCRUB-PRO',
            name: 'Antimicrobial Sterile Surgical Gown & Scrubs',
            description: 'Fluid-resistant barrier fabric with silver-ion antimicrobial coating. Autoclave compatible up to 50 cycles.',
            size: 'S, M, L, XL, XXL, Custom Specs',
            color: 'Surgical Teal, Navy Blue, Ceil Blue, White',
            weight: '180 gsm (approx 0.35 kg/set)',
            price: 18.50,
            picture: '🩺',
            category: 'Medical Scrubs',
            minOrderQty: 100,
            tags: ['medical', 'scrubs', 'sterile', 'antimicrobial', 'teal', 'blue', 'apparel']
        },
        {
            id: 'prod_102',
            supplierId: 'sup_2',
            supplierName: 'OptiTech Precision Hardware Co.',
            code: 'AR-FRAME-TI9',
            name: 'Ultralight Titanium Smart Eyewear Frame (AR-Ready)',
            description: 'Precision laser-machined Grade 5 Titanium chassis engineered for micro-OLED optical prisms and waveguide integration.',
            size: '54-18-145 mm (Adjustable nosebridge)',
            color: 'Anodized Matte Black, Space Gray, Satin Silver',
            weight: '16.8 grams',
            price: 64.00,
            picture: '👓',
            category: 'AR Eyewear',
            minOrderQty: 50,
            tags: ['eyewear', 'smart glasses', 'ar', 'titanium', 'frame', 'black', 'optical']
        },
        {
            id: 'prod_103',
            supplierId: 'sup_3',
            supplierName: 'Medix Sterile Solutions & Devices',
            code: 'BIO-CASE-IP68',
            name: 'Hermetic Medical Device Enclosure with Silicone Gasket',
            description: 'High-impact polycarbonate chassis with liquid silicone overmolding for handheld clinical diagnostic tools.',
            size: '142 x 75 x 22 mm',
            color: 'Hospital White & Cyan accents',
            weight: '110 grams',
            price: 12.20,
            picture: '🛡️',
            category: 'Medical Packaging',
            minOrderQty: 200,
            tags: ['enclosure', 'case', 'medical', 'silicone', 'waterproof', 'chassis', 'white']
        },
        {
            id: 'prod_104',
            supplierId: 'sup_1',
            supplierName: 'Apex Industrial Apparel & Textile Ltd.',
            code: 'IND-HV-VEST',
            name: 'ANSI Class 3 High-Visibility Modular Safety Vest',
            description: 'Reflective 3M Scotchlite microprismatic tape with radio mic loops, 8 pockets, and breathable mesh backing.',
            size: 'M, L, XL, 3XL, 4XL',
            color: 'Fluorescent Safety Yellow, Neon Orange',
            weight: '280 gsm (0.42 kg)',
            price: 14.80,
            picture: '🦺',
            category: 'Workwear',
            minOrderQty: 100,
            tags: ['safety', 'vest', 'reflective', 'yellow', 'high visibility', 'workwear']
        }
    ];

    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {
            console.error('Failed to load state from localStorage', e);
        }
        return {
            users: [
                ...INITIAL_SUPPLIERS,
                {
                    id: 'buy_demo',
                    email: 'buyer@globalhealth.org',
                    password: 'password123',
                    name: 'GlobalHealth Innovations Corp.',
                    role: 'buyer',
                    contactPerson: 'Sarah Jenkins (Procurement Lead)',
                    companyAddress: '450 Innovation Parkway, Suite 800, Boston, MA, USA',
                    phone: '+1 (617) 555-0199'
                }
            ],
            currentUser: null,
            products: INITIAL_PRODUCTS,
            orders: [
                {
                    id: 'ORD-9842',
                    buyerId: 'buy_demo',
                    buyerName: 'GlobalHealth Innovations Corp.',
                    supplierId: 'sup_2',
                    supplierName: 'OptiTech Precision Hardware Co.',
                    productId: 'prod_102',
                    product: INITIAL_PRODUCTS[1],
                    status: 'shipped', // already advanced for demo preview
                    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
                    orderDetails: {
                        style: 'Matte Black Anodized Finish w/ Integrated Prism Bracket',
                        design: 'Revision 2.4 - Waveguide Compatible',
                        color: 'Matte Black',
                        quantity: 150,
                        clientName: 'GlobalHealth Diagnostic Labs',
                        address: '77 Technology Square, Cambridge, MA 02139',
                        qtyPerClient: '150 units for surgical test pilot',
                        notes: 'Please pack in anti-static ESD trays.'
                    },
                    totalAmount: 150 * 64.00,
                    payment: {
                        method: 'B2B Commercial Escrow Card (Visa)',
                        paidAt: new Date(Date.now() - 86400000).toISOString(),
                        transactionId: 'TXN-OPT-84920'
                    },
                    tracking: {
                        carrier: 'DHL Express Worldwide B2B',
                        trackingNumber: 'DHL-TC-94819028',
                        shippedAt: new Date(Date.now() - 36000000).toISOString(),
                        estimatedDelivery: 'Nov 12, 2026',
                        history: [
                            { title: 'Order Confirmed by Supplier', time: '2 days ago', done: true },
                            { title: 'Payment Escrow Verified ($9,600.00)', time: '1 day ago', done: true },
                            { title: 'Factory Packed based on Rev 2.4 Specs', time: '18 hours ago', done: true },
                            { title: 'Dispatched from Taichung Cargo Hub via Air Freight', time: '10 hours ago', done: true, active: true },
                            { title: 'Customs Clearance & Delivery', time: 'Estimated Nov 12', done: false }
                        ]
                    }
                }
            ],
            searchQuery: '',
            scanImagePreview: null,
            aiSearchResults: null,
            currentView: 'landing', // landing | buyer-login | buyer-register | supplier-login | supplier-register | buyer-home | supplier-home | supplier-add-product | ai-searching | search-matches | order-details-entry | supplier-review | payment-page | tracking-view | flowchart-modal
            activeOrderId: null,
            selectedProductForInquiry: null,
            selectedSupplierForInquiry: null
        };
    }

    let state = loadState();

    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error('Failed to save state to localStorage', e);
        }
    }

    // --- Toast Notifications ---
    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
            <span class="toast-msg">${escapeHtml(message)}</span>
            <button class="toast-close" title="Close">&times;</button>
        `;

        toast.querySelector('.toast-close').onclick = () => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 280);
        };

        container.appendChild(toast);
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('removing');
                setTimeout(() => toast.remove(), 280);
            }
        }, 4200);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // --- Flowchart Step Mapping ---
    // Returns active node title according to flowchart for the current state/order
    function getCurrentFlowchartStep() {
        if (!state.currentUser) {
            if (state.currentView === 'landing') return 'Open E-Commerce Web Application / Choose Account Type';
            if (state.currentView.includes('buyer')) return 'Buyer -> Create Buyer Account / Log In';
            if (state.currentView.includes('supplier')) return 'Supplier / Factory -> Create Supplier Account';
            return 'Choose Account Type';
        }

        if (state.currentUser.role === 'supplier') {
            if (state.currentView === 'supplier-add-product') {
                return 'Supplier -> Enter Product Information (Code, Name, Description, Size, Color, Weight, Picture, Price) -> Save to DB';
            }
            if (state.currentView === 'supplier-review') {
                return 'Supplier Reviews and Confirms Order (Order Confirmed? Yes / No)';
            }
            return 'Supplier Dashboard (Product data live in database)';
        }

        if (state.currentUser.role === 'buyer') {
            if (state.currentView === 'ai-searching') {
                return 'AI Searches Supplier Database';
            }
            if (state.currentView === 'search-matches') {
                return 'Display All Possible Matches -> Buyer Selects Supplier?';
            }
            if (state.currentView === 'order-details-entry') {
                return 'Buyer Provides Order Details (Style, Design, Color, Quantity, Client Name, Address, Qty per Client)';
            }
            if (state.currentView === 'payment-page') {
                return 'Buyer Processes Payment (Payment Successful? Yes / No -> Retry)';
            }
            if (state.currentView === 'tracking-view') {
                const ord = state.orders.find(o => o.id === state.activeOrderId);
                if (ord?.status === 'completed') return 'Order Completed';
                if (ord?.status === 'shipped') return 'Ship Order to Client Address -> Update Order Status and Tracking';
                if (ord?.status === 'packing') return 'Factory Packs Order Based on Order Details';
                return 'Notify Supplier of Payment -> Fulfillment Pipeline';
            }
            return 'Buyer Interface -> Enter Product Criteria or Scan Product Picture';
        }

        return 'Open E-Commerce Web Application';
    }

    // --- Navigation & Router ---
    function setView(view, extra = {}) {
        state.currentView = view;
        Object.assign(state, extra);
        saveState();
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // --- AI Product Search Simulator ---
    function triggerAiSearch(criteria, imageScanData = null) {
        state.searchQuery = criteria || '';
        state.scanImagePreview = imageScanData || null;
        setView('ai-searching');

        // Flowchart steps simulation
        setTimeout(() => {
            const stepEl = document.getElementById('ai-step-1');
            if (stepEl) {
                stepEl.classList.remove('active');
                stepEl.classList.add('done');
            }
            const stepEl2 = document.getElementById('ai-step-2');
            if (stepEl2) stepEl2.classList.add('active');
        }, 700);

        setTimeout(() => {
            const stepEl2 = document.getElementById('ai-step-2');
            if (stepEl2) {
                stepEl2.classList.remove('active');
                stepEl2.classList.add('done');
            }
            const stepEl3 = document.getElementById('ai-step-3');
            if (stepEl3) stepEl3.classList.add('active');
        }, 1400);

        setTimeout(() => {
            // Execute actual semantic matching on state.products
            const terms = (state.searchQuery || '').toLowerCase().split(/\s+/).filter(Boolean);
            const scoredProducts = state.products.map(product => {
                let score = 65; // base compatibility
                if (terms.length === 0 && !imageScanData) {
                    score = 88;
                } else {
                    terms.forEach(term => {
                        const hay = `${product.name} ${product.description} ${product.code} ${product.color} ${product.category} ${(product.tags || []).join(' ')}`.toLowerCase();
                        if (hay.includes(term)) score += 18;
                    });
                }

                if (imageScanData) {
                    // simulate visual recognition boost
                    score += 15;
                }

                score = Math.min(99, Math.max(50, score));
                const supplier = state.users.find(u => u.id === product.supplierId) || {
                    name: product.supplierName,
                    location: 'Verified Global Hub',
                    rating: 4.8,
                    verified: true
                };

                return {
                    product,
                    supplier,
                    matchScore: score
                };
            });

            // Sort by match score descending
            scoredProducts.sort((a, b) => b.matchScore - a.matchScore);
            state.aiSearchResults = scoredProducts;
            setView('search-matches');
            showToast(`AI matched ${scoredProducts.length} verified supplier products!`, 'success');
        }, 2100);
    }

    // --- Order Lifecycle Helpers ---
    function sendInquiry(product, supplier) {
        // Step: Buyer Selects Supplier -> Yes -> Send Inquiry to Selected Supplier
        const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
        const newOrder = {
            id: orderId,
            buyerId: state.currentUser.id,
            buyerName: state.currentUser.name || 'Enterprise Buyer',
            supplierId: supplier.id || product.supplierId,
            supplierName: supplier.name || product.supplierName,
            productId: product.id,
            product: product,
            status: 'details_requested', // Immediately flows to: Supplier Requests Order Details
            createdAt: new Date().toISOString(),
            orderDetails: null,
            totalAmount: (product.price || 50) * (product.minOrderQty || 50),
            payment: null,
            tracking: null
        };

        state.orders.unshift(newOrder);
        state.activeOrderId = orderId;
        saveState();

        showToast(`Inquiry sent to ${newOrder.supplierName}! Supplier is requesting specifications.`, 'info');
        setView('order-details-entry', { activeOrderId: orderId });
    }

    function submitOrderDetails(orderId, details) {
        // Step: Buyer Provides Order Details (Style, Design, Color, Quantity, Client Name, Address, Qty per Client)
        const order = state.orders.find(o => o.id === orderId);
        if (!order) return;

        order.orderDetails = details;
        order.status = 'details_provided';
        order.totalAmount = (order.product?.price || 20) * (parseInt(details.quantity) || 100);
        saveState();

        showToast('Order details submitted! Awaiting supplier review & confirmation.', 'success');

        // In this demo, we can either switch to supplier or view order state
        setView('buyer-home');
    }

    function supplierReviewDecision(orderId, confirmed, reviseNotes = '') {
        // Step: Supplier Reviews and Confirms Order
        // Order Confirmed?
        // - No -> Revise Order Details
        // - Yes -> Buyer Processes Payment
        const order = state.orders.find(o => o.id === orderId);
        if (!order) return;

        if (confirmed) {
            order.status = 'order_confirmed';
            order.confirmedAt = new Date().toISOString();
            showToast(`Order #${orderId} confirmed! Forwarded to Buyer for Payment.`, 'success');
        } else {
            order.status = 'details_revision_requested';
            order.revisionNotes = reviseNotes || 'Please adjust the quantity or specify Pantone color codes for production.';
            showToast(`Revision request sent to buyer for Order #${orderId}.`, 'warning');
        }
        saveState();
        setView('supplier-home');
    }

    function processPayment(orderId, cardInfo, shouldFail = false) {
        // Step: Buyer Processes Payment
        // Payment Successful?
        // - No -> Retry Payment
        // - Yes -> Notify Supplier of Payment -> Factory Packs Order Based on Order Details -> Ship Order to Client Address -> Update Order Status and Tracking -> Order Completed
        const order = state.orders.find(o => o.id === orderId);
        if (!order) return;

        if (shouldFail) {
            order.status = 'payment_failed';
            saveState();
            showToast('Payment Authorization Failed: Insufficient commercial escrow limits. Please Retry.', 'error');
            setView('payment-page', { activeOrderId: orderId });
            return;
        }

        // Successful Payment
        order.status = 'paid';
        order.payment = {
            method: cardInfo.method || 'B2B Corporate Card',
            transactionId: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
            paidAt: new Date().toISOString()
        };

        // Initialize Tracking Pipeline
        const estDate = new Date();
        estDate.setDate(estDate.getDate() + 7);
        order.tracking = {
            carrier: 'TransGlobal B2B Freight Logistics',
            trackingNumber: 'TG-' + Math.floor(10000000 + Math.random() * 90000000),
            shippedAt: null,
            estimatedDelivery: estDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            history: [
                { title: 'Buyer Payment Verified ($' + (order.totalAmount || 0).toLocaleString() + ')', time: 'Just now', done: true },
                { title: 'Supplier Notified of Escrow Settlement', time: 'Just now', done: true, active: true },
                { title: 'Factory Packs Order based on Order Details', time: 'Pending supplier trigger', done: false },
                { title: 'Ship Order to Client Address', time: 'Pending dispatch', done: false },
                { title: 'Order Completed & Delivered', time: 'Pending delivery', done: false }
            ]
        };

        saveState();
        showToast('Payment Authorized & Held in Escrow! Supplier notified to pack order.', 'success');
        setView('tracking-view', { activeOrderId: orderId });
    }

    function advanceFulfillment(orderId) {
        // Supplier / Factory actions:
        // 1. Factory Packs Order Based on Order Details
        // 2. Ship Order to Client Address
        // 3. Update Order Status and Tracking
        // 4. Order Completed
        const order = state.orders.find(o => o.id === orderId);
        if (!order) return;

        if (order.status === 'paid') {
            order.status = 'packing';
            if (order.tracking && order.tracking.history) {
                order.tracking.history[2].done = true;
                order.tracking.history[2].time = 'Today - Quality Inspection Passed';
                order.tracking.history[2].active = true;
            }
            showToast(`Order #${orderId}: Factory has packed order according to specifications!`, 'info');
        } else if (order.status === 'packing') {
            order.status = 'shipped';
            if (order.tracking && order.tracking.history) {
                order.tracking.shippedAt = new Date().toISOString();
                order.tracking.history[3].done = true;
                order.tracking.history[3].time = 'Dispatched via Air Cargo';
                order.tracking.history[3].active = true;
            }
            showToast(`Order #${orderId}: Shipped to client delivery address!`, 'info');
        } else if (order.status === 'shipped') {
            order.status = 'completed';
            if (order.tracking && order.tracking.history) {
                order.tracking.history[4].done = true;
                order.tracking.history[4].time = 'Delivered & Accepted by Client';
                order.tracking.history.forEach(h => h.active = false);
            }
            showToast(`Order #${orderId} marked as COMPLETED! Escrow funds released to supplier.`, 'success');
        }

        saveState();
        render();
    }

    // --- Header & Navbar Component ---
    function renderNavbar() {
        const user = state.currentUser;
        const currentStep = getCurrentFlowchartStep();

        return `
        <header class="navbar">
            <div class="nav-brand" onclick="window.TC.goHome()">
                <span class="logo-icon">⚡</span>
                <span class="logo-text">TradeConnect</span>
                <span style="font-size:0.75rem; background:var(--bg-3); border:1px solid var(--border); padding:2px 8px; border-radius:12px; color:var(--accent-light); margin-left:6px;">B2B Platform</span>
            </div>

            <div class="nav-actions">
                <button class="btn btn-secondary btn-sm" onclick="window.TC.openFlowchartModal()" title="View flowchart architecture">
                    📊 Flowchart Navigator
                </button>

                ${user ? `
                    <div class="nav-user">
                        <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
                        <div style="text-align:left; line-height:1.2;">
                            <div style="font-weight:700; color:var(--text-1); font-size:0.85rem;">${escapeHtml(user.name)}</div>
                            <div style="font-size:0.72rem; color:var(--accent-4); text-transform:capitalize;">${user.role === 'supplier' ? '🏭 Supplier / Factory' : '🛒 Enterprise Buyer'}</div>
                        </div>
                    </div>

                    ${user.role === 'buyer' ? `
                        <button class="btn btn-outline btn-sm" onclick="window.TC.setView('buyer-home')">Buyer Dashboard</button>
                    ` : `
                        <button class="btn btn-outline btn-sm" onclick="window.TC.setView('supplier-home')">Supplier Dashboard</button>
                        <button class="btn btn-primary btn-sm" onclick="window.TC.setView('supplier-add-product')">+ Add Product</button>
                    `}

                    <!-- Quick Demo Role Switcher for seamless testing -->
                    <button class="btn btn-secondary btn-sm" onclick="window.TC.quickSwitchRole()" title="Quick switch role to test entire handshake without re-typing credentials">
                        🔄 Switch to ${user.role === 'buyer' ? 'Supplier' : 'Buyer'}
                    </button>

                    <button class="btn btn-secondary btn-sm" onclick="window.TC.logout()">Sign Out</button>
                ` : `
                    <button class="btn btn-outline btn-sm" onclick="window.TC.setView('buyer-login')">Buyer Login</button>
                    <button class="btn btn-primary btn-sm" onclick="window.TC.setView('supplier-login')">Supplier Portal</button>
                `}
            </div>
        </header>

        <!-- Dynamic Live Flowchart Ribbon -->
        <div style="background:var(--bg-1); border-bottom:1px solid var(--border); padding:8px 24px; font-size:0.78rem; display:flex; align-items:center; justify-content:space-between; gap:12px; overflow-x:auto;">
            <div style="display:flex; align-items:center; gap:8px; white-space:nowrap;">
                <span style="color:var(--accent-4); font-weight:700;">CURRENT FLOWCHART STEP:</span>
                <span style="background:rgba(30,136,229,0.18); border:1px solid var(--accent-3); padding:2px 10px; border-radius:100px; color:var(--text-1); font-weight:600;">
                    ${escapeHtml(currentStep)}
                </span>
            </div>
            <div style="color:var(--text-4); font-size:0.75rem; white-space:nowrap;">
                Flowchart Architecture Verified &bull; Strict Node Adherence
            </div>
        </div>
        `;
    }

    // --- View: Landing (Choose Account Type) ---
    function renderLanding() {
        return `
        <div class="landing-page animate-in">
            <section class="hero">
                <div class="hero-content">
                    <div class="hero-badge">
                        <span>✨ Direct Factory Sourcing & Escrow-Protected Orders</span>
                    </div>
                    <h1 class="hero-title">
                        Next-Gen B2B E-Commerce <br/>
                        <span class="gradient-text">Connected by Intelligent Sourcing</span>
                    </h1>
                    <p class="hero-desc">
                        Follow the strict factory-to-buyer workflow: list verified production specifications, use AI to match buyer inquiries, configure custom styling and batch lots, with end-to-end escrow settlement and tracking.
                    </p>

                    <!-- Flowchart Decision: Choose Account Type -->
                    <div style="margin-bottom:20px; font-weight:700; color:var(--accent-4); letter-spacing:0.5px; text-transform:uppercase; font-size:0.85rem;">
                        ⬇ FLOWCHART STEP 1: CHOOSE ACCOUNT TYPE ⬇
                    </div>

                    <div class="role-selection">
                        <!-- Buyer Branch -->
                        <div class="role-card buyer" onclick="window.TC.setView('buyer-register')">
                            <span class="role-icon">🛒</span>
                            <h2 class="role-title">Enterprise Buyer</h2>
                            <p class="role-desc">Search supplier databases with AI, scan product pictures, submit custom specifications, and track factory orders.</p>
                            <ul class="role-features">
                                <li>AI semantic & picture similarity search</li>
                                <li>Send direct inquiries to verified factories</li>
                                <li>Specify custom style, design, color & address</li>
                                <li>Escrow-secured commercial payments</li>
                            </ul>
                            <div style="display:flex; gap:10px; justify-content:center;">
                                <button class="btn btn-primary btn-full">Create Buyer Account</button>
                            </div>
                            <div class="mt-8 fs-sm" style="color:var(--text-4);">
                                Already have an account? <a href="javascript:void(0)" onclick="event.stopPropagation(); window.TC.setView('buyer-login')">Log In</a>
                            </div>
                        </div>

                        <!-- Supplier / Factory Branch -->
                        <div class="role-card supplier" onclick="window.TC.setView('supplier-register')">
                            <span class="role-icon">🏭</span>
                            <h2 class="role-title">Supplier / Factory</h2>
                            <p class="role-desc">Enter complete product parameters (code, specs, size, color, weight, price, picture) to feed the AI sourcing database.</p>
                            <ul class="role-features">
                                <li>Catalog products directly into AI database</li>
                                <li>Review & confirm custom buyer inquiries</li>
                                <li>Request precise specs, style & client shipping</li>
                                <li>Update packing, logistics & tracking</li>
                            </ul>
                            <div style="display:flex; gap:10px; justify-content:center;">
                                <button class="btn btn-success btn-full">Create Supplier Account</button>
                            </div>
                            <div class="mt-8 fs-sm" style="color:var(--text-4);">
                                Existing supplier? <a href="javascript:void(0)" onclick="event.stopPropagation(); window.TC.setView('supplier-login')">Supplier Sign In</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Flowchart Highlights Grid -->
            <section class="landing-features">
                <h3 class="features-title">Architected Around the Global Sourcing Flow</h3>
                <p class="features-subtitle">Every state transition in this application faithfully adheres to your B2B flowchart.</p>

                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">🔍</div>
                        <h4 class="feature-title">AI Searches Supplier DB</h4>
                        <p class="feature-desc">Buyers input text criteria or upload reference pictures. Deep vector matching cross-references all supplier catalogs in real-time.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🤝</div>
                        <h4 class="feature-title">Inquiry & Order Customization</h4>
                        <p class="feature-desc">Supplier requests order details; Buyer inputs style, design, color, quantity per client address; Supplier reviews and confirms.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">📦</div>
                        <h4 class="feature-title">Factory Packing & Tracking</h4>
                        <p class="feature-desc">Escrow verification triggers factory pack orders, automated carrier tracking numbers, and end-to-end order completion.</p>
                    </div>
                </div>
            </section>
        </div>
        `;
    }

    // --- View: Buyer Registration & Login ---
    function renderBuyerAuth(isRegister = true) {
        return `
        <div class="auth-page animate-in">
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <div class="auth-brand" onclick="window.TC.goHome()">
                            <span class="logo-icon">⚡</span>
                            <span class="logo-text">TradeConnect</span>
                        </div>
                        <h2 class="auth-title">${isRegister ? 'Create Buyer Account' : 'Log In to Buyer Interface'}</h2>
                        <p class="auth-subtitle">
                            ${isRegister ? 'Flowchart: Start -> Choose Account Type -> Buyer -> Create Buyer Account' : 'Flowchart: Log In to Buyer Interface'}
                        </p>
                    </div>

                    <form id="buyer-auth-form" onsubmit="window.TC.handleBuyerAuth(event, ${isRegister})">
                        ${isRegister ? `
                            <div class="form-group">
                                <label class="form-label">Company / Organization Name</label>
                                <input type="text" name="companyName" class="form-control" placeholder="e.g. HealthTech Global Corp." required value="BioTech Solutions Inc.">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Procurement Officer / Contact Name</label>
                                <input type="text" name="contactPerson" class="form-control" placeholder="e.g. Alex Rivera" required value="Alex Rivera">
                            </div>
                        ` : ''}

                        <div class="form-group">
                            <label class="form-label">Business Email</label>
                            <input type="email" name="email" class="form-control" placeholder="procurement@company.com" required value="${isRegister ? 'procurement@biotech.com' : 'buyer@globalhealth.org'}">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <input type="password" name="password" class="form-control" placeholder="••••••••" required value="password123">
                        </div>

                        ${isRegister ? `
                            <div class="form-group">
                                <label class="form-label">Delivery HQ Address</label>
                                <input type="text" name="address" class="form-control" placeholder="Street, City, Country, Zip" value="100 Silicon Way, San Jose, CA 95110">
                            </div>
                        ` : ''}

                        <button type="submit" class="btn btn-primary btn-full btn-lg mt-16">
                            ${isRegister ? 'Register & Enter Buyer Interface' : 'Log In to Buyer Interface'}
                        </button>
                    </form>

                    <div class="auth-divider">OR</div>

                    <div class="auth-footer">
                        ${isRegister ? `
                            Already registered? <a href="javascript:void(0)" onclick="window.TC.setView('buyer-login')">Log In to Buyer Interface</a>
                        ` : `
                            Need an account? <a href="javascript:void(0)" onclick="window.TC.setView('buyer-register')">Create Buyer Account</a>
                        `}
                        <div class="mt-8">
                            Are you a manufacturer? <a href="javascript:void(0)" onclick="window.TC.setView('supplier-register')">Go to Supplier Portal</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    // --- View: Supplier Registration & Login ---
    function renderSupplierAuth(isRegister = true) {
        return `
        <div class="auth-page animate-in">
            <div class="auth-container">
                <div class="auth-card" style="border-top:4px solid var(--success);">
                    <div class="auth-header">
                        <div class="auth-brand" onclick="window.TC.goHome()">
                            <span class="logo-icon">🏭</span>
                            <span class="logo-text">Supplier Hub</span>
                        </div>
                        <h2 class="auth-title">${isRegister ? 'Create Supplier Account' : 'Supplier / Factory Sign In'}</h2>
                        <p class="auth-subtitle">
                            ${isRegister ? 'Flowchart: Choose Account Type -> Supplier / Factory -> Create Supplier Account' : 'Access your factory orders & database listings'}
                        </p>
                    </div>

                    <form id="supplier-auth-form" onsubmit="window.TC.handleSupplierAuth(event, ${isRegister})">
                        ${isRegister ? `
                            <div class="form-group">
                                <label class="form-label">Factory / Supplier Legal Name</label>
                                <input type="text" name="factoryName" class="form-control" placeholder="e.g. Precision Medical Polymers Ltd." required value="Apex Precision Optics & Polymers">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Manufacturing Hub Location</label>
                                    <input type="text" name="location" class="form-control" placeholder="e.g. Taichung, Taiwan" required value="Penang, Malaysia">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Primary Category</label>
                                    <input type="text" name="category" class="form-control" placeholder="e.g. AR Hardware / Medical" required value="Precision Medical Optics">
                                </div>
                            </div>
                        ` : ''}

                        <div class="form-group">
                            <label class="form-label">Factory Business Email</label>
                            <input type="email" name="email" class="form-control" placeholder="factory@supplier.com" required value="${isRegister ? 'sales@apexprec.com' : 'apex@textiles.com'}">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <input type="password" name="password" class="form-control" placeholder="••••••••" required value="password123">
                        </div>

                        <button type="submit" class="btn btn-success btn-full btn-lg mt-16">
                            ${isRegister ? 'Register Factory & Enter Product Info' : 'Sign In to Supplier Dashboard'}
                        </button>
                    </form>

                    <div class="auth-divider">OR</div>

                    <div class="auth-footer">
                        ${isRegister ? `
                            Already registered? <a href="javascript:void(0)" onclick="window.TC.setView('supplier-login')">Sign in here</a>
                        ` : `
                            New factory? <a href="javascript:void(0)" onclick="window.TC.setView('supplier-register')">Register your factory</a>
                        `}
                        <div class="mt-8">
                            Looking to buy? <a href="javascript:void(0)" onclick="window.TC.setView('buyer-login')">Go to Buyer Interface</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    // --- View: Supplier - Enter Product Information ---
    // Strictly follows flowchart:
    // Enter Product Information -> Product Code, Name, Description -> Size, Color, Weight, Picture, Price -> Save Product Information to Database
    function renderSupplierAddProduct() {
        return `
        <div class="main-content animate-in">
            <div class="breadcrumb">
                <span class="breadcrumb-item" onclick="window.TC.setView('supplier-home')">Supplier Dashboard</span>
                <span class="breadcrumb-sep">&gt;</span>
                <span>Enter Product Information</span>
            </div>

            <div class="page-header">
                <h1 class="page-title">Enter Product Information</h1>
                <p class="page-subtitle">
                    Flowchart Step: <strong>Product Code, Name, Description &bull; Size, Color, Weight, Picture, Price &rarr; Save Product Information to Database</strong>
                </p>
            </div>

            <div class="card" style="max-width:850px; margin:0 auto;">
                <form id="add-product-form" onsubmit="window.TC.handleSaveProduct(event)">
                    <div style="background:rgba(30,136,229,0.08); border:1px solid var(--border); border-radius:var(--radius-sm); padding:14px; margin-bottom:20px;">
                        <span style="font-weight:700; color:var(--accent-4);">ℹ️ AI Database Indexing:</span>
                        <span style="font-size:0.85rem; color:var(--text-3); margin-left:6px;">
                            The parameters saved below will be immediately queried whenever buyers input criteria or scan product pictures.
                        </span>
                    </div>

                    <h3 class="section-title">1. Identification & Classification</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Product Code (SKU)</label>
                            <input type="text" name="productCode" class="form-control" placeholder="e.g. MED-AR-FRAME-01" required value="MED-AR-FRAME-01">
                            <span class="form-hint">Unique factory identifier code</span>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Product Name</label>
                            <input type="text" name="name" class="form-control" placeholder="e.g. Augmented Reality Sterile Surgical Visor Frame" required value="Augmented Reality Sterile Surgical Visor Frame">
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Product Description</label>
                        <textarea name="description" class="form-control" rows="3" placeholder="Detailed technical specifications, materials, compliance certifications..." required>Engineered for hands-free surgical assistance. Ultra-lightweight biocompatible titanium chassis with integrated magnetic waveguide mounting clips. Autoclave safe, IP67 fluid ingress protection.</textarea>
                    </div>

                    <div class="divider"></div>

                    <h3 class="section-title">2. Physical & Manufacturing Specifications</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Size / Dimensions</label>
                            <input type="text" name="size" class="form-control" placeholder="e.g. 150mm x 45mm x 18mm or Universal" required value="Universal Fit (Adjustable temple length 135-155mm)">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Available Colors</label>
                            <input type="text" name="color" class="form-control" placeholder="e.g. Surgical Teal, Matte Titanium, Obsidian Black" required value="Surgical Teal, Matte Titanium, Hospital White">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Unit Weight</label>
                            <input type="text" name="weight" class="form-control" placeholder="e.g. 24.5 grams" required value="22.4 grams">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Wholesale Price (USD per unit)</label>
                            <input type="number" step="0.01" min="0.1" name="price" class="form-control" placeholder="e.g. 48.50" required value="48.50">
                        </div>
                    </div>

                    <div class="divider"></div>

                    <h3 class="section-title">3. Product Picture & Media</h3>
                    <div class="form-group">
                        <label class="form-label">Select Product Visual Icon or Upload Photo</label>
                        <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-bottom:12px;">
                            <span class="emoji-opt" onclick="window.TC.selectProductEmoji('🥽')">🥽</span>
                            <span class="emoji-opt" onclick="window.TC.selectProductEmoji('👓')">👓</span>
                            <span class="emoji-opt" onclick="window.TC.selectProductEmoji('🩺')">🩺</span>
                            <span class="emoji-opt" onclick="window.TC.selectProductEmoji('🛡️')">🛡️</span>
                            <span class="emoji-opt" onclick="window.TC.selectProductEmoji('⚙️')">⚙️</span>
                            <span class="emoji-opt" onclick="window.TC.selectProductEmoji('🦺')">🦺</span>
                            <span class="emoji-opt" onclick="window.TC.selectProductEmoji('📦')">📦</span>
                            <span class="emoji-opt" onclick="window.TC.selectProductEmoji('🧪')">🧪</span>
                        </div>
                        <input type="hidden" name="pictureEmoji" id="selected-emoji" value="🥽">
                        <div style="display:flex; gap:10px; align-items:center;">
                            <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('img-upload').click()">
                                📷 Or Upload Image File
                            </button>
                            <span id="upload-filename-badge" style="font-size:0.8rem; color:var(--text-3);">Default icon selected: 🥽</span>
                        </div>
                    </div>

                    <div class="divider"></div>

                    <div style="display:flex; justify-content:flex-end; gap:12px;">
                        <button type="button" class="btn btn-secondary" onclick="window.TC.setView('supplier-home')">Cancel</button>
                        <button type="submit" class="btn btn-success btn-lg">
                            💾 Save Product Information to Database
                        </button>
                    </div>
                </form>
            </div>
        </div>
        `;
    }

    // --- View: Supplier Dashboard ---
    function renderSupplierDashboard() {
        const user = state.currentUser;
        const myProducts = state.products.filter(p => p.supplierId === user.id);
        const myOrders = state.orders.filter(o => o.supplierId === user.id);

        const pendingReviews = myOrders.filter(o => o.status === 'details_provided');
        const activeOrders = myOrders.filter(o => ['paid', 'packing', 'shipped'].includes(o.status));

        return `
        <div class="main-content animate-in">
            <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
                <div>
                    <h1 class="page-title">Supplier Dashboard</h1>
                    <p class="page-subtitle">Logged in as <strong>${escapeHtml(user.name)}</strong> &bull; Production Hub: ${escapeHtml(user.location || 'Global')}</p>
                </div>
                <button class="btn btn-primary" onclick="window.TC.setView('supplier-add-product')">
                    + Enter New Product Information
                </button>
            </div>

            <!-- Stats -->
            <div class="dashboard-grid">
                <div class="stat-card">
                    <span class="stat-icon">📦</span>
                    <span class="stat-value">${myProducts.length}</span>
                    <span class="stat-label">Products in Database</span>
                </div>
                <div class="stat-card">
                    <span class="stat-icon">🔔</span>
                    <span class="stat-value" style="color:var(--warning);">${pendingReviews.length}</span>
                    <span class="stat-label">Pending Order Reviews</span>
                </div>
                <div class="stat-card">
                    <span class="stat-icon">🚚</span>
                    <span class="stat-value" style="color:var(--success);">${activeOrders.length}</span>
                    <span class="stat-label">Orders in Fulfillment</span>
                </div>
                <div class="stat-card">
                    <span class="stat-icon">💰</span>
                    <span class="stat-value">$${myOrders.reduce((acc, o) => acc + (o.payment ? o.totalAmount : 0), 0).toLocaleString()}</span>
                    <span class="stat-label">Escrow Settled Revenue</span>
                </div>
            </div>

            <!-- Pending Review Alerts (Flowchart: Supplier Reviews and Confirms Order) -->
            ${pendingReviews.length > 0 ? `
                <div class="card mb-24" style="border-left:4px solid var(--warning); background:rgba(255,171,64,0.06);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <h3 style="color:var(--warning); font-size:1.05rem; font-weight:700;">
                            ⚡ Action Required: ${pendingReviews.length} Buyer Order(s) Awaiting Review & Confirmation
                        </h3>
                    </div>
                    <p style="font-size:0.85rem; color:var(--text-3); margin-bottom:14px;">
                        Flowchart Step: <strong>Supplier Reviews and Confirms Order</strong> &rarr; Choose to Confirm or Request Detail Revision.
                    </p>
                    <div class="orders-list">
                        ${pendingReviews.map(ord => `
                            <div class="order-item" onclick="window.TC.openSupplierReview('${ord.id}')">
                                <div>
                                    <div class="order-id">${ord.id} &bull; Buyer: ${escapeHtml(ord.buyerName)}</div>
                                    <div class="order-name">${escapeHtml(ord.product?.name || 'Custom Product')}</div>
                                    <div class="order-meta">
                                        Style: ${escapeHtml(ord.orderDetails?.style || 'N/A')} &bull; Qty: ${ord.orderDetails?.quantity || 100} units &bull; Total: $${(ord.totalAmount || 0).toLocaleString()}
                                    </div>
                                </div>
                                <div class="order-actions">
                                    <button class="btn btn-warning btn-sm">Review & Confirm Order &rarr;</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- Active Fulfillment (Flowchart: Factory Packs Order -> Ship Order -> Tracking) -->
            <div class="card mb-24">
                <h3 class="section-title">🏭 Production & Fulfillment Pipeline</h3>
                <p class="card-subtitle">Manage factory packing, client delivery dispatch, and live logistics tracking.</p>

                ${myOrders.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-icon">📋</div>
                        <div class="empty-title">No orders in pipeline yet</div>
                        <p class="empty-desc">When buyers find your catalog via AI search and submit inquiries, they will appear here.</p>
                    </div>
                ` : `
                    <div class="orders-list">
                        ${myOrders.map(ord => `
                            <div class="order-item" onclick="window.TC.viewOrder('${ord.id}')">
                                <div>
                                    <div class="order-id">${ord.id} &bull; Created ${new Date(ord.createdAt).toLocaleDateString()}</div>
                                    <div class="order-name">${escapeHtml(ord.product?.name || 'Custom Hardware')}</div>
                                    <div class="order-meta">
                                        Buyer: ${escapeHtml(ord.buyerName)} &bull; Amount: $${(ord.totalAmount || 0).toLocaleString()}
                                        ${ord.orderDetails?.address ? `&bull; Destination: ${escapeHtml(ord.orderDetails.address)}` : ''}
                                    </div>
                                </div>
                                <div class="order-actions">
                                    <span class="order-status status-${ord.status.replace(/_/g, '-')}">
                                        ${ord.status.toUpperCase().replace(/_/g, ' ')}
                                    </span>

                                    ${ord.status === 'paid' ? `
                                        <button class="btn btn-success btn-sm" onclick="event.stopPropagation(); window.TC.advanceFulfillment('${ord.id}')">
                                            📦 Factory: Pack Order
                                        </button>
                                    ` : ''}

                                    ${ord.status === 'packing' ? `
                                        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); window.TC.advanceFulfillment('${ord.id}')">
                                            🚚 Ship Order to Client
                                        </button>
                                    ` : ''}

                                    ${ord.status === 'shipped' ? `
                                        <button class="btn btn-success btn-sm" onclick="event.stopPropagation(); window.TC.advanceFulfillment('${ord.id}')">
                                            ✅ Mark Completed
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>

            <!-- Factory Catalog in Database -->
            <div class="card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <div>
                        <h3 class="section-title" style="margin-bottom:2px;">📁 Live Database Products (${myProducts.length})</h3>
                        <p style="font-size:0.8rem; color:var(--text-3);">These specifications are indexed for buyer criteria & AI visual match.</p>
                    </div>
                    <button class="btn btn-outline btn-sm" onclick="window.TC.setView('supplier-add-product')">+ Add Product</button>
                </div>

                ${myProducts.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-icon">📦</div>
                        <div class="empty-title">Database is empty for this supplier</div>
                        <p class="empty-desc">Follow the flowchart: enter your first product code, size, color, weight, and price.</p>
                        <button class="btn btn-primary" onclick="window.TC.setView('supplier-add-product')">Add First Product</button>
                    </div>
                ` : `
                    <div class="products-grid">
                        ${myProducts.map(p => `
                            <div class="product-card">
                                <div class="product-img-placeholder">${p.picture || '📦'}</div>
                                <div class="product-body">
                                    <div class="product-code">${escapeHtml(p.code)}</div>
                                    <div class="product-name">${escapeHtml(p.name)}</div>
                                    <div class="product-price">$${p.price.toFixed(2)} <span style="font-size:0.75rem; color:var(--text-4);">/ unit</span></div>
                                    <div class="product-meta">
                                        <span class="tag">Size: ${escapeHtml(p.size)}</span>
                                        <span class="tag">Color: ${escapeHtml(p.color)}</span>
                                        <span class="tag">Wt: ${escapeHtml(p.weight)}</span>
                                    </div>
                                    <p style="font-size:0.78rem; color:var(--text-3); line-height:1.4; margin-bottom:12px;">
                                        ${escapeHtml(p.description.substring(0, 85))}…
                                    </p>
                                    <div style="font-size:0.75rem; color:var(--success); font-weight:600;">
                                        ✓ Active in AI Supplier DB
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        </div>
        `;
    }

    // --- View: Buyer Interface & Search ---
    // Strictly follows:
    // Log In to Buyer Interface -> Enter Product Criteria or Scan Product Picture -> AI Searches Supplier Database
    function renderBuyerHome() {
        const user = state.currentUser;
        const myOrders = state.orders.filter(o => o.buyerId === user.id);

        return `
        <div class="main-content animate-in">
            <div class="page-header">
                <h1 class="page-title">Buyer Procurement Interface</h1>
                <p class="page-subtitle">Welcome, <strong>${escapeHtml(user.name)}</strong> &bull; Sourcing directly from verified global manufacturers</p>
            </div>

            <!-- Flowchart Node: Enter Product Criteria or Scan Product Picture -->
            <section class="search-section">
                <h2 class="search-title">AI Supplier Database Search</h2>
                <p class="search-subtitle">
                    Enter technical keywords, materials, compliance standards, or scan a reference picture.
                </p>

                <form onsubmit="window.TC.handleSearchSubmit(event)">
                    <div class="search-box">
                        <input type="text" id="buyer-search-input" class="search-input" placeholder="e.g. titanium AR frames, antimicrobial medical scrubs, sterile casing..." value="${escapeHtml(state.searchQuery)}">
                        <button type="submit" class="btn btn-primary btn-lg">
                            🔍 AI Search Supplier DB
                        </button>
                    </div>
                </form>

                <div class="search-divider">OR SCAN PRODUCT PICTURE</div>

                <div class="scan-btn" onclick="window.TC.triggerScanPicture()">
                    <span style="font-size:1.4rem;">📷</span>
                    <div style="text-align:left;">
                        <div style="font-weight:700; color:var(--text-1);">Scan Reference Product Picture</div>
                        <div style="font-size:0.75rem;">AI computer vision extracts color, shape, materials & matches suppliers</div>
                    </div>
                </div>

                ${state.scanImagePreview ? `
                    <div class="scan-preview">
                        <img src="${state.scanImagePreview}" alt="Scanned product reference">
                        <div style="padding:6px; background:var(--bg-3); font-size:0.75rem; color:var(--accent-4);">
                            Scanned Image Ready &bull; <a href="javascript:void(0)" onclick="window.TC.clearScan()">Clear</a>
                        </div>
                    </div>
                ` : ''}
            </section>

            <!-- Active Buyer Inquiries & Orders -->
            <section class="card mb-24">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                    <div>
                        <h3 class="section-title" style="margin-bottom:2px;">📋 Your Inquiries & Orders</h3>
                        <p style="font-size:0.8rem; color:var(--text-3);">Track specifications, supplier reviews, escrow payments, and factory packing status.</p>
                    </div>
                </div>

                ${myOrders.length === 0 ? `
                    <div class="empty-state" style="padding:40px 10px;">
                        <div class="empty-icon">🔍</div>
                        <div class="empty-title">No inquiries placed yet</div>
                        <p class="empty-desc">Use the search box above to query supplier databases and submit your first inquiry.</p>
                    </div>
                ` : `
                    <div class="orders-list">
                        ${myOrders.map(ord => `
                            <div class="order-item" onclick="window.TC.viewOrder('${ord.id}')">
                                <div>
                                    <div class="order-id">${ord.id} &bull; Supplier: ${escapeHtml(ord.supplierName)}</div>
                                    <div class="order-name">${escapeHtml(ord.product?.name || 'Custom Order')}</div>
                                    <div class="order-meta">
                                        ${ord.orderDetails ? `Qty: ${ord.orderDetails.quantity} &bull; Style: ${escapeHtml(ord.orderDetails.style)}` : 'Inquiry initiated'}
                                        &bull; Total: $${(ord.totalAmount || 0).toLocaleString()}
                                    </div>
                                </div>
                                <div class="order-actions">
                                    <span class="order-status status-${ord.status.replace(/_/g, '-')}">
                                        ${ord.status.toUpperCase().replace(/_/g, ' ')}
                                    </span>

                                    ${ord.status === 'details_requested' || ord.status === 'details_revision_requested' ? `
                                        <button class="btn btn-warning btn-sm" onclick="event.stopPropagation(); window.TC.openOrderDetailsEntry('${ord.id}')">
                                            ✏️ Provide Order Details
                                        </button>
                                    ` : ''}

                                    ${ord.status === 'order_confirmed' || ord.status === 'payment_failed' ? `
                                        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); window.TC.openPayment('${ord.id}')">
                                            💳 Process Escrow Payment
                                        </button>
                                    ` : ''}

                                    ${['paid', 'packing', 'shipped', 'completed'].includes(ord.status) ? `
                                        <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); window.TC.viewTracking('${ord.id}')">
                                            🚚 Track Order Status
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </section>
        </div>
        `;
    }

    // --- View: AI Searching Supplier Database (Loading Animation) ---
    // Strictly follows: AI Searches Supplier Database
    function renderAiSearching() {
        return `
        <div class="main-content animate-in">
            <div class="ai-searching">
                <span class="ai-brain">🤖</span>
                <h1 class="ai-title">AI Searches Supplier Database</h1>
                <p class="ai-subtitle">
                    Cross-referencing supplier product codes, physical parameters, dimensions, and manufacturing capacities...
                </p>

                <div class="ai-progress card" style="max-width:440px; margin:0 auto; text-align:left;">
                    <div id="ai-step-1" class="ai-step active">
                        <span class="ai-step-icon">1</span>
                        <span>Querying indexed supplier catalogs & specs</span>
                    </div>
                    <div id="ai-step-2" class="ai-step">
                        <span class="ai-step-icon">2</span>
                        <span>Calculating material compatibility & MOQ thresholds</span>
                    </div>
                    <div id="ai-step-3" class="ai-step">
                        <span class="ai-step-icon">3</span>
                        <span>Ranking verified suppliers by lead-time & factory score</span>
                    </div>
                </div>

                <div class="mt-24">
                    <button class="btn btn-secondary btn-sm" onclick="window.TC.setView('buyer-home')">Cancel Search</button>
                </div>
            </div>
        </div>
        `;
    }

    // --- View: Display All Possible Matches & Buyer Selects Supplier ---
    // Strictly follows:
    // Display All Possible Matches -> Buyer Selects Supplier?
    // - No -> Enter Product Criteria or Scan Product Picture (back to search)
    // - Yes -> Send Inquiry to Selected Supplier
    function renderSearchMatches() {
        const matches = state.aiSearchResults || [];

        return `
        <div class="main-content animate-in">
            <div class="breadcrumb">
                <span class="breadcrumb-item" onclick="window.TC.setView('buyer-home')">Buyer Interface</span>
                <span class="breadcrumb-sep">&gt;</span>
                <span>AI Search Matches</span>
            </div>

            <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:14px;">
                <div>
                    <h1 class="page-title">Display All Possible Matches</h1>
                    <p class="page-subtitle">
                        Flowchart Decision: <strong>Buyer Selects Supplier?</strong> (Select Yes to send inquiry, or No to re-enter search criteria)
                    </p>
                </div>
                <!-- Flowchart Option: No -> Enter Product Criteria or Scan Product Picture -->
                <button class="btn btn-outline" onclick="window.TC.setView('buyer-home')">
                    ❌ No: Enter New Criteria / Scan Picture
                </button>
            </div>

            ${matches.length === 0 ? `
                <div class="card empty-state">
                    <div class="empty-icon">🔍</div>
                    <div class="empty-title">No matching suppliers found</div>
                    <p class="empty-desc">Try broadening your criteria or selecting a different reference picture.</p>
                    <button class="btn btn-primary" onclick="window.TC.setView('buyer-home')">Back to Search</button>
                </div>
            ` : `
                <div class="suppliers-grid">
                    ${matches.map((item, idx) => {
            const { product, supplier, matchScore } = item;
            return `
                        <div class="supplier-card card">
                            <div>
                                <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                                    <h3 class="supplier-name">${escapeHtml(supplier.name)}</h3>
                                    ${supplier.verified ? '<span style="color:var(--success); font-size:0.8rem; font-weight:700;">✓ Verified Factory</span>' : ''}
                                </div>
                                <div class="supplier-location">
                                    📍 ${escapeHtml(supplier.location || 'Global Hub')} &bull; ⭐ ${supplier.rating || 4.8} / 5.0 rating &bull; Lead time: ${supplier.leadTime || '14 days'}
                                </div>

                                <div class="supplier-tags">
                                    <span class="tag">MOQ: ${product.minOrderQty || 100} pcs</span>
                                    <span class="tag">Code: ${escapeHtml(product.code)}</span>
                                    <span class="tag">Size: ${escapeHtml(product.size)}</span>
                                    <span class="tag">Color: ${escapeHtml(product.color)}</span>
                                    <span class="tag">Weight: ${escapeHtml(product.weight)}</span>
                                </div>

                                <div style="background:var(--bg-1); border-radius:var(--radius-sm); padding:12px; margin-top:8px; border:1px solid var(--border);">
                                    <div style="font-weight:600; color:var(--text-1); font-size:0.95rem; margin-bottom:4px;">
                                        ${product.picture || '📦'} ${escapeHtml(product.name)}
                                    </div>
                                    <p style="font-size:0.82rem; color:var(--text-3); margin-bottom:6px;">
                                        ${escapeHtml(product.description)}
                                    </p>
                                    <div style="font-size:1.1rem; font-weight:800; color:var(--accent-4);">
                                        $${product.price.toFixed(2)} <span style="font-size:0.75rem; color:var(--text-4);">USD / unit</span>
                                    </div>
                                </div>
                            </div>

                            <div style="display:flex; flex-direction:column; align-items:center; gap:12px; min-width:180px;">
                                <div class="match-score">
                                    <div class="match-circle" style="--score: ${(matchScore / 100) * 360}deg;">
                                        <div class="match-value">${matchScore}%</div>
                                    </div>
                                    <div class="match-label">AI COMPATIBILITY</div>
                                </div>

                                <!-- Flowchart Action: Buyer Selects Supplier? -> YES -> Send Inquiry to Selected Supplier -->
                                <button class="btn btn-primary btn-full" onclick="window.TC.handleSelectSupplier(${idx})">
                                    ✅ Yes: Select Supplier &amp; Send Inquiry &rarr;
                                </button>
                            </div>
                        </div>
                        `;
        }).join('')}
                </div>
            `}
        </div>
        `;
    }

    // --- View: Buyer Provides Order Details ---
    // Strictly follows:
    // Send Inquiry to Selected Supplier -> Supplier Requests Order Details -> Buyer Provides Order Details
    // (Style, Design, Color, Quantity &bull; Client Name, Address, Quantity per Client)
    function renderOrderDetailsEntry() {
        const order = state.orders.find(o => o.id === state.activeOrderId);
        if (!order) {
            return `<div class="main-content"><p>Order not found.</p><button class="btn btn-secondary" onclick="window.TC.setView('buyer-home')">Back</button></div>`;
        }

        const prevDetails = order.orderDetails || {};

        return `
        <div class="main-content animate-in">
            <div class="breadcrumb">
                <span class="breadcrumb-item" onclick="window.TC.setView('buyer-home')">Buyer Interface</span>
                <span class="breadcrumb-sep">&gt;</span>
                <span>Provide Order Details</span>
            </div>

            <div class="page-header">
                <h1 class="page-title">Buyer Provides Order Details</h1>
                <p class="page-subtitle">
                    Flowchart Node: <strong>Supplier Requests Order Details &rarr; Buyer Provides Order Details</strong>
                </p>
            </div>

            ${order.status === 'details_revision_requested' ? `
                <div class="card mb-24" style="border-left:4px solid var(--warning); background:rgba(255,171,64,0.08);">
                    <h3 style="color:var(--warning); font-size:1.05rem; font-weight:700; margin-bottom:4px;">
                        ⚠️ Supplier Requested Revisions
                    </h3>
                    <p style="font-size:0.88rem; color:var(--text-2);">
                        "${escapeHtml(order.revisionNotes || 'Please revise order specifications before confirmation.')}"
                    </p>
                </div>
            ` : ''}

            <div class="detail-grid">
                <div class="card">
                    <form onsubmit="window.TC.handleOrderDetailsSubmit(event, '${order.id}')">
                        <h3 class="section-title">1. Product Customization Specs</h3>
                        <p class="card-subtitle">Specify style, engineering design version, color code, and production volume.</p>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Style / Variant</label>
                                <input type="text" name="style" class="form-control" placeholder="e.g. Ergonomic Slimline or Full-Coverage" required value="${escapeHtml(prevDetails.style || 'Ultra-Light Matte Anodized Frame')}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Design / Blueprint Revision</label>
                                <input type="text" name="design" class="form-control" placeholder="e.g. Rev 3.2 ISO-13485 Compliant" required value="${escapeHtml(prevDetails.design || 'Rev 2.1 Waveguide Assembly')}">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Production Color / Pantone</label>
                                <input type="text" name="color" class="form-control" placeholder="e.g. Pantone 300C Surgical Cyan" required value="${escapeHtml(prevDetails.color || order.product?.color || 'Surgical Teal / Space Gray')}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Total Order Quantity (Units)</label>
                                <input type="number" min="1" name="quantity" class="form-control" placeholder="e.g. 250" required value="${prevDetails.quantity || order.product?.minOrderQty || 100}">
                            </div>
                        </div>

                        <div class="divider"></div>

                        <h3 class="section-title">2. Client Delivery & Distribution Logistics</h3>
                        <p class="card-subtitle">Specify destination receiving contact and lot quantities per destination client.</p>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Client / Facility Name</label>
                                <input type="text" name="clientName" class="form-control" placeholder="e.g. Global Diagnostic Center" required value="${escapeHtml(prevDetails.clientName || state.currentUser.name || 'BioTech Innovations Lab')}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Quantity per Client / Batch</label>
                                <input type="text" name="qtyPerClient" class="form-control" placeholder="e.g. 100 units for Boston, 150 for Chicago" required value="${escapeHtml(prevDetails.qtyPerClient || 'Full lot (100 units) to Central Receiving')}">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Client Shipping Destination Address</label>
                            <textarea name="address" class="form-control" rows="2" placeholder="Full receiving address, dock number, country, zip code" required>${escapeHtml(prevDetails.address || '450 Innovation Parkway, Dock #4, Cambridge, MA 02142, USA')}</textarea>
                        </div>

                        <div class="divider"></div>

                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <button type="button" class="btn btn-secondary" onclick="window.TC.setView('buyer-home')">Back to Dashboard</button>
                            <button type="submit" class="btn btn-primary btn-lg">
                                📤 Submit Details to Supplier for Review &rarr;
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Summary Sidebar -->
                <div class="detail-sidebar">
                    <div class="card">
                        <h4 class="card-title">Target Factory</h4>
                        <div style="font-weight:700; color:var(--accent-4); margin-bottom:4px;">${escapeHtml(order.supplierName)}</div>
                        <div style="font-size:0.8rem; color:var(--text-3); margin-bottom:12px;">Order ID: <code>${order.id}</code></div>

                        <div class="divider"></div>

                        <h4 class="card-title">Base Catalog Reference</h4>
                        <div style="font-size:0.9rem; font-weight:600; margin-bottom:4px;">${escapeHtml(order.product?.name || '')}</div>
                        <div style="font-size:0.8rem; color:var(--text-3); margin-bottom:8px;">Base Price: $${(order.product?.price || 0).toFixed(2)} / unit</div>
                        <div style="font-size:0.75rem; color:var(--text-4);">
                            Standard Lead Time: 14 business days from review confirmation.
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    // --- View: Supplier Reviews and Confirms Order ---
    // Strictly follows:
    // Supplier Reviews and Confirms Order
    // Order Confirmed?
    // - No -> Revise Order Details (back to Buyer Provides Order Details)
    // - Yes -> Buyer Processes Payment
    function renderSupplierReview() {
        const order = state.orders.find(o => o.id === state.activeOrderId);
        if (!order) {
            return `<div class="main-content"><p>Order not found.</p><button class="btn btn-secondary" onclick="window.TC.setView('supplier-home')">Back</button></div>`;
        }

        const details = order.orderDetails || {};

        return `
        <div class="main-content animate-in">
            <div class="breadcrumb">
                <span class="breadcrumb-item" onclick="window.TC.setView('supplier-home')">Supplier Dashboard</span>
                <span class="breadcrumb-sep">&gt;</span>
                <span>Review Order Specifications</span>
            </div>

            <div class="page-header">
                <h1 class="page-title">Supplier Reviews and Confirms Order</h1>
                <p class="page-subtitle">
                    Flowchart Decision: <strong>Order Confirmed? (Yes / No)</strong>
                </p>
            </div>

            <div class="detail-grid">
                <div class="card">
                    <h3 class="section-title">Buyer Specifications Review</h3>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:18px;">
                        <div>
                            <span class="form-label">Client Name</span>
                            <div style="font-size:0.95rem; font-weight:600; color:var(--text-1);">${escapeHtml(details.clientName || 'N/A')}</div>
                        </div>
                        <div>
                            <span class="form-label">Style / Variant</span>
                            <div style="font-size:0.95rem; font-weight:600; color:var(--text-1);">${escapeHtml(details.style || 'N/A')}</div>
                        </div>
                        <div>
                            <span class="form-label">Design Revision</span>
                            <div style="font-size:0.95rem; font-weight:600; color:var(--text-1);">${escapeHtml(details.design || 'N/A')}</div>
                        </div>
                        <div>
                            <span class="form-label">Color Code</span>
                            <div style="font-size:0.95rem; font-weight:600; color:var(--text-1);">${escapeHtml(details.color || 'N/A')}</div>
                        </div>
                        <div>
                            <span class="form-label">Total Quantity</span>
                            <div style="font-size:1.15rem; font-weight:800; color:var(--accent-4);">${details.quantity || 100} units</div>
                        </div>
                        <div>
                            <span class="form-label">Quantity per Client</span>
                            <div style="font-size:0.95rem; font-weight:600; color:var(--text-1);">${escapeHtml(details.qtyPerClient || 'N/A')}</div>
                        </div>
                    </div>

                    <div class="form-group">
                        <span class="form-label">Delivery Destination Address</span>
                        <div style="background:var(--bg-1); padding:10px; border-radius:var(--radius-sm); border:1px solid var(--border); font-size:0.9rem;">
                            📍 ${escapeHtml(details.address || 'N/A')}
                        </div>
                    </div>

                    <div class="divider"></div>

                    <!-- Revision Notes Box (used if decision is No) -->
                    <div class="form-group">
                        <label class="form-label">Revision Instructions (if requesting changes)</label>
                        <textarea id="supplier-revision-notes" class="form-control" rows="2" placeholder="Explain what the buyer needs to adjust (e.g. increase MOQ, change Pantone code, clarify tolerance)..."></textarea>
                    </div>

                    <!-- Flowchart Decisions -->
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
                        <!-- NO Branch: Revise Order Details -->
                        <button type="button" class="btn btn-danger" onclick="window.TC.handleSupplierDecision('${order.id}', false)">
                            ❌ No: Request Detail Revision
                        </button>

                        <!-- YES Branch: Buyer Processes Payment -->
                        <button type="button" class="btn btn-success btn-lg" onclick="window.TC.handleSupplierDecision('${order.id}', true)">
                            ✅ Yes: Confirm Order &amp; Forward to Payment &rarr;
                        </button>
                    </div>
                </div>

                <div class="detail-sidebar">
                    <div class="card">
                        <h4 class="card-title">Commercial Summary</h4>
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                            <span style="color:var(--text-3);">Unit Price:</span>
                            <span style="font-weight:600;">$${(order.product?.price || 0).toFixed(2)}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                            <span style="color:var(--text-3);">Quantity:</span>
                            <span style="font-weight:600;">${details.quantity || 100}</span>
                        </div>
                        <div class="payment-total">
                            <span>Total Settlement:</span>
                            <span class="price-large">$${(order.totalAmount || 0).toLocaleString()}</span>
                        </div>
                        <p style="font-size:0.75rem; color:var(--text-4); margin-top:12px;">
                            Upon confirmation, buyer will be prompted to lock funds in commercial escrow.
                        </p>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    // --- View: Buyer Processes Payment ---
    // Strictly follows:
    // Buyer Processes Payment -> Payment Successful?
    // - No -> Retry Payment (loops back)
    // - Yes -> Notify Supplier of Payment -> Factory Packs Order -> Ship Order -> Tracking -> Completed
    function renderPaymentPage() {
        const order = state.orders.find(o => o.id === state.activeOrderId);
        if (!order) {
            return `<div class="main-content"><p>Order not found.</p><button class="btn btn-secondary" onclick="window.TC.setView('buyer-home')">Back</button></div>`;
        }

        return `
        <div class="main-content animate-in">
            <div class="breadcrumb">
                <span class="breadcrumb-item" onclick="window.TC.setView('buyer-home')">Buyer Interface</span>
                <span class="breadcrumb-sep">&gt;</span>
                <span>Commercial Escrow Payment</span>
            </div>

            <div class="payment-container">
                <div class="page-header text-center">
                    <h1 class="page-title">Buyer Processes Payment</h1>
                    <p class="page-subtitle">
                        Flowchart Step: <strong>Buyer Processes Payment &bull; Payment Successful? (Yes / No)</strong>
                    </p>
                </div>

                ${order.status === 'payment_failed' ? `
                    <div class="card mb-24" style="border-left:4px solid var(--error); background:rgba(239,83,80,0.08);">
                        <h4 style="color:var(--error); font-weight:700; margin-bottom:4px;">❌ Payment Authorization Declined</h4>
                        <p style="font-size:0.85rem; color:var(--text-2); margin-bottom:8px;">
                            Flowchart Branch: <strong>Payment Successful? No &rarr; Retry Payment</strong>
                        </p>
                        <p style="font-size:0.8rem; color:var(--text-3);">
                            Please verify card limits or choose another corporate payment method to proceed.
                        </p>
                    </div>
                ` : ''}

                <div class="payment-summary">
                    <h3 class="card-title">Order #${order.id} Invoice Summary</h3>
                    <div style="font-size:0.85rem; color:var(--text-3); margin-bottom:12px;">
                        Supplier: <strong>${escapeHtml(order.supplierName)}</strong> &bull; Item: ${escapeHtml(order.product?.name || '')}
                    </div>

                    <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.85rem;">
                        <span>Units Ordered (${order.orderDetails?.quantity || 100} @ $${(order.product?.price || 0).toFixed(2)}):</span>
                        <span>$${(order.totalAmount || 0).toLocaleString()}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.85rem;">
                        <span>B2B Commercial Escrow Protection:</span>
                        <span style="color:var(--success);">Included (Free)</span>
                    </div>
                    <div class="payment-total">
                        <span>Total Escrow Authorization:</span>
                        <span class="price-large">$${(order.totalAmount || 0).toLocaleString()}</span>
                    </div>
                </div>

                <div class="card">
                    <form onsubmit="window.TC.handlePaymentSubmit(event, '${order.id}')">
                        <h3 class="section-title">Commercial Card / Letter of Credit</h3>

                        <div class="form-group">
                            <label class="form-label">Cardholder / Corporate Entity</label>
                            <input type="text" name="cardName" class="form-control" required value="${escapeHtml(state.currentUser.name || 'BioTech Innovations Corp.')}">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Corporate Escrow Card Number</label>
                            <div class="card-input-wrapper">
                                <input type="text" name="cardNumber" class="form-control" placeholder="4000 1234 5678 9010" required value="4532 •••• •••• 8829">
                                <span class="card-icon">💳</span>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Expiry Date</label>
                                <input type="text" name="exp" class="form-control" placeholder="MM/YY" required value="11/29">
                            </div>
                            <div class="form-group">
                                <label class="form-label">CVC / Security Code</label>
                                <input type="password" name="cvc" class="form-control" placeholder="•••" required value="842">
                            </div>
                        </div>

                        <div class="divider"></div>

                        <!-- Buttons to test both YES and NO paths of flowchart -->
                        <div style="display:flex; flex-direction:column; gap:10px;">
                            <button type="submit" class="btn btn-primary btn-full btn-lg">
                                🔒 Authorize &amp; Pay $${(order.totalAmount || 0).toLocaleString()} (Yes: Success)
                            </button>

                            <button type="button" class="btn btn-outline btn-full btn-sm" onclick="window.TC.simulatePaymentFailure('${order.id}')" style="border-color:var(--error); color:var(--error);">
                                ⚠️ Simulate Payment Failure (No: Retry Payment)
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        `;
    }

    // --- View: Order Status & Tracking ---
    // Strictly follows:
    // Notify Supplier of Payment -> Factory Packs Order Based on Order Details -> Ship Order to Client Address -> Update Order Status and Tracking -> Order Completed
    function renderTrackingView() {
        const order = state.orders.find(o => o.id === state.activeOrderId);
        if (!order) {
            return `<div class="main-content"><p>Order not found.</p><button class="btn btn-secondary" onclick="window.TC.setView('buyer-home')">Back</button></div>`;
        }

        const tracking = order.tracking || {};
        const history = tracking.history || [];

        return `
        <div class="main-content animate-in">
            <div class="breadcrumb">
                <span class="breadcrumb-item" onclick="window.TC.goHome()">Home</span>
                <span class="breadcrumb-sep">&gt;</span>
                <span>Order Tracking & Fulfillment</span>
            </div>

            <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:14px;">
                <div>
                    <h1 class="page-title">Order Status & Tracking</h1>
                    <p class="page-subtitle">
                        Tracking Number: <strong>${tracking.trackingNumber || 'PENDING'}</strong> &bull; Carrier: ${tracking.carrier || 'Global Freight'}
                    </p>
                </div>
                <div>
                    <span class="order-status status-${order.status.replace(/_/g, '-')}" style="font-size:0.9rem; padding:6px 16px;">
                        ${order.status.toUpperCase().replace(/_/g, ' ')}
                    </span>
                </div>
            </div>

            <div class="detail-grid">
                <div class="card">
                    <h3 class="section-title">📍 Live Flowchart Progression</h3>
                    <p class="card-subtitle">Every factory and carrier event updates this milestone ledger.</p>

                    <div class="timeline">
                        ${history.map(item => `
                            <div class="timeline-item ${item.done ? 'done' : ''} ${item.active ? 'active' : ''}">
                                <div class="timeline-dot">${item.done ? '✓' : '•'}</div>
                                <div class="timeline-title">${escapeHtml(item.title)}</div>
                                <div class="timeline-time">${escapeHtml(item.time)}</div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="divider"></div>

                    <!-- Interactive controls to advance flowchart for demonstration -->
                    <div style="background:var(--bg-1); border-radius:var(--radius-sm); padding:16px; border:1px solid var(--border);">
                        <h4 style="font-size:0.9rem; margin-bottom:6px; color:var(--accent-4);">⚡ Flowchart Progression Controls</h4>
                        <p style="font-size:0.8rem; color:var(--text-3); margin-bottom:12px;">
                            Advance the manufacturing & logistics phases directly to observe state updates:
                        </p>
                        <div style="display:flex; gap:10px; flex-wrap:wrap;">
                            ${order.status === 'paid' ? `
                                <button class="btn btn-success btn-sm" onclick="window.TC.advanceFulfillment('${order.id}')">
                                    🏭 Advance: Factory Packs Order
                                </button>
                            ` : ''}

                            ${order.status === 'packing' ? `
                                <button class="btn btn-primary btn-sm" onclick="window.TC.advanceFulfillment('${order.id}')">
                                    🚚 Advance: Ship Order to Client Address
                                </button>
                            ` : ''}

                            ${order.status === 'shipped' ? `
                                <button class="btn btn-success btn-sm" onclick="window.TC.advanceFulfillment('${order.id}')">
                                    ✅ Advance: Order Completed & Delivered
                                </button>
                            ` : ''}

                            ${order.status === 'completed' ? `
                                <span style="color:var(--success); font-weight:700; font-size:0.9rem;">
                                    🎉 Flowchart Lifecycle Completed!
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <div class="detail-sidebar">
                    <div class="card">
                        <h4 class="card-title">Shipping & Delivery Info</h4>
                        <div style="font-size:0.85rem; margin-bottom:8px;">
                            <span class="text-muted">Estimated Delivery:</span>
                            <div style="font-weight:700; color:var(--accent-4);">${tracking.estimatedDelivery || 'In transit'}</div>
                        </div>

                        <div style="font-size:0.85rem; margin-bottom:12px;">
                            <span class="text-muted">Destination Address:</span>
                            <div style="color:var(--text-1);">${escapeHtml(order.orderDetails?.address || 'Client Address')}</div>
                        </div>

                        <div class="divider"></div>

                        <h4 class="card-title">Order Details Snapshot</h4>
                        <div style="font-size:0.82rem; color:var(--text-3); line-height:1.6;">
                            <div><strong>Client:</strong> ${escapeHtml(order.orderDetails?.clientName || 'N/A')}</div>
                            <div><strong>Style:</strong> ${escapeHtml(order.orderDetails?.style || 'N/A')}</div>
                            <div><strong>Color:</strong> ${escapeHtml(order.orderDetails?.color || 'N/A')}</div>
                            <div><strong>Quantity:</strong> ${order.orderDetails?.quantity || 100} units</div>
                            <div><strong>Settlement:</strong> $${(order.totalAmount || 0).toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    // --- Flowchart Architecture Modal ---
    function renderFlowchartModal() {
        if (state.currentView !== 'flowchart-modal') return '';

        const activeStep = getCurrentFlowchartStep();

        return `
        <div style="position:fixed; inset:0; z-index:10000; background:rgba(0,0,0,0.85); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:20px;">
            <div class="card" style="width:100%; max-width:920px; max-height:90vh; overflow-y:auto; position:relative; border:2px solid var(--accent-3);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <div>
                        <h2 style="font-size:1.4rem; font-weight:800; color:var(--accent-light);">Flowchart System Architecture</h2>
                        <p style="font-size:0.85rem; color:var(--text-3);">Active node highlighted in bright cyan.</p>
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="window.TC.closeFlowchartModal()">Close &times;</button>
                </div>

                <!-- Interactive Visual Node Map -->
                <div style="display:flex; flex-direction:column; gap:12px; font-size:0.85rem;">
                    <div class="card" style="background:var(--bg-1);">
                        <strong style="color:var(--accent-4);">1. START &amp; AUTHENTICATION</strong>
                        <div style="margin-top:6px; display:flex; gap:8px; flex-wrap:wrap;">
                            <span class="tag">Start</span> &rarr;
                            <span class="tag">Open E-Commerce Web App</span> &rarr;
                            <span class="tag" style="background:var(--accent-1); color:#fff;">Choose Account Type</span> &rarr;
                            <span class="tag">Buyer Account</span> OR <span class="tag">Supplier Account</span>
                        </div>
                    </div>

                    <div class="card" style="background:var(--bg-1);">
                        <strong style="color:var(--accent-4);">2. SUPPLIER FLOW</strong>
                        <div style="margin-top:6px; display:flex; gap:8px; flex-wrap:wrap;">
                            <span class="tag">Enter Product Info (Code, Name, Desc)</span> &rarr;
                            <span class="tag">Size, Color, Weight, Picture, Price</span> &rarr;
                            <span class="tag" style="border-color:var(--success); color:var(--success);">Save Product Info to DB</span> &rarr;
                            <span class="tag">Supplier Dashboard</span>
                        </div>
                    </div>

                    <div class="card" style="background:var(--bg-1);">
                        <strong style="color:var(--accent-4);">3. BUYER SEARCH &amp; MATCHING</strong>
                        <div style="margin-top:6px; display:flex; gap:8px; flex-wrap:wrap;">
                            <span class="tag">Log In to Buyer Interface</span> &rarr;
                            <span class="tag">Enter Criteria or Scan Picture</span> &rarr;
                            <span class="tag" style="background:var(--accent-2); color:#fff;">AI Searches Supplier DB</span> &rarr;
                            <span class="tag">Display All Possible Matches</span> &rarr;
                            <span class="tag">Buyer Selects Supplier? (Yes / No)</span>
                        </div>
                    </div>

                    <div class="card" style="background:var(--bg-1);">
                        <strong style="color:var(--accent-4);">4. ORDER SPECIFICATION &amp; CONFIRMATION</strong>
                        <div style="margin-top:6px; display:flex; gap:8px; flex-wrap:wrap;">
                            <span class="tag">Send Inquiry</span> &rarr;
                            <span class="tag">Supplier Requests Details</span> &rarr;
                            <span class="tag">Buyer Provides Details (Style, Design, Color, Qty, Client Address)</span> &rarr;
                            <span class="tag">Supplier Reviews and Confirms</span> &rarr;
                            <span class="tag">Order Confirmed? (No &rarr; Revise / Yes &rarr; Payment)</span>
                        </div>
                    </div>

                    <div class="card" style="background:var(--bg-1);">
                        <strong style="color:var(--accent-4);">5. ESCROW PAYMENT &amp; LOGISTICS FULFILLMENT</strong>
                        <div style="margin-top:6px; display:flex; gap:8px; flex-wrap:wrap;">
                            <span class="tag">Buyer Processes Payment</span> &rarr;
                            <span class="tag">Payment Successful? (No &rarr; Retry / Yes)</span> &rarr;
                            <span class="tag">Notify Supplier of Payment</span> &rarr;
                            <span class="tag">Factory Packs Order Based on Details</span> &rarr;
                            <span class="tag">Ship Order to Client Address</span> &rarr;
                            <span class="tag">Update Status &amp; Tracking</span> &rarr;
                            <span class="tag" style="background:var(--success); color:#000; font-weight:700;">Order Completed</span>
                        </div>
                    </div>
                </div>

                <div class="mt-16 text-center">
                    <button class="btn btn-primary" onclick="window.TC.closeFlowchartModal()">Continue Using Platform</button>
                </div>
            </div>
        </div>
        `;
    }

    // --- Main Render Dispatcher ---
    function render() {
        const app = document.getElementById('app');
        if (!app) return;

        let contentHtml = '';

        switch (state.currentView) {
            case 'landing':
                contentHtml = renderNavbar() + renderLanding();
                break;
            case 'buyer-register':
                contentHtml = renderNavbar() + renderBuyerAuth(true);
                break;
            case 'buyer-login':
                contentHtml = renderNavbar() + renderBuyerAuth(false);
                break;
            case 'supplier-register':
                contentHtml = renderNavbar() + renderSupplierAuth(true);
                break;
            case 'supplier-login':
                contentHtml = renderNavbar() + renderSupplierAuth(false);
                break;
            case 'supplier-home':
                contentHtml = renderNavbar() + renderSupplierDashboard();
                break;
            case 'supplier-add-product':
                contentHtml = renderNavbar() + renderSupplierAddProduct();
                break;
            case 'buyer-home':
                contentHtml = renderNavbar() + renderBuyerHome();
                break;
            case 'ai-searching':
                contentHtml = renderNavbar() + renderAiSearching();
                break;
            case 'search-matches':
                contentHtml = renderNavbar() + renderSearchMatches();
                break;
            case 'order-details-entry':
                contentHtml = renderNavbar() + renderOrderDetailsEntry();
                break;
            case 'supplier-review':
                contentHtml = renderNavbar() + renderSupplierReview();
                break;
            case 'payment-page':
                contentHtml = renderNavbar() + renderPaymentPage();
                break;
            case 'tracking-view':
                contentHtml = renderNavbar() + renderTrackingView();
                break;
            case 'flowchart-modal':
                contentHtml = renderNavbar() + (state.currentUser?.role === 'supplier' ? renderSupplierDashboard() : renderBuyerHome()) + renderFlowchartModal();
                break;
            default:
                contentHtml = renderNavbar() + renderLanding();
        }

        // Attach Footer
        contentHtml += `
        <footer class="footer">
            <div style="display:flex; justify-content:center; align-items:center; gap:16px; margin-bottom:8px; flex-wrap:wrap;">
                <span>⚡ TradeConnect B2B Architecture</span>
                &bull;
                <a href="javascript:void(0)" onclick="window.TC.openFlowchartModal()">View Architecture Flowchart</a>
                &bull;
                <a href="javascript:void(0)" onclick="window.TC.resetPlatformData()">Reset Demo Database</a>
            </div>
            <div>Strict implementation of B2B Sourcing, Order Confirmation, Payment Escrow, and Factory Logistics.</div>
        </footer>
        `;

        app.innerHTML = contentHtml;
    }

    // --- Global Exposed Controller (window.TC) ---
    window.TC = {
        setView,
        goHome() {
            if (!state.currentUser) {
                setView('landing');
            } else if (state.currentUser.role === 'buyer') {
                setView('buyer-home');
            } else {
                setView('supplier-home');
            }
        },
        logout() {
            state.currentUser = null;
            saveState();
            showToast('Signed out successfully.', 'info');
            setView('landing');
        },
        quickSwitchRole() {
            if (!state.currentUser) return;
            if (state.currentUser.role === 'buyer') {
                // switch to first supplier
                const sup = state.users.find(u => u.role === 'supplier') || INITIAL_SUPPLIERS[0];
                state.currentUser = sup;
                showToast(`Switched view to Supplier: ${sup.name}`, 'info');
                setView('supplier-home');
            } else {
                // switch to demo buyer
                const buy = state.users.find(u => u.role === 'buyer');
                state.currentUser = buy;
                showToast(`Switched view to Buyer: ${buy.name}`, 'info');
                setView('buyer-home');
            }
        },
        openFlowchartModal() {
            setView('flowchart-modal');
        },
        closeFlowchartModal() {
            this.goHome();
        },
        resetPlatformData() {
            if (confirm('Reset platform database back to initial verified suppliers & products?')) {
                localStorage.removeItem(STORAGE_KEY);
                state = loadState();
                showToast('Platform reset to factory default!', 'success');
                setView('landing');
            }
        },

        // Auth handlers
        handleBuyerAuth(event, isRegister) {
            event.preventDefault();
            const form = event.target;
            const email = form.email.value.trim().toLowerCase();
            const password = form.password.value;

            if (isRegister) {
                const companyName = form.companyName.value.trim();
                const contactPerson = form.contactPerson.value.trim();
                const address = form.address ? form.address.value.trim() : '';

                const newBuyer = {
                    id: 'buy_' + Date.now(),
                    email,
                    password,
                    name: companyName,
                    contactPerson,
                    companyAddress: address,
                    role: 'buyer'
                };
                state.users.push(newBuyer);
                state.currentUser = newBuyer;
                saveState();
                showToast(`Welcome, ${companyName}! Buyer account created.`, 'success');
                setView('buyer-home');
            } else {
                const existing = state.users.find(u => u.email === email && u.role === 'buyer');
                if (!existing) {
                    showToast('Buyer account not found. Try registering first.', 'error');
                    return;
                }
                state.currentUser = existing;
                saveState();
                showToast(`Logged into Buyer Interface as ${existing.name}`, 'success');
                setView('buyer-home');
            }
        },

        handleSupplierAuth(event, isRegister) {
            event.preventDefault();
            const form = event.target;
            const email = form.email.value.trim().toLowerCase();
            const password = form.password.value;

            if (isRegister) {
                const factoryName = form.factoryName.value.trim();
                const location = form.location.value.trim();
                const category = form.category.value.trim();

                const newSupplier = {
                    id: 'sup_' + Date.now(),
                    email,
                    password,
                    name: factoryName,
                    role: 'supplier',
                    location,
                    rating: 5.0,
                    verified: true,
                    categories: [category],
                    description: `Certified manufacturer of ${category}. Direct factory order fulfillment.`,
                    leadTime: '12-16 days',
                    capacity: '100,000 units / month',
                    moq: 50
                };
                state.users.push(newSupplier);
                state.currentUser = newSupplier;
                saveState();
                showToast(`Factory ${factoryName} registered! Now enter product details.`, 'success');
                setView('supplier-add-product');
            } else {
                const existing = state.users.find(u => u.email === email && u.role === 'supplier');
                if (!existing) {
                    showToast('Supplier account not found. Try registering first.', 'error');
                    return;
                }
                state.currentUser = existing;
                saveState();
                showToast(`Signed into Factory Dashboard: ${existing.name}`, 'success');
                setView('supplier-home');
            }
        },

        // Supplier Product Creation
        selectProductEmoji(emoji) {
            const input = document.getElementById('selected-emoji');
            if (input) input.value = emoji;
            const badge = document.getElementById('upload-filename-badge');
            if (badge) badge.innerText = `Selected Icon: ${emoji}`;
        },

        handleSaveProduct(event) {
            event.preventDefault();
            const form = event.target;
            const user = state.currentUser;

            const productCode = form.productCode.value.trim();
            const name = form.name.value.trim();
            const description = form.description.value.trim();
            const size = form.size.value.trim();
            const color = form.color.value.trim();
            const weight = form.weight.value.trim();
            const price = parseFloat(form.price.value) || 25.00;
            const picture = form.pictureEmoji ? form.pictureEmoji.value : '📦';

            const newProduct = {
                id: 'prod_' + Date.now(),
                supplierId: user.id,
                supplierName: user.name,
                code: productCode,
                name,
                description,
                size,
                color,
                weight,
                picture,
                price,
                minOrderQty: 50,
                category: user.categories ? user.categories[0] : 'Hardware',
                tags: [name, color, size, productCode].join(' ').toLowerCase().split(/\s+/)
            };

            state.products.unshift(newProduct);
            saveState();

            showToast(`Product ${productCode} saved to AI database!`, 'success');
            setView('supplier-home');
        },

        // Buyer Search & Inquiry
        handleSearchSubmit(event) {
            event.preventDefault();
            const input = document.getElementById('buyer-search-input');
            const query = input ? input.value.trim() : '';
            triggerAiSearch(query, state.scanImagePreview);
        },

        triggerScanPicture() {
            // Flowchart node: "Scan Product Picture"
            // Simulate visual picture upload or camera capture
            const samplePictures = [
                'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=500&auto=format&fit=crop&q=80'
            ];
            const chosen = samplePictures[Math.floor(Math.random() * samplePictures.length)];
            state.scanImagePreview = chosen;
            showToast('Product picture captured! AI scanning visual parameters...', 'info');
            triggerAiSearch('medical titanium frame sterile', chosen);
        },

        clearScan() {
            state.scanImagePreview = null;
            render();
        },

        handleSelectSupplier(matchIndex) {
            const matches = state.aiSearchResults || [];
            const selected = matches[matchIndex];
            if (!selected) return;

            // Flowchart node: Buyer Selects Supplier? -> Yes -> Send Inquiry to Selected Supplier
            sendInquiry(selected.product, selected.supplier);
        },

        // Order details entry
        openOrderDetailsEntry(orderId) {
            setView('order-details-entry', { activeOrderId: orderId });
        },

        handleOrderDetailsSubmit(event, orderId) {
            event.preventDefault();
            const form = event.target;
            const details = {
                style: form.style.value.trim(),
                design: form.design.value.trim(),
                color: form.color.value.trim(),
                quantity: parseInt(form.quantity.value) || 100,
                clientName: form.clientName.value.trim(),
                qtyPerClient: form.qtyPerClient.value.trim(),
                address: form.address.value.trim()
            };
            submitOrderDetails(orderId, details);
        },

        // Supplier Review
        openSupplierReview(orderId) {
            setView('supplier-review', { activeOrderId: orderId });
        },

        handleSupplierDecision(orderId, confirmed) {
            const notesEl = document.getElementById('supplier-revision-notes');
            const notes = notesEl ? notesEl.value.trim() : '';
            supplierReviewDecision(orderId, confirmed, notes);
        },

        // Payment
        openPayment(orderId) {
            setView('payment-page', { activeOrderId: orderId });
        },

        handlePaymentSubmit(event, orderId) {
            event.preventDefault();
            const form = event.target;
            const cardInfo = {
                cardName: form.cardName.value.trim(),
                cardNumber: form.cardNumber.value.trim(),
                method: 'Corporate Escrow (Verified)'
            };
            processPayment(orderId, cardInfo, false);
        },

        simulatePaymentFailure(orderId) {
            processPayment(orderId, {}, true);
        },

        // Tracking & Order Views
        viewOrder(orderId) {
            const order = state.orders.find(o => o.id === orderId);
            if (!order) return;

            state.activeOrderId = orderId;
            if (['paid', 'packing', 'shipped', 'completed'].includes(order.status)) {
                setView('tracking-view', { activeOrderId: orderId });
            } else if (order.status === 'details_requested' || order.status === 'details_revision_requested') {
                setView('order-details-entry', { activeOrderId: orderId });
            } else if (order.status === 'details_provided') {
                if (state.currentUser?.role === 'supplier') {
                    setView('supplier-review', { activeOrderId: orderId });
                } else {
                    showToast('Awaiting supplier review & confirmation.', 'info');
                }
            } else if (order.status === 'order_confirmed' || order.status === 'payment_failed') {
                setView('payment-page', { activeOrderId: orderId });
            }
        },

        viewTracking(orderId) {
            setView('tracking-view', { activeOrderId: orderId });
        },

        advanceFulfillment(orderId) {
            advanceFulfillment(orderId);
        }
    };

    // --- File Upload Setup for Product Picture ---
    document.addEventListener('DOMContentLoaded', () => {
        const fileInput = document.getElementById('img-upload');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (loadEvt) => {
                    const dataUrl = loadEvt.target.result;
                    const badge = document.getElementById('upload-filename-badge');
                    if (badge) badge.innerText = `Image uploaded: ${file.name}`;
                    showToast(`Loaded picture: ${file.name}`, 'info');
                };
                reader.readAsDataURL(file);
            });
        }

        // Initial render
        render();
    });

})();

