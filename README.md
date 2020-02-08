# M06-UF3 Minesweeper
https://gracia.sallenet.org/mod/assign/view.php?id=123234

## Guía para el alumno
El alumno debe de entregar la práctica enunciada en este documento antes del cierre programado en el calendario.

Los entregables son: 

-	Carpeta de la práctica
 > ICC0006-UF3-PR01-“username”<br>
 > “username” = nombre de usuario del alumno en la plataforma<br>
 > Ejemplo: ICC0006-UF3-PR01-garciafloresraul

-	La carpeta del ejercicio contendrá los ficheros necesarios del ejercicio correspondiente.

Se debe realizar la práctica por parejas.

Si no se obtiene un mínimo de un 4 sobre 10 en esta entrega, no se podrá hacer media con el examen y se deberá recuperar la práctica en extraordinaria.
 
## Ejercicio #1 Buscaminas
Crea un juego de buscaminas, para jugar un solo jugador. Para ello sigue las siguientes instrucciones:

-	Crea un botón para iniciar el juego y con un input numérico donde el usuario indicará cuantas minas existirán.
- -  (`+0,5p`) Este input será validado con expresión regular con JS.  
- Cuando se clique al botón de inicio se deberá:
  - (`+0,25p`) Crear el tablero 9x9, para mostrar al usuario.
  - (`+0,25p`) Crear un array multidimensional 9x9, para guardar el contenido de cada casilla.
    -	Cada casilla será un objeto con 2 propiedades:
      -	“Valor”: indica el valor de la casilla, puede ser una mina o un número.
      - “Mostrada”: indica con un boolean si la casilla está mostrada u oculta. Por defecto todas las casillas empiezan ocultas así que todas tendrán un valor de “false”.
  -	(`+0,5p`) Se añadirán las minas (tantas como haya indicado el jugador) en el array multidimensional. 
    -	Se guardará el texto “M” para indicar que hay una mina en la posición.
  -	(`+0,5p`) Se recorrerá el array multidimensional para poner los números pertinentes en cada casilla.
    -	Una casilla que no tenga mina deberá tener un número igual a la cantidad de minas que tenga a su alrededor (en sus 8 casillas adyacentes).
  -	(`+0,25p`) Se añadirá un evento click al div principal que contenga todo el tablero.
  -	(`+0,75p`) Con la delegación de eventos, comprueba qué casilla se ha clicado para poder hacer la acción correspondiente.
    -	(`+0,5p`) Cuando el jugador clica a una casilla, se deberá mostrar el contenido de la misma posición del array multidimensional.
    -	(`+0,25p`) Si es una mina, el juego estará perdido, no pasará nada al clicar a ninguna otra casilla del tablero.
    -	(`+0,25p`) Si es un número, se mostrará, y se guardará en su propiedad “mostrada” el valor “true”.
      -	(`+0,25p`) Después se comprobará si todas las casillas menos las minas están mostradas, si es así, se habrá ganado el juego. 
        -	(`+0,25p`) Al ganar, tampoco pasará nada al clicar a otra casilla del tablero.
        -	(`+0,5p`) Y se guardará en una posición de un array, un objeto con el tiempo transcurrido desde el inicio del juego, y cuando (día, mes, año, hora, minuto y segundo) se acabó la partida, en el localStorage.
          -	Este array no se debe sobrescribir para cada partida, sino que se debe mantener y añadir una posición más para cada partida ganada.

La aplicación debe funcionar correctamente para contar estos los siguientes puntos:

-	(`+1p`) Usa ESLint para comprobar la calidad del código de tu aplicación, y mejorarlo si salen errores.
-	(`+1p`) Usa jQuery para realizar las interacciones con el DOM.
-	(`+1p`) Usa NodeJS y NPM con Webpack y Babel para crear los ficheros optimizados de tu aplicación.
-	(`+1p`) Usa estilos para mejorar la aplicación, estos estilos solo contarán si se usa NodeJS y NPM con Webpack para importarlos.

Puntuación: 10
