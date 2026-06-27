/**
 * CASE FILES - Main Engine
 * Orchestrates all game systems
 */

const Engine = {
    version: '0.1.0',
    
    async init() {
        console.log(`🎮 CASE FILES Engine v${this.version}`);
        
        // Initialize all systems
        AudioManager.init();
        CharacterManager.init();
        InventorySystem.init();
        UIManager.init();
        SceneManager.init();
        
        GameState.initialized = true;
        
        // Check for saved game
        const hasSave = GameState.load();
        
        // Start the game
        if (hasSave && GameState.currentCase.started) {
            // Resume from save
            this.resumeGame();
        } else {
            // Start fresh
            this.startBoot();
        }
    },
    
    /**
     * Boot sequence
     */
    async startBoot() {
        const bootScreen = document.getElementById('boot-screen');
        const bootText = bootScreen.querySelector('.boot-text');
        const scanner = bootScreen.querySelector('.scanner');
        const led = bootScreen.querySelector('.led-indicator');
        
        // Wait for dramatic pause
        await this.wait(1500);
        
        // Show boot messages
        const messages = [
            'INITIALIZING...',
            'CONNECTING...',
            'VERIFYING IDENTITY...',
        ];
        
        for (const msg of messages) {
            bootText.textContent = msg;
            bootText.classList.add('typing');
            await this.wait(1200);
            bootText.classList.remove('typing');
            bootText.textContent = '';
            await this.wait(300);
        }
        
        // Scanner animation
        scanner.classList.add('active');
        await this.wait(1500);
        
        // Welcome message
        bootText.textContent = `WELCOME AGENT ${GameState.player.agentCode}`;
        bootText.style.color = 'var(--gold)';
        bootText.classList.add('text-glow-gold');
        
        await this.wait(2000);
        
        // Transition to Chief
        await SceneManager.transitionTo('chief');
        
        // Start Chief briefing
        this.startChiefBriefing();
    },
    
    /**
     * Chief briefing sequence
     */
    async startChiefBriefing() {
        DialogueSystem.setContainer('#chief-screen .dialogue-box');
        
        const briefing = {
            start: {
                speaker: 'chief',
                text: "Agent. Good. You're here.",
                next: 'brief_1',
            },
            brief_1: {
                text: "We have a situation in Paris. A photograph has gone missing from the Musée d'Orsay.",
                next: 'brief_2',
            },
            brief_2: {
                text: "Not just any photograph. One of the last known prints of a Nadar original. Irreplaceable.",
                next: 'brief_3',
            },
            brief_3: {
                text: "Your mission: locate the photograph. Identify the thief. Recover the artifact.",
                next: 'brief_4',
            },
            brief_4: {
                text: "A courier will deliver your case file shortly. Don't keep them waiting.",
                action: 'end_briefing',
            },
        };
        
        document.addEventListener('dialogue:action', (e) => {
            if (e.detail.action === 'end_briefing') {
                this.startDoorSequence();
            }
        }, { once: true });
        
        await DialogueSystem.startConversation(briefing);
    },
    
    /**
     * Door/Courier sequence
     */
    async startDoorSequence() {
        await SceneManager.transitionTo('door');
        
        // Wait then ring doorbell
        await this.wait(1000);
        AudioManager.play('click'); // Placeholder for doorbell
        
        // Show door opening
        const door = document.querySelector('.door');
        await this.wait(500);
        door.classList.add('opening');
        
        // Show courier
        await this.wait(800);
        const courier = document.querySelector('.courier-container');
        courier.classList.add('visible');
        
        // Brief courier dialogue (typed)
        await this.wait(1000);
        
        // Courier delivers and leaves
        await this.wait(1500);
        courier.classList.remove('visible');
        
        // Transition to package
        await SceneManager.transitionTo('package');
        this.startPackageSequence();
    },
    
    /**
     * Package opening sequence
     */
    startPackageSequence() {
        const pkg = document.querySelector('.package');
        const contents = document.querySelector('.package-contents');
        
        // Make package draggable
        let isDragging = false;
        let startX, startY;
        
        pkg.addEventListener('mousedown', (e) => {
            isDragging = true;
            pkg.classList.add('dragging');
            startX = e.clientX;
            startY = e.clientY;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            pkg.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        });
        
        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            pkg.classList.remove('dragging');
            
            // Open package
            pkg.classList.add('opening');
            AudioManager.play('whoosh');
            
            setTimeout(() => {
                pkg.style.display = 'none';
                contents.classList.add('visible');
                
                // Show mission screen after brief pause
                setTimeout(() => {
                    this.showMissionScreen();
                }, 1500);
            }, 1000);
        });
    },
    
    /**
     * Mission stamp sequence
     */
    async showMissionScreen() {
        await SceneManager.transitionTo('mission');
        
        const number = document.querySelector('.mission-number');
        const title = document.querySelector('.mission-title');
        const location = document.querySelector('.mission-location');
        const stamp = document.querySelector('.mission-stamp');
        
        // Set case info
        const caseData = {
            number: '001',
            title: 'The Missing Photograph',
            location: 'Paris, France',
        };
        
        GameState.currentCase = {
            id: 'case-001-paris',
            ...caseData,
            started: true,
            startTime: Date.now(),
        };
        GameState.save();
        
        // Animate in
        await this.wait(500);
        number.textContent = caseData.number;
        number.style.animation = 'fade-in-up 0.5s ease-out';
        
        await this.wait(400);
        title.textContent = caseData.title;
        title.style.animation = 'fade-in-up 0.5s ease-out';
        
        await this.wait(400);
        location.textContent = caseData.location;
        location.style.animation = 'fade-in-up 0.5s ease-out';
        
        // Stamp
        await this.wait(800);
        AudioManager.play('click');
        stamp.classList.add('stamped');
        
        // Start investigation
        await this.wait(2000);
        this.startInvestigation();
    },
    
    /**
     * Begin main investigation
     */
    async startInvestigation() {
        // Load case data
        await this.loadCaseData('case-001-paris');
        
        // Start at first location
        await SceneManager.loadScene('musee_lobby');
    },
    
    /**
     * Load case data (would be from JSON in production)
     */
    async loadCaseData(caseId) {
        // Demo data - this would be loaded from data/case-001-paris/
        const caseData = {
            locations: [
                {
                    id: 'musee_lobby',
                    name: 'Musée d\'Orsay - Lobby',
                    unlocked: true,
                    mapX: 48,
                    mapY: 35,
                },
                {
                    id: 'musee_gallery',
                    name: 'Photography Gallery',
                    unlocked: true,
                    mapX: 52,
                    mapY: 30,
                },
                {
                    id: 'cafe_marais',
                    name: 'Café du Marais',
                    unlocked: false,
                    mapX: 60,
                    mapY: 45,
                },
            ],
            scenes: [
                {
                    id: 'musee_lobby',
                    name: 'Musée d\'Orsay - Lobby',
                    backgroundColor: 'linear-gradient(180deg, #2a2520 0%, #1a1815 100%)',
                    hotspots: [
                        {
                            id: 'brochure',
                            type: 'evidence',
                            x: 20,
                            y: 60,
                            name: 'Museum Brochure',
                            evidenceType: 'document',
                            description: 'A visitor brochure for the Musée d\'Orsay. The photography exhibition is highlighted.',
                        },
                        {
                            id: 'gallery_door',
                            type: 'travel',
                            x: 70,
                            y: 40,
                            width: 100,
                            height: 200,
                            destination: 'musee_gallery',
                            cursorType: 'default',
                        },
                    ],
                    characters: [
                        {
                            id: 'guard_pierre',
                            x: 45,
                            y: 0,
                            width: 100,
                            height: 250,
                            dialogue: {
                                start: {
                                    speaker: 'guard_pierre',
                                    text: "Bonjour. You must be the detective. I'm Pierre, head of security.",
                                    next: 'intro_2',
                                },
                                intro_2: {
                                    text: "The theft occurred last night, sometime between midnight and 6 AM. We have CCTV, but... there's a gap.",
                                    choices: [
                                        {
                                            text: "A gap in the footage?",
                                            next: 'gap_explain',
                                        },
                                        {
                                            text: "Show me where the photograph was displayed.",
                                            next: 'show_gallery',
                                            setFlag: 'asked_about_gallery',
                                        },
                                    ],
                                },
                                gap_explain: {
                                    text: "Oui. Exactly 47 minutes of nothing. The system shows no tampering, but... it's too convenient, non?",
                                    next: 'intro_2',
                                },
                                show_gallery: {
                                    text: "Of course. The photography gallery is through those doors. I'll unlock it for you.",
                                    action: 'unlock_gallery',
                                },
                            },
                        },
                    ],
                    onEnter: {
                        dialogue: {
                            start: {
                                text: "The grand lobby of the Musée d'Orsay. Morning light filters through the massive clock window above.",
                                next: 'observe',
                            },
                            observe: {
                                text: "A security guard notices you and approaches.",
                            },
                        },
                    },
                },
                {
                    id: 'musee_gallery',
                    name: 'Photography Gallery',
                    backgroundColor: 'linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)',
                    hotspots: [
                        {
                            id: 'empty_frame',
                            type: 'examine',
                            x: 50,
                            y: 40,
                            width: 80,
                            height: 100,
                            description: 'An empty frame where the Nadar photograph once hung. The mounting brackets are still intact—no signs of forced removal.',
                            cursorType: 'magnify',
                        },
                        {
                            id: 'floor_scuff',
                            type: 'evidence',
                            x: 55,
                            y: 75,
                            name: 'Scuff Marks',
                            evidenceType: 'physical',
                            description: 'Fresh scuff marks on the parquet floor. Someone was here recently... and in a hurry.',
                            cursorType: 'magnify',
                        },
                    ],
                    characters: [],
                },
            ],
            characters: [
                {
                    id: 'guard_pierre',
                    name: 'Pierre Moreau',
                    role: 'Head of Security',
                    suspect: true,
                },
            ],
            travel: {
                locations: {
                    musee_gallery: {
                        destination: 'Photography Gallery',
                        slides: [
                            {
                                fact: 'The Musée d\'Orsay was once a railway station, built for the 1900 World Fair.',
                            },
                            {
                                fact: 'It houses the world\'s largest collection of Impressionist masterpieces.',
                            },
                        ],
                    },
                },
            },
        };
        
        // Load data into systems
        GameState.locations = caseData.locations;
        SceneManager.loadCaseScenes(caseData.scenes);
        CharacterManager.loadCaseCharacters(caseData.characters);
        TravelSystem.loadTravelData(caseData.travel);
        
        // Handle custom events
        document.addEventListener('dialogue:action', (e) => {
            if (e.detail.action === 'unlock_gallery') {
                GameState.unlockLocation('musee_gallery');
                GameState.unlockLocation('cafe_marais');
            }
        });
    },
    
    /**
     * Resume saved game
     */
    resumeGame() {
        // TODO: Resume from last scene
        this.startInvestigation();
    },
    
    /**
     * Utility wait
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
};

// Start engine when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Engine.init();
});

window.Engine = Engine;
