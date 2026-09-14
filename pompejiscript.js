const section = document.querySelector(".parallax-section");
const layers = document.querySelectorAll(".layer");

//Prolog am Anfang der Website
const prolog = document.querySelector(".prolog");
const titleScreen = document.querySelector(".title-screen");

//Rauchhintergrund für Titel
const cloud1 = document.querySelector(".title-cloud1");
const cloud15 = document.querySelector(".title-cloud15");
const cloud2 = document.querySelector(".title-cloud2");

//Titel Infotext (Autor etc)
const introInfo = document.querySelector(".intro-info");

const parallaxStrength = [
    0,
    10,
    100,
    190,
    260,
    280,
    290
];

const separationStart = 0.55;


// ------------------------------------------ AUFTEILUNG DER GESAMTEN SCROLLSTRECKE ---------------------------------
const PROLOG_END = 0.4;
const PARALLAX_END = 0.7;


function clamp(value, min = 0, max = 1) {
    return Math.max(min, Math.min(max, value));
}


function updateParallax() {

    const sectionTop = section.offsetTop;

    const scrollDistance =
        section.offsetHeight - window.innerHeight;

    let progress =
        (window.scrollY - sectionTop) / scrollDistance;

    progress = clamp(progress);


    /*
        --------------------------------
        1. PROLOG
        --------------------------------
    */

    const prologProgress =
        clamp(progress / PROLOG_END);


    /*
        --------------------------------
        2. PARALLAX
        --------------------------------
    */

    const cameraProgress =
        clamp(
            (progress - PROLOG_END) /
            (PARALLAX_END - PROLOG_END)
        );


    /*
        --------------------------------
        3. TITEL
        --------------------------------
    */

    const titleProgress =
        clamp(
            (progress - PARALLAX_END) /
            (1 - PARALLAX_END)
        );


    /*
        Höhe der gesamten Szene
    */

    let sceneHeight = 0;

    layers.forEach(layer => {
        sceneHeight = Math.max(
            sceneHeight,
            layer.getBoundingClientRect().height
        );
    });


    const imageOverflow =
        Math.max(0, sceneHeight - window.innerHeight);


    /*
        Kamerafahrt

        cameraProgress = 0
        → oberer Bildbereich

        cameraProgress = 1
        → unterer Bildbereich
    */

    const cameraMovement =
        imageOverflow * (1 - cameraProgress);


    layers.forEach((layer, index) => {

        let parallaxMovement;


        /*
            Layer 1–4
        */

        if (index < 4) {

            parallaxMovement =
                parallaxStrength[index] *
                cameraProgress;

        }


        /*
            Layer 5–7
        */

        else {

            const sharedStrength = 260;

            const extraStrength =
                parallaxStrength[index] -
                sharedStrength;


            let separationProgress =
                (cameraProgress - separationStart) /
                (1 - separationStart);

            separationProgress =
                clamp(separationProgress);


            /*
                Smoothstep
            */

            separationProgress =
                separationProgress *
                separationProgress *
                (3 - 2 * separationProgress);


            const sharedMovement =
                sharedStrength *
                cameraProgress;


            const extraMovement =
                extraStrength *
                separationProgress;


            parallaxMovement =
                sharedMovement +
                extraMovement;
        }


        const frontLayerCompensation =
            parallaxStrength[parallaxStrength.length - 1] *
            cameraProgress;

        const y =
            cameraMovement +
            frontLayerCompensation -
            parallaxMovement;

        layer.style.transform =
            `translate(-50%, ${y}px)`;
    });


    /*
        Prolog steuern
    */

    updateProlog(prologProgress);


    /*
        Titel steuern
    */

    updateTitle(titleProgress);
}


window.addEventListener("scroll", updateParallax);
window.addEventListener("resize", updateParallax);
window.addEventListener("load", updateParallax);

function updateProlog(progress) {

    const text =
        document.querySelector(".prolog-text");

    const words =
        document.querySelectorAll(".prolog-text span");


    /*
        Gesamte Zeile von rechts nach links bewegen
    */

    const textWidth =
        text.scrollWidth;

    const startX =
        window.innerWidth * 0.85;

    const endX =
        -textWidth * 0.85;


    const x =
        startX +
        (endX - startX) * progress;


    text.style.transform =
        `translate(${x}px, -50%)`;


    /*
        Fokuspunkt:
        ungefähr Mitte des Bildschirms
    */

    const focusX =
        window.innerWidth * 0.5;


    words.forEach(word => {

        const rect =
            word.getBoundingClientRect();

        const wordCenter =
            rect.left + rect.width / 2;


        /*
            Abstand vom Fokuspunkt
        */

        const distance =
            Math.abs(wordCenter - focusX);


        /*
            Wie weit reicht unser Fokusbereich?
        */

        const focusRange =
            window.innerWidth * 0.32;


        let visibility =
            1 - distance / focusRange;

        visibility =
            clamp(visibility);


        /*
            Unterschied zwischen links und rechts:

            links = schneller verschwinden
            rechts = langsam auftauchen
        */

        if (wordCenter < focusX) {

            visibility =
                Math.pow(visibility, 1.6);

        } else {

            visibility =
                Math.pow(visibility, 0.7);
        }


        word.style.opacity =
            visibility;


        const blur =
            (1 - visibility) * 8;


        word.style.filter =
            `blur(${blur}px)`;
    });


    /*
        Ganz am Ende verschwindet der komplette
        Prolog, damit definitiv nichts hängen bleibt.
    */

    const fadeOutStart = 0.90;

    let overallOpacity = 1;


    if (progress > fadeOutStart) {

        overallOpacity =
            1 -
            (progress - fadeOutStart) /
            (1 - fadeOutStart);

    }


    text.style.opacity =
        clamp(overallOpacity);
}


//einfliegender Rauch und Titel der Website
function updateTitle(progress) {

    /*
        ====================================
        EINSTELLUNGEN
        ====================================
    */

    // Wann startet Layer 2?
    const cloud2Delay = 0.08;

    // Wann sollen die Wolken ihre Endposition
    // ungefähr erreicht haben?
    const cloudMovementEnd = 0.72;

    // Ab wann erscheint der Titel?
    const titleStart = 0.58;


    /*
        ====================================
        WOLKE 1
        ====================================
    */

    const cloud1Start =
        -cloud1.offsetHeight * 0.90;

    /*
        Wichtig:
        Die Wolke fährt NICHT komplett
        aus dem Bildschirm heraus.

        Sie endet noch sichtbar im Viewport.

        Ein Teil liegt unterhalb des Fensters,
        damit die unregelmäßige Unterkante
        keine Lücken erzeugt.
    */
    const cloud1End =
        -cloud1.offsetHeight * 0.45 + 400;


    let cloud1Progress =
        progress / cloudMovementEnd;

    cloud1Progress =
        clamp(cloud1Progress);

    // weich beschleunigen / abbremsen
    cloud1Progress =
        cloud1Progress *
        cloud1Progress *
        (3 - 2 * cloud1Progress);


    const cloud1Y =
        cloud1Start +
        (cloud1End - cloud1Start) *
        cloud1Progress;

    /*
    ====================================
    WOLKE 1.5 – MITTLERE EBENE
    ====================================
    */

    const cloud15Delay = 0.04;

    let cloud15Progress =
        (progress - cloud15Delay) /
        (cloudMovementEnd - cloud15Delay);

    cloud15Progress =
        clamp(cloud15Progress);


    /*
        Smoothstep
    */

    cloud15Progress =
        cloud15Progress *
        cloud15Progress *
        (3 - 2 * cloud15Progress);


    /*
        Startposition

        Liegt zwischen Layer 1 und Layer 2.
    */

    const cloud15Start =
        -cloud15.offsetHeight * 0.925;


    /*
        Endposition

        Ebenfalls zwischen Layer 1 und Layer 2.
    */

    const cloud15End =
        -cloud15.offsetHeight * 0.5 - 100;


    const cloud15Y =
        cloud15Start +
        (cloud15End - cloud15Start) *
        cloud15Progress;


    /*
        ====================================
        WOLKE 2
        ====================================
    */

    let cloud2Progress =
        (progress - cloud2Delay) /
        (cloudMovementEnd - cloud2Delay);

    cloud2Progress =
        clamp(cloud2Progress);

    cloud2Progress =
        cloud2Progress *
        cloud2Progress *
        (3 - 2 * cloud2Progress);


    const cloud2Start =
        -cloud2.offsetHeight * 0.95;

    /*
        Layer 2 endet etwas weiter unten
        als Layer 1.

        Dadurch schiebt er sich sichtbar
        über Layer 1.
    */
    const cloud2End =
        -cloud2.offsetHeight * 0.3;


    const cloud2Y =
        cloud2Start +
        (cloud2End - cloud2Start) *
        cloud2Progress;


    /*
        ====================================
        POSITIONEN ANWENDEN
        ====================================
    */

    /*
        Kleine seitliche Drift.
        Bewusst unterschiedlich pro Ebene.
    */

    const cloud1X =
        -25 * cloud1Progress;

    const cloud15X =
        18 * cloud15Progress;

    const cloud2X =
        -40 * cloud2Progress;


    /*
        Zusätzlich minimal skalieren.
        Dadurch wirkt Rauch eher so,
        als würde er sich ausbreiten.
    */

    const cloud1Scale =
        1 + 0.025 * cloud1Progress;

    const cloud15Scale =
        1 + 0.04 * cloud15Progress;

    const cloud2Scale =
        1 + 0.055 * cloud2Progress;


    cloud1.style.transform =
        `translate(calc(-50% + ${cloud1X}px), ${cloud1Y}px)
        scale(${cloud1Scale})`;

    cloud15.style.transform =
        `translate(calc(-50% + ${cloud15X}px), ${cloud15Y}px)
        scale(${cloud15Scale})`;

    cloud2.style.transform =
        `translate(calc(-50% + ${cloud2X}px), ${cloud2Y}px)
        scale(${cloud2Scale})`;
        
    /*
        ====================================
        SICHTBARKEIT DER WOLKEN
        ====================================
    */

    cloud1.style.opacity =
        clamp(progress * 6);

    cloud15.style.opacity =
        clamp(cloud15Progress * 6);

    cloud2.style.opacity =
        clamp(cloud2Progress * 6);


    /*
        ====================================
        TITEL
        ====================================
    */

    let textProgress =
        (progress - titleStart) /
        (1 - titleStart);

    textProgress =
        clamp(textProgress);


    textProgress =
        textProgress *
        textProgress *
        (3 - 2 * textProgress);


    titleScreen.style.opacity =
        textProgress;


    const title =
        titleScreen.querySelector("h1");


    const scale =
        1.08 - textProgress * 0.08;


    title.style.transform =
        `scale(${scale})`;

    /*
    ====================================
    PHASE 3 – TITEL → INFOTEXT
    ====================================
    */

    /*
        Ab diesem Punkt beginnt der Titel
        wieder zu verschwinden.

        0.82 = 82 % der Title-Phase
    */
    const infoTransitionStart = 0.87;


    /*
        Wie weit sind wir durch die
        Überblendung?
    */

    let infoProgress =
        (progress - infoTransitionStart) /
        (1 - infoTransitionStart);

    infoProgress =
        clamp(infoProgress);


    /*
        Smoothstep
    */

    infoProgress =
        infoProgress *
        infoProgress *
        (3 - 2 * infoProgress);


    /*
        -------------------------
        TITEL VERSCHWINDET
        -------------------------
    */

    titleScreen.style.opacity =
        textProgress * (1 - infoProgress);


    /*
        Beim Verschwinden wird der Titel
        minimal unscharf.
    */

    titleScreen.style.filter =
        `blur(${infoProgress * 6}px)`;


    /*
        Gleichzeitig bewegt er sich
        ganz leicht nach oben.
    */

    const titleY =
        -20 * infoProgress;

    const titleScale =
        1.08 - textProgress * 0.08;

    title.style.transform =
        `translateY(${titleY}px) scale(${titleScale})`;


    /*
        -------------------------
        INFOTEXT ERSCHEINT
        -------------------------
    */

    introInfo.style.opacity =
        infoProgress;


    /*
        Infotext wird beim Auftauchen scharf.
    */

    introInfo.style.filter =
        `blur(${(1 - infoProgress) * 6}px)`;


    /*
        Und bewegt sich leicht nach oben
        an seine endgültige Position.
    */

    const infoY =
        20 * (1 - infoProgress);

    introInfo.style.transform =
        `translateY(${infoY}px)`;
}