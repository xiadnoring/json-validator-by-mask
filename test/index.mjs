import JsonMask from '../dist/index.js';

const jm = new JsonMask.JsonMask (JsonMask.array({
    "_id": "{string(=24)}",
    "index": "{number(>=0)}",
    "guid": "{string(=36)}",
    "isActive": "{bool}",
    "balance": "{string}",
    "picture": "{string}",
    "age": "{number(>=0 <=140)}",
    "eyeColor": "{string}",
    "name": "{string(<=100)}",
    "gender": `{string("male")|string("female")}`,
    "company": "{string(<=100)}",
    "email": JsonMask.regex ("{string(<=100)}", /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i),
    "phone": "{string()}",
    "address": "{string}",
    "about": "{string(<=500)}",
    "registered": "{string}",
    "latitude": "{number}",
    "longitude": "{number}",
    "tags": "{string(<=20)[<=50]}",
    "friends": JsonMask.array ({
        "id": "{number(>=0)}",
        "name": "{string(<=100)}"
    }),
    "greeting": "{string}",
    "favoriteFruit": "{string}"
}));

console.log ('Large Test:', jm.valid ([
    {
      "_id": "6734d9c43eb3a9f313ec2c2b",
      "index": 0,
      "guid": "77492539-a828-431f-b13c-31715831bfa7",
      "isActive": false,
      "balance": "$2,107.95",
      "picture": "http://placehold.it/32x32",
      "age": 36,
      "eyeColor": "brown",
      "name": "Cole Patel",
      "gender": "male",
      "company": "SENTIA",
      "email": "colepatel@sentia.com",
      "phone": "+1 (860) 430-2331",
      "address": "994 Rutherford Place, Hebron, Kansas, 8320",
      "about": "Nostrud consectetur dolor cupidatat eiusmod sunt commodo qui aliquip reprehenderit officia tempor in laborum. Sunt fugiat do aliqua labore nulla laboris dolore nostrud nostrud dolore exercitation. Ea id nulla eiusmod ipsum mollit ullamco dolore sit anim ullamco sint ex esse.\r\n",
      "registered": "2017-07-15T11:39:39 -05:00",
      "latitude": -31.392284,
      "longitude": -24.463402,
      "tags": [
        "do",
        "irure",
        "adipisicing",
        "sint",
        "pariatur",
        "laborum",
        "cupidatat"
      ],
      "friends": [
        {
          "id": 0,
          "name": "Green Robinson"
        },
        {
          "id": 1,
          "name": "Sophia Armstrong"
        },
        {
          "id": 2,
          "name": "Hill Stafford"
        }
      ],
      "greeting": "Hello, Cole Patel! You have 4 unread messages.",
      "favoriteFruit": "strawberry"
    },
    {
      "_id": "6734d9c44127b2e55beebc3e",
      "index": 1,
      "guid": "9a591b6f-4847-4ec3-ab24-cf6ec995d2ae",
      "isActive": true,
      "balance": "$1,048.47",
      "picture": "http://placehold.it/32x32",
      "age": 28,
      "eyeColor": "blue",
      "name": "Malinda Rodriguez",
      "gender": "female",
      "company": "FUTURIZE",
      "email": "malindarodriguez@futurize.com",
      "phone": "+1 (806) 535-3094",
      "address": "599 Railroad Avenue, Sena, Nevada, 5900",
      "about": "Ea velit dolore eu sit consequat adipisicing est magna. Proident cupidatat laborum velit pariatur laborum enim ipsum nulla sint do aute magna adipisicing. Aliqua eu est esse proident amet aliqua aliqua aliquip duis eu.\r\n",
      "registered": "2022-04-15T08:49:54 -05:00",
      "latitude": 17.252337,
      "longitude": 6.788987,
      "tags": [
        "proident",
        "labore",
        "veniam",
        "exercitation",
        "aute",
        "pariatur",
        "Lorem"
      ],
      "friends": [
        {
          "id": 0,
          "name": "Case Glass"
        },
        {
          "id": 1,
          "name": "Wood Santana"
        },
        {
          "id": 2,
          "name": "Coffey Kline"
        }
      ],
      "greeting": "Hello, Malinda Rodriguez! You have 8 unread messages.",
      "favoriteFruit": "banana"
    },
    {
      "_id": "6734d9c4c9910618b3381880",
      "index": 2,
      "guid": "547c4b34-037f-4a57-a998-00104693a124",
      "isActive": false,
      "balance": "$3,306.66",
      "picture": "http://placehold.it/32x32",
      "age": 38,
      "eyeColor": "green",
      "name": "Dalton Sweet",
      "gender": "male",
      "company": "ENORMO",
      "email": "daltonsweet@enormo.com",
      "phone": "+1 (982) 578-2292",
      "address": "846 Court Street, Coyote, Tennessee, 6372",
      "about": "Minim aliquip elit esse laboris reprehenderit id nulla Lorem id excepteur cillum eiusmod. Reprehenderit quis reprehenderit aliquip consectetur excepteur exercitation officia excepteur eu cupidatat culpa consectetur fugiat sint. Nostrud eiusmod officia eu nostrud esse sit magna id. Consequat incididunt mollit pariatur dolore tempor dolore dolore amet eiusmod. Nostrud eiusmod adipisicing labore in. Et Lorem voluptate in ipsum dolor.\r\n",
      "registered": "2016-07-03T10:05:18 -05:00",
      "latitude": 85.650648,
      "longitude": -58.272104,
      "tags": [
        "aliquip",
        "labore",
        "proident",
        "sint",
        "minim",
        "eu",
        "do"
      ],
      "friends": [
        {
          "id": 0,
          "name": "Gallagher Olson"
        },
        {
          "id": 1,
          "name": "Abbott Riley"
        },
        {
          "id": 2,
          "name": "Therese Witt"
        }
      ],
      "greeting": "Hello, Dalton Sweet! You have 1 unread messages.",
      "favoriteFruit": "apple"
    },
    {
      "_id": "6734d9c4f9c148b55afc4085",
      "index": 3,
      "guid": "b4f7463c-154f-437e-b1c3-5de235c50f47",
      "isActive": true,
      "balance": "$2,243.73",
      "picture": "http://placehold.it/32x32",
      "age": 26,
      "eyeColor": "green",
      "name": "Joseph Lynch",
      "gender": "male",
      "company": "BLUPLANET",
      "email": "josephlynch@bluplanet.com",
      "phone": "+1 (843) 574-3090",
      "address": "224 Gerry Street, Greenbush, Missouri, 4159",
      "about": "Cupidatat nisi duis elit dolor ullamco esse irure ipsum aute officia ea aliqua dolor. Officia est veniam veniam nostrud in esse in incididunt aliqua. Est laboris culpa do sint cupidatat mollit cillum labore. Ut magna voluptate anim excepteur ut ea consectetur pariatur in. Enim officia consectetur non cupidatat dolore consequat pariatur do tempor do elit.\r\n",
      "registered": "2024-08-14T03:34:22 -05:00",
      "latitude": 3.280431,
      "longitude": -104.0918,
      "tags": [
        "anim",
        "reprehenderit",
        "eiusmod",
        "tempor",
        "nisi",
        "proident",
        "exercitation"
      ],
      "friends": [
        {
          "id": 0,
          "name": "Velasquez Erickson"
        },
        {
          "id": 1,
          "name": "Brandy Stephens"
        },
        {
          "id": 2,
          "name": "Horne Spencer"
        }
      ],
      "greeting": "Hello, Joseph Lynch! You have 4 unread messages.",
      "favoriteFruit": "apple"
    },
    {
      "_id": "6734d9c4ef7ee0b28ab84fa3",
      "index": 4,
      "guid": "7df1713e-095d-4054-a0d0-84389079dd21",
      "isActive": true,
      "balance": "$1,550.35",
      "picture": "http://placehold.it/32x32",
      "age": 36,
      "eyeColor": "blue",
      "name": "Mayo Williamson",
      "gender": "male",
      "company": "SOLGAN",
      "email": "mayowilliamson@solgan.com",
      "phone": "+1 (917) 580-2288",
      "address": "831 Reed Street, Nicut, Nebraska, 6366",
      "about": "Aute ut sunt anim veniam. Consequat mollit mollit magna eiusmod. Culpa sit veniam sint aliqua ad cupidatat exercitation voluptate laboris adipisicing.\r\n",
      "registered": "2018-04-27T07:11:23 -05:00",
      "latitude": 37.255429,
      "longitude": -112.131364,
      "tags": [
        "ullamco",
        "non",
        "exercitation",
        "fugiat",
        "consectetur",
        "quis",
        "nisi"
      ],
      "friends": [
        {
          "id": 0,
          "name": "Lenora Brewer"
        },
        {
          "id": 1,
          "name": "Milagros Emerson"
        },
        {
          "id": 2,
          "name": "Hays Snow"
        }
      ],
      "greeting": "Hello, Mayo Williamson! You have 2 unread messages.",
      "favoriteFruit": "strawberry"
    },
    {
      "_id": "6734d9c4249724e2b7b6b57d",
      "index": 5,
      "guid": "0be83b5d-d2ef-45a5-a7d4-136b1fdd1777",
      "isActive": false,
      "balance": "$2,216.20",
      "picture": "http://placehold.it/32x32",
      "age": 22,
      "eyeColor": "blue",
      "name": "Hillary Strong",
      "gender": "female",
      "company": "KLUGGER",
      "email": "hillarystrong@klugger.com",
      "phone": "+1 (838) 404-2838",
      "address": "911 Wythe Place, Kenvil, Oregon, 2391",
      "about": "Ex consequat nisi eu ullamco excepteur anim amet eiusmod laborum reprehenderit do. Nulla quis labore enim reprehenderit pariatur proident dolore occaecat consectetur veniam aliquip incididunt. Labore ad dolore sit excepteur aute ipsum anim sint aute deserunt deserunt. Irure enim ut consequat sint ullamco dolor culpa velit. Reprehenderit sint anim fugiat labore duis minim exercitation commodo. Dolor dolore Lorem qui commodo ipsum incididunt minim amet ullamco et est. Incididunt quis ea do magna.\r\n",
      "registered": "2017-10-28T05:27:11 -05:00",
      "latitude": -30.462971,
      "longitude": -49.233199,
      "tags": [
        "eu",
        "enim",
        "do",
        "id",
        "irure",
        "consectetur",
        "sunt"
      ],
      "friends": [
        {
          "id": 0,
          "name": "Steele Mcclain"
        },
        {
          "id": 1,
          "name": "Geraldine Alford"
        },
        {
          "id": 2,
          "name": "Burnett Leblanc"
        }
      ],
      "greeting": "Hello, Hillary Strong! You have 1 unread messages.",
      "favoriteFruit": "apple"
    },
    {
      "_id": "6734d9c41a3d48d0400d54fe",
      "index": 6,
      "guid": "cc9e2db8-3368-481f-9e82-47d3c9c4d958",
      "isActive": true,
      "balance": "$2,867.02",
      "picture": "http://placehold.it/32x32",
      "age": 28,
      "eyeColor": "blue",
      "name": "Morales Farmer",
      "gender": "male",
      "company": "EYERIS",
      "email": "moralesfarmer@eyeris.com",
      "phone": "+1 (971) 436-2685",
      "address": "943 Vermont Street, Stockwell, Hawaii, 5444",
      "about": "Irure ullamco Lorem aliqua quis ad excepteur enim eu duis reprehenderit do tempor ut. Minim voluptate proident occaecat consequat nisi irure nisi eu eiusmod amet excepteur commodo. Elit cupidatat qui laboris labore id irure officia velit sunt do eiusmod veniam deserunt. Labore ad consectetur proident esse et. Ipsum est elit consequat officia. Sit enim cupidatat et culpa. Est exercitation consequat nisi do pariatur adipisicing consequat commodo proident reprehenderit occaecat ut ipsum aliquip.\r\n",
      "registered": "2015-03-21T06:11:25 -05:00",
      "latitude": 23.842922,
      "longitude": -174.604481,
      "tags": [
        "amet",
        "quis",
        "sunt",
        "dolor",
        "quis",
        "magna",
        "laboris"
      ],
      "friends": [
        {
          "id": 0,
          "name": "Bryan Mueller"
        },
        {
          "id": 1,
          "name": "Millicent Miranda"
        },
        {
          "id": 2,
          "name": "Yates Lancaster"
        }
      ],
      "greeting": "Hello, Morales Farmer! You have 1 unread messages.",
      "favoriteFruit": "apple"
    }
]));