document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let currentPoints = 5420; // Starting points (same as in manage.html)
    const pointsCounter = document.getElementById('points-counter');
    const modal = document.getElementById('redemption-modal');
    const modalRewardName = document.getElementById('modal-reward-name');
    const modalRewardPoints = document.getElementById('modal-reward-points');
    const modalCurrentPoints = document.getElementById('modal-current-points');
    const modalRemainingPoints = document.getElementById('modal-remaining-points');
    const closeModalBtn = document.querySelector('.close-modal');
    const cancelBtn = document.querySelector('.btn-cancel');
    const confirmBtn = document.querySelector('.btn-confirm');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const rewardCards = document.querySelectorAll('.reward-card');
    const redeemBtns = document.querySelectorAll('.redeem-btn');
    
    let selectedReward = null;
    let selectedPoints = 0;
    let selectedRewardId = null;
    let redeemedItems = new Set(); // Track redeemed items
    
    // Animate points counter
    function animateCounter(element, target, duration) {
        let start = 0;
        const increment = target / (duration / 16); // ~60fps
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                element.textContent = target.toLocaleString() + " pts";
                clearInterval(timer);
                element.classList.remove('pulse');
            } else {
                element.textContent = Math.floor(start).toLocaleString() + " pts";
            }
        }, 16);
    }
    
    // Initialize points counter
    animateCounter(pointsCounter, currentPoints, 2000);
    
    // Category filtering
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            
            // Show/hide reward cards based on category
            rewardCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // Mark item as redeemed
    function markAsRedeemed(rewardId, card) {
        redeemedItems.add(rewardId);
        card.classList.add('redeemed');
        
        // Add redeemed badge
        const badge = document.createElement('div');
        badge.className = 'redeemed-badge';
        badge.textContent = 'Redeemed';
        card.appendChild(badge);
        
        // Disable the redeem button
        const redeemBtn = card.querySelector('.redeem-btn');
        redeemBtn.textContent = 'Redeemed';
        redeemBtn.disabled = true;
    }
    
    // Redemption modal functionality
    redeemBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.reward-card');
            const rewardId = card.getAttribute('data-reward-id');
            
            // Check if already redeemed
            if (redeemedItems.has(rewardId)) {
                return;
            }
            
            const rewardName = card.querySelector('h3').textContent;
            const pointsText = card.querySelector('.reward-points').textContent;
            const pointsValue = parseInt(pointsText.replace(/[^0-9]/g, ''));
            
            selectedReward = rewardName;
            selectedPoints = pointsValue;
            selectedRewardId = rewardId;
            
            // Update modal content
            modalRewardName.textContent = rewardName;
            modalRewardPoints.textContent = pointsValue.toLocaleString() + ' points';
            modalCurrentPoints.textContent = currentPoints.toLocaleString();
            
            const remainingPoints = currentPoints - pointsValue;
            modalRemainingPoints.textContent = remainingPoints.toLocaleString();
            
            // Show modal
            modal.style.display = 'flex';
            
            // Disable confirm button if not enough points
            if (remainingPoints < 0) {
                confirmBtn.disabled = true;
                confirmBtn.style.opacity = '0.5';
                confirmBtn.style.cursor = 'not-allowed';
                modalRemainingPoints.style.color = '#ff3b30';
            } else {
                confirmBtn.disabled = false;
                confirmBtn.style.opacity = '1';
                confirmBtn.style.cursor = 'pointer';
                modalRemainingPoints.style.color = 'inherit';
            }
        });
    });
    
    // Close modal
    function closeModal() {
        modal.style.display = 'none';
    }
    
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Confirm redemption
    confirmBtn.addEventListener('click', function() {
        if (currentPoints >= selectedPoints && selectedRewardId) {
            // Deduct points
            currentPoints -= selectedPoints;
            
            // Update points display
            pointsCounter.textContent = currentPoints.toLocaleString() + " pts";
            
            // Mark item as redeemed
            const card = document.querySelector(`[data-reward-id="${selectedRewardId}"]`);
            markAsRedeemed(selectedRewardId, card);
            
            // Show success message
            alert(`Congratulations! You've successfully redeemed ${selectedReward}. Your new balance is ${currentPoints.toLocaleString()} points.`);
            
            // Close modal
            closeModal();
        } else {
            alert("You don't have enough points for this reward.");
        }
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
});