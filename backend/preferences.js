document.addEventListener('DOMContentLoaded', function () {
    //click sounds
    const clickSound = document.getElementById("click-sound");
    if (clickSound) clickSound.volume = 0.4;

    document.addEventListener('mousedown', function (event) {
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

    function playClickSound() {
        const soundToggle = document.getElementById("switch");
        if (soundToggle && soundToggle.checked) return;
        if (clickSound) {
            clickSound.currentTime = 0;
            clickSound.play().catch(e => console.log("Can't play click:", e));
        }
    }

    //loading theme and sound setting
    loadPreferences();
})

const themes = {
    dawn: {
        primary: "var(--dawn)",
        secondary: "var(--dawn2)",
        image: "/img/Dawn.svg"
    },
    water: {
        primary: 'var(--water)',
        secondary: 'var(--water2)',
        image: {
            desktop: '/img/Water.svg',
            tablet: '/img/Water-tablet.svg',
            mobile: '/img/Water-mobile.svg'
        }
    },
    earth: {
        primary: 'var(--earth)',
        secondary: 'var(--earth2)',
        image: {
            desktop: '/img/Earth.svg',
            tablet: '/img/Earth-tablet.svg',
            mobile: '/img/Earth-mobile.svg'
        }
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
};

function changeTheme(theme) {
    const themeConfig = themes[theme];
    const root = document.documentElement;
    const width = window.innerWidth;

    root.style.setProperty('--current-primary', themeConfig.primary);
    root.style.setProperty('--current-secondary', themeConfig.secondary);

    let backgroundImage = '';

    if (themeConfig.image.desktop) {
        if (width <= 470) {
            backgroundImage = themeConfig.image.mobile;
        } else if (width <= 800) {
            backgroundImage = themeConfig.image.tablet;
        } else {
            backgroundImage = themeConfig.image.desktop;
        }
        document.body.style.backgroundImage = `url("${backgroundImage}")`;
        document.querySelector('.settings-inner').style.backgroundImage = `url("${backgroundImage}")`;
    } else {
        document.body.style.backgroundImage = `url("${themeConfig.image}")`;
        document.querySelector('.settings-inner').style.backgroundImage = `url("${themeConfig.image}")`;
    }

    document.querySelectorAll('button').forEach(button => {
        button.style.backgroundColor = themeConfig.secondary;
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

    const settingsInner = document.querySelector('.settings-inner');
    if (settingsInner) {
        settingsInner.style.color = themeConfig.primary;
    }
}

function changeFont(font) {
    const chosenFont = fonts[font];
    if (chosenFont) {
        document.body.style.fontFamily = chosenFont;

        const daily = document.getElementById('daily');
        if (daily) {
            daily.style.fontFamily = chosenFont;
        }
    }
}

function loadPreferences() {
    const savedTheme = localStorage.getItem('selectedTheme');
    const savedFont = localStorage.getItem('selectedFont');

    //load themes
    if (savedTheme) {
        console.log(`Loading saved theme: ${savedTheme}`);
        changeTheme(savedTheme);
    } else {
        console.log('No saved theme, using default (dawn)');
        changeTheme('dawn');
    }

    //load font
    if (savedFont) {
        console.log(`Loading saved font: ${savedFont}`);
        changeFont(savedFont);
        
    } else {
        console.log('No saved font, using default (quicksand)');
        changeFont('Quicksand');
    }
}


function muteAllAudio(mute) {
    document.querySelectorAll('audio, video').forEach(media => {
        media.muted = mute;
    });
}