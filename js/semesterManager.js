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

    updateSemesterIndicator() {
        this.semesterIndicator.text(this.semester)
    }

    addSubject(subject) {
        if (this.SELECTED.length === 0)
            this.noSubjectsText.classed("d-none", true)

        this.SELECTED.push(subject)
        this.displaySubject(subject)
    }

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

    displaySubject(subject) {
        // Do something
        // this.displayedSubjects[subject.sigla] =
    }

    unDisplaySubject(subject) {
        // Do something
    }

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

    deApprovePrevSemester() {
        this.selectedPerSemester[this.semester - 1].forEach(subject => {
            if (subject.approved)
                subject.approveRamo()
        })
    }

    cleanSemester() {
        let semesterToClean = [...this.SELECTED]
        semesterToClean.forEach(subject => {
            subject.selectRamo()
        })
    }

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