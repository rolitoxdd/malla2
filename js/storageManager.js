// Clase que guarda los datos de la malla en cache

class StorageManager {
    // guarda lista de sigla de ramos aprobados
    static saveApproved(approvedRamos, currentMalla) {
        let cacheName = "approvedRamos_" + currentMalla;
        let cacheToSave= [];
        approvedRamos.forEach(ramo => {
            cacheToSave.push(ramo.sigla)
        });
        localStorage[cacheName] = JSON.stringify(cacheToSave);
    }
    // retorna lista de siglas de ramos aprobados
    static loadApproved(currentMalla) {
        let cacheName = "approvedRamos_" + currentMalla;
        console.log(cacheName);
        console.log(localStorage[cacheName]);
        return JSON.parse(localStorage[cacheName])
    }

    static loadSemesters(currentMalla, text) {
        let cacheName = currentMalla + '_' + text;

    }
}