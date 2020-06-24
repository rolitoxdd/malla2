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
            // let rigth = card.append('button');
            // rigth.classed('btn', true)
            //     .classed('btn-warning', true)
            //     // .classed('text-white', true)
            //     .classed('align-self-stretch', true)
            //     .attr('type','button')
            //     .attr('onclick','editRamo("' + self.sigla + '")')
            //     .text('Editar');
            this.displayedSubjects[subject.sigla] = subjectInfo
        }

    }

    unDisplaySubject(subject) {
        this.displayedSubjects[subject.sigla]
            .transition().duration(300).style("opacity", "0.001").remove();
        delete this.displayedSubjects[subject.sigla]

    }

    nextSemester() {
        super.nextSemester();
        if (this.mallaEditor)
            this.mallaEditor.semesterChange()
    }

    prevSemester() {
        super.prevSemester();
        if (this.mallaEditor)
            this.mallaEditor.semesterChange()
    }
}