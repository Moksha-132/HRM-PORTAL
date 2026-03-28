/* ── register.js – shnoor Registration Logic ── */

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const registerError = document.getElementById('register-error');

  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerError.style.display = 'none';

    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    const role = document.getElementById('register-role').value;

    if (password !== confirmPassword) {
      registerError.textContent = 'Passwords do not match.';
      registerError.style.display = 'block';
      return;
    }

    const submitBtn = document.getElementById('register-submit');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;

    try {
      const res = await fetch('/api/v1/auth/register/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        window.location.href = 'login.html?email=' + encodeURIComponent(email);
      } else {
        registerError.textContent = data.error || 'Registration failed. Please try again.';
        registerError.style.display = 'block';
      }
    } catch (error) {
      registerError.textContent = 'Network error. Please try again.';
      registerError.style.display = 'block';
    } finally {
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    }
  });

  // Hide error as user starts typing
  const inputs = registerForm.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      registerError.style.display = 'none';
    });
  });
});
