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

            left.append("p")
                .classed("my-0", true)
                .text(subject.name);
            let isOdd = Boolean(this.semester % 2)
            if (isOdd && subject.dictatesIn === "P")
                left.append("p").attr("id","dictatesIn-" + subject.sigla).style("line-height", 1).classed("my-0", true).append("small")
                    .classed("text-center my-0 text-danger", true)
                    .text("Esta asignatura normalmente solo se dicta en semestres pares");
            else if (!isOdd && subject.dictatesIn === "I")
                left.append("p").attr("id","dictatesIn-" + subject.sigla).style("line-height", 1).classed("my-0", true).append("small")
                    .classed("text-center text-danger", true)
                    .text("Esta asignatura normalmente solo se dicta en semestres Impares");

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
        if (subjectInfo) {
            subjectInfo.select("div").text(subject.name)
            let dictates = subjectInfo.select("#dictatesIn-" + subject.sigla)
            if (dictates)
                dictates.remove()

            let isOdd = Boolean(this.semester % 2)
            if (isOdd && subject.dictatesIn === "P")
                subjectInfo.select("div").append("p").attr("id","dictatesIn-" + subject.sigla).style("line-height", 1).classed("my-0", true).append("small")
                    .classed("text-center my-0 text-danger", true)
                    .text("Esta asignatura normalmente solo se dicta en semestres pares");
            else if (!isOdd && subject.dictatesIn === "I")
                subjectInfo.select("div").append("p").attr("id","dictatesIn-" + subject.sigla).style("line-height", 1).classed("my-0", true).append("small")
                    .classed("text-center text-danger", true)
                    .text("Esta asignatura normalmente solo se dicta en semestres impares");
        }
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
        // indica que hay que actualizar la tabla de asignaturas no oficiales
        if (this.mallaEditor)
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
            let subjectsNotFound = {}
            let firstSemester = cache[1]
            firstSemester.forEach(sigla => {
                if (this.malla.ALLSUBJECTS[sigla] !== undefined) {
                    this.malla.ALLSUBJECTS[sigla].selectRamo()
                } else {
                    if (subjectsNotFound[1] === undefined) {
                        subjectsNotFound[1] = []
                    }
                    subjectsNotFound[1].push(sigla)
                }
            })
            let i = 1
            for (i; i < Object.keys(cache).length; i++) {
                this.selectedPerSemester[i + 1] = []
                cache[i + 1].forEach(sigla => {
                    if (this.malla.ALLSUBJECTS[sigla] !== undefined)
                        this.selectedPerSemester[i+1].push(this.malla.ALLSUBJECTS[sigla])
                    else {
                        if (subjectsNotFound[i+1] === undefined)
                            subjectsNotFound[i+1] = []
                        subjectsNotFound[i+1].push(sigla)
                    }
                })
                this.nextSemester()
            }
            if (Object.keys(subjectsNotFound).length !== 0) {
                console.log(subjectsNotFound)
                let toast = $('.toast')
                toast.toast('show')
                let list = d3.select('#deletedSubjects').append('ul')
                Object.keys(subjectsNotFound).forEach(sem => {
                    let nestedList = list.append('li').text(`Semestre ${sem}`).append('ul')
                    subjectsNotFound[sem].forEach(subject => {
                        nestedList.append('li').text(subject)
                    })
                })
                d3.select('#deletedCard').classed('d-none', false)
            }

            this.saveEnabled = true
            if (needToDelete) {
                this.saveSemesters()
                delete localStorage["Custom-" + this.malla.currentMalla + "_SEMESTRES"]
            }
        }
    }
}