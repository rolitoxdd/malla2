
class SelectableRamo extends Ramo{

    constructor(name, sigla, credits, sector, prer = [], id, color, malla, isCustom=false) {
        super(name, sigla, credits, sector, prer, id, color, malla, isCustom);
        this.isCustom = isCustom;
        this.selected = false;
    }

    drawActions(posX, posY, sizeX, sizeY) {
        super.drawActions(posX, posY, sizeX, sizeY);
        this.ramo.append("rect")
            .attr("x", posX)
            .attr("y", posY)
            .attr("width", sizeX)
            .attr("height", sizeY)
            .attr("stroke", 'green')
            .attr("stroke-width", '7')
            .attr("opacity", "0.001")
            .attr("fill-opacity", "0.001")
            .attr("class", "selected");
    }

    isBeingClicked() {
        this.selectRamo()
    }

    selectRamo() {
        if (this.approved) { // Si el ramo esta aprobado, no se selecciona
            if (!this.isCustom) {

            d3.select("#" + this.sigla).select(".selected").attr('stroke','red');
                d3.select("#" + this.sigla).select(".selected").transition().duration(200).attr("opacity", ".8")
                    .transition().duration(150).attr("opacity", ".5")
                    .transition().duration(150).attr("opacity", ".8")
                    .transition().duration(200).attr("opacity", ".001")
                    .attr('stroke','green');
            }
            return;
        }

        if (!this.selected) { // Ramo se ha seleccionado
            let creditos = this.getDisplayCredits();

            if (!this.isCustom)
                d3.select("#" + this.sigla).select(".selected").transition().delay(20).attr("opacity", ".8");

            this.malla.semesterManager.addSubject(this);
            // let card = d3.select('#ramos').append('div');
            // card.attr('id', "p-" + self.sigla);
            // card.attr('class', 'form-group mb-2');
            // card.attr('style', 'opacity:0.001');
            // card.append('label')
            //     .attr('class', 'text-left mb-1')
            //     .attr('for', 'nota-' + self.sigla)
            //     .text(self.nombre);
            // let insideCard = card.append('div');
            // insideCard.attr('class','input-group');
            // insideCard.append('div')
            //     .attr('class','input-group-prepend')
            //     .append('span')
            //     .attr('class','input-group-text')
            //     .text('Nota');
            // insideCard.append('input')
            //     .attr('class', 'form-control')
            //     .attr('id', 'nota-' + self.sigla)
            //     .attr('name', 'nota-' + self.sigla)
            //     .attr('type', 'number')
            //     .attr('min','0')
            //     .attr('max','100')
            //     .attr('placeholder', '0');
            // insideCard.append('div')
            //     .attr('class','input-group-append')
            //     .append('span')
            //     .attr('class','input-group-text')
            //     .text('x ' + creditos + ' creditos');
            // card.transition().duration(300).style("opacity", "1");
        } else { // Ramo ya no esta seleccionado
            if (!this.isCustom)
                d3.select("#" + this.sigla).select(".selected").transition().delay(20).attr("opacity", "0.01");

            this.malla.semesterManager.removeSubject(this)
            let card = d3.select('#p-' + this.sigla);
            card.transition().duration(300).style("opacity", "0.001").remove();

        }
        this.selected = !this.selected;
    };
}