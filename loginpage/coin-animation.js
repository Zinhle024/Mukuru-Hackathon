// Coin Animation Script

document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('body');
    const logoUrl = 'https://play-lh.googleusercontent.com/_MjNtgupdlwFhQ_AXZcLYVAXXovJWcCZmMNFOruxPW3E_OJpuam14cF5CiPMmxZeHxo';
    const coinCount = 15; // Number of coins to create
    const minSize = 30; // Minimum coin size in pixels
    const maxSize = 60; // Maximum coin size in pixels
    
    // Create coins
    for (let i = 0; i < coinCount; i++) {
        createCoin();
    }
    
    // Create new coins periodically
    setInterval(createCoin, 3000);
    
    function createCoin() {
        // Create coin element
        const coin = document.createElement('div');
        coin.className = 'coin';
        
        // Random size between minSize and maxSize
        const size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
        coin.style.width = `${size}px`;
        coin.style.height = `${size}px`;
        
        // Random starting position
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;
        coin.style.left = `${startX}px`;
        coin.style.top = `${startY}px`;
        
        // Create inner coin with logo
        const coinInner = document.createElement('div');
        coinInner.className = 'coin-inner';
        
        // Add logo image
        const logo = document.createElement('img');
        logo.src = logoUrl;
        logo.alt = 'Mukuru Logo';
        
        // Append elements
        coinInner.appendChild(logo);
        coin.appendChild(coinInner);
        container.appendChild(coin);
        
        // Set random movement variables for animation
        const moveX = (Math.random() * 200 - 100) + 'px';
        const moveY = (Math.random() * 200 - 100) + 'px';
        const finalX = (Math.random() * 400 - 200) + 'px';
        const finalY = (Math.random() * 400 - 200) + 'px';
        
        coin.style.setProperty('--moveX', moveX);
        coin.style.setProperty('--moveY', moveY);
        coin.style.setProperty('--finalX', finalX);
        coin.style.setProperty('--finalY', finalY);
        
        // Set animation duration and delay
        const duration = 5 + Math.random() * 10; // 5-15 seconds
        coin.style.animation = `float ${duration}s ease-in-out forwards`;
        
        // Remove coin after animation completes
        setTimeout(() => {
            coin.remove();
        }, duration * 1000);
    }
});