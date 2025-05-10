document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const addTab = document.getElementById('addTab');
    const scanTab = document.getElementById('scanTab');
    const historyTab = document.getElementById('historyTab');
    const mainContent = document.getElementById('mainContent');
    
    // Modals
    const addModal = document.getElementById('addModal');
    const qrModal = document.getElementById('qrModal');
    const scanModal = document.getElementById('scanModal');
    const productInfoModal = document.getElementById('productInfoModal');
    
    // Buttons
    const closeAddModal = document.getElementById('closeAddModal');
    const closeQrModal = document.getElementById('closeQrModal');
    const closeScanModal = document.getElementById('closeScanModal');
    const closeProductInfoModal = document.getElementById('closeProductInfoModal');
    const closeInfoButton = document.getElementById('closeInfoButton');
    const saveQrButton = document.getElementById('saveQrButton');
    
    // Forms
    const productForm = document.getElementById('productForm');
    
    // Product data
    let products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Tab switching
    function switchTab(tab) {
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        tab.classList.add('active');
        
        if (tab === addTab) {
            showWelcomeContent();
        } else if (tab === scanTab) {
            showScanner();
        } else if (tab === historyTab) {
            showHistory();
        }
    }
    
    function showWelcomeContent() {
        mainContent.innerHTML = `
            <section class="welcome-section">
                <img src="images/logo.png" alt="Logo" class="app-logo">
                <h2>Gestion des Produits</h2>
                <p>Créez, scannez et gérez vos produits avec des codes QR</p>
            </section>
        `;
    }
    
    function showScanner() {
        mainContent.innerHTML = `
            <section class="welcome-section">
                <i class="fas fa-qrcode" style="font-size: 3em; color: #007aff; margin-bottom: 20px;"></i>
                <h2>Scanner un Produit</h2>
                <p>Cliquez sur le bouton Scanner pour lire un code QR</p>
            </section>
        `;
    }
    
    function showHistory() {
        if (products.length === 0) {
            mainContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>Aucun produit enregistré</h3>
                    <p>Utilisez le bouton Ajouter pour créer votre premier produit</p>
                </div>
            `;
        } else {
            let historyHTML = '<div class="history-list">';
            
            products.forEach((product, index) => {
                historyHTML += `
                    <div class="history-item" data-index="${index}">
                        <h3>${product.name}</h3>
                        <p><strong>Référence:</strong> ${product.reference}</p>
                        <p><strong>Expiration:</strong> ${formatDate(product.expiration)}</p>
                    </div>
                `;
            });
            
            historyHTML += '</div>';
            mainContent.innerHTML = historyHTML;
            
            document.querySelectorAll('.history-item').forEach(item => {
                item.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    showProductInfo(products[index]);
                });
            });
        }
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    }
    
    // Modal functions
    function openModal(modal) {
        modal.style.display = 'flex';
    }
    
    function closeModal(modal) {
        modal.style.display = 'none';
    }
    
    // Event listeners for tabs
    addTab.addEventListener('click', function() {
        switchTab(this);
    });
    
    scanTab.addEventListener('click', function() {
        switchTab(this);
    });
    
    historyTab.addEventListener('click', function() {
        switchTab(this);
    });
    
    // Event listeners for modals
    addTab.addEventListener('click', function() {
        openModal(addModal);
    });
    
    closeAddModal.addEventListener('click', function() {
        closeModal(addModal);
    });
    
    closeQrModal.addEventListener('click', function() {
        closeModal(qrModal);
    });
    
    closeScanModal.addEventListener('click', function() {
        closeModal(scanModal);
        stopScanner();
    });
    
    closeProductInfoModal.addEventListener('click', function() {
        closeModal(productInfoModal);
    });
    
    closeInfoButton.addEventListener('click', function() {
        closeModal(productInfoModal);
    });
    
    // Product form submission
    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const productName = document.getElementById('productName').value;
        const productReference = document.getElementById('productReference').value;
        const producer = document.getElementById('producer').value;
        const expirationDate = document.getElementById('expirationDate').value;
        const productSteps = document.getElementById('productSteps').value;
        
        const productData = {
            name: productName,
            reference: productReference,
            producer: producer,
            expiration: expirationDate,
            steps: productSteps,
            createdAt: new Date().toISOString()
        };
        
        generateQRCode(productData);
        this.reset();
        closeModal(addModal);
    });
    
    // Save QR Code button
    saveQrButton.addEventListener('click', function() {
        const productName = document.getElementById('qrProductName').textContent;
        const productDetails = document.getElementById('qrProductDetails').textContent;
        
        const detailsParts = productDetails.split(' • ');
        const productData = {
            name: productName,
            reference: detailsParts[0].replace('Réf: ', ''),
            producer: detailsParts[1].replace('Prod: ', ''),
            expiration: detailsParts[2].replace('Exp: ', ''),
            steps: detailsParts[3] ? detailsParts[3].replace('Étapes: ', '') : '',
            createdAt: new Date().toISOString()
        };
        
        products.unshift(productData);
        localStorage.setItem('products', JSON.stringify(products));
        closeModal(qrModal);
        switchTab(historyTab);
        showHistory();
    });
    
    // Generate QR Code
    function generateQRCode(productData) {
        const qrCodeElement = document.getElementById('generatedQrCode');
        qrCodeElement.innerHTML = '';
        
        const productDetails = `Réf: ${productData.reference} • Prod: ${productData.producer} • Exp: ${productData.expiration}${productData.steps ? ' • Étapes: ' + productData.steps : ''}`;
        
        document.getElementById('qrProductName').textContent = productData.name;
        document.getElementById('qrProductDetails').textContent = productDetails;
        
        new QRCode(qrCodeElement, {
            text: JSON.stringify(productData),
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        openModal(qrModal);
    }
    
    // Show product info
    function showProductInfo(product) {
        document.getElementById('infoProductName').textContent = product.name;
        document.getElementById('infoReference').textContent = product.reference;
        document.getElementById('infoProducer').textContent = product.producer;
        document.getElementById('infoExpiration').textContent = formatDate(product.expiration);
        document.getElementById('infoSteps').textContent = product.steps || 'Aucune étape spécifiée';
        
        const qrCodeElement = document.getElementById('scannedQrCode');
        qrCodeElement.innerHTML = '';
        
        new QRCode(qrCodeElement, {
            text: JSON.stringify(product),
            width: 150,
            height: 150,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        openModal(productInfoModal);
    }
    
    // Initialize with welcome content
    switchTab(addTab);
    
    // Scan tab opens scanner modal
    scanTab.addEventListener('click', function() {
        openModal(scanModal);
        startScanner();
    });
});