// Sliding carousel script (seamless, infinite loop) with preloading and smoother transforms
(function(){
    const images = [
        'Carosule/Castle.jpg',
        'Carosule/Galeway.jpg',
        'Carosule/Giant.png',
        'Carosule/Cliffs.jpg'
    ];

    const hero = document.querySelector('.hero');
    const track = document.querySelector('.hero-track');
    if(!hero || !track || images.length === 0) return;

    const TRANSITION = 'transform 0.8s ease';
    let index = 0; // current slide index (0-based)
    const slideCount = images.length;
    let timer = null;
    const intervalMs = 4000;

    // Build slides (images will be preloaded first)
    function buildSlides(){
        images.forEach(src => {
            const slide = document.createElement('div');
            slide.className = 'hero-slide';
            const img = document.createElement('img');
            img.src = src;
            img.alt = '';
            img.decoding = 'async';
            img.loading = 'eager';
            slide.appendChild(img);
            track.appendChild(slide);
        });

        // clone first slide and append for seamless loop
        const firstClone = track.children[0].cloneNode(true);
        track.appendChild(firstClone);
    }

    // Preload images (resolve even on error) then initialize
    function preloadAll(srcs){
        const list = srcs.map(src => new Promise(resolve => {
            const i = new Image();
            i.src = src;
            i.onload = () => resolve({src, ok:true});
            i.onerror = () => resolve({src, ok:false});
        }));
        return Promise.all(list);
    }

    function goToSlide(i, withTransition = true){
        if(!withTransition) track.style.transition = 'none';
        else track.style.transition = TRANSITION;
        // use translate3d for GPU acceleration
        track.style.transform = `translate3d(${ -i * 100 }%,0,0)`;
    }

    function nextSlide(){
        index++;
        goToSlide(index, true);
    }

    function startAuto(){
        if(timer) clearInterval(timer);
        timer = setInterval(nextSlide, intervalMs);
    }

    // init after preload
    preloadAll(images).then(() => {
        buildSlides();
        // ensure initial position without transition
        goToSlide(0, false);
        // small timeout to re-enable transitions reliably
        setTimeout(() => { track.style.transition = TRANSITION; }, 50);
        startAuto();
    });

    // transition end: only act when transform transition finished
    track.addEventListener('transitionend', (e) => {
        if(e.propertyName !== 'transform') return;
        if(index >= slideCount){
            // jumped to clone; reset to real first slide without transition
            index = 0;
            goToSlide(index, false);
            // force reflow then restore transition
            // eslint-disable-next-line no-unused-expressions
            track.offsetHeight;
            track.style.transition = TRANSITION;
        }
    });

    // pause on hover
    hero.addEventListener('mouseenter', () => { if(timer) clearInterval(timer); });
    hero.addEventListener('mouseleave', () => { startAuto(); });

    // handle window resize: ensure correct transform (no need to recalc width since percent used)
})();
