const greetings = [
    "Hello", "Hola", "Sawubona", "Dumela", "Hujambo", "Ndeipi",
    "Avuxeni", "Lotjhani", "Thobela", "Molweni", "Goeiedag",
    "Halita", "Ndewo", "E karo", "Mwaramutse", "Bonjour",
    "Olá", "Merhaba", "Salaam", "Namaste", "Habari",
    "Sanibonani", "Sakubona", "Kunjani", "Howzit"
];

const greetingEl = document.getElementById('greetingHeading');
let currentIndex = 0;

function showGreeting() {
    // Animate fade in/out using CSS animation
    greetingEl.style.animation = 'none';
    // Force reflow
    void greetingEl.offsetWidth;
    greetingEl.textContent = greetings[currentIndex];
    greetingEl.style.animation = 'popUp 3s ease-in-out forwards';

    currentIndex = (currentIndex + 1) % greetings.length;
}

// Change greeting every 3 seconds
showGreeting();
setInterval(showGreeting, 3000);

// Handle form submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (email && password) {
        // In a real app, validate credentials here
        alert('Login successful! Redirecting to Send Money page...');
        setTimeout(function() {
            window.location.href = '../send&Earn/send.html';
        }, 1500);
    }
});

// Add marketplace button animation
const marketplaceLink = document.querySelector('.marketplace-link');
if (marketplaceLink) {
    marketplaceLink.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
        this.style.transition = 'transform 0.3s ease';
    });
    
    marketplaceLink.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
}

function showAlert(message) {
    alert(message);

}
