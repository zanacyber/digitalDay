document.addEventListener('DOMContentLoaded', function() {
    // Éléments DOM
    const addTab = document.getElementById('addTab');
    const scanTab = document.getElementById('scanTab');
    const historyTab = document.getElementById('historyTab');
    const mainContent = document.getElementById('mainContent');
    
    // Modals
    const addModal = document.getElementById('addModal');
    const qrModal = document.getElementById('qrModal');
    const scanModal = document.getElementById('scanModal');
    const productInfoModal = document.getElementById('productInfoModal');
    const rawDataModal = document.getElementById('rawDataModal');
    
    // Boutons
    const closeAddModal = document.getElementById('closeAddModal');
    const closeQrModal = document.getElementById('closeQrModal');
    const closeScanModal = document.getElementById('closeScanModal');
    const closeProductInfoModal = document.getElementById('closeProductInfoModal');
    const closeRawDataModal = document.getElementById('closeRawDataModal');
    const closeInfoButton = document.getElementById('closeInfoButton');
    const closeRawDataButton = document.getElementById('closeRawDataButton');
    const saveQrButton = document.getElementById('saveQrButton');
    
    // Formulaires
    const productForm = document.getElementById('productForm');
    
    // Données
    let products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Fonctions de base
    function switchTab(tab) {
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        tab.classList.add('active');
        
        if (tab === addTab) {
            showWelcomeContent();
        } else if (tab === scanTab) {
            showScannerContent();
        } else if (tab === historyTab) {
            showHistory();
        }
    }
    
    function openModal(modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    }
    
    // Affichage des contenus
    function showWelcomeContent() {
        mainContent.innerHTML = `
            <section class="welcome-section">
                <img src="images/logo.png" alt="Logo" class="app-logo">
                <h2>Gestion des Produits</h2>
                <p>Créez, scannez et gérez vos produits avec des codes QR</p>
            </section>
        `;
    }
    
    function showScannerContent() {
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
                        <h3>${product.name || 'Produit sans nom'}</h3>
                        <p><strong>Référence:</strong> ${product.reference || 'N/A'}</p>
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
    
    function showProductInfo(product) {
        if (product.rawData) {
            showRawData(product.rawData, "Données du QR Code");
            return;
        }
        
        document.getElementById('infoProductName').textContent = product.name || 'Produit sans nom';
        document.getElementById('infoReference').textContent = product.reference || 'N/A';
        document.getElementById('infoProducer').textContent = product.producer || 'N/A';
        document.getElementById('infoExpiration').textContent = formatDate(product.expiration);
        document.getElementById('infoSteps').textContent = product.steps || 'Aucune étape spécifiée';
        
        const qrCodeElement = document.getElementById('scannedQrCode');
        qrCodeElement.innerHTML = '';
        
        if (product.qrData) {
            new QRCode(qrCodeElement, {
                text: product.qrData,
                width: 150,
                height: 150,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }
        
        openModal(productInfoModal);
    }
    
    function showRawData(data, title = "Contenu du QR Code") {
        document.querySelector('#rawDataModal .modal-header h3').textContent = title;
        document.getElementById('rawDataContent').textContent = data;
        openModal(rawDataModal);
    }
    
    function generateQRCode(productData) {
        const qrCodeElement = document.getElementById('generatedQrCode');
        qrCodeElement.innerHTML = '';
        
        const productDetails = [
            `Réf: ${productData.reference || ''}`,
            `Prod: ${productData.producer || ''}`,
            `Exp: ${productData.expiration || ''}`,
            productData.steps ? `Étapes: ${productData.steps}` : ''
        ].filter(Boolean).join(' • ');
        
        document.getElementById('qrProductName').textContent = productData.name || 'Produit sans nom';
        document.getElementById('qrProductDetails').textContent = productDetails;
        
        const qrData = JSON.stringify(productData);
        new QRCode(qrCodeElement, {
            text: qrData,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        // Stocker les données pour la sauvegarde
        qrCodeElement.dataset.qrData = qrData;
        
        openModal(qrModal);
    }
    
    // Écouteurs d'événements
    addTab.addEventListener('click', function() {
        switchTab(this);
    });
    
    scanTab.addEventListener('click', function() {
        switchTab(this);
    });
    
    historyTab.addEventListener('click', function() {
        switchTab(this);
    });
    
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
    
    closeRawDataModal.addEventListener('click', function() {
        closeModal(rawDataModal);
        startScanner();
    });
    
    closeInfoButton.addEventListener('click', function() {
        closeModal(productInfoModal);
    });
    
    closeRawDataButton.addEventListener('click', function() {
        closeModal(rawDataModal);
        startScanner();
    });
    
    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const productData = {
            name: document.getElementById('productName').value,
            reference: document.getElementById('productReference').value,
            producer: document.getElementById('producer').value,
            expiration: document.getElementById('expirationDate').value,
            steps: document.getElementById('productSteps').value,
            createdAt: new Date().toISOString()
        };
        
        generateQRCode(productData);
        this.reset();
        closeModal(addModal);
    });
    
    saveQrButton.addEventListener('click', function() {
        const qrCodeElement = document.getElementById('generatedQrCode');
        const qrData = qrCodeElement.dataset.qrData;
        
        if (!qrData) {
            alert('Aucune donnée QR à enregistrer');
            return;
        }
        
        try {
            const productData = JSON.parse(qrData);
            products.unshift(productData);
            localStorage.setItem('products', JSON.stringify(products));
            closeModal(qrModal);
            switchTab(historyTab);
            showHistory();
        } catch (e) {
            console.error('Erreur enregistrement:', e);
            alert('Erreur lors de l\'enregistrement');
        }
    });
    
    scanTab.addEventListener('click', function() {
        openModal(scanModal);
        startScanner();
    });
    
    // Initialisation
    switchTab(addTab);
});
