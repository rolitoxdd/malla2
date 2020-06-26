class CustomMalla extends Malla {
    constructor(sct = false, ramoType = Ramo, scaleX = 1, scaleY = 1) {
        super(sct, ramoType, scaleX, scaleY);
        this.customSectors = undefined
        this.customSubjects = undefined
        this.customMalla = undefined
    }

    setCareer(carr, relaPath) {
        let customSectors = localStorage["generatorUserCategory" + carr]
        let customSubjects = localStorage["generatorUserSubjects" + carr]
        let customMalla = localStorage["generatorUserData" + carr]
        if (customSubjects !== undefined)
            this.customSubjects = JSON.parse(customSubjects)
        if (customSectors !== undefined)
            this.customSectors = JSON.parse(customSectors)
        if (customMalla !== undefined)
            this.customMalla = JSON.parse(customMalla)

        return super.setCareer(carr, relaPath);
    }

    setMallaAndSectors(malla, sectors) {
        if (this.customMalla === undefined) {
            super.setMallaAndSectors(malla,sectors)
            return
        }
        let longest_semester = 0;
        let totalCredits = 0;
        let totalRamos = 0;

        let subjectsList = new Set()
        let categoriesToUse = new Set()
        Object.values(this.customMalla).forEach(list => {
            subjectsList = new Set([...subjectsList, ...list])
            if (list.length > longest_semester)
                totalRamos += list.length
                longest_semester = list.length

        })
        this.longestSemester = longest_semester;
        this.totalRamos = totalRamos

        Object.keys(this.customMalla).forEach(semester => {
            this.malla[semester] = {};
            this.customMalla[semester].forEach(sigla => {

                // Buscar ramo en ramos oficiales
                Object.keys(malla).forEach(semester2 => {
                    let i = 0
                    for (i; i < malla[semester2].length; i++) {
                        if (malla[semester2][i][1] === sigla && this.customSubjects[sigla] === undefined) {
                            let subject = malla[semester2][i]
                            if (subject.length === 7) {
                                // Nuevo formato con ramos SCT
                                let prer = [...subject[5]]
                                categoriesToUse.add(subject[4])
                                prer.forEach(prer => {
                                    if (!subjectsList.has(prer))
                                        subject[5].splice(subject[5].indexOf(prer),1)
                                })
                                this.malla[semester][sigla] = new this.ramoType(subject[0], subject[1], subject[2], subject[4], subject[5],this.RAMOID++, this, subject[3])
                            } else {
                                categoriesToUse.add(subject[3])
                                this.malla[semester][sigla] = new this.ramoType(subject[0], subject[1], subject[2], subject[3], (function hasPrer() {
                                    if (subject.length > 4) {
                                        let prer = [...subject[4]]
                                        prer.forEach(prer => {
                                            if (!subjectsList.has(prer))
                                                subject[4].splice(subject[4].indexOf(prer),1)
                                        })
                                        return subject[4];
                                    }
                                    return [];
                                })(), this.RAMOID++, this);
                                // Formato antiguo
                            }
                        }
                    }
                })
                if (this.customSubjects){
                    if (this.customSubjects[sigla] !== undefined) {
                        let data = this.customSubjects[sigla]
                        categoriesToUse.add(data[2])
                        let prer = [...data[3]]
                        prer.forEach(prer => {
                            if (!subjectsList.has(prer))
                                data[3] = data[3].slice(data[3].indexOf(prer), 1)
                        })
                        this.malla[semester][sigla] = new this.ramoType(data[0], sigla, data[1], data[2], data[3],
                            this.RAMOID++, this, data[4], true)
                    }
                    totalCredits += this.malla[semester][sigla].getDisplayCredits()
                    this.addSubject(this.malla[semester][sigla])
                }
            })
        })
        this.totalCredits = totalCredits
        this.sectors = {}
        let categories
        if (this.customSectors)
            categories = this.customSectors
        else
            categories = sectors

        categoriesToUse = [...categoriesToUse]
        categoriesToUse.forEach(category => {
            this.sectors[category] = categories[category]
        })

        this.isMallaSet = true;

    }
}