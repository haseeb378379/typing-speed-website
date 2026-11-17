// ==========================================
// TypeMaster - Contact Form Integration
// ==========================================

const contactForm = document.getElementById("contactForm");

if (contactForm) {

    const statusMessage =
        document.getElementById("contactFormStatus");

    // Success popup elements
    const successPopup =
        document.getElementById("contactSuccessPopup");

    const closeSuccessPopup =
        document.getElementById("closeSuccessPopup");

    const submitButton =
        contactForm.querySelector(
            'button[type="submit"]'
        );

    // Popup auto-close timer
    let popupTimer;

    // Close success popup manually
    if (closeSuccessPopup && successPopup) {

        closeSuccessPopup.addEventListener(
            "click",
            function () {

                successPopup.hidden = true;

                clearTimeout(popupTimer);

            }
        );

    }

    contactForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            // Collect form data
            const formData = {

                name:
                    document
                        .getElementById("contactName")
                        .value
                        .trim(),

                email:
                    document
                        .getElementById("contactEmail")
                        .value
                        .trim(),

                subject:
                    document
                        .getElementById("contactSubject")
                        .value,

                message:
                    document
                        .getElementById("contactMessage")
                        .value
                        .trim()

            };

            // Show loading state
            submitButton.disabled = true;
            submitButton.textContent = "Sending...";
            statusMessage.textContent = "";

            try {

                // Send data to Flask backend
                const response = await fetch(
                    "http://127.0.0.1:5000/api/contact",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(formData)
                    }
                );

                const result =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Something went wrong."
                    );

                }

                // Show success popup
                contactForm.reset();

                statusMessage.textContent = "";

                if (successPopup) {

                    clearTimeout(popupTimer);

                    successPopup.hidden = false;

                    popupTimer = setTimeout(
                        function () {

                            successPopup.hidden = true;

                        },
                        6000
                    );

                }

            } catch (error) {

                statusMessage.textContent =
                    error.message ||
                    "Unable to send your message.";

                statusMessage.style.color =
                    "red";

            } finally {

                submitButton.disabled = false;

                submitButton.textContent =
                    "Send Message →";

            }

        }
    );

}


// ==========================================
// TypeMaster - Global Settings
// ==========================================

(function () {

    /*
     * TypeMaster ka default website theme
     * DARK hai.
     *
     * Isliye Dark Mode OFF hone par
     * hum dark-mode class remove nahi karenge.
     *
     * Settings sirf localStorage mein save hoti hain.
     */

    function applySettings() {

        const savedSettings =
            localStorage.getItem(
                "typeMasterSettings"
            );

        if (!savedSettings) {
            return;
        }

        try {

            const settings =
                JSON.parse(savedSettings);

            /*
             * Agar Dark Mode ON hai,
             * dark-mode class ensure karo.
             */
            if (settings.darkMode === true) {

                document.body.classList.add(
                    "dark-mode"
                );

            }

            /*
             * Agar Dark Mode OFF hai,
             * kuch remove nahi karna.
             *
             * Website ka original dark design
             * waise hi rehna chahiye.
             */

        } catch (error) {

            console.error(
                "Could not apply settings:",
                error
            );

        }

    }


    // Make sure body exists before applying settings
    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            applySettings
        );

    } else {

        applySettings();

    }

})();