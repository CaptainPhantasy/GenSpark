(function() {
    // Initialize EmailJS with your Public Key
    emailjs.init("8HqbJEOk0YWSIqfp9"); // Replace if needed, but this is the key you provided

    // --- Get Form and Elements ---
    const form = document.getElementById('legacyForm'); // Updated Form ID
    const toneSelect = document.getElementById('tone');
    const otherToneContainer = document.getElementById('otherToneContainer');
    const otherToneInput = document.getElementById('otherTone'); // Matched new ID
    const otherInteractionCheckbox = document.getElementById('other_interaction_checkbox'); // Matched new ID
    const otherInteractionContainer = document.getElementById('otherInteractionContainer');
    const otherInteractionInput = document.getElementById('otherInteraction'); // Matched new ID

    const feedbackContainer = document.getElementById('feedback-container');
    const feedbackMessage = document.getElementById('feedback-message');
    const submitButton = document.getElementById('submit-button'); // Assuming button has this ID

    // Device Indicator (from your provided script)
    const deviceIndicator = document.getElementById('deviceIndicator');

    // --- Event Listeners ---

    // Show/hide 'Other Tone' description
    if (toneSelect) {
         toneSelect.addEventListener('change', function() {
            if (this.value === 'other') {
                otherToneContainer.classList.remove('hidden');
                // otherToneInput.required = true; // Input isn't strictly required
            } else {
                otherToneContainer.classList.add('hidden');
                // otherToneInput.required = false;
                otherToneInput.value = ''; // Clear value when hidden
            }
        });
    }


    // Show/hide 'Other Interaction' description
    if (otherInteractionCheckbox) {
        otherInteractionCheckbox.addEventListener('change', function() {
            if (this.checked) {
                otherInteractionContainer.classList.remove('hidden');
                // otherInteractionInput.required = true; // Input isn't strictly required
            } else {
                otherInteractionContainer.classList.add('hidden');
                // otherInteractionInput.required = false;
                otherInteractionInput.value = ''; // Clear value when hidden
            }
        });
    }

    // Device type detection function (from your provided script)
    function updateDeviceIndicator() {
        if (!deviceIndicator) return; // Exit if indicator element doesn't exist
        let deviceType = "Desktop";
        let orientation = "Landscape";

        if (window.innerWidth <= 768) {
            deviceType = "Mobile";
        } else if (window.innerWidth <= 1024) {
            deviceType = "Tablet";
        }

        if (window.innerHeight > window.innerWidth) {
            orientation = "Portrait";
        }

        deviceIndicator.textContent = `${deviceType} - ${orientation}`;
    }

    // Initialize and update device indicator on resize
    updateDeviceIndicator();
    window.addEventListener('resize', updateDeviceIndicator);


    // --- Handle Form Submission ---
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default page reload

            // Validate interaction method checkboxes
            const interactionCheckboxes = document.querySelectorAll('input[name="interaction"]:checked'); // Updated name attribute
            if (interactionCheckboxes.length === 0) {
                 feedbackMessage.textContent = 'Please select at least one Interaction Method.';
                 feedbackContainer.className = 'error p-4 m-6 border rounded'; // Apply styling classes
                 feedbackContainer.classList.remove('hidden');
                 window.scrollTo(0, 0);
                 return; // Stop submission
            }

            // Disable submit button and show loading state
            if(submitButton) {
                 submitButton.disabled = true;
                 submitButton.textContent = 'Submitting...';
            }
            feedbackContainer.classList.add('hidden'); // Hide previous messages
            feedbackContainer.className = ''; // Clear previous status classes


            // --- Collect Form Data (using NEW IDs/Names) ---
            const interactionMethods = Array.from(interactionCheckboxes)
                                            .map(checkbox => checkbox.value)
                                            .join(', ');

            const templateParams = {
                // Contact Details
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                company: document.getElementById('company').value || 'N/A',

                // Agent Purpose
                agent_name: document.getElementById('agentName').value || 'N/A', // Use new ID 'agentName'
                primary_goal: document.getElementById('primaryGoal').value, // Use new ID 'primaryGoal'
                intended_users: document.getElementById('intendedUsers').value, // Use new ID 'intendedUsers'

                // Behavior & Knowledge
                knowledge_sources: document.getElementById('knowledgeSources').value, // Use new ID 'knowledgeSources'
                tone: toneSelect ? toneSelect.value : '', // Check if exists
                other_tone: toneSelect && toneSelect.value === 'other' ? (otherToneInput ? otherToneInput.value : '') : '', // Check if exists
                restrictions: document.getElementById('limitations').value || 'None specified', // Use new ID 'limitations'
                handling_unknowns: document.getElementById('unknowns') ? document.getElementById('unknowns').value : '', // Check if exists, Use new ID 'unknowns'

                // Technical Needs
                interaction_methods: interactionMethods,
                other_interaction: otherInteractionCheckbox && otherInteractionCheckbox.checked ? (otherInteractionInput ? otherInteractionInput.value : '') : '', // Check if exists
                additional_context: document.getElementById('additionalContext') ? (document.getElementById('additionalContext').value || 'None provided') : 'None provided' // Check if exists, Use new ID 'additionalContext'
            };

            // --- Construct the HTML message body ---
             const emailContent = `
                <h2>New AI Agent Request</h2>
                <hr>
                <h3>Contact Details</h3>
                <p><strong>Name:</strong> ${templateParams.name}</p>
                <p><strong>Email:</strong> ${templateParams.email}</p>
                <p><strong>Company/Organization:</strong> ${templateParams.company}</p>
                <hr>
                <h3>AI Agent's Purpose</h3>
                <p><strong>Agent Name Idea:</strong> ${templateParams.agent_name}</p>
                <p><strong>Intended Users:</strong> ${templateParams.intended_users}</p>
                <p><strong>Primary Goal:</strong></p>
                <p>${templateParams.primary_goal.replace(/\n/g, '<br>')}</p>
                <hr>
                <h3>Behavior and Knowledge</h3>
                <p><strong>Knowledge Sources:</strong></p>
                <p>${templateParams.knowledge_sources.replace(/\n/g, '<br>')}</p>
                <p><strong>Desired Tone/Personality:</strong> ${templateParams.tone}</p>
                ${templateParams.tone === 'other' ? `<p><strong>Other Tone Description:</strong> ${templateParams.other_tone}</p>` : ''}
                <p><strong>Restrictions/Limitations:</strong></p>
                <p>${templateParams.restrictions.replace(/\n/g, '<br>')}</p>
                <p><strong>Handling Unknowns:</strong> ${templateParams.handling_unknowns}</p>
                <hr>
                <h3>Technical Needs</h3>
                <p><strong>Interaction Methods:</strong> ${templateParams.interaction_methods}</p>
                ${templateParams.other_interaction ? `<p><strong>Other Interaction Description:</strong> ${templateParams.other_interaction}</p>` : ''}
                <p><strong>Additional Context:</strong></p>
                <p>${templateParams.additional_context.replace(/\n/g, '<br>')}</p>
                <hr>
            `;


            // --- Send Email using EmailJS ---
            const serviceID = 'service_1kdwb5c'; // Your Service ID
            const templateID = 'template_default'; // Your Template ID

            const emailJSParams = {
                 to_email: 'douglastalley1977@gmail.com', // Your receiving email
                 from_name: templateParams.name,
                 from_email: templateParams.email,
                 subject: 'New Legacy AI Agent Request from ' + templateParams.name, // Updated subject slightly
                 message_html: emailContent
             };

            emailjs.send(serviceID, templateID, emailJSParams)
                .then(function(response) {
                    console.log('SUCCESS!', response.status, response.text);
                    feedbackMessage.textContent = 'Your request has been submitted successfully! We will get back to you soon.';
                    feedbackContainer.className = 'success p-4 m-6 border rounded'; // Apply styling classes
                    feedbackContainer.classList.remove('hidden');
                    form.reset(); // Clear the form
                    // Ensure conditional fields are hidden after reset
                    if(otherToneContainer) otherToneContainer.classList.add('hidden');
                    if(otherInteractionContainer) otherInteractionContainer.classList.add('hidden');
                    window.scrollTo(0, 0); // Scroll to top

                }, function(error) {
                    console.log('FAILED...', error);
                    feedbackMessage.textContent = 'Error submitting request. Please check console (F12) or contact us. Error: ' + JSON.stringify(error);
                     feedbackContainer.className = 'error p-4 m-6 border rounded'; // Apply styling classes
                     feedbackContainer.classList.remove('hidden');
                     window.scrollTo(0, 0);

                }).finally(() => {
                     // Re-enable button
                     if(submitButton) {
                          submitButton.disabled = false;
                          submitButton.textContent = 'Submit Request';
                     }
                });
        });
    } // End if(form) check

})(); // End of IIFE
