export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'student' | 'teacher';
    plan: 'free' | 'premium' | 'school';
}

export interface LoginResponse {
    message: string;
    user: User;
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation?: string;
}

export interface Material {
    id: string;
    title: string;
    subject: 'physics' | 'chemistry' | 'biology';
    type: '3d-model' | 'infographic';
    description: string;
    thumbnail: string;
    tags: string[];
    grade: number;
    file_url?: string;
    createdAt?: string; // ISO String timestamp for relative time
    // New fields from LearningCell for detailed info panel
    subtitle?: string;
    category?: string;
    size?: string;
    location?: string;
    visibleInLM?: string;
    features?: { name: string; detail: string }[];
    funFact?: string;
    whereItOccurs?: {
        text: string;
        habitat: string;
    };
    relatedMaterials?: string[];
    quiz?: QuizQuestion[];
    requiredPlan?: string | null;
    source?: string;
}

export interface ModelInput {
    title: string;
    description: string;
    subject: string;
    grade: number;
    tags: string[] | string;
    file_url: string;
    thumbnail: string | null;
    relatedMaterials?: string[];
    source?: string;
    quiz?: QuizQuestion[];
}

export const materials: Material[] = [
    {
        id: "plant-cell",
        title: "Tế bào thực vật",
        subtitle: "Tế bào nhân thực · Sinh vật tự dưỡng",
        subject: "biology",
        type: "3d-model",
        category: "Tế bào nhân thực",
        description: "Tế bào thực vật là đơn vị cấu trúc cơ bản cấu tạo nên cơ thể thực vật. Khác với tế bào động vật, chúng sở hữu vách tế bào cứng cáp, lục lạp để quang hợp và không bào trung tâm lớn để lưu trữ nước và dinh dưỡng, giúp duy trì hình dạng và cung cấp năng lượng cho hệ sinh thái.",
        size: "10 – 100 micromét",
        location: "Rễ, thân, lá, hoa, quả của thực vật",
        visibleInLM: "Có thể quan sát dưới kính hiển vi quang học.",
        funFact: "Một chiếc lá trưởng thành có thể chứa hàng triệu lục lạp, giúp cho mỗi hơi thở của Trái Đất luôn trong lành.",
        whereItOccurs: {
            text: "Từ rêu ẩm ướt đến những cây cổ thụ cao chót vót, tế bào thực vật âm thầm xây dựng nên màu xanh của Trái Đất.",
            habitat: "Thực vật trên cạn · Tảo dưới nước · Dương xỉ"
        },
        features: [
            { name: "Vách tế bào", detail: "Cấu tạo từ cellulose, cung cấp giá đỡ hình dạng và bảo vệ cơ học." },
            { name: "Lục lạp", detail: "Nơi diễn ra quang hợp, chuyển hóa quang năng thành chất hữu cơ." },
            { name: "Không bào lớn", detail: "Lưu trữ nước, dinh dưỡng, sắc tố và duy trì áp suất trương nở." },
            { name: "Nhân tế bào", detail: "Lưu trữ thông tin di truyền, điều hòa trao đổi chất và phân chia." }
        ],
        thumbnail: "/thumbnails/images/plant-cell.jpg",
        tags: ["Sinh học", "Tế bào", "Thực vật"],
        grade: 10,
        file_url: "/models/plant-cell.glb",
        createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        requiredPlan: null,
        source: "3D Science Lab",
        quiz: [
            {
                question: "Thành phần nào sau đây chỉ có ở tế bào thực vật mà không có ở tế bào động vật?",
                options: ["Ti thể", "Lục lạp", "Nhân tế bào", "Lưới nội chất"],
                correctAnswerIndex: 1,
                explanation: "Lục lạp là bào quan chứa diệp lục, có chức năng quang hợp, chỉ có ở thực vật."
            },
            {
                question: "Vách tế bào thực vật cấu tạo chủ yếu từ gì?",
                options: ["Protein", "Lipid", "Cellulose", "Chitin"],
                correctAnswerIndex: 2,
                explanation: "Vách tế bào thực vật được cấu tạo chủ yếu từ các bó vi sợi cellulose."
            }
        ]
    },
    {
        id: "animal-cell",
        title: "Tế bào động vật",
        subtitle: "Tế bào nhân thực · Sinh vật dị dưỡng",
        subject: "biology",
        type: "3d-model",
        category: "Tế bào nhân thực",
        description: "Tế bào động vật không có vách tế bào và lục lạp, chúng dựa vào màng tế bào linh hoạt và sự phối hợp giữa các bào quan phong phú để hoàn thành việc trao đổi chất và di chuyển. Từ các tế bào cơ tim đang đập đến tế bào thần kinh đệm trong vỏ não, chúng định hình cơ thể sống phức tạp với sự đa dạng đáng kinh ngạc.",
        size: "10 – 30 micromét",
        location: "Tất cả các mô và cơ quan của động vật",
        visibleInLM: "Có thể quan sát dưới kính hiển vi quang học.",
        funFact: "Một cơ thể người trưởng thành có khoảng 37 nghìn tỷ tế bào - chúng phối hợp với nhau từng giây để tạo nên \"bạn\".",
        whereItOccurs: {
            text: "Từ động vật nguyên sinh đơn bào đến cá voi khổng lồ, toàn bộ cơ thể động vật đều được cấu tạo từ các tế bào động vật.",
            habitat: "Động vật có vú · Cá · Côn trùng · Chim"
        },
        features: [
            { name: "Màng tế bào", detail: "Lớp phospholipid kép, kiểm soát chọn lọc chất đi vào và ra tế bào." },
            { name: "Ti thể", detail: "Nhà máy tạo ra ATP, cung cấp năng lượng hoạt động cho toàn tế bào." },
            { name: "Lưới nội chất & Golgi", detail: "Hệ thống tổng hợp, đóng gói và vận chuyển protein cơ thể." },
            { name: "Lysosome", detail: "Trạm tái chế phân hủy các chất hữu cơ và dọn dẹp tế bào." }
        ],
        thumbnail: "/thumbnails/images/animal-cell.jpg",
        tags: ["Sinh học", "Tế bào", "Động vật"],
        grade: 10,
        file_url: "/models/animal-cell.glb",
        createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        requiredPlan: null,
        quiz: [
            {
                question: "Bào quan nào được mệnh danh là 'nhà máy năng lượng' của tế bào?",
                options: ["Ti thể", "Bộ máy Golgi", "Lysosome", "Lưới nội chất"],
                correctAnswerIndex: 0,
                explanation: "Ti thể chịu trách nhiệm tổng hợp ATP cung cấp năng lượng cho tế bào."
            }
        ]
    },
    {
        id: "white-blood-cell",
        title: "Tế bào bạch cầu",
        subtitle: "Tế bào miễn dịch · Vệ sĩ của cơ thể",
        subject: "biology",
        type: "3d-model",
        category: "Tế bào miễn dịch",
        description: "Bạch cầu là những thành viên nòng cốt của hệ thống miễn dịch, tuần tra trong máu và bạch huyết. Chúng có khả năng nhận diện các tác nhân gây bệnh xâm nhập, bảo vệ sự ổn định của cơ thể bằng cách thực bào, giải phóng cytokine hoặc tiêu diệt chuẩn xác.",
        size: "6 – 20 micromét",
        location: "Máu, hệ bạch huyết, tủy xương",
        visibleInLM: "Có thể quan sát dưới kính hiển vi quang học.",
        funFact: "Một người trưởng thành khỏe mạnh tạo ra khoảng 100 tỷ bạch cầu mới mỗi ngày, gần gấp 12 lần tổng dân số Trái Đất.",
        whereItOccurs: {
            text: "Trong mỗi giọt máu đều có hàng triệu bạch cầu di chuyển, tuần tra cơ thể bạn 24/7.",
            habitat: "Máu · Tủy xương · Lách · Hạch bạch huyết"
        },
        features: [
            { name: "Nhân tế bào không đều", detail: "Thay đổi linh hoạt hình dạng (phân thùy hoặc móng ngựa)." },
            { name: "Chân giả di động", detail: "Biến dạng màng linh hoạt để xuyên mạch và bắt mầm bệnh." },
            { name: "Không bào thực bào", detail: "Bao bọc và tiêu hóa vi khuẩn, virus bằng enzym." },
            { name: "Thể hạt kháng khuẩn", detail: "Phóng thích kháng thể tiêu diệt ổ viêm nhiễm." }
        ],
        thumbnail: "/thumbnails/images/white-blood-cell.jpg",
        tags: ["Sinh học", "Tế bào", "Bạch cầu", "Miễn dịch"],
        grade: 11,
        file_url: "/models/white-blood-cell.glb",
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
        id: "neuron",
        title: "Tế bào thần kinh",
        subtitle: "Tế bào hưng phấn · Kẻ truyền tin",
        subject: "biology",
        type: "3d-model",
        category: "Tế bào thần kinh",
        description: "Neuron là đơn vị cơ bản để xử lý thông tin. Các sợi nhánh nhô ra giống như ăng-ten để nhận tín hiệu, trong khi các sợi trục dài truyền các xung điện đi xa. Chúng dệt nên nhận thức, trí nhớ và tư duy bằng ngôn ngữ hóa học và điện.",
        size: "Thân tế bào 4 – 100 micromét, sợi trục có thể dài tới 1 mét",
        location: "Não, tủy sống, hệ thần kinh ngoại biên",
        visibleInLM: "Có thể quan sát dưới kính hiển vi quang học (cần nhuộm màu).",
        funFact: "Não người có khoảng 86 tỷ neuron, số lượng liên kết giữa chúng vượt quá tổng số ngôi sao trong Dải Ngân hà.",
        whereItOccurs: {
            text: "Từ mắt kép của loài bướm đến vỏ não của con người, các neuron cho phép động vật có khả năng cảm giác và tư duy.",
            habitat: "Hệ thần kinh trung ương · Thần kinh ngoại biên · Giác quan"
        },
        features: [
            { name: "Thân tế bào (Soma)", detail: "Trung tâm chỉ huy tích hợp mọi tín hiệu kích thích điện học." },
            { name: "Sợi nhánh (Dendrite)", detail: "Tiếp nhận luồng xung tín hiệu thông tin cực lớn từ xung quanh." },
            { name: "Sợi trục (Axon)", detail: "Dẫn truyền xung điện thần kinh đi xa đến các tế quan khác." },
            { name: "Khớp thần kinh (Synapse)", detail: "Cầu nối giải phóng hóa chất chuyển giao thông tin sang tế bào kế tiếp." }
        ],
        thumbnail: "/thumbnails/images/neuron.jpg",
        tags: ["Sinh học", "Tế bào", "Thần kinh"],
        grade: 11,
        file_url: "/models/neuron.glb",
        createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    },
    {
        id: "dna",
        title: "Chuỗi xoắn kép DNA",
        subtitle: "Các phân tử di truyền: Bản thiết kế của sự sống",
        subject: "biology",
        type: "3d-model",
        category: "các đại phân tử sinh học",
        description: "ADN bao gồm hai chuỗi nucleotide bổ sung cho nhau, xoắn lại thành cấu trúc xoắn kép thanh lịch. Nó ghi lại các chỉ dẫn của sự sống dưới dạng bốn chữ cái A, T, G và C, cho phép thông tin được sao chép, biểu hiện và tiến hóa qua nhiều thế hệ trong hàng tỷ năm.",
        size: "Đường kính xấp xỉ 2 nanomet, chiều dài thay đổi tùy thuộc vào loài.",
        location: "Nhân tế bào, ty thể, lục lạp",
        visibleInLM: "Có thể quan sát được dưới kính hiển vi quang học.", // will show correction pill "Chỉ kính hiển vi điện tử"
        funFact: "Nếu kéo thẳng toàn bộ DNA trong một tế bào, nó sẽ dài khoảng 2 mét; DNA của toàn cơ thể nối lại có thể đi và về giữa Mặt Trời và Trái Đất hàng trăm lần.",
        whereItOccurs: {
            text: "Từ các vi khuẩn cổ xưa nhất đến từng tế bào trên cơ thể bạn, DNA lặng lẽ bảo vệ mật mã của sự sống.",
            habitat: "Vi khuẩn · Cổ khuẩn · Sinh vật nhân thực · Virus (một số)"
        },
        features: [
            { name: "Khung xương xoắn kép", detail: "Nó được cấu tạo từ các liên kết xen kẽ giữa phosphate và deoxyribose." },
            { name: "cặp bazơ", detail: "A kết hợp bổ sung với T, và G kết hợp bổ sung với C thông qua liên kết hydro." },
            { name: "Mương lớn và mương nhỏ", detail: "Các cấu trúc quan trọng cho sự nhận diện DNA của protein." },
            { name: "Sao chép bán bảo quản", detail: "Mỗi lần sao chép đều giữ lại một sợi mẹ làm khuôn mẫu." }
        ],
        thumbnail: "/thumbnails/images/dna.jpg",
        tags: ["Sinh học", "DNA", "Di truyền"],
        grade: 12,
        file_url: "/models/dna.glb",
        createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
    },
    {
        id: "demo-3d-1",
        title: "Cấu trúc phân tử H2O (3D)",
        subject: "chemistry",
        type: "3d-model",
        description: "Mô hình tương tác trực quan về cấu trúc liên kết cộng hóa trị giữa Oxy và Hydro trong phân tử nước. Bạn có thể xoay và zoom để xem góc liên kết 104.5 độ.",
        thumbnail: "https://images.unsplash.com/photo-1617155093730-a8bf47be792d?q=80&w=600&auto=format&fit=crop",
        tags: ["Hóa học", "Phân tử", "Nước"],
        grade: 10,
        file_url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
    },
    {
        id: "demo-info-1",
        title: "Sơ đồ Hệ Mặt Trời (Infographic)",
        subject: "physics",
        type: "infographic",
        description: "Bản đồ chi tiết các hành tinh trong Hệ Mặt Trời với các thông số vật lý (khối lượng, quỹ đạo, nhiệt độ). Phóng to để đọc các văn bản mô tả kỹ thuật không bị mờ.",
        thumbnail: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=600&auto=format&fit=crop",
        tags: ["Vật lý", "Thiên văn", "Vũ trụ"],
        grade: 12,
        file_url: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Solar_sys8.jpg",
        createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
    }
];

export const getSubjectName = (subject: Material['subject']): string => {
    const names: Record<Material['subject'], string> = {
        physics: 'Vật lý',
        chemistry: 'Hóa học',
        biology: 'Sinh học',
    };
    return names[subject];
};

export const getTypeName = (type: Material['type']): string => {
    const names: Record<Material['type'], string> = {
        '3d-model': 'Mô hình 3D',
        'infographic': 'Infographic',
    };
    return names[type];
};

export const formatRelativeTime = (dateString?: string): string => {
    if (!dateString) return 'vừa xong';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return 'vừa xong';
        }

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} phút trước`;
        }

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} giờ trước`;
        }

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) {
            return `${diffInDays} ngày trước`;
        }

        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) {
            return `${diffInMonths} tháng trước`;
        }

        const diffInYears = Math.floor(diffInMonths / 12);
        return `${diffInYears} năm trước`;
    } catch (e) {
        return 'vừa xong';
    }
};
