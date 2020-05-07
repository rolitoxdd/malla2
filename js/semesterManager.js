class SemesterManager {
    constructor(malla, card) {
        this.SELECTED = []
        this.selectedPerSemester = {}
        this.semester = 1;
        this.saveEnabled = false
        this.malla = malla
        this.card = d3.select(card)


        //
        this.semesterIndicator = this.card.select("#semester")
        this.card.select("#reset").on("click", () => this.cleanSemester())
        this.card.select("#resetc").on("click", () => this.cleanAll())
        this.card.select("#forward").on("click", () => this.nextSemester())
        this.backButton = this.card.select("#back").on("click", () => this.prevSemester())


        this.updateSemesterIndicator()
    }

    updateSemesterIndicator() {
        this.semesterIndicator.text(this.semester)
    }

    addSubject(subject) {
        this.SELECTED.push(subject)
        this.displaySubject(subject)
    }

    removeSubject(subject) {
        let _i = this.SELECTED.indexOf(subject);
        if (_i > -1) {
            this.SELECTED.splice(_i, 1);
        }
        this.unDisplaySubject(subject)
    }

    displaySubject(subject) {
        // Do something
    }

    unDisplaySubject(subject) {
        // Do something
    }

    nextSemester() {
        this.selectedPerSemester[this.semester] = [...this.SELECTED]
        console.log(this.selectedPerSemester[this.semester])
        this.saveSemesters()
        this.cleanSemester()
        this.semester++
        if (this.semester === 2)
            this.backButton.classed("disabled", false)
        this.updateSemesterIndicator()
        if (this.selectedPerSemester[this.semester]) {
            this.selectedPerSemester[this.semester].forEach(subject => {
                subject.selectRamo()
            });
        }
    }

    prevSemester() {
        if (this.SELECTED.length === 0 && this.semester >= Object.values(this.selectedPerSemester).length)
            delete this.selectedPerSemester[this.semester]
        else
            this.selectedPerSemester[this.semester] = [...this.SELECTED]
        this.saveSemesters()
        this.cleanSemester()
        if (this.semester === 2) {
            this.semester--
            this.backButton.classed("disabled", true)
        }
            this.updateSemesterIndicator()
        this.selectedPerSemester[this.semester].forEach(subject => {
            subject.selectRamo()
        })
    }

    cleanSemester() {
        let semesterToClean = [...this.SELECTED]
        semesterToClean.forEach(subject => {
            subject.selectRamo()
            this.cleanSelectedSubject(subject)
        })
    }

    cleanAll () {
        this.cleanSemester()
        this.semester = 1
        this.selectedPerSemester = {}
    }

    cleanSelectedSubject(subject) {
        // Do something (Limpiar ramo de la pagina)
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