export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number; // index 0-3
  difficulty: number; // 1-15
  category: string;
}

export const QUESTIONS: Question[] = [
  // Level 1 (Easy)
  {
    id: 1,
    text: "რომელია საქართველოს დედაქალაქი?",
    options: ["ქუთაისი", "ბათუმი", "თბილისი", "გორი"],
    correctAnswer: 2,
    difficulty: 1,
    category: "გეოგრაფია"
  },
  {
    id: 2,
    text: "რამდენია 5-ჯერ 5?",
    options: ["20", "25", "30", "15"],
    correctAnswer: 1,
    difficulty: 2,
    category: "მათემატიკა"
  },
  {
    id: 3,
    text: "რომელი ცხოველი ითვლება 'ტყის მეფედ'?",
    options: ["მგელი", "დათვი", "ლომი", "ვეფხვი"],
    correctAnswer: 2,
    difficulty: 3,
    category: "ბუნება"
  },
  {
    id: 4,
    text: "ვინ არის 'ვეფხისტყაოსნის' ავტორი?",
    options: ["ილია ჭავჭავაძე", "აკაკი წერეთელი", "შოთა რუსთაველი", "ვაჟა-ფშაველა"],
    correctAnswer: 2,
    difficulty: 4,
    category: "ლიტერატურა"
  },
  {
    id: 5,
    text: "რომელი პლანეტაა მზესთან ყველაზე ახლოს?",
    options: ["ვენერა", "მარსი", "მერკური", "იუპიტერი"],
    correctAnswer: 2,
    difficulty: 5,
    category: "ასტრონომია"
  },
  // Level 2 (Medium)
  {
    id: 6,
    text: "რომელ წელს მოხდა დიდგორის ბრძოლა?",
    options: ["1121 წელს", "1221 წელს", "1021 წელს", "1122 წელს"],
    correctAnswer: 0,
    difficulty: 6,
    category: "ისტორია"
  },
  {
    id: 7,
    text: "რა ქვია ნივთიერებას, რომელიც მცენარეს მწვანე ფერს აძლევს?",
    options: ["ჰემოგლობინი", "ქლოროფილი", "მელანინი", "გლუკოზა"],
    correctAnswer: 1,
    difficulty: 7,
    category: "ბიოლოგია"
  },
  {
    id: 8,
    text: "ვინ დაწერა ლექსი 'ჩემო კარგო ქვეყანავ'?",
    options: ["გალაკტიონ ტაბიძე", "ილია ჭავჭავაძე", "ნიკოლოზ ბარათაშვილი", "ტერენტი გრანელი"],
    correctAnswer: 1,
    difficulty: 8,
    category: "ლიტერატურა"
  },
  {
    id: 9,
    text: "რომელია ყველაზე დიდი ოკეანე დედამიწაზე?",
    options: ["ატლანტის", "ინდოეთის", "წყნარი", "ჩრდილოეთ ყინულოვანი"],
    correctAnswer: 2,
    difficulty: 9,
    category: "გეოგრაფია"
  },
  {
    id: 10,
    text: "რომელი ქიმიური ელემენტის სიმბოლოა 'Au'?",
    options: ["ვერცხლი", "რკინა", "ოქრო", "სპილენძი"],
    correctAnswer: 2,
    difficulty: 10,
    category: "ქიმია"
  },
  // Level 3 (Hard)
  {
    id: 11,
    text: "ვინ იყო საქართველოს პირველი პრეზიდენტი?",
    options: ["ედუარდ შევარდნაძე", "ზვიად გამსახურდია", "მიხეილ სააკაშვილი", "ნოე ჟორდანია"],
    correctAnswer: 1,
    difficulty: 11,
    category: "ისტორია"
  },
  {
    id: 12,
    text: "რომელი მწერლის ფსევდონიმი იყო 'ლუკა რაზიკაშვილი'?",
    options: ["ვაჟა-ფშაველა", "ალექსანდრე ყაზბეგი", "დავით კლდიაშვილი", "ეგნატე ნინოშვილი"],
    correctAnswer: 0,
    difficulty: 12,
    category: "ლიტერატურა"
  },
  {
    id: 13,
    text: "რა არის სინათლის სიჩქარე ვაკუუმში (დაახლოებით)?",
    options: ["150,000 კმ/წმ", "300,000 კმ/წმ", "450,000 კმ/წმ", "600,000 კმ/წმ"],
    correctAnswer: 1,
    difficulty: 13,
    category: "ფიზიკა"
  },
  {
    id: 14,
    text: "რომელ წელს აღდგა საქართველოს დამოუკიდებლობა მეოცე საუკუნეში?",
    options: ["1989 წელს", "1990 წელს", "1991 წელს", "1992 წელს"],
    correctAnswer: 2,
    difficulty: 14,
    category: "ისტორია"
  },
  {
    id: 15,
    text: "ვინ აღმოაჩინა პენიცილინი?",
    options: ["ლუი პასტერმა", "ალექსანდრე ფლემინგმა", "რობერტ კოხმა", "მარი კიურიმ"],
    correctAnswer: 1,
    difficulty: 15,
    category: "მეცნიერება"
  }
];

export const PRIZES = [
  "100", "200", "300", "500", "1,000",
  "2,000", "4,000", "8,000", "16,000", "32,000",
  "64,000", "125,000", "250,000", "500,000", "1,000,000"
];
