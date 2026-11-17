// ==========================================
// TypeMaster - Settings System
// ==========================================

const defaultSettings = {
    darkMode: false,
    testDuration: "60",
    liveWpm: true,
    typingSound: true,
    gameSound: true,
    gameDifficulty: "medium"
};


// ==========================================
// GET SAVED SETTINGS
// ==========================================

function getSettings() {

    const saved =
        localStorage.getItem("typeMasterSettings");

    if (!saved) {
        return { ...defaultSettings };
    }

    try {

        return {
            ...defaultSettings,
            ...JSON.parse(saved)
        };

    } catch (error) {

        console.error(
            "Could not load settings:",
            error
        );

        return { ...defaultSettings };
    }
}


// ==========================================
// APPLY SETTINGS
// ==========================================

function applySettings(settings) {

    document.body.classList.toggle(
        "dark-mode",
        settings.darkMode
    );
}


// ==========================================
// PUT SETTINGS INTO FORM
// ==========================================

function populateSettings(settings) {

    const darkMode =
        document.getElementById("darkMode");

    const testDuration =
        document.getElementById("testDuration");

    const liveWpm =
        document.getElementById("liveWpm");

    const typingSound =
        document.getElementById("typingSound");

    const gameSound =
        document.getElementById("gameSound");

    const gameDifficulty =
        document.getElementById("gameDifficulty");


    if (darkMode) {
        darkMode.checked = settings.darkMode;
    }

    if (testDuration) {
        testDuration.value =
            settings.testDuration;
    }

    if (liveWpm) {
        liveWpm.checked =
            settings.liveWpm;
    }

    if (typingSound) {
        typingSound.checked =
            settings.typingSound;
    }

    if (gameSound) {
        gameSound.checked =
            settings.gameSound;
    }

    if (gameDifficulty) {
        gameDifficulty.value =
            settings.gameDifficulty;
    }
}


// ==========================================
// GET FORM SETTINGS
// ==========================================

function getFormSettings() {

    return {

        darkMode:
            document.getElementById(
                "darkMode"
            ).checked,

        testDuration:
            document.getElementById(
                "testDuration"
            ).value,

        liveWpm:
            document.getElementById(
                "liveWpm"
            ).checked,

        typingSound:
            document.getElementById(
                "typingSound"
            ).checked,

        gameSound:
            document.getElementById(
                "gameSound"
            ).checked,

        gameDifficulty:
            document.getElementById(
                "gameDifficulty"
            ).value
    };
}


// ==========================================
// SAVE SETTINGS
// ==========================================

const saveButton =
    document.getElementById(
        "saveSettings"
    );

if (saveButton) {

    saveButton.addEventListener(
        "click",
        function () {

            const settings =
                getFormSettings();

            localStorage.setItem(
                "typeMasterSettings",
                JSON.stringify(settings)
            );

            applySettings(settings);

            const message =
                document.getElementById(
                    "settingsMessage"
                );

            if (message) {

                message.textContent =
                    "✓ Settings saved successfully.";

                message.style.color =
                    "green";

            }

        }
    );
}


// ==========================================
// RESET SETTINGS
// ==========================================

const resetButton =
    document.getElementById(
        "resetSettings"
    );

if (resetButton) {

    resetButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "typeMasterSettings"
            );

            populateSettings(
                defaultSettings
            );

            applySettings(
                defaultSettings
            );

            const message =
                document.getElementById(
                    "settingsMessage"
                );

            if (message) {

                message.textContent =
                    "✓ Settings restored to default.";

                message.style.color =
                    "green";

            }

        }
    );
}


// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const settings =
            getSettings();

        populateSettings(settings);

        applySettings(settings);

    }
);