let width = 100;
let height = 100;

class Ramo {
    static get width() {
        return width
    }

    static get height() {
        return height
    }

    static getDisplayWidth(scaleX) {
        return width * scaleX;
    }
    static getDisplayHeight(scaleY){
        return height * scaleY;
    }


    constructor(name, sigla, credits, sector, prer = [], id, color) {
        // Propiedades del ramo
        this.name = name;
        this.sigla = sigla;
        this.credits = credits;
        this.sector = sector;
        this.prer = new Set(prer);
        this.color = color;

        // Propiedades para renderizado e interacciones
        this.id = id;
        this.ramo = null;
        this.approved = false;
    }



    draw(canvas, posX, posY, scaleX, scaleY) {
        this.ramo = canvas.append('g')
            .attr("cursor", "pointer")
            .attr('id', this.sigla);

        let sizeX = this.constructor.getDisplayWidth(scaleX),
            sizeY = this.constructor.getDisplayHeight(scaleY);
        let graybar = sizeY / 5;
        let credits = this.getDisplayCredits(this.credits);

        this.ramo.append("rect")
            .attr("x", posX)
            .attr("y", posY)
            .attr("width", sizeX )
            .attr("height", sizeY)
            .attr("fill", this.color);

        // above bar
        this.ramo.append("rect")
            .attr("x", posX)
            .attr("y", posY)
            .attr("width", sizeX )
            .attr("height", graybar)
            .attr("fill", '#6D6E71')
            .classed('bars', true);

        // below bar
        this.ramo.append("rect")
            .attr("x", posX)
            .attr("y", posY + sizeY - graybar)
            .attr("width", sizeX )
            .attr("height", graybar)
            .attr("fill", '#6D6E71')
            .classed('bars', true);

        // credits rect
        this.ramo.append("rect")
            .attr("x", posX + sizeX  - 22 * scaleX)
            .attr("y", posY + sizeY - graybar)
            .attr("width", 20 * scaleX)
            .attr("height", graybar)
            .attr("fill", 'white');


        this.ramo.append("text")
            .attr("x", posX + sizeX  - 22 * scaleX + 20 * scaleX / 2)
            .attr("y", posY + sizeY - graybar / 2)
            .text(credits)
            .attr("font-weight", "regular")
            .attr("fill", "black")
            .attr("dominant-baseline", "central")
            .attr("text-anchor", "middle")
            .attr("font-size", 12 * scaleY);


        this.ramo.append("text")
            .attr("x", posX + sizeX  / 2)
            .attr("y", posY + sizeY / 2)
            .attr("dy", 0)
            .text(this.name)
            .attr("class", "ramo-label")
            .attr("fill", () => {
                if (this.needsWhiteText(this.color))
                    return "white";
                return '#222222';
            })
            .attr("font-size", 13)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central");

        // Sigla
        this.ramo.append("text")
            .attr("x", posX + 2)
            .attr("y", posY + sizeY / 7)
            .text(this.sigla)
            .attr("font-weight", "bold")
            .attr("fill", "white")
            .attr("font-size", function() {
                if (scaleX < 0.71)
                    return 9;
                return 12;
            });
        this.drawActions(posX, posY, sizeX, sizeY);

        // id
        this.ramo.append("circle")
            .attr("cx", posX + sizeX  - 10)
            .attr("cy", posY + graybar / 2)
            .attr("fill", "white")
            .attr("r", 8);
        this.ramo.append("text")
            .attr("x", posX + sizeX  - 10)
            .attr("y", posY + graybar / 2)
            .attr("dominant-baseline", "central")
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .attr('font-size', 10)
            .text(this.id);

        // prerr circles!
        let c_x = 0;
        this.prer.forEach((p) => {
            let r = 9,
                fontsize = 10,
                variantX = 5;
            let variantY = 5;
            if (scaleX < 0.83) {
                r--;
                fontsize--;
                variantX = 1;
                variantY--;
            }
            this.ramo.append("circle")
                .attr('cx', posX + r + c_x + variantX)
                .attr('cy', posY + sizeY - graybar / 2)
                .attr('r', r)
                .attr('fill', malla.ALLRAMOS[p].color)
                .attr('stroke', 'white');
            this.ramo.append('text')
                .attr('x', posX + r + c_x + variantX)
                .attr('y', posY + sizeY - graybar / 2)
                .text(malla.ALLRAMOS[p].id)
                .attr("dominant-baseline", "central")
                .attr("text-anchor", "middle")
                .attr("font-size", fontsize)
                .attr("dy", 0)
                .attr('fill', () => {
                    if (this.needsWhiteText(malla.ALLRAMOS[p].color))
                        return "white";
                    return '#222222';
                });
            c_x += r * 2;
        });
        this.createActionListeners();
        this.wrap(sizeX - 5, sizeY / 5 * 3);
    }

    getDisplayCredits() {
        let credits = this.credits;
         if (malla.sct) {
             credits = Math.round(credits * 5 / 3)
         }
        return credits;
    }

    drawActions(posX, posY, sizeX, sizeY) {
        if (this.ramo == null)
            return null;

        this.ramo.append("rect")
            .attr("x", posX)
            .attr("y", posY)
            .attr("width", sizeX)
            .attr("height", sizeY)
            .attr("fill", 'white')
            .attr("opacity", "0.001")
            .attr("class", "non-approved");

        let cross = this.ramo.append('g').attr("class", "cross").attr("opacity", 0);
        cross.append("path")
            .attr("d", "M" + posX + "," + posY + "L" + (posX + sizeX) + "," + (posY + sizeY))
            .attr("stroke", "#550000")
            .attr("stroke-width", 9);
    }

    createActionListeners() {
        this.ramo.on("click", () => this.isBeingClicked());
    }

    isBeingClicked() {
        this.approveRamo();
        malla.verifyPrer();
        malla.updateStats();
        malla.saveApproved();
    }

    approveRamo() {
        if (!this.approved) {
            d3.select("#" + this.sigla).select(".cross").transition().delay(20).attr("opacity", "1");
            malla.APPROVED.push(this);
        } else {
            d3.select("#" + this.sigla).select(".cross").transition().delay(20).attr("opacity", "0.01");
            let _i = malla.APPROVED.indexOf(this);
            if (_i > -1) {
                malla.APPROVED.splice(_i, 1);
            }
        }
        this.approved = !this.approved;
    }

    cleanRamo() {
        // Se llama a metodos internos necesarios que "limpien" el ramo
        if (this.approved) {
            this.approveRamo()
        }
    }

    verifyPrer() {
        let _a = [];
        malla.APPROVED.forEach(function(ramo) {
            _a.push(ramo.sigla);
        });
        _a = new Set(_a);
        for (let r of this.prer) {
            if (!_a.has(r)) {
                this.ramo.select(".non-approved").transition().delay(20).attr("opacity", "0.71");
                return;
            }
        }
        this.ramo.select(".non-approved").transition().delay(20).attr("opacity", "0.0");
    }

    wrap(sizeX,sizeY) {
        let text = this.ramo.select(".ramo-label");
        let emEquivalent = convertEm(1, text.node());
        let words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = 0,
            fontsize = parseInt(text.attr("font-size"),10),
            tspan = text.text(null).append("tspan").attr("x", text.attr("x")).attr("dominant-baseline", "central").attr("dy", 0 + "em"),
            textLines,
            textHeight;
            word = words.pop();
        while (word) {
            line.push(word);
            tspan.text(line.join(" "));
            while (tspan.node().getComputedTextLength() > sizeX) {
                if (line.length === 1) {
                    text.attr("font-size", String(--fontsize));
                }
                else {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    // console.log(lineNumber + 1, lineHeight, dy, (lineNumber + 1) * lineHeight + dy,((lineNumber + 1) * lineHeight + dy) + "em");
                    tspan = text.append("tspan").attr("x", text.attr("x")).attr("dominant-baseline", "central").attr("dy",  lineHeight + "em").text(word);
                }
            }
            word = words.pop();
        }
        let texts = text.selectAll('tspan');
        text.attr("dy", 0); // forzar actualización de ems

        textLines = texts._groups[0].length;
        textHeight = text.node().getBoundingClientRect().height;


        while (textHeight > sizeY - 5) {
            text.attr("font-size", String(--fontsize));
            text.attr("dy", 0); // forzar actualización de ems
            textHeight = text.node().getBoundingClientRect().height;
            lineNumber = 0;
        }

        if (textLines !== 1) {
            let firstTspan = texts.filter(function (d, i) { return i === 0 });
            firstTspan.attr("dy", - (lineHeight * textLines / 2 - lineHeight / 2) + "em");
        }

        text.attr("dy", 0); // forzar actualización de ems


        // Funciones
        function getElementFontSize(context) {
            // Returns a number
            return parseFloat(
                // of the computed font-size, so in px
                getComputedStyle(
                    // for the given context
                    context ||
                    // or the root <html> element
                    document.documentElement
                ).fontSize
            );
        }

        function convertEm(value, context) {
            return value * getElementFontSize(context);
        }
    }

    needsWhiteText(colorHex) {
        // Convert hex to RGB first
        let r = 0, g = 0, b = 0;
        if (colorHex.length === 4) {
            r = "0x" + colorHex[1] + colorHex[1];
            g = "0x" + colorHex[2] + colorHex[2];
            b = "0x" + colorHex[3] + colorHex[3];
        } else if (colorHex.length === 7) {
            r = "0x" + colorHex[1] + colorHex[2];
            g = "0x" + colorHex[3] + colorHex[4];
            b = "0x" + colorHex[5] + colorHex[6];
        }
        // console.log(r,g,b)
        // Then to HSL
        let rgb = [0, 0, 0];
        rgb[0] = r / 255;
        rgb[1] = g / 255;
        rgb[2] = b / 255;

        for (let color in rgb) {
            if (rgb[color] <= 0.03928) {
                rgb[color] /= 12.92
            } else {
                rgb[color] = Math.pow(((rgb[color] + 0.055) / 1.055), 2.4)
            }

        }

        // c <= 0.03928 then c = c/12.92 else c = ((c+0.055)/1.055) ^ 2.4
        let l = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
        // console.log(l)
        return l <= 0.6; // este valor deberia ser mas bajo según estandares...
    }

}