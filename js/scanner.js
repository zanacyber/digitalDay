let scannerInterval = null;
let videoStream = null;

function startScanner() {
    const video = document.getElementById('scanner');
    const scanModal = document.getElementById('scanModal');
    
    // Vérifier la compatibilité
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Votre navigateur ne supporte pas l\'accès à la caméra');
        return;
    }

    // Options caméra
    const constraints = {
        video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    };

    // Démarrer le flux vidéo
    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) {
            videoStream = stream;
            video.srcObject = stream;
            
            video.onloadedmetadata = function() {
                video.play();
                
                // Créer un canvas pour l'analyse
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                
                // Démarrer l'analyse périodique
                scannerInterval = setInterval(() => {
                    if (video.readyState >= video.HAVE_METADATA) {
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        
                        try {
                            context.drawImage(video, 0, 0, canvas.width, canvas.height);
                            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                            const code = jsQR(imageData.data, imageData.width, imageData.height);
                            
                            if (code) {
                                stopScanner();
                                processScannedData(code.data);
                            }
                        } catch (e) {
                            console.error('Erreur analyse:', e);
                        }
                    }
                }, 300);
            };
        })
        .catch(handleCameraError);
}

function processScannedData(data) {
    try {
        const productData = JSON.parse(data);
        
        // Vérifier si c'est un produit valide
        if (productData.name || productData.reference) {
            showProductInfo(productData);
        } else {
            showRawData(data, "QR Code détecté (format non reconnu)");
        }
    } catch (e) {
        showRawData(data, "QR Code détecté (données brutes)");
    }
    
    closeModal(document.getElementById('scanModal'));
}

function handleCameraError(err) {
    console.error('Erreur caméra:', err);
    
    // Fallback sans spécification de caméra
    if (err.name === 'OverconstrainedError') {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                const video = document.getElementById('scanner');
                videoStream = stream;
                video.srcObject = stream;
                video.play();
            })
            .catch(function(fallbackErr) {
                alert('Erreur caméra: ' + fallbackErr.message);
            });
    } else {
        alert('Erreur caméra: ' + err.message);
    }
}

function stopScanner() {
    // Nettoyage des ressources
    if (scannerInterval) {
        clearInterval(scannerInterval);
        scannerInterval = null;
    }
    
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
    
    const video = document.getElementById('scanner');
    if (video) {
        video.srcObject = null;
    }
}

// Exposer les fonctions globales
window.startScanner = startScanner;
window.stopScanner = stopScanner;
