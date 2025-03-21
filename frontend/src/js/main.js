// Initialiser la date minimale au jour suivant
function initDateInput() {
    const dateInput = document.getElementById('unlockDate');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0];
    dateInput.min = formattedDate;
    dateInput.value = formattedDate;
}

// Changer le type de capsule (privée/publique)
function setupTabSwitching() {
    const typeTabs = document.querySelectorAll('.tabs .tab[data-type]');
    const capsuleTypeInput = document.getElementById('capsuleType');
    
    typeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Mettre à jour les classes actives
            typeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Mettre à jour l'input caché
            capsuleTypeInput.value = tab.dataset.type;
        });
    });
    
    const viewTabs = document.querySelectorAll('.tabs .tab[data-view]');
    viewTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            viewTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadCapsules(tab.dataset.view);
        });
    });
}

// Gérer la soumission du formulaire
function setupFormSubmission() {
    const form = document.getElementById('capsuleForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const messageContent = document.getElementById('messageContent').value;
        const unlockDate = document.getElementById('unlockDate').value;
        const capsuleType = document.getElementById('capsuleType').value;
        
        if (!messageContent || !unlockDate) {
            alert('Veuillez remplir tous les champs');
            return;
        }
        
        try {
            await createCapsule({
                content: messageContent,
                unlockDate: unlockDate,
                type: capsuleType
            });
            
            // Réinitialiser le formulaire
            form.reset();
            initDateInput();
            
            // Recharger les capsules
            loadCapsules('waiting');
            
            alert('Votre capsule temporelle a été créée avec succès!');
        } catch (error) {
            console.error('Erreur lors de la création de la capsule:', error);
            alert('Une erreur est survenue lors de la création de votre capsule');
        }
    });
}

// Charger et afficher les capsules
async function loadCapsules(status = 'waiting') {
    const capsulesList = document.getElementById('capsulesList');
    capsulesList.innerHTML = '<div class="loading">Chargement...</div>';
    
    try {
        const capsules = await getCapsules(status);
        
        if (capsules.length === 0) {
            capsulesList.innerHTML = `
                <div class="empty-state">
                    <p>Aucune capsule ${status === 'waiting' ? 'en attente' : 'débloquée'} pour le moment</p>
                </div>
            `;
            return;
        }
        
        capsulesList.innerHTML = '';
        
        capsules.forEach(capsule => {
            const capsuleEl = document.createElement('div');
            capsuleEl.className = 'capsule-item';
            
            // Formatter la date avec vérification
            let formattedDate;
            try {
                const unlockDate = new Date(capsule.unlockDate);
                if (isNaN(unlockDate.getTime())) {
                    console.error("Date invalide:", capsule.unlockDate);
                    formattedDate = "Date à déterminer";
                } else {
                    formattedDate = unlockDate.toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });
                }
            } catch(e) {
                console.error("Erreur format date:", e);
                formattedDate = "Date à déterminer";
            }
            
            capsuleEl.innerHTML = `
                <div class="capsule-header">
                    <span>${capsule.type === 'private' ? 'Privée' : 'Publique'}</span>
                    <span class="capsule-status status-${status}">
                        ${status === 'waiting' ? 'En attente' : 'Débloquée'}
                    </span>
                </div>
                <div class="capsule-date">Se débloque le ${formattedDate}</div>
                <div class="capsule-preview">
                    ${status === 'waiting' ? '(Contenu caché jusqu\'au déblocage)' : capsule.content.substring(0, 50) + '...'}
                </div>
            `;
            
            if (status === 'unlocked') {
                capsuleEl.addEventListener('click', () => {
                    showCapsuleContent(capsule);
                });
                capsuleEl.style.cursor = 'pointer';
            }
            
            capsulesList.appendChild(capsuleEl);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des capsules:', error);
        capsulesList.innerHTML = `
            <div class="error-state">
                <p>Une erreur est survenue lors du chargement des capsules</p>
            </div>
        `;
    }
}

// Afficher le contenu d'une capsule débloquée
function showCapsuleContent(capsule) {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');
    
    modalContent.textContent = capsule.content;
    modal.style.display = 'block';
    
    // Fermer le modal en cliquant sur X
    const closeBtn = document.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Fermer en cliquant en dehors du modal
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    initDateInput();
    setupTabSwitching();
    setupFormSubmission();
    loadCapsules('waiting');
});