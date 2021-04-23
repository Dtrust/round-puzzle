function cardRotate(elem) {

    const card = document.querySelector(elem)

    function cursorEnter() {
        card.style.transition = 'none'
        card.classList.add('hover')
    }

    function beginTransform(e) {
        let xAxis = (window.innerWidth / 2 - e.clientX) / 15
        let yAxis = (window.innerHeight / 2 - e.clientY) / 15

        card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`
    }

    function endTransform(e) {
        card.style.transition = 'all 0.5s ease'
        card.style.transform = `rotateY(0deg) rotateX(0deg)`
        card.classList.remove('hover')
    }

    if ('ontouchstart' in document.documentElement) {
        card.addEventListener('touchstart', cursorEnter)
        card.addEventListener('touchmove', beginTransform)
        card.addEventListener('touchend', endTransform)
    } else {
        card.addEventListener('mousemove', beginTransform)
        card.addEventListener('mouseenter', cursorEnter)
        card.addEventListener('mouseleave', endTransform)
    }
}

cardRotate('.wrapper')
