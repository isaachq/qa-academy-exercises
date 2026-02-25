import java.util.ArrayList;
import java.util.HashMap;

public class PracticaJava {

    // =========================================================
    // MÉTODOS (fuera de main)
    // =========================================================

    // Método sin parámetros y sin retorno
    public static void saludar() {
        System.out.println("¡Hola desde un método!");
    }

    // Método con parámetros
    public static void saludarPersona(String nombre) {
        System.out.println("Hola, " + nombre + "!");
    }

    // Método que retorna un valor
    public static int sumar(int a, int b) {
        return a + b;
    }

    // Método con múltiples parámetros y retorno
    public static double calcularSalarioAnual(double salarioMensual, int meses) {
        return salarioMensual * meses;
    }

    // Método que retorna boolean
    public static boolean esMayorDeEdad(int edad) {
        return edad >= 18;
    }

    // Método con manejo de excepciones
    public static int leerEdad(String textoEdad) {
        try {
            int edad = Integer.parseInt(textoEdad);

            if (edad < 0) {
                throw new IllegalArgumentException("La edad no puede ser negativa");
            }

            return edad;
        } catch (NumberFormatException e) {
            System.out.println("Error: '" + textoEdad + "' no es un número válido");
            return 0;
        } catch (IllegalArgumentException e) {
            System.out.println("Error: " + e.getMessage());
            return 0;
        }
    }

    // =========================================================
    // MAIN
    // =========================================================

    public static void main(String[] args) {
        System.out.println("=== PRÁCTICA DE JAVA ===");

        // ---------------------------------------------------------
        // VARIABLES BÁSICAS
        // ---------------------------------------------------------
        String nombre = "Juan";
        int edad = 28;
        boolean esSdet = false;  // Todavía no, pero pronto
        double salarioActual = 45000.50;

        System.out.println("\n=== MIS DATOS ===");
        System.out.println("Nombre: " + nombre);
        System.out.println("Edad: " + edad);
        System.out.println("Es SDET: " + esSdet);
        System.out.println("Salario actual: " + salarioActual);

        // ---------------------------------------------------------
        // CONSTANTES
        // ---------------------------------------------------------
        final double PI = 3.14159;
        final int DIAS_SEMANA = 7;

        System.out.println("\n=== CONSTANTES ===");
        System.out.println("PI: " + PI);
        System.out.println("Días en la semana: " + DIAS_SEMANA);

        // Esto daría error si descomentas:
        // PI = 3.14;  // Error: cannot assign a value to final variable PI

        // ---------------------------------------------------------
        // OPERACIONES
        // ---------------------------------------------------------
        System.out.println("\n=== OPERACIONES ===");
        int x = 10;
        int y = 3;

        System.out.println("Suma: " + (x + y));           // 13
        System.out.println("Resta: " + (x - y));          // 7
        System.out.println("Multiplicación: " + (x * y)); // 30
        System.out.println("División: " + (x / y));       // 3 (división entera!)
        System.out.println("Módulo: " + (x % y));         // 1 (residuo)

        // División con decimales
        double a = 10.0;
        double b = 3.0;
        System.out.println("División decimal: " + (a / b));  // 3.3333...

        // ---------------------------------------------------------
        // FORMATEO DE STRINGS
        // ---------------------------------------------------------
        System.out.println("\n=== FORMATEO DE STRINGS ===");

        String lenguaje = "Java";
        int experiencia = 2;

        // Concatenación simple
        System.out.println("Lenguaje: " + lenguaje + ", Experiencia: " + experiencia + " años");

        // String.format() - similar a printf
        String mensaje = String.format("Lenguaje: %s, Experiencia: %d años", lenguaje, experiencia);
        System.out.println(mensaje);

        // printf() - imprime formateado directamente
        System.out.printf("Lenguaje: %s, Experiencia: %d años\n", lenguaje, experiencia);

        // Formateo de decimales
        double salario = 45000.5678;
        System.out.printf("Salario: $%.2f\n", salario);  // 2 decimales

        // ---------------------------------------------------------
        // CONDICIONALES
        // ---------------------------------------------------------
        System.out.println("\n=== CONDICIONALES ===");

        int edadPersona = 25;

        if (edadPersona >= 18) {
            System.out.println("Eres mayor de edad");
        } else {
            System.out.println("Eres menor de edad");
        }

        // if-else if-else
        int nota = 85;

        if (nota >= 90) {
            System.out.println("Excelente (A)");
        } else if (nota >= 80) {
            System.out.println("Muy bien (B)");
        } else if (nota >= 70) {
            System.out.println("Bien (C)");
        } else if (nota >= 60) {
            System.out.println("Suficiente (D)");
        } else {
            System.out.println("Reprobado (F)");
        }

        // Operadores lógicos
        boolean tieneExperiencia = true;
        boolean sabeProgramar = true;

        if (tieneExperiencia && sabeProgramar) {
            System.out.println("Candidato calificado para SDET");
        }

        if (tieneExperiencia || sabeProgramar) {
            System.out.println("Tiene al menos una skill relevante");
        }

        if (!tieneExperiencia) {
            System.out.println("Necesita ganar experiencia");
        }

        // ---------------------------------------------------------
        // SWITCH
        // ---------------------------------------------------------
        System.out.println("\n=== SWITCH ===");

        int dia = 3;
        String nombreDia;

        switch (dia) {
            case 1:
                nombreDia = "Lunes";
                break;
            case 2:
                nombreDia = "Martes";
                break;
            case 3:
                nombreDia = "Miércoles";
                break;
            case 4:
                nombreDia = "Jueves";
                break;
            case 5:
                nombreDia = "Viernes";
                break;
            case 6:
                nombreDia = "Sábado";
                break;
            case 7:
                nombreDia = "Domingo";
                break;
            default:
                nombreDia = "Día inválido";
                break;
        }

        System.out.println("El día " + dia + " es: " + nombreDia);

        // Switch con Strings (Java 7+)
        String lenguajeSw = "Java";

        switch (lenguajeSw) {
            case "Python":
                System.out.println("Perfecto para automation");
                break;
            case "Java":
                System.out.println("El estándar enterprise");
                break;
            case "JavaScript":
                System.out.println("El lenguaje de la web");
                break;
            default:
                System.out.println("Lenguaje no reconocido");
                break;
        }

        // ---------------------------------------------------------
        // LOOP FOR
        // ---------------------------------------------------------
        System.out.println("\n=== LOOP FOR ===");

        // Loop básico
        for (int i = 0; i < 5; i++) {
            System.out.println("Iteración: " + i);
        }

        // Loop de 1 a 10
        System.out.println("\nNúmeros del 1 al 10:");
        for (int num = 1; num <= 10; num++) {
            System.out.print(num + " ");
        }
        System.out.println();  // Salto de línea

        // Loop con paso diferente
        System.out.println("\nNúmeros pares del 0 al 20:");
        for (int par = 0; par <= 20; par += 2) {
            System.out.print(par + " ");
        }
        System.out.println();

        // Loop descendente
        System.out.println("\nCuenta regresiva:");
        for (int countdown = 10; countdown >= 1; countdown--) {
            System.out.println(countdown);
        }
        System.out.println("¡Despegue!");

        // ---------------------------------------------------------
        // LOOP WHILE
        // ---------------------------------------------------------
        System.out.println("\n=== LOOP WHILE ===");

        int contador = 0;

        while (contador < 5) {
            System.out.println("Contador: " + contador);
            contador++;
        }

        // Ejemplo práctico: validación de entrada
        int intentos = 0;
        int maxIntentos = 3;
        boolean exito = false;

        System.out.println("\nSimulación de validación:");
        while (intentos < maxIntentos && !exito) {
            System.out.println("Intento #" + (intentos + 1));

            // Simulando validación
            if (intentos == 2) {  // En el tercer intento tiene éxito
                exito = true;
                System.out.println("¡Validación exitosa!");
            } else {
                System.out.println("Validación fallida");
            }

            intentos++;
        }

        if (!exito) {
            System.out.println("Máximo de intentos alcanzado");
        }

        // ---------------------------------------------------------
        // LOOP DO-WHILE
        // ---------------------------------------------------------
        System.out.println("\n=== LOOP DO-WHILE ===");

        int numero = 10;

        // Aunque la condición es falsa desde el inicio,
        // el código se ejecuta una vez
        do {
            System.out.println("Número: " + numero);
            numero++;
        } while (numero < 10);

        // Ejemplo práctico
        int respuesta = 0;
        int contadorDo = 0;

        System.out.println("\nProcesando hasta obtener respuesta correcta:");
        do {
            contadorDo++;
            System.out.println("Intento " + contadorDo);
            if (contadorDo == 3) {
                respuesta = 1;  // Simula respuesta correcta en intento 3
            }
        } while (respuesta != 1);

        System.out.println("Proceso completado en " + contadorDo + " intentos");

        // ---------------------------------------------------------
        // BREAK Y CONTINUE
        // ---------------------------------------------------------
        System.out.println("\n=== BREAK Y CONTINUE ===");

        // break - sale del loop inmediatamente
        System.out.println("Ejemplo de break:");
        for (int i = 0; i < 10; i++) {
            if (i == 5) {
                System.out.println("¡Encontré el 5! Saliendo...");
                break;
            }
            System.out.println(i);
        }

        // continue - salta a la siguiente iteración
        System.out.println("\nEjemplo de continue (solo impares):");
        for (int i = 0; i < 10; i++) {
            if (i % 2 == 0) {  // Si es par
                continue;       // Salta esta iteración
            }
            System.out.println(i);  // Solo imprime impares
        }

        System.out.println("\nCódigo después del loop");

        // ---------------------------------------------------------
        // MÉTODOS
        // ---------------------------------------------------------
        System.out.println("\n=== MÉTODOS ===");

        // Llamar método sin parámetros
        saludar();

        // Llamar método con parámetros
        saludarPersona("Juan");
        saludarPersona("María");

        // Método que retorna valor
        int resultado = sumar(10, 5);
        System.out.println("10 + 5 = " + resultado);

        // Usar retorno directamente
        System.out.println("20 + 15 = " + sumar(20, 15));

        // Método con cálculo
        double salarioAnual = calcularSalarioAnual(45000.50, 12);
        System.out.println("Salario anual: $" + salarioAnual);

        // Método que retorna boolean
        int edadCheck = 25;
        if (esMayorDeEdad(edadCheck)) {
            System.out.println("La persona es mayor de edad");
        }

        // ---------------------------------------------------------
        // ARRAYS
        // ---------------------------------------------------------
        System.out.println("\n=== ARRAYS ===");

        // Declarar e inicializar array
        int[] numeros = {10, 20, 30, 40, 50};

        // Acceder a elementos (índice empieza en 0)
        System.out.println("Primer elemento: " + numeros[0]);
        System.out.println("Último elemento: " + numeros[4]);

        // Modificar elemento
        numeros[2] = 35;
        System.out.println("Elemento modificado: " + numeros[2]);

        // Longitud del array
        System.out.println("Longitud: " + numeros.length);

        // Recorrer array con for
        System.out.println("\nTodos los elementos:");
        for (int i = 0; i < numeros.length; i++) {
            System.out.println("Índice " + i + ": " + numeros[i]);
        }

        // Enhanced for (for-each)
        System.out.println("\nCon enhanced for:");
        for (int num : numeros) {
            System.out.println(num);
        }

        // Array de Strings
        String[] lenguajes = {"Python", "Java", "TypeScript"};

        System.out.println("\nLenguajes de automation:");
        for (String lang : lenguajes) {
            System.out.println("- " + lang);
        }

        // Crear array de tamaño fijo (vacío)
        int[] nuevosNumeros = new int[5];  // [0, 0, 0, 0, 0]
        nuevosNumeros[0] = 100;
        nuevosNumeros[1] = 200;
        System.out.println("\nPrimer elemento del nuevo array: " + nuevosNumeros[0]);

        // ---------------------------------------------------------
        // ARRAYLIST
        // ---------------------------------------------------------
        System.out.println("\n=== ARRAYLIST ===");

        // Crear ArrayList
        ArrayList<String> lenguajesList = new ArrayList<>();

        // Agregar elementos
        lenguajesList.add("Python");
        lenguajesList.add("Java");
        lenguajesList.add("TypeScript");

        System.out.println("ArrayList: " + lenguajesList);
        System.out.println("Tamaño: " + lenguajesList.size());

        // Acceder a elementos
        System.out.println("Primer elemento: " + lenguajesList.get(0));
        System.out.println("Último elemento: " + lenguajesList.get(lenguajesList.size() - 1));

        // Modificar elemento
        lenguajesList.set(1, "JavaScript");
        System.out.println("ArrayList modificado: " + lenguajesList);

        // Verificar si contiene elemento
        if (lenguajesList.contains("Python")) {
            System.out.println("Python está en la lista");
        }

        // Eliminar elemento
        lenguajesList.remove("TypeScript");
        System.out.println("Después de eliminar TypeScript: " + lenguajesList);

        // Eliminar por índice
        lenguajesList.remove(0);  // Elimina Python
        System.out.println("Después de eliminar por índice: " + lenguajesList);

        // Recorrer ArrayList
        ArrayList<Integer> numerosAL = new ArrayList<>();
        numerosAL.add(10);
        numerosAL.add(20);
        numerosAL.add(30);

        System.out.println("\nRecorriendo ArrayList:");
        for (int i = 0; i < numerosAL.size(); i++) {
            System.out.println("Índice " + i + ": " + numerosAL.get(i));
        }

        // Enhanced for
        System.out.println("\nCon enhanced for:");
        for (Integer num : numerosAL) {
            System.out.println(num);
        }

        // Limpiar ArrayList
        numerosAL.clear();
        System.out.println("\nArrayList limpio: " + numerosAL);
        System.out.println("¿Está vacío? " + numerosAL.isEmpty());

        // ---------------------------------------------------------
        // HASHMAP
        // ---------------------------------------------------------
        System.out.println("\n=== HASHMAP ===");

        // Crear HashMap
        HashMap<String, Integer> edades = new HashMap<>();

        // Agregar pares clave-valor
        edades.put("Juan", 28);
        edades.put("María", 25);
        edades.put("Pedro", 30);

        System.out.println("HashMap: " + edades);

        // Obtener valor por clave
        System.out.println("Edad de Juan: " + edades.get("Juan"));

        // Verificar si existe clave
        if (edades.containsKey("María")) {
            System.out.println("María está en el HashMap");
        }

        // Verificar si existe valor
        if (edades.containsValue(30)) {
            System.out.println("Alguien tiene 30 años");
        }

        // Modificar valor
        edades.put("Juan", 29);  // Actualiza edad de Juan
        System.out.println("Edad actualizada de Juan: " + edades.get("Juan"));

        // Eliminar par clave-valor
        edades.remove("Pedro");
        System.out.println("Después de eliminar a Pedro: " + edades);

        // Tamaño del HashMap
        System.out.println("Tamaño: " + edades.size());

        // Recorrer HashMap - Solo claves
        System.out.println("\nRecorriendo claves:");
        for (String nom : edades.keySet()) {
            System.out.println("Nombre: " + nom);
        }

        // Recorrer HashMap - Solo valores
        System.out.println("\nRecorriendo valores:");
        for (Integer edadVal : edades.values()) {
            System.out.println("Edad: " + edadVal);
        }

        // Recorrer HashMap - Claves y valores
        System.out.println("\nRecorriendo claves y valores:");
        for (HashMap.Entry<String, Integer> entry : edades.entrySet()) {
            System.out.println(entry.getKey() + " tiene " + entry.getValue() + " años");
        }

        // HashMap con otros tipos
        HashMap<String, String> capitales = new HashMap<>();
        capitales.put("México", "Ciudad de México");
        capitales.put("España", "Madrid");
        capitales.put("Francia", "París");

        System.out.println("\nCapital de México: " + capitales.get("México"));

        // ---------------------------------------------------------
        // MANEJO DE EXCEPCIONES
        // ---------------------------------------------------------
        System.out.println("\n=== MANEJO DE EXCEPCIONES ===");

        // Ejemplo 1: División por cero
        System.out.println("Ejemplo 1: División por cero");
        try {
            int resultadoDiv = 10 / 0;
            System.out.println("Resultado: " + resultadoDiv);
        } catch (ArithmeticException e) {
            System.out.println("Error: No se puede dividir por cero");
            System.out.println("Mensaje técnico: " + e.getMessage());
        }

        // Ejemplo 2: Acceso a índice inválido
        System.out.println("\nEjemplo 2: Índice inválido");
        ArrayList<String> lista = new ArrayList<>();
        lista.add("Python");
        lista.add("Java");

        try {
            String elemento = lista.get(5);  // Índice no existe
            System.out.println(elemento);
        } catch (IndexOutOfBoundsException e) {
            System.out.println("Error: Índice fuera de rango");
        }

        // Ejemplo 3: Múltiples catch
        System.out.println("\nEjemplo 3: Conversión inválida");
        String texto = "abc";

        try {
            int numeroConv = Integer.parseInt(texto);  // No se puede convertir "abc" a int
            System.out.println(numeroConv);
        } catch (NumberFormatException e) {
            System.out.println("Error: No se puede convertir '" + texto + "' a número");
        } catch (Exception e) {
            System.out.println("Error general: " + e.getMessage());
        }

        // Ejemplo 4: finally (siempre se ejecuta)
        System.out.println("\nEjemplo 4: Bloque finally");
        try {
            System.out.println("Intentando operación...");
            int resultadoFin = 10 / 2;
            System.out.println("Resultado: " + resultadoFin);
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
        } finally {
            System.out.println("Bloque finally siempre se ejecuta");
        }

        // Ejemplo 5: try-catch en método
        System.out.println("\nEjemplo 5: Validación de edad");
        int edad1 = leerEdad("25");
        System.out.println("Edad validada: " + edad1);

        int edad2 = leerEdad("-5");
        System.out.println("Edad después de error: " + edad2);

        int edad3 = leerEdad("abc");
        System.out.println("Edad después de error: " + edad3);

        System.out.println("\nPrograma continúa normalmente después de manejar excepciones");
    }
}
