document.addEventListener('DOMContentLoaded', () => {
    const dots = document.querySelectorAll('.dot');
    const imageContainer = document.querySelector('.images-container img');
    const body = document.body;
    const infos = document.querySelectorAll('.info');
    const basePath = 'assets/images/wedding-preview-';

    const backgroundColors = {
        '1.webp': 'linear-gradient(45deg, #f3f3f3, #cadac2)',
        '2.jpg': 'linear-gradient(45deg, #f3f3f3, #b2a4c7)',
        '3.jpg': 'linear-gradient(45deg, #f3f3f3, #f9cbb3)'
    };

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            dots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');

            const imageFile = dot.getAttribute('data-image');
            const fullPath = basePath + imageFile;
            imageContainer.src = fullPath;

            body.style.backgroundImage = backgroundColors[imageFile] || 'none';

            infos.forEach(info => {
                if (info.getAttribute('data') === imageFile) {
                    info.style.display = 'block';
                } else {
                    info.style.display = 'none';
                }
            });
        });
    });

    if (dots.length > 0) {
        dots[0].classList.add('active');
        const firstImageFile = dots[0].getAttribute('data-image');
        imageContainer.src = basePath + firstImageFile;
        body.style.backgroundImage = backgroundColors[firstImageFile];
        infos.forEach(info => {
            if (info.getAttribute('data') === firstImageFile) {
                info.style.display = 'block';
            } else {
                info.style.display = 'none';
            }
        });
    }
});