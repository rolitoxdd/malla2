class Generator extends SemesterManager {
    constructor(malla, card) {
        super(malla, card);
        this.mallaEditor = new MallaEditor(this, "#unoficialSubjects", "#sectors")
    }

    displaySubject(subject) {
        if (subject.approved) {
            subject.showWarning()
        } else {
            let subjectInfo = this.card.select(".subjects").append('li');
            subjectInfo.attr('id','per-' + subject.sigla)
                .classed('list-group-item', true)
                .classed('d-flex', true)
                .classed('align-items-center', true)
                .classed('py-0', true)
                .classed('pr-0', true)
                .style('opacity','0.01')
                .transition().duration(300).style('opacity','1');
            let left = subjectInfo.append('div');
            left.classed('flex-grow-1', true)
                .classed('mr-3', true)
                .classed('py-2', true)
                .text(subject.name);
            let right = subjectInfo.append("button")
            right.classed("btn btn-secondary", true)
                .attr("type", "button")
                .text("Editar");
            right.on("click", this.mallaEditor.setUpModal.bind(this.mallaEditor, true, subject))
            // let rigth = card.append('button');
            // rigth.classed('btn', true)
            //     .classed('btn-warning', true)
            //     // .classed('text-white', true)
            //     .classed('align-self-stretch', true)
            //     .attr('type','button')
            //     .attr('onclick','editRamo("' + self.sigla + '")')
            //     .text('Editar');
            this.displayedSubjects[subject.sigla] = subjectInfo
            this.mallaEditor.updateState(subject)
            this.saveSemesters()
        }

    }

    updateDisplayedSubject(subject) {
        super.updateDisplayedSubject(subject)
        let subjectInfo = this.displayedSubjects[subject.sigla]
        if (subjectInfo)
            subjectInfo.select("div").text(subject.name)
    }

    unDisplaySubject(subject) {
        this.displayedSubjects[subject.sigla]
            .transition().duration(300).style("opacity", "0.001").remove();
        delete this.displayedSubjects[subject.sigla]
        this.saveSemesters()

    }

    nextSemester() {
        super.nextSemester();
        if (this.mallaEditor)
            // indica que hay que actualizar la tabla de asignaturas no oficiales
            this.mallaEditor.semesterChange()
    }

    prevSemester() {
        super.prevSemester();
        if (this.mallaEditor)
            // indica que hay que actualizar la tabla de asignaturas no oficiales
            this.mallaEditor.semesterChange()
    }
    cleanAll() {
        super.cleanAll();
        delete localStorage["generatorUserData" + this.malla.currentMalla]
    }

    saveSemesters() {
        if (this.saveEnabled) {

            let cache = {}
            Object.keys(this.selectedPerSemester).forEach(semester => {
                let list = []
                this.selectedPerSemester[semester].forEach(subject => {
                    list.push(subject.sigla)
                })
                cache[semester] = list
            })
            cache = JSON.stringify(cache)
            localStorage["generatorUserData" + this.malla.currentMalla] = cache
        }
    }

    loadSemesters() {
        let needToDelete = false
        let cache = localStorage["generatorUserData" + this.malla.currentMalla]
        if (!cache) {
            cache = localStorage["Custom-" + this.malla.currentMalla + "_SEMESTRES"]
            if (!cache)
                return
            localStorage["generatorUserData" + this.malla.currentMalla] = cache
        }
        if (cache) {
            cache = JSON.parse(cache)
            this.saveEnabled = false
            let firstSemester = cache[1]
            firstSemester.forEach(sigla => {
                this.malla.ALLRAMOS[sigla].selectRamo()
            })
            let i = 1
            for (i; i < Object.keys(cache).length; i++) {
                this.selectedPerSemester[i + 1] = []
                cache[i + 1].forEach(sigla => {
                    this.selectedPerSemester[i + 1].push(this.malla.ALLRAMOS[sigla])
                })
                this.nextSemester()
            }
            this.saveEnabled = true
            if (needToDelete) {
                this.saveSemesters()
                delete localStorage["Custom-" + this.malla.currentMalla + "_SEMESTRES"]
            }
        }
    }
}