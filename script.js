// ১. আপনার API Keys এবং Firebase Config
const weatherApiKey = '622c4de5ee05cbfb7e93716f7b4324bf';
const newsDataApiKey = 'pub_61fbb227c3654dd99d61b192b9a26e9a';

// আপনার দেওয়া Firebase Config (Baby Project)
const firebaseConfig = {
    apiKey: "AIzaSyB3X2kp_KR96uV1Mh4vqKDKsdAQv3rXOxU",
    authDomain: "baby-75d6e.firebaseapp.com",
    projectId: "baby-75d6e",
    storageBucket: "baby-75d6e.firebasestorage.app",
    messagingSenderId: "1018260950671",
    appId: "1:1018260950671:web:12388b977b6fd9fbbf2afa",
    measurementId: "G-B70VF537LZ"
};

// ২. Firebase ইনিশিয়ালাইজ করা
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ৩. আবহাওয়া লোড করা (রাজশাহী)
async function loadWeather() {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Rajshahi&units=metric&lang=bn&appid=${weatherApiKey}`);
        const data = await res.json();
        
        if (data.cod === 200) {
            document.getElementById('temp').innerText = Math.round(data.main.temp);
            document.getElementById('desc').innerText = data.weather[0].description;
        }
    } catch (e) { 
        console.log("Weather error:", e); 
    }
}

// ৪. অটোমেটিক নিউজ (NewsData.io)
async function loadAutoNews() {
    const container = document.getElementById('api-news-container');
    // বাংলাদেশের বাংলা খবর আনার জন্য URL
    const url = `https://newsdata.io/api/1/news?apikey=${newsDataApiKey}&country=bd&language=bn`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.status === "success") {
            container.innerHTML = '';
            data.results.forEach(item => {
                // ছবি না থাকলে ডিফল্ট ছবি দেখাবে
                const image = item.image_url ? item.image_url : 'https://via.placeholder.com/300x180?text=No+Image';
                
                container.innerHTML += `
                    <div class="news-card">
                        <div class="news-img" style="background-image: url('${image}')"></div>
                        <div class="news-content">
                            <h3>${item.title}</h3>
                            <a href="${item.link}" target="_blank" class="read-more">বিস্তারিত পড়ুন <i class="fas fa-arrow-right"></i></a>
                        </div>
                    </div>`;
            });
        }
    } catch (e) { 
        console.log("NewsData API error:", e);
        container.innerHTML = "<p>বর্তমানে অটোমেটিক খবর লোড করা যাচ্ছে না।</p>"; 
    }
}

// ৫. নিজের নিউজ লোড করা (Firebase Firestore)
function loadMyNews() {
    const container = document.getElementById('my-news-container');
    
    // 'news' কালেকশন থেকে ডাটা আনবে এবং সময়ের ক্রমানুসারে সাজাবে
    db.collection("news").orderBy("timestamp", "desc").onSnapshot((snap) => {
        container.innerHTML = '';
        
        if (snap.empty) {
            container.innerHTML = "<p>এখনো কোনো অ্যাডমিন নিউজ নেই।</p>";
            return;
        }

        snap.forEach(doc => {
            const data = doc.data();
            container.innerHTML += `
                <div class="news-card special">
                    <div class="news-content">
                        <span class="badge">Admin Update</span>
                        <h3>${data.title}</h3>
                        <p>${data.content}</p>
                    </div>
                </div>`;
        });
    }, (error) => {
        console.log("Firebase error:", error);
        container.innerHTML = "<p>ফায়ারবেস কানেকশন সমস্যা।</p>";
    });
}

// পেজ লোড হলে সব ফাংশন কল হবে
window.onload = () => { 
    loadWeather(); 
    loadAutoNews(); 
    loadMyNews(); 
};