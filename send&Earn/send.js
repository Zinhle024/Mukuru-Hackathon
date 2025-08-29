// Initialize variables
        let points = 0;
        let currentTier = 'Bronze';
        let drumTimeout;
        const drumSound = document.getElementById('drumSound');
        const celebration = document.getElementById('celebration');
        const achievedTier = document.getElementById('achievedTier');
        const stopSoundBtn = document.getElementById('stopSound');
        
        // Tier thresholds
        const tierThresholds = {
            'Bronze': 0,
            'Silver': 100,
            'Gold': 250,
            'Platinum': 500
        };
        
        // Tier benefits
        const tierBenefits = {
            'Bronze': '1x Points, Basic Rewards',
            'Silver': '1.5x Points, Priority Support',
            'Gold': '2x Points, Fee Waivers, Special Offers',
            'Platinum': '3x Points, Dedicated Account Manager, All Benefits'
        };
        
        // Tier icons
        const tierIcons = {
            'Bronze': '🥉',
            'Silver': '🥈',
            'Gold': '🥇',
            'Platinum': '🏆'
        };

        // Form submission handler
        document.getElementById('sendMoneyForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const amount = document.querySelector('input[type="number"]').value || '0';
            const pointsEarned = Math.floor(amount / 10); // 1 point per R10
            
            // Add points
            addPoints(pointsEarned);
            
            // Add a transaction to history
            const historyList = document.getElementById('transactionHistory');
            const noTx = document.getElementById('noTransactions');
            if (noTx && historyList.children.length > 1) {
                noTx.remove();
            }

            const name = document.querySelector('input[type="text"]').value || 'Unknown';

            const newItem = document.createElement('li');
            newItem.textContent = `Sent R${amount} to ${name} (+${pointsEarned} pts)`;
            historyList.insertBefore(newItem, historyList.firstChild);
            
            // Check for tier upgrade
            checkTierUpgrade();
            
            // Reset form
            this.reset();
        });
        
        // --- Minor frontend fixes and improvements ---
        // Fix: Only add manage button event once
        const manageBtn = document.querySelector('.manage-btn');
        if (manageBtn && !manageBtn.hasListener) {
            manageBtn.addEventListener('click', function() {
                window.open('manage.html', '_blank');
            });
            manageBtn.hasListener = true;
        }
        // Fix: Prevent negative points
        function addPoints(amount) {
            points = Math.max(0, points + amount);
            document.getElementById('balance').textContent = `${points} ⭐`;
            showPointsPopup(amount);
            updateTierProgress();
        }
        
        // Add points function
        function addPoints(amount) {
            points += amount;
            document.getElementById('balance').textContent = `${points} ⭐`;

            // Show points popup animation
            showPointsPopup(amount);

            // Update progress bar
            updateTierProgress();
        }
        
        // Update tier progress
        function updateTierProgress() {
            let nextTier = getNextTier();
            let progress = 0;
            
            if (nextTier) {
                const currentThreshold = tierThresholds[currentTier];
                const nextThreshold = tierThresholds[nextTier];
                progress = Math.min(100, ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
                const pointsNeeded = nextThreshold - points;
                document.getElementById('tierBar').style.width = `${progress}%`;
                document.getElementById('tierProgress').textContent = `${pointsNeeded > 0 ? pointsNeeded : 0}/${nextThreshold - currentThreshold} points to reach ${nextTier}`;
            } else {
                // If at highest tier, show full progress
                progress = 100;
                document.getElementById('tierBar').style.width = `${progress}%`;
                document.getElementById('tierProgress').textContent = `Maximum tier reached!`;
            }
        }
        
        // Get next tier function
        function getNextTier() {
            const tiers = Object.keys(tierThresholds);
            const currentIndex = tiers.indexOf(currentTier);
            
            if (currentIndex < tiers.length - 1) {
                return tiers[currentIndex + 1];
            }
            return null;
        }
        
        // Check for tier upgrade
        function checkTierUpgrade() {
            const nextTier = getNextTier();
            
            if (nextTier && points >= tierThresholds[nextTier]) {
                // Upgrade tier
                currentTier = nextTier;

                // Update UI
                document.getElementById('currentTierIcon').textContent = tierIcons[currentTier];
                document.getElementById('currentTierText').textContent = `Current Tier: ${currentTier}`;
                document.getElementById('tierBenefits').textContent = `Benefits: ${tierBenefits[currentTier]}`;

                // Unlock badge for the tier
                unlockBadge(currentTier);

                // Show celebration with African drum sound
                showCelebration(currentTier);
            }
        }
        
        // Show celebration with African drum sound
        function showCelebration(tier) {
            achievedTier.textContent = tier;
            celebration.classList.add('active');
            
            // Play drum sound on loop
            drumSound.play();
            
            // Auto-stop after 30 seconds
            drumTimeout = setTimeout(() => {
                stopCelebration();
            }, 30000);
        }
        
        // Stop celebration
        function stopCelebration() {
            celebration.classList.remove('active');
            drumSound.pause();
            drumSound.currentTime = 0;
            clearTimeout(drumTimeout);
        }
        
        // Stop sound button event
        stopSoundBtn.addEventListener('click', stopCelebration);
        
        // Initialize tier progress
        updateTierProgress();

        // Unlock badge function
        function unlockBadge(tier) {
        // Show points popup animation
        function showPointsPopup(amount) {
            const popup = document.getElementById('pointsPopup');
            popup.textContent = `+${amount} ⭐`;
            popup.classList.remove('active');
            void popup.offsetWidth; // Force reflow for animation
            popup.classList.add('active');
            setTimeout(() => {
                popup.classList.remove('active');
            }, 1800);
        }
            // Map tier to badge index (Bronze: 0, Silver: 1, Gold: 2, Platinum: 3)
            const badgeMap = {
                'Bronze': 0,
                'Silver': 1,
                'Gold': 2,
                'Platinum': 3
            };
            const index = badgeMap[tier];
            const badges = document.querySelectorAll('.badges-container .badge');
            if (badges[index]) {
                badges[index].classList.remove('locked');
                badges[index].querySelector('i').classList.remove('fa-lock');
                badges[index].querySelector('i').classList.add('fa-medal');
            }
        }