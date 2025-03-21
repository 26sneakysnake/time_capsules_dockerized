// Points d'entrée des API
const API_URL = {
    private: 'http://localhost:3000/api/private-capsules',
    public: 'http://localhost:3001/api/public-capsules'
};

// Créer une nouvelle capsule temporelle
async function createCapsule(capsuleData) {
    const url = API_URL[capsuleData.type];
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: capsuleData.content,
                unlockDate: capsuleData.unlockDate
            })
        });
        
        if (!response.ok) {
            throw new Error(`Erreur lors de la création: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erreur API createCapsule:', error);
        throw error;
    }
}

// Récupérer les capsules (en attente ou débloquées)
async function getCapsules(status = 'waiting') {
    try {
        const privateResponse = await fetch(`${API_URL.private}?status=${status}`);
        const publicResponse = await fetch(`${API_URL.public}?status=${status}`);
        
        if (!privateResponse.ok || !publicResponse.ok) {
            throw new Error('Erreur lors de la récupération des capsules');
        }
        
        const privateCapsules = await privateResponse.json();
        const publicCapsules = await publicResponse.json();
        
        // Ajouter le type à chaque capsule
        privateCapsules.forEach(c => c.type = 'private');
        publicCapsules.forEach(c => c.type = 'public');
        
        return [...privateCapsules, ...publicCapsules];
    } catch (error) {
        console.error('Erreur API getCapsules:', error);
        return []; // Retourner un tableau vide en cas d'erreur
    }
}