class SemesterManager {
    constructor(malla, card, mallaEditor = false) {
        this.SELECTED = []
        this.selectedPerSemester = {}
        this.semester = 1;
        this.saveEnabled = false
        this.subjectsInManySemesters = false
        this.malla = malla
        this.card = d3.select(card)
        this.displayedSubjects = {}
        if (mallaEditor)
            this.mallaEditor = mallaEditor
        else
            this.mallaEditor = null


        //
        this.semesterIndicator = this.card.select("#semester")
        this.card.select("#reset").on("click", () => this.cleanSemester())
        this.card.select("#resetc").on("click", () => this.cleanAll())
        this.card.select("#forward").on("click", () => this.nextSemester())
        this.backButton = this.card.select("#back").on("click", () => this.prevSemester())
        this.noSubjectsText = this.card.select(".no-subjects")


        this.updateSemesterIndicator()
    }

    // actualiza el indicador de semestre de la página
    updateSemesterIndicator() {
        this.semesterIndicator.text(this.semester)
    }

    // agrega la asignatura al semestre
    addSubject(subject) {
        if (this.SELECTED.length === 0)
            this.noSubjectsText.classed("d-none", true)

        this.SELECTED.push(subject)
        this.displaySubject(subject)
    }

    // elimina la asignatura del semestre
    removeSubject(subject) {
        let _i = this.SELECTED.indexOf(subject);
        if (_i > -1) {
            this.SELECTED.splice(_i, 1);
        }
        this.unDisplaySubject(subject)
        if (this.SELECTED.length === 0) {
            this.noSubjectsText.classed("d-none", false)
        }
    }

    // elimina la asignatura de semestres guardados, sin contar el semestre actual
    removeSubjectOutsideSemester(subject) {
        Object.keys(this.selectedPerSemester).forEach(semester => {
            if (semester !== this.semester) {
                let found = this.selectedPerSemester[semester].indexOf(subject)
                if (found !== -1){
                    this.selectedPerSemester[semester].splice(found,1)
                    if (semester < this.semester)
                        subject.approveRamo()
                }
            }
        })
    }

    // muestra la asignatura en el manager
    displaySubject(subject) {
        // Do something
        // this.displayedSubjects[subject.sigla] =
    }

    // actualiza la asignatura en el manager en caso de haberse editado
    updateDisplayedSubject(subject) {}

    // elimina la asignatura del manager
    unDisplaySubject(subject) {
        // Do something
    }

    // se pasa al siguiente semestre
    nextSemester() {
        this.selectedPerSemester[this.semester] = [...this.SELECTED]
        this.saveSemesters()
        this.cleanSemester()
        this.selectedPerSemester[this.semester].forEach(subject => subject.approveRamo())
        this.semester++
        if (this.semester === 2)
            this.backButton.classed("disabled", false)
        this.updateSemesterIndicator()
        if (this.selectedPerSemester[this.semester]) {
            this.selectedPerSemester[this.semester].forEach(subject => {
                subject.selectRamo()
            });
        }
        this.malla.verifyPrer()

    }

    // se pasa al semestre anterior
    prevSemester() {
        if (this.SELECTED.length === 0 && this.semester >= Object.values(this.selectedPerSemester).length)
            delete this.selectedPerSemester[this.semester]
        else
            this.selectedPerSemester[this.semester] = [...this.SELECTED]
        this.cleanSemester()
        this.saveSemesters()
        this.deApprovePrevSemester()
            this.semester--
        if (this.semester === 1) {
            this.backButton.classed("disabled", true)
        }
            this.updateSemesterIndicator()
        this.selectedPerSemester[this.semester].forEach(subject => {
            subject.selectRamo()
        })
        this.malla.verifyPrer()
    }

    // se desaprueban las asinaturas del semestre anterior para hacer posible su selección
    deApprovePrevSemester() {
        this.selectedPerSemester[this.semester - 1].forEach(subject => {
            if (subject.approved)
                subject.approveRamo()
        })
    }

    // se quitan todas las asignaturas del semestre
    cleanSemester() {
        let semesterToClean = [...this.SELECTED]
        semesterToClean.forEach(subject => {
            subject.selectRamo()
        })
    }

    // se "reinicia" eliminando todo dato guardado
    cleanAll () {
        this.cleanSemester(0)
        this.semester = 1
        this.selectedPerSemester = {}
    }


    loadSemesters() {
        console.log("Fake Loading...")
        // load all semesters from cache
    }

    saveSemesters() {
        if (this.saveEnabled) {
            // Save all semesters
            console.log("Fake Saving...")
        }
    }
}