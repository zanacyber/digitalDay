// Scanner QR Code
let scannerInterval = null;
let videoStream = null;

function startScanner() {
    const video = document.getElementById('scanner');
    const scanModal = document.getElementById('scanModal');
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Votre navigateur ne supporte pas l\'accès à la caméra');
        return;
    }

    const constraints = {
        video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) {
            videoStream = stream;
            video.srcObject = stream;
            
            video.onloadedmetadata = function() {
                video.play();
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                
                scannerInterval = setInterval(() => {
                    if (video.readyState >= video.HAVE_METADATA) {
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        
                        try {
                            context.drawImage(video, 0, 0, canvas.width, canvas.height);
                            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                                inversionAttempts: 'dontInvert'
                            });
                            
                            if (code) {
                                stopScanner();
                                try {
                                    // Vérifier si c'est un JSON valide
                                    let productData;
                                    try {
                                        productData = JSON.parse(code.data);
                                    } catch (e) {
                                        // Si ce n'est pas un JSON, créer un objet avec le texte brut
                                        productData = {
                                            rawData: code.data,
                                            name: "QR Code Scanné",
                                            reference: "N/A",
                                            producer: "N/A",
                                            expiration: "N/A",
                                            steps: "Données brutes du QR Code"
                                        };
                                    }
                                    
                                    // Vérifier si c'est un produit valide (au moins un champ requis)
                                    if (!productData.name && !productData.rawData) {
                                        throw new Error("Format de QR Code non reconnu");
                                    }
                                    
                                    showProductInfo(productData);
                                    closeModal(scanModal);
                                } catch (e) {
                                    console.error('Erreur:', e);
                                    alert('QR Code détecté mais format non supporté: ' + code.data);
                                    startScanner(); // Redémarrer le scanner
                                }
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

function handleCameraError(err) {
    console.error('Erreur caméra:', err);
    
    if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        const fallbackConstraints = {
            video: true // Mode plus permissif
        };
        
        navigator.mediaDevices.getUserMedia(fallbackConstraints)
            .then(function(stream) {
                const video = document.getElementById('scanner');
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

window.startScanner = startScanner;
window.stopScanner = stopScanner;
