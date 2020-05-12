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
            'USM': 0,
            'SCT': 0
        }

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
                console.log(subject.sigla, d3.event.target.value)
                this.calculate()
            })
        subjectGrade.append('div')
            .attr('class','input-group-append')
            .append('span')
            .attr('class','input-group-text')
            .text('x ' + subject.getDisplayCredits() + ' créditos');
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
        super.nextSemester();
    }

    prevSemester() {
        // this needs to be rewritten
        super.prevSemester();
    }

    // new

    calculate() {
        let currentApprovedCredits = {...this.totalApprovedCredits}
        let currentSemesterSumUSM, currentSemesterSumSCT
        if (this.semester !== 1) {
            currentSemesterSumUSM = this.prevSemesterSums["USM"][this.semester]
            currentSemesterSumSCT = this.prevSemesterSums["SCT"][this.semester]
        } else {
            currentSemesterSumUSM = 0
            currentSemesterSumSCT = 0
        }
        this.SELECTED.forEach(subject => {
            let grade = this.displayedSubjects[subject.sigla][1].property("value")
            if (grade > 54) {
                currentApprovedCredits["USM"] = currentApprovedCredits["USM"] + subject.getUSMCredits()
                currentApprovedCredits["SCT"] = currentApprovedCredits["SCT"] + subject.getSCTCredits()
            }
            currentSemesterSumUSM = currentSemesterSumUSM + grade * subject.getUSMCredits()
            currentSemesterSumSCT = currentSemesterSumSCT + grade * subject.getSCTCredits()
        })
        let fae = this.card.select(".fae").property("value")
        let resultUSM = 0
        let resultSCT = 0
        if (this.totalCredits['USM'] !== 0) {
            resultUSM = 100 * (currentSemesterSumUSM/(14 * Math.pow(this.semester, 1.06))) * currentApprovedCredits['USM']/this.totalCredits['USM'] * fae
            resultUSM = Math.round(resultUSM * 100) / 100.0
            resultSCT = 100 * (currentSemesterSumSCT/(14 * 5/3 * Math.pow(this.semester, 1.06))) * currentApprovedCredits['SCT']/this.totalCredits['SCT'] * fae
            resultSCT = Math.round(resultSCT * 100) / 100.0

        }
        this.card.select('.resUSM').text(resultUSM)
        this.card.select('.resSCT').text(resultSCT)
    }

}