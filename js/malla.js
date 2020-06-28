// Futuro remplazo de canvas.js

class Malla {

    constructor(sct = false, ramoType = Ramo, scaleX = 1, scaleY = 1) {

        // Propiedades antes del render
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        this.ramoType = ramoType;
        this.rawMalla = {};
        this.sectors = {};
        this.malla = {};
        this.sct = sct;
        this.longestSemester = 0;
        this.totalCredits = 0;
        this.totalRamos = 0;
        this.semesterManager = null
        this.currentMalla = null;

        // Propiedades despues del render
        this.APPROVED = [];
        this.RAMOID = 1;
        this.ALLRAMOS = {};
        this.checkPrer = false;
        this.saveEnabled = false;
        this.isMallaSet = false;
        this.showCreditSystem = false;
        this.showCreditStats = false

        this.totalCredits = 0;
        this.totalRamos = 0;

    }

    // Auto explanatorio
    enableCreditsStats() {
        this.showCreditStats = true
    }

    // Auto explanatorio
    enableCreditsSystem() {
        this.showCreditSystem = true
    }

    // Habilita el guardado de ramos aprobados para futuras sesiones
    enableSave() {
        this.saveEnabled = true
    }

    // Obtiene los datos de la carrera y prepara para definirlas
    setCareer(carr, relaPath) {
        this.currentMalla = carr;
        let promises = [];

        promises.push(d3.json( relaPath + "data/data_" + this.currentMalla + ".json"));
        promises.push(d3.json( relaPath + "data/colors_" + this.currentMalla + ".json"));
        return Promise.all(promises).then(values => {this.setMallaAndSectors(values[0], values[1])})
    }

    // Define los datos de la malla y propiedades
    setMallaAndSectors(malla, sectors) {
        let semester;
        let longest_semester = 0;
        let totalCredits = 0;
        let totalRamos = 0;

        this.rawMalla = malla;
        this.sectors = sectors;

        for (semester in this.rawMalla) {
            this.malla[semester] = {};

            if (malla[semester].length > longest_semester)
                longest_semester = malla[semester].length;
            malla[semester].forEach(ramo => {
                totalRamos += 1;
                // Agregado de ramos por semestre
                if (ramo.length === 7) {
                    // Nuevo formato con ramos SCT
                    this.malla[semester][ramo[1]] = new this.ramoType(ramo[0], ramo[1], ramo[2], ramo[4], ramo[5],this.RAMOID++, this, ramo[3])
                } else {
                    // Formato antiguo
                    this.malla[semester][ramo[1]] = new this.ramoType(ramo[0], ramo[1], ramo[2], ramo[3], (function hasPrer() {
                        if (ramo.length > 4) {
                            return ramo[4];
                        }
                        return [];
                    })(), this.RAMOID++, this);
                }
                this.ALLRAMOS[ramo[1]] = this.malla[semester][ramo[1]];
                totalCredits += this.malla[semester][ramo[1]].getDisplayCredits()
            });
        }
        this.longestSemester = longest_semester;
        this.totalCredits = totalCredits;
        this.totalRamos = totalRamos;
        this.isMallaSet = true;
    }

    // Define el controlador de semestres para que las asignaturas puedan acceder a el
    setSemesterManager(semesterManager) {
        this.semesterManager = semesterManager
    }

    // Agrega ramos a la malla
    addSubject(subject) {
        this.ALLRAMOS[subject.sigla] = subject
    }

    // Elimina ramos de la malla y todo rastro de ellos
    delSubjects(subject) {
        Object.values(this.ALLRAMOS).forEach(otherSubject => {
            // Elimina el ramo como prerrequisito de otros
            if (otherSubject.prer.has(subject.sigla)){
                otherSubject.prer.delete(subject.sigla)
                otherSubject.verifyPrer()
            }
        })
        delete this.ALLRAMOS[subject.sigla]
    }

    // Renderiza la malla. canvasId puede ser una clase o una id
    drawMalla(canvasId) {
        if (!this.isMallaSet)
            return;

        let separator = 10;
        let semesterIndicatorHeight = 30 * this.scaleY;

        let width = (this.ramoType.getDisplayWidth(this.scaleX) * Object.keys(this.malla).length) +
            separator * (Object.keys(this.malla).length - 1);
        let height = (this.ramoType.getDisplayHeight(this.scaleY) + separator) * this.longestSemester +
            semesterIndicatorHeight * 2 + separator;
        let canvasWidth = width + separator; // for full show svg
        let canvasHeight = height + separator/2

        const canvas = d3.select(canvasId).append("svg")
            .attr("width", canvasWidth)
            .attr("height", canvasHeight);
        const drawer = canvas.append('g');
        let globalX = separator / 2,
            globalY = 0;
        let isBigBarRendered = false;
        let semestersPassed = 0;
        let currentYear = 0;
        let currentYearIndicator = null;
        let currentYearIndicatorText = null;
        let yearIndicator = null;

        Object.keys(this.malla).forEach(semester => {
            globalY = 0;
            // Barra indicadora de años
            if (semestersPassed === 0) {
                yearIndicator = drawer.append("g")
                    .attr("cursor", "pointer");

                currentYearIndicator = yearIndicator.append("rect")
                    .attr("x", globalX)
                    .attr("y", globalY)
                    .attr("width", this.ramoType.getDisplayWidth(this.scaleX))
                    .attr("height", semesterIndicatorHeight)
                    .attr("fill", 'gray')
                    .classed('bars', true);
                semestersPassed++;

                currentYearIndicatorText = yearIndicator.append("text")
                    .attr('x', globalX + this.ramoType.getDisplayWidth(this.scaleX) / 2.0)
                    .attr('y', globalY + semesterIndicatorHeight / 2)
                    .text("Año " + currentYear++ + " 1/2")
                    // .attr("font-family", "sans-serif")
                    .attr("font-weight", "bold")
                    .attr("fill", "white")
                    .attr("dominant-baseline", "central")
                    .attr('text-anchor', 'middle');
                let localYearIndicator = yearIndicator
                yearIndicator.on("click", () => {
                    let bar = d3.select(d3.event.currentTarget)
                    let number = parseInt(bar.select("text").text().substr(4));
                    let ramosToSelect;
                if (bar.node().getBBox().width <= this.ramoType.getDisplayWidth(this.scaleX) * 2 - this.ramoType.getDisplayWidth(this.scaleX) / 2) {
                    d3.select("#sem" + (number * 2 + 1)).dispatch('click')
                } else {
                    d3.select("#sem" + number * 2).dispatch('click');
                    d3.select("#sem" + (number * 2 - 1)).dispatch('click')

                }

                });
            } else {
                currentYearIndicator.attr("width", this.ramoType.getDisplayWidth(this.scaleX) * 2 + separator);
                currentYearIndicatorText.text("Año " + (currentYear));
                currentYearIndicatorText.attr("x", globalX - separator / 2);
                semestersPassed = 0;
            }

            globalY += semesterIndicatorHeight + separator;

            // Barra gigante de semestres
            if (!isBigBarRendered) {
                drawer.append("rect")
                    .attr("x", globalX)
                    .attr("y", globalY)
                    .attr("width", width)
                    .attr("height", semesterIndicatorHeight)
                    .attr("fill", '#EEE')
                    .classed("sem", true);
                isBigBarRendered = true;
            }

            isBigBarRendered = true;
            let intToRomanize = semester
            if (intToRomanize[0] === "s") {
                intToRomanize = parseInt(intToRomanize.substr(1))
            } else {
                intToRomanize = parseInt(intToRomanize)
            }
            let semesterIndicator = drawer.append("g")
                .attr("id", "sem" + intToRomanize)
                .attr("cursor", "pointer")
                .attr("width", this.ramoType.getDisplayWidth(this.scaleX))
                .attr("height", semesterIndicatorHeight)
                .classed("sem", true);





            // barra de semestres individuales
            semesterIndicator.append("rect")
                .attr("cursor", "pointer")
                .attr("x", globalX)
                .attr("y", globalY)
                .attr("width", this.ramoType.getDisplayWidth(this.scaleX))
                .attr("height", semesterIndicatorHeight)
                .attr("fill", '#EEE');


            semesterIndicator.append("text")
                .attr('x', globalX + this.ramoType.getDisplayWidth(this.scaleX) / 2.0)
                .attr('y', globalY + semesterIndicatorHeight / 2)
                .text(this.romanize(intToRomanize))
                .attr("dominant-baseline", "central")
                .attr('text-anchor', 'middle');

            semesterIndicator.on("click", () => {
                let bar = d3.select(d3.event.currentTarget)
                let semNumber = this.deRomanize(bar.select("text").text());
                if (semester[0] === "s")
                    semNumber = "s" + semNumber
                Object.values(this.malla[semNumber]).forEach(ramo => {
                    ramo.isBeingClicked()
                })

            });

            globalY += semesterIndicatorHeight + separator;

            Object.keys(this.malla[semester]).forEach(subject => {
                this.malla[semester][subject].draw(drawer, globalX, globalY, this.scaleX, this.scaleY);
                globalY += this.ramoType.getDisplayHeight(this.scaleY) + separator;
            })


            globalX += this.ramoType.getDisplayWidth(this.scaleX) + separator;
        })



        // Funciones solo para dibujar mallas

    }

    // Renderiza las descripciones de las categorías
    showColorDescriptions(locationId) {
        Object.keys(this.sectors).forEach(key => {
            let color_description = d3.select(".color-description").append("div")
                .attr("style", "display:flex;vertical-align:middle;margin-right:15px;");
            let circle_color = color_description.append("svg")
                .attr("height", "25px")
                .attr("width", "25px");
            circle_color.append("circle")
                .attr("r", 10)
                .attr("cx", 12)
                .attr("cy", 12)
                .attr("fill", this.sectors[key][0]);

            color_description.append("span").text(this.sectors[key][1]);

        });
    }

    // Permite que se revise si los ramos cumplen prerrequisitos
    enablePrerCheck() {
        this.checkPrer = true;
        this.verifyPrer()
    }

    // Revisa que ramos cumplen prerrequisitos y "oculta" los que no los cumplen
    verifyPrer() {
        if (this.checkPrer) {
            Object.values(this.ALLRAMOS).forEach(ramo => {
                ramo.verifyPrer();
            });
            this.saveApproved()
        }
    }

    // Retorna el sistema de créditos utilizado
    displayCreditSystem() {
        if (!this.showCreditSystem)
            return
        d3.select("#credits-system").text(this.sct ? 'SCT' : 'USM')
    }

    // Actualiza los datos como porcentaje de ramos aprobados etc
    updateStats() {
        if (!this.showCreditStats)
            return
        let currentCredits = 0;
        let currentRamos = 0;
        this.APPROVED.forEach(ramo => {
            currentCredits += ramo.getDisplayCredits();
            currentRamos += 1
        })
        let creditPercentage = currentCredits/this.totalCredits * 100;
        let careerAdvance = currentRamos/this.totalRamos * 100;
        d3.select("#credits").text(parseInt(currentCredits))
        d3.select("#credPercentage").text(parseInt(creditPercentage))
        d3.select("#ramoPercentage").text(parseInt(careerAdvance))
    }

    // Limpia los ramos aprobados
    cleanSubjects() {
        let listToClean = [...this.APPROVED]
        listToClean.forEach(ramo => {
            ramo.cleanRamo()
        })
        this.verifyPrer()
        this.updateStats()
    }


    // Auto explanatorio
    approveSubject(subject) {
        this.APPROVED.push(subject)
    }

    // Auto explanatorio
    deApproveSubject(subject) {
        let _i = this.APPROVED.indexOf(subject);
        if (_i > -1) {
            this.APPROVED.splice(_i, 1);
        }
    }

    getSubject(sigla) {
        return this.ALLRAMOS[sigla]
    }

    // Auto explanatorio
    saveApproved() {
        if (this.saveEnabled) {
            let cacheName = "approvedRamos_" + this.currentMalla;
            let cacheToSave = [];
            this.APPROVED.forEach(ramo => {
                cacheToSave.push(ramo.sigla)
            });
            localStorage[cacheName] = JSON.stringify(cacheToSave);
        }
    }

    // Auto explanatorio
    loadApproved() {
        if (this.saveEnabled) {
            let cache = localStorage["approvedRamos_" + this.currentMalla]
            if (cache) {
                let loadedData = JSON.parse(cache)
                loadedData.forEach(siglaRamo => {
                    this.ALLRAMOS[siglaRamo].approveRamo()
                })
                this.verifyPrer()
            }
        }
    }

    // EXTRA

    deRomanize(roman){
        let r_nums = this.getRnums();
        let a_nums = this.getAnums();
        let remainder = roman.replace(/i/g, "M");
        let arabic = 0, count = 0, test = remainder;

        let len=r_nums.length;
        for (let i=1; i<len; ++i ){
            const numchrs = r_nums[i].length;
            while( remainder.substr(0,numchrs) === r_nums[i]){
                if((count++) > 30) return -1;
                arabic += a_nums[i];
                remainder = remainder.substr(numchrs,remainder.length-numchrs);
            }
            if(remainder.length <= 0) break;
        }
        if(remainder.length !==0 ){
            alert(roman + " INVALID truncating to "+test.replace(remainder,'') );
        }
        if( (0 < arabic) && (arabic < 4000000) )return arabic;
        else return -1;
    }

    romanize(arabic) {
        if (arabic > 3999999 || arabic < 1) {
            return 'Expect number from 1 to 3,999,999';
        }
        let r_nums = this.getRnums();
        let a_nums = this.getAnums();
        let remainder = parseInt(arabic);
        let roman = '', count = 0;

        let len = r_nums.length;
        for (let i = 1; i < len; ++i) {
            while (remainder >= parseInt(a_nums[i])) {
                if ((count++) > 30) return -1;
                roman = roman + r_nums[i];
                remainder = remainder - a_nums[i];
            }
            if (remainder <= 0) break;
        }
        return roman;
    }


    getRnums() {
        let r_nums = Array();
        r_nums[1] = 'm';
        r_nums[2] = 'cm';
        r_nums[3] = 'd';
        r_nums[4] = 'cd';
        r_nums[5] = 'c';
        r_nums[6] = 'xc';
        r_nums[7] = 'l';
        r_nums[8] = 'xl';
        r_nums[9] = 'x';
        r_nums[10] = 'Mx';
        r_nums[11] = 'v';
        r_nums[12] = 'Mv';
        r_nums[13] = 'M';
        r_nums[14] = 'CM';
        r_nums[15] = 'D';
        r_nums[16] = 'CD';
        r_nums[17] = 'C';
        r_nums[18] = 'XC';
        r_nums[19] = 'L';
        r_nums[20] = 'XL';
        r_nums[21] = 'X';
        r_nums[22] = 'IX';
        r_nums[23] = 'V';
        r_nums[24] = 'IV';
        r_nums[25] = 'I';
        return r_nums;
    }

    getAnums() {
        let a_nums = Array();
        a_nums[1] = 1000000;
        a_nums[2] = 900000;
        a_nums[3] = 500000;
        a_nums[4] = 400000;
        a_nums[5] = 100000;
        a_nums[6] = 90000;
        a_nums[7] = 50000;
        a_nums[8] = 40000;
        a_nums[9] = 10000;
        a_nums[10] = 9000;
        a_nums[11] = 5000;
        a_nums[12] = 4000;
        a_nums[13] = 1000;
        a_nums[14] = 900;
        a_nums[15] = 500;
        a_nums[16] = 400;
        a_nums[17] = 100;
        a_nums[18] = 90;
        a_nums[19] = 50;
        a_nums[20] = 40;
        a_nums[21] = 10;
        a_nums[22] = 9;
        a_nums[23] = 5;
        a_nums[24] = 4;
        a_nums[25] = 1;
        return a_nums;
    }

    generateCode() {
        let data = {}
        let expresion1 = /("s[0-9]+":)+|(\[(?:,?[^\[\]])+(?:,\[[^\]]*\])(?:,?[^\]]*)+\])+/g

        Object.keys(this.malla).forEach(semester => {
            let key
            if (semester.includes("s"))
                key = semester
            else
                key = "s" + semester
            data[key] = []

            Object.keys(this.malla[semester]).forEach(sigla => {
                let subject = this.ALLRAMOS[sigla]
                let subjectData = []

                subjectData.push(subject.name)
                subjectData.push(subject.sigla)
                subjectData.push(subject.getUSMCredits())
                if (subject.USMtoSCT)
                    subjectData.push(0)
                else
                    subjectData.push(subject.getSCTCredits())

                subjectData.push(subject.sector)
                subjectData.push([...subject.prer])
                subjectData.push("")
                data[key].push(subjectData)

            })
            // for (siglaRamoindex in customMalla[semester]) {
            // }
        })
        let mallaResult = JSON.stringify(data).match(expresion1);

        let s = "{\n"
        let first = true
        let firstSem = true
        mallaResult.forEach(item => {
            if (/("s[0-9]+":)/.test(item)) {
                if (firstSem) {
                    s += "    " + item + " [\n"
                    firstSem = false
                } else {
                    s += "\n    ],\n" + "    " + item + " [\n"
                }
                first = true
            } else if (first) {
                s += "        " + item
                first = false
            } else
                s += ",\n" + "        " + item
        })
        s += "\n" + "    " + "]\n" + "}"
        let expresion2 = /("[^\]]+\],?)/g
        let colorResult = JSON.stringify(this.sectors).match(expresion2)
        let c = "{"

        colorResult.forEach(color => {
            c += "\n" + "    " + color
        })
        c += "\n}"

        if (document.getElementById('mallaCode')) {
            new ClipboardJS('.btn');
            document.getElementById('mallaCode').textContent = s;
            document.getElementById('colorCode').textContent = c
            PR.prettyPrint()

            document.getElementById('abrev').value = this.currentMalla
            document.getElementById("carrMalla1").textContent = this.currentMalla
            document.getElementById("carrMalla2").textContent = this.currentMalla
            document.getElementById("carrColor1").textContent = this.currentMalla
            document.getElementById("carrColor2").textContent = this.currentMalla

            let file1 = new Blob([s], {"aplication/json": "aplication/json"});
            let file2 = new Blob([c], {"aplication/json": "aplication/json"});
            let downloadLink1 = document.getElementById('dMalla')
            let downloadLink2 = document.getElementById('dColor')
            downloadLink1.setAttribute('href', URL.createObjectURL(file1))
            downloadLink1.setAttribute('download', "data_" + this.currentMalla + '.json')
            downloadLink2.setAttribute("href", URL.createObjectURL(file2))
            downloadLink2.setAttribute("download", "colors_" + this.currentMalla + '.json')
        } else {
            console.log(s)
            console.log(c)
        }
        if (document.getElementById("abrev")) {
            document.getElementById("abrev").addEventListener('input', function (input) {
                document.getElementById("carrMalla1").textContent = input.target.value.toUpperCase()
                document.getElementById("carrMalla2").textContent = input.target.value.toUpperCase()
                document.getElementById("carrColor1").textContent = input.target.value.toUpperCase()
                document.getElementById("carrColor2").textContent = input.target.value.toUpperCase()
                document.getElementById('dMalla').setAttribute('download', "data_" + input.target.value.toUpperCase() + '.json')
                document.getElementById('dColor').setAttribute("download", "colors_" + input.target.value.toUpperCase() + '.json')

                $('[data-toggle="tooltip"]').tooltip()
                $('[data-toggle="tooltip"]').tooltip('disable')
            })
        }
    }
}