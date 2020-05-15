class Priorix extends SemesterManager {
    constructor(malla, card) {
        super(malla, card);
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
        this.subjectGrades= {}

        this.card.select(".fae").on('input', () => this.calculate())
    }

    // overwritten

    addSubject(subject) {
        super.addSubject(subject);
        this.totalCredits['USM'] = this.totalCredits['USM'] + subject.getUSMCredits()
        this.totalCredits['SCT'] = this.totalCredits['SCT'] + subject.getSCTCredits()
    }

    removeSubject(subject) {
        super.removeSubject(subject);
        this.totalCredits['USM'] = this.totalCredits['USM'] - subject.getUSMCredits()
        this.totalCredits['SCT'] = this.totalCredits['SCT'] - subject.getSCTCredits()

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
            .attr('class', 'text-left mb-1')
            .attr('for', 'nota-' + subject.sigla)
            .text(subject.name);
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
    }

    unDisplaySubject(subject) {
       this.displayedSubjects[subject.sigla][1]
            .on('input', null);
        this.displayedSubjects[subject.sigla][0]
            .transition().duration(300).style("opacity", "0.001").remove();
        delete this.displayedSubjects[subject.sigla]
    }

    nextSemester() {
        // This needs to be rewritten
        let selected = [...this.SELECTED]
        this.selectedPerSemester[this.semester] = [...this.SELECTED]
        this.prevSemesterSums["USM"][this.semester] = this.currentSemesterSum["USM"]
        this.prevSemesterSums["SCT"][this.semester] = this.currentSemesterSum["SCT"]
        this.saveSemesters()
        selected.forEach(subject => {
                this.totalCredits["USM"] += subject.getUSMCredits()
                this.totalCredits["SCT"] += subject.getSCTCredits()
            if (this.displayedSubjects[subject.sigla][1].property("value") > 54) {
                subject.selectRamo()
                subject.approveRamo()
            } else if (!this.selectedPerSemester[this.semester+1]){
                subject.showWarning("yellow")
            }
        })
        this.semester++
        if (this.semester === 2)
            this.backButton.classed("disabled", false)
        this.updateSemesterIndicator()
        if (this.selectedPerSemester[this.semester]) {
            this.selectedPerSemester[this.semester].forEach(subject => {
                if (this.selectedPerSemester[this.semester - 1].indexOf(subject) === -1)
                    subject.selectRamo()
                this.displayedSubjects[subject.sigla][1].property("value", this.subjectGrades[this.semester][subject.sigla])
            });
        }
        this.calculate()
        this.malla.verifyPrer()
        //super.nextSemester();
    }

    prevSemester() {
        if (this.SELECTED.length === 0 && this.semester >= Object.values(this.selectedPerSemester).length)
            delete this.selectedPerSemester[this.semester]
        else
            this.selectedPerSemester[this.semester] = [...this.SELECTED]
        this.saveSemesters()
        this.deApprovePrevSemester()
        let selected = [...this.SELECTED]
        let prevSelected = this.selectedPerSemester[this.semester - 1]
        selected.forEach(subject => {
            if (prevSelected.indexOf(subject) === -1) {
                subject.selectRamo()
            } else {
                this.totalCredits["USM"] -= subject.getUSMCredits()
                this.totalCredits["SCT"] -= subject.getSCTCredits()
            }
        })
        this.semester--
        if (this.semester === 1) {
            this.backButton.classed("disabled", true)
        }
        prevSelected.forEach(subject => {
            if (!subject.selected) {
                subject.selectRamo()
                this.totalCredits["USM"] -= subject.getUSMCredits()
                this.totalCredits["SCT"] -= subject.getSCTCredits()
            }
            this.displayedSubjects[subject.sigla][1].property("value", this.subjectGrades[this.semester][subject.sigla])

        })
        this.updateSemesterIndicator()
        this.calculate()
        this.malla.verifyPrer()

        //super.prevSemester();
    }

    // new

    calculate() {
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
        this.SELECTED.forEach(subject => {
            let grade = this.displayedSubjects[subject.sigla][1].property("value")
            semesterGrades[subject.sigla] = grade
            if (grade > 54) {
                currentApprovedCreditsUSM +=  subject.getUSMCredits()
                currentApprovedCreditsSCT += subject.getSCTCredits()
            }
            currentSemesterSumUSM = currentSemesterSumUSM + grade * subject.getUSMCredits()
            currentSemesterSumSCT = currentSemesterSumSCT + grade * subject.getSCTCredits()
        })
        let fae = this.card.select(".fae").property("value")
        let resultUSM = 0
        let resultSCT = 0
        if (this.totalCredits['USM'] !== 0) {
            resultUSM = 100 * (currentSemesterSumUSM/(14 * Math.pow(this.semester, 1.06))) * currentApprovedCreditsUSM/this.totalCredits['USM'] * fae
            resultUSM = Math.round(resultUSM * 100) / 100.0
            resultSCT = 100 * (currentSemesterSumSCT/(14 * 5/3 * Math.pow(this.semester, 1.06))) * currentApprovedCreditsSCT/this.totalCredits['SCT'] * fae
            resultSCT = Math.round(resultSCT * 100) / 100.0

        }
        this.card.select('.resUSM').text(resultUSM)
        this.card.select('.resSCT').text(resultSCT)
        // save results
        this.subjectGrades[this.semester] = semesterGrades
        this.currentSemesterSum["USM"] = currentSemesterSumUSM
        this.currentSemesterSum["SCT"] = currentSemesterSumSCT
        this.faes[this.semester] = fae
        this.totalApprovedCredits["USM"][this.semester] = currentApprovedCreditsUSM
        this.totalApprovedCredits["SCT"][this.semester] = currentApprovedCreditsSCT
    }

}