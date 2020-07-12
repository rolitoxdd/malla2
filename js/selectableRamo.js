
class SelectableRamo extends Ramo {

    constructor(name, sigla, credits, sector, prer, id, malla, creditsSCT = 0, isCustom=false, dictatesIn = "") {
        super(name, sigla, credits, sector, prer, id, malla, creditsSCT, isCustom, dictatesIn);
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

    // acciones a realizar cuando se clickea el ramo
    isBeingClicked() {
        this.selectRamo()
    }

    // se selecciona o deselecciona el ramo con su respectiva animación
    selectRamo() {
        if (this.approved) { // Si el ramo esta aprobado, no se selecciona
            if (!this.isCustom) {

                this.showWarning()
            }
            return;
        }

        if (!this.selected) { // Ramo se ha seleccionado

            if (!this.isCustom)
                this.ramo.select(".selected").transition().delay(20).attr("opacity", ".8");

            this.malla.semesterManager.addSubject(this);

        } else { // Ramo ya no esta seleccionado
            if (!this.isCustom)
                this.ramo.select(".selected").transition().delay(20).attr("opacity", "0.01");

            this.malla.semesterManager.removeSubject(this)
            let card = d3.select('#p-' + this.sigla);
            card.transition().duration(300).style("opacity", "0.001").remove();

        }
        this.selected = !this.selected;
    };

    // activa la animación de warning con el color que se desee
    showWarning(warningColor = "red") {
        if (!this.isCustom) {
            this.ramo.select(".selected").attr('stroke',warningColor);
            let animation = this.ramo.select(".selected").transition().duration(200).attr("opacity", ".8")
                .transition().duration(150).attr("opacity", ".5")
                .transition().duration(150).attr("opacity", ".8")
                .transition().duration(200).attr("opacity", ".001")
                .attr('stroke','green');
            if (this.selected) {
                animation.transition().attr("opacity", ".8")
            }
        }
    }
}