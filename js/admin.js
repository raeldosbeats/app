const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

auth.onAuthStateChanged((user) => {
    if (user) {
        checkAdmin(user);
        document.getElementById('containerAdm').style.display = 'flex'
    } else {       
        window.location.href = '../index.html';
        // alert('Acesso negado. Você não está autenticado.');
    }
});

function setupLogout() {
    const logoutBtn = document.getElementById('admLogout');
    logoutBtn.addEventListener('click', () => {
        firebase.auth().signOut().then(() => {
            showNotification('success', 'Logout realizado com sucesso!')
        }).catch((error) => {
            alert('Erro ao fazer logout: ' + error.message);
        });
    });    
}


async function checkAdmin(user) {
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists && userDoc.data().isAdmin) {
            loadUsers();
        } else {  
            window.location.href = '../index.html';
            // alert('Acesso negado. Você não é um administrador.');
        }
    } catch (error) {       
        console.error('Erro ao verificar administrador:', error);
        window.location.href = '../index.html';
    }
}

async function loadUsers() {
    const userList = document.getElementById('user-list');
    userList.innerHTML = ''; // Limpa a lista antes de carregá-la
    try {
        const usersSnapshot = await db.collection('users').get();
        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            const userItem = document.createElement('div');
            userItem.innerHTML = `<div class="adminEmail">${userData.email}</div>`;
            const toggleAdminButton = document.createElement('button');
            toggleAdminButton.textContent = userData.isAdmin ? 'Remover Adm' : 'Tornar Adm';
            toggleAdminButton.addEventListener('click', () => toggleAdmin(doc.id, !userData.isAdmin));
            userItem.appendChild(toggleAdminButton);
            userList.appendChild(userItem);
        });
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
}

async function toggleAdmin(userId, isAdmin) {
    try {
        await db.collection('users').doc(userId).update({ isAdmin });
        showNotification('success', 'Nível de acesso atualizado com sucesso!')
        
        window.location.reload();
    } catch (error) {
        console.error('Erro ao atualizar papel:', error);
    }
}

// Subir beats
document.addEventListener('DOMContentLoaded', () => {
    setupLogout();

    const beatForm = document.getElementById('beatForm');
    beatForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const beatTitle = document.getElementById('beatTitle').value;
        const beatMaker = document.getElementById('beatMaker').value;
        const beatImage = document.getElementById('beatImage').files[0];
        const beatFile = document.getElementById('beatFile').files[0];
        const beatGenre = document.getElementById('beatGenre').value;
        const beatPrice = document.getElementById('beatPrice').value;
        const beatPriceNoPromo = document.getElementById('beatPriceNoPromo').value;

        try {
            // Upload da imagem
            const imageRef = storage.ref(`images/${beatImage.name}`);
            await imageRef.put(beatImage);
            const imageUrl = await imageRef.getDownloadURL();

            // Upload do arquivo MP3
            const fileRef = storage.ref(`audio/${beatFile.name}`);
            await fileRef.put(beatFile);
            const fileUrl = await fileRef.getDownloadURL();

            // Salvar dados no Firestore
            const beatData = {
                title: beatTitle,
                beatmaker: beatMaker,
                imageUrl: imageUrl,
                fileUrl: fileUrl,
                genre: beatGenre,
                price: beatPrice,
                priceNoProme: beatPriceNoPromo,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                likes: 0
            };
            await firebase.firestore().collection('beats').add(beatData);
            showNotification('success', 'Beat registrado com sucesso!')
            beatForm.reset();
        } catch (error) {
            console.error('Erro ao registrar beat:', error);
            showNotification('error', 'Erro ao registrar beat. Verifique o console para mais detalhes.')
        }
    });
});
