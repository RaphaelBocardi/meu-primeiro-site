// Product Database
const products = [
    // Camisas de Times - Champions League
    {
        id: 1,
        name: "Camisa Real Madrid Home 24/25",
        category: "camisas",
        price: 349.90,
        description: "Camisa oficial do Real Madrid - Temporada 24/25 - Champions League - Adidas",
        image: "https://static.netshoes.com.br/produtos/camisa-real-madrid-home-adidas-2425-sn-jogador-masculina/14/FB9-8514-014/FB9-8514-014_zoom1.jpg?ts=1760452872&ims=1088x",
        icon: "👕"
    },
    {
        id: 31,
        name: "Jaqueta Esportiva Outdoor Premium",
        category: "jaquetas",
        price: 399.90,
        description: "Jaqueta impermeável com capuz - Ideal para aventuras e esportes outdoor",
        image: "images/jaquetas/9311562994_1506982484.jpg",
        icon: "🧥",
        variants: [
            {
                color: "Preto/Cinza",
                colorCode: "#2c2c2c",
                image: "images/jaquetas/9311562994_1506982484.jpg"
            },
            {
                color: "Roxo",
                colorCode: "#6b2d91",
                image: "images/jaquetas/9336199651_1506982484.jpg"
            },
            {
                color: "Laranja/Cinza",
                colorCode: "#ff6b35",
                image: "images/jaquetas/9336205427_1506982484.jpg"
            },
            {
                color: "Azul Claro",
                colorCode: "#5dade2",
                image: "images/jaquetas/9336217190_1506982484.jpg"
            },
            {
                color: "Rosa/Roxo",
                colorCode: "#e91e63",
                image: "images/jaquetas/9355343757_1506982484.jpg"
            },
            {
                color: "Azul Royal",
                colorCode: "#1e3a8a",
                image: "images/jaquetas/9355370005_1506982484.jpg"
            }
        ]
    },
    {
        id: 2,
        name: "Camisa Manchester City Home 24/25",
        category: "camisas",
        price: 349.90,
        description: "Camisa oficial do Manchester City - Temporada 24/25 - Puma",
        image: "https://tse1.mm.bing.net/th/id/OIP.WGMnhYkH5SglPzInBKdzYQHaHa?cb=12&w=700&h=700&rs=1&pid=ImgDetMain&o=7&rm=3",
        icon: "👕"
    },
    {
        id: 3,
        name: "Camisa Bayern München Home 24/25",
        category: "camisas",
        price: 349.90,
        description: "Camisa oficial do Bayern de Munique - Temporada 24/25 - Adidas",
        image: "https://static.netshoes.com.br/produtos/camisa-bayern-de-munique-adidas-home-2425-sn-torcedor-masculina/16/FB9-8501-016/FB9-8501-016_zoom1.jpg?ts=1760844397&ims=1088x",
        icon: "👕"
    },
    {
        id: 4,
        name: "Camisa PSG Home 24/25",
        category: "camisas",
        price: 349.90,
        description: "Camisa oficial do Paris Saint-Germain - Temporada 24/25 - Nike",
        image: "https://bryanstore.com.br/cdn/shop/files/psg-nike-home-stadium-shirt-2024-25_ss5_p-200827669_pv-2_u-zsehjrrtq4aszhqrqd0f_v-gfgancmusfnavrx7ghgz.jpg?v=1756841685&width=1800",
        icon: "👕"
    },
    {
        id: 5,
        name: "Camisa Liverpool Home 24/25",
        category: "camisas",
        price: 349.90,
        description: "Camisa oficial do Liverpool FC - Temporada 24/25 - Nike",
        image: "https://dcdn-us.mitiendanube.com/stores/005/457/244/products/camisa-liverpool-nike-2024-jogador-af48f57e214c0b701f17341202499147-1024-1024.png",
        icon: "👕"
    },
    {
        id: 6,
        name: "Camisa Barcelona Home 24/25",
        category: "camisas",
        price: 349.90,
        description: "Camisa oficial do FC Barcelona - Temporada 24/25 - Nike",
        image: "https://cdn.grupoelcorteingles.es/SGFM/dctm/MEDIA03/202407/19/00199455130213____1__1200x1200.jpg",
        icon: "👕"
    },
    {
        id: 7,
        name: "Camisa Juventus Home 24/25",
        category: "camisas",
        price: 349.90,
        description: "Camisa oficial da Juventus - Temporada 24/25 - Adidas",
        image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgUe8zH5EdCkoMQexVM7Q-lx5fVepA8Bqn18Wwsd9HbPskqmbaW2ZncR6Nhyphenhyphen-or1GO6s8xG5lmm73iZlhoXyi_XDfznqSquzBN5Sxo6rNkbimbBIYbbQNmbh_77LYoHdxcieSqzYWrqP75aFqbpYKP68bpTU-YbUs0IKF7cq0AQyEHNRvCoPNzeOBxuPy_p/s1000/juventus-24-25-home-kit%20(1).jpg",
        icon: "👕"
    },
    {
        id: 8,
        name: "Camisa Inter de Milão Home 24/25",
        category: "camisas",
        price: 349.90,
        description: "Camisa oficial da Inter de Milão - Temporada 24/25 - Nike",
        image: "https://www.eurosportsoccer.com/cdn/shop/files/nike-inter-home-jersey-2024-25_2_1200x1200.png?v=1732998167",
        icon: "👕"
    },
    {
        id: 9,
        name: "Camisa Chelsea Home 24/25",
        category: "camisas",
        price: 349.90,
        description: "Camisa oficial do Chelsea FC - Temporada 24/25 - Nike",
        image: "https://tamam-mauritius.com/cdn/shop/files/chelsea-nike-home-stadium-shirt-2024-25_ss5_p-200851164_pv-2_u-canixtzkdetrqr6ldmyh_v-urvlapfisvffp6cea3w2.jpg?v=1721728017&width=1445",
        icon: "👕"
    },
    {
        id: 10,
        name: "Camisa Borussia Dortmund Home 24/25",
        category: "camisas",
        price: 349.90,
        description: "Camisa oficial do Borussia Dortmund - Temporada 24/25 - Puma",
        image: "https://www.footcenter.fr/media/catalog/product/cache/82d5e29288185f6fc64d760e116074a6/m/a/maillot-dortmund-domicile-2023-2024-junior-taill-0.jpg",
        icon: "👕"
    },
    
    // Tênis Esportivos
    {
        id: 11,
        name: "Nike Air Max 270 React",
        category: "tenis",
        price: 799.90,
        description: "Tênis Nike com Air Max 270 - Máximo conforto e estilo urbano",
        image: "",
        icon: "👟"
    },
    {
        id: 12,
        name: "Adidas Ultraboost 22",
        category: "tenis",
        price: 999.90,
        description: "Adidas Ultraboost - Tecnologia Boost para corrida de alta performance",
        image: "",
        icon: "👟"
    },
    {
        id: 13,
        name: "Nike React Infinity Run",
        category: "tenis",
        price: 699.90,
        description: "Nike React - Estabilidade e amortecimento para longas corridas",
        image: "",
        icon: "👟"
    },
    {
        id: 14,
        name: "Adidas NMD R1 V2",
        category: "tenis",
        price: 649.90,
        description: "Adidas NMD - Design futurista com tecnologia Boost",
        image: "",
        icon: "👟"
    },
    {
        id: 15,
        name: "Nike ZoomX Vaporfly NEXT%",
        category: "tenis",
        price: 1499.90,
        description: "Nike ZoomX - Tênis de corrida profissional para quebrar recordes",
        image: "",
        icon: "👟"
    },
    {
        id: 16,
        name: "Adidas Yeezy Boost 350 V2",
        category: "tenis",
        price: 1299.90,
        description: "Adidas Yeezy - Estilo premium e exclusivo com Boost",
        image: "",
        icon: "👟"
    },
    {
        id: 17,
        name: "Nike Air Jordan 1 Mid",
        category: "tenis",
        price: 899.90,
        description: "Nike Air Jordan 1 - Ícone do basquete com estilo atemporal",
        image: "",
        icon: "👟"
    },
    {
        id: 18,
        name: "Adidas Superstar Classic",
        category: "tenis",
        price: 499.90,
        description: "Adidas Superstar - Clássico urbano com as 3 listras",
        image: "",
        icon: "👟"
    },
    {
        id: 19,
        name: "Nike Pegasus 40",
        category: "tenis",
        price: 749.90,
        description: "Nike Pegasus - Versatilidade para treinos diários",
        image: "",
        icon: "👟"
    },
    {
        id: 20,
        name: "Adidas Samba OG",
        category: "tenis",
        price: 599.90,
        description: "Adidas Samba - Clássico do futebol adaptado para as ruas",
        image: "",
        icon: "👟"
    },
    
    // Chuteiras Profissionais
    {
        id: 21,
        name: "Nike Mercurial Superfly 9 Elite",
        category: "chuteiras",
        price: 1499.90,
        description: "Nike Mercurial Elite - Chuteira de velocidade usada por CR7",
        image: "",
        icon: "⚽"
    },
    {
        id: 22,
        name: "Adidas Predator Accuracy.1 FG",
        category: "chuteiras",
        price: 1399.90,
        description: "Adidas Predator - Controle total e precisão nos chutes",
        image: "",
        icon: "⚽"
    },
    {
        id: 23,
        name: "Nike Phantom GX Elite FG",
        category: "chuteiras",
        price: 1299.90,
        description: "Nike Phantom - Precisão e controle em passes e finalizações",
        image: "",
        icon: "⚽"
    },
    {
        id: 24,
        name: "Adidas Copa Mundial FG",
        category: "chuteiras",
        price: 899.90,
        description: "Adidas Copa Mundial - Clássico atemporal em couro canguru",
        image: "",
        icon: "⚽"
    },
    {
        id: 25,
        name: "Nike Tiempo Legend 10 Elite",
        category: "chuteiras",
        price: 1199.90,
        description: "Nike Tiempo - Couro premium para toque de bola perfeito",
        image: "",
        icon: "⚽"
    },
    {
        id: 26,
        name: "Adidas X Crazyfast Elite FG",
        category: "chuteiras",
        price: 1599.90,
        description: "Adidas X - Ultra-leve e veloz para explosão máxima",
        image: "",
        icon: "⚽"
    },
    {
        id: 27,
        name: "Nike Mercurial Vapor 15 Elite",
        category: "chuteiras",
        price: 1399.90,
        description: "Nike Vapor - Design aerodinâmico para máxima velocidade",
        image: "",
        icon: "⚽"
    },
    {
        id: 28,
        name: "Adidas Predator Edge+ FG",
        category: "chuteiras",
        price: 1199.90,
        description: "Adidas Predator Edge - Controle e efeito nos chutes",
        image: "",
        icon: "⚽"
    },
    {
        id: 29,
        name: "Nike Phantom GT2 Elite FG",
        category: "chuteiras",
        price: 1099.90,
        description: "Nike Phantom GT2 - Ajuste personalizado e controle total",
        image: "",
        icon: "⚽"
    },
    {
        id: 30,
        name: "Adidas Copa Sense+ FG",
        category: "chuteiras",
        price: 1299.90,
        description: "Adidas Copa Sense - Sensibilidade e conforto premium",
        image: "",
        icon: "⚽"
    }
];
