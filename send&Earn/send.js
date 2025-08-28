 // This is the JavaScript code that handles sending money and updating reward tiers
        document.addEventListener('DOMContentLoaded', function() {
            // Form submission - THIS IS THE MAIN FUNCTION THAT HANDLES SENDING MONEY
            const sendMoneyForm = document.getElementById('sendMoneyForm');
            const progressBar = document.querySelector('.progress-bar');
            const progressText = document.querySelector('.progress-text');
            const plane = document.getElementById('plane');
            const balanceElement = document.getElementById('balance');
            const pointsPopup = document.getElementById('pointsPopup');
            const transactionHistory = document.getElementById('transactionHistory');
            const tierBar = document.getElementById('tierBar');
            const tierProgress = document.getElementById('tierProgress');
            const currentTier = document.getElementById('currentTier');
            const tierIcon = document.getElementById('tierIcon');
            const tierBenefits = document.getElementById('tierBenefits');
            const cartItems = document.getElementById('cartItems');
            const cartTotal = document.getElementById('cartTotal');
            const checkoutBtn = document.getElementById('checkoutBtn');
            const leaderboardPoints = document.querySelectorAll('.leaderboard-points');
            
            let pointsBalance = 0;
            let transactionCount = 0;
            let cart = [];
            
            // Tier system - THIS DEFINES THE REWARD TIERS
            const tiers = [
                { name: "Bronze", icon: "🥉", threshold: 0, benefits: "1x Points, Basic Rewards" },
                { name: "Silver", icon: "🥈", threshold: 100, benefits: "1.5x Points, More Rewards" },
                { name: "Gold", icon: "🥇", threshold: 300, benefits: "2x Points, All Rewards" },
                { name: "Platinum", icon: "💎", threshold: 600, benefits: "3x Points, Premium Rewards" }
            ];
            
            // Update tier display - THIS FUNCTION UPDATES THE REWARD TIERS CONTAINER
            function updateTier() {
                let currentTierIndex = 0;
                
                for (let i = tiers.length - 1; i >= 0; i--) {
                    if (pointsBalance >= tiers[i].threshold) {
                        currentTierIndex = i;
                        break;
                    }
                }
                
                const tier = tiers[currentTierIndex];
                const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;
                
                currentTier.textContent = `Current Tier: ${tier.name}`;
                tierIcon.textContent = tier.icon;
                tierBenefits.textContent = `Benefits: ${tier.benefits}`;
                
                if (nextTier) {
                    const progress = ((pointsBalance - tier.threshold) / (nextTier.threshold - tier.threshold)) * 100;
                    tierBar.style.width = `${progress}%`;
                    tierProgress.textContent = `${pointsBalance - tier.threshold}/${nextTier.threshold - tier.threshold} points to reach ${nextTier.name}`;
                } else {
                    tierBar.style.width = '100%';
                    tierProgress.textContent = 'You have reached the highest tier!';
                }
            }
            
            // Form submission event handler - THIS IS WHERE THE MAGIC HAPPENS
            sendMoneyForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Reset progress
                progressBar.style.width = '0%';
                progressText.textContent = 'Processing...';
                
                // Hide plane initially
                plane.classList.remove('fly');
                plane.style.opacity = '0';
                plane.style.transform = 'translateX(-100px)';
                
                // Simulate transaction processing
                let progress = 0;
                const interval = setInterval(() => {
                    progress += 5;
                    progressBar.style.width = progress + '%';
                    
                    if (progress === 25) {
                        progressText.textContent = 'Verifying details...';
                    } else if (progress === 50) {
                        progressText.textContent = 'Processing payment...';
                    } else if (progress === 75) {
                        progressText.textContent = 'Completing transaction...';
                        // Make plane fly
                        setTimeout(() => {
                            plane.classList.add('fly');
                        }, 100);
                    } else if (progress >= 100) {
                        clearInterval(interval);
                        progressText.textContent = 'Transaction complete!';
                        
                        // Add points (random between 5-15)
                        const pointsEarned = Math.floor(Math.random() * 11) + 5;
                        pointsBalance += pointsEarned;
                        
                        // Update balance
                        balanceElement.innerHTML = pointsBalance + ' <span class="star-icon">⭐</span>';
                        
                        // Update leaderboard
                        leaderboardPoints[4].innerHTML = pointsBalance + ' <span class="star-icon">⭐</span>';
                        
                        // Show points popup
                        pointsPopup.textContent = '+' + pointsEarned + ' ⭐';
                        pointsPopup.classList.add('active');
                        
                        // Add to transaction history
                        const formData = new FormData(sendMoneyForm);
                        const recipientName = formData.get('recipientName') || 'Unknown';
                        const amount = formData.get('amount') || '0';
                        
                        const li = document.createElement('li');
                        li.textContent = `Sent $${amount} to ${recipientName} - Earned ${pointsEarned} points`;
                        transactionHistory.prepend(li);
                        
                        transactionCount++;
                        
                        // Update tier and check for badges - THIS UPDATES THE REWARD TIERS
                        updateTier();
                        checkForBadges();
                        
                        // Hide popup after 3 seconds
                        setTimeout(() => {
                            pointsPopup.classList.remove('active');
                        }, 3000);
                        
                        // Reset form
                        setTimeout(() => {
                            sendMoneyForm.reset();
                            // Reset progress bar after 2 more seconds
                            setTimeout(() => {
                                progressBar.style.width = '0%';
                                progressText.textContent = '';
                                plane.classList.remove('fly');
                            }, 2000);
                        }, 1000);
                    }
                }, 200);
                });
            });