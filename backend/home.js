document.addEventListener('DOMContentLoaded', function () {
    const openButton = document.getElementById("open-settings");
    const closeButton = document.querySelector(".close")
    const settings = document.getElementById("settings");

    const themeSelect = document.getElementById("theme");
    const fontSelect = document.getElementById("font");

    const clickSound = document.getElementById("click-sound");
    clickSound.volume = 0.4;
    const soundToggle = document.getElementById("switch");

    //click sounds
    function playClickSound() {
        if (soundToggle.checked) return;
        clickSound.currentTime = 0;
        clickSound.play().catch(e => console.log("Can't play click:", e));
    }

    document.addEventListener('mousedown', function(event) {
        const target = event.target;
        if (target.tagName === 'BUTTON' || 
            target.tagName === 'A' || 
            target.tagName === 'INPUT' ||
            target.tagName === 'SELECT' ||
            target.tagName === 'SPAN' ||
            target.closest('button') || 
            target.closest('a')) {
                playClickSound();
            }
    });
    
    //settings open and close
    openButton.addEventListener("click", () => {
        settings.classList.add("open");
        console.log("open settings");
    });

    closeButton.addEventListener("click", () => {
        settings.classList.remove("open");
    });

    settings.addEventListener("click", (e) => {
        if (e.target === settings) {
            settings.classList.remove("open");
        }
    });

    //theme selection
    themeSelect.addEventListener("change", function() {
        const selectedTheme = this.value;
        changeTheme(selectedTheme);
        localStorage.setItem('selectedTheme', selectedTheme);
    })

    //font selection
    fontSelect.addEventListener("change", function() {
        const selectedFont = this.value;
        changeFont(selectedFont);
        localStorage.setItem('selectedFont', selectedFont);
    })

    soundToggle.addEventListener('change', function() {
        muteAllAudio(this.checked)
    })

    loadPreferences();
});

const themes = {
    dawn: {
        primary: "var(--dawn)",
        secondary: "var(--dawn2)",
        image: "/img/Dawn.svg"
    },
    water: {
        primary: 'var(--water)',
        secondary: 'var(--water2)',
        image: '/img/Water.svg'
    },
    earth: {
        primary: 'var(--earth)',
        secondary: 'var(--earth2)',
        image: '/img/Earth.svg'
    },
    sunset: {
        primary: 'white',
        secondary: 'var(--sunset)',
        image: '/img/Sunset.svg'
    }
};

const fonts = {
    Quicksand: 'var(--quicksand)',
    Inter: 'var(--inter)',
    Outfit: 'var(--outfit)'
}

function changeTheme(theme) {
    const themeConfig = themes[theme];
    const root = document.documentElement;

    root.style.setProperty('--current-primary', themeConfig.primary);
    root.style.setProperty('--current-secondary', themeConfig.secondary);
    document.body.style.backgroundImage = `url("${themeConfig.image}")`;
    document.querySelector('.settings-inner').style.backgroundImage = `url("${themeConfig.image}")`;

    document.querySelectorAll('button').forEach(button => {
        button.style.backgroundImage = themeConfig.secondary;
    });

    document.querySelectorAll('nav a').forEach(link => {
        link.style.color = themeConfig.secondary;
        link.addEventListener('mouseover', () => {
            link.style.backgroundColor = themeConfig.secondary;
            link.style.color = 'white';
        });
        link.addEventListener('mouseout', () => {
            link.style.backgroundColor = '';
            link.style.color = themeConfig.secondary;
        });
    });

    document.querySelectorAll('.settings-inner').style.color = themeConfig.primary;
}

function changeFont(font) {
    const fontFamily = fonts[font];
    document.body.style.fontFamily = fontFamily;
    document.getElementById('daily').style.fontFamily = fontFamily;
}

function loadPreferences() {
    const savedTheme = localStorage.getItem('selectedTheme');
    const themeToApply = savedTheme || 'dawn';
    document.getElementById('theme').value = themeToApply;
    changeTheme(themeToApply);
    if (savedTheme) {
        document.getElementById('theme').value = savedTheme;
        changeTheme(savedTheme);
    }

    const savedFont = localStorage.getItem('selectedFont');
    if (savedFont) {
        document.getElementById('font').value = savedFont;
        changeFont(savedFont);
    }
}

function muteAllAudio(mute) {
    document.querySelectorAll('audio, video').forEach(media => {
        media.muted = mute;
    });

    if (window.AudioContext || window.webkitAudioContext) {
        if (mute) {
            document.documentElement.classList.add('audio-muted');
        } else {
            document.documentElement.classList.remove('audio-muted');
        }
    }
}