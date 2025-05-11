// Scanner QR Code
let scannerInterval = null;
let videoStream = null;

// Fonctions partagées (à appeler depuis app.js)
let sharedFunctions = null;

function initScanner(functions) {
    sharedFunctions = functions;
}

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
    if (!sharedFunctions) {
        console.error('Fonctions partagées non initialisées');
        return;
    }

    try {
        const productData = JSON.parse(data);
        
        if (productData.name || productData.reference) {
            sharedFunctions.showProductInfo(productData);
        } else {
            sharedFunctions.showRawData(data, "QR Code détecté (format non reconnu)");
        }
    } catch (e) {
        sharedFunctions.showRawData(data, "QR Code détecté (données brutes)");
    }
    
    sharedFunctions.closeModal(document.getElementById('scanModal'));
}

function handleCameraError(err) {
    console.error('Erreur caméra:', err);
    
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

// Exposer les fonctions
window.startScanner = startScanner;
window.stopScanner = stopScanner;
window.initScanner = initScanner;
