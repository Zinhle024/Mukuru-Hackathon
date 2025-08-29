// Student data
let student = {
    id: 1,
    name: "Sarah Johnson",
    points: 0,
    earnedRewards: []
};

// API base URL - points to your backend
const API_BASE_URL = 'http://localhost:8000/api';

// Stickers for each point
const stickers = [
    "🥉", "🥉", "🥉", "🥉", "🎯", 
    "🥈", "🥈", "🥈", "🥈", "🥈",
    "🥈", "🥈", "🥈", "🥈", "🎯",
    "🏅", "🏅", "🏅", "🏅", "🏅",
    "🏅", "🏅", "🏅", "🏅", "🏅",
    "🏅", "🏅", "🏅", "🏅", "🎯",
    "🏆", "🏆", "🏆", "🏆", "🏆",
    "🏆", "🏆", "🏆", "🏆", "🏆",
    "🏆", "🏆", "🏆", "🏆", "🏆",
    "🏆", "🏆", "🏆", "🏆", "🎁"
];

// DOM elements
const englishBtn = document.getElementById('english-btn');
const mathBtn = document.getElementById('math-btn');
const ptBtn = document.getElementById('pt-btn');
const resetBtn = document.getElementById('reset-btn');

// Initialize the points grid
function initPointsGrid() {
    const grid = document.getElementById('points-grid');
    grid.innerHTML = '';
    
    for (let i = 1; i <= 50; i++) {
        const cell = document.createElement('div');
        cell.className = 'point-cell';
        cell.innerHTML = i + `<div class="sticker">${stickers[i-1]}</div>`;
        grid.appendChild(cell);
    }
}

// Update the UI based on current points
function updateUI() {
    // Update points display
    document.getElementById('total-points').textContent = student.points;
    
    // Update progress bar
    const progressBar = document.getElementById('progress-bar');
    let progressWidth = 0;
    
    if (student.points < 5) {
        progressWidth = (student.points / 5) * 100;
    } else if (student.points < 15) {
        progressWidth = ((student.points - 5) / 10) * 100;
    } else if (student.points < 30) {
        progressWidth = ((student.points - 15) / 15) * 100;
    } else {
        progressWidth = 100;
    }
    
    progressBar.style.width = `${progressWidth}%`;
    
    // Update rewards
    document.getElementById('chocolate-reward').textContent = 
        student.earnedRewards.includes('chocolate') ? 'Earned! 🎉' : 'Not earned';
    document.getElementById('chocolate-reward').style.color = 
        student.earnedRewards.includes('chocolate') ? '#28a745' : '#dc3545';
        
    document.getElementById('cash-reward').textContent = 
        student.earnedRewards.includes('50_rands') ? 'Earned! 🎉' : 'Not earned';
    document.getElementById('cash-reward').style.color = 
        student.earnedRewards.includes('50_rands') ? '#28a745' : '#dc3545';
        
    document.getElementById('gift-reward').textContent = 
        student.earnedRewards.includes('100_rands') ? 'Earned! 🎉' : 'Not earned';
    document.getElementById('gift-reward').style.color = 
        student.earnedRewards.includes('100_rands') ? '#28a745' : '#dc3545';
    
    // Update points grid
    const cells = document.querySelectorAll('.point-cell');
    cells.forEach((cell, index) => {
        if (index + 1 <= student.points) {
            cell.classList.add('earned');
        } else {
            cell.classList.remove('earned');
        }
    });
}

// Show status message
function showStatus(message, isSuccess = true) {
    const statusEl = document.getElementById('status-message');
    statusEl.textContent = message;
    statusEl.className = isSuccess ? 'status-message status-success' : 'status-message status-error';
    statusEl.style.display = 'block';
    
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 3000);
}

// Load student data from backend
async function loadStudentData() {
    try {
        const response = await fetch(`${API_BASE_URL}/student/${student.id}`);
        if (!response.ok) throw new Error('Failed to load student data');
        
        const data = await response.json();
        student.points = data.total_points;
        
        // Load rewards
        const rewardsResponse = await fetch(`${API_BASE_URL}/student/${student.id}/rewards`);
        if (rewardsResponse.ok) {
            const rewardsData = await rewardsResponse.json();
            student.earnedRewards = rewardsData.rewards.map(r => r.type);
        }
        
        updateUI();
        showStatus('Data loaded successfully from database!');
    } catch (error) {
        console.error('Error loading student data:', error);
        showStatus('Error loading data from database. Make sure the backend is running.', false);
    }
}

// Add points based on subject
async function addPoints(subject) {
    let pointsToAdd = 0;
    
    switch(subject) {
        case 'english':
            pointsToAdd = 5;
            break;
        case 'math':
            pointsToAdd = 15;
            break;
        case 'pt':
            pointsToAdd = 2;
            break;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/student/${student.id}/add-points`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subject: subject,
                points: pointsToAdd
            })
        });
        
        if (!response.ok) throw new Error('Failed to add points');
        
        const result = await response.json();
        
        if (result.success) {
            student.points = result.total_points;
            
            // Add newly earned rewards
            result.earned_rewards.forEach(reward => {
                if (!student.earnedRewards.includes(reward)) {
                    student.earnedRewards.push(reward);
                }
            });
            
            updateUI();
            showStatus(`Added ${pointsToAdd} points for ${subject}!`);
            
            // Show special message for new rewards
            if (result.earned_rewards.length > 0) {
                setTimeout(() => {
                    alert(`Congratulations! You earned a new reward: ${result.earned_rewards.join(', ').replace('_', ' ')}!`);
                }, 500);
            }
        }
    } catch (error) {
        console.error('Error adding points:', error);
        showStatus('Error adding points. Make sure the backend is running.', false);
    }
}

// Reset points
async function resetPoints() {
    if (!confirm('Are you sure you want to reset all points and rewards?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/student/${student.id}/reset`, {
            method: 'POST'
        });
        
        if (!response.ok) throw new Error('Failed to reset points');
        
        const result = await response.json();
        
        if (result.success) {
            student.points = 0;
            student.earnedRewards = [];
            updateUI();
            showStatus('All points and rewards have been reset!');
        }
    } catch (error) {
        console.error('Error resetting points:', error);
        showStatus('Error resetting points. Make sure the backend is running.', false);
    }
}

// Set up event listeners
function setupEventListeners() {
    englishBtn.addEventListener('click', () => addPoints('english'));
    mathBtn.addEventListener('click', () => addPoints('math'));
    ptBtn.addEventListener('click', () => addPoints('pt'));
    resetBtn.addEventListener('click', resetPoints);
}

// Initialize the application
window.onload = function() {
    initPointsGrid();
    setupEventListeners();
    loadStudentData(); // Load data from backend on page load
};