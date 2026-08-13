// ============================================================================
// PracticeJava.java
// CHAPTER 2 - PART 1: BASIC JAVA PROGRAMMING - Complete Reference File
// Book: Zero to SDET - De Cero a Ingeniero de Automatizacion
// ============================================================================
//
// This file contains ALL the code from Chapter 2 Part 1, written progressively
// as it appears in the book. Use it to:
//
//   - Compare your code with the official version line by line
//   - Verify you didn't skip any important section
//   - Debug if something doesn't work in your local version
//   - Quick reference for all concepts when you need them
//
// Do NOT use this file to:
//
//   - Copy it without having written the code yourself first
//   - Skip sections thinking "I'll copy it later"
//   - Avoid practicing by writing code manually
//
// REMINDER: Writing code manually is ESSENTIAL for learning.
// The muscle memory of writing syntax, making mistakes,
// and correcting them is irreplaceable. If you copied the code
// without writing it yourself, you didn't learn.
// Go back and write it manually.
// ============================================================================

package chapter2.part1;

import java.util.ArrayList;
import java.util.HashMap;

public class PracticeJava {

    // ========================================================================
    // METHODS OUTSIDE MAIN
    // ========================================================================

    // Method with no parameters and no return value
    public static void greet() {
        System.out.println("Hello from a method!");
    }

    // Method with parameters
    public static void greetPerson(String name) {
        System.out.println("Hello, " + name + "!");
    }

    // Method that returns a value
    public static int add(int a, int b) {
        return a + b;
    }

    // Method with multiple parameters and return value
    public static double calculateAnnualSalary(double monthlySalary, int months) {
        return monthlySalary * months;
    }

    // Method that returns boolean
    public static boolean isOfLegalAge(int age) {
        return age >= 18;
    }

    // Method with exception handling
    public static int readAge(String ageText) {
        try {
            int age = Integer.parseInt(ageText);

            if (age < 0) {
                throw new IllegalArgumentException("Age cannot be negative");
            }

            return age;
        } catch (NumberFormatException e) {
            System.out.println("Error: '" + ageText + "' is not a valid number");
            return 0;
        } catch (IllegalArgumentException e) {
            System.out.println("Error: " + e.getMessage());
            return 0;
        }
    }

    // ========================================================================
    // MAIN METHOD
    // ========================================================================

    public static void main(String[] args) {
        System.out.println("=== JAVA PRACTICE ===");

        // ====================================================================
        // SECTION 1: VARIABLES AND DATA TYPES
        // ====================================================================

        // --- Basic variables ---
        String name = "John";
        int age = 28;
        boolean isSdet = false;  // Not yet, but soon
        double currentSalary = 45000.50;

        // Print variables
        System.out.println("\n=== MY DATA ===");
        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.println("Is SDET: " + isSdet);
        System.out.println("Current salary: " + currentSalary);

        // ====================================================================
        // SECTION 2: CONSTANTS
        // ====================================================================

        // --- Constants ---
        final double PI = 3.14159;
        final int DAYS_OF_WEEK = 7;

        System.out.println("\n=== CONSTANTS ===");
        System.out.println("PI: " + PI);
        System.out.println("Days of the week: " + DAYS_OF_WEEK);

        // This would throw an error if uncommented:
        // PI = 3.14;  // Error: cannot assign a value to final variable PI

        // ====================================================================
        // SECTION 3: NUMBER OPERATIONS
        // ====================================================================

        // --- Number operations ---
        System.out.println("\n=== OPERATIONS ===");
        int x = 10;
        int y = 3;

        System.out.println("Addition: " + (x + y));           // 13
        System.out.println("Subtraction: " + (x - y));        // 7
        System.out.println("Multiplication: " + (x * y));     // 30
        System.out.println("Division: " + (x / y));           // 3 (integer division!)
        System.out.println("Modulo: " + (x % y));             // 1 (remainder)

        // Decimal division
        double a = 10.0;
        double b = 3.0;
        System.out.println("Decimal division: " + (a / b));   // 3.3333...

        // ====================================================================
        // SECTION 4: STRING FORMATTING
        // ====================================================================

        // --- String formatting ---
        System.out.println("\n=== STRING FORMATTING ===");

        String language = "Java";
        int experience = 2;

        // Simple concatenation
        System.out.println("Language: " + language + ", Experience: " + experience + " years");

        // String.format() - similar to printf
        String message = String.format("Language: %s, Experience: %d years", language, experience);
        System.out.println(message);

        // printf() - prints formatted output directly
        System.out.printf("Language: %s, Experience: %d years\n", language, experience);

        // Decimal formatting
        double salary = 45000.5678;
        System.out.printf("Salary: $%.2f\n", salary);  // 2 decimal places

        // ====================================================================
        // SECTION 5: CONDITIONALS
        // ====================================================================

        // --- Conditionals ---
        System.out.println("\n=== CONDITIONALS ===");

        int personAge = 25;

        if (personAge >= 18) {
            System.out.println("You are of legal age");
        } else {
            System.out.println("You are a minor");
        }

        // if-else
        int grade = 85;

        if (grade >= 90) {
            System.out.println("Excellent (A)");
        } else if (grade >= 80) {
            System.out.println("Very good (B)");
        } else if (grade >= 70) {
            System.out.println("Good (C)");
        } else if (grade >= 60) {
            System.out.println("Sufficient (D)");
        } else {
            System.out.println("Failed (F)");
        }

        // Logical operators
        boolean hasExperience = true;
        boolean canCode = true;

        if (hasExperience && canCode) {
            System.out.println("Qualified candidate for SDET");
        }

        if (hasExperience || canCode) {
            System.out.println("Has at least one relevant skill");
        }

        if (!hasExperience) {
            System.out.println("Needs to gain experience");
        }

        // ====================================================================
        // SECTION 6: SWITCH
        // ====================================================================

        // --- Switch ---
        System.out.println("\n=== SWITCH ===");

        int day = 3;
        String dayName;

        switch (day) {
            case 1:
                dayName = "Monday";
                break;
            case 2:
                dayName = "Tuesday";
                break;
            case 3:
                dayName = "Wednesday";
                break;
            case 4:
                dayName = "Thursday";
                break;
            case 5:
                dayName = "Friday";
                break;
            case 6:
                dayName = "Saturday";
                break;
            case 7:
                dayName = "Sunday";
                break;
            default:
                dayName = "Invalid day";
                break;
        }

        System.out.println("Day " + day + " is: " + dayName);

        // Switch with Strings (Java 7+)
        String programmingLanguage = "Java";

        switch (programmingLanguage) {
            case "Python":
                System.out.println("Perfect for automation");
                break;
            case "Java":
                System.out.println("The enterprise standard");
                break;
            case "JavaScript":
                System.out.println("The language of the web");
                break;
            default:
                System.out.println("Language not recognized");
                break;
        }

        // ====================================================================
        // SECTION 7: FOR LOOP
        // ====================================================================

        // --- For loop ---
        System.out.println("\n=== FOR LOOP ===");

        // Basic loop
        for (int i = 0; i < 5; i++) {
            System.out.println("Iteration: " + i);
        }

        // Loop from 1 to 10
        System.out.println("\nNumbers from 1 to 10:");
        for (int num = 1; num <= 10; num++) {
            System.out.print(num + " ");
        }
        System.out.println();  // Line break

        // Loop with different step
        System.out.println("\nEven numbers from 0 to 20:");
        for (int even = 0; even <= 20; even += 2) {
            System.out.print(even + " ");
        }
        System.out.println();

        // Descending loop
        System.out.println("\nCountdown:");
        for (int countdown = 10; countdown >= 1; countdown--) {
            System.out.println(countdown);
        }
        System.out.println("Liftoff!");

        // ====================================================================
        // SECTION 8: WHILE LOOP
        // ====================================================================

        // --- While loop ---
        System.out.println("\n=== WHILE LOOP ===");

        int counter = 0;

        while (counter < 5) {
            System.out.println("Counter: " + counter);
            counter++;
        }

        // Practical example: input validation
        int attempts = 0;
        int maxAttempts = 3;
        boolean success = false;

        System.out.println("\nValidation simulation:");
        while (attempts < maxAttempts && !success) {
            System.out.println("Attempt #" + (attempts + 1));

            // Simulating validation
            if (attempts == 2) {  // On the third attempt it succeeds
                success = true;
                System.out.println("Validation successful!");
            } else {
                System.out.println("Validation failed");
            }

            attempts++;
        }

        if (!success) {
            System.out.println("Maximum attempts reached");
        }

        // ====================================================================
        // SECTION 9: DO-WHILE LOOP
        // ====================================================================

        // --- Do-while loop ---
        System.out.println("\n=== DO-WHILE LOOP ===");

        int number = 10;

        // Even if the condition is false from the start,
        // the code executes once
        do {
            System.out.println("Number: " + number);
            number++;
        } while (number < 10);

        // Practical example
        int response = 0;
        int doCounter = 0;

        System.out.println("\nProcessing until correct response is obtained:");
        do {
            doCounter++;
            System.out.println("Attempt " + doCounter);
            if (doCounter == 3) {
                response = 1;  // Simulates correct response on attempt 3
            }
        } while (response != 1);

        System.out.println("Process completed in " + doCounter + " attempts");

        // ====================================================================
        // SECTION 10: BREAK AND CONTINUE
        // ====================================================================

        // --- Break and continue ---
        System.out.println("\n=== BREAK AND CONTINUE ===");

        // break - exits the loop immediately
        System.out.println("Break example:");
        for (int i = 0; i < 10; i++) {
            if (i == 5) {
                System.out.println("Found 5! Exiting...");
                break;
            }
            System.out.println(i);
        }

        // continue - jumps to the next iteration
        System.out.println("\nContinue example (odd numbers only):");
        for (int i = 0; i < 10; i++) {
            if (i % 2 == 0) {  // If even
                continue;       // Skip this iteration
            }
            System.out.println(i);  // Only prints odd numbers
        }

        System.out.println("\nCode after the loop");

        // ====================================================================
        // SECTION 11: METHODS
        // ====================================================================

        // --- Method calls ---
        System.out.println("\n=== METHODS ===");

        // Call method with no parameters
        greet();

        // Call method with parameters
        greetPerson("John");
        greetPerson("Mary");

        // Method that returns a value
        int result = add(10, 5);
        System.out.println("10 + 5 = " + result);

        // Use return value directly
        System.out.println("20 + 15 = " + add(20, 15));

        // Method with calculation
        double annualSalary = calculateAnnualSalary(45000.50, 12);
        System.out.println("Annual salary: $" + annualSalary);

        // Method that returns boolean
        int personAge2 = 25;
        if (isOfLegalAge(personAge2)) {
            System.out.println("The person is of legal age");
        }

        // ====================================================================
        // SECTION 12: ARRAYS
        // ====================================================================

        // --- Arrays ---
        System.out.println("\n=== ARRAYS ===");

        // Declare and initialize array
        int[] numbers = {10, 20, 30, 40, 50};

        // Access elements (index starts at 0)
        System.out.println("First element: " + numbers[0]);
        System.out.println("Last element: " + numbers[4]);

        // Modify element
        numbers[2] = 35;
        System.out.println("Modified element: " + numbers[2]);

        // Array length
        System.out.println("Length: " + numbers.length);

        // Iterate array with for
        System.out.println("\nAll elements:");
        for (int i = 0; i < numbers.length; i++) {
            System.out.println("Index " + i + ": " + numbers[i]);
        }

        // Enhanced for (for-each)
        System.out.println("\nWith enhanced for:");
        for (int num : numbers) {
            System.out.println(num);
        }

        // String array
        String[] languages = {"Python", "Java", "TypeScript"};

        System.out.println("\nAutomation languages:");
        for (String lang : languages) {
            System.out.println("- " + lang);
        }

        // Create fixed-size array (empty)
        int[] newNumbers = new int[5];  // [0, 0, 0, 0, 0]
        newNumbers[0] = 100;
        newNumbers[1] = 200;
        System.out.println("\nFirst element of new array: " + newNumbers[0]);

        // ====================================================================
        // SECTION 13: ARRAYLIST
        // ====================================================================

        // --- ArrayList ---
        System.out.println("\n=== ARRAYLIST ===");

        // Create ArrayList
        ArrayList<String> programmingLanguages = new ArrayList<>();

        // Add elements
        programmingLanguages.add("Python");
        programmingLanguages.add("Java");
        programmingLanguages.add("TypeScript");

        System.out.println("ArrayList: " + programmingLanguages);
        System.out.println("Size: " + programmingLanguages.size());

        // Access elements
        System.out.println("First element: " + programmingLanguages.get(0));
        System.out.println("Last element: " + programmingLanguages.get(programmingLanguages.size() - 1));

        // Modify element
        programmingLanguages.set(1, "JavaScript");
        System.out.println("Modified ArrayList: " + programmingLanguages);

        // Check if element exists
        if (programmingLanguages.contains("Python")) {
            System.out.println("Python is in the list");
        }

        // Remove element
        programmingLanguages.remove("TypeScript");
        System.out.println("After removing TypeScript: " + programmingLanguages);

        // Remove by index
        programmingLanguages.remove(0);  // Removes Python
        System.out.println("After removing by index: " + programmingLanguages);

        // Iterate ArrayList
        ArrayList<Integer> nums = new ArrayList<>();
        nums.add(10);
        nums.add(20);
        nums.add(30);

        System.out.println("\nIterating ArrayList:");
        for (int i = 0; i < nums.size(); i++) {
            System.out.println("Index " + i + ": " + nums.get(i));
        }

        // Enhanced for
        System.out.println("\nWith enhanced for:");
        for (Integer n : nums) {
            System.out.println(n);
        }

        // Clear ArrayList
        nums.clear();
        System.out.println("\nEmpty ArrayList: " + nums);
        System.out.println("Is empty? " + nums.isEmpty());

        // ====================================================================
        // SECTION 14: HASHMAP
        // ====================================================================

        // --- HashMap ---
        System.out.println("\n=== HASHMAP ===");

        // Create HashMap
        HashMap<String, Integer> ages = new HashMap<>();

        // Add key-value pairs
        ages.put("John", 28);
        ages.put("Mary", 25);
        ages.put("Peter", 30);

        System.out.println("HashMap: " + ages);

        // Get value by key
        System.out.println("John's age: " + ages.get("John"));

        // Check if key exists
        if (ages.containsKey("Mary")) {
            System.out.println("Mary is in the HashMap");
        }

        // Check if value exists
        if (ages.containsValue(30)) {
            System.out.println("Someone is 30 years old");
        }

        // Modify value
        ages.put("John", 29);  // Updates John's age
        System.out.println("Updated age of John: " + ages.get("John"));

        // Remove key-value pair
        ages.remove("Peter");
        System.out.println("After removing Peter: " + ages);

        // HashMap size
        System.out.println("Size: " + ages.size());

        // Iterate HashMap - Keys only
        System.out.println("\nIterating keys:");
        for (String personName : ages.keySet()) {
            System.out.println("Name: " + personName);
        }

        // Iterate HashMap - Values only
        System.out.println("\nIterating values:");
        for (Integer personAge3 : ages.values()) {
            System.out.println("Age: " + personAge3);
        }

        // Iterate HashMap - Keys and values
        System.out.println("\nIterating keys and values:");
        for (HashMap.Entry<String, Integer> entry : ages.entrySet()) {
            System.out.println(entry.getKey() + " is " + entry.getValue() + " years old");
        }

        // HashMap with other types
        HashMap<String, String> capitals = new HashMap<>();
        capitals.put("Mexico", "Mexico City");
        capitals.put("Spain", "Madrid");
        capitals.put("France", "Paris");

        System.out.println("\nCapital of Mexico: " + capitals.get("Mexico"));

        // ====================================================================
        // SECTION 15: EXCEPTION HANDLING
        // ====================================================================

        // --- Exception handling ---
        System.out.println("\n=== EXCEPTION HANDLING ===");

        // Example 1: Division by zero
        System.out.println("Example 1: Division by zero");
        try {
            int divResult = 10 / 0;
            System.out.println("Result: " + divResult);
        } catch (ArithmeticException e) {
            System.out.println("Error: Cannot divide by zero");
            System.out.println("Technical message: " + e.getMessage());
        }

        // Example 2: Invalid index access
        System.out.println("\nExample 2: Invalid index");
        ArrayList<String> sampleList = new ArrayList<>();
        sampleList.add("Python");
        sampleList.add("Java");

        try {
            String element = sampleList.get(5);  // Index does not exist
            System.out.println(element);
        } catch (IndexOutOfBoundsException e) {
            System.out.println("Error: Index out of range");
        }

        // Example 3: Multiple catch
        System.out.println("\nExample 3: Invalid conversion");
        String text = "abc";

        try {
            int parsedNumber = Integer.parseInt(text);  // Cannot convert "abc" to int
            System.out.println(parsedNumber);
        } catch (NumberFormatException e) {
            System.out.println("Error: Cannot convert '" + text + "' to number");
        } catch (Exception e) {
            System.out.println("General error: " + e.getMessage());
        }

        // Example 4: finally (always executes)
        System.out.println("\nExample 4: Finally block");
        try {
            System.out.println("Attempting operation...");
            int finalResult = 10 / 2;
            System.out.println("Result: " + finalResult);
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
        } finally {
            System.out.println("Finally block always executes");
        }

        // Example 5: try-catch in method
        System.out.println("\nExample 5: Age validation");
        int age1 = readAge("25");
        System.out.println("Validated age: " + age1);

        int age2 = readAge("-5");
        System.out.println("Age after error: " + age2);

        int age3 = readAge("abc");
        System.out.println("Age after error: " + age3);

        System.out.println("\nProgram continues normally after handling exceptions");
    }
}

// ============================================================================
// END OF REFERENCE FILE
// ============================================================================
//
// Concepts covered in this file:
//
//   1.  Variables and data types (primitives and reference types)
//   2.  Constants with final keyword
//   3.  Number operations (arithmetic, integer division, modulo)
//   4.  String formatting (concatenation, String.format, printf)
//   5.  Conditionals if/else/if-else and logical operators
//   6.  Switch statement (with int and String)
//   7.  For loop (basic, range, step, descending)
//   8.  While loop (counter, validation simulation)
//   9.  Do-while loop
//   10. break and continue
//   11. Methods (no return, with parameters, return values, boolean)
//   12. Arrays (declare, access, modify, iterate)
//   13. ArrayList (add, get, set, remove, iterate, clear)
//   14. HashMap (put, get, containsKey, remove, iterate)
//   15. Exception handling try/catch/finally (multiple scenarios)
//
// If you made it here and wrote all the code manually:
// Congratulations! You are ready for Chapter 2 Part 2 (OOP).
// ============================================================================
