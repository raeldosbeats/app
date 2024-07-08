document.addEventListener('DOMContentLoaded', () => {
    // Inicializar modais de autenticação
    initializeAuthModals();

    // Configurar logout
    setupLogout();
});

function initializeAuthModals() {
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const closeLogin = document.getElementById('closeLogin');
    const closeSignup = document.getElementById('closeSignup');


    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'block';
    });

    signupBtn.addEventListener('click', () => {
        signupModal.style.display = 'block';
    });

    closeLogin.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });

    closeSignup.addEventListener('click', () => {
        signupModal.style.display = 'none';
    });

    // Login
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
            if (userDoc.exists && userDoc.data().isAdmin) {
                window.location.href = './pages/admin.html'; // Redireciona para a página do administrador
            } else {
                showNotification('success', 'Login realizado com sucesso!')

                document.getElementById('loginModal').style.display = 'none';
                document.getElementById('logout-btn').style.display = 'block';
                document.getElementById('login-btn').style.display = 'none';
            }
        } catch (error) {
            alert('Erro ao fazer login: ' + error.message);
        }
    });

    // Cadastro
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        try {
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            await firebase.firestore().collection('users').doc(user.uid).set({
                email: email,
                isAdmin: false // Todos os novos usuários não são administradores por padrão
            });
            showNotification('success', 'Cadastro realizado com sucesso!')

            signupModal.style.display = 'none';
        } catch (error) {
            alert('Erro ao cadastrar: ' + error.message);
        }
    });
}

function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
        firebase.auth().signOut().then(() => {
            showNotification('success', 'Logout realizado com sucesso!')
            logoutBtn.style.display = 'none';
            document.getElementById('login-btn').style.display = 'block';
        }).catch((error) => {
            alert('Erro ao fazer logout: ' + error.message);
        });
    });

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            firebase.firestore().collection('users').doc(user.uid).get().then((doc) => {
                if (doc.exists) {
                    document.getElementById('logout-btn').style.display = 'block';
                    document.getElementById('login-btn').style.display = 'none';
                }
            });
        } else {
            document.getElementById('logout-btn').style.display = 'none';
            document.getElementById('login-btn').style.display = 'block';
        }
    });
}
