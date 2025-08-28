document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    
    if (signupForm) {
        signupForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            if (validateForm()) {
                // Show success message
                alert('Account created successfully! Redirecting to login page...');
                
                // In a real application, you would submit the form data to a server here
                // For this demo, we'll just redirect to the login page after a short delay
                setTimeout(function() {
                    window.location.href = 'index.html';
                }, 2000);
            }
        });
    }
    
    function validateForm() {
        let isValid = true;
        
        // Clear previous error messages
        clearErrors();
        
        // Validate first name
        const firstName = document.getElementById('firstName');
        if (!firstName.value.trim()) {
            showError(firstName, 'First name is required');
            isValid = false;
        }
        
        // Validate last name
        const lastName = document.getElementById('lastName');
        if (!lastName.value.trim()) {
            showError(lastName, 'Last name is required');
            isValid = false;
        }
        
        // Validate email
        const email = document.getElementById('email');
        if (!validateEmail(email.value.trim())) {
            showError(email, 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate phone
        const phone = document.getElementById('phone');
        if (!validatePhone(phone.value.trim())) {
            showError(phone, 'Please enter a valid phone number');
            isValid = false;
        }
        
        // Validate ID type
        const idType = document.getElementById('idType');
        if (idType.value === '') {
            showError(idType, 'Please select an ID type');
            isValid = false;
        }
        
        // Validate ID number
        const idNumber = document.getElementById('idNumber');
        if (!idNumber.value.trim()) {
            showError(idNumber, 'ID number is required');
            isValid = false;
        }
        
        // Validate password
        const password = document.getElementById('password');
        if (!validatePassword(password.value)) {
            showError(password, 'Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, and one number');
            isValid = false;
        }
        
        // Validate confirm password
        const confirmPassword = document.getElementById('confirmPassword');
        if (password.value !== confirmPassword.value) {
            showError(confirmPassword, 'Passwords do not match');
            isValid = false;
        }
        
        // Validate terms checkbox
        const terms = document.getElementById('terms');
        if (!terms.checked) {
            showError(terms, 'You must agree to the terms and conditions');
            isValid = false;
        }
        
        return isValid;
    }
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function validatePhone(phone) {
        // Basic phone validation - can be customized based on country format requirements
        const re = /^[+]?[0-9]{10,15}$/;
        return re.test(phone);
    }
    
    function validatePassword(password) {
        // Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, and one number
        // Also allowing special characters like underscore, dash, etc.
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d_\-!@#$%^&*()+=]{8,}$/;
        return re.test(password);
    }
    
    function showError(input, message) {
        const formGroup = input.parentElement;
        const errorElement = document.createElement('div');
        
        errorElement.className = 'error';
        errorElement.innerText = message;
        
        input.classList.add('error-input');
        formGroup.appendChild(errorElement);
    }
    
    function clearErrors() {
        // Remove all error messages
        const errorMessages = document.querySelectorAll('.error');
        errorMessages.forEach(function(error) {
            error.remove();
        });
        
        // Remove error-input class from all inputs
        const errorInputs = document.querySelectorAll('.error-input');
        errorInputs.forEach(function(input) {
            input.classList.remove('error-input');
        });
    }
});