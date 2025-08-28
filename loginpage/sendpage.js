document.addEventListener('DOMContentLoaded', () => {
    const sendMoneyForm = document.getElementById('sendMoneyForm');
    const progressContainer = document.querySelector('.progress-container');
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-text');
    const plane = document.getElementById('plane');

    sendMoneyForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Show progress bar and plane
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        progressBar.style.background = 'linear-gradient(90deg, #f05423, #ff8b50)';
        progressText.textContent = 'Sending...';

        plane.style.display = 'block';
        plane.style.animation = 'flyPlane 3s linear forwards';

        // Start progress bar animation
        setTimeout(() => { progressBar.style.width = '100%'; }, 50);

        // Update text & bar color when done
        setTimeout(() => {
            progressText.textContent = 'Money Sent Successfully!';
            progressBar.style.background = 'green';
        }, 3000);

        // Reset everything after animation
        setTimeout(() => {
            progressContainer.style.display = 'none';
            progressBar.style.width = '0%';
            progressBar.style.background = 'linear-gradient(90deg, #f05423, #ff8b50)';
            progressText.textContent = '';
            plane.style.display = 'none';
            sendMoneyForm.reset();
        }, 4500);
    });
});
