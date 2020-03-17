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

function contactar() {
    window.location = "mailto:cpaulang@alumnos.inf.utfsm.cl";
    $('#contacto').modal('hide')
}

function render(props) {
    return function(tok, i) {
        return (i % 2) ? props[tok] : tok;
    };
}
var relaPath = './'
let prioridadi = document.URL.includes('prioridad')
let personalizar = document.URL.includes('personalizar')
if (prioridadi || personalizar) {
    relaPath = '../'
}

$(function() {
    // obtener vistas
    let includes = $('[data-include]');
    jQuery.each(includes, function(){
      let file = relaPath + 'views/' + $(this).data('include') + '.html';
      $(this).load(file);
    });
    // No encuentra los elementos si no espero
    // llenar carreras
    $.getJSON( relaPath + '/data/carreras.json', function(data) {
                    if (!(prioridadi|personalizar)) {
                        d3.select('#goToCalculator').attr('href', './prioridad/?m=' + current_malla)
                        d3.select('#goToGenerator').attr('href', './personalizar/?m=' + current_malla)
                    } else if (prioridadi) {
                        document.getElementById('goToCalculator').classList.add('active')
                        d3.select('#goToHome').attr('href', '../?m=' + current_malla)
                        d3.select('#goToGenerator').attr('href', '../personalizar/?m=' + current_malla)
                    } else {
                        document.getElementById('goToGenerator').classList.add('active')
                        d3.select('#goToHome').attr('href', '../?m=' + current_malla)
                        d3.select('#goToCalculator').attr('href', '../prioridad/?m=' + current_malla)
                    }
        $.each(data, function(index, value) {
            let tabTpl1 = $('script[data-template="tab-template1"]').text().split(/\${(.+?)}/g);
            let tabTpl2 = $('script[data-template="tab-template2"]').text().split(/\${(.+?)}/g);
            value = [value];
            value.forEach(carrera => {
                if (carrera['Link'] == current_malla)
                $('.carrera').text(carrera['Nombre'])
                
            });
            $('#carreras1-nav').append(value.map(function (value) {
                return tabTpl1.map(render(value)).join('');
            }));
            $('#carreras2-nav').append(value.map(function (value) {
                return tabTpl2.map(render(value)).join('');
            }));
        });
        
    });
});

function waitForElement(selector) {
    return new Promise(function(resolve, reject) {
      var element = document.querySelector(selector);
  
      if(element) {
        resolve(element);
        return;
      }
  
      var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          var nodes = Array.from(mutation.addedNodes);
          for(var node of nodes) {
            if(node.matches && node.matches(selector)) {
              observer.disconnect();
              resolve(node);
              return;
            }
          };
        });
      });
  
      observer.observe(document.documentElement, { childList: true, subtree: true });
    });
  }