const CONFIG = {
    startDate: "2024-12-16T00:00:00",
    // PASTE YOUR GOOGLE SHEET CSV LINK HERE
    sheetLink: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR5ky9E36YN2jQ9-VnEJhGWf__Atn-WZyD-lSl_o--G_e4gz2GPX4SB5Ers_BIAXsUBiFSumCI276JT/pub?output=csv"
};

// --- GAME LOGIC ---
let score = 0;
function clickHeart() {
    if (score >= 100) return;
    
    // --- MUSIC SETTINGS ---
    const audio = document.getElementById('bg-music');
    audio.volume = 0.1; // Volume set to 10% (Change to 0.3 for 30%)
    audio.play().catch(error => console.log("Music waiting for interaction..."));

    score += 10;
    document.getElementById('progress-fill').style.width = score + "%";
    document.getElementById('progress-text').innerText = score + "%";
    
    if (score >= 100) {
        document.getElementById('progress-text').innerText = "UNLOCKED! ♡";
        setTimeout(() => {
            document.getElementById('game-view').style.display = 'none';
            const dash = document.getElementById('dashboard-view');
            dash.style.display = 'flex';
            setTimeout(() => dash.style.opacity = '1', 50);
            
            startTimer();
            fetchPhotos(); 
            startHeartRain();
        }, 800);
    }
}

function startTimer() {
    // 1. Setup Date
    let startInput = CONFIG.startDate;
     Force local time to fix the 1-day bug
    if (!startInput.includes("T")) startInput += "T00:00:00";

    const start = new Date(startInput).getTime();
    const now = new Date().getTime();

    // 2. Calculate Total Days
    const difference = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const totalDays = Math.floor(difference / oneDay);

    // 3. Convert to Weeks and Days
    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;

    // 4. Display
    document.getElementById("uptime-display").innerHTML =
        `${weeks} Weeks <span class="text-pink-300 px-1">♡</span> ${days} Days`;
}

// --- SMART PHOTO FETCHER ---
async function fetchPhotos() {
    const loader = document.getElementById('loading-msg');
    const stickers = ["🧸", "🎀", "✨", "🌸", "🍓", "💌"];

    if (CONFIG.sheetLink.includes("REPLACE")) {
        // Demo Data if no link provided
        renderPhoto({ img: "https://placehold.co/400x500/pink/white?text=Add+Sheet+Link", caption: "Setup Required!", tilt: "-2deg" }, 0, stickers);
        return;
    }

    loader.style.display = 'block';

    try {
        const response = await fetch(CONFIG.sheetLink);
        const data = await response.text();
        const rows = data.split('\n').slice(1); // Skip header

        loader.style.display = 'none';

        rows.forEach((row, index) => {
            const cols = row.split(',');
            if (cols.length < 2) return;

            let imgRaw = cols[0].trim();
            const caption = cols[1] ? cols[1].trim() : "";
            const tilt = cols[2] ? cols[2].trim() : (Math.random() > 0.5 ? '2deg' : '-2deg');

            // --- THE SMART LINK FIXER ---
            // 1. Fix Google Drive Links
            if (imgRaw.includes('drive.google.com')) {
                const idMatch = imgRaw.match(/\/d\/(.*?)\//);
                if (idMatch && idMatch[1]) {
                    imgRaw = `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
                }
            }
            // 2. Fix Dropbox Links
            if (imgRaw.includes('dropbox.com')) {
                imgRaw = imgRaw.replace('dl=0', 'raw=1');
            }

            renderPhoto({ img: imgRaw, caption, tilt }, index, stickers);
        });

    } catch (error) {
        console.error(error);
        loader.innerText = "Could not load photos. Check Console.";
    }
}

function renderPhoto(photo, index, stickers) {
    const grid = document.getElementById('photo-grid');
    const randomSticker = stickers[index % stickers.length];
    // Random delay for floating effect
    const delay = Math.random() * 5;

    const html = `
        <div class="polaroid relative" style="rotate: ${photo.tilt}; animation: float 6s ease-in-out infinite; animation-delay: ${delay}s;">
            <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-pink-100/50 rotate-[-1deg]"></div>
            <div class="aspect-[4/5] w-full bg-gray-100 mb-3 overflow-hidden rounded-sm border border-gray-100">
                <img src="${photo.img}" class="w-full h-full object-cover hover:scale-110 transition-transform duration-700" loading="lazy">
            </div>
            <div class="text-center handwriting text-xl text-gray-500">${photo.caption}</div>
            <div class="absolute -bottom-3 -right-2 text-2xl filter drop-shadow-sm">${randomSticker}</div>
        </div>
    `;
    grid.innerHTML += html;
}

// --- FALLING HEARTS LOGIC ---
function createHeart() {
    const heart = document.createElement("div");
    heart.classList.add("falling-heart");
    heart.innerHTML = "🩷"; // You can change this to 🌸 or 🎀
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.animationDuration = Math.random() * 3 + 2 + "s"; // 2-5 seconds
    heart.style.fontSize = Math.random() * 10 + 10 + "px"; // Random size
    
    document.body.appendChild(heart);

    // Remove after animation to keep site fast
    setTimeout(() => {
        heart.remove();
    }, 5000);
}

// Start the rain only after entering the dashboard
// (We will call this inside the clickHeart function later)
function startHeartRain() {
    setInterval(createHeart, 300); // New heart every 300ms

}

