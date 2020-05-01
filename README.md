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
![Imgur](https://i.imgur.com/b92qXHk.png)
- Se pueden visualizar los creditos según el Sistema USM o según el Sistema de creditos transferibles (SCT).
- ***Dark Mode*** automatico segun las preferencias del SO.
![Imgur](https://i.imgur.com/lDTKZol.png)

# Caracteristicas de la malla

- Calcular tu prioridad
![Gif demo de calculo de prioridad](https://media.giphy.com/media/9FZo5ua3aCmXij4xZ5/giphy.gif)
- Crear una malla personal que se adecue a tu desdicha recorrida en la Universidad
![Gif demo de la malla personalidada](https://media.giphy.com/media/QK448lB7juUF0ftL7g/giphy.gif)  
(Tal desdicha tiene que ser menor a *20* semestres) (Si se necesitan mas semestres puedes contactarme. @CsarMan)

- Agregar ramos que no se encuentren en la malla oficial pero que hayas cursado.
![Imagen de ventana para agregar un Ramo](https://i.imgur.com/NnCAaP2.png)
![Imagen de tabla de ramos que están fuera de la malla](https://i.imgur.com/li2TRD7.png)

# TODO
* [x] Almacenar los ramos aprobados en caché
* [x] Generalizar el `JSON`, en lo posible agregar compatibilidad con `CSV`
* [ ] **Comentar código, limpiarlo.**
* [ ] Fix bugs
* [X] Hacer pagina más usable en moviles
    * [X] Prioridad
	* [X] Malla personal
	* [X] Malla interactiva
* [ ] Facilitar creacion y modificación de mallas oficiales
* [ ] **Refactorisar codigo**

## Agregar o cambiar una malla

Hay varias formas de agregar o cambiar una malla, por eso mostrare tres formas simples que no requieren mucho conocimiento de codigo para realizarlas. La primera, que es por medio del propio sitio. La segunda es similar a la primera pero hace uso de github. Por último, la tercera consta de realizar el proceso *a mano*.

*Nota*: Es recomendable (por no decir necesario) hacer el proceso en un computador.

### Usando la malla interactiva

Primero que todo creamos una malla usando la [generadora de mallas](https://csarman.github.io/malla-interactiva/prioridad). Luego completar el siguiente [formulario](https://docs.google.com/forms/d/e/1FAIpQLSc7im-tmzXlWhHYb5XmRhIMGTLQ5GUZj4haRq8iSECYsuXU8A/viewform?usp=sf_link) (Incluye instruccionas para usar la generadora en caso que uno se complique)


### Usando la malla interactiva y Github

Primero que todo creamos una malla usando la [generadora de mallas](https://csarman.github.io/malla-interactiva/prioridad). Luego, en el fondo de la página hacer click en "Agregar/Actualizar malla". La página les mostrará dos estructuras en `.json`. ([Explicación de estas aqui](#A-mano))  
Una vez llegado aquí necesitas tener una cuenta en github para seguir. Si ya la tienes, te logeas y en la página del codigo haces click en "fork", esperas unos segundos y ya tienes una versión propia de la malla. Ahora te diriges a la carpeta data y ahí puedes hacer dos cosas:  
- Subir archivos listos
- copiar y pegar codigo sobrescribiendo archivos antiguos.

Mostrare el primero...  
Has click en *Upload Files* y en la ventana que te aparece carga los archivos descargados de la malla interactiva. Por último, checkea la opcion que mencione el pull request abajo y sube los archivos. Ahora solo espera a que revise la malla cambiada o agregada y estará pronto en la malla interactiva lista para calcular la prioridad! ~~(Esto puede no ser instantaneo y tome su tiempo)~~

### *A mano*

Para aportar, en la carpeta `data` se tienen dos ficheros por cada
carrera, estos son  `data_CARR.json` y `colors_CARR.json`. Se deben
crear ambos jsons (se pueden usar los existentes como base) para agregar
una carrera a la malla interactiva.

Un ejemplo de un semestre en `data_CARR.json` sería:

```json
"s2": [["Química y Sociedad", "QUI-010", 3, "PC"],
		["Matemáticas II", "MAT-022", 5, "PC", ["MAT-021"]],
		["Física General I", "FIS-110", 3, "PC", ["MAT-021", "FIS-100"]],
		["Introducción a la Ingeniería", "IWG-101", 2, "TIN"],
		["Humanístico II", "HRW-133", 1, "HUM"],
		["Educación Física II", "DEW-101", 1, "HUM", ["DEW-100"]]
	]
```
Para modificar el JSON se debe saber lo siguiente:

`s2` Corresponde al semestre, en este caso, Semestre II. Es una lista con 5 objetos:
1. *Ramo*: El nombre completo del ramo.
2. *Sigla*: Sigla del ramo. Este campo es importante, ya que con éstos se calculan los prerrequisitos.
3. *Créditos*: Entero, la cantidad de créditos.
4. *Sector*: Sector del ramo al que pertenece (por ejemplo, *PC*: Plan Común), se deben agregar ó editar en el json `colors_CARR.json`.
5. *Prerrequisitos*: Una lista de strings que contiene los prerrequisitos del ramo. Es **importante**
que la sigla ya exista, de lo contrario podría fallar. Esta lista es opcional.

El json `colors_CARR.json` debe tener el formato

```json
{
	"SIGLA": ["COLOR", "pequeña descripcion"],
}
```

Ejemplo:

```json
{
	"PC": ["#00838F", "Plan Común"],
	...
}
```

## Probar malla
Para probar la malla, existen tres metodos:

### Usando python (preferido)
Lo ideal sería probarlo usando python, ya que permite levantar un mini servidor http lo que facilita la carga
para el navegador. Para esto, se tiene que abrir una terminal, ir al directorio principal de la malla (ramos/)
y ejecutar lo siguiente:

* Si tiene Python 2 (el usado en la universidad hasta hace poco): `python -m SimpleHTTPServer`
* Si tiene Python 3 (el actual): `python -m http.server`

Independiente de la version, una vez ejecutado la linea, despues se debe abrir un navegador
e ir a la dirección http://localhost:8000 y ahí debería ver la malla.
Dependiendo de la malla a probar, deberá navegar agregando al final de la url `?m=CARR`. Por ejemplo, 
para abrir `data_INF.json` debería quedar algo como `http://localhost:8000/index.html?m=INF`.

### Usando Firefox
Se tiene que abrir el `index.html` con **Firefox** (debido a que los otros navegadores tienen
desactivada la lectura de archivos locales por defecto), y al final de la URL agregar `?m=CARR`. Por ejemplo, 
para abrir `data_INF.json` debería quedar algo como `index.html?m=INF`.

Se aceptan Pull Requests para agregar carreras.

### Usando Browser-sync
Con *NPM* instalado en el equipo, ejecute desde una terminal `npm install -g browser-sync` si no lo tiene instalado. Completado el paso anterior, ejecute `browser-sync -w` desde la carpeta raíz del repositorio y tendrá en su explorador favorito una versión local de la página. La direccion por defecto es `http://localhost:3000`

Con esto la pagina se actualizará cada vez que guarde un archivo. Si su explorador tiene problemas, abra *Firefox* y copie y pegue la dirección de la página.

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