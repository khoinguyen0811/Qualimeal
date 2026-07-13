import CERTIFICATE_DB from '../data/certificates.json';
import SEARCH_ARTICLES from '../data/articles.json';

document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------
    // 1. Highlight Active Menu Item (Multi-page link highlight)
    // ----------------------------------------------------
    const pageId = document.body.getAttribute('data-page');
    if (pageId) {
        document.querySelectorAll(`[data-page="${pageId}"]`).forEach(link => {
            link.classList.add('active', 'nav-link-active');
            if (link.classList.contains('mobile-link')) {
                link.classList.add('text-brand-orange');
            } else {
                link.classList.add('text-brand-gold');
            }
        });
    }

    // ----------------------------------------------------
    // 1b. Sticky Navbar Scroll Trigger
    // ----------------------------------------------------
    const stickyNavbar = document.getElementById("sticky-navbar");
    if (stickyNavbar) {
        if (pageId) {
            stickyNavbar.querySelectorAll(`[data-page="${pageId}"]`).forEach(link => {
                link.classList.add('text-brand-gold', 'border-brand-gold');
                link.classList.remove('border-transparent');
            });
        }
        
        window.addEventListener("scroll", () => {
            if (window.scrollY > 200) {
                stickyNavbar.classList.remove("-translate-y-full", "opacity-0", "pointer-events-none");
                stickyNavbar.classList.add("translate-y-0", "opacity-100", "pointer-events-auto");
            } else {
                stickyNavbar.classList.remove("translate-y-0", "opacity-100", "pointer-events-auto");
                stickyNavbar.classList.add("-translate-y-full", "opacity-0", "pointer-events-none");
            }
        });
    }

    // ----------------------------------------------------
    // 2. Hero Slider (Homepage specific)
    // ----------------------------------------------------
    const slides = document.querySelectorAll(".slide-item");
    const prevBtn = document.getElementById("slide-prev");
    const nextBtn = document.getElementById("slide-next");
    const indicatorsContainer = document.getElementById("slide-indicators");
    
    if (slides.length > 0 && indicatorsContainer) {
        let currentSlide = 0;
        let slideInterval;

        // Create indicators dynamically
        slides.forEach((_, index) => {
            const dot = document.createElement("button");
            dot.className = `h-3 rounded-full transition-all duration-300 ${index === 0 ? "bg-brand-gold w-8" : "bg-white/40 w-3"}`;
            dot.addEventListener("click", () => {
                goToSlide(index);
                resetSlideTimer();
            });
            indicatorsContainer.appendChild(dot);
        });

        const indicators = indicatorsContainer.querySelectorAll("button");

        function goToSlide(n) {
            slides[currentSlide].classList.remove("active");
            indicators[currentSlide].classList.remove("bg-brand-gold", "w-8");
            indicators[currentSlide].classList.add("bg-white/40", "w-3");

            currentSlide = (n + slides.length) % slides.length;

            slides[currentSlide].classList.add("active");
            indicators[currentSlide].classList.remove("bg-white/40", "w-3");
            indicators[currentSlide].classList.add("bg-brand-gold", "w-8");
        }

        function nextSlide() {
            goToSlide(currentSlide + 1);
        }

        function prevSlide() {
            goToSlide(currentSlide - 1);
        }

        if (nextBtn && prevBtn) {
            nextBtn.addEventListener("click", () => {
                nextSlide();
                resetSlideTimer();
            });
            prevBtn.addEventListener("click", () => {
                prevSlide();
                resetSlideTimer();
            });
        }

        function startSlideTimer() {
            slideInterval = setInterval(nextSlide, 6000);
        }

        function resetSlideTimer() {
            clearInterval(slideInterval);
            startSlideTimer();
        }

        startSlideTimer();
    }

    // ----------------------------------------------------
    // 3. Modal Manager (General logic to handle all modals)
    // ----------------------------------------------------
    function setupModal(triggerIds, modalId, closeId) {
        const triggers = typeof triggerIds === 'string' ? [triggerIds] : triggerIds;
        const modal = document.getElementById(modalId);
        const closeBtn = document.getElementById(closeId);

        if (!modal) return;

        triggers.forEach(trigId => {
            const btn = document.getElementById(trigId);
            if (btn) {
                btn.addEventListener("click", (e) => {
                    e.preventDefault();
                    modal.classList.remove("hidden");
                    modal.classList.add("flex");
                    document.body.style.overflow = "hidden"; // disable scroll behind
                });
            }
        });

        const closeModal = () => {
            modal.classList.add("hidden");
            modal.classList.remove("flex");
            document.body.style.overflow = ""; // enable scroll
        };

        if (closeBtn) {
            closeBtn.addEventListener("click", closeModal);
        }

        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Initialize all modals
    setupModal(["btn-lookup-nav", "btn-lookup-hero"], "modal-lookup", "btn-close-lookup");
    setupModal(["btn-consult-nav", "btn-consult-hero", "btn-consult-footer"], "modal-consult", "btn-close-consult");
    setupModal(["btn-search-nav", "btn-search-sticky", "btn-search-mobile"], "modal-search", "btn-close-search");

    // ----------------------------------------------------
    // 4. Certificate Lookup Feature
    // ----------------------------------------------------
    const formLookup = document.getElementById("form-lookup");
    const inputLookup = document.getElementById("input-lookup");
    const lookupResult = document.getElementById("lookup-result");

    if (formLookup && inputLookup && lookupResult) {
        formLookup.addEventListener("submit", (e) => {
            e.preventDefault();
            const certCode = inputLookup.value.trim().toUpperCase();
            
            // Add a small loading effect
            lookupResult.innerHTML = `
                <div class="flex items-center justify-center p-8">
                    <svg class="animate-spin h-8 w-8 text-brand-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="ml-3 text-slate-600 font-medium">Đang tìm kiếm thông tin...</span>
                </div>
            `;

            setTimeout(() => {
                const certData = CERTIFICATE_DB[certCode];

                if (certData) {
                    lookupResult.innerHTML = `
                        <div class="p-6 bg-brand-beige border border-brand-gold/30 rounded-2xl animate-fade-in text-brand-deep">
                            <div class="flex items-center space-x-3 mb-4">
                                <span class="bg-brand-green text-white p-2 rounded-xl">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </span>
                                <div>
                                    <h4 class="font-bold text-slate-800 text-lg">Chứng Chỉ Hợp Lệ</h4>
                                    <p class="text-xs text-brand-emerald font-semibold tracking-wider uppercase">${certData.standard}</p>
                                </div>
                            </div>
                            <div class="space-y-3 text-sm border-t border-brand-gold/20 pt-4">
                                <div class="grid grid-cols-3 gap-2">
                                    <span class="text-slate-500 font-medium">Doanh nghiệp:</span>
                                    <span class="col-span-2 text-slate-800 font-semibold">${certData.company}</span>
                                </div>
                                <div class="grid grid-cols-3 gap-2">
                                    <span class="text-slate-500 font-medium">Mã chứng chỉ:</span>
                                    <span class="col-span-2 text-brand-green font-mono font-bold">${certData.id}</span>
                                </div>
                                <div class="grid grid-cols-3 gap-2">
                                    <span class="text-slate-500 font-medium">Lĩnh vực/Phạm vi:</span>
                                    <span class="col-span-2 text-slate-700">${certData.scope}</span>
                                </div>
                                <div class="grid grid-cols-3 gap-2">
                                    <span class="text-slate-500 font-medium">Tổ chức cấp:</span>
                                    <span class="col-span-2 text-slate-700">${certData.authority}</span>
                                </div>
                                <div class="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                                    <div>
                                        <span class="text-slate-500 text-xs block">Ngày cấp</span>
                                        <span class="text-slate-800 font-semibold">${certData.issueDate}</span>
                                    </div>
                                    <div>
                                        <span class="text-slate-500 text-xs block">Ngày hết hạn</span>
                                        <span class="text-slate-800 font-semibold">${certData.expiryDate}</span>
                                    </div>
                                    <div>
                                        <span class="text-slate-500 text-xs block">Trạng thái</span>
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-emerald/10 text-brand-green">${certData.status}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    lookupResult.innerHTML = `
                        <div class="p-6 bg-slate-100 border border-slate-200 rounded-2xl animate-fade-in text-center">
                            <span class="inline-flex bg-slate-200 text-slate-600 p-3 rounded-full mb-3">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            </span>
                            <h4 class="font-bold text-slate-800 text-lg mb-1">Không Tìm Thấy Chứng Chỉ</h4>
                            <p class="text-sm text-slate-600 mb-2">Mã tra cứu không khớp với dữ liệu hệ thống.</p>
                            <p class="text-xs text-slate-500">Vui lòng kiểm tra lại ký tự hoặc nhập mã thử nghiệm: <strong class="font-mono bg-white px-2 py-1 border rounded text-slate-700">QM-9001-2026</strong> hoặc <strong class="font-mono bg-white px-2 py-1 border rounded text-slate-700">QM-22000-2026</strong></p>
                        </div>
                    `;
                }
            }, 600);
        });
    }

    // ----------------------------------------------------
    // 5. Global Search Feature
    // ----------------------------------------------------
    const inputSearch = document.getElementById("input-search");
    const searchResults = document.getElementById("search-results");

    if (inputSearch && searchResults) {
        inputSearch.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query.length < 2) {
                searchResults.innerHTML = `<p class="text-sm text-slate-400 text-center py-4">Nhập ít nhất 2 ký tự để tìm kiếm...</p>`;
                return;
            }

            const matched = SEARCH_ARTICLES.filter(item => 
                item.title.toLowerCase().includes(query) || 
                item.category.toLowerCase().includes(query)
            );

            if (matched.length > 0) {
                searchResults.innerHTML = matched.map(item => `
                    <a href="${item.url}" onclick="document.getElementById('modal-search').classList.add('hidden'); document.body.style.overflow = '';" class="block p-3 hover:bg-slate-50 rounded-xl transition duration-150 border-b border-slate-100 last:border-0">
                        <div class="flex justify-between items-center">
                            <span class="font-medium text-slate-800 text-sm">${item.title}</span>
                            <span class="text-xs px-2.5 py-0.5 rounded-full bg-brand-emerald/10 text-brand-emerald font-medium">${item.category}</span>
                        </div>
                    </a>
                `).join('');
            } else {
                searchResults.innerHTML = `<p class="text-sm text-slate-500 text-center py-4">Không tìm thấy kết quả phù hợp với "${e.target.value}"</p>`;
            }
        });
    }

    // ----------------------------------------------------
    // 6. News/Announcements/Knowledge Tab Switching (Blog Page specific)
    // ----------------------------------------------------
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    if (tabButtons.length > 0) {
        tabButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const tabTarget = btn.getAttribute("data-tab");

                tabButtons.forEach(b => {
                    b.classList.remove("text-brand-emerald", "border-brand-emerald", "border-b-2", "font-bold");
                    b.classList.add("text-slate-500", "font-medium");
                });

                btn.classList.remove("text-slate-500", "font-medium");
                btn.classList.add("text-brand-emerald", "border-brand-emerald", "border-b-2", "font-bold");

                tabContents.forEach(content => {
                    if (content.id === `tab-${tabTarget}`) {
                        content.classList.remove("hidden");
                        content.classList.add("grid");
                    } else {
                        content.classList.add("hidden");
                        content.classList.remove("grid");
                    }
                });
            });
        });

        // Helper to programmatically switch tabs based on hash
        function handleHashTab() {
            const hash = window.location.hash;
            if (hash === "#tab-announcements") {
                switchTab("announcements");
            } else if (hash === "#tab-knowledge") {
                switchTab("knowledge");
            } else if (hash === "#tab-news") {
                switchTab("news");
            }
        }

        function switchTab(tabId) {
            const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
            if (btn) {
                btn.click();
            }
        }

        // Run tab switcher based on current URL hash
        window.addEventListener("hashchange", handleHashTab);
        handleHashTab();
    }

    // ----------------------------------------------------
    // 7. Contact Consultation Form Submission
    // ----------------------------------------------------
    const formConsult = document.getElementById("form-consult");
    const formMainContact = document.getElementById("form-main-contact");

    function handleFormSubmit(form, successMessage) {
        if (!form) return;
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector("button[type='submit']");
            const originalHtml = submitBtn.innerHTML;

            // Loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg> Đang gửi yêu cầu...
            `;

            setTimeout(() => {
                submitBtn.innerHTML = `
                    <svg class="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Gửi Thành Công!
                `;
                submitBtn.classList.remove("bg-brand-emerald", "hover:bg-brand-emerald/90", "bg-brand-orange", "hover:bg-amber-600");
                submitBtn.classList.add("bg-emerald-600");

                // Show alert popup
                alert(successMessage);

                // Reset form after delay
                setTimeout(() => {
                    form.reset();
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalHtml;
                    submitBtn.className = submitBtn.className.replace("bg-emerald-600", "");
                    
                    // Close modal if it's the modal form
                    const modalConsult = document.getElementById("modal-consult");
                    if (modalConsult && !modalConsult.classList.contains("hidden")) {
                        modalConsult.classList.add("hidden");
                        modalConsult.classList.remove("flex");
                        document.body.style.overflow = "";
                    }
                }, 1000);

            }, 1200);
        });
    }

    handleFormSubmit(formConsult, "Yêu cầu tư vấn của quý khách đã được tiếp nhận. Đội ngũ chuyên gia của QualiMeal sẽ liên hệ lại trong vòng 15-30 phút!");
    handleFormSubmit(formMainContact, "Gửi tin nhắn liên hệ thành công! Chúng tôi sẽ phản hồi qua email/sđt của quý khách trong thời gian sớm nhất.");

    // ----------------------------------------------------
    // 8. Mobile Menu Drawer Toggle
    // ----------------------------------------------------
    const btnMobileMenu = document.getElementById("btn-mobile-menu");
    const btnCloseMobile = document.getElementById("btn-close-mobile");
    const mobileDrawer = document.getElementById("mobile-drawer");
    const mobileDrawerOverlay = document.getElementById("mobile-drawer-overlay");
    const mobileLinks = document.querySelectorAll(".mobile-link");

    if (btnMobileMenu && mobileDrawer) {
        btnMobileMenu.addEventListener("click", () => {
            mobileDrawer.classList.remove("translate-x-full");
            document.body.style.overflow = "hidden";
            if (mobileDrawerOverlay) {
                mobileDrawerOverlay.classList.remove("hidden");
                // Trigger reflow
                mobileDrawerOverlay.offsetHeight;
                mobileDrawerOverlay.classList.remove("opacity-0", "pointer-events-none");
                mobileDrawerOverlay.classList.add("opacity-100");
            }
        });
    }

    const closeMobileDrawer = () => {
        if (mobileDrawer) {
            mobileDrawer.classList.add("translate-x-full");
            document.body.style.overflow = "";
        }
        if (mobileDrawerOverlay) {
            mobileDrawerOverlay.classList.add("opacity-0", "pointer-events-none");
            mobileDrawerOverlay.classList.remove("opacity-100");
            setTimeout(() => {
                if (mobileDrawerOverlay.classList.contains("opacity-0")) {
                    mobileDrawerOverlay.classList.add("hidden");
                }
            }, 300);
        }
    };

    if (btnCloseMobile) {
        btnCloseMobile.addEventListener("click", closeMobileDrawer);
    }

    if (mobileDrawerOverlay) {
        mobileDrawerOverlay.addEventListener("click", closeMobileDrawer);
    }

    mobileLinks.forEach(link => {
        link.addEventListener("click", closeMobileDrawer);
    });

    // ----------------------------------------------------
    // 9. Interactive Accordion Feature (Scientist/Warehouse/Ingredients)
    // ----------------------------------------------------
    const accordionSection = document.getElementById("interactive-accordion-section");
    if (accordionSection) {
        const panels = accordionSection.querySelectorAll(".accordion-panel");
        panels.forEach(panel => {
            panel.addEventListener("mouseenter", () => {
                // Remove active class from all panels
                panels.forEach(p => p.classList.remove("active"));
                // Add active class to hovered panel
                panel.classList.add("active");
                
                // Change parent section background image
                const newBg = panel.getAttribute("data-bg");
                if (newBg) {
                    accordionSection.style.backgroundImage = `url('${newBg}')`;
                }
            });
        });
    }

    // ----------------------------------------------------
    // 9b. About Section Accordion (FAQ dropdowns)
    // ----------------------------------------------------
    const aboutFaqToggles = document.querySelectorAll(".about-faq-toggle");
    aboutFaqToggles.forEach(toggle => {
        toggle.addEventListener("click", () => {
            const targetId = toggle.getAttribute("data-target");
            const content = document.getElementById(targetId);
            const icon = toggle.querySelector(".fa-chevron-down");
            const parent = toggle.parentElement;

            if (content) {
                const isOpen = !content.classList.contains("max-h-0") && content.style.maxHeight;

                // Close all other items
                aboutFaqToggles.forEach(otherToggle => {
                    const otherTargetId = otherToggle.getAttribute("data-target");
                    const otherContent = document.getElementById(otherTargetId);
                    const otherIcon = otherToggle.querySelector(".fa-chevron-down");
                    const otherParent = otherToggle.parentElement;

                    if (otherContent) {
                        otherContent.style.maxHeight = null;
                        otherContent.classList.add("max-h-0");
                        if (otherIcon) otherIcon.classList.remove("rotate-180");
                        otherParent.classList.remove("border-brand-emerald/40", "bg-white");
                        otherParent.classList.add("bg-slate-50/60", "border-slate-100");
                    }
                });

                if (!isOpen) {
                    // Open this item
                    content.classList.remove("max-h-0");
                    content.style.maxHeight = content.scrollHeight + "px";
                    if (icon) icon.classList.add("rotate-180");
                    parent.classList.remove("bg-slate-50/60", "border-slate-100");
                    parent.classList.add("border-brand-emerald/40", "bg-white");
                }
            }
        });
    });
});
