# Lern-Periode-7
Janky Graphic engine in console cursed creation thing
*25.10 bis 20.12*

Grob-Planung
Ich werde mit Alexander Straub ein Projekt machen. 

25.10.2024
- [x] Class und Funktion um Console Lines zu schreiben 
- [x] Funktion um individuelle Pixel zu setzen

Heute haben wir ein Framework gemacht, um mit dem █-Character in der Konsole einzelne Pixel zu setzen. Das Ziel ist es, eine Art Graphics Engine zu machen, die Daten von einem 2-D-Array nehmen kann (Position x, y und Farbe in string) und sie dann wiedergeben kann. Wir möchten, dass die Linien in der Konsole einzeln geupdated werden, damit es nicht bei jedem Update kurz schwarz wird. Schlussendlich soll dieses Graphics Engine dazu dienen, Konsolenspiele zu machen.

![WhatsApp Image 2024-10-25 at 11 54 29_193456d3](https://github.com/user-attachments/assets/43b10365-5701-49b1-8741-d234af51c088)

![WhatsApp Bild 2024-10-25 um 15 16 54_31aa9c01](https://github.com/user-attachments/assets/37c5155d-e5b5-4095-9eb4-40d2001cfa32)




1.11.2024
- [x] Funktion um Linien individuell zu refreshen
- [X] Load images from .txt file (in █ Format)
- [X] Load custom textures (Farbwerte für die Bilder, die man reinloadet)
- [x] Read user Key input (perhaps in second console window)
- [x] Create documentation
- [x] Main Menu mit Spielauswahl

Heute haben wir das Framework praktisch fertig gemacht. Man kann Bilder, Texturen von .txt Dateien importieren, alle Keys nutzen (theoretisch, wir nutzen jetzt nur WASD oder Pfeile) und wir sind jetzt bereit, ein paar einfache Games zu erstellen, um zu testen. Wir haben auch eine Dokumentation gemacht, damit wir nicht bei der Erstellung neuer Spiele irren. Wir haben das Main Menu, mit einer Auswahl von 2 Spiele (Space Invaders und Adventure) gemacht, und space invaders sehr simpel etwas renderen lassen, damit wir den "Spielaufstart" testen könnten.

08.11.2024
- [X] Alex: komische graue Linie bei Main start fixen (kann Stunden brauchen, oder Minuten)
- [x] Alex: Space invaders: runGame
- [X] Space Invaders: allyUFO class + shooting (keine Ahnung wie das funktioniert, daher kein konkretes AP)
- [x] Neo: Pong (class slider)
- [x] Pong: Fensterrand Collision
- [x] Pong: Pralleffect
- [x] Pong: class ball

☝️ Vergessen Sie nicht, bis einen ersten Code auf github hochzuladen

...

15.11.2024
- [x] Neo: Fix VS file properties to have misc files in compile mode (das braucht der ganze Morgen lange)
- [x] Neo: Doku SPainter
- [ ] Alex: Implement Music
- [ ] Alex: Death Screen
- [ ] Alex: Difficulty Increases
- [ ] (Alex): Start Coding New Game

22.11.2024
- [x] Alex: Formen fallen und Rotieren
- [x] Alex: Formen erkennen reihe
- [x] Alex: Formen löschen sich
- [x] Alex: Formen fallen nach löschung runter
- [x] Neo: hoffen, dass etwas funktioniert
- [x] Neo: Pong bis zu paddle und ball fertig

Alex hat heute das ganze Tetris gemacht, es ist spielbar und man kann sterben. Das Tetris hat 7 Formen, welche rotiert werden können. 
Neo hat heute endlich die Arbeitspakete von letzte Wochen geschafft, und ein fast fertiges single player Pong gemacht. Wir haben auch eine bessere Dokumentation für der SmartPainter erstellt, damit andere die vielleicht ein Game darauf machen wollen nicht so viel schmerz und träne haben.
Neo hat ein bisschen später die erste Version von Pong fertig gemacht. Es hat noch ein paar Bugs, und der Code ist noch nicht sauber und poliert. 

29.11.20247
- [x] Neo: Pong Hitbox
- [x] Neo: Game over screen
- [x] Neo: StartUp Anim Program
- [x] Neo: StartUpAnim textures (flag, text, logo)
- [X] Alex: Tetris music track thread
- [x] Alex: Add more animations
- [x] Alex: Refine game-hub
- [x] Alex: SPainter update & patches (nicht commmitted)

Neo: Heute habe ich Pong vollständig funktionierend gemacht. Ich habe Hitboxes hinzugefügt und einen Game-Over-Screen erstellt. Dann habe ich die Start-Up-Animation erstellt und sie in mein Branch im Game-Format (wie die anderen, Pong und Tetris) zum Testen hochgeladen, damit man beim Starten des Programms nicht immer sechs Sekunden warten muss. Ich habe die Texturen für die Animationen erstellt und auch ein bisschen getestet.

Alex: Ich habe heute all meine Ziele erreicht und noch mehr gemacht, indem ich den SmartPainter mit mehreren neuen Funktionen und einigen Patches aktualisiert habe. Ich habe auch angefangen, "Cursors zu readen". Ich habe auch Tetris ein Audiotrack gegeben auf ein separater Thread, und alle Probleme damit gefixt. Ich habe das Game Hub (aktuelles Start screen) auf Audio gegeben und leicht verbessert.

06.11.202
- [x] Neo: "Stupid" constructor for paddle
- [x] Neo: Modular constructors (textures, left righ boolean, ball size, field size)
- [ ] Neo: StartUpAnim Animation function: red snow to square
- [X] Alex: Cursor Reader testprogramm
- [X] Alex: Cursor Reader im SPainter setzen
- [X] Alex: Cursor Reader im DevPaint implementieren
- [x] Alex: Cursor-Reader & Key-Reader in eigene Klasse
- [ ] Alex: Alle Probleme beheben, die dadurch entstehen

Neo: Heute habe ich das Pong Programm schöner gemacht indem ich constructors mit alle nötige Parameter programmiert habe, und ich habe das Programm für unseres Programmierprojekt verbessert. (Ich werde noch heute regex für email inputs machen)

Alex: Heute habe ich das Cursor Tracking fertiggemacht, und noch mehrere andere Inputs für das Graphic engine gemacht. Ich habe die readkeys und das Cursortracking in ein neues Programm namens SReader (SmartReader) gemacht und auch noch der middle Mouse Button und Scroll Wheen zum Input gemacht. Danach habe ich schnell ein Parcour game gemacht, wo man mit ein Jetpack von Plattform zu Plattform fliegen kann.

13.11.2024
- [x] Neo: dynamic hitbox variables (auto adjusting, pong)
- [x] Alex: Parkour (Jetpack Joyride x Amongus)


Heute haben wir die zwei GitHub Branches vollständig gemerged, meherere kleine Bugs gefixt und eine neue Dokumentation erstellt. Es hat lange gebraucht, um zu entscheiden was zu behalten und was nicht, und dann ancher die nötige packages wieder zu installieren, weil die irgendwie weg waren. Auch müssten die Programme, die noch für die alten Programme (outdated) geschrieben waren, umschreiben. 

20.11.2024
- [x] Neo: Startup Animation vollständig fertig
- [ ] Startup statt manuell aktivieren sofort am Anfang laufen lassen
- [x] Pong: add ESC after dead
- [x] Alex: Krankenhaus überleben (that feeling when knee surgery is tomorrow)

Zusammenfassung 20.12.2024
Heute habe ich das Pong eine escape Funktion gegeben, der Code bereinigt und daas StartUp animation verbessert. Wie im GIF unten sieht man die Funktion, die ich zum StartUp animation hinzugefügt habe. Es vergrössert ein Punk bis zu Schweizerflagge. Ich habe dann das StartUp animation statt als game manuell aktivierbar so implementiert, dass es sofort beim StartUp lauft.

## Reflexion
Ich schreibe diese Reflexion über sowohl Alex als auch mich, obwohl ich nicht Alex bin. Wir haben viel über dieses Projekt geredet, und daher kann ich hier auch effektiv über seine Erfahrungen schreiben.

Wir haben durch dieses Projekt sehr viel gelernt. Obwohl es offensichtlich einen großen Unterschied in unseren Programmierkenntnissen gibt, konnte es uns beide herausfordern. Ich habe vor allem viel über objektorientiertes Programmieren gelernt. Ich war bereits mit Objekten und Funktionen vertraut, hatte sie aber nicht vollständig verstanden. Jetzt weiß ich, wofür Konstruktoren sind, wie man Parameter über mehrere Objektinstanzen hinweg übergibt und wie man Programme sinnvoll in Klassen und Dateien unterteilt. Außerdem habe ich gelernt, wie man eine gute Dateistruktur für ein solches Projekt aufsetzt.

Für Alex war dieses Programm ebenfalls eine gute Lernmöglichkeit. Er konnte sich immer weiter herausfordern, indem er jedes Mal neue Features hinzufügte, wie Multithreading, Sound, Cursor-Tracking usw. Er hat sich auch in C# verbessert, da er jetzt viele neue Methoden kennengelernt hat und sie nicht mehr selbst programmieren muss.

Um das Cursor-Tracking zu implementieren, musste er sehr komplizierte Dinge tun, wie den Kernel zu importieren und dann Berechnungen durchzuführen, die bestimmen, wo sich der Cursor relativ zum offenen Fenster befindet.

Insgesamt hat dieses Programm uns beide herausgefordert und auf ein höheres Niveau gebracht.
