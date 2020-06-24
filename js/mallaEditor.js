class MallaEditor {
    constructor(semesterManager, customSubjectLocation, categoryLocation = false) {
        this.semesterManager = semesterManager
        this.customManager = document.querySelector(customSubjectLocation)
        this.categories = Object.assign({}, this.semesterManager.malla.sectors)
        if (categoryLocation) {
            this.categoryManager = document.querySelector(categoryLocation)
            this.fillCategories()
            let showModalButton = document.querySelector("#showCatModal")
            showModalButton.addEventListener("click", this.setUpCategoryModal.bind(this))
            let categoryModalId = showModalButton.getAttribute("data-target")

            this.categoryModal = $(categoryModalId)
            this.categoryModal.on("hidden.bs.modal", e => {
                e.target.querySelector("#cat-name").value = ""
                e.target.querySelector("#small-cat-name").value = ""
                e.target.querySelector("#cat-color").value = ""

                let doneButton = e.target.querySelector("#sectorDoneButton")
                doneButton.removeEventListener("click", this.createCategory)
                doneButton.removeEventListener("click", this.editCategory)

            })

        } else
            this.categoryManager = null
        this.subjectList = []
        this.tableList = {}
        this.defaultSector = ["Custom", "#000000", "Fuera de la malla oficial"]

        this.subjectTable = this.customManager.querySelector("#customTableContent")

        let creatorModalId = this.customManager.getElementsByClassName("button-create-subject")[0]
            .getAttribute("data-target")

        this.createSubjectModal = $(creatorModalId)
        this.createSubjectModal.on("hidden.bs.modal", e => {
            e.target.querySelector("#custom-name").value = ""
            e.target.querySelector("#custom-sigla").value = ""
            e.target.querySelector("#custom-credits-USM").value = ""
            e.target.querySelector("#custom-credits-SCT").value = ""
            e.target.querySelector("#custom-credits-SCT").placeholder = 0        })

        this.createAdvancedSubjectModal = null

        let modal = document.querySelector(creatorModalId)
        modal.querySelector("#createSubject")
            .addEventListener("click", e => {
                this.createSubject(modal)
            })
        let advanced =this.customManager.getElementsByClassName("button-advanced-subject")
        if (advanced.length !== 0) {
            let advancedCreatorModalId = advanced[0]
                .getAttribute("data-target")
            this.createAdvancedSubjectModal = $(advancedCreatorModalId)
            advanced[0].addEventListener("click", () => {this.setUpModal()})
            this.createAdvancedSubjectModal.on("hidden.bs.modal", e => {
                e.target.querySelector("#custom-namea").value = ""
                e.target.querySelector("#custom-siglaa").value = ""
                e.target.querySelector("#custom-creditsa-USM").value = ""
                e.target.querySelector("#custom-creditsa-SCT").value = ""
                e.target.querySelector("#custom-creditsa-SCT").placeholder = 0
                let sectorC = e.target.querySelector("#sectorChooser")
                sectorC.textContent = ""
                let defaultSector = document.createElement("option")
                defaultSector.value = this.defaultSector[0]
                sectorC.append(defaultSector)

                let prerC = e.target.querySelector("#prerChooser")
                prerC.textContent = ""
                let choosePrer = document.createElement("option")
                choosePrer.value = "0"
                choosePrer.textContent = "Elige los prerrequisitos"
                prerC.append(choosePrer)
                e.target.querySelector("#prerList").textContent = ""
                let doneButton = e.target.querySelector("#createAdvSubject")
                doneButton.removeEventListener("click", this.createAdvancedSubject.bind(this))
                doneButton.removeEventListener("click", this.editSubject.bind(this))
            })
            let prerChooser = this.createAdvancedSubjectModal.get(0).querySelector("#prerChooser")
            prerChooser.addEventListener("change", this.addPrerToModal.bind(this))
        }

        this.subjectModalPrer = null
    }

    setUpModal(e, isEdit = false, subject=null) {
        let modal = this.createAdvancedSubjectModal.get(0)
        let sectorChooser = modal.querySelector("#sectorChooser")
        Object.keys(this.categories).forEach(category => {
            let option = document.createElement("option")
            option.value = category
            option.textContent = this.categories[category][1]
            sectorChooser.append(option)
        })
        if (this.categories[this.defaultSector[0]])
            sectorChooser.firstElementChild.textContent = this.categories[this.defaultSector[0]][1]
        else
            sectorChooser.firstElementChild.textContent = this.defaultSector[2]
        let prerChooser = modal.querySelector("#prerChooser")
        Object.keys(this.semesterManager.malla.ALLRAMOS).forEach(sigla => {
            let option = document.createElement("option")
            option.value = sigla
            option.textContent = this.semesterManager.malla.ALLRAMOS[sigla].name + " | " + sigla
            prerChooser.append(option)
        })
        if (isEdit) {
            this.createAdvancedSubjectModal.get(0).querySelector("#createAdvSubject")
                .addEventListener("click", this.editSubject.bind(this, subject))
        } else {
            this.subjectModalPrer = []
            this.createAdvancedSubjectModal.get(0).querySelector("#createAdvSubject")
                .addEventListener("click", this.createAdvancedSubject.bind(this))

        }
    }

    // Subject related
    displaySubject(subject) {
        let fadeIn = [
            {opacity: 0},
            {opacity: 1}
        ]

        let subjectInfo = document.createElement("tr")
        subjectInfo.setAttribute("id", "custom-" + subject.sigla)
        let subjectRow = document.createElement("td")
        subjectRow.setAttribute("scope", "row")
        subjectRow.textContent = subject.sigla
        let subjectNameCol = document.createElement("td")
            subjectNameCol.textContent = subject.name
        let subjectCreditsCol = document.createElement("td")
            subjectCreditsCol.textContent = subject.getUSMCredits() + " USM | " + subject.getSCTCredits() + " SCT"
        let subjectState = document.createElement("td")
        subjectState.setAttribute("id", "state")
        if (subject.selected) {
            subjectState.textContent = "Seleccionado"
        } else {
            subjectState.textContent = "No seleccionado"
        }
        let subjectPrer = document.createElement("td")
        let i = 0
        subject.prer.forEach(prer => {
            if (i = 0) {
                subjectPrer.textContent = + prer
                i = 1
            } else
                subjectPrer.textContent += " " + prer
        })
        if (subjectPrer.textContent.length === 0)
            subjectPrer.textContent = "Sin prerrequisitos"

        let actionsCol = document.createElement("td")
        actionsCol.classList.add("py-0")
        let actions = document.createElement("div")
        actions.classList.add("btn-group")
        actions.setAttribute("role", "group")
        let selectButton = document.createElement("button")
        selectButton.setAttribute("id", "sel-" + subject.sigla)
        selectButton.setAttribute("type", "button")
        selectButton.classList.add("btn", "btn-secondary")
        selectButton.textContent = "Seleccionar"
        selectButton.addEventListener("click", e => {
            subject.selectRamo()
            this.updateState(subject)
        })
        if(subject.selected)
            selectButton.textContent = "Deseleccionar"
        actions.appendChild(selectButton)
        if (subject.isCustom) {
            let deleteButton = document.createElement("button")
            deleteButton.setAttribute("id", "delete-" + subject.sigla)
            deleteButton.classList.add("btn", "btn-danger")
            deleteButton.textContent = "Eliminar"
            deleteButton.addEventListener("click", e => {this.deleteSubject(subject)})
            actions.appendChild(deleteButton)
        }
        actionsCol.appendChild(actions)

        subjectInfo.append(subjectRow)
        subjectInfo.append(subjectNameCol)
        subjectInfo.append(subjectCreditsCol)
        subjectInfo.append(subjectState)
        subjectInfo.append(subjectPrer)
        subjectInfo.append(actionsCol)
        subjectInfo.childNodes.forEach(x => x.classList.add("align-middle"))
        if (subjectInfo.animate)
            subjectInfo.animate(fadeIn, 500)

        this.subjectTable.append(subjectInfo)
        this.tableList[subject.sigla] = subjectInfo


    }

    unDisplaySubject(subject) {
        this.subjectTable.querySelector("#custom-" + subject.sigla).remove()
    }

    updateState(subject) {
        let subjectState = this.tableList[subject.sigla].querySelector("#state")
        let selectable = true
        subjectState.textContent = "No seleccionado"
        if (subject.selected) {
            subjectState.textContent = "Seleccionado"
        //} else if () {
        } else {
            Object.keys(this.semesterManager.selectedPerSemester).forEach(semester => {
                if (semester !== this.semesterManager.semester) {
                    let found = this.semesterManager.selectedPerSemester[semester].indexOf(subject)
                    if (found !== -1){
                        if (semester < this.semesterManager.semester)
                            selectable = false
                        subjectState.textContent = "Seleccionado en S" + semester
                    }
                }
            })
        }

        let subjectSelButton = this.tableList[subject.sigla].querySelector("#sel-" + subject.sigla)
        if (selectable) {
            subjectSelButton.removeAttribute("disabled")
            if (subject.isCustom) {
                // Do something if necessary
            }
        } else {
            subjectSelButton.setAttribute("disabled", "disabled")
            if (subject.isCustom) {
                // Do something if necessary
            }
        }

    }

    semesterChange() {
        this.subjectList.forEach(sigla => {
            this.updateState(this.semesterManager.malla.getSubject(sigla))
        })
    }

    createSubject(modal) {
        let name = modal.querySelector("#custom-name").value
        let sigla = modal.querySelector("#custom-sigla").value
        let creditsUSM = parseInt(modal.querySelector("#custom-credits-USM").value)
        let creditsSCT = parseInt(modal.querySelector("#custom-credits-SCT").value)
        if (isNaN(creditsSCT))
            creditsSCT = 0
        let prer = []


        let sectorName = this.defaultSector[0]

        let subject = new SelectableRamo(name, sigla, creditsUSM, sectorName, prer, this.semesterManager.malla.RAMOID++, this.semesterManager.malla, creditsSCT ,true)
        this.subjectList.push(subject.sigla)
        this.semesterManager.malla.addSubject(subject)
        this.displaySubject(subject)
    }

    createAdvancedSubject() {
        let modal = this.createAdvancedSubjectModal.get(0)
        let name = modal.querySelector("#custom-namea").value
        let sigla = modal.querySelector("#custom-siglaa").value
        let creditsUSM = parseInt(modal.querySelector("#custom-creditsa-USM").value)
        let creditsSCT = parseInt(modal.querySelector("#custom-creditsa-SCT").value)
        let sectorName = modal.querySelector('#sectorChooser').value;
        let prer = []
        modal.querySelector("#prerList").querySelectorAll("li").forEach(item => {
            prer.push(item.getAttribute("id").slice(4))
        })
        console.log(prer)
        let subject = new SelectableRamo(name, sigla, creditsUSM, sectorName, prer, this.semesterManager.malla.RAMOID++, this.semesterManager.malla, creditsSCT ,true)
        this.subjectList.push(subject.sigla)
        this.semesterManager.malla.addSubject(subject)
        this.createAdvancedSubjectModal.modal("hide")
        this.displaySubject(subject)
    }

    editSubject(subject) {

    }

    deleteSubject(subject) { // Remove subjects even if selected on previous semesters
        if (subject.selected)
            subject.selectRamo()
        this.semesterManager.removeSubjectOutsideSemester(subject)
        this.unDisplaySubject(subject)
        let i = this.subjectList.indexOf(subject.sigla)
        if (i > -1) {
            this.subjectList.splice(i, 1);
        }
    }

    loadSubjects() {return {}}

    addPrerToModal(e){
        console.log(e.target)
        let selectedOption = e.target.selectedOptions[0]
        if (selectedOption.value !== 0) {
            let arText = selectedOption.textContent.split(" | ")
            this.subjectModalPrer.push(selectedOption.value)
            selectedOption.setAttribute("disabled", "disabled")
            let prer = document.createElement("li")
            prer.setAttribute("id", "pre-" + arText[1])
            prer.classList.add("list-group-item", "d-flex", "align-items-center", "pr-0", "py-0")
            let text = document.createElement("div")
            text.classList.add("flex-grow-1")
            text.textContent = arText.reverse().join(" | ")
            let delBtn = document.createElement("button")
            delBtn.classList.add("btn", "btn-danger")
            delBtn.setAttribute("type", "button")
            delBtn.textContent = "Quitar"
            prer.append(text)
            prer.append(delBtn)

            this.createAdvancedSubjectModal.get(0).querySelector("#prerList").append(prer)
        }


    }

    // Category related
    fillCategories() {
        Object.keys(this.categories).forEach(category => {
            this.displayCategory(category)
        })
    }

    createCategory() {
        let modal = this.categoryModal.get(0)
        let name = modal.querySelector("#cat-name").value
        let shortName = modal.querySelector("#small-cat-name").value
        let color = modal.querySelector("#cat-color").value
        this.categories[shortName] = [color, name]
        this.categoryModal.modal("hide")
        this.displayCategory(shortName)
    }

    editCategory() {

    }

    setUpCategoryModal(e, isEdit=false, category="Custom") {
        if (isEdit) {
            this.categoryModal.get(0).querySelector("#sectorDoneButton")
                .addEventListener("click", this.editCategory.bind(this, category))
        } else {
            this.categoryModal.get(0).querySelector("#sectorDoneButton")
                .addEventListener("click", this.createCategory.bind(this))
        }
    }

    displayCategory(categorySN) { // ShortName
        //<button class="list-group-item list-group-item-action text-white sector" type="button" onclick="editSector(&quot;PC&quot;)" id="sec-PC" style="background-color: rgb(0, 131, 143); filter: brightness(100%);">Plan Común</button>
        let category = document.createElement("button")
        category.classList.add("list-group-item",
            "list-group-item-action",
            "sector")

        let color = this.categories[categorySN][0]
        if (this.needsWhiteText(color))
            category.classList.add("text-white")

        category.setAttribute("type", "button")
        category.setAttribute("id", "cat-" + categorySN)
        category.style.backgroundColor = color
        category.textContent = this.categories[categorySN][1]
        this.categoryManager.append(category)
    }


    loadCategories() {
        // for now
        this.categories = this.semesterManager.malla.sectors
        this.categoryList = Object.keys(this.categories)
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