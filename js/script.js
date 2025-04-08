(function() {
    // Initialize EmailJS with your Public Key
    emailjs.init("8HqbJEOk0YWSIqfp9");

    // --- Get Form and Elements ---
    const form = document.getElementById('ai-request-form');
    const toneSelect = document.getElementById('tone');
    const otherToneContainer = document.getElementById('other-tone-container');
    const otherToneTextarea = document.getElementById('other_tone'); // Matched ID from HTML
    const otherInteractionCheckbox = document.getElementById('interaction_other'); // Matched ID from HTML
    const otherInteractionContainer = document.getElementById('other-interaction-container');
    const otherInteractionTextarea = document.getElementById('other_interaction'); // Matched ID from HTML
    const feedbackContainer = document.getElementById('feedback-container');
    const feedbackMessage = document.getElementById('feedback-message');
    const submitButton = document.getElementById('submit-button');

    // --- Event Listeners ---

    // Show/hide 'Other Tone' description
    toneSelect.addEventListener('change', function() {
        if (this.value === 'Other') {
            otherToneContainer.classList.remove('hidden');
            otherToneTextarea.required = true;
        } else {
            otherToneContainer.classList.add('hidden');
            otherToneTextarea.required = false;
            otherToneTextarea.value = ''; // Clear value when hidden
        }
    });

    // Show/hide 'Other Interaction' description
    // Check if the element exists before adding listener
    if (otherInteractionCheckbox) {
        otherInteractionCheckbox.addEventListener('change', function() {
            if (this.checked) {
                otherInteractionContainer.classList.remove('hidden');
                otherInteractionTextarea.required = true;
            } else {
                otherInteractionContainer.classList.add('hidden');
                otherInteractionTextarea.required = false;
                otherInteractionTextarea.value = ''; // Clear value when hidden
            }
        });
    }


    // Handle Form Submission
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default page reload

        // Basic validation for interaction method checkboxes
        const interactionCheckboxes = document.querySelectorAll('input[name="interaction_methods"]:checked');
        if (interactionCheckboxes.length === 0) {
             // Use feedback container for consistency
             feedbackMessage.textContent = 'Please select at least one Interaction Method.';
             feedbackContainer.className = 'error'; // Add class for styling error
             feedbackContainer.classList.remove('hidden');
             window.scrollTo(0, 0); // Scroll to top to make message visible
             return; // Stop submission
        }

        // Disable submit button and show loading state (optional)
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        feedbackContainer.classList.add('hidden'); // Hide previous messages


        // --- Collect Form Data ---
        const interactionMethods = Array.from(interactionCheckboxes)
                                        .map(checkbox => checkbox.value)
                                        .join(', ');

        const templateParams = {
            // Contact Details
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            company: document.getElementById('company').value || 'N/A', // Handle optional field

            // Agent Purpose
            agent_name: document.getElementById('agent_name').value || 'N/A', // Handle optional field
            primary_goal: document.getElementById('primary_goal').value,
            intended_users: document.getElementById('intended_users').value,

            // Behavior & Knowledge
            knowledge_sources: document.getElementById('knowledge_sources').value,
            tone: toneSelect.value,
            other_tone: toneSelect.value === 'Other' ? otherToneTextarea.value : '',
            restrictions: document.getElementById('restrictions').value || 'None specified', // Handle optional field
            handling_unknowns: document.getElementById('handling_unknowns').value,

            // Technical Needs
            interaction_methods: interactionMethods,
            other_interaction: otherInteractionCheckbox && otherInteractionCheckbox.checked ? otherInteractionTextarea.value : '',
            additional_context: document.getElementById('additional_context').value || 'None provided' // Handle optional field
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
            ${templateParams.tone === 'Other' ? `<p><strong>Other Tone Description:</strong> ${templateParams.other_tone}</p>` : ''}
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

        // Prepare parameters expected by your specific EmailJS template setup
        const emailJSParams = {
             to_email: 'douglastalley1977@gmail.com', // Your receiving email
             from_name: templateParams.name,          // Sender's name
             from_email: templateParams.email,        // Sender's email (for Reply-To)
             subject: 'New AI Agent Request from ' + templateParams.name, // Dynamic subject
             message_html: emailContent               // The formatted HTML content
         };

        emailjs.send(serviceID, templateID, emailJSParams)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                feedbackMessage.textContent = 'Your AI agent request has been submitted successfully! We will review your requirements and get back to you soon.';
                feedbackContainer.className = 'success'; // Add class for styling success
                feedbackContainer.classList.remove('hidden');
                form.reset(); // Clear the form
                // Ensure conditional fields are hidden after reset
                otherToneContainer.classList.add('hidden');
                otherInteractionContainer.classList.add('hidden');
                window.scrollTo(0, 0); // Scroll to top to make message visible

            }, function(error) {
                console.log('FAILED...', error);
                feedbackMessage.textContent = 'There was an error submitting your request. Please check the console (F12) for details or contact us directly. Error: ' + JSON.stringify(error);
                 feedbackContainer.className = 'error'; // Add class for styling error
                 feedbackContainer.classList.remove('hidden');
                 window.scrollTo(0, 0); // Scroll to top to make message visible

            }).finally(() => {
                 // Re-enable button regardless of success or failure
                 submitButton.disabled = false;
                 submitButton.textContent = 'Submit Request';
            });
    });

})(); // End of IIFE (Immediately Invoked Function Expression) to scope variables