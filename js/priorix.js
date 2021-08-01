class Priorix extends SemesterManager {
    constructor(malla, card) {
        super(malla, card);
        this.faes = {
            1: 1
        }

        // {USM : {1 : numero, 2: otroNumero, ...}}, SCT : {...}}
        this.prevSemesterSums = {
            'USM': {},
            'SCT': {}
        }
        this.currentSemesterSum = {
            'USM': 0,
            'SCT': 0
        }
        this.totalCredits = {
            'USM': 0,
            'SCT': 0
        }

        // {USM : {1 : numero, 2: otroNumero, ...}}, SCT : {...}}
        this.totalApprovedCredits = {
            'USM': {},
            'SCT': {}
        }

        // {1 : {siglaRamo: nota, ...}, ...}
        this.subjectGrades= {}

        this.card.select(".fae").on('input', () => this.calculate())
        this.calculationsEnabled = true

        this.mallaEditor = new MallaEditor(this, "#unoficialSubjects")

    }

    // overwritten

    addSubject(subject) {
        super.addSubject(subject);
        this.totalCredits['USM'] = this.totalCredits['USM'] + subject.getUSMCredits()
        this.totalCredits['SCT'] = this.totalCredits['SCT'] + subject.getSCTCredits()
        this.calculate()

    }

    removeSubject(subject) {
        super.removeSubject(subject);
        this.totalCredits['USM'] = this.totalCredits['USM'] - subject.getUSMCredits()
        this.totalCredits['SCT'] = this.totalCredits['SCT'] - subject.getSCTCredits()
        this.calculate()


    }

    // elimina todo rastro del ramo a elimnar y vuelve a calclular la prioridad
    removeSubjectOutsideSemester(subject) {
        Object.keys(this.selectedPerSemester).forEach(semester => {
            if (semester !== this.semester) {
                let found = this.selectedPerSemester[semester].indexOf(subject)
                if (found !== -1){
                    this.selectedPerSemester[semester].splice(found,1)
                    if (semester < this.semester) {
                        subject.approveRamo()
                        this.totalCredits["USM"] -= subject.getUSMCredits()
                        this.totalCredits["SCT"] -= subject.getSCTCredits()

                        let grade = this.subjectGrades[semester][subject.sigla]
                        let scoreToDeleteUSM = grade * subject.getUSMCredits()
                        let scoreToDeleteSCT = grade * subject.getSCTCredits()
                        delete this.subjectGrades[semester][subject.sigla]
                        for (semester; semester < this.semester; semester++) {
                            if (grade > 54) {
                                this.totalApprovedCredits["USM"][semester] -= subject.getUSMCredits()
                                this.totalApprovedCredits["SCT"][semester] -= subject.getSCTCredits()
                            }
                            this.prevSemesterSums["USM"][semester] -= scoreToDeleteUSM
                            this.prevSemesterSums["SCT"][semester] -= scoreToDeleteSCT
                        }
                    }
                }
            }
        })
        //console.log(this.totalApprovedCredits, this.totalCredits, this.prevSemesterSums, this.currentSemesterSum, this.subjectGrades)
    }

    displaySubject(subject) {
        let i = this.malla.APPROVED.indexOf(subject);
        if (i !== -1) {
            // do something
            return
        }

        let subjectInfo = this.card.select(".subjects").append('div')
        subjectInfo.attr('id', "p-" + subject.sigla);
        subjectInfo.attr('class', 'form-group mb-2');
        subjectInfo.attr('style', 'opacity:0.001');
        subjectInfo.append('label')
            .attr('class', 'text-left mb-0')
            .attr('for', 'nota-' + subject.sigla)
            .text(subject.name);
        let isOdd = Boolean(this.semester % 2)

        subjectInfo.append("small")
            .classed("form-text bg-light rounded text-center mt-0 d-block mb-1 text-danger infmessage", true)
        if (isOdd && subject.dictatesIn === "P")
            subjectInfo.select(".infmessage")
                .classed("d-block", false)
                .text("Esta asignatura normalmente solo se dicta en semestres pares");
    else if (!isOdd && subject.dictatesIn === "I")
            subjectInfo.select("infmessage")
                .classed("d-block", false)
                .text("Esta asignatura normalmente solo se dicta en semestres Impares");
        let subjectGrade = subjectInfo.append('div');
        subjectGrade.attr('class','input-group');
        subjectGrade.append('div')
            .attr('class','input-group-prepend')
            .append('span')
            .attr('class','input-group-text')
            .text('Nota');
        let gradeInput = subjectGrade.append('input')
            .attr('class', 'form-control')
            .attr('id', 'nota-' + subject.sigla)
            .attr('name', 'nota-' + subject.sigla)
            .attr('type', 'number')
            .attr('inputmode', 'numeric')
            .attr('autocomplete', 'off')
            .attr('min','0')
            .attr('max','100')
            .attr('placeholder', '0')
            .on('input', () => {
                this.calculate()
            })
        subjectGrade.append('div')
            .attr('class','input-group-append')
            .append('span')
            .attr('class','input-group-text')
            .text('x ' + subject.getUSMCredits() + ' USM | ' + subject.getSCTCredits() + ' SCT');




        subjectInfo.transition().duration(300).style("opacity", "1");

        this.displayedSubjects[subject.sigla] = [subjectInfo, gradeInput]
        this.calculate()
    }

    unDisplaySubject(subject) {
       this.displayedSubjects[subject.sigla][1]
            .on('input', null);
        this.displayedSubjects[subject.sigla][0]
            .transition().duration(300).style("opacity", "0.001").remove();
        delete this.displayedSubjects[subject.sigla]
    }

    nextSemester() {
        this.calculationsEnabled = false
        let subjectsToUpdate = []
        let backup = [...this.selectedPerSemester[this.semester]]
        this.prevSemesterSums["USM"][this.semester] = this.currentSemesterSum["USM"]
        this.prevSemesterSums["SCT"][this.semester] = this.currentSemesterSum["SCT"]
        backup.forEach(subject => {
                this.totalCredits["USM"] += subject.getUSMCredits()
                this.totalCredits["SCT"] += subject.getSCTCredits()
            if (this.displayedSubjects[subject.sigla][1].property("value") > 54) {
                subject.selectRamo()
                subject.approveRamo()
            } else if (!this.selectedPerSemester[this.semester+1]) {
                this.displayedSubjects[subject.sigla][1].property("value", "")
                this.displayedSubjects[subject.sigla][0].select(".infmessage")
                    .classed("d-block", false)
                    .text("Asignatura reprobada el semestre anterior")
                subject.showWarning("yellow")
            } else {
                subject.selectRamo()
            }
            subjectsToUpdate.push(subject)
        })
        let subjectaNotAprroved = this.selectedPerSemester[this.semester]
        this.selectedPerSemester[this.semester] = backup
        this.semester++
        if (this.semester === 2) {
            this.backButton.classed("disabled", false)
            this.backButton.attr("disabled", null)
        }
            this.updateSemesterIndicator()
        if (this.selectedPerSemester[this.semester]) {
            backup = [...this.selectedPerSemester[this.semester]]
            backup.forEach(subject => {
                subject.selectRamo()
                this.displayedSubjects[subject.sigla][1].property("value", this.subjectGrades[this.semester][subject.sigla])
                subjectsToUpdate.push(subject)
            });
            this.selectedPerSemester[this.semester] = backup
        } else {
            this.selectedPerSemester[this.semester] = subjectaNotAprroved
        }
        this.calculationsEnabled = true
        this.calculate()
        this.malla.verifyPrer()
        subjectsToUpdate.forEach(subject => this.mallaEditor.updateState(subject))

        //super.nextSemester();
    }

    prevSemester() {
        this.calculationsEnabled = false
        let subjectsToUpdate = []
        let backup = this.selectedPerSemester[this.semester]
        if ((backup === undefined|| backup === []) && this.semester >= Object.values(this.selectedPerSemester).length)
            delete this.selectedPerSemester[this.semester]
        else
            backup = [...this.selectedPerSemester[this.semester]]

        this.deApprovePrevSemester()
        let prevSelected = [...this.selectedPerSemester[this.semester - 1]]
        backup.forEach(subject => {
            if (prevSelected.indexOf(subject) === -1) {
                subject.selectRamo()
            } else {
                this.totalCredits["USM"] -= subject.getUSMCredits()
                this.totalCredits["SCT"] -= subject.getSCTCredits()
            }
            subjectsToUpdate.push(subject)
        })
        if ((backup !== []))
            this.selectedPerSemester[this.semester] = backup

        this.semester--
        if (this.semester === 1) {
            this.backButton.classed("disabled", true)
            this.backButton.attr("disabled", 'disabled')
        }
        prevSelected.forEach(subject => {
            if (!subject.selected) {
                subject.selectRamo()
                this.totalCredits["USM"] -= subject.getUSMCredits()
                this.totalCredits["SCT"] -= subject.getSCTCredits()
            }
            this.displayedSubjects[subject.sigla][1].property("value", this.subjectGrades[this.semester][subject.sigla])
            subjectsToUpdate.push(subject)
        })
        this.selectedPerSemester[this.semester] = prevSelected
        this.updateSemesterIndicator()
        this.calculationsEnabled = true
        this.calculate()
        this.malla.verifyPrer()
        subjectsToUpdate.forEach(subject => this.mallaEditor.updateState(subject))

        //super.prevSemester();
    }

    cleanSemester() {
        super.cleanSemester();
        this.faes[this.semester] = 1
        this.card.select(".fae").node().value = 1
        this.calculate()

    }

    cleanAll() {
        this.calculationsEnabled = false
        super.cleanAll();
        this.faes = {
            1: 1
        }
        this.prevSemesterSums = {
            'USM': {},
            'SCT': {}
        }
        this.currentSemesterSum = {
            'USM': 0,
            'SCT': 0
        }
        this.totalCredits = {
            'USM': 0,
            'SCT': 0
        }
        this.totalApprovedCredits = {
            'USM': {},
            'SCT': {}
        }
        this.subjectGrades = {}
        this.card.select(".fae").node().value = 1
        this.selectedPerSemester[1] = []
        this.calculationsEnabled = true
        this.calculate()
        delete localStorage["priorixUserData" + this.malla.currentMalla]
        this.mallaEditor.updateAllStates()
        this.backButton.classed("disabled", true)
        this.backButton.attr("disabled", 'disabled')
    }

    saveSemesters() {
        if (this.saveEnabled) {
            let cache = JSON.stringify([this.subjectGrades, this.faes])
            localStorage["priorixUserData" + this.malla.currentMalla] = cache

        }
    }

    loadSemesters() {
        let needtoDelete = false
        let cache = localStorage["priorixUserData" + this.malla.currentMalla]
        if (cache) {
            cache = JSON.parse(cache)

        } else {
            let oldSemesterCache = localStorage["prioridad-" + this.malla.currentMalla + "_SEMESTRES"]
            let oldFaeCache = localStorage["prioridad-" + this.malla.currentMalla + "_SEMESTRES"]
            if (oldFaeCache && oldSemesterCache) {
                cache = []
                cache.push(JSON.parse(oldSemesterCache))
                cache.push(JSON.parse(oldFaeCache))
                localStorage["priorixUserData" + this.malla.currentMalla] = JSON.stringify(cache)
                needtoDelete = true
            } else
                return
        }
        this.saveEnabled = false
        this.subjectGrades = Object.assign({}, cache[0])
        this.faes = cache[1]
        let i = 1
        let firstSemester = this.subjectGrades[1]
        this.selectedPerSemester[1] = []
        let subjectsNotFound = {}
        Object.keys(firstSemester).forEach(sigla => {
            if (this.malla.ALLSUBJECTS[sigla] !== undefined) {
                this.malla.ALLSUBJECTS[sigla].selectRamo()
                this.displayedSubjects[sigla][1].property("value", cache[0][1][sigla])
            } else {
                if (subjectsNotFound[1] === undefined) {
                    subjectsNotFound[1] = []
                }
                subjectsNotFound[1].push([sigla + ': ' + this.subjectGrades[1][sigla]])
                delete this.subjectGrades[1][sigla]
            }
        })
        this.calculate()
        for (i; i < Object.keys(this.subjectGrades).length; i++) {
            this.selectedPerSemester[i+1] = []
            Object.keys(this.subjectGrades[i+1]).forEach(sigla => {
                if (this.malla.ALLSUBJECTS[sigla] !== undefined)
                    this.selectedPerSemester[i+1].push(this.malla.ALLSUBJECTS[sigla])
                else {
                    if (subjectsNotFound[i+1] === undefined)
                        subjectsNotFound[i+1] = []
                    subjectsNotFound[i+1].push([sigla + ': ' + this.subjectGrades[i+1][sigla]])
                    delete this.subjectGrades[i+1][sigla]
                }
            })
            this.nextSemester()
        }
        if (Object.keys(subjectsNotFound).length !== 0){
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
        if (needtoDelete) {
            this.saveSemesters()
            delete localStorage["prioridad-" + this.malla.currentMalla + "_SEMESTRES"]
            delete localStorage["prioridad-" + this.malla.currentMalla + "_SEMESTRES"]
        }

    }

    // NEW!!
    // Calcula la prioridad y actualiza el resultado mostrado
    calculate() {
        if (this.calculationsEnabled) {
            let currentApprovedCreditsUSM, currentApprovedCreditsSCT
            let currentSemesterSumUSM, currentSemesterSumSCT
            let semesterGrades = {}
            if (this.semester !== 1) {
                currentApprovedCreditsUSM = this.totalApprovedCredits["USM"][this.semester - 1]
                currentApprovedCreditsSCT = this.totalApprovedCredits["SCT"][this.semester - 1]

                currentSemesterSumUSM = this.prevSemesterSums["USM"][this.semester - 1]
                currentSemesterSumSCT = this.prevSemesterSums["SCT"][this.semester - 1]
            } else {
                currentApprovedCreditsUSM = 0
                currentApprovedCreditsSCT = 0
                currentSemesterSumUSM = 0
                currentSemesterSumSCT = 0
            }
            this.selectedPerSemester[this.semester].forEach(subject => {
                let grade = this.displayedSubjects[subject.sigla][1].property("value")
                semesterGrades[subject.sigla] = grade
                if (grade > 54) {
                    currentApprovedCreditsUSM += subject.getUSMCredits()
                    currentApprovedCreditsSCT += subject.getSCTCredits()
                }
                currentSemesterSumUSM = currentSemesterSumUSM + grade * subject.getUSMCredits()
                currentSemesterSumSCT = currentSemesterSumSCT + grade * subject.getSCTCredits()
            })
            let fae = this.card.select(".fae").property("value")
            let resultUSM = 0
            let resultSCT = 0
            if (this.totalCredits['USM'] !== 0) {
                resultUSM = 100 * (currentSemesterSumUSM / (14 * Math.pow(this.semester, 1.06))) * currentApprovedCreditsUSM / this.totalCredits['USM'] * fae
                resultUSM = Math.round(resultUSM * 100) / 100.0
                resultSCT = 100 * (currentSemesterSumSCT / (14 * 5 / 3 * Math.pow(this.semester, 1.06))) * currentApprovedCreditsSCT / this.totalCredits['SCT'] * fae
                resultSCT = Math.round(resultSCT * 100) / 100.0

            }
            // this.card.select('.resUSM').text(resultUSM)
            this.card.select('.resSCT').text(resultSCT)
            // save results
            this.subjectGrades[this.semester] = semesterGrades
            this.currentSemesterSum["USM"] = currentSemesterSumUSM
            this.currentSemesterSum["SCT"] = currentSemesterSumSCT
            this.faes[this.semester] = fae
            this.totalApprovedCredits["USM"][this.semester] = currentApprovedCreditsUSM
            this.totalApprovedCredits["SCT"][this.semester] = currentApprovedCreditsSCT
            //console.log(this.totalApprovedCredits, this.totalCredits, this.prevSemesterSums, this.currentSemesterSum, this.subjectGrades)
            this.saveSemesters()
        }
    }
}