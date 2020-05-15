class MallaEditor {
    constructor(semesterManager, customSubjectLocation, categoryLocation = false) {
        this.semesterManager = semesterManager
        this.customManager = document.querySelector(customSubjectLocation)
        if (categoryLocation)
            this.categoryManager = document.querySelector(categoryLocation)
        else
            this.categoryManager = null
        this.subjectList = []
        this.categoryList = []
        this.defaultSector = {}
        let creatorModalId = this.customManager.getElementsByClassName("button-create-subject")[0]
            .getAttribute("data-target")
        let modal = document.querySelector(creatorModalId)
        modal.querySelector("#createSubject")
            .addEventListener("click", e => {
                this.createSubject(modal)
            })
    }

    // Subject related
    displaySubject() {

    }

    createSubject(modal) {
        let name = modal.querySelector("custom-name")
        let sigla = modal.querySelector("custom-sigla")
        let creditsUSM = parseInt(modal.querySelector("custom-credits-USM"))
        let creditsSCT = parseInt(modal.querySelector("custom-credits-SCT"))

        let subject = new SelectableRamo(name, sigla, creditsUSM, )

    }

    createAdvancedSubject() {}

    deleteSubject() {}

    loadSubjects() {}


    // Category related
    fillCategories() {
        let customCategories = this.loadCategories()
        let legalCategories = this.semesterManager.malla.sectors
    }

    loadCategories() {

    }
}