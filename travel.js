/**
 * CASE FILES - Travel System
 * Handles location transitions with cultural facts
 */

const TravelSystem = {
    currentSlide: 0,
    slides: [],
    slideInterval: null,
    
    init() {
        // Travel is data-driven per case
    },
    
    /**
     * Load travel data for a case
     */
    loadTravelData(travelData) {
        this.data = travelData;
    },
    
    /**
     * Travel to a new location
     */
    async travelTo(locationId) {
        const location = GameState.locations.find(l => l.id === locationId);
        if (!location || !location.unlocked) return;
        
        const travelInfo = this.data?.routes?.[`${GameState.scene.id}_${locationId}`] 
            || this.data?.locations?.[locationId];
        
        if (!travelInfo || !travelInfo.slides || travelInfo.slides.length === 0) {
            // Quick travel without slideshow
            await SceneManager.loadScene(locationId);
            return;
        }
        
        // Show travel screen
        this.slides = travelInfo.slides;
        this.currentSlide = 0;
        
        await SceneManager.transitionTo('travel');
        
        // Start slideshow
        this.startSlideshow(travelInfo.destination || location.name, () => {
            // Travel complete - load destination scene
            SceneManager.loadScene(locationId);
        });
    },
    
    /**
     * Run the travel slideshow
     */
    startSlideshow(destinationName, onComplete) {
        const container = document.querySelector('.travel-slideshow');
        const factElement = document.querySelector('.travel-fact');
        const destElement = document.querySelector('.travel-destination');
        const progressContainer = document.querySelector('.travel-progress');
        
        if (!container) return;
        
        // Set destination
        if (destElement) {
            destElement.textContent = `→ ${destinationName}`;
        }
        
        // Create progress dots
        if (progressContainer) {
            progressContainer.innerHTML = '';
            this.slides.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.className = 'travel-dot';
                if (i === 0) dot.classList.add('active');
                progressContainer.appendChild(dot);
            });
        }
        
        // Create slides
        container.innerHTML = '';
        this.slides.forEach((slide, i) => {
            const slideEl = document.createElement('div');
            slideEl.className = 'travel-slide';
            if (i === 0) slideEl.classList.add('active');
            
            if (slide.image) {
                slideEl.style.backgroundImage = `url(${slide.image})`;
            } else {
                // Placeholder gradient
                slideEl.style.background = `linear-gradient(135deg, 
                    hsl(${200 + i * 30}, 30%, 20%) 0%, 
                    hsl(${220 + i * 30}, 40%, 10%) 100%)`;
            }
            
            container.appendChild(slideEl);
        });
        
        // Show first fact
        this.showFact(factElement, this.slides[0].fact);
        
        // Auto-advance slides
        const slideCount = this.slides.length;
        const slideDuration = 3000;
        
        this.slideInterval = setInterval(() => {
            this.currentSlide++;
            
            if (this.currentSlide >= slideCount) {
                clearInterval(this.slideInterval);
                this.slideInterval = null;
                
                // Fade out and complete
                setTimeout(() => {
                    onComplete();
                }, 500);
                return;
            }
            
            this.showSlide(this.currentSlide, factElement, progressContainer);
        }, slideDuration);
        
        // Allow skip
        const skipHandler = () => {
            if (this.slideInterval) {
                clearInterval(this.slideInterval);
                this.slideInterval = null;
                document.removeEventListener('click', skipHandler);
                onComplete();
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', skipHandler);
        }, 1000);
    },
    
    showSlide(index, factElement, progressContainer) {
        const slides = document.querySelectorAll('.travel-slide');
        const dots = progressContainer?.querySelectorAll('.travel-dot');
        
        slides.forEach((slide, i) => {
            if (i === index) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
        
        dots?.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        
        // Animate fact change
        if (factElement && this.slides[index]) {
            factElement.style.animation = 'none';
            factElement.offsetHeight; // Trigger reflow
            factElement.style.animation = 'fade-in-up 0.8s ease-out';
            this.showFact(factElement, this.slides[index].fact);
        }
    },
    
    showFact(element, fact) {
        if (element && fact) {
            element.textContent = fact;
        }
    },
    
    /**
     * Stop any running slideshow
     */
    stop() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    },
};

window.TravelSystem = TravelSystem;
