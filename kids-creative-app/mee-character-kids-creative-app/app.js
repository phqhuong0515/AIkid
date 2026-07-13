/* ==========================================
   STORYMEE UNIVERSE - APPLICATION LOGIC
   ========================================== */

// 1. GLOBAL APPLICATION STATE
const state = {
    user: {
        username: "Gấu Ú",
        avatar: "human",
        ageGroup: "6-8", // "6-8" | "9-10" | "11-13" | "14-15"
        tier: "Guest",   // "Guest" | "Free" | "Premium"
        credits: 100,
        streak: 3,
        isSignedUp: false,
        isPremium: false
    },
    // Nhân vật Mee dạng con người
    mee: {
        type: "human",
        gender: "male",
        skinToneIndex: 1,
        customMode: false,
        customSkin: "#ffe7e6",
        customShading: "#ffcccc",
        eyeIndex: 3,
        eyebrowIndex: 1,
        noseIndex: 1,
        mouthIndex: 1,
        mood: "happy",
        rotation: 0
    },
    busPosition: "center",
    // Thú cưng Pet hiện tại của bé
    pet: {
        type: "dog",
        name: "Cún Con",
        hunger: 80,
        happiness: 90,
        clean: 75,
        energy: 85, // 9-10+
        affection: 80, // 9-10+
        accessories: [], // phụ kiện đã trang bị
        ownedAccs: [], // phụ kiện đã mua
        level: 1
    },
    // Kho dữ liệu Passport sáng tạo của bé
    passport: [],
    // Hàng đợi duyệt của Phụ huynh (Parent Moderation Queue)
    moderationQueue: [],
    // Tác phẩm trên Khám Phá Cộng Đồng (Explore Feed)
    exploreFeed: [
        { id: "e1", author: "Thỏ Ngọc", avatar: "rabbit", type: "drawing", title: "Lâu đài cà rốt bay", preview: "🐰🏰🥕", likes: 12, liked: false, comments: [{ author: "Cáo Nhỏ", text: "Đẹp quá!" }] },
        { id: "e2", author: "Cáo Nhỏ", avatar: "fox", type: "story", title: "Cuộc phiêu lưu trên Sao Hỏa", preview: "🦊🚀🔥", likes: 25, liked: false, comments: [{ author: "Gấu Ú", text: "Hay lắm!" }] },
        { id: "e3", author: "Mèo Con", avatar: "cat", type: "quiz", title: "Đố vui muông thú biển", preview: "🐱🐳❓", likes: 8, liked: false, comments: [] }
    ],
    // State của Quiz Đấu trí hiện tại
    currentQuiz: {
        questionIndex: 0,
        questions: []
    },
    // State của trò chơi Tìm điểm khác biệt
    diffGame: {
        spotsFound: [],
        totalSpots: 3
    }
};

// 2. CONFIGURATION & STATIC DATA MOCKS
const CONFIG = {
    // Thẻ tính cách (Trait Cards)
    traits: [
        { id: "food", emoji: "🍿", label: "Mê Ăn Vặt" },
        { id: "book", emoji: "📚", label: "Mọt Sách" },
        { id: "sport", emoji: "⚽", label: "Thể Thao" },
        { id: "curious", emoji: "🔍", label: "Tò Mò" },
        { id: "artist", emoji: "🎨", label: "Nghệ Sĩ" },
        { id: "dreamer", emoji: "☁️", label: "Mơ Mộng" }
    ],
    // Dữ liệu màu sắc cho Mee theo Tier
    colors: {
        Guest: ["#FFB74D", "#FF8A65", "#81C784", "#64B5F6"], // 4 màu cơ bản
        Free: ["#FFB74D", "#FF8A65", "#81C784", "#64B5F6", "#F06292", "#BA68C8", "#4DB6AC", "#D4E157"], // 8 màu
        Premium: ["#FFB74D", "#FF8A65", "#81C784", "#64B5F6", "#F06292", "#BA68C8", "#4DB6AC", "#D4E157", "gold", "cyan", "magenta", "#2C3E50"] // 12 màu + VIP
    },
    // Dữ liệu trang phục/phụ kiện theo Nhóm tuổi & Tier
    outfits: {
        "6-8": {
            Guest: [{ id: "normal", label: "Bộ Cơ Bản 👕" }, { id: "red", label: "Áo Đỏ 🔴" }],
            Free: [{ id: "normal", label: "Cơ Bản 👕" }, { id: "red", label: "Áo Đỏ 🔴" }, { id: "stripe", label: "Áo Sọc 🦓" }, { id: "hat", label: "Mũ Lưỡi Trai 🧢" }],
            Premium: [{ id: "normal", label: "Cơ Bản 👕" }, { id: "red", label: "Áo Đỏ 🔴" }, { id: "stripe", label: "Áo Sọc 🦓" }, { id: "hat", label: "Mũ Lưỡi Trai 🧢" }, { id: "crown", label: "Vương Miện Lấp Lánh 👑" }, { id: "hero", label: "Áo Choàng Siêu Nhân 🦸" }]
        },
        "9-10": {
            Guest: [{ id: "normal", label: "Cơ Bản 👕" }],
            Free: [{ id: "normal", label: "Cơ Bản 👕" }, { id: "stripe", label: "Áo Sọc 🦓" }, { id: "hat", label: "Mũ Lưỡi Trai 🧢" }, { id: "glasses", label: "Kính Cận Tròn 👓" }],
            Premium: [{ id: "normal", label: "Cơ Bản 👕" }, { id: "stripe", label: "Áo Sọc 🦓" }, { id: "hat", label: "Mũ Lưỡi Trai 🧢" }, { id: "glasses", label: "Kính Cận Tròn 👓" }, { id: "dragon", label: "Bộ Đồ Rồng Con 🐉" }, { id: "astronaut", label: "Phi Hành Gia 🚀" }]
        },
        "11-13": {
            Guest: [{ id: "normal", label: "Cơ Bản 👕" }],
            Free: [{ id: "normal", label: "Cơ Bản 👕" }, { id: "glasses", label: "Kính Cận 👓" }, { id: "scarf", label: "Khăn Len Mùa Đông 🧣" }],
            Premium: [{ id: "normal", label: "Cơ Bản 👕" }, { id: "glasses", label: "Kính Cận 👓" }, { id: "scarf", label: "Khăn Len Mùa Đông 🧣" }, { id: "cyber", label: "Kính Cyberpunk 🕶️" }, { id: "guitar", label: "Đeo Đàn Guitar 🎸" }]
        },
        "14-15": {
            Guest: [{ id: "normal", label: "Cơ Bản 👕" }],
            Free: [{ id: "normal", label: "Cơ Bản 👕" }, { id: "glasses", label: "Kính Cận 👓" }, { id: "backpack", label: "Balo Du Lịch 🎒" }],
            Premium: [{ id: "normal", label: "Cơ Bản 👕" }, { id: "glasses", label: "Kính Cận 👓" }, { id: "backpack", label: "Balo Du Lịch 🎒" }, { id: "wings", label: "Cánh Thiên Thần Phát Sáng 👼" }, { id: "dj", label: "Tai Nghe DJ Chuyên Nghiệp 🎧" }]
        }
    },
    // Dữ liệu loại Thú Cưng
    pets: {
        "6-8": [
            { type: "dog", label: "Chó Con 🐶", isPremium: false },
            { type: "cat", label: "Mèo Con 🐱", isPremium: false },
            { type: "rabbit", label: "Thỏ Ngọc 🐰", isPremium: false },
            { type: "bird", label: "Chim Sáo 🐦", isPremium: false },
            { type: "hamster", label: "Chuột Ú 🐹", isPremium: false },
            { type: "turtle", label: "Rùa Nhỏ 🐢", isPremium: false }
        ],
        "9-10": [
            { type: "dog", label: "Chó Con 🐶", isPremium: false },
            { type: "cat", label: "Mèo Con 🐱", isPremium: false },
            { type: "dinosaur", label: "Khủng Long 🦖", isPremium: false },
            { type: "dragon", label: "Rồng Con 🐉", isPremium: true },
            { type: "slime", label: "Slime Xanh 💧", isPremium: true },
            { type: "robot", label: "Robot Pet 🤖", isPremium: true }
        ],
        "11-13": [
            { type: "dog", label: "Chó Con 🐶", isPremium: false },
            { type: "cat", label: "Mèo Con 🐱", isPremium: false },
            { type: "dragon", label: "Rồng Con 🐉", isPremium: true },
            { type: "phoenix", label: "Phượng Hoàng 🦅", isPremium: true }
        ],
        "14-15": [
            { type: "dog", label: "Chó Con 🐶", isPremium: false },
            { type: "cat", label: "Mèo Con 🐱", isPremium: false },
            { type: "dragon", label: "Rồng Con 🐉", isPremium: true },
            { type: "phoenix", label: "Phượng Hoàng 🦅", isPremium: true }
        ]
    },
    // Cửa hàng đồ Pet
    petShop: [
        { id: "ball", emoji: "⚽", label: "Quả bóng đá", price: 20 },
        { id: "bone", emoji: "🦴", label: "Khúc xương ngon", price: 15 },
        { id: "mouse", emoji: "🐭", label: "Chuột đồ chơi", price: 10 },
        { id: "crown_pet", emoji: "👑", label: "Bờm tuần lộc", price: 50 }
    ],
    // Dữ liệu các câu hỏi Quiz Đấu Trí theo độ tuổi
    quizzes: {
        "6-8": [
            { q: "Động vật nào sau đây bay lượn được trên trời?", options: ["Cá vàng", "Đại bàng", "Sư tử"], correct: 1, exp: "Đúng rồi! Đại Bàng có đôi cánh rộng để bay lượn trên cao." },
            { q: "Quả chuối chín thường có màu gì?", options: ["Xanh da trời", "Đỏ tươi", "Vàng ươm"], correct: 2, exp: "Chuẩn rồi! Chuối chín có màu vàng ngon ngọt." },
            { q: "Khi đi học về bé gặp người lớn phải làm gì?", options: ["Khoanh tay chào lễ phép", "Bỏ chạy đi chơi", "Hét thật to"], correct: 0, exp: "Lễ phép chào hỏi là bé ngoan!" }
        ],
        "9-10": [
            { q: "Hành tinh nào được gọi là Hành Tinh Đỏ?", options: ["Sao Kim", "Sao Hỏa", "Sao Mộc"], correct: 1, exp: "Sao Hỏa chứa nhiều Oxit Sắt tạo nên màu đỏ đặc trưng." },
            { q: "Nước đóng băng thành đá ở bao nhiêu độ C?", options: ["0 độ C", "100 độ C", "-10 độ C"], correct: 0, exp: "Chính xác, ở 0 độ C nước đóng băng." },
            { q: "Đại dương có diện tích lớn nhất Trái Đất là?", options: ["Đại Tây Dương", "Thái Bình Dương", "Ấn Độ Dương"], correct: 1, exp: "Thái Bình Dương rộng lớn nhất hành tinh." }
        ],
        "11-13": [
            { q: "Thành phần khí gas chiếm phần lớn trong bầu khí quyển Trái Đất?", options: ["Khí Oxy", "Khí Nitơ", "Khí Carbonic"], correct: 1, exp: "Khí Nitơ chiếm khoảng 78% bầu khí quyển." },
            { q: "Công thức hóa học của nước tinh khiết là gì?", options: ["CO2", "H2O", "NaCl"], correct: 1, exp: "H2O gồm 2 nguyên tử Hydro và 1 nguyên tử Oxy." },
            { q: "Vị vua nào đã ban chiếu dời đô về Thăng Long?", options: ["Lý Thái Tổ", "Đinh Tiên Hoàng", "Trần Nhân Tông"], correct: 0, exp: "Lý Công Uẩn (Lý Thái Tổ) dời đô năm 1010." }
        ],
        "14-15": [
            { q: "Thuyết Tương đối nổi tiếng do nhà bác học nào phát minh?", options: ["Isaac Newton", "Albert Einstein", "Stephen Hawking"], correct: 1, exp: "Thuyết tương đối hẹp và rộng được Einstein phát biểu." },
            { q: "ADN (Axit deoxyribonucleic) có cấu trúc dạng gì?", options: ["Dạng vòng tròn phẳng", "Dạng xoắn kép song song", "Dạng mạch thẳng đơn"], correct: 1, exp: "Watson và Crick phát hiện ra cấu trúc xoắn kép năm 1953." },
            { q: "Tác phẩm lịch sử 'Đại Việt Sử Ký Toàn Thư' do ai biên soạn?", options: ["Ngô Sĩ Liên", "Lê Văn Hưu", "Trần Trọng Kim"], correct: 0, exp: "Sử gia Ngô Sĩ Liên chủ trì biên soạn triều Lê Thánh Tông." }
        ]
    },
    // Bình luận template an toàn theo độ tuổi
    commentTemplates: {
        "6-8": [], // Nhóm 6-8 không có tương tác xã hội
        "9-10": [], // Nhóm 9-10 chỉ xem, đăng bài không like/comment
        "11-13": ["Đẹp quá!", "Sáng tạo ghê!", "Hay lắm!", "Tuyệt vời bé ơi!", "Nhìn ngộ nghĩnh quá!", "Mee của bạn chất thật!", "Pet đáng yêu ghê!", "Thích truyện này quá!", "Bạn làm thế nào vậy?", "Chia sẻ thêm nhé!"],
        "14-15": ["Đẹp quá!", "Sáng tạo ghê!", "Hay lắm!", "Phần kết hay rất bất ngờ!", "Mình muốn xem tiếp tập sau!", "Soundtrack mix nghe đỉnh thật!", "Storyboard phân cảnh logic quá!", "Vẽ nét chuyên nghiệp ghê!", "Outfit Mee nhìn phong cách!", "Bình chọn cho tác phẩm này!"]
    },
    // Bài giảng trong Học Viện
    academyCourses: {
        "6-8": [
            { id: "draw_base", title: "Học Vẽ Cơ Bản 🌱", desc: "Cách vẽ các hình khối đơn giản và tô màu cơ bản.", lessons: 5, status: "Đang học" },
            { id: "story_base", title: "Học Kể Chuyện 🌱", desc: "Lắp ghép các câu từ để tạo thành câu chuyện nhỏ.", lessons: 6, status: "Chưa học" }
        ],
        "9-10": [
            { id: "draw_base", title: "Học Vẽ Cơ Bản 🌱", desc: "Cách vẽ các hình khối đơn giản.", lessons: 5, status: "Hoàn thành" },
            { id: "story_base", title: "Học Kể Chuyện 🌱", desc: "Tập viết đoạn văn kể chuyện ngắn.", lessons: 6, status: "Đang học" },
            { id: "mee_design", title: "Thiết Kế Nhân Vật 🌿", desc: "Phác thảo ngoại hình và đặt tính cách cho nhân vật.", lessons: 8, status: "Chưa học" }
        ],
        "11-13": [
            { id: "draw_base", title: "Học Vẽ Cơ Bản 🌱", desc: "Cách vẽ hình khối.", lessons: 5, status: "Hoàn thành" },
            { id: "story_base", title: "Học Kể Chuyện 🌱", desc: "Kể chuyện dài.", lessons: 6, status: "Hoàn thành" },
            { id: "comic_create", title: "Làm Truyện Tranh 🌳", desc: "Kỹ năng phân khung panel và viết lời thoại.", lessons: 10, status: "Đang học" }
        ],
        "14-15": [
            { id: "draw_base", title: "Học Vẽ Cơ Bản 🌱", desc: "Cách vẽ.", lessons: 5, status: "Hoàn thành" },
            { id: "movie_making", title: "Làm Phim Hoạt Hình 🏆", desc: "Dựng kịch bản, thu âm, làm chuyển động ngắn.", lessons: 12, status: "Đang học" }
        ]
    }
};

// SVG Assets cho Avatar Mee
// Cấu hình các tùy chọn cho Nhân vật đại diện Mii-Style
const MII_OPTIONS = {
    face: [
        { id: "face1", label: "Mũm mĩm", preview: `<ellipse cx="50" cy="30" rx="22" ry="20" fill="#FFD0A1"/><circle cx="43" cy="29" r="1.8" fill="#000"/><circle cx="57" cy="29" r="1.8" fill="#000"/><path d="M46,35 Q50,39 54,35" stroke="#000" stroke-width="1.5" fill="none"/>` },
        { id: "face2", label: "Má hồng", preview: `<ellipse cx="50" cy="30" rx="22" ry="20" fill="#FFD0A1"/><circle cx="43" cy="29" r="1.8" fill="#000"/><circle cx="57" cy="29" r="1.8" fill="#000"/><path d="M46,35 Q50,39 54,35" stroke="#000" stroke-width="1.5" fill="none"/><ellipse cx="34" cy="34" rx="4" ry="2" fill="#F43F5E" opacity="0.4"/><ellipse cx="66" cy="34" rx="4" ry="2" fill="#F43F5E" opacity="0.4"/>` },
        { id: "face3", label: "Tàn nhang", preview: `<ellipse cx="50" cy="30" rx="22" ry="20" fill="#FFD0A1"/><circle cx="43" cy="29" r="1.8" fill="#000"/><circle cx="57" cy="29" r="1.8" fill="#000"/><path d="M46,35 Q50,39 54,35" stroke="#000" stroke-width="1.5" fill="none"/><circle cx="34" cy="33" r="0.6" fill="#78350F"/><circle cx="36" cy="34" r="0.6" fill="#78350F"/><circle cx="64" cy="33" r="0.6" fill="#78350F"/><circle cx="66" cy="34" r="0.6" fill="#78350F"/>` },
        { id: "face4", label: "Má đỏ", preview: `<ellipse cx="50" cy="30" rx="22" ry="20" fill="#FFD0A1"/><circle cx="43" cy="29" r="1.8" fill="#000"/><circle cx="57" cy="29" r="1.8" fill="#000"/><path d="M46,35 Q50,39 54,35" stroke="#000" stroke-width="1.5" fill="none"/><circle cx="34" cy="34" r="3" fill="#EF4444" opacity="0.3"/><circle cx="66" cy="34" r="3" fill="#EF4444" opacity="0.3"/>` }
    ],
    hair: {
        bangs: [
            { id: "bangs1", label: "Mái ngố", preview: `<path d="M35,36 Q50,44 65,36 C67,27 61,22 50,22 C39,22 33,27 35,36 Z" fill="#1A1A1A"/>` },
            { id: "bangs2", label: "Mái xéo", preview: `<path d="M35,36 Q60,43 65,31 C67,24 59,22 50,22 C41,22 33,27 35,36 Z" fill="#1A1A1A"/>` },
            { id: "bangs3", label: "Mái rẽ ngôi", preview: `<path d="M35,36 L41,34 L44,38 L50,32 L56,38 L59,34 L65,36 C67,27 61,22 50,22 C39,22 33,27 35,36 Z" fill="#1A1A1A"/>` },
            { id: "bangs4", label: "Mái xoăn", preview: `<path d="M35,36 Q40,40 45,36 Q50,40 55,36 Q60,40 65,36 C67,27 61,22 50,22 C39,22 33,27 35,36 Z" fill="#1A1A1A"/>` }
        ],
        back: [
            { id: "back1", label: "Tóc ngắn / Trọc", preview: `<circle cx="50" cy="30" r="12" fill="#1A1A1A" opacity="0.1"/><text x="50" y="34" font-size="9" text-anchor="middle" fill="#718096" font-family="sans-serif">Không</text>` },
            { id: "back2", label: "Tóc Bob ngắn", preview: `<path d="M32,36 C25,42 25,51 31,58 C34,61 66,61 69,58 C75,51 75,42 68,36 C64,31 36,31 32,36 Z" fill="#1A1A1A"/>` },
            { id: "back3", label: "Tóc dài ngang vai", preview: `<path d="M32,36 C25,42 26,58 28,68 C30,74 37,76 41,70 L59,70 C63,76 70,74 72,68 C74,58 75,42 68,36 C64,31 36,31 32,36 Z" fill="#1A1A1A"/>` },
            { id: "back4", label: "Tóc hai bím", preview: `<circle cx="32" cy="31" r="7" fill="#1A1A1A"/><circle cx="68" cy="31" r="7" fill="#1A1A1A"/><path d="M36,36 C32,31 68,31 64,36" stroke="#1A1A1A" stroke-width="3"/>` }
        ],
        sets: [
            { id: "set1", bangs: "bangs3", back: "back1", label: "Cá tính", preview: `<circle cx="50" cy="35" r="15" fill="#E2E8F0"/><path d="M40,32 L44,30 L46,34 L50,28 L54,34 L56,30 L60,32 C61,25 57,21 50,21 C43,21 39,25 40,32 Z" fill="#1A1A1A"/>` },
            { id: "set2", bangs: "bangs1", back: "back2", label: "Búp bê Bob", preview: `<path d="M36,34 C31,39 31,46 35,51 L65,51 C69,46 69,39 64,34 Z" fill="#1A1A1A"/><path d="M40,32 Q50,39 60,32 C61,25 57,21 50,21 C43,21 39,25 40,32 Z" fill="#1A1A1A"/>` },
            { id: "set3", bangs: "bangs4", back: "back3", label: "Công chúa", preview: `<path d="M36,34 C31,39 31,49 33,56 L67,56 C69,49 69,39 64,34 Z" fill="#1A1A1A"/><path d="M40,32 Q45,35 50,32 Q55,35 60,32 C61,25 57,21 50,21 C43,21 39,25 40,32 Z" fill="#1A1A1A"/>` },
            { id: "set4", bangs: "bangs2", back: "back4", label: "Nhí nhảnh", preview: `<circle cx="32" cy="26" r="5" fill="#1A1A1A"/><circle cx="68" cy="26" r="5" fill="#1A1A1A"/><path d="M40,32 Q60,39 58,28 C59,23 55,21 50,21 C45,21 41,23 40,32 Z" fill="#1A1A1A"/>` }
        ]
    },
    eyes: [
        { id: "style1", label: "Mắt to tròn", preview: `<circle cx="38" cy="30" r="4" fill="#1A1A1A"/><circle cx="62" cy="30" r="4" fill="#1A1A1A"/><circle cx="37" cy="28" r="1.2" fill="#FFF"/><circle cx="61" cy="28" r="1.2" fill="#FFF"/>` },
        { id: "style2", label: "Mắt cười", preview: `<path d="M34,31 Q38,26 42,31" stroke="#1A1A1A" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M58,31 Q62,26 66,31" stroke="#1A1A1A" stroke-width="1.8" fill="none" stroke-linecap="round"/>` },
        { id: "style3", label: "Mi cong ✨", preview: `<circle cx="38" cy="30" r="4.5" fill="#1A1A1A"/><circle cx="62" cy="30" r="4.5" fill="#1A1A1A"/><circle cx="37" cy="28" r="1.5" fill="#FFF"/><circle cx="61" cy="28" r="1.5" fill="#FFF"/><path d="M32,28 Q35,24 40,26" stroke="#1A1A1A" stroke-width="1.5" fill="none"/><path d="M68,28 Q65,24 60,26" stroke="#1A1A1A" stroke-width="1.5" fill="none"/>` },
        { id: "style4", label: "Nháy mắt 😉", preview: `<circle cx="38" cy="30" r="4" fill="#1A1A1A"/><circle cx="37" cy="28" r="1.2" fill="#FFF"/><path d="M58,30 Q62,33 66,30" stroke="#1A1A1A" stroke-width="1.8" fill="none" stroke-linecap="round"/>` },
        { id: "style5", label: "Ngạc nhiên", preview: `<circle cx="38" cy="30" r="5" fill="#FFF" stroke="#1A1A1A" stroke-width="1.2"/><circle cx="62" cy="30" r="5" fill="#FFF" stroke="#1A1A1A" stroke-width="1.2"/><circle cx="38" cy="30" r="2" fill="#1A1A1A"/><circle cx="62" cy="30" r="2" fill="#1A1A1A"/>` },
        { id: "style6", label: "Mắt kính", preview: `<circle cx="38" cy="30" r="3.5" fill="#1A1A1A"/><circle cx="62" cy="30" r="3.5" fill="#1A1A1A"/><circle cx="36" cy="30" r="7" fill="none" stroke="#EF4444" stroke-width="1.5"/><circle cx="64" cy="30" r="7" fill="none" stroke="#EF4444" stroke-width="1.5"/><line x1="43" y1="30" x2="57" y2="30" stroke="#EF4444" stroke-width="1.5"/>` }
    ],
    nose: [
        { id: "style1", label: "Mũi nút", preview: `<ellipse cx="50" cy="30" rx="3" ry="1.5" fill="#00000030"/>` },
        { id: "style2", label: "Mũi tam giác", preview: `<polygon points="50,27 47,32 53,32" fill="#00000030"/>` },
        { id: "style3", label: "Mũi thanh tú", preview: `<path d="M49,27 L51,27 L51,32 L48,32" stroke="#00000035" stroke-width="2" fill="none" stroke-linecap="round"/>` },
        { id: "style4", label: "Mũi bóng", preview: `<ellipse cx="50" cy="30" rx="4" ry="2.2" fill="#00000030"/><ellipse cx="48.8" cy="29" rx="1" ry="0.6" fill="#FFF" opacity="0.6"/>` }
    ],
    mouth: [
        { id: "style1", label: "Cười tươi", preview: `<path d="M42,28 Q50,37 58,28 Z" fill="#E53E3E"/><path d="M45,32 Q50,37 55,32" fill="#F687B3"/><path d="M42,28 Q50,37 58,28" stroke="#1A1A1A" stroke-width="1.5" fill="none"/>` },
        { id: "style2", label: "Mèo :3", preview: `<path d="M43,30 Q46.5,32.5 50,30 Q53.5,32.5 57,30" stroke="#1A1A1A" stroke-width="2" fill="none" stroke-linecap="round"/>` },
        { id: "style3", label: "Cười giòn", preview: `<path d="M42,27 Q50,39 58,27 Z" fill="#1A1A1A"/><path d="M45,33 Q50,38 55,33" fill="#EF4444"/><line x1="42" y1="27" x2="58" y2="27" stroke="#1A1A1A" stroke-width="1.5"/>` },
        { id: "style4", label: "Mỉm chi", preview: `<path d="M44,30 Q48,33 56,28" stroke="#1A1A1A" stroke-width="1.8" fill="none" stroke-linecap="round"/>` },
        { id: "style5", label: "Chữ O", preview: `<circle cx="50" cy="30" r="3.5" fill="#1A1A1A"/>` },
        { id: "style6", label: "Nghiêm túc", preview: `<line x1="43" y1="30" x2="57" y2="30" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round"/>` }
    ],
    outfit: [
        { id: "style1", label: "Cổ tròn", preview: `<path d="M30,50 C30,50 38,43 50,43 C62,43 70,50 70,50 L74,70 L26,70 Z" fill="#5A67D8"/><path d="M42,43 C42,47 58,47 58,43 Z" fill="#FFD0A1"/>` },
        { id: "style2", label: "Kẻ sọc", preview: `<path d="M30,50 C30,50 38,43 50,43 C62,43 70,50 70,50 L74,70 L26,70 Z" fill="#5A67D8"/><path d="M42,43 C42,47 58,47 58,43 Z" fill="#FFD0A1"/><line x1="28" y1="56" x2="72" y2="56" stroke="#FFF" stroke-width="3"/><line x1="26" y1="63" x2="74" y2="63" stroke="#FFF" stroke-width="3"/>` },
        { id: "style3", label: "Cổ tim V", preview: `<path d="M30,50 C30,50 38,43 50,43 C62,43 70,50 70,50 L74,70 L26,70 Z" fill="#5A67D8"/><path d="M42,43 L50,52 L58,43 Z" fill="#FFD0A1"/><polygon points="42,43 47,48 50,43" fill="#FFF"/><polygon points="58,43 53,48 50,43" fill="#FFF"/>` },
        { id: "style4", label: "Hoodie", preview: `<path d="M30,50 C30,50 38,43 50,43 C62,43 70,50 70,50 L74,70 L26,70 Z" fill="#5A67D8"/><path d="M42,43 C42,47 58,47 58,43 Z" fill="#FFD0A1"/><line x1="47" y1="46" x2="47" y2="55" stroke="#FFF" stroke-width="1.2"/><line x1="53" y1="46" x2="53" y2="55" stroke="#FFF" stroke-width="1.2"/><circle cx="47" cy="56" r="0.8" fill="#FFF"/><circle cx="53" cy="56" r="0.8" fill="#FFF"/>` },
        { id: "style5", label: "Hình sao 🌟", preview: `<path d="M30,50 C30,50 38,43 50,43 C62,43 70,50 70,50 L74,70 L26,70 Z" fill="#5A67D8"/><path d="M42,43 C42,47 58,47 58,43 Z" fill="#FFD0A1"/><polygon points="50,49 51,52 54,52 51.5,54 52.5,57 50,55 47.5,57 48.5,54 46,52 49,52" fill="#FFF"/>` },
        { id: "style6", label: "Hình tim ❤️", preview: `<path d="M30,50 C30,50 38,43 50,43 C62,43 70,50 70,50 L74,70 L26,70 Z" fill="#5A67D8"/><path d="M42,43 C42,47 58,47 58,43 Z" fill="#FFD0A1"/><path d="M50,51 C49,49 46.5,49 46.5,51.5 C46.5,54.5 50,57.5 50,57.5 C50,57.5 53.5,54.5 53.5,51.5 C53.5,49 51,49 50,51 Z" fill="#FFF"/>` }
    ]
};

// Hàm sinh mã nguồn SVG động của nhân vật người ghép lớp
function renderHumanSVG(mee) {
    const gender = mee.gender || "male";
    const skinToneIndex = mee.skinToneIndex || 1;
    const customMode = mee.customMode !== undefined ? mee.customMode : false;
    const customSkin = mee.customSkin || "#ffe7e6";
    const customShading = mee.customShading || "#ffcccc";
    const eyeIndex = mee.eyeIndex || 3;
    const eyebrowIndex = mee.eyebrowIndex || 1;
    const rotation = mee.rotation || 0;

    let svgContent = "";
    if (customMode) {
        svgContent = SVG_DATABASE["base"][gender];
    } else {
        svgContent = SVG_DATABASE["presets"][gender][skinToneIndex];
    }

    if (!svgContent) return "";

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const svgElement = doc.documentElement;

    if (customMode) {
        // 1. Update fills for cls-6 (skin) and cls-7 (shadow)
        svgElement.querySelectorAll(".cls-6").forEach(el => el.style.fill = customSkin);
        svgElement.querySelectorAll(".cls-7").forEach(el => el.style.fill = customShading);

        // 2. Interpolate linear-gradient for legs/body shading transition
        const linearGrad = svgElement.querySelector("#linear-gradient");
        if (linearGrad) {
            const stops = linearGrad.querySelectorAll("stop");
            if (stops.length >= 5) {
                stops[0].setAttribute("stop-color", customSkin);
                stops[1].setAttribute("stop-color", customizerLerpColor(customSkin, customShading, 0.59));
                stops[2].setAttribute("stop-color", customizerLerpColor(customSkin, customShading, 0.8));
                stops[3].setAttribute("stop-color", customizerLerpColor(customSkin, customShading, 0.95));
                stops[4].setAttribute("stop-color", customShading);
            }
        }

        // 3. Update all stop-colors in linear-gradient-3 to customShading
        const linearGrad3 = svgElement.querySelector("#linear-gradient-3");
        if (linearGrad3) {
            linearGrad3.querySelectorAll("stop").forEach(stop => {
                stop.setAttribute("stop-color", customShading);
            });
        }

        // 4. Inject component transfer filter for custom ear shading
        let defs = svgElement.querySelector("defs");
        if (!defs) {
            defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            svgElement.insertBefore(defs, svgElement.firstChild);
        }

        let filter = defs.querySelector("#custom-ear-filter");
        if (!filter) {
            filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
            filter.setAttribute("id", "custom-ear-filter");
            
            const feGray = document.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
            feGray.setAttribute("type", "matrix");
            feGray.setAttribute("values", "0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0");
            feGray.setAttribute("result", "gray");
            filter.appendChild(feGray);
            
            const feTransfer = document.createElementNS("http://www.w3.org/2000/svg", "feComponentTransfer");
            feTransfer.setAttribute("in", "gray");
            
            const feFuncR = document.createElementNS("http://www.w3.org/2000/svg", "feFuncR");
            feFuncR.setAttribute("type", "linear");
            feFuncR.setAttribute("id", "custom-ear-funcR");
            feTransfer.appendChild(feFuncR);
            
            const feFuncG = document.createElementNS("http://www.w3.org/2000/svg", "feFuncG");
            feFuncG.setAttribute("type", "linear");
            feFuncG.setAttribute("id", "custom-ear-funcG");
            feTransfer.appendChild(feFuncG);
            
            const feFuncB = document.createElementNS("http://www.w3.org/2000/svg", "feFuncB");
            feFuncB.setAttribute("type", "linear");
            feFuncB.setAttribute("id", "custom-ear-funcB");
            feTransfer.appendChild(feFuncB);
            
            filter.appendChild(feTransfer);
            defs.appendChild(filter);
        }

        const funcR = filter.querySelector("#custom-ear-funcR");
        const funcG = filter.querySelector("#custom-ear-funcG");
        const funcB = filter.querySelector("#custom-ear-funcB");

        if (funcR && funcG && funcB) {
            const r_skin = parseInt(customSkin.substring(1, 3), 16) / 255;
            const g_skin = parseInt(customSkin.substring(3, 5), 16) / 255;
            const b_skin = parseInt(customSkin.substring(5, 7), 16) / 255;

            const r_shadow = parseInt(customShading.substring(1, 3), 16) / 255;
            const g_shadow = parseInt(customShading.substring(3, 5), 16) / 255;
            const b_shadow = parseInt(customShading.substring(5, 7), 16) / 255;

            funcR.setAttribute("slope", r_skin - r_shadow);
            funcR.setAttribute("intercept", r_shadow);
            funcG.setAttribute("slope", g_skin - g_shadow);
            funcG.setAttribute("intercept", g_shadow);
            funcB.setAttribute("slope", b_skin - b_shadow);
            funcB.setAttribute("intercept", b_shadow);
        }

        // Apply filter to ears
        svgElement.querySelectorAll("image").forEach(img => {
            img.setAttribute("filter", "url(#custom-ear-filter)");
        });
    }

    // 5. Inject eyebrows, eyes, nose & mouth after head ellipse
    const head = svgElement.querySelector("ellipse.cls-6");
    if (head) {
        let lastElement = head;

        if (eyebrowIndex > 0 && FACIAL_DATABASE.eyebrows) {
            const eyebrowItem = FACIAL_DATABASE.eyebrows[eyebrowIndex - 1];
            if (eyebrowItem) {
                const eyebrowsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                eyebrowsGroup.setAttribute("id", "custom-eyebrows");
                const dx = 52.31;
                const dy = 72.435 - eyebrowItem.y_center;
                eyebrowsGroup.setAttribute("transform", `translate(${dx}, ${dy})`);
                eyebrowsGroup.innerHTML = eyebrowItem.left.join("") + eyebrowItem.right.join("");
                lastElement.insertAdjacentElement('afterend', eyebrowsGroup);
                lastElement = eyebrowsGroup;
            }
        }
        
        if (eyeIndex > 0 && FACIAL_DATABASE.eyes) {
            const eyeItem = FACIAL_DATABASE.eyes[eyeIndex - 1];
            if (eyeItem) {
                const eyesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                eyesGroup.setAttribute("id", "custom-eyes");
                const dx = 52.30;
                const dy = 87.37 - eyeItem.y_center;
                eyesGroup.setAttribute("transform", `translate(${dx}, ${dy})`);
                eyesGroup.innerHTML = eyeItem.left.join("") + eyeItem.right.join("");
                lastElement.insertAdjacentElement('afterend', eyesGroup);
                lastElement = eyesGroup;
            }
        }

        const noseIndex = mee.noseIndex || 1;
        if (noseIndex > 0 && FACIAL_DATABASE.noses) {
            const noseItem = FACIAL_DATABASE.noses[noseIndex - 1];
            if (noseItem) {
                const noseGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                noseGroup.setAttribute("id", "custom-nose");
                const dx = 52.30;
                const dy = 99.0 - noseItem.y_center;
                noseGroup.setAttribute("transform", `translate(${dx}, ${dy})`);
                noseGroup.innerHTML = noseItem.left.join("") + (noseItem.right ? noseItem.right.join("") : "");
                lastElement.insertAdjacentElement('afterend', noseGroup);
                lastElement = noseGroup;
            }
        }

        const mouthIndex = mee.mouthIndex || 1;
        if (mouthIndex > 0 && FACIAL_DATABASE.mouths) {
            const mouthItem = FACIAL_DATABASE.mouths[mouthIndex - 1];
            if (mouthItem) {
                const mouthGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                mouthGroup.setAttribute("id", "custom-mouth");
                const dx = 52.30;
                const dy = 112.0 - mouthItem.y_center;
                mouthGroup.setAttribute("transform", `translate(${dx}, ${dy})`);
                mouthGroup.innerHTML = mouthItem.left.join("") + (mouthItem.right ? mouthItem.right.join("") : "");
                lastElement.insertAdjacentElement('afterend', mouthGroup);
                lastElement = mouthGroup;
            }
        }
    }

    // 6. Apply rotation if needed
    if (rotation !== 0) {
        const wrapper = document.createElementNS("http://www.w3.org/2000/svg", "g");
        wrapper.setAttribute("transform", `rotate(${rotation}, 90, 220)`);
        while (svgElement.firstChild) {
            wrapper.appendChild(svgElement.firstChild);
        }
        svgElement.appendChild(wrapper);
    }

    return svgElement.outerHTML;
}

// SVG Assets cho Avatar Mee
const AVATAR_SVGS = {
    bear: (color) => `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="${color}"/><circle cx="30" cy="25" r="12" fill="#E65100"/><circle cx="70" cy="25" r="12" fill="#E65100"/><circle cx="40" cy="45" r="4" fill="#000"/><circle cx="60" cy="45" r="4" fill="#000"/><ellipse cx="50" cy="55" rx="10" ry="7" fill="#FFE0B2"/><ellipse cx="50" cy="54" rx="4" ry="2" fill="#000"/></svg>`,
    cat: (color) => `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="${color}"/><path d="M20,25 L40,35 L25,45 Z" fill="#00796B"/><path d="M80,25 L60,35 L75,45 Z" fill="#00796B"/><circle cx="38" cy="48" r="4" fill="#000"/><circle cx="62" cy="48" r="4" fill="#000"/><ellipse cx="50" cy="55" rx="6" ry="4" fill="#FF8A80"/><path d="M45,60 Q50,65 55,60" stroke="#000" stroke-width="3" fill="none"/></svg>`,
    fox: (color) => `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="${color}"/><path d="M15,20 L35,35 L18,48 Z" fill="#D84315"/><path d="M85,20 L65,35 L82,48 Z" fill="#D84315"/><circle cx="36" cy="48" r="4" fill="#000"/><circle cx="64" cy="48" r="4" fill="#000"/><polygon points="50,56 45,50 55,50" fill="#000"/><path d="M42,62 Q50,68 58,62" stroke="#D84315" stroke-width="2" fill="none"/></svg>`,
    rabbit: (color) => `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="${color}"/><ellipse cx="35" cy="20" rx="8" ry="22" fill="#C2185B"/><ellipse cx="65" cy="20" rx="8" ry="22" fill="#C2185B"/><circle cx="38" cy="48" r="4" fill="#000"/><circle cx="62" cy="48" r="4" fill="#000"/><ellipse cx="50" cy="55" rx="5" ry="3" fill="#F06292"/><path d="M45,60 Q50,63 55,60" stroke="#000" stroke-width="2" fill="none"/></svg>`,
    human: (color) => renderHumanSVG(state.mee)
};

// 3. INITIALIZATION & ROUTING CONTROL
document.addEventListener("DOMContentLoaded", () => {
    initDOM();
    bindEvents();
    initAppFlow();
});

let dom = {};
function initDOM() {
    dom = {
        welcomeScreen: document.getElementById("onboard-modal"),
        appBoard: document.getElementById("app-board"),
        enterAppBtn: document.getElementById("enter-app-btn"),
        avatarCards: document.querySelectorAll(".avatar-card"),
        welcomeAgeBtns: document.querySelectorAll(".age-select-btn"),
        welcomeTierBtns: document.querySelectorAll(".tier-select-btn"),
        
        // Header
        headerAgeBadge: document.getElementById("header-age-badge"),
        headerTierBadge: document.getElementById("header-tier-badge"),
        headerAvatarContainer: document.getElementById("header-avatar-container"),
        headerUsername: document.getElementById("header-username"),
        streakCount: document.getElementById("streak-count"),
        coinCount: document.getElementById("coin-count"),
        debugAgeBtns: document.querySelectorAll(".debug-age-btn"),
        debugTierBtns: document.querySelectorAll(".debug-tier-btn"),
        btnSignupHeader: document.getElementById("header-signup-btn"),
        btnUpgradeHeader: document.getElementById("header-upgrade-btn"),
        btnPassportHeader: document.getElementById("header-passport-btn"),
        btnParentHeader: document.getElementById("header-parent-btn"),

        // World Map & Detal viewport
        worldMapScreen: document.getElementById("world-map-screen"),
        mapZones: document.querySelectorAll(".map-hotspot"),
        busVehicle: document.getElementById("bus-vehicle"),
        btnBusLeft: document.getElementById("btn-bus-left"),
        btnBusRight: document.getElementById("btn-bus-right"),
        zoneCards: document.querySelectorAll(".zone-card"),
        zoneDetailViewport: document.getElementById("zone-detail-viewport"),
        btnBackToMap: document.getElementById("btn-back-to-map"),
        
        // Detal Panels
        panelMee: document.getElementById("panel-mee"),
        panelPet: document.getElementById("panel-pet"),
        panelArt: document.getElementById("panel-art"),
        panelBrain: document.getElementById("panel-brain"),
        panelAcademy: document.getElementById("panel-academy"),
        panelExplore: document.getElementById("panel-explore"),
        panelPassport: document.getElementById("panel-passport"),
        panelParent: document.getElementById("panel-parent"),

        // Mee Builder Inputs
        meeBuilderAvatarPreview: document.getElementById("human-avatar-preview"),
        meeBuilderMoodText: document.getElementById("mee-builder-mood-text"),
        meeTypeSelector: document.getElementById("mee-type-selector"),
        meeColorSelector: document.getElementById("mee-color-selector"),
        meeOutfitSelector: document.getElementById("mee-outfit-selector"),
        meeTraitsContainer: document.getElementById("mee-traits-container"),
        meeSlidersSection: document.getElementById("mee-sliders-section"),
        meeMoodsSection: document.getElementById("mee-moods-section"),
        meeStoryArcSection: document.getElementById("mee-storyarc-section"),
        meeStoryArcInput: document.getElementById("mee-storyarc-input"),
        btnSaveMee: document.getElementById("btn-save-mee"),
        btnSaveStoryArc: document.getElementById("btn-save-storyarc"),
        
        // Mee custom drawing canvas
        meeCustomDrawSection: document.getElementById("mee-custom-draw-section"),
        meeDrawCanvas: document.getElementById("mee-draw-canvas"),
        meeDrawColor: document.getElementById("mee-draw-color"),
        btnMeeDrawClear: document.getElementById("btn-mee-draw-clear"),
        btnMeeDrawSave: document.getElementById("btn-mee-draw-save"),
        
        // Mee AI Gen
        meeAiGenSection: document.getElementById("mee-ai-gen-section"),
        meeAiPromptInput: document.getElementById("mee-ai-prompt-input"),
        btnMeeAiGen: document.getElementById("btn-mee-ai-gen"),

        // Pet Care
        petValHunger: document.getElementById("pet-val-hunger"),
        petValHappiness: document.getElementById("pet-val-happiness"),
        petValClean: document.getElementById("pet-val-clean"),
        petIndEnergy: document.getElementById("pet-ind-energy"),
        petValEnergy: document.getElementById("pet-val-energy"),
        petIndAffection: document.getElementById("pet-ind-affection"),
        petValAffection: document.getElementById("pet-val-affection"),
        petMainBubble: document.getElementById("pet-main-bubble"),
        petMainSprite: document.getElementById("pet-main-sprite-container"),
        petAccLayer: document.getElementById("pet-acc-layer"),
        btnCareFeed: document.getElementById("btn-care-feed"),
        btnCareBath: document.getElementById("btn-care-bath"),
        btnCarePlay: document.getElementById("btn-care-play"),
        petTypeSelector: document.getElementById("pet-type-selector"),
        petShopContainer: document.getElementById("pet-shop-container"),
        streakGiftDesc: document.getElementById("streak-gift-desc"),

        // Art Kingdom
        artSubTabs: document.getElementById("art-sub-tabs"),
        artTabComic: document.getElementById("card-art-comic"),
        artSubPanelColoring: document.getElementById("art-sub-panel-coloring"),
        artSubPanelLibrary: document.getElementById("art-sub-panel-library"),
        artSubPanelComic: document.getElementById("art-sub-panel-comic"),
        artSubPanelPhotobooth: document.getElementById("art-sub-panel-photobooth"),
        artSubPanelStudio: document.getElementById("art-sub-panel-studio"),
        artSubPanelMovie: document.getElementById("art-sub-panel-movie"),
        
        // Art: Xưởng Vẽ
        artSubPanelColoring: document.getElementById("art-sub-panel-coloring"),
        coloringTabsRow: document.getElementById("coloring-tabs-row"),
        btnColoringTabPresets: document.getElementById("btn-coloring-tab-presets"),
        btnColoringTabFree: document.getElementById("btn-coloring-tab-free"),
        artDraw68: document.getElementById("art-draw-6-8"),
        coloringCanvas68: document.getElementById("coloring-canvas-68"),
        btnColoringReset: document.getElementById("btn-coloring-reset"),
        artDraw9Up: document.getElementById("art-draw-9-up"),
        drawingCanvas9: document.getElementById("drawing-canvas-9"),
        brushColorPicker: document.getElementById("brush-color-picker"),
        brushSizeSlider: document.getElementById("brush-size-slider"),
        stickerShelfContainer: document.getElementById("sticker-shelf-container"),
        btnDrawingClear: document.getElementById("btn-drawing-clear"),
        artDraw1415Addons: document.getElementById("art-draw-14-15-addons"),
        btnAnimAddFrame: document.getElementById("btn-anim-add-frame"),
        btnAnimPlay: document.getElementById("btn-anim-play"),
        animFrameCount: document.getElementById("anim-frame-count"),
        btnSaveDrawingWork: document.getElementById("btn-save-drawing-work"),

        // Art: Thư viện cổ
        artStory68: document.getElementById("art-story-6-8"),
        storyProgress68: document.getElementById("story-progress-6-8"),
        btnStoryPlay68: document.getElementById("btn-story-play-68"),
        storyKaraokeLyrics: document.getElementById("story-karaoke-lyrics"),
        artStory9Up: document.getElementById("art-story-9-up"),
        aiStoryContext: document.getElementById("ai-story-context"),
        aiStoryMission: document.getElementById("ai-story-mission"),
        aiStoryCustomIdea: document.getElementById("ai-story-custom-idea"),
        btnGenerateAiStory: document.getElementById("btn-generate-ai-story"),
        aiStoryResultText: document.getElementById("ai-story-result-text"),
        aiStoryboardAddon: document.getElementById("ai-storyboard-addon"),
        storyboardScenesContainer: document.getElementById("storyboard-scenes-container"),
        aiStorySaveRow: document.getElementById("ai-story-save-row"),
        btnSaveStoryWork: document.getElementById("btn-save-story-work"),
        btnPublishStoryFeed: document.getElementById("btn-publish-story-feed"),

        // Art: Comic
        comicP1View: document.getElementById("comic-p1-view"),
        comicP1Text: document.getElementById("comic-p1-text"),
        comicP2View: document.getElementById("comic-p2-view"),
        comicP2Text: document.getElementById("comic-p2-text"),
        comicP3View: document.getElementById("comic-p3-view"),
        comicP3Text: document.getElementById("comic-p3-text"),
        comicAiBgSection: document.getElementById("comic-ai-bg-section"),
        comicAiBgPrompt: document.getElementById("comic-ai-bg-prompt"),
        btnComicAiBgGen: document.getElementById("btn-comic-ai-bg-gen"),
        btnSaveComicWork: document.getElementById("btn-save-comic-work"),

        // Art: Photobooth & Mee Customizer
        photoFramePreview: document.getElementById("photo-frame-preview"),
        photoBgLayer: document.getElementById("photo-bg-layer"),
        photoMeeLayer: document.getElementById("photo-mee-layer"),
        photoFrameSelector: document.getElementById("photo-frame-selector"),
        photoAiBgSection: document.getElementById("photo-ai-bg-section"),
        photoAiBgPrompt: document.getElementById("photo-ai-bg-prompt"),
        btnPhotoAiBg: document.getElementById("btn-photo-ai-bg"),
        btnSavePhotoWork: document.getElementById("btn-save-photo-work"),
        
        characterWrapper: document.getElementById("characterWrapper"),
        ambientGlow: document.getElementById("ambientGlow"),
        btnCameraZoomIn: document.getElementById("btn-camera-zoom-in"),
        btnCameraZoomOut: document.getElementById("btn-camera-zoom-out"),
        btnCameraReset: document.getElementById("btn-camera-reset"),
        btnExportSvg: document.getElementById("btn-export-svg"),
        btnExportPng: document.getElementById("btn-export-png"),
        viewportCanvas: document.getElementById("viewportCanvas"),
        
        // Mee Builder (Home) DOM Elements
        meeBuilderGenderMaleBtn: document.getElementById("meeBuilderGenderMaleBtn"),
        meeBuilderGenderFemaleBtn: document.getElementById("meeBuilderGenderFemaleBtn"),
        meeBuilderActiveSkinLabel: document.getElementById("meeBuilderActiveSkinLabel"),
        meeBuilderHexSkinLabel: document.getElementById("meeBuilderHexSkinLabel"),
        meeBuilderSkinBadgeDot: document.getElementById("meeBuilderSkinBadgeDot"),
        meeBuilderPaletteGrid: document.getElementById("meeBuilderPaletteGrid"),
        meeBuilderCustomModeToggle: document.getElementById("meeBuilderCustomModeToggle"),
        meeBuilderCustomPickers: document.getElementById("meeBuilderCustomPickers"),
        meeBuilderCustomSkinPicker: document.getElementById("meeBuilderCustomSkinPicker"),
        meeBuilderCustomSkinHex: document.getElementById("meeBuilderCustomSkinHex"),
        meeBuilderCustomShadingPicker: document.getElementById("meeBuilderCustomShadingPicker"),
        meeBuilderCustomShadingHex: document.getElementById("meeBuilderCustomShadingHex"),
        meeBuilderEyesGrid: document.getElementById("meeBuilderEyesGrid"),
        meeBuilderEyebrowsGrid: document.getElementById("meeBuilderEyebrowsGrid"),
        meeBuilderNoseGrid: document.getElementById("meeBuilderNoseGrid"),
        meeBuilderMouthGrid: document.getElementById("meeBuilderMouthGrid"),
        btnMeeExit: document.getElementById("btn-mee-exit"),
        btnMeeDone: document.getElementById("btn-mee-done"),

        // Art: Studio
        studioMusic68: document.getElementById("studio-music-6-8"),
        studioMix9Up: document.getElementById("studio-mix-9-up"),
        btnMixerPlay: document.getElementById("btn-mixer-play"),
        studioAi11Up: document.getElementById("studio-ai-11-up"),
        aiMusicPrompt: document.getElementById("ai-music-prompt"),
        btnAiMusicGen: document.getElementById("btn-ai-music-gen"),
        musicWaveAnimation: document.getElementById("music-wave-animation"),
        btnSaveMusicWork: document.getElementById("btn-save-music-work"),

        // Art: Movie
        movieStage: document.getElementById("movie-stage"),
        stagePuppet: document.getElementById("stage-puppet"),
        moviePuppet68: document.getElementById("movie-puppet-6-8"),
        movieStoryboard9Up: document.getElementById("movie-storyboard-9-up"),
        btnMovieRecord: document.getElementById("btn-movie-record"),
        movieRecordStatus: document.getElementById("movie-record-status"),
        movieAi11Up: document.getElementById("movie-ai-11-up"),
        voiceAiTypeSelector: document.getElementById("voice-ai-type-selector"),
        moviePro1415: document.getElementById("movie-pro-14-15"),
        btnMovieRenderPro: document.getElementById("btn-movie-render-pro"),
        btnSaveMovieWork: document.getElementById("btn-save-movie-work"),

        // Brain Arena
        brainSubTabs: document.getElementById("brain-sub-tabs"),
        brainTabMyquiz: document.getElementById("brain-tab-myquiz"),
        brainSubPanelQuiz: document.getElementById("brain-sub-panel-quiz"),
        brainSubPanelPuzzle: document.getElementById("brain-sub-panel-puzzle"),
        brainSubPanelMyquiz: document.getElementById("brain-sub-panel-myquiz"),
        brainSubPanelArena: document.getElementById("brain-sub-panel-arena"),
        
        // Brain: Quiz
        brainQuizCurrQ: document.getElementById("brain-quiz-curr-q"),
        brainQuizProgress: document.getElementById("brain-quiz-progress"),
        brainQuizQuestionText: document.getElementById("brain-quiz-question-text"),
        brainQuizOptionsList: document.getElementById("brain-quiz-options-list"),
        brainQuizFeedback: document.getElementById("brain-quiz-feedback"),

        // Brain: Puzzle
        puzzle68: document.getElementById("puzzle-6-8"),
        puzDiffRem: document.getElementById("puz-diff-rem"),
        btnPuzDiffReset: document.getElementById("btn-puz-diff-reset"),
        puzImgRight: document.getElementById("puz-img-right"),
        puzzle910: document.getElementById("puzzle-9-10"),
        btnPuzAiGen: document.getElementById("btn-puz-ai-gen"),
        puzzle11Up: document.getElementById("puzzle-11-up"),
        blocksLogicWorkspace: document.getElementById("blocks-logic-workspace"),
        btnRunLogicGame: document.getElementById("btn-run-logic-game"),

        // Brain: My Quiz
        myquizThemeInput: document.getElementById("myquiz-theme-input"),
        btnMyquizAiGen: document.getElementById("btn-myquiz-ai-gen"),
        myquizEditorArea: document.getElementById("myquiz-editor-area"),
        myquizQuestionsListContainer: document.getElementById("myquiz-questions-list-container"),
        btnSaveMyquizWork: document.getElementById("btn-save-myquiz-work"),

        // Brain: Arena
        arenaNormalChallenges: document.getElementById("arena-normal-challenges"),
        btnJoinNormalChallenge: document.getElementById("btn-join-normal-challenge"),
        arena11UpVideo: document.getElementById("arena-11-up-video"),
        btnSubmitVideoChallenge: document.getElementById("btn-submit-video-challenge"),
        arena1415Rank: document.getElementById("arena-14-15-rank"),
        btnJoinTournament: document.getElementById("btn-join-tournament"),

        // Academy
        academyCoursesContainer: document.getElementById("academy-courses-container"),
        academyCourseDetail: document.getElementById("academy-course-detail"),
        btnBackToCourses: document.getElementById("btn-back-to-courses"),
        academyCourseTitle: document.getElementById("academy-course-title"),
        academyVideoFrame: document.getElementById("academy-video-frame"),
        academyLessonName: document.getElementById("academy-lesson-name"),
        btnAcademyDoHomework: document.getElementById("btn-academy-do-homework"),

        // Explore Community
        exploreFeedGrid: document.getElementById("explore-feed-grid"),
        btnExploreLoadMore: document.getElementById("btn-explore-load-more"),
        exploreMarketplaceBox: document.getElementById("explore-marketplace-box"),
        marketItemsContainer: document.getElementById("market-items-container"),

        // Passport
        passportAvatarView: document.getElementById("passport-avatar-view"),
        passportUsernameView: document.getElementById("passport-username-view"),
        passportStartDate: document.getElementById("passport-start-date"),
        passportAgeView: document.getElementById("passport-age-view"),
        passportTierView: document.getElementById("passport-tier-view"),
        passportWorksCount: document.getElementById("passport-works-count"),
        passportMaxStreak: document.getElementById("passport-max-streak"),
        passportHomeworkCount: document.getElementById("passport-homework-count"),
        passportTimelineList: document.getElementById("passport-timeline-list"),
        btnPassportExportPdf: document.getElementById("btn-passport-export-pdf"),

        // Parent Dashboard
        parentTimeLimit: document.getElementById("parent-time-limit"),
        parentModerationList: document.getElementById("parent-moderation-list"),

        // Modals & General
        signupModal: document.getElementById("signup-modal"),
        paywallModal: document.getElementById("paywall-modal"),
        customAlertModal: document.getElementById("custom-alert-modal"),
        alertEmoji: document.getElementById("alert-emoji"),
        alertTitle: document.getElementById("alert-title"),
        alertMessage: document.getElementById("alert-message"),
        btnAlertClose: document.getElementById("btn-alert-close"),
        signupForm: document.getElementById("signup-form"),
        btnCloseSignup: document.getElementById("btn-close-signup"),
        btnClosePaywall: document.getElementById("btn-close-paywall")
    };
}

function moveBusTo(position, autoOpen = false) {
    if (!dom.busVehicle) return;
    const oldPosition = state.busPosition || "center";
    state.busPosition = position;

    let leftVal = "35%";
    let scaleVal = 1;

    if (position === "left") {
        leftVal = "8%";
        scaleVal = 1;
    } else if (position === "right") {
        leftVal = "58%";
        scaleVal = -1;
    } else {
        leftVal = "35%";
        if (oldPosition === "left") {
            scaleVal = 1;
        } else if (oldPosition === "right") {
            scaleVal = -1;
        } else {
            scaleVal = 1;
        }
    }

    dom.busVehicle.style.left = leftVal;
    dom.busVehicle.style.transform = `scaleX(${scaleVal})`;

    if (dom.mapBlocks) {
        dom.mapBlocks.forEach(block => {
            const zone = block.dataset.zone;
            const targetZone = position === "left" ? "mee" : (position === "right" ? "passport" : "art");
            if (zone === targetZone) {
                block.classList.add("active-block");
            } else {
                block.classList.remove("active-block");
            }
        });
    }

    if (autoOpen) {
        if (window.busMoveTimeout) {
            clearTimeout(window.busMoveTimeout);
        }
        window.busMoveTimeout = setTimeout(() => {
            const zone = position === "left" ? "mee" : (position === "right" ? "passport" : "art");
            if (!state.user.hasOnboarded) {
                if (zone === "mee") {
                    openZone("mee");
                } else {
                    showCustomAlert("🐻", "Tạo Nhân Vật Trước", "Bé cần click vào **Nhà Của Bé** để tạo nhân vật đại diện trước nhé!");
                }
            } else {
                openZone(zone);
            }
        }, 800);
    }
}

function bindEvents() {
    // Welcome Screen (Chỉ chọn tuổi & Tier)
    dom.welcomeAgeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            dom.welcomeAgeBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            state.user.ageGroup = btn.dataset.age;
            checkWelcomeOnboardValidity();
        });
    });

    dom.welcomeTierBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            dom.welcomeTierBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            state.user.tier = btn.dataset.tier;
            
            // Đổi chữ động trên nút hành động
            if (state.user.tier === "Guest") {
                dom.enterAppBtn.textContent = "Bắt Đầu Khám Phá! 🎡";
            } else {
                dom.enterAppBtn.textContent = "Tiếp Tục Đăng Ký Tài Khoản! 🚀";
            }
        });
    });

    dom.enterAppBtn.addEventListener("click", () => {
        if (state.user.tier === "Guest") {
            // LUỒNG GUEST: Vào thẳng app không cần qua xác minh
            state.user.hasOnboarded = true;
            state.user.avatar = "human"; // Gán Mee mặc định ban đầu là human
            state.user.isSignedUp = false;
            state.user.isPremium = false;
            
            syncAgeAndTier(state.user.ageGroup, "Guest");
            
            // Hiện các controls Header
            document.getElementById("header-stats-panel").classList.remove("hidden");
            document.getElementById("header-profile-widget").classList.remove("hidden");
            document.getElementById("header-upgrade-btn").classList.remove("hidden");
            document.getElementById("header-passport-btn").classList.remove("hidden");
            document.getElementById("header-parent-btn").classList.remove("hidden");
            document.getElementById("header-debug-panel").classList.remove("hidden");
            dom.btnSignupHeader.classList.remove("hidden");
            
            dom.welcomeScreen.classList.remove("active");
            
            // Hiển thị avatar mặc định trên đảo Home
            const mapHomeAvatar = document.getElementById("map-home-avatar");
            if (mapHomeAvatar) {
                mapHomeAvatar.classList.remove("hidden");
                updateMeePreview(mapHomeAvatar, state.mee.type, state.mee.color);
            }
            
            // Di chuyển xe bus về center
            moveBusTo("center", false);
            
            // Mở xưởng Mee Builder
            openZone("mee");
            showCustomAlert("🎡", "Chế Độ Guest Chơi Nhanh!", `Chào mừng bé đến với chặng tuổi ${state.user.ageGroup}! Bé hãy chọn loại Mee yêu thích trong xưởng nhé.`);
        } else {
            // LUỒNG ĐĂNG KÝ (Free / Premium): Mở Form Đăng Ký
            dom.welcomeScreen.classList.remove("active");
            dom.signupModal.classList.add("active");
            
            // Reset các bước của signup modal về bước 1
            document.getElementById("signup-step-1").classList.remove("hidden");
            document.getElementById("signup-step-1").classList.add("active");
            document.getElementById("signup-step-2").classList.add("hidden");
            document.getElementById("signup-step-2").classList.remove("active");
            document.getElementById("signup-step-3").classList.add("hidden");
            document.getElementById("signup-step-3").classList.remove("active");
            
            // Reset input fields
            document.getElementById("signup-kid-name").value = "";
            document.getElementById("signup-parent-email").value = "";
            document.getElementById("signup-password").value = "";
        }
    });

    // Check validity chỉ cần chọn Tuổi
    window.checkWelcomeOnboardValidity = function() {
        if (state.user.ageGroup) {
            dom.enterAppBtn.classList.remove("disabled");
            dom.enterAppBtn.removeAttribute("disabled");
        }
    };

    // Debug Mode Controls (Test flow)
    dom.debugAgeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            syncAgeAndTier(btn.dataset.age, state.user.tier);
            showCustomAlert("🔄", "Đã Chuyển Độ Tuổi", `Hệ thống đã cập nhật nội dung sang nhóm tuổi ${btn.dataset.age}!`);
        });
    });

    dom.debugTierBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            syncAgeAndTier(state.user.ageGroup, btn.dataset.tier);
            showCustomAlert("⭐", "Đã Chuyển Phân Hạng Tier", `Tài khoản đã cập nhật sang chế độ ${btn.dataset.tier}!`);
        });
    });

    // Navigation: Back to Map
    dom.btnBackToMap.addEventListener("click", () => {
        dom.zoneDetailViewport.classList.add("hidden");
        dom.zoneDetailViewport.classList.remove("art-theme-active"); // Reset background tràn viền
        dom.worldMapScreen.classList.remove("hidden");
    });

    // Navigation: Header Action buttons
    dom.btnSignupHeader.addEventListener("click", () => {
        // Mở thẳng form đăng ký
        dom.signupModal.classList.add("active");
        document.getElementById("signup-step-1").classList.remove("hidden");
        document.getElementById("signup-step-1").classList.add("active");
        document.getElementById("signup-step-2").classList.add("hidden");
        document.getElementById("signup-step-3").classList.add("hidden");
    });
    
    dom.btnUpgradeHeader.addEventListener("click", () => {
        dom.paywallModal.classList.add("active");
    });

    dom.btnPassportHeader.addEventListener("click", () => {
        openZone("passport");
    });

    dom.btnParentHeader.addEventListener("click", () => {
        openZone("parent");
    });

    // Modals close
    dom.btnCloseSignup.addEventListener("click", () => dom.signupModal.classList.remove("active"));
    dom.btnClosePaywall.addEventListener("click", () => dom.paywallModal.classList.remove("active"));
    dom.btnAlertClose.addEventListener("click", () => dom.customAlertModal.classList.remove("active"));

    // Logic Đăng ký 3 bước
    let tempSignupData = {}; // Lưu trữ tạm thời tên và email đăng ký
    
    dom.signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        tempSignupData.kidName = document.getElementById("signup-kid-name").value;
        tempSignupData.parentEmail = document.getElementById("signup-parent-email").value;
        
        // Điền email vào bước 2
        document.getElementById("otp-target-email").textContent = tempSignupData.parentEmail;
        
        // Chuyển sang bước 2 (Nhập OTP)
        document.getElementById("signup-step-1").classList.add("hidden");
        document.getElementById("signup-step-1").classList.remove("active");
        document.getElementById("signup-step-2").classList.remove("hidden");
        document.getElementById("signup-step-2").classList.add("active");
        
        // Reset ô OTP
        document.getElementById("signup-otp-code").value = "";
        document.getElementById("otp-error-msg").classList.add("hidden");
    });

    // Sự kiện nút Quay lại bước 1 từ bước 2
    document.getElementById("btn-back-to-step1").addEventListener("click", () => {
        document.getElementById("signup-step-2").classList.add("hidden");
        document.getElementById("signup-step-2").classList.remove("active");
        document.getElementById("signup-step-1").classList.remove("hidden");
        document.getElementById("signup-step-1").classList.add("active");
    });

    // Form xác minh OTP (Step 2)
    document.getElementById("otp-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const otpCode = document.getElementById("signup-otp-code").value.trim();
        
        if (otpCode === "123456") {
            // Đúng OTP -> Thực hiện đăng ký
            state.user.hasOnboarded = true;
            state.user.username = tempSignupData.kidName;
            state.user.avatar = "human"; // Gán avatar human mặc định
            state.user.isSignedUp = true;
            state.user.isPremium = (state.user.tier === "Premium");
            
            syncAgeAndTier(state.user.ageGroup, state.user.tier);
            moveBusTo("center", false); // Di chuyển xe bus về center
            
            // Hiện các chỉ số và nút Header
            document.getElementById("header-stats-panel").classList.remove("hidden");
            document.getElementById("header-profile-widget").classList.remove("hidden");
            document.getElementById("header-upgrade-btn").classList.toggle("hidden", state.user.tier === "Premium");
            document.getElementById("header-passport-btn").classList.remove("hidden");
            document.getElementById("header-parent-btn").classList.remove("hidden");
            document.getElementById("header-debug-panel").classList.remove("hidden");
            dom.btnSignupHeader.classList.add("hidden"); // Ẩn nút đăng ký
            
            // Hiển thị avatar của Mee trên đảo Home
            const mapHomeAvatar = document.getElementById("map-home-avatar");
            if (mapHomeAvatar) {
                mapHomeAvatar.classList.remove("hidden");
                updateMeePreview(mapHomeAvatar, state.mee.type, state.mee.color);
            }
            
            // Điền thông tin vào Email chúc mừng ở bước 3
            document.getElementById("email-mock-to").textContent = tempSignupData.parentEmail;
            document.getElementById("email-mock-kidname").textContent = tempSignupData.kidName;
            
            // Chuyển sang bước 3 (Hộp thư chúc mừng)
            document.getElementById("signup-step-2").classList.add("hidden");
            document.getElementById("signup-step-2").classList.remove("active");
            document.getElementById("signup-step-3").classList.remove("hidden");
            document.getElementById("signup-step-3").classList.add("active");
        } else {
            // Sai OTP -> Báo đỏ
            document.getElementById("otp-error-msg").classList.remove("hidden");
        }
    });

    // Nút hoàn tất bước 3
    document.getElementById("btn-finish-signup").addEventListener("click", () => {
        // Đóng modal đăng ký
        dom.signupModal.classList.remove("active");
        
        // Trả các bước về mặc định để mở lại lần sau
        document.getElementById("signup-step-3").classList.add("hidden");
        document.getElementById("signup-step-3").classList.remove("active");
        document.getElementById("signup-step-1").classList.remove("hidden");
        document.getElementById("signup-step-1").classList.add("active");
        
        // Mở xưởng Mee Builder
        openZone("mee");
        
        showCustomAlert("🎉", "Tài Khoản Kích Hoạt!", `Chúc mừng bé ${state.user.username} đã đăng ký tài khoản thành công! Bé hãy chọn loại Mee yêu thích trong xưởng nhé.`);
    });

    // Paywall Buy Button
    document.querySelectorAll(".btn-buy-now").forEach(btn => {
        btn.addEventListener("click", () => {
            state.user.isPremium = true;
            state.user.tier = "Premium";
            syncAgeAndTier(state.user.ageGroup, "Premium");
            dom.paywallModal.classList.remove("active");
            showCustomAlert("👑", "Nâng Cấp VIP Thành Công!", "Chúc mừng bé đã trở thành Thành Viên VIP Premium! Mọi tính năng AI đã được mở khóa hoàn toàn.");
        });
    });

    // Zone cards click (Home / Art / Diary)
    if (dom.zoneCards) {
        dom.zoneCards.forEach(card => {
            card.addEventListener("click", () => {
                const zone = card.dataset.zone;
                openZone(zone);
            });
        });
    }

    // Landing CTA button click
    const btnLandingCTA = document.getElementById("btn-landing-cta");
    if (btnLandingCTA) {
        btnLandingCTA.addEventListener("click", () => {
            openZone("art");
        });
    }

    // Bus navigation buttons
    if (dom.btnBusLeft) {
        dom.btnBusLeft.addEventListener("click", () => {
            let nextPos = "center";
            if (state.busPosition === "center") nextPos = "left";
            else if (state.busPosition === "right") nextPos = "center";
            else if (state.busPosition === "left") nextPos = "right";
            moveBusTo(nextPos, true);
        });
    }
    if (dom.btnBusRight) {
        dom.btnBusRight.addEventListener("click", () => {
            let nextPos = "center";
            if (state.busPosition === "center") nextPos = "right";
            else if (state.busPosition === "left") nextPos = "center";
            else if (state.busPosition === "right") nextPos = "left";
            moveBusTo(nextPos, true);
        });
    }

    // Hàm khởi tạo trạng thái ban đầu của luồng
    window.initAppFlow = function() {
        state.user.hasOnboarded = false;
        
        // Ẩn toàn bộ chỉ số ở Header lúc đầu để bé tập trung click đảo Home
        document.getElementById("header-stats-panel").classList.add("hidden");
        document.getElementById("header-profile-widget").classList.add("hidden");
        document.getElementById("header-upgrade-btn").classList.add("hidden");
        document.getElementById("header-passport-btn").classList.add("hidden");
        document.getElementById("header-parent-btn").classList.add("hidden");
        document.getElementById("header-debug-panel").classList.add("hidden");
        
        dom.btnSignupHeader.classList.remove("hidden");
        
        // Reset logo không badge lúc đầu
        document.getElementById("logo-back-to-home").innerHTML = `<span>🌈 StoryMee</span>`;
        
        // Định vị xe bus lúc đầu
        moveBusTo("center", false);
    };

    // Setup sub-panels buttons
    setupMeeBuilderEvents();
    setupPetCareEvents();
    setupArtKingdomEvents();
    setupBrainArenaEvents();
    setupAcademyEvents();
    setupExploreEvents();
    setupPassportEvents();
}

function checkWelcomeOnboardValidity() {
    if (state.user.avatar && state.user.ageGroup) {
        dom.enterAppBtn.classList.remove("disabled");
        dom.enterAppBtn.removeAttribute("disabled");
    }
}

// 4. ROUTING - OPEN DETAIL PANEL
function openZone(zone) {
    if (zone === "mee") {
        window.location.href = "http://localhost:8000/index.html?v=74";
        return;
    }
    // Ẩn tất cả các panel chi tiết
    document.querySelectorAll(".detail-panel").forEach(p => p.classList.add("hidden"));
    
    // Toggle class background tràn viền đặc thù cho đảo nghệ thuật
    if (dom.zoneDetailViewport) {
        dom.zoneDetailViewport.classList.toggle("home-theme-active", zone === "mee");
        dom.zoneDetailViewport.classList.toggle("art-theme-active", zone === "art");
        dom.zoneDetailViewport.classList.toggle("passport-theme-active", zone === "passport");
    }
    
    // Hiện panel được chọn
    const targetPanel = document.getElementById(`panel-${zone}`);
    if (targetPanel) {
        targetPanel.classList.remove("hidden");
        dom.worldMapScreen.classList.add("hidden");
        dom.zoneDetailViewport.classList.remove("hidden");
        
        // Chạy hàm khởi tạo nội dung cho từng panel khi mở
        if (zone === "mee") initMeeBuilderPanel();
        if (zone === "pet") initPetCarePanel();
        if (zone === "art") initArtKingdomPanel();
        if (zone === "brain") initBrainArenaPanel();
        if (zone === "academy") initAcademyPanel();
        if (zone === "explore") initExplorePanel();
        if (zone === "passport") initPassportPanel();
        if (zone === "parent") initParentPanel();
    }
}

// 5. SYNCHRONIZATION: AGE & TIER MATRIX
function syncAgeAndTier(age, tier) {
    state.user.ageGroup = age;
    state.user.tier = tier;
    
    // Đồng bộ theme màu sắc
    document.body.className = "";
    document.body.classList.add(`theme-${age}`);
    
    // Cập nhật Badge
    dom.headerAgeBadge.textContent = age;
    dom.headerTierBadge.textContent = tier.toUpperCase();
    
    // Đồng bộ nút Debug active
    dom.debugAgeBtns.forEach(btn => {
        btn.classList.toggle("active", btn.dataset.age === age);
    });
    dom.debugTierBtns.forEach(btn => {
        btn.classList.toggle("active", btn.dataset.tier === tier);
    });

    // Cập nhật giao diện theo Tier
    if (tier === "Premium") {
        dom.btnUpgradeHeader.classList.add("hidden");
    } else {
        dom.btnUpgradeHeader.classList.remove("hidden");
    }

    if (tier === "Guest") {
        dom.btnSignupHeader.classList.remove("hidden");
    } else {
        dom.btnSignupHeader.classList.add("hidden");
    }

    // Cập nhật visual Mee tại Header
    state.mee.type = state.user.avatar;
    updateMeePreview(dom.headerAvatarContainer, state.mee.type, state.mee.color);
    
    // Cập nhật bản đồ visual
    const mapMeePreview = document.getElementById("map-home-avatar");
    updateMeePreview(mapMeePreview, state.mee.type, state.mee.color);
    
    // Đồng bộ các element theo logic tuổi
    syncAgeRulesForExplore(age);
    syncArtSubPanelsByAge(age);
}

function syncAgeRulesForExplore(age) {
    // Nhóm 6-8 không có tương tác xã hội (Khám phá chỉ hiển thị feed được duyệt, không có bình luận, like ẩn)
    // Nhóm 11-13 like ẩn số lượng
    // Nhóm 14-15 mở thêm Marketplace
    if (age === "14-15") {
        dom.exploreMarketplaceBox.classList.remove("hidden");
    } else {
        dom.exploreMarketplaceBox.classList.add("hidden");
    }
}

function syncArtSubPanelsByAge(age) {
    // 1. Lobby cards: Ẩn/hiện xưởng Truyện Tranh
    if (dom.artTabComic) {
        dom.artTabComic.classList.remove("hidden"); // Luôn hiện truyện tranh cho mọi độ tuổi
    }

    // Ẩn/hiện sinh nền AI dựa vào chặng tuổi
    if (dom.comicAiBgSection) {
        dom.comicAiBgSection.classList.toggle("hidden", age === "6-8");
    }

    // 2. Xưởng Vẽ (Coloring / Free Draw)
    if (dom.coloringTabsRow) {
        dom.coloringTabsRow.classList.add("hidden");
        if (age === "6-8") {
            if (dom.artDraw68) dom.artDraw68.classList.remove("hidden");
            if (dom.artDraw9Up) dom.artDraw9Up.classList.add("hidden");
            if (dom.artDraw1415Addons) dom.artDraw1415Addons.classList.add("hidden");
        } else {
            const activeTabBtn = dom.coloringTabsRow.querySelector(".opt-btn.active");
            if (activeTabBtn) {
                if (activeTabBtn.id === "btn-coloring-tab-presets") {
                    if (dom.artDraw68) dom.artDraw68.classList.remove("hidden");
                    if (dom.artDraw9Up) dom.artDraw9Up.classList.add("hidden");
                } else {
                    if (dom.artDraw68) dom.artDraw68.classList.add("hidden");
                    if (dom.artDraw9Up) dom.artDraw9Up.classList.remove("hidden");
                }
            } else {
                if (dom.artDraw68) dom.artDraw68.classList.remove("hidden");
                if (dom.artDraw9Up) dom.artDraw9Up.classList.add("hidden");
            }
            if (dom.artDraw1415Addons) dom.artDraw1415Addons.classList.toggle("hidden", age !== "14-15");
        }
    } else {
        // Nếu không có tab row (luồng xưởng vẽ mới 2 bước)
        if (dom.artDraw68) dom.artDraw68.classList.remove("hidden");
        if (dom.artDraw9Up) dom.artDraw9Up.classList.add("hidden");
    }

    // 3. Thư Viện Cổ Tích (Library)
    if (dom.artStory68 && dom.artStory9Up) {
        // Bé nghe luôn hiện cho tất cả các tuổi (kế thừa)
        dom.artStory68.classList.remove("hidden");
        // Sáng tác AI chỉ hiện từ 9 tuổi trở lên
        dom.artStory9Up.classList.toggle("hidden", age === "6-8");
        // Phân cảnh Storyboard AI chỉ hiện từ 11 tuổi trở lên
        if (age === "11-13" || age === "14-15") {
            // Chỉ hiển thị storyboard khi đã tạo truyện
        } else {
            dom.aiStoryboardAddon.classList.add("hidden");
        }
    }

    // 4. Studio Âm Nhạc (Studio)
    if (dom.studioMusic68 && dom.studioMix9Up && dom.studioAi11Up) {
        // Bé nghe nhạc ru ngủ luôn hiện cho tất cả các tuổi (kế thừa)
        dom.studioMusic68.classList.remove("hidden");
        // Mix nhạc loop chỉ hiện từ 9 tuổi trở lên
        dom.studioMix9Up.classList.toggle("hidden", age === "6-8");
        // Sinh nhạc AI 15s chỉ hiện từ 11 tuổi trở lên
        dom.studioAi11Up.classList.toggle("hidden", age === "6-8" || age === "9-10");
    }

    // 5. Phim Trường Puppet (Movie)
    if (dom.moviePuppet68 && dom.movieStoryboard9Up) {
        // Kịch rối cơ bản luôn hiện
        dom.moviePuppet68.classList.remove("hidden");
        // Lồng tiếng / đổi giọng AI chỉ hiện từ 9 tuổi trở lên
        dom.movieStoryboard9Up.classList.toggle("hidden", age === "6-8");
        // Thu âm AI 11+
        if (dom.movieAi11Up) {
            dom.movieAi11Up.classList.toggle("hidden", age === "6-8" || age === "9-10");
        }
    }
}

// Helper: Hiển thị Custom Alert
function showCustomAlert(emoji, title, msg) {
    dom.alertEmoji.textContent = emoji;
    dom.alertTitle.textContent = title;
    dom.alertMessage.textContent = msg;
    dom.customAlertModal.classList.add("active");
}

// Helper: Cập nhật visual cho model Mee
function updateMeePreview(container, type, color) {
    if (!container) return;
    const drawSvg = AVATAR_SVGS[type] || AVATAR_SVGS.human;
    container.innerHTML = drawSvg(color);
}

// 6. MODULE: MEE BUILDER (ĐẢO NHÂN VẬT - PHONG CÁCH NINTENDO MII)
let meeBackup = null;      // Lưu dự phòng khi vào xưởng để Hủy (Exit)
let miiActiveTab = "skin"; // Tab hiện tại của Home Mee Builder: skin, eyes, eyebrows
let meeHistory = [];       // Lịch sử để Hoàn tác (Undo)

function saveMeeHistory() {
    if (meeHistory.length >= 20) meeHistory.shift();
    meeHistory.push(JSON.parse(JSON.stringify(state.mee)));
}

function buildMeeBuilderPaletteUI() {
    if (!dom.meeBuilderPaletteGrid) return;
    dom.meeBuilderPaletteGrid.innerHTML = "";
    
    PALETTE_DATA.forEach(item => {
        const button = document.createElement("div");
        button.className = "palette-item";
        if (!state.mee.customMode && item.id === state.mee.skinToneIndex) {
            button.classList.add("active");
        }
        button.dataset.id = item.id;
        button.title = `Tông màu da #${item.id}`;

        const shadingDiv = document.createElement("div");
        shadingDiv.className = "palette-color shading";
        shadingDiv.style.backgroundColor = item.shading;

        const skinDiv = document.createElement("div");
        skinDiv.className = "palette-color skin";
        skinDiv.style.backgroundColor = item.skin;

        button.appendChild(shadingDiv);
        button.appendChild(skinDiv);

        button.addEventListener("click", () => {
            saveMeeHistory();
            state.mee.customMode = false;
            state.mee.skinToneIndex = item.id;
            state.mee.customSkin = item.skin;
            state.mee.customShading = item.shading;
            
            playCustomizerSound('select');
            updateMeeBuilderVisual();
        });

        dom.meeBuilderPaletteGrid.appendChild(button);
    });

    if (state.mee.customMode) {
        if (dom.meeBuilderActiveSkinLabel) dom.meeBuilderActiveSkinLabel.innerText = "Tự chọn (Custom)";
        if (dom.meeBuilderHexSkinLabel) {
            dom.meeBuilderHexSkinLabel.querySelector("span").innerText = state.mee.customSkin.toUpperCase();
        }
        if (dom.meeBuilderSkinBadgeDot) dom.meeBuilderSkinBadgeDot.style.backgroundColor = state.mee.customSkin;
    } else {
        const activeColor = PALETTE_DATA[state.mee.skinToneIndex - 1];
        if (activeColor) {
            if (dom.meeBuilderActiveSkinLabel) dom.meeBuilderActiveSkinLabel.innerText = `Mẫu #${activeColor.id}`;
            if (dom.meeBuilderHexSkinLabel) {
                dom.meeBuilderHexSkinLabel.querySelector("span").innerText = activeColor.skin.toUpperCase();
            }
            if (dom.meeBuilderSkinBadgeDot) dom.meeBuilderSkinBadgeDot.style.backgroundColor = activeColor.skin;
        }
    }
}

function buildMeeBuilderFacialUI() {
    if (!dom.meeBuilderEyebrowsGrid || !dom.meeBuilderEyesGrid || !dom.meeBuilderNoseGrid || !dom.meeBuilderMouthGrid) return;
    
    // 1. Eyebrows Grid
    dom.meeBuilderEyebrowsGrid.innerHTML = "";
    if (FACIAL_DATABASE.eyebrows) {
        FACIAL_DATABASE.eyebrows.forEach(item => {
            const btn = document.createElement("button");
            btn.className = "facial-select-btn";
            if (item.id === state.mee.eyebrowIndex) btn.classList.add("active");
            
            const dy = 9 - item.y_center;
            btn.innerHTML = `
                <span class="facial-btn-label">Kiểu #${item.id}</span>
                <svg viewBox="0 0 76.02 18" class="facial-btn-preview" style="width: 100%; height: 36px;">
                    <g transform="translate(0, ${dy})">
                        ${item.left.join("")} ${item.right.join("")}
                    </g>
                </svg>
            `;
            
            btn.addEventListener("click", () => {
                if (state.mee.eyebrowIndex !== item.id) {
                    saveMeeHistory();
                    state.mee.eyebrowIndex = item.id;
                    playCustomizerSound('click');
                    syncMeeBuilderFacialActiveState(dom.meeBuilderEyebrowsGrid, item.id);
                    updateMeeBuilderVisual();
                }
            });
            dom.meeBuilderEyebrowsGrid.appendChild(btn);
        });
    }

    // 2. Eyes Grid
    dom.meeBuilderEyesGrid.innerHTML = "";
    if (FACIAL_DATABASE.eyes) {
        FACIAL_DATABASE.eyes.forEach(item => {
            const btn = document.createElement("button");
            btn.className = "facial-select-btn";
            if (item.id === state.mee.eyeIndex) btn.classList.add("active");
            
            const dy = 11 - item.y_center;
            btn.innerHTML = `
                <span class="facial-btn-label">Kiểu #${item.id}</span>
                <svg viewBox="0 0 76.04 22" class="facial-btn-preview" style="width: 100%; height: 44px;">
                    <g transform="translate(0, ${dy})">
                        ${item.left.join("")} ${item.right.join("")}
                    </g>
                </svg>
            `;
            
            btn.addEventListener("click", () => {
                if (state.mee.eyeIndex !== item.id) {
                    saveMeeHistory();
                    state.mee.eyeIndex = item.id;
                    playCustomizerSound('click');
                    syncMeeBuilderFacialActiveState(dom.meeBuilderEyesGrid, item.id);
                    updateMeeBuilderVisual();
                }
            });
            dom.meeBuilderEyesGrid.appendChild(btn);
        });
    }

    // 3. Nose Grid
    dom.meeBuilderNoseGrid.innerHTML = "";
    if (FACIAL_DATABASE.noses) {
        FACIAL_DATABASE.noses.forEach(item => {
            const btn = document.createElement("button");
            btn.className = "facial-select-btn";
            if (item.id === state.mee.noseIndex) btn.classList.add("active");
            
            const dy = 7.5 - item.y_center;
            btn.innerHTML = `
                <span class="facial-btn-label">Kiểu #${item.id}</span>
                <svg viewBox="0 0 76.04 15" class="facial-btn-preview" style="width: 100%; height: 30px;">
                    <g transform="translate(0, ${dy})">
                        ${item.left.join("")}
                    </g>
                </svg>
            `;
            
            btn.addEventListener("click", () => {
                if (state.mee.noseIndex !== item.id) {
                    saveMeeHistory();
                    state.mee.noseIndex = item.id;
                    playCustomizerSound('click');
                    syncMeeBuilderFacialActiveState(dom.meeBuilderNoseGrid, item.id);
                    updateMeeBuilderVisual();
                }
            });
            dom.meeBuilderNoseGrid.appendChild(btn);
        });
    }

    // 4. Mouth Grid
    dom.meeBuilderMouthGrid.innerHTML = "";
    if (FACIAL_DATABASE.mouths) {
        FACIAL_DATABASE.mouths.forEach(item => {
            const btn = document.createElement("button");
            btn.className = "facial-select-btn";
            if (item.id === state.mee.mouthIndex) btn.classList.add("active");
            
            const dy = 9 - item.y_center;
            btn.innerHTML = `
                <span class="facial-btn-label">Kiểu #${item.id}</span>
                <svg viewBox="0 0 76.04 18" class="facial-btn-preview" style="width: 100%; height: 36px;">
                    <g transform="translate(0, ${dy})">
                        ${item.left.join("")}
                    </g>
                </svg>
            `;
            
            btn.addEventListener("click", () => {
                if (state.mee.mouthIndex !== item.id) {
                    saveMeeHistory();
                    state.mee.mouthIndex = item.id;
                    playCustomizerSound('click');
                    syncMeeBuilderFacialActiveState(dom.meeBuilderMouthGrid, item.id);
                    updateMeeBuilderVisual();
                }
            });
            dom.meeBuilderMouthGrid.appendChild(btn);
        });
    }
}

function syncMeeBuilderFacialActiveState(gridContainer, activeId) {
    const buttons = gridContainer.querySelectorAll(".facial-select-btn");
    buttons.forEach((btn, idx) => {
        btn.classList.toggle("active", idx + 1 === activeId);
    });
}

function setupMeeBuilderEvents() {
    // 1. Sidebar tab dọc chọn bộ phận
    document.querySelectorAll(".mii-tab-btn.mii-tab-main").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".mii-tab-btn.mii-tab-main").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            miiActiveTab = btn.dataset.tab;
            
            // Ẩn/Hiện content panel tương ứng
            document.querySelectorAll(".mee-builder-tab-content").forEach(p => p.classList.add("hidden"));
            const target = document.getElementById(`mee-builder-${miiActiveTab}-content`);
            if (target) target.classList.remove("hidden");
            
            playCustomizerSound('select');
        });
    });

    // 2. Các nút xoay, reset, undo trên preview
    document.getElementById("btn-preview-rotate").addEventListener("click", () => {
        saveMeeHistory();
        state.mee.rotation = (state.mee.rotation + 45) % 360;
        updateMeeBuilderVisual();
    });

    document.getElementById("btn-preview-reset").addEventListener("click", () => {
        saveMeeHistory();
        state.mee.rotation = 0;
        updateMeeBuilderVisual();
    });

    document.getElementById("btn-preview-undo").addEventListener("click", () => {
        if (meeHistory.length > 0) {
            state.mee = meeHistory.pop();
            updateMeeBuilderVisual();
        } else {
            showCustomAlert("↩️", "Hoàn Tác", "Không còn bước nào để hoàn tác đâu bé!");
        }
    });

    // 3. Gender buttons
    if (dom.meeBuilderGenderMaleBtn && dom.meeBuilderGenderFemaleBtn) {
        dom.meeBuilderGenderMaleBtn.addEventListener("click", () => {
            if (state.mee.gender !== "male") {
                saveMeeHistory();
                state.mee.gender = "male";
                playCustomizerSound('select');
                updateMeeBuilderVisual();
            }
        });
        dom.meeBuilderGenderFemaleBtn.addEventListener("click", () => {
            if (state.mee.gender !== "female") {
                saveMeeHistory();
                state.mee.gender = "female";
                playCustomizerSound('select');
                updateMeeBuilderVisual();
            }
        });
    }

    // 4. Custom pickers
    if (dom.meeBuilderCustomModeToggle) {
        dom.meeBuilderCustomModeToggle.addEventListener("change", () => {
            saveMeeHistory();
            state.mee.customMode = dom.meeBuilderCustomModeToggle.checked;
            if (state.mee.customMode) {
                state.mee.customSkin = dom.meeBuilderCustomSkinPicker.value;
                state.mee.customShading = dom.meeBuilderCustomShadingPicker.value;
            }
            playCustomizerSound('select');
            updateMeeBuilderVisual();
        });
    }

    if (dom.meeBuilderCustomSkinPicker) {
        dom.meeBuilderCustomSkinPicker.addEventListener("input", (e) => {
            state.mee.customSkin = e.target.value;
            if (dom.meeBuilderCustomSkinHex) dom.meeBuilderCustomSkinHex.innerText = e.target.value.toUpperCase();
            
            // Tự động tạo màu bóng da HSL khi đổi màu da custom
            const shadow = customizerAutoShadow(state.mee.customSkin);
            state.mee.customShading = shadow;
            if (dom.meeBuilderCustomShadingPicker) dom.meeBuilderCustomShadingPicker.value = shadow;
            if (dom.meeBuilderCustomShadingHex) dom.meeBuilderCustomShadingHex.innerText = shadow.toUpperCase();

            updateMeeBuilderVisual();
        });
        dom.meeBuilderCustomSkinPicker.addEventListener("change", () => {
            saveMeeHistory();
        });
    }

    if (dom.meeBuilderCustomShadingPicker) {
        dom.meeBuilderCustomShadingPicker.addEventListener("input", (e) => {
            state.mee.customShading = e.target.value;
            if (dom.meeBuilderCustomShadingHex) dom.meeBuilderCustomShadingHex.innerText = e.target.value.toUpperCase();
            updateMeeBuilderVisual();
        });
        dom.meeBuilderCustomShadingPicker.addEventListener("change", () => {
            saveMeeHistory();
        });
    }

    // 5. Nút Exit (Thoát không lưu)
    if (dom.btnMeeExit) {
        dom.btnMeeExit.addEventListener("click", () => {
            if (meeBackup) {
                state.mee = JSON.parse(JSON.stringify(meeBackup));
            }
            syncAgeAndTier(state.user.ageGroup, state.user.tier);
            
            // Trở lại bản đồ
            dom.zoneDetailViewport.classList.add("hidden");
            dom.worldMapScreen.classList.remove("hidden");
            showCustomAlert("🚪", "Đã Thoát Xưởng", "Nhân vật Mee của bé đã được khôi phục về trạng thái trước đó.");
        });
    }

    // 6. Nút Done (Lưu và Đồng bộ)
    if (dom.btnMeeDone) {
        dom.btnMeeDone.addEventListener("click", () => {
            // Đồng bộ avatar của user
            state.user.avatar = "human";
            state.mee.type = "human";
            
            // Lưu trạng thái vào localStorage
            localStorage.setItem("mee_character_customizer_state", JSON.stringify(state.mee));
            
            // Cập nhật tất cả preview
            syncAgeAndTier(state.user.ageGroup, state.user.tier);
            
            // Thêm tác phẩm nhân vật vào Passport (trừ Guest)
            if (state.user.tier !== "Guest") {
                addWorkToPassport("drawing", `Thiết Kế Nhân Vật: ${state.user.username}`, renderHumanSVG(state.mee));
            }
            
            // Hiển thị visual trên map
            const mapHomeAvatar = document.getElementById("map-home-avatar");
            if (mapHomeAvatar) {
                mapHomeAvatar.classList.remove("hidden");
                mapHomeAvatar.innerHTML = renderHumanSVG(state.mee);
            }
            
            // Quay về map
            dom.zoneDetailViewport.classList.add("hidden");
            dom.worldMapScreen.classList.remove("hidden");
            
            if (state.user.tier === "Guest") {
                showCustomAlert("💾", "Lưu Nhân Vật Tạm Temporarily!", "Đã cập nhật avatar của bé! Hãy Đăng Ký tài khoản để lưu trữ nhân vật vĩnh viễn nhé.");
            } else if (state.user.tier === "Free") {
                showCustomAlert("💾", "Đã Lưu Nhân Vật!", "Mee của bé đã được lưu thành công vào Passport.");
            } else {
                showCustomAlert("👑", "Đã Lưu Nhân Vật VIP!", "Mee độc quyền VIP của bé đã được lưu thành công vào Passport.");
            }
        });
    }
}

function initMeeBuilderPanel() {
    // Cập nhật state từ localStorage trước nếu có
    const savedState = localStorage.getItem("mee_character_customizer_state");
    if (savedState) {
        try {
            state.mee = JSON.parse(savedState);
            if (state.mee.noseIndex === undefined) state.mee.noseIndex = 1;
            if (state.mee.mouthIndex === undefined) state.mee.mouthIndex = 1;
        } catch(e) {}
    }

    // Lưu backup đề phòng nhấn Exit
    meeBackup = JSON.parse(JSON.stringify(state.mee));
    meeHistory = []; // Reset undo stack khi vào xưởng mới
    
    // Reset tab về skin đầu tiên
    miiActiveTab = "skin";
    
    // Active tab đầu tiên trên sidebar
    document.querySelectorAll(".mii-tab-btn.mii-tab-main").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.tab === "skin");
    });
    
    document.querySelectorAll(".mee-builder-tab-content").forEach(p => {
        p.classList.toggle("hidden", p.id !== "mee-builder-skin-content");
    });
    
    buildMeeBuilderPaletteUI();
    buildMeeBuilderFacialUI();
    updateMeeBuilderVisual();
}

function updateMeeBuilderVisual() {
    if (dom.meeBuilderAvatarPreview) {
        dom.meeBuilderAvatarPreview.innerHTML = renderHumanSVG(state.mee);
    }
    
    if (dom.meeBuilderMoodText) {
        let moodLabel = "Bình thường 🙂";
        if (state.mee.mood === "happy") moodLabel = "Vui vẻ 😊";
        if (state.mee.mood === "sad") moodLabel = "Buồn bã 😢";
        if (state.mee.mood === "excited") moodLabel = "Hào hứng 🤩";
        if (state.mee.mood === "curious") moodLabel = "Tò mò 🤔";
        dom.meeBuilderMoodText.textContent = `Mood: ${moodLabel}`;
    }

    // Đồng bộ Gender buttons
    if (dom.meeBuilderGenderMaleBtn && dom.meeBuilderGenderFemaleBtn) {
        dom.meeBuilderGenderMaleBtn.classList.toggle("active", state.mee.gender === "male");
        dom.meeBuilderGenderFemaleBtn.classList.toggle("active", state.mee.gender === "female");
    }

    // Đồng bộ Custom skin switch & panels
    if (dom.meeBuilderCustomModeToggle) {
        dom.meeBuilderCustomModeToggle.checked = state.mee.customMode;
    }
    if (dom.meeBuilderCustomPickers) {
        dom.meeBuilderCustomPickers.classList.toggle("hidden", !state.mee.customMode);
    }

    if (dom.meeBuilderCustomSkinPicker) dom.meeBuilderCustomSkinPicker.value = state.mee.customSkin;
    if (dom.meeBuilderCustomSkinHex) dom.meeBuilderCustomSkinHex.innerText = state.mee.customSkin.toUpperCase();
    if (dom.meeBuilderCustomShadingPicker) dom.meeBuilderCustomShadingPicker.value = state.mee.customShading;
    if (dom.meeBuilderCustomShadingHex) dom.meeBuilderCustomShadingHex.innerText = state.mee.customShading.toUpperCase();

    buildMeeBuilderPaletteUI();
    syncMeeBuilderFacialActiveState(dom.meeBuilderEyebrowsGrid, state.mee.eyebrowIndex);
    syncMeeBuilderFacialActiveState(dom.meeBuilderEyesGrid, state.mee.eyeIndex);
    syncMeeBuilderFacialActiveState(dom.meeBuilderNoseGrid, state.mee.noseIndex);
    syncMeeBuilderFacialActiveState(dom.meeBuilderMouthGrid, state.mee.mouthIndex);
}

// 7. MODULE: PET CARE (NHÀ THÚ CƯNG)
function setupPetCareEvents() {
    dom.btnCareFeed.addEventListener("click", () => performPetAction("feed"));
    dom.btnCareBath.addEventListener("click", () => performPetAction("bath"));
    dom.btnCarePlay.addEventListener("click", () => performPetAction("play"));
}

function initPetCarePanel() {
    // Check Guest
    if (state.user.tier === "Guest") {
        dom.petMainBubble.textContent = "Đăng ký tài khoản để nuôi Pet riêng của bé nhé! 🦴";
        dom.btnCareFeed.disabled = true;
        dom.btnCareBath.disabled = true;
        dom.btnCarePlay.disabled = true;
        dom.petTypeSelector.innerHTML = "<em>Tính năng khóa ở chế độ Guest.</em>";
        return;
    }

    dom.btnCareFeed.disabled = false;
    dom.btnCareBath.disabled = false;
    dom.btnCarePlay.disabled = false;

    // 1. Hiển thị các chỉ số theo độ tuổi (6-8 có 3 chỉ số, 9+ có 5 chỉ số)
    const age = state.user.ageGroup;
    const isBigKid = (age !== "6-8");
    dom.petIndEnergy.classList.toggle("hidden", !isBigKid);
    dom.petIndAffection.classList.toggle("hidden", !isBigKid);

    updatePetStatusBars();

    // 2. Render danh sách chọn loại pet
    dom.petTypeSelector.innerHTML = "";
    const agePets = CONFIG.pets[age] || CONFIG.pets["6-8"];
    agePets.forEach(pet => {
        const btn = document.createElement("button");
        btn.className = "opt-btn";
        if (pet.isPremium) {
            btn.classList.add("premium-opt");
            if (state.user.tier !== "Premium") {
                btn.innerHTML = `${pet.label} <small>VIP</small>`;
            } else {
                btn.innerHTML = pet.label;
            }
        } else {
            btn.innerHTML = pet.label;
        }

        btn.classList.toggle("active", state.pet.type === pet.type);
        
        btn.addEventListener("click", () => {
            if (pet.isPremium && state.user.tier !== "Premium") {
                dom.paywallModal.classList.add("active");
                return;
            }
            dom.petTypeSelector.querySelectorAll(".opt-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            state.pet.type = pet.type;
            state.pet.name = pet.label.split(" ")[0];
            initPetVisual();
        });
        dom.petTypeSelector.appendChild(btn);
    });

    // 3. Render Shop đồ chơi
    dom.petShopContainer.innerHTML = "";
    CONFIG.petShop.forEach(item => {
        const card = document.createElement("div");
        card.className = "pet-shop-item";
        const isOwned = state.pet.ownedAccs.includes(item.id);
        if (isOwned) card.classList.add("owned");
        
        card.innerHTML = `
            <span class="item-emoji">${item.emoji}</span>
            <span>${item.label}</span>
            <small>${isOwned ? "Đã sở hữu" : item.price + " Credits"}</small>
        `;

        card.addEventListener("click", () => {
            if (isOwned) {
                // Trang bị/tháo ra
                if (state.pet.accessories.includes(item.id)) {
                    state.pet.accessories = state.pet.accessories.filter(id => id !== item.id);
                    showCustomAlert("🧸", "Tháo Phụ Kiện", `Đã tháo ${item.label} khỏi Pet.`);
                } else {
                    state.pet.accessories.push(item.id);
                    showCustomAlert("👑", "Trang Bị", `Đã mặc ${item.label} cho Pet!`);
                }
                updatePetAccessoriesVisual();
            } else {
                // Mua
                if (state.user.credits < item.price) {
                    showCustomAlert("🪙", "Thiếu Credits", "Bé hãy tích cực học tập ở Học viện hoặc làm quiz để kiếm thêm Credits nhé!");
                    return;
                }
                state.user.credits -= item.price;
                state.pet.ownedAccs.push(item.id);
                dom.coinCount.textContent = `🪙 ${state.user.credits} Credits`;
                card.classList.add("owned");
                card.querySelector("small").textContent = "Đã sở hữu";
                showCustomAlert("🛒", "Đã Mua Thành Công!", `Bé đã đổi ${item.price} Credits lấy ${item.label}. Bấm lần nữa để mặc cho Pet nhé!`);
            }
        });
        dom.petShopContainer.appendChild(card);
    });

    initPetVisual();
}

function initPetVisual() {
    let petEmoji = "🐶";
    if (state.pet.type === "cat") petEmoji = "🐱";
    if (state.pet.type === "rabbit") petEmoji = "🐰";
    if (state.pet.type === "bird") petEmoji = "🐦";
    if (state.pet.type === "hamster") petEmoji = "🐹";
    if (state.pet.type === "turtle") petEmoji = "🐢";
    if (state.pet.type === "dinosaur") petEmoji = "🦖";
    if (state.pet.type === "dragon") petEmoji = "🐉";
    if (state.pet.type === "slime") petEmoji = "💧";
    if (state.pet.type === "robot") petEmoji = "🤖";
    if (state.pet.type === "phoenix") petEmoji = "🦅";
    
    dom.petMainSprite.textContent = petEmoji;
    
    // Nếu bé 14-15 tuổi Premium, Pet tiến hóa visual theo level
    if (state.user.ageGroup === "14-15" && state.user.tier === "Premium") {
        dom.petMainSprite.style.filter = "drop-shadow(0 0 10px gold)";
        dom.petMainBubble.textContent = `Pet Cấp ${state.pet.level} (Đã Tiến Hóa Hệ Kim Cương) 💎`;
    } else {
        dom.petMainSprite.style.filter = "none";
        dom.petMainBubble.textContent = `Xin chào bé ${state.user.username}! Hãy cho tớ ăn nhé! 🐾`;
    }

    updatePetAccessoriesVisual();
}

function updatePetAccessoriesVisual() {
    dom.petAccLayer.innerHTML = "";
    state.pet.accessories.forEach(accId => {
        const item = CONFIG.petShop.find(i => i.id === accId);
        if (item) {
            const accEl = document.createElement("div");
            accEl.style.position = "absolute";
            if (accId === "crown_pet") {
                accEl.style.top = "-40px";
                accEl.style.fontSize = "3.2rem";
                accEl.textContent = "🎄"; // sừng tuần lộc
            } else if (accId === "ball") {
                accEl.style.bottom = "-20px";
                accEl.style.left = "-20px";
                accEl.style.fontSize = "2rem";
                accEl.textContent = "⚽";
            } else if (accId === "bone") {
                accEl.style.bottom = "-20px";
                accEl.style.right = "-20px";
                accEl.style.fontSize = "2rem";
                accEl.textContent = "🦴";
            }
            dom.petAccLayer.appendChild(accEl);
        }
    });
}

function updatePetStatusBars() {
    dom.petValHunger.textContent = state.pet.hunger;
    dom.petValHappiness.textContent = state.pet.happiness;
    dom.petValClean.textContent = state.pet.clean;
    dom.petValEnergy.textContent = state.pet.energy;
    dom.petValAffection.textContent = state.pet.affection;
}

function performPetAction(action) {
    let cost = 10;
    if (action === "bath") cost = 5;

    if (state.user.credits < cost) {
        showCustomAlert("🪙", "Thiếu Credits", "Bé cần tích lũy thêm Credits từ các hoạt động sáng tạo nhé!");
        return;
    }

    state.user.credits -= cost;
    dom.coinCount.textContent = `🪙 ${state.user.credits} Credits`;

    if (action === "feed") {
        state.pet.hunger = Math.min(100, state.pet.hunger + 25);
        state.pet.clean = Math.max(0, state.pet.clean - 5);
        dom.petMainBubble.textContent = "Ngon quá bé ơi! Cảm ơn bé! 🍕";
    } else if (action === "bath") {
        state.pet.clean = Math.min(100, state.pet.clean + 30);
        state.pet.happiness = Math.max(0, state.pet.happiness - 5);
        dom.petMainBubble.textContent = "Tớ sạch bong kin kít rồi nè! 🛁";
    } else if (action === "play") {
        state.pet.happiness = Math.min(100, state.pet.happiness + 20);
        state.pet.hunger = Math.max(0, state.pet.hunger - 10);
        if (state.user.ageGroup !== "6-8") {
            state.pet.affection = Math.min(100, state.pet.affection + 10);
        }
        dom.petMainBubble.textContent = "Chơi vui quá! Hú hu! 🧸";
    }

    // Tăng cấp nhẹ nếu chăm pet đều
    if (state.pet.hunger > 90 && state.pet.happiness > 90 && state.pet.clean > 90) {
        state.pet.level++;
        if (state.user.ageGroup === "14-15" && state.user.tier === "Premium") {
            initPetVisual();
        }
    }

    updatePetStatusBars();
}

// 8. MODULE: ART KINGDOM (VƯƠNG QUỐC NGHỆ THUẬT)
function setupArtKingdomEvents() {
    // Chuyển đổi giữa các xưởng từ sảnh chọn
    document.querySelectorAll(".art-card").forEach(card => {
        card.addEventListener("click", () => {
            const sub = card.dataset.sub;
            
            // Ẩn sảnh chính, hiện khu vực làm việc của xưởng
            const lobbyView = document.getElementById("art-lobby-view");
            const zoneView = document.getElementById("art-zone-view");
            if (lobbyView) lobbyView.classList.add("hidden");
            if (zoneView) zoneView.classList.remove("hidden");
            
            // Cập nhật tiêu đề xưởng tương ứng kèm emoji sinh động
            const titleLabel = document.getElementById("art-zone-title-label");
            const cardTitle = card.querySelector("h3") ? card.querySelector("h3").innerText : "";
            const cardEmoji = card.querySelector(".art-card-emoji") ? card.querySelector(".art-card-emoji").innerText : "";
            if (titleLabel) {
                titleLabel.innerText = `${cardTitle} ${cardEmoji}`;
            }
            
            // Ẩn tất cả các sub-panel và hiện panel xưởng chi tiết tương ứng
            document.querySelectorAll(".art-sub-panel").forEach(p => p.classList.add("hidden"));
            const targetPanel = document.getElementById(`art-sub-panel-${sub}`);
            if (targetPanel) {
                targetPanel.classList.remove("hidden");
                // Khởi tạo cụ thể cho từng xưởng nếu cần
                if (sub === "coloring") initColoringSubPanel();
                if (sub === "library") initFairytaleLibrary();
                if (sub === "comic") renderMeeToComicPanels();
                if (sub === "photobooth") {
                    if (typeof customizerInitialized === 'undefined' || !customizerInitialized) {
                        initMeeCustomizer();
                        window.customizerInitialized = true;
                    } else {
                        updateCustomizerUI();
                        resetCustomizerCamera();
                    }
                }
                if (sub === "movie") {
                    dom.stagePuppet.style.width = "100px";
                    dom.stagePuppet.style.height = "100px";
                    dom.stagePuppet.innerHTML = renderHumanSVG(state.mee);
                }
            }
        });
    });

    // Nút trở lại sảnh chọn xưởng
    const btnBackToLobby = document.getElementById("btn-back-to-art-lobby");
    if (btnBackToLobby) {
        btnBackToLobby.addEventListener("click", () => {
            const lobbyView = document.getElementById("art-lobby-view");
            const zoneView = document.getElementById("art-zone-view");
            if (lobbyView) lobbyView.classList.remove("hidden");
            if (zoneView) zoneView.classList.add("hidden");
        });
    }

    // Sự kiện chuyển tab Xưởng Vẽ (Chỉ dành cho bé lớn >= 9)
    if (dom.btnColoringTabPresets && dom.btnColoringTabFree) {
        if (dom.btnColoringTabPresets) {
            dom.btnColoringTabPresets.addEventListener("click", () => {
                dom.btnColoringTabPresets.classList.add("active");
                if (dom.btnColoringTabFree) dom.btnColoringTabFree.classList.remove("active");
                if (dom.artDraw68) dom.artDraw68.classList.remove("hidden");
                if (dom.artDraw9Up) dom.artDraw9Up.classList.add("hidden");
            });
        }
        
        if (dom.btnColoringTabFree) {
            dom.btnColoringTabFree.addEventListener("click", () => {
                dom.btnColoringTabFree.classList.add("active");
                if (dom.btnColoringTabPresets) dom.btnColoringTabPresets.classList.remove("active");
                if (dom.artDraw68) dom.artDraw68.classList.add("hidden");
                if (dom.artDraw9Up) dom.artDraw9Up.classList.remove("hidden");
            });
        }
    }

    // Reset tô màu 6-8
    if (dom.btnColoringReset) {
        dom.btnColoringReset.addEventListener("click", () => {
            initColoringSubPanel();
        });
    }

    // Reset vẽ tự do 9+
    if (dom.btnDrawingClear && dom.drawingCanvas9) {
        dom.btnDrawingClear.addEventListener("click", () => {
            const canvas = dom.drawingCanvas9;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        });
    }

    // Bấm lưu tranh
    if (dom.btnSaveDrawingWork) {
        dom.btnSaveDrawingWork.addEventListener("click", () => {
            if (state.user.tier === "Guest") {
                dom.signupModal.classList.add("active");
                return;
            }
            
            let canvas = dom.coloringCanvas68;
            if (state.user.ageGroup !== "6-8" && dom.coloringTabsRow) {
                const activeTabBtn = dom.coloringTabsRow.querySelector(".opt-btn.active");
                if (activeTabBtn && activeTabBtn.id === "btn-coloring-tab-free") {
                    canvas = dom.drawingCanvas9;
                }
            }
            let previewData = `🎨 Bức tranh vẽ tay của bé ${state.user.username}`;
            
            addWorkToPassport("drawing", "Tác phẩm hội họa", previewData);
            showCustomAlert("💾", "Đã Lưu Bức Tranh!", "Tranh vẽ của bé đã được cất giữ cẩn thận trong Passport!");
        });
    }

    // AI sinh truyện
    dom.btnGenerateAiStory.addEventListener("click", () => {
        const context = dom.aiStoryContext.value;
        const mission = dom.aiStoryMission.value;
        const customIdea = dom.aiStoryCustomIdea.value;

        showCustomAlert("🪄", "AI Đang Soạn Câu Chuyện...", "Mô hình Gemini-1.5-Flash đang lên ý tưởng và viết truyện cổ tích riêng cho bé...");
        
        setTimeout(() => {
            let storyText = `Ngày xửa ngày xưa, tại ${context}, có một bé tên là ${state.user.username}. 

${state.user.username} sở hữu một trái tim quả cảm và lòng nhân ái. Một ngày nọ, biến cố xảy ra khiến cả vương quốc chấn động. ${state.user.username} quyết định lên đường thực hiện nhiệm vụ: ${mission}.

Với ý tưởng sáng tạo: "${customIdea || 'Đi tìm cuộc phiêu lưu lý thú'}", bé đã vượt qua nhiều thử thách gian nan. Cuối cùng, nhờ sự thông minh và lòng dũng cảm, ${state.user.username} đã hoàn thành sứ mệnh xuất sắc, mang lại hạnh phúc cho mọi người tại ${context}.`;
            
            dom.aiStoryResultText.textContent = storyText;
            dom.aiStorySaveRow.classList.remove("hidden");
            
            // Nếu 11-13+ sinh Storyboard
            if (state.user.ageGroup === "11-13" || state.user.ageGroup === "14-15") {
                dom.aiStoryboardAddon.classList.remove("hidden");
                dom.storyboardScenesContainer.innerHTML = `
                    <div class="storyboard-scene-card">
                        <div class="scene-img-mock">🖼️ Cảnh 1</div>
                        <p class="scene-caption">${state.user.username} xuất hiện ở ${context}</p>
                    </div>
                    <div class="storyboard-scene-card">
                        <div class="scene-img-mock">🖼️ Cảnh 2</div>
                        <p class="scene-caption">Bắt đầu thực hiện: ${mission}</p>
                    </div>
                    <div class="storyboard-scene-card">
                        <div class="scene-img-mock">🖼️ Cảnh 3</div>
                        <p class="scene-caption">Chiến thắng rực rỡ!</p>
                    </div>
                `;
            }
        }, 1500);
    });

    // Lưu truyện
    dom.btnSaveStoryWork.addEventListener("click", () => {
        addWorkToPassport("story", "Truyện cổ tích AI", dom.aiStoryResultText.textContent);
        showCustomAlert("💾", "Lưu Truyện Thành Công!", "Câu chuyện đã được lưu vào Passport.");
    });

    // Đăng feed khám phá
    dom.btnPublishStoryFeed.addEventListener("click", () => {
        if (state.user.tier === "Guest") {
            dom.signupModal.classList.add("active");
            return;
        }

        // Tác phẩm chuyển sang hàng đợi duyệt (Parent Moderation)
        const newWork = {
            id: "work_" + Date.now(),
            kidId: state.user.username,
            username: state.user.username,
            type: "story",
            title: "Truyện AI: " + dom.aiStoryContext.value,
            content: dom.aiStoryResultText.textContent,
            status: "pending_parent"
        };
        state.moderationQueue.push(newWork);
        showCustomAlert("🛡️", "Đã Gửi Duyệt!", "Tác phẩm đã được gửi tới Cổng Phụ Huynh. Bố mẹ duyệt xong sẽ được đăng lên feed!");
    });

    // Khởi tạo sự kiện truyện tranh
    setupComicEvents();
}

function renderMeeToComicPanels() {
    const svgMarkup = renderHumanSVG(state.mee);
    document.querySelectorAll("#art-sub-panel-comic .mee-character-svg").forEach(div => {
        div.innerHTML = svgMarkup;
    });
}

function setupComicEvents() {
    const panelItems = document.querySelectorAll("#art-sub-panel-comic .comic-panel-item");
    let activeComicPanel = 1;

    const updateActivePanelStyle = () => {
        panelItems.forEach(item => {
            const pNum = parseInt(item.dataset.panel);
            if (pNum === activeComicPanel) {
                item.style.border = "2.5px solid var(--color-primary)";
                item.style.background = "#EDF2F7";
                item.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
            } else {
                item.style.border = "2px solid #E2E8F0";
                item.style.background = "#F8FAFC";
                item.style.boxShadow = "none";
            }
        });
    };
    updateActivePanelStyle();

    panelItems.forEach(item => {
        item.addEventListener("click", () => {
            activeComicPanel = parseInt(item.dataset.panel);
            updateActivePanelStyle();
        });
    });

    [1, 2, 3].forEach(idx => {
        const input = document.getElementById(`comic-p${idx}-text`);
        const bubble = document.getElementById(`comic-p${idx}-bubble`);
        if (input && bubble) {
            bubble.style.display = "none";
            input.addEventListener("input", (e) => {
                const val = e.target.value.trim();
                if (val) {
                    bubble.textContent = val;
                    bubble.style.display = "block";
                } else {
                    bubble.textContent = "";
                    bubble.style.display = "none";
                }
            });
        }
    });

    const presetRow = document.getElementById("comic-bg-presets-row");
    if (presetRow) {
        presetRow.querySelectorAll("button").forEach(btn => {
            btn.addEventListener("click", () => {
                const bgVal = btn.dataset.bg;
                const activeView = document.getElementById(`comic-p${activeComicPanel}-view`);
                if (activeView) {
                    activeView.style.background = bgVal;
                }
            });
        });
    }

    if (dom.btnComicAiBgGen) {
        dom.btnComicAiBgGen.addEventListener("click", () => {
            const promptVal = dom.comicAiBgPrompt.value.trim();
            if (!promptVal) {
                showCustomAlert("🪄", "Nhập Ý Tưởng", "Bé hãy nhập ý tưởng hình nền muốn vẽ nhé! Ví dụ: Rừng kẹo ngọt, Dải ngân hà...");
                return;
            }
            showCustomAlert("🪄", "AI Đang Vẽ Nền...", "Gemini-1.5-Flash đang tưởng tượng và sinh ảnh nền nghệ thuật cho Khung Hình " + activeComicPanel + "...");
            
            setTimeout(() => {
                const activeView = document.getElementById(`comic-p${activeComicPanel}-view`);
                if (activeView) {
                    let aiBg = "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)";
                    if (promptVal.toLowerCase().includes("kẹo") || promptVal.toLowerCase().includes("hồng")) {
                        aiBg = "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)";
                    } else if (promptVal.toLowerCase().includes("vũ trụ") || promptVal.toLowerCase().includes("sao") || promptVal.toLowerCase().includes("tối")) {
                        aiBg = "linear-gradient(135deg, #2e0854 0%, #000000 100%)";
                    } else if (promptVal.toLowerCase().includes("rừng") || promptVal.toLowerCase().includes("cây") || promptVal.toLowerCase().includes("lá")) {
                        aiBg = "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)";
                    } else if (promptVal.toLowerCase().includes("biển") || promptVal.toLowerCase().includes("nước") || promptVal.toLowerCase().includes("cá")) {
                        aiBg = "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)";
                    } else {
                        const randomGradients = [
                            "linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)",
                            "linear-gradient(135deg, #8ec5fc 0%, #e0c3fc 100%)",
                            "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                            "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                            "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                        ];
                        aiBg = randomGradients[Math.floor(Math.random() * randomGradients.length)];
                    }
                    activeView.style.background = aiBg;
                }
                showCustomAlert("🎨", "Vẽ Nền Xong!", "Ảnh nền AI cực đẹp đã được vẽ vào Khung Hình " + activeComicPanel + "!");
            }, 1200);
        });
    }

    if (dom.btnSaveComicWork) {
        dom.btnSaveComicWork.addEventListener("click", () => {
            if (state.user.tier === "Guest") {
                dom.signupModal.classList.add("active");
                return;
            }

            const comicData = {
                title: "Bộ Truyện Tranh Của Mee",
                panels: [
                    { bg: document.getElementById("comic-p1-view").style.background, text: document.getElementById("comic-p1-text").value.trim() },
                    { bg: document.getElementById("comic-p2-view").style.background, text: document.getElementById("comic-p2-text").value.trim() },
                    { bg: document.getElementById("comic-p3-view").style.background, text: document.getElementById("comic-p3-text").value.trim() }
                ],
                mee: JSON.parse(JSON.stringify(state.mee))
            };

            addWorkToPassport("comic", "Truyện Tranh Sáng Tạo", JSON.stringify(comicData));
            showCustomAlert("💾", "Đã Lưu Truyện Tranh!", "Bộ truyện tranh của bé đã được cất giữ cẩn thận trong Passport!");
        });
    }
}

function initArtKingdomPanel() {
    const age = state.user.ageGroup;
    
    // Đồng bộ menu tab nghệ thuật theo độ tuổi
    syncArtSubPanelsByAge(age);

    // Hiển thị sảnh chọn xưởng mặc định, ẩn vùng làm việc của từng xưởng
    const lobbyView = document.getElementById("art-lobby-view");
    const zoneView = document.getElementById("art-zone-view");
    if (lobbyView) lobbyView.classList.remove("hidden");
    if (zoneView) zoneView.classList.add("hidden");
}

// ==========================================
// 8.1 FAIRYTALE LIBRARY CAROUSEL & AUDIO
// ==========================================
const FAIRYTALE_DATA = [
    {
        title: "BẢN ĐỒ CỔ TÍCH",
        desc: "Mee tìm thấy chiếc bản đồ cổ tích rực rỡ ẩn giấu bên trong cuốn sách phép thuật tại thư viện cổ của lâu đài.",
        image: "assets/fairytale_scene_1.png",
        lyrics: [
            "Ngày xửa ngày xưa, ở ngôi làng nọ...",
            "Có chú bé Mee thông minh và tinh nghịch.",
            "Mee tìm thấy bản đồ cổ tích rực rỡ ẩn trong cuốn sách phép thuật...",
            "Và chuyến hành trình chính thức được bắt đầu!"
        ]
    },
    {
        title: "THẢM BAY MA THUẬT",
        desc: "Mee bay trên chiếc thảm thần kỳ, vượt qua khu rừng kẹo ngọt đầy những cây kẹo mút khổng lồ sặc sỡ.",
        image: "assets/fairytale_scene_2.png",
        lyrics: [
            "Mee bước lên chiếc thảm bay ma thuật thần kỳ...",
            "Thảm bay vút lên bầu trời, hướng về phía khu rừng kẹo ngọt.",
            "Những cây kẹo mút khổng lồ lấp lánh đủ màu sắc dưới nắng...",
            "Mee reo hò thích thú giữa làn gió mây trôi!"
        ]
    },
    {
        title: "RỒNG CON BONG BÓNG",
        desc: "Mee gặp gỡ chú rồng con dễ thương đang bảo vệ tòa lâu đài bong bóng xà phòng lấp lánh sắc cầu vồng.",
        image: "assets/fairytale_scene_3.png",
        lyrics: [
            "Bên dòng sông lấp lánh hiện ra lâu đài bong bóng xà phòng...",
            "Mee ngạc nhiên nhìn thấy một chú rồng con màu xanh dễ thương.",
            "Chú rồng đang thổi những quả bong bóng xà phòng cầu vồng...",
            "Hai người bạn nhanh chóng cùng nhau vui đùa tinh nghịch!"
        ]
    },
    {
        title: "RƯƠNG SÁCH PHÉP THUẬT",
        desc: "Mee mở chiếc rương báu cổ xưa, tìm thấy kho tàng sách phép thuật phát sáng lung linh trong căn phòng bí mật.",
        image: "assets/fairytale_scene_4.png",
        lyrics: [
            "Tiến vào mật thất bí ẩn sâu bên trong tòa lâu đài cổ...",
            "Mee phát hiện ra một chiếc rương gỗ cổ xưa đầy bụi bặm.",
            "Khi mở rương, luồng ánh sáng phép thuật lấp lánh tỏa ra...",
            "Những cuốn sách cổ tự phát sáng rực rỡ như một phép màu!"
        ]
    },
    {
        title: "SƠN TINH THỦY TINH",
        desc: "Cuộc đọ sức long trời lở đất giữa thần núi Sơn Tinh và thần nước Thủy Tinh tranh giành công chúa Mỵ Nương.",
        image: "assets/xuong_ve.jpeg",
        lyrics: [
            "Sơn Tinh dâng núi cao lên bao nhiêu...",
            "Thủy Tinh lại dâng nước lũ cao lên bấy nhiêu.",
            "Cuộc đọ sức kịch tính kéo dài ròng rã suốt nhiều ngày đêm...",
            "Cuối cùng, thần núi Sơn Tinh đã giành chiến thắng vẻ vang!"
        ]
    },
    {
        title: "THẠCH SANH DŨNG CẢM",
        desc: "Chàng tiều phu Thạch Sanh dũng cảm chém chằn tinh, bắn đại bàng khổng lồ cứu công chúa cứu nước cứu dân.",
        image: "assets/thu_vien.jpeg",
        lyrics: [
            "Dưới gốc đa cổ thụ, Thạch Sanh giương cung thần...",
            "Chàng bắn hạ con đại bàng tinh khổng lồ đang bắt công chúa.",
            "Với lòng dũng cảm phi thường và cây búa rìu trên tay...",
            "Thạch Sanh đã lập nên những chiến công lẫy lừng vang dội!"
        ]
    },
    {
        title: "SỰ TÍCH HỒ GƯƠM",
        desc: "Vua Lê Lợi trả lại gươm báu Thuận Thiên cho rùa vàng thần Kim Quy sau khi dẹp tan giặc Minh xâm lược.",
        image: "assets/truyen_tranh.jpeg",
        lyrics: [
            "Sau khi đánh đuổi hoàn toàn quân giặc xâm lược ra khỏi bờ cõi...",
            "Vua Lê Lợi dạo thuyền rồng ngắm cảnh trên hồ Tả Vọng.",
            "Rùa vàng Kim Quy nhô lên và cất tiếng xin lại thanh gươm báu...",
            "Vua liền trả gươm, từ đó hồ được đổi tên thành Hồ Hoàn Kiếm!"
        ]
    },
    {
        title: "ĂN KHẾ TRẢ VÀNG",
        desc: "Chú chim phượng hoàng ăn khế và trả lại cục vàng to lớn, giúp người em hiền lành có cuộc sống hạnh phúc.",
        image: "assets/photobooth.jpeg",
        lyrics: [
            "Một ngày nọ, có chú chim phượng hoàng khổng lồ bay đến ăn khế...",
            "Chim cất tiếng hứa: Ăn một quả, trả một cục vàng, may túi ba gang.",
            "Người em hiền lành được chim chở ra đảo hoang lấy vàng...",
            "Từ đó, người em có cuộc sống ấm no và luôn giúp đỡ mọi người!"
        ]
    },
    {
        title: "CỔ TÍCH SÔNG HỒNG",
        desc: "Những truyền thuyết lịch sử cổ xưa kỳ vĩ gắn liền với dòng sông Hồng đỏ nặng phù sa mang nặng tình quê hương.",
        image: "assets/phim_truong.jpeg",
        lyrics: [
            "Dòng sông Hồng đỏ nặng phù sa trôi êm đềm qua bao năm tháng...",
            "Nơi đây lưu giữ biết bao câu chuyện truyền thuyết hào hùng.",
            "Từ bọc trăm trứng của mẹ Âu Cơ đến truyền thuyết Chử Đồng Tử...",
            "Mỗi tấc đất, dòng nước đều mang đậm tình yêu quê hương Việt Nam!"
        ]
    }
];

let currentFairytaleIndex = 0;
let fairytaleAudioInterval = null;
let isFairytaleAudioPlaying = false;

function initFairytaleLibrary() {
    const age = state.user.ageGroup;
    
    const story68 = document.getElementById("art-story-6-8");
    const story9Up = document.getElementById("art-story-9-up");
    
    // Bé nghe luôn hiện cho tất cả các tuổi (kế thừa)
    if (story68) story68.classList.remove("hidden");
    
    // Sáng tác AI chỉ hiện từ 9 tuổi trở lên
    if (story9Up) {
        if (age === "6-8") {
            story9Up.classList.add("hidden");
        } else {
            story9Up.classList.remove("hidden");
        }
    }
    
    currentFairytaleIndex = 0;
    updateFairytaleSlide(currentFairytaleIndex);
    resetFairytaleAudio();
    
    // Sinh động lưới "Thế Giới Truyện" 3x3 ở bên phải
    const grid = document.getElementById("fairytale-story-grid");
    if (grid) {
        grid.innerHTML = "";
        FAIRYTALE_DATA.forEach((story, idx) => {
            const card = document.createElement("div");
            card.className = `story-shelf-card ${idx === currentFairytaleIndex ? "active" : ""}`;
            card.dataset.index = idx;
            card.innerHTML = `
                <img src="${story.image}" alt="${story.title}">
                <span>${story.title}</span>
            `;
            card.addEventListener("click", () => {
                currentFairytaleIndex = idx;
                updateFairytaleSlide(currentFairytaleIndex);
                resetFairytaleAudio(); // Reset audio khi đổi câu chuyện mới
                
                // Cập nhật active card trong grid
                document.querySelectorAll(".story-shelf-card").forEach((c, i) => {
                    c.classList.toggle("active", i === idx);
                });
            });
            grid.appendChild(card);
        });
    }
    
    // Khởi tạo sự kiện Audio Player
    const btnPlay = document.getElementById("btn-story-play-68");
    if (btnPlay) {
        const newBtn = btnPlay.cloneNode(true);
        btnPlay.parentNode.replaceChild(newBtn, btnPlay);
        
        newBtn.addEventListener("click", () => {
            if (isFairytaleAudioPlaying) {
                pauseFairytaleAudio();
            } else {
                playFairytaleAudio();
            }
        });
    }
}

function updateFairytaleSlide(index) {
    const slide = FAIRYTALE_DATA[index];
    if (!slide) return;
    
    const mainImg = document.getElementById("fairytale-main-img");
    const stageTitle = document.getElementById("fairytale-stage-title");
    const balloonTitle = document.getElementById("fairytale-balloon-title");
    const balloonDesc = document.getElementById("fairytale-balloon-desc");
    
    if (mainImg) mainImg.src = slide.image;
    if (stageTitle) stageTitle.innerText = slide.title;
    if (balloonTitle) balloonTitle.innerText = slide.title;
    if (balloonDesc) balloonDesc.innerText = slide.desc;
}

function playFairytaleAudio() {
    isFairytaleAudioPlaying = true;
    const btnPlay = document.getElementById("btn-story-play-68");
    if (btnPlay) btnPlay.innerText = "⏸ Stop Audio";
    
    const progressBar = document.getElementById("story-progress-68");
    let progress = 0;
    
    if (fairytaleAudioInterval) clearInterval(fairytaleAudioInterval);
    
    const slide = FAIRYTALE_DATA[currentFairytaleIndex];
    // Dữ liệu chữ chạy karaoke lấy trực tiếp từ truyện đang chọn
    const lyrics = slide ? slide.lyrics : [
        "Ngày xửa ngày xưa, ở ngôi làng nọ...",
        "Có một chàng trai nghèo hiền lành, khỏe mạnh...",
        "Mee rất thích đọc sách khám phá và ước ao một cuộc phiêu lưu kì thú...",
        "Và thế là câu chuyện phép thuật bắt đầu!"
    ];
    
    const lyricElements = document.querySelectorAll(".lyrics-line");
    
    fairytaleAudioInterval = setInterval(() => {
        progress += 0.625; // Tăng dần lên 100% trong 16 giây
        if (progressBar) progressBar.style.width = `${progress}%`;
        
        const lyricIndex = Math.min(Math.floor(progress / 25), 3);
        lyricElements.forEach((el, idx) => {
            if (el) {
                el.classList.toggle("active", idx === lyricIndex);
                if (idx === lyricIndex && el.innerText !== lyrics[idx]) {
                    el.innerText = lyrics[idx];
                }
            }
        });
        
        if (progress >= 100) {
            resetFairytaleAudio();
        }
    }, 100);
}

function pauseFairytaleAudio() {
    isFairytaleAudioPlaying = false;
    const btnPlay = document.getElementById("btn-story-play-68");
    if (btnPlay) btnPlay.innerText = "▶ Play Audio";
    if (fairytaleAudioInterval) clearInterval(fairytaleAudioInterval);
}

function resetFairytaleAudio() {
    isFairytaleAudioPlaying = false;
    const btnPlay = document.getElementById("btn-story-play-68");
    if (btnPlay) btnPlay.innerText = "▶ Play Audio";
    if (fairytaleAudioInterval) clearInterval(fairytaleAudioInterval);
    
    const progressBar = document.getElementById("story-progress-68");
    if (progressBar) progressBar.style.width = "0%";
    
    const slide = FAIRYTALE_DATA[currentFairytaleIndex];
    const lyricElements = document.querySelectorAll(".lyrics-line");
    lyricElements.forEach((el, idx) => {
        if (el) {
            el.classList.toggle("active", idx === 0);
            if (slide && slide.lyrics) {
                if (idx === 0) el.innerText = slide.lyrics[0];
                if (idx === 1) el.innerText = slide.lyrics[1];
            } else {
                if (idx === 0) el.innerText = "Ngày xửa ngày xưa, ở ngôi làng nọ...";
                if (idx === 1) el.innerText = "Có một chàng trai nghèo hiền lành, khỏe mạnh...";
            }
        }
    });
}

// ==========================================
// DỮ LIỆU CÁC MẪU TRANH TÔ MÀU PHONG CÁCH BLUEY
// ==========================================
const COLORING_PRESETS = {
    bear: {
        title: "Chú Gấu Con",
        draw: (ctx, canvas) => {
            ctx.strokeStyle = "#1A1A1A";
            ctx.lineWidth = 5;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            // Mặt gấu
            ctx.beginPath();
            ctx.arc(250, 150, 75, 0, Math.PI * 2);
            ctx.stroke();

            // Tai trái
            ctx.beginPath();
            ctx.arc(175, 85, 28, 0, Math.PI * 2);
            ctx.stroke();

            // Tai phải
            ctx.beginPath();
            ctx.arc(325, 85, 28, 0, Math.PI * 2);
            ctx.stroke();

            // Mắt trái
            ctx.fillStyle = "#1A1A1A";
            ctx.beginPath();
            ctx.arc(220, 130, 9, 0, Math.PI * 2);
            ctx.fill();

            // Mắt phải
            ctx.beginPath();
            ctx.arc(280, 130, 9, 0, Math.PI * 2);
            ctx.fill();

            // Mũi miệng dẹt ngang
            ctx.beginPath();
            ctx.ellipse(250, 165, 15, 10, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Má hồng xinh xắn (nét vẽ đứt)
            ctx.beginPath();
            ctx.arc(195, 160, 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(305, 160, 8, 0, Math.PI * 2);
            ctx.stroke();

            // Phân vùng số hóa
            ctx.fillStyle = "#A0AEC0";
            ctx.font = "bold 15px Outfit";
            ctx.fillText("1 (Tai)", 158, 90);
            ctx.fillText("1 (Tai)", 310, 90);
            ctx.fillText("2 (Mặt)", 230, 205);
            ctx.fillText("3 (Nền)", 60, 60);
        }
    },
    castle: {
        title: "Lâu Đài Phép Thuật",
        draw: (ctx, canvas) => {
            ctx.strokeStyle = "#1A1A1A";
            ctx.lineWidth = 5;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            // Tường thành chính
            ctx.beginPath();
            ctx.rect(170, 135, 160, 115);
            ctx.stroke();

            // Cửa vòm lâu đài
            ctx.beginPath();
            ctx.moveTo(225, 250);
            ctx.lineTo(225, 205);
            ctx.quadraticCurveTo(250, 185, 275, 205);
            ctx.lineTo(275, 250);
            ctx.stroke();

            // Tháp trái
            ctx.beginPath();
            ctx.rect(125, 95, 45, 155);
            ctx.stroke();

            // Mái chóp tháp trái
            ctx.beginPath();
            ctx.moveTo(125, 95);
            ctx.lineTo(147.5, 35);
            ctx.lineTo(170, 95);
            ctx.closePath();
            ctx.stroke();

            // Tháp phải
            ctx.beginPath();
            ctx.rect(330, 95, 45, 155);
            ctx.stroke();

            // Mái chóp tháp phải
            ctx.beginPath();
            ctx.moveTo(330, 95);
            ctx.lineTo(352.5, 35);
            ctx.lineTo(375, 95);
            ctx.closePath();
            ctx.stroke();

            // Mái tam giác chính giữa
            ctx.beginPath();
            ctx.moveTo(170, 135);
            ctx.lineTo(250, 75);
            ctx.lineTo(330, 135);
            ctx.closePath();
            ctx.stroke();

            // Cửa sổ tròn trên tháp chính giữa
            ctx.beginPath();
            ctx.arc(250, 115, 10, 0, Math.PI * 2);
            ctx.stroke();

            // Phân vùng số hóa
            ctx.fillStyle = "#A0AEC0";
            ctx.font = "bold 15px Outfit";
            ctx.fillText("1 (Mái)", 232, 142);
            ctx.fillText("2 (Tường)", 222, 172);
            ctx.fillText("3 (Nền)", 60, 60);
            ctx.fillText("4 (Cửa)", 238, 228);
        }
    },
    carpet: {
        title: "Thảm Bay Kỳ Diệu",
        draw: (ctx, canvas) => {
            ctx.strokeStyle = "#1A1A1A";
            ctx.lineWidth = 5;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            // Thảm bay ngoài hình thoi cong
            ctx.beginPath();
            ctx.moveTo(90, 160);
            ctx.quadraticCurveTo(250, 95, 410, 160);
            ctx.quadraticCurveTo(250, 225, 90, 160);
            ctx.closePath();
            ctx.stroke();

            // Nét lượn sóng hoa văn bên trong thảm
            ctx.beginPath();
            ctx.moveTo(110, 160);
            ctx.quadraticCurveTo(250, 115, 390, 160);
            ctx.stroke();

            // Tâm thảm bay hình quả trám tròn
            ctx.beginPath();
            ctx.arc(250, 160, 15, 0, Math.PI * 2);
            ctx.stroke();

            // Tua rua trang trí đầu thảm trái
            ctx.beginPath();
            ctx.moveTo(90, 160); ctx.lineTo(72, 150);
            ctx.moveTo(90, 160); ctx.lineTo(65, 165);
            ctx.moveTo(90, 160); ctx.lineTo(72, 180);
            ctx.stroke();

            // Tua rua trang trí đầu thảm phải
            ctx.beginPath();
            ctx.moveTo(410, 160); ctx.lineTo(428, 150);
            ctx.moveTo(410, 160); ctx.lineTo(435, 165);
            ctx.moveTo(410, 160); ctx.lineTo(428, 180);
            ctx.stroke();

            // Đám mây bồng bềnh bên trái
            ctx.beginPath();
            ctx.arc(95, 75, 18, 0.5 * Math.PI, 1.8 * Math.PI);
            ctx.arc(120, 65, 24, 1.2 * Math.PI, 1.8 * Math.PI);
            ctx.arc(145, 75, 18, 1.2 * Math.PI, 0.5 * Math.PI);
            ctx.stroke();

            // Đám mây bồng bềnh bên phải
            ctx.beginPath();
            ctx.arc(315, 85, 18, 0.5 * Math.PI, 1.8 * Math.PI);
            ctx.arc(340, 75, 24, 1.2 * Math.PI, 1.8 * Math.PI);
            ctx.arc(365, 85, 18, 1.2 * Math.PI, 0.5 * Math.PI);
            ctx.stroke();

            // Phân vùng số hóa
            ctx.fillStyle = "#A0AEC0";
            ctx.font = "bold 15px Outfit";
            ctx.fillText("1 (Thảm)", 228, 195);
            ctx.fillText("2 (Hoa Văn)", 210, 138);
            ctx.fillText("3 (Nền)", 60, 60);
            ctx.fillText("4 (Mây)", 110, 105);
        }
    }
};

function initColoringSubPanel() {
    // Canvas & Context vẽ
    const canvas = document.getElementById("ai-user-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // Đặt màu nền trắng mặc định
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Trạng thái vẽ
    let isDrawing = false;
    let activeTool = "brush"; // "brush", "pencil", hoặc "eraser"
    let selectedStyle = "chibi";
    
    const brushColor = document.getElementById("ai-brush-color");
    const brushSize = document.getElementById("ai-brush-size");
    const toolBrush = document.getElementById("tool-brush");
    const toolPencil = document.getElementById("tool-pencil");
    const toolEraser = document.getElementById("tool-eraser");
    const stickerShelf = document.getElementById("ai-sticker-shelf");
    const btnClear = document.getElementById("btn-ai-drawing-clear");
    const uploadInput = document.getElementById("drawing-upload-input");
    const btnGen = document.getElementById("btn-ai-generate");
    const btnDiary = document.getElementById("btn-push-to-diary");
    
    // Giả lập AI vẽ lại
    const placeholder = document.getElementById("ai-image-placeholder");
    const genImg = document.getElementById("ai-generated-img");
    const loader = document.getElementById("ai-loading-overlay");

    // Step Elements
    const step1 = document.getElementById("drawing-step-1");
    const step2 = document.getElementById("drawing-step-2");
    const btnGotoStep2 = document.getElementById("btn-goto-step2");
    const btnBackToStep1 = document.getElementById("btn-back-to-step1");
    const activeStyleLabel = document.getElementById("active-style-label");
    
    // Reset về step 1 khi mở xưởng vẽ
    if (step1) step1.classList.remove("hidden");
    if (step2) step2.classList.add("hidden");
    
    // Style Map Emojis
    const styleEmojis = {
        chibi: "🧸 Chibi",
        anime: "🌸 Anime",
        pixar: "🎬 Pixar 3D",
        comic: "💬 Comic",
        watercolor: "🎨 Màu Nước",
        neon: "⚡ Neon Glow"
    };
    
    // Click Tiếp tục
    if (btnGotoStep2) {
        btnGotoStep2.onclick = () => {
            if (step1) step1.classList.add("hidden");
            if (step2) step2.classList.remove("hidden");
            if (activeStyleLabel) {
                activeStyleLabel.textContent = `Phong cách: ${styleEmojis[selectedStyle] || selectedStyle.toUpperCase()}`;
            }
            // Reset kích thước canvas vẽ khi chuyển sang step 2
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Reset kết quả AI bên phải
            if (placeholder) placeholder.classList.remove("hidden");
            if (genImg) genImg.classList.add("hidden");
            if (loader) loader.classList.add("hidden");
            state.lastAiArt = "";
        };
    }
    
    // Click Chọn lại style
    if (btnBackToStep1) {
        btnBackToStep1.onclick = () => {
            if (step2) step2.classList.add("hidden");
            if (step1) step1.classList.remove("hidden");
        };
    }
    
    // Lấy tọa độ tương đối trên canvas (hỗ trợ cả mobile cảm ứng)
    function getMousePos(canvasDom, clientX, clientY) {
        const rect = canvasDom.getBoundingClientRect();
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }
    
    // Bắt đầu vẽ
    function startDraw(e) {
        isDrawing = true;
        ctx.beginPath();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        const pos = getMousePos(canvas, clientX, clientY);
        ctx.moveTo(pos.x, pos.y);
        e.preventDefault();
    }
    
    // Vẽ nét
    function draw(e) {
        if (!isDrawing) return;
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        const pos = getMousePos(canvas, clientX, clientY);
        
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        
        if (activeTool === "eraser") {
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = brushSize ? brushSize.value : 8;
            ctx.globalAlpha = 1.0;
        } else if (activeTool === "pencil") {
            ctx.strokeStyle = "#4A5568"; // Màu xám bút chì vẽ phác thảo
            ctx.lineWidth = 2; // Bút chì nét siêu mảnh
            ctx.globalAlpha = 0.65; // Hơi mờ phác thảo như chì thật
        } else {
            // Brush vẽ cọ
            ctx.strokeStyle = brushColor ? brushColor.value : "#4F46E5";
            ctx.lineWidth = brushSize ? brushSize.value : 8;
            ctx.globalAlpha = 1.0;
        }
        
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        e.preventDefault();
    }
    
    // Kết thúc vẽ
    function stopDraw() {
        isDrawing = false;
        ctx.globalAlpha = 1.0; // Khôi phục alpha mặc định
    }
    
    // Gán sự kiện canvas
    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDraw);
    canvas.addEventListener("mouseleave", stopDraw);
    
    canvas.addEventListener("touchstart", startDraw, {passive: false});
    canvas.addEventListener("touchmove", draw, {passive: false});
    canvas.addEventListener("touchend", stopDraw);
    
    // Nút chọn nét Dày / Mỏng nhanh qua click chấm tròn
    document.querySelectorAll(".size-dot").forEach(dot => {
        dot.onclick = () => {
            const sizeVal = dot.dataset.size;
            if (brushSize) {
                brushSize.value = sizeVal;
            }
        };
    });
    
    // Tool Brush
    if (toolBrush) {
        toolBrush.onclick = () => {
            activeTool = "brush";
            toolBrush.classList.add("active");
            if (toolPencil) toolPencil.classList.remove("active");
            if (toolEraser) toolEraser.classList.remove("active");
        };
    }
    
    // Tool Pencil
    if (toolPencil) {
        toolPencil.onclick = () => {
            activeTool = "pencil";
            toolPencil.classList.add("active");
            if (toolBrush) toolBrush.classList.remove("active");
            if (toolEraser) toolEraser.classList.remove("active");
        };
    }
    
    // Tool Eraser
    if (toolEraser) {
        toolEraser.onclick = () => {
            activeTool = "eraser";
            toolEraser.classList.add("active");
            if (toolBrush) toolBrush.classList.remove("active");
            if (toolPencil) toolPencil.classList.remove("active");
        };
    }
    
    // Xóa sạch canvas
    if (btnClear) {
        btnClear.onclick = () => {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };
    }
    
    // Ghim Sticker
    let selectedSticker = "";
    if (stickerShelf) {
        stickerShelf.querySelectorAll(".sticker-item").forEach(st => {
            st.onclick = (e) => {
                stickerShelf.querySelectorAll(".sticker-item").forEach(s => s.classList.remove("active"));
                st.classList.add("active");
                selectedSticker = st.dataset.sticker;
                activeTool = "sticker"; // đặt tool tạm thời
            };
        });
    }
    
    canvas.addEventListener("click", (e) => {
        if (selectedSticker && activeTool === "sticker") {
            const pos = getMousePos(canvas, e.clientX, e.clientY);
            ctx.font = "40px Arial";
            ctx.fillText(selectedSticker, pos.x - 20, pos.y + 15);
            selectedSticker = "";
            if (stickerShelf) {
                stickerShelf.querySelectorAll(".sticker-item").forEach(s => s.classList.remove("active"));
            }
            activeTool = "brush"; // Trở lại vẽ cọ
            if (toolBrush) toolBrush.classList.add("active");
        }
    });
    
    // Upload hình vẽ
    if (uploadInput) {
        uploadInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    ctx.fillStyle = "#FFFFFF";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
                    const w = img.width * ratio;
                    const h = img.height * ratio;
                    const x = (canvas.width - w) / 2;
                    const y = (canvas.height - h) / 2;
                    ctx.drawImage(img, x, y, w, h);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        };
    }
    
    // Lựa chọn Style nghệ thuật
    document.querySelectorAll(".style-btn").forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll(".style-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedStyle = btn.dataset.style;
        };
    });
    
    state.lastAiArt = "";
    if (placeholder) placeholder.classList.remove("hidden");
    if (genImg) genImg.classList.add("hidden");
    if (loader) loader.classList.add("hidden");
    
    if (btnGen) {
        btnGen.onclick = () => {
            if (loader) loader.classList.remove("hidden");
            
            // Giả lập AI múa cọ vẽ tranh
            setTimeout(() => {
                if (loader) loader.classList.add("hidden");
                if (placeholder) placeholder.classList.add("hidden");
                
                // Mảng các hình ảnh AI tương ứng style
                const styleImages = {
                    chibi: "assets/images/drawing.jpeg",
                    anime: "assets/images/comic.jpeg",
                    pixar: "assets/images/stories.jpeg",
                    comic: "assets/images/comic.jpeg",
                    watercolor: "assets/images/drawing.jpeg",
                    neon: "assets/images/character.png"
                };
                
                const resultArt = styleImages[selectedStyle] || "assets/images/drawing.jpeg";
                state.lastAiArt = resultArt;
                
                if (genImg) {
                    genImg.src = resultArt;
                    genImg.classList.remove("hidden");
                }
                
                showCustomAlert("🪄", "AI Đã Vẽ Xong!", `AI đã hô biến tác phẩm của bé sang style **${selectedStyle.toUpperCase()}** cực kỳ lung linh rồi nhé!`);
            }, 2000);
        };
    }
    
    // Đẩy vào Diary (Lưu passport nhật ký)
    if (btnDiary) {
        btnDiary.onclick = () => {
            if (!state.lastAiArt) {
                showCustomAlert("🐻", "Chưa Có Tranh AI", "Bé hãy vẽ tranh hoặc tải ảnh lên và bấm **AI Vẽ Lại** để tạo tranh phép thuật trước nhé!");
                return;
            }
            
            // Thêm vào passport
            const previewHTML = `<img src="${state.lastAiArt}" style="width:100%; height:100%; object-fit:cover;">`;
            addWorkToPassport("drawing", `AI Art Style: ${selectedStyle.toUpperCase()}`, previewHTML);
            
            // Đồng bộ lại UI timeline của Passport
            initPassportPanel();
            
            showCustomAlert("📖", "Nhật Ký Đã Lưu!", `Bức tranh AI biến hóa lung linh đã được dán vào Nhật Ký (Passport) của bé thành công! Bé sẽ được cộng thêm **50 xu sáng tạo**! ✨`);
        };
    }
}
// 9. MODULE: BRAIN ARENA (ĐẤU TRÍ)
function setupBrainArenaEvents() {
    document.querySelectorAll(".brain-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".brain-tab-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            document.querySelectorAll(".brain-sub-panel").forEach(p => p.classList.add("hidden"));
            const targetPanel = document.getElementById(`brain-sub-panel-${btn.dataset.sub}`);
            if (targetPanel) {
                targetPanel.classList.remove("hidden");
                if (btn.dataset.sub === "quiz") initQuizGame();
            }
        });
    });

    // Reset spot diff
    dom.btnPuzDiffReset.addEventListener("click", () => {
        state.diffGame.spotsFound = [];
        document.querySelectorAll(".diff-spot").forEach(s => s.classList.remove("found"));
        dom.puzDiffRem.textContent = "3";
    });

    // Spot diff click
    document.querySelectorAll(".diff-spot").forEach(spot => {
        spot.addEventListener("click", () => {
            const id = spot.dataset.id;
            if (!state.diffGame.spotsFound.includes(id)) {
                state.diffGame.spotsFound.push(id);
                spot.classList.add("found");
                
                const rem = 3 - state.diffGame.spotsFound.length;
                dom.puzDiffRem.textContent = rem;
                
                if (rem === 0) {
                    state.user.credits += 30;
                    dom.coinCount.textContent = `🪙 ${state.user.credits} Credits`;
                    showCustomAlert("🎉", "Chiến Thắng!", "Bé đã tìm thấy toàn bộ 3 điểm khác biệt và được thưởng 30 Credits!");
                }
            }
        });
    });

    // AI gen spot diff
    dom.btnPuzAiGen.addEventListener("click", () => {
        showCustomAlert("🤖", "AI Đang Tạo Tranh...", "Mô hình khuếch tán hình ảnh AI đang sinh ra 2 bức tranh có 5 điểm khác biệt tinh tế...");
    });

    // Run logic game
    dom.btnRunLogicGame.addEventListener("click", () => {
        showCustomAlert("🎮", "Chạy Game!", "Chương trình logic block chạy thành công! Mee đã thoát khỏi mê cung.");
    });
}

function initBrainArenaPanel() {
    const age = state.user.ageGroup;
    
    // Tạo quiz riêng chỉ từ 9 tuổi trở lên
    dom.brainTabMyquiz.classList.toggle("hidden", age === "6-8");

    // Đồng bộ tiểu phân hệ Puzzle
    dom.puzzle68.classList.toggle("hidden", age !== "6-8");
    dom.puzzle910.classList.toggle("hidden", age !== "9-10");
    dom.puzzle11Up.classList.toggle("hidden", age !== "11-13" && age !== "14-15");

    // Đồng bộ đấu trường
    dom.arenaNormalChallenges.classList.toggle("hidden", age === "11-13" || age === "14-15");
    dom.arena11UpVideo.classList.toggle("hidden", age !== "11-13");
    dom.arena1415Rank.classList.toggle("hidden", age !== "14-15");

    document.querySelector(".brain-tab-btn").click();
}

function initQuizGame() {
    state.currentQuiz.questionIndex = 0;
    state.currentQuiz.questions = CONFIG.quizzes[state.user.ageGroup] || CONFIG.quizzes["6-8"];
    renderQuizQuestion();
}

function renderQuizQuestion() {
    const index = state.currentQuiz.questionIndex;
    const questions = state.currentQuiz.questions;
    
    dom.brainQuizFeedback.classList.add("hidden");
    
    if (index >= questions.length) {
        state.user.credits += 20;
        dom.coinCount.textContent = `🪙 ${state.user.credits} Credits`;
        showCustomAlert("🏆", "Hoàn Thành Quiz!", "Bé đã xuất sắc trả lời hết câu hỏi và nhận được 20 Credits thưởng!");
        initQuizGame();
        return;
    }

    const currentQ = questions[index];
    dom.brainQuizCurrQ.textContent = index + 1;
    dom.brainQuizProgress.style.width = `${((index + 1) / questions.length) * 100}%`;
    dom.brainQuizQuestionText.textContent = currentQ.q;

    dom.brainQuizOptionsList.innerHTML = "";
    currentQ.options.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.className = "quiz-opt-btn";
        btn.textContent = opt;
        
        btn.addEventListener("click", () => {
            // Disable all options
            dom.brainQuizOptionsList.querySelectorAll(".quiz-opt-btn").forEach(b => b.disabled = true);
            
            if (idx === currentQ.correct) {
                btn.classList.add("correct-opt");
                dom.brainQuizFeedback.innerHTML = `<strong>Đúng rồi! 🎉</strong> ${currentQ.exp}`;
                dom.brainQuizFeedback.style.color = "#2E7D32";
            } else {
                btn.classList.add("wrong-opt");
                dom.brainQuizFeedback.innerHTML = `<strong>Chưa đúng rồi bé ơi! ❌</strong> Câu trả lời đúng là: ${currentQ.options[currentQ.correct]}. ${currentQ.exp}`;
                dom.brainQuizFeedback.style.color = "#C62828";
            }
            dom.brainQuizFeedback.classList.remove("hidden");

            // Next question after 3s
            setTimeout(() => {
                state.currentQuiz.questionIndex++;
                renderQuizQuestion();
            }, 3000);
        });
        dom.brainQuizOptionsList.appendChild(btn);
    });
}

// 10. MODULE: ACADEMY (HỌC VIỆN NGÔI SAO)
function setupAcademyEvents() {
    dom.btnBackToCourses.addEventListener("click", () => {
        dom.academyCourseDetail.classList.add("hidden");
        dom.academyCoursesContainer.classList.remove("hidden");
    });

    dom.btnAcademyDoHomework.addEventListener("click", () => {
        if (state.user.tier === "Guest") {
            dom.signupModal.classList.add("active");
            return;
        }

        // Tự động lưu bài làm thực hành vào Passport
        state.user.credits += 40;
        dom.coinCount.textContent = `🪙 ${state.user.credits} Credits`;
        
        addWorkToPassport("drawing", "Bài thực hành Học Viện", "🎨 Bài làm thực hành vẽ khối hình học của bé.");
        showCustomAlert("🎓", "Hoàn Thành Bài Tập!", "Chúc mừng bé đã nộp bài tập thực hành thành công, bài tập đã được lưu vào Passport và bé được nhận 40 Credits thưởng!");
        
        dom.btnBackToCourses.click();
    });
}

function initAcademyPanel() {
    dom.academyCourseDetail.classList.add("hidden");
    dom.academyCoursesContainer.classList.remove("hidden");

    dom.academyCoursesContainer.innerHTML = "";
    const courses = CONFIG.academyCourses[state.user.ageGroup] || CONFIG.academyCourses["6-8"];
    courses.forEach(course => {
        const card = document.createElement("div");
        card.className = "course-card";
        card.innerHTML = `
            <h3>${course.title}</h3>
            <p>${course.desc}</p>
            <div class="course-status">Trạng thái: ${course.status} (${course.lessons} bài)</div>
        `;

        card.addEventListener("click", () => {
            dom.academyCoursesContainer.classList.add("hidden");
            dom.academyCourseDetail.classList.remove("hidden");
            dom.academyCourseTitle.textContent = course.title;
            dom.academyLessonName.textContent = `Bài 1: Làm quen cùng ${course.title.split(" ")[1]}`;
        });
        dom.academyCoursesContainer.appendChild(card);
    });
}

// 11. MODULE: EXPLORE (KHÁM PHÁ CỘNG ĐỒNG)
function setupExploreEvents() {
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderExploreFeed(btn.dataset.filter);
        });
    });

    dom.btnExploreLoadMore.addEventListener("click", () => {
        showCustomAlert("🔭", "Xem Thêm", "Đang tải thêm 20 tác phẩm mới nhất đã được kiểm duyệt an toàn...");
    });
}

function initExplorePanel() {
    renderExploreFeed("all");

    // Nếu 14-15 tuổi Premium, mở Marketplace
    if (state.user.ageGroup === "14-15") {
        dom.exploreMarketplaceBox.classList.remove("hidden");
        renderMarketplaceItems();
    } else {
        dom.exploreMarketplaceBox.classList.add("hidden");
    }
}

function renderExploreFeed(filter) {
    dom.exploreFeedGrid.innerHTML = "";
    const feed = state.exploreFeed;
    
    feed.forEach(item => {
        if (filter !== "all" && item.type !== filter) return;

        const card = document.createElement("div");
        card.className = "feed-card";
        
        // Ẩn số like nếu bé dưới 13 tuổi (6-8, 9-10, 11-13)
        const showLikesCount = (state.user.ageGroup === "14-15");
        
        // Render comments
        let commentsHtml = "";
        item.comments.forEach(c => {
            commentsHtml += `<div class="comment-line"><strong>${c.author}:</strong> ${c.text}</div>`;
        });

        // Ẩn tính năng bình luận/like hoàn toàn với 6-8 tuổi
        const hasSocialFeatures = (state.user.ageGroup !== "6-8");

        card.innerHTML = `
            <div class="feed-header">
                <div class="feed-author">
                    <div class="feed-author-avatar">${AVATAR_SVGS[item.avatar]('#E2E8F0')}</div>
                    <span class="feed-author-name">${item.author}</span>
                </div>
                <span class="feed-type-badge">${item.type.toUpperCase()}</span>
            </div>
            <div class="feed-media-preview">${item.preview}</div>
            <h4 style="margin: 5px 0;">${item.title}</h4>
            
            ${hasSocialFeatures ? `
                <div class="feed-footer">
                    <span class="feed-action-heart">${item.liked ? '❤️' : '🤍'}</span>
                    ${showLikesCount ? `<span>${item.likes} lượt thích</span>` : `<span>Thả Tim</span>`}
                </div>
                <div class="feed-comments-box">
                    ${commentsHtml}
                    <!-- Viết bình luận bằng template -->
                    ${(state.user.ageGroup === "11-13" || state.user.ageGroup === "14-15") && state.user.tier !== "Guest" ? `
                        <div class="comment-input-area">
                            <select class="app-input comment-select-template" style="padding:4px; font-size:0.75rem;">
                                <option value="">-- Bình luận nhanh --</option>
                                ${CONFIG.commentTemplates[state.user.ageGroup].map(t => `<option value="${t}">${t}</option>`).join('')}
                            </select>
                            <button class="btn-micro btn-post-comment" style="padding:4px 8px;">Gửi</button>
                        </div>
                    ` : ''}
                </div>
            ` : '<em>Giao diện an toàn: Khóa tính năng tương tác xã hội.</em>'}
        `;

        // Sự kiện thả tim
        if (hasSocialFeatures) {
            card.querySelector(".feed-action-heart").addEventListener("click", () => {
                if (state.user.tier === "Guest") {
                    dom.signupModal.classList.add("active");
                    return;
                }
                item.liked = !item.liked;
                item.likes += item.liked ? 1 : -1;
                renderExploreFeed(filter);
            });

            // Sự kiện bình luận template
            const btnComment = card.querySelector(".btn-post-comment");
            if (btnComment) {
                btnComment.addEventListener("click", () => {
                    const select = card.querySelector(".comment-select-template");
                    const val = select.value;
                    if (!val) return;
                    item.comments.push({ author: state.user.username, text: val });
                    renderExploreFeed(filter);
                });
            }
        }

        dom.exploreFeedGrid.appendChild(card);
    });
}

function renderMarketplaceItems() {
    dom.marketItemsContainer.innerHTML = "";
    // Giả lập 4 đồ thiết kế độc lạ
    const marketData = [
        { id: "m1", emoji: "🕶️", label: "Kính Đi Biển", price: 40, author: "Thỏ Ngọc" },
        { id: "m2", emoji: "🎸", label: "Đàn Ukulele", price: 60, author: "Mèo Con" },
        { id: "m3", emoji: "🧢", label: "Mũ HipHop", price: 30, author: "Cáo Nhỏ" },
        { id: "m4", emoji: "翅", label: "Cánh Dơi Đen", price: 90, author: "Rồng Bay" }
    ];

    marketData.forEach(item => {
        const card = document.createElement("div");
        card.className = "market-card";
        card.innerHTML = `
            <span class="item-emoji">${item.emoji}</span>
            <strong>${item.label}</strong>
            <p style="font-size:0.75rem; color:gray; margin:3px 0;">Thiết kế bởi: ${item.author}</p>
            <button class="btn-micro gold-glow" style="margin-top:5px; background:#ED8936; color:white;">Mua: ${item.price} Credits</button>
        `;
        
        card.querySelector("button").addEventListener("click", () => {
            if (state.user.credits < item.price) {
                showCustomAlert("🪙", "Thiếu Credits", "Bé cần tích lũy thêm Credits nhé!");
                return;
            }
            state.user.credits -= item.price;
            dom.coinCount.textContent = `🪙 ${state.user.credits} Credits`;
            showCustomAlert("🏪", "Đã Mua Thành Công!", `Món đồ thiết kế "${item.label}" của bạn ${item.author} đã được thêm vào tủ đồ Mee của bé!`);
        });
        dom.marketItemsContainer.appendChild(card);
    });
}

// 12. MODULE: PASSPORT TIMELINE (HỒ SƠ BÉ)
function setupPassportEvents() {
    document.querySelectorAll(".p-filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".p-filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderPassportTimeline(btn.dataset.pfilter);
        });
    });

    dom.btnPassportExportPdf.addEventListener("click", () => {
        if (state.user.tier !== "Premium") {
            dom.paywallModal.classList.add("active");
            return;
        }
        showCustomAlert("📧", "Xuất File Thành Công!", `Hồ sơ Passport PDF chứa toàn bộ hành trình sáng tạo của bé ${state.user.username} đã được gửi thành công tới hòm thư của phụ huynh!`);
    });
}

function initPassportPanel() {
    dom.passportUsernameView.textContent = state.user.username;
    dom.passportAgeView.textContent = `${state.user.ageGroup} Tuổi`;
    dom.passportTierView.textContent = state.user.tier.toUpperCase();
    
    updateMeePreview(dom.passportAvatarView, state.mee.type, state.mee.color);
    
    dom.passportWorksCount.textContent = state.passport.length;
    
    renderPassportTimeline("all");
}

function renderPassportTimeline(filter) {
    dom.passportTimelineList.innerHTML = "";
    
    if (state.passport.length === 0) {
        dom.passportTimelineList.innerHTML = `<p style="color:gray; text-align:center; padding:20px;">Bé chưa tạo tác phẩm nào. Hãy ghé Vương Quốc Nghệ Thuật để vẽ bức tranh đầu tiên nhé! 🎨</p>`;
        return;
    }

    state.passport.forEach(item => {
        if (filter !== "all" && item.type !== filter) return;

        const card = document.createElement("div");
        card.className = "timeline-card";
        card.innerHTML = `
            <div>
                <strong>${item.title}</strong>
                <p style="font-size:0.75rem; color:gray;">Loại: ${item.type.toUpperCase()} | Tạo ngày: ${item.createdAt}</p>
            </div>
            <div style="font-size: 0.8rem; background:white; padding:4px 8px; border-radius:6px;">Lưu trữ bảo mật ✅</div>
        `;
        dom.passportTimelineList.appendChild(card);
    });
}

function addWorkToPassport(type, title, preview) {
    const today = new Date();
    const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    state.passport.unshift({
        id: "pass_" + Date.now(),
        type: type,
        title: title,
        preview: preview,
        createdAt: dateStr
    });
}

// 13. MODULE: PARENT DASHBOARD (CỔNG PHỤ HUYNH)
function initParentPanel() {
    renderParentModerationQueue();
}

function renderParentModerationQueue() {
    dom.parentModerationList.innerHTML = "";
    
    const pendingItems = state.moderationQueue.filter(item => item.status === "pending_parent");
    
    if (pendingItems.length === 0) {
        dom.parentModerationList.innerHTML = `<p style="color:gray; padding:20px; text-align:center;">Hiện tại không có tác phẩm nào đang chờ duyệt của bé. 🍵</p>`;
        return;
    }

    pendingItems.forEach(item => {
        const div = document.createElement("div");
        div.className = "mod-item";
        div.innerHTML = `
            <strong>Bé: ${item.username}</strong>
            <div style="font-size:0.8rem; color:gray;">Loại: ${item.type.toUpperCase()} | Tiêu đề: ${item.title}</div>
            <div class="mod-preview">${item.content.substring(0, 100)}...</div>
            <div class="mod-actions">
                <button class="btn-micro btn-mod-approve" style="background:#4CAF50; color:white;">Duyệt Đăng Feed</button>
                <button class="btn-micro btn-mod-reject" style="background:#F44336; color:white;">Từ Chối</button>
            </div>
        `;

        // Event Duyệt
        div.querySelector(".btn-mod-approve").addEventListener("click", () => {
            item.status = "approved";
            // Thêm tác phẩm này vào Khám phá cộng đồng
            state.exploreFeed.unshift({
                id: item.id,
                author: item.username,
                avatar: state.mee.type,
                type: item.type,
                title: item.title,
                preview: "🎨 Tác phẩm chữ viết tuyệt đẹp của bé.",
                likes: 0,
                liked: false,
                comments: []
            });
            showCustomAlert("🛡️", "Phụ Huynh Đã Duyệt", `Đã duyệt đăng tác phẩm "${item.title}" lên Khám Phá Cộng Đồng!`);
            renderParentModerationQueue();
        });

        // Event Từ chối
        div.querySelector(".btn-mod-reject").addEventListener("click", () => {
            item.status = "rejected";
            showCustomAlert("🛡️", "Từ Chối Tác Phẩm", `Đã từ chối đăng tác phẩm của bé.`);
            renderParentModerationQueue();
        });

        dom.parentModerationList.appendChild(div);
    });
}

// ==========================================
// MEE CHARACTER CUSTOMIZER LOGIC INTEGRATION
// ==========================================
// ==========================================
// 12. MODULE: PHOTOBOOTH STUDIO (VƯƠNG QUỐC NGHỆ THUẬT)
// ==========================================

// Camera Variables
let camZoom = 1.0;
let camPanX = 0;
let camPanY = 0;
let camIsDragging = false;
let camStartX, camStartY;

// Audio context helper
let customizerAudioCtx = null;
function playCustomizerSound(type) {
    try {
        if (!customizerAudioCtx) {
            customizerAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (customizerAudioCtx.state === 'suspended') {
            customizerAudioCtx.resume();
        }
        const now = customizerAudioCtx.currentTime;
        if (type === 'click') {
            const osc = customizerAudioCtx.createOscillator();
            const gain = customizerAudioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            osc.connect(gain);
            gain.connect(customizerAudioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.08);
        } else if (type === 'select') {
            const osc = customizerAudioCtx.createOscillator();
            const gain = customizerAudioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(350, now);
            osc.frequency.exponentialRampToValueAtTime(550, now + 0.12);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
            osc.connect(gain);
            gain.connect(customizerAudioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.12);
        }
    } catch (e) {
        console.log("Audio Context blocked: ", e);
    }
}

// Color Lerp Helper
function customizerLerpColor(color1, color2, factor) {
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);
    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);
    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Darken HSL Shadow
function customizerAutoShadow(hexColor) {
    let r = parseInt(hexColor.substring(1, 3), 16) / 255;
    let g = parseInt(hexColor.substring(3, 5), 16) / 255;
    let b = parseInt(hexColor.substring(5, 7), 16) / 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    l = Math.max(0.08, l - 0.12);
    s = Math.min(1.0, s + 0.05);
    let rOut, gOut, bOut;
    if (s === 0) {
        rOut = gOut = bOut = l;
    } else {
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }
        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        rOut = hue2rgb(p, q, h + 1/3);
        gOut = hue2rgb(p, q, h);
        bOut = hue2rgb(p, q, h - 1/3);
    }
    const rHex = Math.round(rOut * 255).toString(16).padStart(2, '0');
    const gHex = Math.round(gOut * 255).toString(16).padStart(2, '0');
    const bHex = Math.round(bOut * 255).toString(16).padStart(2, '0');
    return `#${rHex}${gHex}${bHex}`;
}

// Render dynamic Mee SVG in Photobooth
function updateCustomizerCharacter() {
    if (!dom.characterWrapper) return;
    
    // Luôn lấy nhân vật Mee hiện tại từ state.mee
    dom.characterWrapper.innerHTML = renderHumanSVG(state.mee);
    
    const activeSkinColor = state.mee.customMode ? state.mee.customSkin : (PALETTE_DATA[state.mee.skinToneIndex - 1] ? PALETTE_DATA[state.mee.skinToneIndex - 1].skin : "#ffe7e6");
    document.documentElement.style.setProperty('--skin-glow-color', activeSkinColor + "25");
}

function updateCustomizerUI() {
    updateCustomizerCharacter();
    applyCustomizerCameraTransform();
}

// Camera pan & zoom logic
function applyCustomizerCameraTransform() {
    if (dom.photoMeeLayer) {
        dom.photoMeeLayer.style.transform = `translate(${camPanX}px, ${camPanY}px) scale(${camZoom})`;
    }
}

function resetCustomizerCamera() {
    camZoom = 1.0;
    camPanX = 0;
    camPanY = 0;
    applyCustomizerCameraTransform();
}

// Main initialisation function for Photobooth
function initMeeCustomizer() {
    // 1. Gắn sự kiện chọn khung ảnh
    if (dom.photoFrameSelector) {
        dom.photoFrameSelector.querySelectorAll("button").forEach(btn => {
            btn.addEventListener("click", () => {
                dom.photoFrameSelector.querySelectorAll("button").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                
                const frameType = btn.dataset.frame;
                if (dom.photoFramePreview) {
                    dom.photoFramePreview.classList.remove("frame-star", "frame-heart", "frame-retro", "frame-neon");
                    dom.photoFramePreview.classList.add(`frame-${frameType}`);
                }
                
                playCustomizerSound('select');
            });
        });
    }

    // 2. Gắn sự kiện AI sinh ảnh nền
    if (dom.btnPhotoAiBg) {
        dom.btnPhotoAiBg.addEventListener("click", () => {
            if (state.user.tier !== "Premium") {
                dom.paywallModal.classList.add("active");
                return;
            }
            const prompt = dom.photoAiBgPrompt.value.trim();
            if (!prompt) {
                showCustomAlert("🪄", "AI Ghép Nền", "Bé hãy nhập mô tả hình nền muốn đổi nhé!");
                return;
            }
            
            dom.btnPhotoAiBg.disabled = true;
            dom.btnPhotoAiBg.innerText = "AI đang tạo nền... 🪄";
            
            setTimeout(() => {
                dom.btnPhotoAiBg.disabled = false;
                dom.btnPhotoAiBg.innerText = "Đổi Nền Bằng AI 🪄";
                
                if (dom.photoBgLayer) {
                    dom.photoBgLayer.innerHTML = "";
                    dom.photoBgLayer.style.background = `linear-gradient(135deg, #4f46e5, #ec4899)`;
                    
                    const bgLabel = document.createElement("div");
                    bgLabel.style.color = "white";
                    bgLabel.style.fontSize = "3rem";
                    bgLabel.style.textAlign = "center";
                    bgLabel.style.lineHeight = "380px";
                    
                    let bgEmoji = "🏞️";
                    if (prompt.toLowerCase().includes("băng") || prompt.toLowerCase().includes("tuyết")) bgEmoji = "❄️🏰";
                    else if (prompt.toLowerCase().includes("biển") || prompt.toLowerCase().includes("cát")) bgEmoji = "🏖️🌅";
                    else if (prompt.toLowerCase().includes("vũ trụ") || prompt.toLowerCase().includes("sao")) bgEmoji = "🚀🌌";
                    else if (prompt.toLowerCase().includes("rừng") || prompt.toLowerCase().includes("cây")) bgEmoji = "🌲🍄";
                    else if (prompt.toLowerCase().includes("kẹo")) bgEmoji = "🍭🍬";
                    
                    bgLabel.innerText = bgEmoji;
                    dom.photoBgLayer.appendChild(bgLabel);
                }
                showCustomizerToast("Đã đổi hình nền bằng AI!");
            }, 1200);
        });
    }

    // 3. Sự kiện điều khiển camera
    if (dom.btnCameraZoomIn) {
        dom.btnCameraZoomIn.addEventListener("click", () => {
            camZoom = Math.min(2.5, camZoom + 0.15);
            applyCustomizerCameraTransform();
        });
    }
    if (dom.btnCameraZoomOut) {
        dom.btnCameraZoomOut.addEventListener("click", () => {
            camZoom = Math.max(0.6, camZoom - 0.15);
            applyCustomizerCameraTransform();
        });
    }
    if (dom.btnCameraReset) {
        dom.btnCameraReset.addEventListener("click", () => {
            resetCustomizerCamera();
        });
    }

    // 4. Sự kiện kéo thả pan viewport
    if (dom.viewportCanvas) {
        dom.viewportCanvas.addEventListener("mousedown", (e) => {
            camIsDragging = true;
            camStartX = e.clientX - camPanX;
            camStartY = e.clientY - camPanY;
            if (dom.photoMeeLayer) dom.photoMeeLayer.style.cursor = "grabbing";
        });
        window.addEventListener("mousemove", (e) => {
            if (!camIsDragging) return;
            camPanX = e.clientX - camStartX;
            camPanY = e.clientY - camStartY;
            applyCustomizerCameraTransform();
        });
        window.addEventListener("mouseup", () => {
            camIsDragging = false;
            if (dom.photoMeeLayer) dom.photoMeeLayer.style.cursor = "grab";
        });
    }

    // 5. Tải ảnh SVG
    if (dom.btnExportSvg) {
        dom.btnExportSvg.addEventListener("click", () => {
            const svgEl = dom.characterWrapper.querySelector("svg");
            if (svgEl) {
                const serializer = new XMLSerializer();
                const svgStr = serializer.serializeToString(svgEl);
                const blob = new Blob([svgStr], {type: "image/svg+xml"});
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `mee_character_${state.mee.gender}.svg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showCustomizerToast("Đã tải tệp SVG!");
            }
        });
    }

    // 6. Tải ảnh PNG
    if (dom.btnExportPng) {
        dom.btnExportPng.addEventListener("click", () => {
            const svgEl = dom.characterWrapper.querySelector("svg");
            if (svgEl) {
                const serializer = new XMLSerializer();
                const svgStr = serializer.serializeToString(svgEl);
                const img = new Image();
                img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)));
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = 500;
                    canvas.height = 1200;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, 500, 1200);
                    
                    const url = canvas.toDataURL("image/png");
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `mee_character_${state.mee.gender}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    showCustomizerToast("Đã tải tệp PNG!");
                };
            }
        });
    }

    // 7. Chụp và lưu ảnh vào Passport
    if (dom.btnSavePhotoWork) {
        dom.btnSavePhotoWork.addEventListener("click", () => {
            if (state.user.tier === "Guest") {
                dom.signupModal.classList.add("active");
                return;
            }

            const frameClone = dom.photoFramePreview.cloneNode(true);
            const canvasInClone = frameClone.querySelector("#viewportCanvas");
            if (canvasInClone) canvasInClone.remove();
            
            const htmlStr = frameClone.outerHTML;
            addWorkToPassport("photobooth", `Ảnh Chụp Mee: ${state.user.username}`, htmlStr);
            showCustomAlert("📸", "Chụp & Lưu Thành Công!", "Tác phẩm ảnh chụp Mee của bé đã được ghi nhận trong Passport!");
        });
    }

    updateCustomizerUI();
    resetCustomizerCamera();
}

function showCustomizerToast(msg) {
    const toast = document.getElementById("toast");
    if (toast) {
        const content = toast.querySelector("#toastContent");
        if (content) content.innerText = msg;
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }
}
