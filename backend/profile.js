// Variables to track the lists
let classes = [];
let clubs = [];

// DOM Elements
const addPhotoBtn = document.getElementById('add-photo-btn');
const photoUpload = document.getElementById('photo-upload');
const profileImage = document.getElementById('profile-image');
const updateProfileBtn = document.getElementById('update-profile');
const addClass = document.getElementById('add-class');
const addClub = document.getElementById('add-club');
const saveProfileBtn = document.getElementById('save-profile');

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();
    updateHoursStudiedDisplay();
    updateTasksCompletedDisplay();

    addPhotoBtn.addEventListener('click', () => {
        photoUpload.click();
    });
    photoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                profileImage.src = event.target.result;
                profileImage.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    updateProfileBtn.addEventListener('click', updateProfileInfo);
    addClass.addEventListener('click', () => {
        const newClassInput = document.getElementById('new-class');
        if (newClassInput.value.trim() !== '') {
            addItem('class', newClassInput.value);
            newClassInput.value = '';
            updateCounts();
        }
    });
    addClub.addEventListener('click', () => {
        const newClubInput = document.getElementById('new-club');
        if (newClubInput.value.trim() !== '') {
            addItem('club', newClubInput.value);
            newClubInput.value = '';
            updateCounts();
        }
    });
    saveProfileBtn.addEventListener('click', saveProfileData);
    document.getElementById('new-class').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addClass.click();
        }
    });
    document.getElementById('new-club').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addClub.click();
        }
    });
});

// Function to update profile info
function updateProfileInfo() {
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const college = document.getElementById('college');
    const collegeName = college.options[college.selectedIndex].text;
    const major = document.getElementById('major').value;
    const year = document.getElementById('year');
    const yearText = year.options[year.selectedIndex].text;
    document.getElementById('card-name').textContent = name || 'Not set';
    document.getElementById('card-age').textContent = age || 'Not set';
    document.getElementById('card-college').textContent = collegeName;
    document.getElementById('card-major').textContent = major || 'Not set';
    document.getElementById('card-year').textContent = yearText;
    document.getElementById('click-sound').play();
}

// Function to add a new item (class or club)
function addItem(type, value) {
    const item = { id: Date.now(), name: value };
    if (type === 'class') {
        classes.push(item);
        renderList('classes');
    } else if (type === 'club') {
        clubs.push(item);
        renderList('clubs');
    }
    document.getElementById('click-sound').play();
    updateHoursStudiedDisplay();
    updateTasksCompletedDisplay();
}

// Function to render a list (classes or clubs)
function renderList(type) {
    const listElement = document.getElementById(`${type}-list`);
    const items = type === 'classes' ? classes : clubs;
    listElement.innerHTML = '';
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add(type === 'classes' ? 'class-item' : 'club-item');
        const nameSpan = document.createElement('span');
        nameSpan.textContent = item.name;
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
            deleteItem(type, item.id);
        });
        itemElement.appendChild(nameSpan);
        itemElement.appendChild(deleteBtn);
        listElement.appendChild(itemElement);
    });
}

// Function to delete an item
function deleteItem(type, id) {
    if (type === 'classes') {
        classes = classes.filter(item => item.id !== id);
        renderList('classes');
    } else if (type === 'clubs') {
        clubs = clubs.filter(item => item.id !== id);
        renderList('clubs');
    }
    updateCounts();
    document.getElementById('click-sound').play();
    updateHoursStudiedDisplay();
    updateTasksCompletedDisplay();
}

// Function to update counts in the dashboard
function updateCounts() {
    document.getElementById('class-count').textContent = classes.length;
    document.getElementById('club-count').textContent = clubs.length;
}

// Function to save profile data to localStorage
function saveProfileData() {
    const profileData = {
        name: document.getElementById('name').value,
        age: document.getElementById('age').value,
        college: document.getElementById('college').value,
        major: document.getElementById('major').value,
        year: document.getElementById('year').value,
        profileImage: profileImage.style.display !== 'none' ? profileImage.src : null,
        classes: classes,
        clubs: clubs
    };
    localStorage.setItem('dailyProfileData', JSON.stringify(profileData));
    document.getElementById('click-sound').play();
    alert('Profile saved successfully!');
    updateHoursStudiedDisplay();
    updateTasksCompletedDisplay();
}

// Function to reset profile data in localStorage
function resetProfileData() {
    localStorage.clear()
}

const resetButton = document.getElementById('reset-data');

resetButton.addEventListener('click', () => {
    resetProfileData();  // Call the reset function when the button is clicked
    alert("Your data has been reset!");
    location.reload();
});

// Function to load profile data from localStorage
function loadProfileData() {
    const savedData = localStorage.getItem('dailyProfileData');
    if (savedData) {
        const profileData = JSON.parse(savedData);
        document.getElementById('name').value = profileData.name || '';
        document.getElementById('age').value = profileData.age || '';
        document.getElementById('college').value = profileData.college || 'hunter';
        document.getElementById('major').value = profileData.major || '';
        document.getElementById('year').value = profileData.year || '1st';
        if (profileData.profileImage) {
            profileImage.src = profileData.profileImage;
            profileImage.style.display = 'block';
        }
        classes = profileData.classes || [];
        clubs = profileData.clubs || [];
        renderList('classes');
        renderList('clubs');
        updateProfileInfo();
        updateCounts();
    }
    updateHoursStudiedDisplay();
    updateTasksCompletedDisplay();
}

// Function to update hours studied display
function updateHoursStudiedDisplay() {
    const classSeconds = parseInt(localStorage.getItem('taskTimeData_class') || '0');
    const clubSeconds = parseInt(localStorage.getItem('taskTimeData_club') || '0');
    const classHours = (classSeconds / 3600).toFixed(2);
    const clubHours = (clubSeconds / 3600).toFixed(2);
    const totalHours = (+classHours + +clubHours).toFixed(2);
    const totalEl = document.getElementById('hours-studied');
    const classEl = document.getElementById('hours-studied-classes');
    const clubEl = document.getElementById('hours-studied-clubs');
    if (totalEl) totalEl.textContent = totalHours;
    if (classEl) classEl.textContent = `Classes: ${classHours} h`;
    if (clubEl) clubEl.textContent = `Clubs: ${clubHours} h`;
}

// Function to update tasks completed display
function updateTasksCompletedDisplay() {
    const completedTasks = JSON.parse(localStorage.getItem('completed_tasks') || '[]');
    const tasksCompletedCount = completedTasks.length;
    const tasksCompletedEl = document.getElementById('tasks-completed');
    if (tasksCompletedEl) tasksCompletedEl.textContent = tasksCompletedCount;
}