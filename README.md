# Ramos SVG
Generador de la malla que permitirá
visualizar los ramos aprobados.

# Índice
1. [Novedades](#¡Novedades!)  
2. [Caracteristicas de la malla](#Caracteristicas-de-la-malla)  
3. [TODO](#TODO)  
4. [Agregar o cambiar una malla](#Agregar-o-cambiar-una-malla)  
5. [Probar malla](#Probar-malla)  
6. [Agradecimientos](#Gracias)    
# ¡Novedades!
- Ahora se pueden agregar y cambiar los pre-requisitos de los ramos!
- Se pueden visualizar los créditos según el Sistema USM o según el Sistema de creditos transferibles (SCT).
- ***Dark Mode*** automático según las preferencias del SO.

# Características de la malla

- Selecciona asignaturas para aprobarlas, a medida que vayas aprobando más ramos, podrás ver que ramos
se desbloquean.
- Calcular tu prioridad  
![Gif demo de calculo de prioridad](https://media.giphy.com/media/9FZo5ua3aCmXij4xZ5/giphy.gif)
- Crear una malla personal que se adecue a tu desdicha recorrida en la Universidad
![Gif demo de la malla personalidada](https://media.giphy.com/media/QK448lB7juUF0ftL7g/giphy.gif)  

- Agregar ramos que no se encuentren en la malla oficial pero que hayas cursado.

# TODO
* [ ] **Comentar código, limpiarlo.** (Ahora hay más comentarios, pero falta aún)
* [ ] Fix bugs
* [X] Hacer página más usable en moviles
    * [X] Prioridad
	* [X] Malla personal
	* [X] Malla interactiva
* [X] Facilitar creación y modificación de mallas oficiales
* [X] **Refactorizar código**

## Agregar o cambiar una malla

Hay varias formas de agregar o cambiar una malla, por eso mostrare tres formas simples que no requieren mucho conocimiento de codigo para realizarlas. La primera, que es por medio del propio sitio. La segunda es similar a la primera pero hace uso de github. Por último, la tercera consta de realizar el proceso *a mano*.

*Nota*: Es recomendable (por no decir necesario) hacer el proceso en un computador.

### Usando la malla interactiva

Primero que todo creamos una malla usando la [generadora de mallas](https://csarman.github.io/malla-interactiva/prioridad). Luego completar el siguiente [formulario](https://docs.google.com/forms/d/e/1FAIpQLSc7im-tmzXlWhHYb5XmRhIMGTLQ5GUZj4haRq8iSECYsuXU8A/viewform?usp=sf_link) (Incluye instruccionas para usar la generadora en caso que uno se complique)


### Usando la malla interactiva y Github

Primero que todo creamos una malla usando la [generadora de mallas](https://csarman.github.io/malla-interactiva/prioridad). Luego, en el fondo de la página hacer click en "Agregar/Actualizar malla". La página les mostrará dos estructuras en `.json`. ([Explicación de estas aqui](#A-mano))  
Una vez llegado aquí necesitas tener una cuenta en github para seguir. Si ya la tienes, te logeas y en la página del codigo haces click en "fork", esperas unos segundos y ya tienes una versión propia de la malla. Ahora te diriges a la carpeta data y ahí puedes hacer dos cosas:  
- Subir archivos listos
- copiar y pegar código sobrescribiendo archivos antiguos.

Mostrare el primero...  
Has click en *Upload Files* y en la ventana que te aparece carga los archivos descargados de la malla interactiva. Por último, checkea la opcion que mencione el pull request abajo y sube los archivos. Ahora solo espera a que revise la malla cambiada o agregada y estará pronto en la malla interactiva lista para calcular la prioridad! ~~(Esto puede no ser instantaneo y tome su tiempo)~~

### *A mano*

Para aportar, en la carpeta `data` se tienen dos ficheros por cada
carrera, estos son  `data_CARR.json` y `colors_CARR.json`. Se deben
crear ambos jsons (se pueden usar los existentes como base) para agregar
una carrera a la malla interactiva.

Un ejemplo de un semestre en `data_CARR.json` sería:

```json
{
	"s2": [
		["Química y Sociedad","QUI-010",3,0,"PC",[],""],
		["Matemáticas II","MAT-022",5,0,"PC",["MAT-021"],""],
		["Física General I","FIS-110",5,0,"PC",["MAT-021","FIS-100"],""],
		["Introducción a la Ingeniería","IWG-101",2,0,"TIN",[],""],
		["Humanístico II","HRW-133",2,0,"HUM",[],""],
		["Educación Física II","DEW-101",1,0,"HUM",["DEW-100"],""]
	]
}
```
Para modificar el JSON se debe saber lo siguiente:

`s2` Corresponde al semestre, en este caso, Semestre II. Es una lista donde cada ramo tiene 7 items:
1. *Ramo*: El nombre completo del ramo.
2. *Sigla*: Sigla del ramo. Este campo es importante, ya que con éstos se calculan los prerrequisitos.
3. *Créditos USM*: Entero, la cantidad de créditos USM.
4. *Créditos SCT*: Entero, la cantidad de créditos SCT. Si su valor es `0`, se calcula
basándonos en los créditos USM
5. *Categoría*: Categoría del ramo al que pertenece (por ejemplo, *PC*: Plan Común), se deben agregar ó editar en el json `colors_CARR.json`.
6. *Prerrequisitos*: Una lista de strings que contiene los prerrequisitos del ramo. Es **importante**
que la sigla ya exista, de lo contrario podría fallar. Esta lista es opcional.
7. *Indicador Par o Impar*: Puede tener el valor de `"P"`, `"I"`, `"A"` o `""`. Indica
si el ramo se dicta en un semestre **P**ar, **I**mpar, o en **A**mbos. `""`  es para cuando no esta definido



El json `colors_CARR.json` debe tener el formato

```json
{
	"SIGLA": ["COLOR", "pequeña descripcion"]
}
```
Para elegir un buen color, puedes buscar Color Picker en [Google](https://www.google.com/search?client=safari&rls=en&q=Color+Picker&ie=UTF-8&oe=UTF-8)  
Ejemplo:

```json
{
	"PC": ["#00838F", "Plan Común"],
	...
}
```

## Probar malla
Para probar la malla, existen los siguientes métodos:

### Usando Docker
Los únicos requisitos son el tener `docker`, `podman` o cualquier otro _container manager_.

Primero debemos clonar el repo y buildear la imagen mediante:
* `docker build -t malla-interactiva .`

dentro del mismo directorio del repositorio.

Para correr la imagen hacemos:

* `docker run -d -p 8080:80 --name mallas malla-interactiva`

Y luego podemos visitar nuestra malla en [http://localhost:8080/](http://localhost:8080/).

Para detener la instancia del container y eliminarla a la vez podemos ejecutar:

* `docker rm --force mallas`

o `docker stop mallas` para solo detenerla.

### Usando Python (preferido)
Lo ideal sería probarlo usando python, ya que permite levantar un mini servidor http lo que facilita la carga
para el navegador. Para esto, se tiene que abrir una terminal, ir al directorio principal de la malla (ramos/)
y ejecutar lo siguiente:

* Si tiene Python 2 (el usado en la universidad hasta hace poco): `python -m SimpleHTTPServer`
* Si tiene Python 3 (el actual): `python -m http.server`

Independiente de la version, una vez ejecutado la línea, después se debe abrir un navegador
e ir a la dirección http://localhost:8000 y ahí debería ver la malla.
Dependiendo de la malla a probar, deberá navegar agregando al final de la url `?m=CARR`. Por ejemplo,
para abrir `data_INF.json` debería quedar algo como `http://localhost:8000/index.html?m=INF`.

### Usando Firefox
Se tiene que abrir el `index.html` con **Firefox** (debido a que los otros navegadores tienen
desactivada la lectura de archivos locales por defecto), y al final de la URL agregar `?m=CARR`. Por ejemplo,
para abrir `data_INF.json` debería quedar algo como `index.html?m=INF`.

Se aceptan Pull Requests para agregar carreras.

### Usando Browser-sync
Con *NPM* instalado en el equipo, ejecute desde una terminal
`npm install -g browser-sync` si no lo tiene instalado.
 Completado el paso anterior, ejecute `browser-sync -w` desde
  la carpeta raíz del repositorio y tendrá en su explorador favorito una
   versión local de la página. La dirección por defecto es `http://localhost:3000`

Con esto la página se actualizará cada vez que guarde un archivo. Si su explorador tiene problemas, abra *Firefox* y copie y pegue la dirección de la página.

---
# Gracias

Se agradece especialmente a:

* [Sebastián Aedo](https://github.com/etra0) como creador original de la malla interactiva. [Malla Original](https://github.com/etra0/ramos)
* CEE de ELO por agregar su respectiva malla
* [Manizuca](https://github.com/Manizuca) por agregar la malla de TEL
* Fernando Cardenas por agregar la malla de ICOM
* Abel Morgenstern  por agregar la malla de CIV
* Bernardo Recabarren por agregar la malla de MAT
* Alois Bellenger Herrera por actualizar la malla de ICQ
* Josué Venegas por agregar la malla de ICM
