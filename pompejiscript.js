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

//Szene 2
const scene2Section = document.querySelector(".scene2-section");
const scene2Sticky = document.querySelector(".scene2-sticky");
const scene2Image = document.querySelector(".scene2-image");

const scene2Text1 = document.querySelector(".scene2-text1");
const scene2Text2 = document.querySelector(".scene2-text2");
const scene2Text3 = document.querySelector(".scene2-text3");

const parallaxStrength = [
    0,
    10,
    100,
    170,
    210,
    240,
    260
];

const separationStart = 0.55;


// ------------------------------------------ AUFTEILUNG DER GESAMTEN SCROLLSTRECKE ---------------------------------
const PROLOG_END = 0.2;
const PARALLAX_END = 0.65;


function clamp(value, min = 0, max = 1) {
    return Math.max(min, Math.min(max, value));
}

function smoothstep(value) {
    return value * value * (3 - 2 * value);
}

function rangeProgress(progress, start, end) {
    return clamp((progress - start) / (end - start));
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


    const scene2ScrollDistance =
        scene2Section.offsetHeight - window.innerHeight;

    let scene2Progress =
        (window.scrollY - scene2Section.offsetTop) / scene2ScrollDistance;

    scene2Progress = clamp(scene2Progress);

    updateScene2(scene2Progress);
}


window.addEventListener("scroll", updateParallax);
window.addEventListener("resize", updateParallax);
window.addEventListener("load", updateParallax);

function updateProlog(progress) {

    const lines = document.querySelectorAll(".prolog-line");
    const lineCount = lines.length;

    if (lineCount === 0) return;

    const segmentLength = 1 / lineCount;

    lines.forEach((line, index) => {

        /*
            Jede Zeile bekommt ihren eigenen
            Abschnitt des Prolog-Scrollwegs.
        */

        const start = index * segmentLength;

        let localProgress =
            (progress - start) / segmentLength;

        localProgress = clamp(localProgress);


        /*
            EINBLENDEN
        */

        let fadeIn = clamp(localProgress / 0.20);

        fadeIn = smoothstep(fadeIn);


        /*
            AUSBLENDEN
        */

        let fadeOut = clamp(
            (localProgress - 0.80) / 0.20
        );

        fadeOut = smoothstep(fadeOut);


        /*
            Sichtbarkeit
        */

        const opacity = fadeIn * (1 - fadeOut);

        line.style.opacity = opacity;


        /*
            Unschärfe
        */

        const blur = (1 - opacity) * 8;

        line.style.filter = `blur(${blur}px)`;


        /*
            Leichte Bewegung nach oben
        */

        const y = 12 * (1 - opacity);

        line.style.transform =
            `translate(-50%, calc(-50% + ${y}px))`;
    });
}


//einfliegender Rauch und Titel der Website
/*
====================================
EINSTELLUNGEN
====================================
*/

const TITLE_SETTINGS = {
    cloudMovementEnd: 0.72,

    // Titel erscheint
    titleFadeIn: [0.58, 0.70],

    // Titel verschwindet, Infotext erscheint
    infoFadeIn: [0.78, 0.84]
};

// Individuelle Einstellungen der Rauchwolken
const TITLE_CLOUDS = [
    {
        element: cloud1,
        delay: 0,
        startFactor: 0.90,
        endFactor: 0.45,
        endOffset: 400,
        driftX: -25,
        scaleGrowth: 0.025
    },
    {
        element: cloud15,
        delay: 0.04,
        startFactor: 0.925,
        endFactor: 0.50,
        endOffset: -100,
        driftX: 18,
        scaleGrowth: 0.04
    },
    {
        element: cloud2,
        delay: 0.08,
        startFactor: 0.95,
        endFactor: 0.30,
        endOffset: 0,
        driftX: -40,
        scaleGrowth: 0.055
    }
];

const titleHeading = titleScreen.querySelector("h1");


/*
====================================
HILFSFUNKTION
====================================
*/

// Gibt einen weich animierten Fortschritt
// zwischen 0 und 1 zurück.
function easeBetween(progress, start, end) {
    const t = clamp((progress - start) / (end - start));

    return t * t * (3 - 2 * t);
}


/*
====================================
RAUCHWOLKEN
====================================
*/

function updateTitleClouds(progress) {

    TITLE_CLOUDS.forEach((cloud, index) => {

        const movement = easeBetween(
            progress,
            cloud.delay,
            TITLE_SETTINGS.cloudMovementEnd
        );

        // Vertikale Positionen
        const startY =
            -cloud.element.offsetHeight * cloud.startFactor;

        const endY =
            -cloud.element.offsetHeight * cloud.endFactor
            + cloud.endOffset;

        const y = startY + (endY - startY) * movement;

        // Seitliche Drift
        const x = cloud.driftX * movement;

        // Leichte Vergrößerung
        const scale = 1 + cloud.scaleGrowth * movement;

        cloud.element.style.transform =
            `translate(calc(-50% + ${x}px), ${y}px)
             scale(${scale})`;

        // Sichtbarkeit wie bisher
        cloud.element.style.opacity =
            index === 0
                ? clamp(progress * 6)
                : clamp(movement * 6);
    });
}


/*
====================================
TITEL UND INFOTEXT
====================================
*/

function updateTitleTexts(progress) {

    const titleAppear = easeBetween(
        progress,
        ...TITLE_SETTINGS.titleFadeIn
    );

    const infoAppear = easeBetween(
        progress,
        ...TITLE_SETTINGS.infoFadeIn
    );

    // TITEL
    titleScreen.style.opacity =
        titleAppear * (1 - infoAppear);

    titleScreen.style.filter =
        `blur(${infoAppear * 6}px)`;

    const titleScale = 1.08 - titleAppear * 0.08;
    const titleY = -20 * infoAppear;

    titleHeading.style.transform =
        `translateY(${titleY}px) scale(${titleScale})`;


    // INFOTEXT
    introInfo.style.opacity = infoAppear;

    introInfo.style.filter =
        `blur(${(1 - infoAppear) * 6}px)`;

    const infoY = 20 * (1 - infoAppear);

    introInfo.style.transform =
        `translateY(${infoY}px)`;
}


/*
====================================
HAUPTFUNKTION
====================================
*/

function updateTitle(progress) {
    updateTitleClouds(progress);
    updateTitleTexts(progress);
}

//------------------------------------------------------------ Szene 2 ----------------------------------------------------

function updateScene2(progress) {

    /*
        -----------------------------
        Szene selbst einblenden
        -----------------------------
    */

    let revealProgress = rangeProgress(progress, 0.00, 0.07);
    revealProgress = smoothstep(revealProgress);

    scene2Sticky.style.opacity = revealProgress;
    scene2Sticky.style.filter = `blur(${(1 - revealProgress) * 10}px)`;


    /*
        -----------------------------
        Leichter Kamerazoom
        -----------------------------
    */

    let zoomProgress = rangeProgress(progress, 0.00, 0.85);
    zoomProgress = smoothstep(zoomProgress);

    const scale = 1 + 0.04 * zoomProgress;

    scene2Image.style.transform = `scale(${scale})`;


    /*
        -----------------------------
        Text 1
        -----------------------------
    */

    let text1In = smoothstep(rangeProgress(progress, 0.12, 0.20));
    let text1Out = smoothstep(rangeProgress(progress, 0.28, 0.36));
    let text1Opacity = text1In * (1 - text1Out);

    scene2Text1.style.opacity = text1Opacity;
    scene2Text1.style.filter = `blur(${(1 - text1Opacity) * 8}px)`;
    scene2Text1.style.transform =
        `translateX(-50%) translateY(${20 * (1 - text1Opacity)}px)`;


    /*
        -----------------------------
        Text 2
        -----------------------------
    */

    let text2In = smoothstep(rangeProgress(progress, 0.36, 0.44));
    let text2Out = smoothstep(rangeProgress(progress, 0.54, 0.62));
    let text2Opacity = text2In * (1 - text2Out);

    scene2Text2.style.opacity = text2Opacity;
    scene2Text2.style.filter = `blur(${(1 - text2Opacity) * 8}px)`;
    scene2Text2.style.transform =
        `translateX(-50%) translateY(${20 * (1 - text2Opacity)}px)`;


    /*
        -----------------------------
        Text 3
        -----------------------------
    */

    let text3In = smoothstep(rangeProgress(progress, 0.62, 0.70));
    let text3Out = smoothstep(rangeProgress(progress, 0.82, 0.90));
    let text3Opacity = text3In * (1 - text3Out);

    scene2Text3.style.opacity = text3Opacity;
    scene2Text3.style.filter = `blur(${(1 - text3Opacity) * 8}px)`;
    scene2Text3.style.transform =
        `translateX(-50%) translateY(${20 * (1 - text3Opacity)}px)`;
}