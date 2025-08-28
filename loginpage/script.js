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
        showAlert('Login functionality would be implemented here. This is a demo page.');
    }
});

function showAlert(message) {
    alert(message);
}

document.addEventListener('DOMContentLoaded', () => {
    const sendMoneyForm = document.getElementById('sendMoneyForm');
    const progressContainer = document.querySelector('.progress-container');
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-text');

    sendMoneyForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Show the progress container
        progressContainer.style.display = 'block';

        // Start the progress bar animation
        progressBar.style.width = '100%';

        // Simulate sending process
        progressText.textContent = 'Sending...';
        setTimeout(() => {
            progressText.textContent = 'Money Sent Successfully!';
            progressBar.style.background = 'green';
        }, 2000);
    });
});