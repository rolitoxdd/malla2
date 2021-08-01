class SemesterManager {
    constructor(malla, card, mallaEditor = false) {
        // Propiedades
        this.selectedPerSemester = {1: []}
        this.semester = 1;
        this.saveEnabled = false
        this.subjectsInManySemesters = false
        this.malla = malla
        this.card = d3.select(card)
        this.displayedSubjects = {}
        this.saveEnabled = true

        if (mallaEditor)
            this.mallaEditor = mallaEditor
        else
            this.mallaEditor = null


        // se vincula la interfaz con metodos
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
        console.log(this.selectedPerSemester[this.semester])
        let undefinedSemester = this.selectedPerSemester[this.semester] === undefined
        if (!undefinedSemester) {
            let semesterEmpty = this.selectedPerSemester[this.semester].length === 0
            if (semesterEmpty) {
                this.noSubjectsText.classed("d-none", true)
                this.selectedPerSemester[this.semester] = []
            }
        } else {
            this.noSubjectsText.classed("d-none", true)
            this.selectedPerSemester[this.semester] = []
        }

        this.selectedPerSemester[this.semester].push(subject)
        this.displaySubject(subject)
    }

    // elimina la asignatura del semestre
    removeSubject(subject) {
        let _i = this.selectedPerSemester[this.semester].indexOf(subject);
        if (_i > -1) {
            this.selectedPerSemester[this.semester].splice(_i, 1);
        }
        this.unDisplaySubject(subject)
        if (this.selectedPerSemester[this.semester].length === 0) {
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
        let backup = [...this.selectedPerSemester[this.semester]]
        this.saveSemesters()
        this.saveEnabled = false
        this.cleanSemester()
        this.selectedPerSemester[this.semester] = backup
        this.selectedPerSemester[this.semester].forEach(subject => subject.approveRamo())
        this.semester++
        if (this.semester === 2) {
            this.backButton.classed("disabled", false)
            this.backButton.attr("disabled", null)
        }
        this.updateSemesterIndicator()
        if (this.selectedPerSemester[this.semester] !== undefined) {
            backup = [...this.selectedPerSemester[this.semester]]
            backup.forEach(subject => {
                subject.selectRamo()
            });
            this.selectedPerSemester[this.semester] = backup
        }
        this.saveEnabled = true
        this.malla.verifyPrer()

    }

    // se pasa al semestre anterior
    prevSemester() {
        let backup = this.selectedPerSemester[this.semester]
        if ((backup === undefined|| backup === []) && this.semester >= Object.values(this.selectedPerSemester).length)
            delete this.selectedPerSemester[this.semester]
        else
            backup = [...this.selectedPerSemester[this.semester]]
        this.saveSemesters()
        this.saveEnabled = false
        this.cleanSemester()
        if ((backup !== undefined && backup !== []))
            this.selectedPerSemester[this.semester] = backup
        this.deApprovePrevSemester()
            this.semester--
        if (this.semester === 1) {
            this.backButton.classed("disabled", true)
            this.backButton.attr("disabled", "disabled")
        }
            this.updateSemesterIndicator()
        backup = [... this.selectedPerSemester[this.semester]]
        backup.forEach(subject => {
            subject.selectRamo()
        })
        this.selectedPerSemester[this.semester] = backup
        this.saveEnabled = true
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
        if (this.selectedPerSemester[this.semester] !== undefined) {
            let semesterToClean = [...this.selectedPerSemester[this.semester]]
            semesterToClean.forEach(subject => {
                subject.selectRamo()
            })
        }

    }

    // se "reinicia" eliminando todo dato guardado
    cleanAll () {
        this.saveEnabled = false
        this.cleanSemester()
        this.semester = 1
        this.updateSemesterIndicator()
        this.selectedPerSemester = {}
        this.backButton.classed("disabled", true)
        this.backButton.attr("disabled", "disabled")
        this.malla.cleanSubjects()
        this.saveEnabled = true
        this.saveSemesters()

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