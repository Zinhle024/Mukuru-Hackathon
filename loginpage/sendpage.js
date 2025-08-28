document.addEventListener('DOMContentLoaded', () => {
    const sendMoneyForm = document.getElementById('sendMoneyForm');
    const progressContainer = document.querySelector('.progress-container');
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-text');

    if (!sendMoneyForm || !progressContainer || !progressBar || !progressText) {
        console.error('Required elements are missing from the DOM.');
        return;
    }

    sendMoneyForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Show the progress container
        progressContainer.style.display = 'block';

        // Reset bar before animation
        progressBar.style.width = '0%';
        progressBar.style.background = 'linear-gradient(90deg, #f05423, #ff8b50)';
        progressText.textContent = 'Sending...';

        // Allow DOM to update before starting animation
        setTimeout(() => {
            progressBar.style.width = '100%';
        }, 50);

        // After 2s, change text & bar color
        setTimeout(() => {
            progressText.textContent = 'Money Sent Successfully!';
            progressBar.style.background = 'green';
        }, 2000);

        // Hide container & reset after 4s
        setTimeout(() => {
            progressContainer.style.display = 'none';
            progressBar.style.width = '0%';
            progressBar.style.background = 'linear-gradient(90deg, #f05423, #ff8b50)';
            progressText.textContent = '';
            sendMoneyForm.reset();
        }, 4000);
    });
});
