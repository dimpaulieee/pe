// Enhanced My Personal Tracker Application
const DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1tEZEoLqL6IAmeMCeqRt0_cZisMYiBXSg";
const START_DATE = new Date('2024-10-20');
const END_DATE = new Date(START_DATE);
END_DATE.setDate(START_DATE.getDate() + 28);

// Fitness Facts Database
const FITNESS_FACTS = [
    "💪 Building muscle increases your resting metabolism, helping you burn more calories even at rest!",
    "🏃‍♂️ Regular exercise can improve your mood and reduce symptoms of anxiety and depression.",
    "🥦 Protein is essential for muscle repair. Aim for 1.6-2.2g per kg of body weight when building muscle.",
    "💧 Staying hydrated can improve exercise performance by up to 25%!",
    "🛌 Quality sleep is crucial for muscle recovery and growth. Aim for 7-9 hours per night.",
    "📈 Consistency beats intensity. Regular moderate exercise is better than occasional intense workouts.",
    "🍎 Eating protein-rich foods after workouts helps maximize muscle protein synthesis.",
    "🔥 HIIT workouts can burn calories for up to 24 hours after your workout (afterburn effect).",
    "🧘‍♂️ Stretching improves flexibility and can help prevent injuries during workouts.",
    "📊 Tracking your progress increases motivation and helps you stay accountable to your goals."
];

// Application State
let currentUser = null;
let currentDay = 1;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (window.location.pathname.includes('login.html') || window.location.pathname === '/') {
        if (currentUser) {
            window.location.href = 'dashboard.html';
        } else {
            initializeLoginPage();
        }
    } else {
        if (!currentUser) {
            window.location.href = 'login.html';
        } else {
            initializeDashboard();
        }
    }
});

// Login Page Functions
function initializeLoginPage() {
    // Initialize AOS animations
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true
        });
    }
    
    // Start fact carousel
    startFactCarousel();
    
    // Handle login form submission
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

function startFactCarousel() {
    const facts = document.querySelectorAll('.fact');
    let currentFact = 0;
    
    setInterval(() => {
        facts[currentFact].classList.remove('active');
        currentFact = (currentFact + 1) % facts.length;
        facts[currentFact].classList.add('active');
    }, 5000);
}

function handleLogin(event) {
    event.preventDefault();
    
    const userData = {
        username: document.getElementById('username').value,
        weight: parseFloat(document.getElementById('weight').value),
        height: parseFloat(document.getElementById('height').value),
        goal: document.getElementById('goal').value,
        startDate: new Date().toISOString(),
        initialWeight: parseFloat(document.getElementById('weight').value),
        initialHeight: parseFloat(document.getElementById('height').value)
    };
    
    // Save user data
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('userProgress', JSON.stringify({
        workoutsCompleted: 0,
        mealsLogged: 0,
        activities: {},
        foodLog: {},
        measurements: [],
        achievements: []
    }));
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
}

// Dashboard Functions
function initializeDashboard() {
    calculateCurrentDay();
    updateDashboard();
    initializeAllSections();
    
    // Initialize animations
    if (typeof AOS !== 'undefined') {
        AOS.init();
    }
    
    // Show daily fact
    showDailyFact();
    
    // Update progress tracker
    updateProgressTracker();
}

function calculateCurrentDay() {
    const today = new Date();
    const timeDiff = today - START_DATE;
    currentDay = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
    currentDay = Math.max(1, Math.min(28, currentDay));
}

function updateDashboard() {
    if (!currentUser) return;
    
    // Update welcome message
    document.getElementById('userWelcome').textContent = `Welcome, ${currentUser.username}!`;
    document.getElementById('currentDay').textContent = `Day ${currentDay}`;
    
    // Update stats
    const progress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    
    document.getElementById('currentWeight').textContent = `${currentUser.weight}kg`;
    document.getElementById('totalWorkouts').textContent = progress.workoutsCompleted || 0;
    document.getElementById('mealsLogged').textContent = progress.mealsLogged || 0;
    
    // Calculate consistency score
    const consistency = calculateConsistencyScore(progress);
    document.getElementById('consistencyScore').textContent = `${consistency}%`;
    
    // Update weight trend
    updateWeightTrend();
}

function calculateConsistencyScore(progress) {
    const totalPossible = currentDay * 2; // 2 main activities per day (workout + nutrition)
    const actualCompleted = (progress.workoutsCompleted || 0) + (progress.mealsLogged || 0);
    return Math.round((actualCompleted / totalPossible) * 100);
}

function updateWeightTrend() {
    const progress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    const measurements = progress.measurements || [];
    
    if (measurements.length > 1) {
        const latestWeight = measurements[measurements.length - 1].weight;
        const previousWeight = measurements[measurements.length - 2].weight;
        const trend = latestWeight < previousWeight ? 'down' : latestWeight > previousWeight ? 'up' : 'same';
        
        const trendElement = document.getElementById('weightTrend');
        trendElement.innerHTML = trend === 'down' ? 
            '<i class="fas fa-arrow-down" style="color: var(--success-color);"></i>' :
            trend === 'up' ? 
            '<i class="fas fa-arrow-up" style="color: var(--error-color);"></i>' :
            '<i class="fas fa-minus" style="color: var(--warning-color);"></i>';
    }
}

function showDailyFact() {
    const today = new Date().getDate();
    const factIndex = today % FITNESS_FACTS.length;
    document.getElementById('dailyFact').textContent = FITNESS_FACTS[factIndex];
}

function updateProgressTracker() {
    const progressPercent = (currentDay / 28) * 100;
    document.getElementById('journeyProgress').style.width = `${progressPercent}%`;
}

// Enhanced Google Drive Integration
function saveToGoogleDrive() {
    const userData = {
        user: currentUser,
        progress: JSON.parse(localStorage.getItem('userProgress') || '{}'),
        exportDate: new Date().toISOString(),
        day: currentDay
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MyPersonalTracker_${currentUser.username}_Day${currentDay}.json`;
    a.click();
    
    // Show instructions for Google Drive
    alert(`📁 Your data has been downloaded!\n\nTo save to Google Drive:\n1. Open your Google Drive folder\n2. Drag the downloaded file into the folder\n3. Your data is now safely stored in the cloud!`);
}

// Summary and Report Functions
function showSummaryModal() {
    generateSummaryContent();
    document.getElementById('summaryModal').style.display = 'block';
}

function closeSummaryModal() {
    document.getElementById('summaryModal').style.display = 'none';
}

function generateSummaryContent() {
    const progress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    const content = document.getElementById('summaryContent');
    
    content.innerHTML = `
        <div class="summary-section">
            <h3>📊 Journey Overview</h3>
            <div class="summary-stats">
                <div class="summary-stat">
                    <h4>${currentDay}/28</h4>
                    <p>Days Completed</p>
                </div>
                <div class="summary-stat">
                    <h4>${progress.workoutsCompleted || 0}</h4>
                    <p>Workouts</p>
                </div>
                <div class="summary-stat">
                    <h4>${progress.mealsLogged || 0}</h4>
                    <p>Meals Logged</p>
                </div>
                <div class="summary-stat">
                    <h4>${calculateConsistencyScore(progress)}%</h4>
                    <p>Consistency</p>
                </div>
            </div>
        </div>
        
        <div class="summary-section">
            <h3>🎯 Goal Progress</h3>
            <p><strong>Initial Goal:</strong> ${formatGoal(currentUser.goal)}</p>
            <p><strong>Weight Change:</strong> ${calculateWeightChange()} kg</p>
            <p><strong>BMI Change:</strong> ${calculateBMIChange()}</p>
        </div>
        
        <div class="summary-section">
            <h3>🏆 Achievements</h3>
            <div id="achievementsSummary">
                ${generateAchievementsList(progress.achievements || [])}
            </div>
        </div>
        
        <div class="summary-section">
            <h3>📈 Weekly Progress</h3>
            <div class="progress-chart-small">
                ${generateProgressChart()}
            </div>
        </div>
    `;
}

function formatGoal(goal) {
    const goals = {
        'build-muscle': 'Build Muscle',
        'lose-fat': 'Lose Fat',
        'improve-endurance': 'Improve Endurance',
        'general-fitness': 'General Fitness'
    };
    return goals[goal] || goal;
}

function calculateWeightChange() {
    const progress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    const measurements = progress.measurements || [];
    
    if (measurements.length > 0) {
        const initialWeight = currentUser.initialWeight;
        const currentWeight = measurements[measurements.length - 1].weight;
        return (currentWeight - initialWeight).toFixed(1);
    }
    return '0.0';
}

function calculateBMIChange() {
    const progress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    const measurements = progress.measurements || [];
    
    if (measurements.length > 0) {
        const initialBMI = calculateBMI(currentUser.initialWeight, currentUser.height);
        const currentWeight = measurements[measurements.length - 1].weight;
        const currentBMI = calculateBMI(currentWeight, currentUser.height);
        return (currentBMI - initialBMI).toFixed(1);
    }
    return '0.0';
}

function calculateBMI(weight, height) {
    return weight / ((height / 100) ** 2);
}

function generateAchievementsList(achievements) {
    if (achievements.length === 0) {
        return '<p>No achievements yet. Keep going! 🚀</p>';
    }
    
    return achievements.map(achievement => `
        <div class="achievement-item">
            <div class="achievement-icon">
                <i class="fas fa-trophy"></i>
            </div>
            <div>
                <strong>${achievement.title}</strong>
                <p>${achievement.description}</p>
                <small>Earned on: ${new Date(achievement.date).toLocaleDateString()}</small>
            </div>
        </div>
    `).join('');
}

function generateProgressChart() {
    // Simple text-based chart for demonstration
    return `
        <div style="text-align: center; padding: 2rem; background: var(--bg-color); border-radius: 8px;">
            <p>📊 Your progress chart will appear here</p>
            <p><small>As you log more data, you'll see detailed charts of your journey!</small></p>
        </div>
    `;
}

function downloadSummary() {
    const summaryContent = document.getElementById('summaryContent').innerText;
    const blob = new Blob([summaryContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `28DaySummary_${currentUser.username}.txt`;
    a.click();
}

function generateFullReport() {
    const progress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    
    const report = `
MY PERSONAL TRACKER - 28 DAY JOURNEY REPORT
Created by: Paul Andrei C. Timpog
PhilSCA-NAAP BAB-Palmayo Campus

USER: ${currentUser.username}
START DATE: ${new Date(START_DATE).toLocaleDateString()}
CURRENT DAY: ${currentDay} of 28

OVERVIEW:
- Workouts Completed: ${progress.workoutsCompleted || 0}
- Meals Logged: ${progress.mealsLogged || 0}
- Consistency Score: ${calculateConsistencyScore(progress)}%

GOAL PROGRESS:
- Initial Goal: ${formatGoal(currentUser.goal)}
- Weight Change: ${calculateWeightChange()} kg
- BMI Change: ${calculateBMIChange()}

ACHIEVEMENTS:
${(progress.achievements || []).map(a => `✓ ${a.title} - ${a.description}`).join('\n') || 'No achievements yet'}

DAILY LOGS:
${generateDailyLogsText()}

Generated on: ${new Date().toLocaleDateString()}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FullReport_${currentUser.username}_Day${currentDay}.txt`;
    a.click();
}

function generateDailyLogsText() {
    // This would generate text from all logged activities
    return "Your detailed daily logs will appear here...";
}

// Enhanced existing functions with user-specific data
function initializeAllSections() {
    // Your existing initialization code for BMI, activities, food, etc.
    // Modified to use currentUser data
    initializeBMISection();
    initializeGoalsSection();
    initializeActivitySection();
    initializeFoodSection();
}

function initializeBMISection() {
    if (currentUser) {
        document.getElementById('height').value = currentUser.height;
        document.getElementById('weight').value = currentUser.weight;
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

// Export all data
function exportAllData() {
    const allData = {
        user: currentUser,
        progress: JSON.parse(localStorage.getItem('userProgress') || '{}'),
        exportDate: new Date().toISOString(),
        system: 'My Personal Tracker by Paul Andrei C. Timpog'
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `MyPersonalTracker_Backup_${currentUser.username}.json`;
    link.click();
    
    alert('✅ All your data has been exported! You can import this file later to restore your progress.');
}

// Add this to your existing BMI calculation function
function calculateBMI() {
    const height = parseFloat(document.getElementById('height').value) / 100;
    const weight = parseFloat(document.getElementById('weight').value);
    
    if (!height || !weight) {
        alert('Please enter both height and weight.');
        return;
    }
    
    const bmi = weight / (height * height);
    const category = getBMICategory(bmi);
    
    // Update user's current weight
    if (currentUser) {
        currentUser.weight = weight;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Save measurement to progress
        const progress = JSON.parse(localStorage.getItem('userProgress') || '{}');
        if (!progress.measurements) progress.measurements = [];
        progress.measurements.push({
            date: new Date().toISOString(),
            weight: weight,
            bmi: bmi
        });
        localStorage.setItem('userProgress', JSON.stringify(progress));
        
        // Update dashboard
        updateDashboard();
    }
    
    // Rest of your existing BMI calculation code...
}