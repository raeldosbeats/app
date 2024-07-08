document.addEventListener('DOMContentLoaded', () => {
    // Obter os elementos dos botões e modais
    const loginButton = document.getElementById('login-btn');
    const signupButton = document.getElementById('signup-btn');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const closeLogin = document.getElementById('closeLogin');
    const closeSignup = document.getElementById('closeSignup');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const signupEmail = document.getElementById('signupEmail');
    const signupPassword = document.getElementById('signupPassword');
    const signupConfirmPassword = document.getElementById('signupConfirmPassword');

    // Função para abrir um modal
    function openModal(modal) {
        modal.style.display = 'block';
    }

    // Função para fechar um modal
    function closeModal(modal) {
        modal.style.display = 'none';
    }

    // Eventos para abrir os modais
    loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(loginModal);
        loginEmail.value = ""
        loginPassword.value = ""
        loginEmail.focus();
    });

    signupButton.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(signupModal);
        closeModal(loginModal);
        signupEmail.value = ""
        signupPassword.value = ""
        signupConfirmPassword.value = ""
        signupEmail.focus();
        
    });

    // Eventos para fechar os modais
    closeLogin.addEventListener('click', () => {
        closeModal(loginModal);
    });

    closeSignup.addEventListener('click', () => {
        closeModal(signupModal);
    });

    // Fechar o modal se o usuário clicar fora do conteúdo
    window.addEventListener('click', (event) => {
        if (event.target === loginModal) {
            closeModal(loginModal);
        } else if (event.target === signupModal) {
            closeModal(signupModal);
        }
    });
});
