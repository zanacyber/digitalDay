// Scanner QR Code
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

    // Options pour la caméra
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
                            
                            // Détection QR avec jsQR
                            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                                inversionAttempts: 'dontInvert'
                            });
                            
                            if (code) {
                                stopScanner();
                                try {
                                    const productData = JSON.parse(code.data);
                                    showProductInfo(productData);
                                    closeModal(scanModal);
                                } catch (e) {
                                    console.error('Erreur parsing QR:', e);
                                    alert('QR Code invalide');
                                }
                            }
                        } catch (e) {
                            console.error('Erreur analyse:', e);
                        }
                    }
                }, 300);
            };
        })
        .catch(function(err) {
            console.error('Erreur caméra:', err);
            
            // Fallback si la caméra arrière échoue
            if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
                const fallbackConstraints = {
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                };
                
                navigator.mediaDevices.getUserMedia(fallbackConstraints)
                    .then(function(stream) {
                        videoStream = stream;
                        video.srcObject = stream;
                        video.play();
                    })
                    .catch(function(fallbackErr) {
                        alert('Impossible d\'accéder à la caméra: ' + fallbackErr.message);
                    });
            } else {
                alert('Erreur caméra: ' + err.message);
            }
        });
}

function stopScanner() {
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

// Exposer les fonctions globalement
window.startScanner = startScanner;
window.stopScanner = stopScanner;