
// ==========================================
// TypeMaster - Contact Form Integration
// ==========================================

const contactForm = document.getElementById("contactForm");

if (contactForm) {

    const statusMessage = document.getElementById("contactFormStatus");

    // Success popup elements
    const successPopup = document.getElementById("contactSuccessPopup");
    const closeSuccessPopup = document.getElementById("closeSuccessPopup");

    const submitButton = contactForm.querySelector(
        'button[type="submit"]'
    );

    // Popup timer
    let popupTimer = null;

    // Close popup manually
    if (closeSuccessPopup && successPopup) {

        closeSuccessPopup.addEventListener("click", function () {

            successPopup.hidden = true;

            clearTimeout(popupTimer);
            popupTimer = null;

        });

    }

    // Contact form submission
    contactForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        // Collect form data
        const formData = {
            name: document.getElementById("contactName").value.trim(),
            email: document.getElementById("contactEmail").value.trim(),
            subject: document.getElementById("contactSubject").value,
            message: document.getElementById("contactMessage").value.trim()
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
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                }
            );

            const result = await response.json();

            // Check response
            if (!response.ok) {
                throw new Error(
                    result.message || "Something went wrong."
                );
            }

            // Clear form
            contactForm.reset();
            statusMessage.textContent = "";

            // Show success popup
            if (successPopup) {

                // Clear previous timer
                clearTimeout(popupTimer);

                // Make popup visible
                successPopup.hidden = false;

                successPopup.style.display = "flex";
                successPopup.style.visibility = "visible";
                successPopup.style.opacity = "1";

                // Automatically close after 10 seconds
                popupTimer = setTimeout(function () {

                    successPopup.hidden = true;
                    successPopup.style.display = "";
                    successPopup.style.visibility = "";
                    successPopup.style.opacity = "";

                    popupTimer = null;

                }, 10000);

            }

        } catch (error) {

            // Show error message
            statusMessage.textContent =
                error.message || "Unable to send your message.";

            statusMessage.style.color = "red";

        } finally {

            // Restore submit button
            submitButton.disabled = false;
            submitButton.textContent = "Send Message →";

        }

    });

}
