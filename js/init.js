/**
 * Obtencion de archivos JS de manera paralela y carga sincronica
 */
//loadjs(['https://kit.fontawesome.com/bf671ef02a.js', 'https://cdnjs.cloudflare.com/ajax/libs/d3/4.13.0/d3.min.js', '/js/ramos.js', '/js/canvas.js'], 'init');
/*loadjs.ready('init', {
    success: function() { console.log("Recursos cargados") },
    error: function(depsNotFound) {
        Swal.fire(
            "Fallo al cargar",
            "Tuvimos problemas al cargar algunas dependencias... el sitio se recargara en 5 segundos.",
            "error"
        );
        setTimeout(function(){
            location.reload();
        }, 5000);
    },
});*/

let vh = window.innerHeight * 0.01;
// Then we set the value in the --vh custom property to the root of the document
document.documentElement.style.setProperty('--vh', `${vh}px`);
window.addEventListener('resize', () => {
    // We execute the same script as before
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
});

function contactar() {
    window.location = "mailto:cpaulang@alumnos.inf.utfsm.cl?subject=Malla Interactiva";
    $('#contacto').modal('hide')
}

function render(props) {
    return function(tok, i) {
        return (i % 2) ? props[tok] : tok;
    };
}
let relaPath = './'
let prioridad = document.URL.includes('prioridad')
let personalizar = document.URL.includes('personalizar')
let mallaPersonal = document.URL.includes("malla")
let texts = "Malla"
if (mallaPersonal)
    texts = "Personal"
else if (prioridad)
    texts = "Prioridad"
else if (personalizar)
    texts = "Personalizar"

if (texts !== "Malla") {
    relaPath = '../'
}
let params = new URLSearchParams(window.location.search)

let carr =  params.get('m')
if (!carr)
    carr = 'INF'
let sct = false
if (params.get('SCT') === "true")
    sct = true

document.addEventListener("DOMContentLoaded",() => loadViews())

function loadViews() {
    // obtener vistas
    let includes = document.querySelectorAll('[data-include]')
    let promises = []
    let welcomeTexts = {}
    includes.forEach(include => {
        let fileURL = relaPath + 'views/' + include.attributes['data-include'].nodeValue + '.html';
        promises.push(fetch(fileURL).then(response => response.text())
            .then(data => {
                include.insertAdjacentHTML("afterbegin", data)
            }))
    })
    let fileURL = relaPath + "data/welcomeTexts.json"
    promises.push(fetch(fileURL).then(response => response.json()))
    Promise.all(promises).then((datas) => {
        welcomeTexts = datas[2][texts]
        if (mallaPersonal) {

        } else if (!(prioridad|personalizar)) {
            d3.select('#goToCalculator').attr('href', './prioridad/?m=' + carr);
            d3.select('#goToGenerator').attr('href', './personalizar/?m=' + carr);
        } else if (prioridad) {
            document.getElementById('goToCalculator').classList.add('active');
            d3.select('#goToHome').attr('href', '../?m=' + carr);
            d3.select('#goToGenerator').attr('href', '../personalizar/?m=' + carr);
        } else {
            document.getElementById('goToGenerator').classList.add('active');
            d3.select('#goToHome').attr('href', '../?m=' + carr);
            d3.select('#goToCalculator').attr('href', '../prioridad/?m=' + carr);
        }
        return fetch(relaPath + '/data/carreras.json')
    }).then(response => response.json()).then((careers,) => {
        let tabTpl1 = document.querySelector('script[data-template="tab-template1"]').text.split(/\${(.+?)}/g);
        let tabTpl2 = document.querySelector('script[data-template="tab-template2"]').text.split(/\${(.+?)}/g);
        careers.forEach(careers => {
            if (careers['Link'] === carr) {
                welcomeTexts["welcomeTitle"] = welcomeTexts["welcomeTitle"].replace("CARRERA", careers['Nombre'])
                $('.carrera').text(careers['Nombre'])
            }
        });
        $('#carreras1-nav').append(careers.map(function (values) {
            return tabTpl1.map(render(values)).join('');
        }));
        $('#carreras2-nav').append(careers.map(function (values) {
            return tabTpl2.map(render(values)).join('');
        }));
        document.querySelector(".overlay-content h3").textContent = welcomeTexts["welcomeTitle"]
        document.querySelector(".overlay-content h5").textContent = welcomeTexts["welcomeDesc"]

    })
}

function removePopUp() {
    d3.select("body").style("overflow", "initial")
    d3.selectAll(".overlay").style("-webkit-backdrop-filter", "blur(0px) contrast(100%)");
    d3.selectAll(".overlay").style("backdrop-filter", "blur(0px) contrast(100%)");
    d3.select(".overlay-content").transition().style("filter", "opacity(0)")
    d3.select(".overlay").transition().style("filter", "opacity(0)").on('end', function() {
        d3.select(this).remove();
    })
}

  $(function () {
      if (sct) {
          document.getElementById("creditsExample").textContent = "Créditos SCT";
          document.getElementById("creditsNumberExample").textContent = "2";
      }


      let malla = null
      if (prioridad) {
          malla = new Malla(sct, SelectableRamo, 0.804, 1, Priorix, "#priorix")
          malla.enableCreditsSystem()

      } else if (personalizar) {
          malla = new Malla(sct, SelectableRamo, 0.804, 1, SemesterManager)


          document.getElementById("#reset").addEventListener("click", () => malla.semesterManager.cleanSemester())
          document.getElementById("#resetc").addEventListener("click", () => malla.semesterManager.cleanAll())
      } else  if (mallaPersonal) {
          malla = new Malla((sct))
          document.getElementById("cleanApprovedButton").addEventListener("click",() => malla.cleanSubjects())
      } else {
          malla = new Malla(sct);
          malla.enableCreditsStats()
          malla.enableCreditsSystem()
          malla.enableSave()
          document.getElementById("cleanApprovedButton").addEventListener("click", () => malla.cleanSubjects())

      }

      let drawnMalla = malla.setCareer(carr, relaPath).then((val) => {
          return malla.drawMalla(".canvas")
      });
      drawnMalla.then(() => {
          malla.updateStats()
          malla.displayCreditSystem()
          malla.showColorDescriptions(".color-description")
          malla.enablePrerCheck()
          malla.loadApproved()
      })
  });

function changeCreditsSystem() {
    let key = 'SCT'
    let value = 'true'
    const params = new URLSearchParams(window.location.search);
    if (params.has(key)) {
        value = !('true' === params.get(key))
    }
    key = encodeURI(key); value = encodeURI(value);
    var kvp = document.location.search.substr(1).split('&');

    var i=kvp.length; var x; while(i--)
{
    x = kvp[i].split('=');

    if (x[0]===key)
    {
        x[1] = value;
        kvp[i] = x.join('=');
        break;
    }
}

    if(i<0) {kvp[kvp.length] = [key,value].join('=');}

    //this will reload the page, it's likely better to store this until finished
    document.location.search = kvp.join('&');
}