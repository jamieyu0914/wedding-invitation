document.addEventListener('DOMContentLoaded', () => {
    const dots = document.querySelectorAll('.dot');
    const imageContainer = document.querySelector('.images-container img');
    const body = document.body;
    const infos = document.querySelectorAll('.info');
    const basePath = 'assets/images/wedding-preview-';

    const backgroundColors = {
        '4.jpg': 'linear-gradient(45deg, #f3f3f3, #cadac2)',
        '5.jpg': 'linear-gradient(45deg, #f3f3f3, #90b5e0)',
        '6.jpg': 'linear-gradient(45deg, #f3f3f3, #f9cbb3)',
        '7.jpg': 'linear-gradient(45deg, #f3f3f3, #cdcac3)',
        '8.jpg': 'linear-gradient(45deg, #f3f3f3, #dea1a8)'
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