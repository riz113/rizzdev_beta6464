/* ====================================================
   RIZKY ADIMUTI PORTFOLIO
   script.js - Versi Tanpa AI
   ==================================================== */

document.addEventListener('DOMContentLoaded', function() {

    // =============================================
    //  1.  LOADING SCREEN
    // =============================================
    const loading = document.getElementById('loading');
    if (loading) {
        window.addEventListener('load', function() {
            setTimeout(function() {
                loading.classList.add('hide');
            }, 1200);
        });
    }

    // =============================================
    //  2.  AOS (Animate On Scroll) – sudah diinisialisasi di HTML
    //      tapi kita panggil ulang jika perlu
    // =============================================
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100
        });
    }

    // =============================================
    //  3.  TYPING EFFECT (Typed.js)
    // =============================================
    const typingElement = document.getElementById('typing');
    if (typingElement && typeof Typed !== 'undefined') {
        new Typed('#typing', {
            strings: [
                'IoT Enthusiast',
                'AI Enthusiast',
                'Embedded System',
                'Web Developer',
                'Computer Engineering Student'
            ],
            typeSpeed: 70,
            backSpeed: 45,
            backDelay: 1800,
            loop: true
        });
    }

    // =============================================
    //  4.  MOBILE HAMBURGER MENU
    // =============================================
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('open');
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-xmark');
            }
        });

        // Tutup menu saat link diklik
        document.querySelectorAll('.nav-menu a').forEach(function(link) {
            link.addEventListener('click', function() {
                navMenu.classList.remove('open');
                const icon = hamburger.querySelector('i');
                if (icon) {
                    icon.className = 'fa-solid fa-bars';
                }
            });
        });
    }

    // =============================================
    //  5.  BACK TO TOP
    // =============================================
    const backBtn = document.getElementById('backToTop');
    if (backBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 500) {
                backBtn.classList.add('visible');
            } else {
                backBtn.classList.remove('visible');
            }
        });

        backBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // =============================================
    //  6.  HEADER SCROLL EFFECT
    // =============================================
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 60) {
                header.style.background = 'rgba(5,8,22,.92)';
                header.style.boxShadow = '0 15px 30px rgba(0,0,0,.4)';
            } else {
                header.style.background = 'rgba(5,8,22,.45)';
                header.style.boxShadow = 'none';
            }
        });
    }

    // =============================================
    //  7.  COUNTER ANIMATION (angka statistik)
    // =============================================
    const counters = document.querySelectorAll('.counter');

    function animateCounter(counter) {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(eased * target);
            counter.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        }

        requestAnimationFrame(updateCounter);
    }

    if (counters.length > 0) {
        const counterObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    if (!counter.dataset.animated) {
                        counter.dataset.animated = 'true';
                        animateCounter(counter);
                    }
                    counterObserver.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(function(counter) {
            counterObserver.observe(counter);
        });
    }

    // =============================================
    //  8.  SKILL BARS ANIMATION
    // =============================================
    const skillBars = document.querySelectorAll('.progress-bar');

    if (skillBars.length > 0) {
        const skillObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    // Ambil persentase dari class (misal .html = 90%)
                    // Atau kita bisa pakai data-width jika ada
                    // Karena di HTML class-nya seperti .html, .css, dll.
                    // Kita mapping berdasarkan class
                    const classMap = {
                        'html': 90,
                        'css': 85,
                        'java': 75,
                        'python': 82,
                        'cpp': 80
                    };
                    let width = 0;
                    for (let cls in classMap) {
                        if (bar.classList.contains(cls)) {
                            width = classMap[cls];
                            break;
                        }
                    }
                    // Jika ada data-width, override
                    if (bar.dataset.width) {
                        width = parseInt(bar.dataset.width);
                    }
                    bar.style.width = width + '%';
                    bar.classList.add('animate');
                    skillObserver.unobserve(bar);
                }
            });
        }, { threshold: 0.5 });

        skillBars.forEach(function(bar) {
            skillObserver.observe(bar);
        });
    }

    // =============================================
    //  9.  CONTACT FORM (Simulasi)
    // =============================================
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('✅ Pesan berhasil dikirim! (Simulasi)');
            this.reset();
        });
    }

    // =============================================
    //  10. DOWNLOAD CV (Simulasi)
    // =============================================
const downloadBtn = document.getElementById('downloadCV');
if (downloadBtn) {
    downloadBtn.addEventListener('click', function(e) {
        // Biarkan link bekerja secara normal
        // Bisa tambahkan console.log atau tracking di sini
    });
}

    // =============================================
    //  11. ACTIVE MENU LINK (Scroll Spy)
    // =============================================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');

    if (sections.length > 0 && navLinks.length > 0) {
        window.addEventListener('scroll', function() {
            let current = '';
            sections.forEach(function(section) {
                const top = section.offsetTop - 120;
                if (window.scrollY >= top) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(function(link) {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active');
                }
            });
        });
    }

    // =============================================
    //  12. LANGUAGE SWITCH (Bahasa)
    // =============================================
    const languageBtn = document.getElementById('languageBtn');
    let currentLanguage = 'id'; // id atau en

    if (languageBtn) {
        languageBtn.addEventListener('click', function() {
            currentLanguage = (currentLanguage === 'id') ? 'en' : 'id';
            this.innerHTML = (currentLanguage === 'id') ? '🇮🇩' : 'EN';

            document.querySelectorAll('[data-lang-id]').forEach(function(el) {
                const idText = el.getAttribute('data-lang-id');
                const enText = el.getAttribute('data-lang-en');
                el.textContent = (currentLanguage === 'id') ? idText : enText;
            });
        });
    }

    // =============================================
    //  13. DARK / LIGHT THEME
    // =============================================
    const themeBtn = document.getElementById('themeBtn');
    let isDark = true;

    if (themeBtn) {
        // Cek tema tersimpan
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            isDark = false;
            document.documentElement.setAttribute('data-theme', 'light');
            themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }

        themeBtn.addEventListener('click', function() {
            isDark = !isDark;

            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                this.innerHTML = '<i class="fa-solid fa-moon"></i>';
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                this.innerHTML = '<i class="fa-solid fa-sun"></i>';
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // =============================================
    //  14. PARTICLES.JS (Background)
    // =============================================
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 60,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: '#00BFFF'
                },
                shape: {
                    type: 'circle'
                },
                opacity: {
                    value: 0.4,
                    random: true
                },
                size: {
                    value: 3,
                    random: true
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#00BFFF',
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out'
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'repulse'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    }
                }
            },
            retina_detect: true
        });
    }

    // =============================================
    //  15. CUSTOM CURSOR
    // =============================================
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    if (cursorDot && cursorOutline) {
        let mouseX = 0,
            mouseY = 0;
        let outlineX = 0,
            outlineY = 0;

        document.addEventListener('mousemove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        });

        function animateCursor() {
            outlineX += (mouseX - outlineX) * 0.12;
            outlineY += (mouseY - outlineY) * 0.12;
            cursorOutline.style.left = outlineX + 'px';
            cursorOutline.style.top = outlineY + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Hover effect pada elemen interaktif
        const hoverElements = document.querySelectorAll(
            'a, button, .btn, .project-card, .tech-card, .social a, .nav-menu a, .info-card'
        );
        hoverElements.forEach(function(el) {
            el.addEventListener('mouseenter', function() {
                cursorDot.classList.add('hover');
                cursorOutline.classList.add('hover');
            });
            el.addEventListener('mouseleave', function() {
                cursorDot.classList.remove('hover');
                cursorOutline.classList.remove('hover');
            });
        });

        // Sembunyikan saat keluar window
        document.addEventListener('mouseleave', function() {
            cursorDot.style.opacity = '0';
            cursorOutline.style.opacity = '0';
        });
        document.addEventListener('mouseenter', function() {
            cursorDot.style.opacity = '1';
            cursorOutline.style.opacity = '1';
        });

        // Sembunyikan di perangkat sentuh
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            cursorDot.style.display = 'none';
            cursorOutline.style.display = 'none';
        }
    }

    // =============================================
    //  16. SMOOTH SCROLL UNTUK SEMUA LINK #
    // =============================================
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // =============================================
    //  17. CONSOLE WELCOME
    // =============================================
    console.log('%c🚀 Rizky Adimuti Portfolio', 'font-size:24px; font-weight:bold; color:#00BFFF;');
    console.log('%c👋 Halo! Terima kasih sudah mengunjungi portofolio saya.', 'font-size:14px; color:#c9d1d9;');
    console.log('%c🔗 GitHub: https://github.com/riz113', 'font-size:14px; color:#c9d1d9;');
    console.log('%c📧 Email: bisakiki2@gmail.com', 'font-size:14px; color:#c9d1d9;');

}); // end DOMContentLoaded