import type { Board, Concept, Course, Grade, QuizAttempt, QuizQuestion, StudyMessage, Subject, UserProfile } from '../lib/types';

export interface DatabaseState {
  users: UserProfile[];
  courses: Course[];
  concepts: Concept[];
  progressByUser: Record<string, string[]>;
  quizAttempts: QuizAttempt[];
  studyHistory: StudyMessage[];
}

interface TopicBlueprint {
  slug: string;
  title: string;
  chapter: string;
  summary: string;
  formula?: string;
  minutes: number;
  prereqs: string[];
  quiz: Omit<QuizQuestion, 'id'>[];
}

const MATH_CURRICULA: Record<Grade, TopicBlueprint[]> = {
  5: [
    {
      slug: 'large-numbers',
      title: 'Place Value & Large Numbers',
      chapter: 'Ch 1',
      summary: 'Read, write, and compare multi-digit numbers up to crores using Indian and International place value systems.',
      formula: '1 Crore = 100 Lakhs = 10⁷',
      minutes: 15,
      prereqs: [],
      quiz: [
        {
          prompt: 'How many lakhs make one crore in the Indian place value system?',
          options: ['10 lakhs', '100 lakhs', '1,000 lakhs', '10,000 lakhs'],
          correctIndex: 1,
          explanation: 'One crore equals 1,00,00,000 which is 100 × 1,00,000 (100 lakhs).',
        },
        {
          prompt: 'What is the place value of 7 in 4,72,810?',
          options: ['7,000', '70,000', '7,00,000', '700'],
          correctIndex: 1,
          explanation: '7 sits in the ten-thousands place, so its place value is 70,000.',
        },
      ],
    },
    {
      slug: 'factors-multiples',
      title: 'Factors, Multiples & Primes',
      chapter: 'Ch 2',
      summary: 'Identify prime and composite numbers, factor trees, HCF, and LCM using divisibility rules.',
      formula: 'HCF(a, b) × LCM(a, b) = a × b',
      minutes: 20,
      prereqs: ['large-numbers'],
      quiz: [
        {
          prompt: 'Which is the smallest even prime number?',
          options: ['1', '2', '4', '6'],
          correctIndex: 1,
          explanation: '2 has exactly two distinct factors (1 and 2), making it the only even prime.',
        },
        {
          prompt: 'What is the LCM of 6 and 8?',
          options: ['12', '16', '24', '48'],
          correctIndex: 2,
          explanation: 'Multiples of 8 are 8, 16, 24... and 24 is the smallest multiple divisible by 6.',
        },
      ],
    },
    {
      slug: 'fractions-basics',
      title: 'Equivalent Fractions & Operations',
      chapter: 'Ch 3',
      summary: 'Represent parts of a whole, simplify equivalent fractions, and add or subtract unlike fractions.',
      formula: 'a/b + c/d = (ad + bc) / bd',
      minutes: 25,
      prereqs: ['factors-multiples'],
      quiz: [
        {
          prompt: 'Which fraction is equivalent to 3/4?',
          options: ['6/12', '9/12', '12/15', '4/3'],
          correctIndex: 1,
          explanation: 'Multiplying numerator and denominator of 3/4 by 3 gives 9/12.',
        },
        {
          prompt: 'What is 1/3 + 1/6?',
          options: ['2/9', '1/2', '2/6', '1/9'],
          correctIndex: 1,
          explanation: '1/3 = 2/6, so 2/6 + 1/6 = 3/6 = 1/2.',
        },
      ],
    },
    {
      slug: 'decimals-intro',
      title: 'Decimals & Metric Conversions',
      chapter: 'Ch 4',
      summary: 'Convert tenths and hundredths between fractions and decimals and apply them to length, mass, and currency.',
      formula: '0.25 = 25/100 = 1/4',
      minutes: 20,
      prereqs: ['fractions-basics'],
      quiz: [
        {
          prompt: 'Express 3/10 + 7/100 as a decimal.',
          options: ['0.37', '3.7', '0.037', '3.07'],
          correctIndex: 0,
          explanation: '3 tenths and 7 hundredths combine to 0.37.',
        },
        {
          prompt: 'How many meters are in 2.45 km?',
          options: ['245 m', '2,450 m', '24,500 m', '24.5 m'],
          correctIndex: 1,
          explanation: '1 km = 1,000 m, so 2.45 × 1,000 = 2,450 m.',
        },
      ],
    },
    {
      slug: 'angles-shapes',
      title: 'Angles, Triangles & Symmetry',
      chapter: 'Ch 5',
      summary: 'Measure acute, right, and obtuse angles with a protractor and explore line symmetry in polygons.',
      formula: 'Right angle = 90°, Straight angle = 180°',
      minutes: 20,
      prereqs: ['large-numbers'],
      quiz: [
        {
          prompt: 'An angle measuring 135° is classified as:',
          options: ['Acute', 'Right', 'Obtuse', 'Reflex'],
          correctIndex: 2,
          explanation: 'Any angle strictly between 90° and 180° is an obtuse angle.',
        },
        {
          prompt: 'How many lines of symmetry does an equilateral triangle have?',
          options: ['1', '2', '3', '6'],
          correctIndex: 2,
          explanation: 'All three medians/altitudes of an equilateral triangle are lines of symmetry.',
        },
      ],
    },
    {
      slug: 'area-perimeter-5',
      title: 'Perimeter & Area of Rectangles',
      chapter: 'Ch 6',
      summary: 'Calculate boundary lengths and unit-square areas for squares, rectangles, and composite grids.',
      formula: 'P = 2(l + b),  A = l × b',
      minutes: 25,
      prereqs: ['decimals-intro', 'angles-shapes'],
      quiz: [
        {
          prompt: 'Find the area of a rectangle with length 12 cm and breadth 5 cm.',
          options: ['34 cm²', '60 cm²', '17 cm²', '120 cm²'],
          correctIndex: 1,
          explanation: 'Area = length × breadth = 12 × 5 = 60 cm².',
        },
        {
          prompt: 'What is the perimeter of a square whose area is 49 cm²?',
          options: ['14 cm', '28 cm', '49 cm', '21 cm'],
          correctIndex: 1,
          explanation: 'Side = √49 = 7 cm, so perimeter = 4 × 7 = 28 cm.',
        },
      ],
    },
  ],
  6: [
    {
      slug: 'integers-number-line',
      title: 'Integers & Directed Numbers',
      chapter: 'Ch 1',
      summary: 'Represent positive and negative integers on a number line and perform integer addition and subtraction.',
      formula: 'a - (-b) = a + b',
      minutes: 18,
      prereqs: [],
      quiz: [
        {
          prompt: 'Evaluate (-8) + (+13).',
          options: ['-21', '-5', '5', '21'],
          correctIndex: 2,
          explanation: 'Moving 13 units right from -8 lands on +5.',
        },
        {
          prompt: 'Which integer is greater: -15 or -4?',
          options: ['-15', '-4', 'They are equal', 'Cannot compare'],
          correctIndex: 1,
          explanation: '-4 lies to the right of -15 on the number line.',
        },
      ],
    },
    {
      slug: 'ratio-proportion-6',
      title: 'Ratio, Proportion & Unitary Method',
      chapter: 'Ch 2',
      summary: 'Compare quantities using simplified ratios, verify proportionality, and solve unitary rate problems.',
      formula: 'a : b :: c : d  ⇒  a × d = b × c',
      minutes: 22,
      prereqs: ['integers-number-line'],
      quiz: [
        {
          prompt: 'Simplify the ratio 24 : 36.',
          options: ['4 : 9', '2 : 3', '3 : 4', '6 : 9'],
          correctIndex: 1,
          explanation: 'Dividing both terms by their HCF (12) yields 2 : 3.',
        },
        {
          prompt: 'If 5 notebooks cost ₹125, what is the cost of 8 notebooks?',
          options: ['₹175', '₹200', '₹225', '₹180'],
          correctIndex: 1,
          explanation: 'Cost of 1 notebook = ₹25, so 8 notebooks cost 8 × 25 = ₹200.',
        },
      ],
    },
    {
      slug: 'algebra-intro-6',
      title: 'Introduction to Algebra & Variables',
      chapter: 'Ch 3',
      summary: 'Translate word statements into algebraic expressions with variables, constants, and simple equations.',
      formula: 'y + 7 = 19  ⇒  y = 12',
      minutes: 25,
      prereqs: ['integers-number-line'],
      quiz: [
        {
          prompt: 'Write an expression for "5 subtracted from twice a number x".',
          options: ['5 - 2x', '2x - 5', '2(x - 5)', 'x/2 - 5'],
          correctIndex: 1,
          explanation: 'Twice x is 2x, and subtracting 5 gives 2x - 5.',
        },
        {
          prompt: 'Solve for m: 3m = 27.',
          options: ['6', '8', '9', '81'],
          correctIndex: 2,
          explanation: 'Dividing both sides by 3 gives m = 9.',
        },
      ],
    },
    {
      slug: 'basic-geometry-6',
      title: 'Basic Geometrical Ideas & Polygons',
      chapter: 'Ch 4',
      summary: 'Distinguish rays, line segments, intersecting/parallel lines, triangles, quadrilaterals, and circles.',
      formula: 'Diameter = 2 × Radius',
      minutes: 20,
      prereqs: ['integers-number-line'],
      quiz: [
        {
          prompt: 'A line segment connecting two points on a circle passing through the center is a:',
          options: ['Chord only', 'Radius', 'Diameter', 'Tangent'],
          correctIndex: 2,
          explanation: 'The longest chord passing through the center of a circle is its diameter.',
        },
        {
          prompt: 'How many vertices does a pentagon have?',
          options: ['4', '5', '6', '8'],
          correctIndex: 1,
          explanation: 'A pentagon is a 5-sided polygon with 5 vertices.',
        },
      ],
    },
    {
      slug: 'mensuration-6',
      title: 'Mensuration of Composite Shapes',
      chapter: 'Ch 5',
      summary: 'Decompose L-shaped figures into rectangles to determine total perimeter and area.',
      formula: 'Perimeter of regular n-gon = n × side',
      minutes: 25,
      prereqs: ['algebra-intro-6', 'basic-geometry-6'],
      quiz: [
        {
          prompt: 'Find the perimeter of a regular hexagon with side 7.5 cm.',
          options: ['37.5 cm', '45 cm', '52.5 cm', '30 cm'],
          correctIndex: 1,
          explanation: 'A regular hexagon has 6 equal sides: 6 × 7.5 = 45 cm.',
        },
        {
          prompt: 'A square floor of side 4 m is covered by tiles of area 0.5 m². How many tiles are needed?',
          options: ['8', '16', '32', '64'],
          correctIndex: 2,
          explanation: 'Floor area = 16 m²; 16 / 0.5 = 32 tiles.',
        },
      ],
    },
    {
      slug: 'data-handling-6',
      title: 'Data Handling & Bar Graphs',
      chapter: 'Ch 6',
      summary: 'Organize raw observations with tally marks and interpret pictographs and scaled bar graphs.',
      formula: 'Scale = Units per 1 cm bar height',
      minutes: 18,
      prereqs: ['ratio-proportion-6'],
      quiz: [
        {
          prompt: 'If 1 symbol represents 15 books, how many symbols represent 90 books?',
          options: ['5', '6', '7', '9'],
          correctIndex: 1,
          explanation: '90 ÷ 15 = 6 symbols.',
        },
        {
          prompt: 'Tally marks grouped in bundles with a diagonal slash represent how many counts?',
          options: ['4', '5', '6', '10'],
          correctIndex: 1,
          explanation: 'Four vertical bars crossed by one diagonal slash represent 5.',
        },
      ],
    },
  ],
  7: [
    {
      slug: 'rational-numbers-7',
      title: 'Rational Numbers & Operations',
      chapter: 'Ch 1',
      summary: 'Classify numbers in p/q form, locate them on the number line, and compute sums and products.',
      formula: 'p/q where p, q ∈ ℤ, q ≠ 0',
      minutes: 20,
      prereqs: [],
      quiz: [
        {
          prompt: 'What is the additive inverse of -5/9?',
          options: ['-9/5', '5/9', '9/5', '0'],
          correctIndex: 1,
          explanation: '-5/9 + 5/9 = 0, so 5/9 is the additive inverse.',
        },
        {
          prompt: 'Evaluate (-2/3) × (9/4).',
          options: ['-3/2', '3/2', '-6/7', '-8/27'],
          correctIndex: 0,
          explanation: '(-2 × 9) / (3 × 4) = -18/12 = -3/2.',
        },
      ],
    },
    {
      slug: 'exponents-powers-7',
      title: 'Exponents, Powers & Scientific Notation',
      chapter: 'Ch 2',
      summary: 'Apply laws of exponents for multiplication, division, and power of a power.',
      formula: 'aᵐ × aⁿ = aᵐ⁺ⁿ,  (aᵐ)ⁿ = aᵐⁿ',
      minutes: 22,
      prereqs: ['rational-numbers-7'],
      quiz: [
        {
          prompt: 'Simplify 2³ × 2⁴.',
          options: ['2⁷', '2¹²', '4⁷', '4¹²'],
          correctIndex: 0,
          explanation: 'When bases match, add exponents: 3 + 4 = 7, giving 2⁷.',
        },
        {
          prompt: 'What is the value of 7⁰ + 5⁰?',
          options: ['0', '1', '2', '12'],
          correctIndex: 2,
          explanation: 'Any non-zero base to the power 0 equals 1, so 1 + 1 = 2.',
        },
      ],
    },
    {
      slug: 'simple-equations-7',
      title: 'Simple Linear Equations',
      chapter: 'Ch 3',
      summary: 'Balance equations using transposition and solve multi-step word problems.',
      formula: 'ax + b = c  ⇒  x = (c - b)/a',
      minutes: 25,
      prereqs: ['rational-numbers-7'],
      quiz: [
        {
          prompt: 'Solve: 4x - 7 = 21.',
          options: ['3.5', '7', '14', '28'],
          correctIndex: 1,
          explanation: '4x = 28, so x = 7.',
        },
        {
          prompt: 'If 3(y + 2) = 24, find y.',
          options: ['4', '6', '8', '10'],
          correctIndex: 1,
          explanation: 'y + 2 = 8, hence y = 6.',
        },
      ],
    },
    {
      slug: 'lines-angles-triangles-7',
      title: 'Lines, Angles & Triangle Properties',
      chapter: 'Ch 4',
      summary: 'Prove angle-sum and exterior-angle theorems and verify triangle inequality and congruence rules.',
      formula: '∠A + ∠B + ∠C = 180°',
      minutes: 25,
      prereqs: ['simple-equations-7'],
      quiz: [
        {
          prompt: 'Two angles of a triangle are 45° and 65°. What is the third angle?',
          options: ['60°', '70°', '80°', '90°'],
          correctIndex: 1,
          explanation: '180° - (45° + 65°) = 70°.',
        },
        {
          prompt: 'An exterior angle of a triangle equals the sum of its:',
          options: ['Adjacent angle', 'Two interior opposite angles', 'All three angles', 'Complementary angles'],
          correctIndex: 1,
          explanation: 'By the exterior angle theorem, it equals the sum of the two non-adjacent interior angles.',
        },
      ],
    },
    {
      slug: 'comparing-quantities-7',
      title: 'Percentages, Profit & Simple Interest',
      chapter: 'Ch 5',
      summary: 'Compute percentage change, profit/loss percent, and simple interest over time.',
      formula: 'SI = (P × R × T) / 100',
      minutes: 25,
      prereqs: ['exponents-powers-7', 'simple-equations-7'],
      quiz: [
        {
          prompt: 'Find the simple interest on ₹2,000 at 5% per annum for 3 years.',
          options: ['₹150', '₹300', '₹450', '₹600'],
          correctIndex: 1,
          explanation: 'SI = (2000 × 5 × 3) / 100 = ₹300.',
        },
        {
          prompt: 'An item bought for ₹400 is sold for ₹460. What is the profit percentage?',
          options: ['12%', '15%', '18%', '20%'],
          correctIndex: 1,
          explanation: 'Profit = ₹60; Profit% = (60 / 400) × 100 = 15%.',
        },
      ],
    },
    {
      slug: 'congruence-area-7',
      title: 'Congruence & Area of Circles',
      chapter: 'Ch 6',
      summary: 'Apply SSS, SAS, ASA, RHS congruence criteria and compute circumference and area of circles.',
      formula: 'C = 2πr,  A = πr²',
      minutes: 28,
      prereqs: ['lines-angles-triangles-7', 'comparing-quantities-7'],
      quiz: [
        {
          prompt: 'Find the circumference of a circle of radius 7 cm (use π = 22/7).',
          options: ['22 cm', '44 cm', '154 cm', '88 cm'],
          correctIndex: 1,
          explanation: 'C = 2 × (22/7) × 7 = 44 cm.',
        },
        {
          prompt: 'Which criterion proves two right-angled triangles congruent using hypotenuse and one leg?',
          options: ['AAA', 'RHS', 'SSA', 'SAS'],
          correctIndex: 1,
          explanation: 'RHS stands for Right angle – Hypotenuse – Side.',
        },
      ],
    },
  ],
  8: [
    {
      slug: 'squares-roots-8',
      title: 'Squares, Cubes & Radicals',
      chapter: 'Ch 1',
      summary: 'Determine square roots and cube roots via prime factorization and estimation.',
      formula: '√(a × b) = √a × √b',
      minutes: 20,
      prereqs: [],
      quiz: [
        {
          prompt: 'What is the square root of 1,225?',
          options: ['25', '35', '45', '55'],
          correctIndex: 1,
          explanation: '35 × 35 = 1,225.',
        },
        {
          prompt: 'What is the cube root of 512?',
          options: ['6', '7', '8', '9'],
          correctIndex: 2,
          explanation: '8³ = 8 × 8 × 8 = 512.',
        },
      ],
    },
    {
      slug: 'algebraic-identities-8',
      title: 'Algebraic Expressions & Identities',
      chapter: 'Ch 2',
      summary: 'Multiply polynomials and apply standard binomial identities to simplify expressions.',
      formula: '(a + b)² = a² + 2ab + b²',
      minutes: 25,
      prereqs: ['squares-roots-8'],
      quiz: [
        {
          prompt: 'Expand (x - 4)².',
          options: ['x² - 16', 'x² - 8x + 16', 'x² + 8x + 16', 'x² - 4x + 16'],
          correctIndex: 1,
          explanation: 'Using (a - b)² = a² - 2ab + b², we get x² - 8x + 16.',
        },
        {
          prompt: 'Evaluate 98 × 102 using an algebraic identity.',
          options: ['9,996', '9,998', '10,004', '9,896'],
          correctIndex: 0,
          explanation: '(100 - 2)(100 + 2) = 100² - 2² = 10,000 - 4 = 9,996.',
        },
      ],
    },
    {
      slug: 'linear-equations-8',
      title: 'Linear Equations in One Variable',
      chapter: 'Ch 3',
      summary: 'Solve equations with variables on both sides and reduce fractional linear equations.',
      formula: 'ax + b = cx + d  ⇒  x = (d - b)/(a - c)',
      minutes: 25,
      prereqs: ['algebraic-identities-8'],
      quiz: [
        {
          prompt: 'Solve for x: 5x - 3 = 2x + 12.',
          options: ['3', '4', '5', '6'],
          correctIndex: 2,
          explanation: '3x = 15, therefore x = 5.',
        },
        {
          prompt: 'If (x/2) + (x/3) = 10, what is x?',
          options: ['6', '10', '12', '15'],
          correctIndex: 2,
          explanation: '5x/6 = 10 ⇒ 5x = 60 ⇒ x = 12.',
        },
      ],
    },
    {
      slug: 'factorisation-8',
      title: 'Factorisation of Polynomials',
      chapter: 'Ch 4',
      summary: 'Factor quadratic trinomials by splitting the middle term and applying difference of squares.',
      formula: 'a² - b² = (a - b)(a + b)',
      minutes: 28,
      prereqs: ['algebraic-identities-8'],
      quiz: [
        {
          prompt: 'Factorise x² - 9x + 20.',
          options: ['(x - 4)(x - 5)', '(x + 4)(x + 5)', '(x - 2)(x - 10)', '(x - 4)(x + 5)'],
          correctIndex: 0,
          explanation: '-4 and -5 sum to -9 and multiply to +20.',
        },
        {
          prompt: 'Factorise 49p² - 36.',
          options: ['(7p - 6)²', '(7p - 6)(7p + 6)', '(49p - 6)(p + 6)', '(7p + 6)²'],
          correctIndex: 1,
          explanation: '(7p)² - 6² = (7p - 6)(7p + 6).',
        },
      ],
    },
    {
      slug: 'compound-interest-8',
      title: 'Compound Interest & Discounts',
      chapter: 'Ch 5',
      summary: 'Calculate marked price discounts, GST, and compound interest compounded annually or half-yearly.',
      formula: 'A = P(1 + R/100)ⁿ',
      minutes: 25,
      prereqs: ['linear-equations-8'],
      quiz: [
        {
          prompt: 'Find the amount on ₹10,000 for 2 years at 10% p.a. compounded annually.',
          options: ['₹12,000', '₹12,100', '₹11,000', '₹12,200'],
          correctIndex: 1,
          explanation: 'A = 10000 × (1.1)² = 10000 × 1.21 = ₹12,100.',
        },
        {
          prompt: 'An article marked at ₹800 is sold at a 15% discount. What is the selling price?',
          options: ['₹680', '₹700', '₹720', '₹660'],
          correctIndex: 0,
          explanation: 'Discount = 15% of 800 = ₹120, so SP = 800 - 120 = ₹680.',
        },
      ],
    },
    {
      slug: 'mensuration-3d-8',
      title: 'Surface Area & Volume of Solids',
      chapter: 'Ch 6',
      summary: 'Compute lateral and total surface areas and volumes of cubes, cuboids, and right circular cylinders.',
      formula: 'V_cylinder = πr²h,  TSA = 2πr(r + h)',
      minutes: 30,
      prereqs: ['factorisation-8', 'compound-interest-8'],
      quiz: [
        {
          prompt: 'What is the volume of a cylinder with radius 7 cm and height 10 cm (π = 22/7)?',
          options: ['440 cm³', '1,540 cm³', '770 cm³', '3,080 cm³'],
          correctIndex: 1,
          explanation: 'V = (22/7) × 7 × 7 × 10 = 1,540 cm³.',
        },
        {
          prompt: 'Find the total surface area of a cube of edge 5 cm.',
          options: ['100 cm²', '125 cm²', '150 cm²', '180 cm²'],
          correctIndex: 2,
          explanation: 'TSA of a cube = 6a² = 6 × 25 = 150 cm².',
        },
      ],
    },
  ],
  9: [
    {
      slug: 'number-systems-9',
      title: 'Real Numbers & Surds',
      chapter: 'Ch 1',
      summary: 'Explore irrational numbers, decimal expansions, and rationalizing denominators of surds.',
      formula: '1/(√a + √b) = (√a - √b)/(a - b)',
      minutes: 22,
      prereqs: [],
      quiz: [
        {
          prompt: 'Which of the following is an irrational number?',
          options: ['√16', '22/7', '√7', '0.375'],
          correctIndex: 2,
          explanation: '7 is not a perfect square, so √7 has a non-terminating, non-repeating decimal expansion.',
        },
        {
          prompt: 'Rationalize the denominator of 1 / √5.',
          options: ['√5 / 5', '5 / √5', '√5', '1 / 5'],
          correctIndex: 0,
          explanation: 'Multiply numerator and denominator by √5 to get √5 / 5.',
        },
      ],
    },
    {
      slug: 'polynomials-9',
      title: 'Polynomials & Remainder Theorem',
      chapter: 'Ch 2',
      summary: 'Find zeros of polynomials, apply Remainder and Factor theorems, and factor cubic expressions.',
      formula: 'If p(a) = 0, then (x - a) is a factor of p(x)',
      minutes: 28,
      prereqs: ['number-systems-9'],
      quiz: [
        {
          prompt: 'What is the remainder when x³ + 3x² + 3x + 1 is divided by (x + 1)?',
          options: ['0', '1', '-1', '8'],
          correctIndex: 0,
          explanation: 'By Remainder Theorem, p(-1) = (-1)³ + 3(-1)² + 3(-1) + 1 = 0.',
        },
        {
          prompt: 'What is the degree of the polynomial 5x⁴ - 3x² + 9?',
          options: ['2', '3', '4', '5'],
          correctIndex: 2,
          explanation: 'The highest power of the variable x with non-zero coefficient is 4.',
        },
      ],
    },
    {
      slug: 'coordinate-linear-9',
      title: 'Cartesian Plane & Linear Equations in 2 Variables',
      chapter: 'Ch 3',
      summary: 'Plot points across four quadrants and graph linear equations ax + by + c = 0.',
      formula: 'ax + by + c = 0',
      minutes: 24,
      prereqs: ['polynomials-9'],
      quiz: [
        {
          prompt: 'In which quadrant does the point (-4, 6) lie?',
          options: ['Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV'],
          correctIndex: 1,
          explanation: 'Negative x and positive y place the point in Quadrant II.',
        },
        {
          prompt: 'Which point lies on the line 2x + y = 7?',
          options: ['(2, 3)', '(3, 2)', '(1, 4)', '(4, 1)'],
          correctIndex: 0,
          explanation: '2(2) + 3 = 7, which satisfies the equation.',
        },
      ],
    },
    {
      slug: 'triangles-circles-9',
      title: 'Triangles, Quadrilaterals & Circle Theorems',
      chapter: 'Ch 4',
      summary: 'Apply midpoint theorem, equal chords subtending equal angles, and cyclic quadrilateral properties.',
      formula: 'Opposite angles of cyclic quadrilateral sum to 180°',
      minutes: 30,
      prereqs: ['coordinate-linear-9'],
      quiz: [
        {
          prompt: 'If one angle of a cyclic quadrilateral is 72°, what is its opposite angle?',
          options: ['72°', '90°', '108°', '18°'],
          correctIndex: 2,
          explanation: 'Opposite angles in a cyclic quadrilateral are supplementary: 180° - 72° = 108°.',
        },
        {
          prompt: 'The angle subtended by a diameter at any point on the circle is:',
          options: ['45°', '60°', '90°', '180°'],
          correctIndex: 2,
          explanation: 'Angle in a semicircle is always a right angle (90°).',
        },
      ],
    },
    {
      slug: 'herons-cones-spheres-9',
      title: "Heron's Formula, Cones & Spheres",
      chapter: 'Ch 5',
      summary: 'Compute triangle area from three sides and find surface areas and volumes of cones and spheres.',
      formula: 'Area = √[s(s-a)(s-b)(s-c)],  V_cone = ⅓πr²h',
      minutes: 28,
      prereqs: ['number-systems-9', 'triangles-circles-9'],
      quiz: [
        {
          prompt: 'Find the area of a triangle with sides 3 cm, 4 cm, and 5 cm.',
          options: ['6 cm²', '10 cm²', '12 cm²', '15 cm²'],
          correctIndex: 0,
          explanation: 's = 6; √(6 × 3 × 2 × 1) = √36 = 6 cm².',
        },
        {
          prompt: 'What is the surface area of a sphere of radius r?',
          options: ['2πr²', '3πr²', '4πr²', '4/3 πr³'],
          correctIndex: 2,
          explanation: 'The curved/total surface area of a sphere is 4πr².',
        },
      ],
    },
    {
      slug: 'statistics-probability-9',
      title: 'Histograms & Empirical Probability',
      chapter: 'Ch 6',
      summary: 'Construct frequency polygons and compute experimental probabilities from grouped datasets.',
      formula: 'P(E) = Favorable outcomes / Total trials',
      minutes: 22,
      prereqs: ['coordinate-linear-9'],
      quiz: [
        {
          prompt: 'A coin is tossed 200 times and heads appears 112 times. What is P(Heads)?',
          options: ['0.44', '0.56', '0.50', '0.62'],
          correctIndex: 1,
          explanation: '112 / 200 = 0.56.',
        },
        {
          prompt: 'For a histogram with unequal class widths, bar height is proportional to:',
          options: ['Class mark', 'Frequency density', 'Upper limit', 'Cumulative frequency'],
          correctIndex: 1,
          explanation: 'Adjusted frequency (frequency density) keeps bar areas proportional to frequencies.',
        },
      ],
    },
  ],
  10: [
    {
      slug: 'real-numbers-euclid-10',
      title: 'Fundamental Theorem of Arithmetic',
      chapter: 'Ch 1',
      summary: 'Use prime factorization to prove irrationality and determine HCF and LCM of composite numbers.',
      formula: 'N = p₁^{a₁} · p₂^{a₂} · … · pₖ^{aₖ}',
      minutes: 22,
      prereqs: [],
      quiz: [
        {
          prompt: 'Using prime factorization, find HCF(96, 404).',
          options: ['2', '4', '8', '12'],
          correctIndex: 1,
          explanation: '96 = 2⁵ × 3 and 404 = 2² × 101, so HCF = 2² = 4.',
        },
        {
          prompt: 'If HCF(a, b) = 12 and a × b = 1,800, what is LCM(a, b)?',
          options: ['120', '150', '180', '200'],
          correctIndex: 1,
          explanation: 'LCM = (a × b) / HCF = 1800 / 12 = 150.',
        },
      ],
    },
    {
      slug: 'quadratic-equations-10',
      title: 'Quadratic Equations & Discriminant',
      chapter: 'Ch 2',
      summary: 'Solve ax² + bx + c = 0 by factoring and the quadratic formula, and classify roots via D = b² - 4ac.',
      formula: 'x = (-b ± √(b² - 4ac)) / 2a',
      minutes: 28,
      prereqs: ['real-numbers-euclid-10'],
      quiz: [
        {
          prompt: 'When does a quadratic equation have two equal real roots?',
          options: ['D > 0', 'D = 0', 'D < 0', 'a = 0'],
          correctIndex: 1,
          explanation: 'When discriminant b² - 4ac = 0, both roots collapse to -b / 2a.',
        },
        {
          prompt: 'Find the roots of x² - 7x + 12 = 0.',
          options: ['2 and 6', '3 and 4', '-3 and -4', '1 and 12'],
          correctIndex: 1,
          explanation: '(x - 3)(x - 4) = 0 gives roots x = 3 and x = 4.',
        },
      ],
    },
    {
      slug: 'arithmetic-progressions-10',
      title: 'Arithmetic Progressions (AP)',
      chapter: 'Ch 3',
      summary: 'Derive the nth term and sum of first n terms of sequences with constant common difference.',
      formula: 'aₙ = a + (n - 1)d,  Sₙ = n/2 [2a + (n - 1)d]',
      minutes: 25,
      prereqs: ['quadratic-equations-10'],
      quiz: [
        {
          prompt: 'Find the 10th term of the AP: 2, 7, 12, ...',
          options: ['42', '47', '52', '57'],
          correctIndex: 1,
          explanation: 'a = 2, d = 5 ⇒ a₁₀ = 2 + 9(5) = 47.',
        },
        {
          prompt: 'What is the sum of the first 20 positive integers?',
          options: ['190', '200', '210', '220'],
          correctIndex: 2,
          explanation: 'S₂₀ = (20 × 21) / 2 = 210.',
        },
      ],
    },
    {
      slug: 'coordinate-geometry-10',
      title: 'Distance & Section Formula',
      chapter: 'Ch 4',
      summary: 'Calculate Euclidean distances between points and coordinates dividing a segment in ratio m₁:m₂.',
      formula: 'd = √[(x₂ - x₁)² + (y₂ - y₁)²]',
      minutes: 25,
      prereqs: ['real-numbers-euclid-10'],
      quiz: [
        {
          prompt: 'Find the distance between (0, 0) and (6, 8).',
          options: ['10', '12', '14', '√14'],
          correctIndex: 0,
          explanation: '√(6² + 8²) = √(36 + 64) = √100 = 10.',
        },
        {
          prompt: 'What is the midpoint of the segment joining (-2, 5) and (6, -1)?',
          options: ['(2, 2)', '(4, 2)', '(2, 3)', '(3, 2)'],
          correctIndex: 0,
          explanation: '((-2 + 6)/2, (5 - 1)/2) = (2, 2).',
        },
      ],
    },
    {
      slug: 'trigonometry-10',
      title: 'Trigonometric Ratios & Identities',
      chapter: 'Ch 5',
      summary: 'Relate right-triangle ratios (sin, cos, tan), standard angles, and Pythagorean trigonometric identities.',
      formula: 'sin²θ + cos²θ = 1',
      minutes: 30,
      prereqs: ['coordinate-geometry-10', 'quadratic-equations-10'],
      quiz: [
        {
          prompt: 'If sin A = 3/5 (A acute), what is cos A?',
          options: ['3/4', '4/5', '5/4', '2/5'],
          correctIndex: 1,
          explanation: 'cos A = √(1 - 9/25) = √(16/25) = 4/5.',
        },
        {
          prompt: 'Evaluate sin 30° + cos 60°.',
          options: ['0', '0.5', '1', '√3'],
          correctIndex: 2,
          explanation: 'sin 30° = 1/2 and cos 60° = 1/2, so their sum is 1.',
        },
      ],
    },
    {
      slug: 'statistics-probability-10',
      title: 'Grouped Mean, Median & Classical Probability',
      chapter: 'Ch 6',
      summary: 'Compute mean, median, and mode of grouped frequency distributions and exact probability events.',
      formula: 'Mode = l + [(f₁ - f₀)/(2f₁ - f₀ - f₂)] × h',
      minutes: 25,
      prereqs: ['arithmetic-progressions-10', 'trigonometry-10'],
      quiz: [
        {
          prompt: 'Two fair dice are thrown simultaneously. What is the probability of getting a sum of 7?',
          options: ['1/12', '1/6', '5/36', '7/36'],
          correctIndex: 1,
          explanation: '6 favorable pairs out of 36 outcomes give a sum of 7: 6/36 = 1/6.',
        },
        {
          prompt: 'Which empirical relationship links Mean, Median, and Mode?',
          options: [
            '3 Median = Mode + 2 Mean',
            '2 Median = Mode + 3 Mean',
            'Mode = Mean + Median',
            'Mean = 3 Median - 2 Mode',
          ],
          correctIndex: 0,
          explanation: 'The empirical relation is 3 Median = Mode + 2 Mean.',
        },
      ],
    },
  ],
};

const SCIENCE_CURRICULA: Record<Grade, TopicBlueprint[]> = {
  5: [
    {
      slug: 'plant-reproduction-5',
      title: 'Seed Dispersal & Plant Growth',
      chapter: 'Ch 1',
      summary: 'Explore seed anatomy, germination conditions, and wind/water/animal dispersal mechanisms.',
      minutes: 15,
      prereqs: [],
      quiz: [
        {
          prompt: 'Which three conditions are essential for seed germination?',
          options: [
            'Soil, fertilizer, moonlight',
            'Water, warmth, and oxygen',
            'Direct sunlight only',
            'Carbon dioxide and sand',
          ],
          correctIndex: 1,
          explanation: 'Seeds require moisture, suitable temperature, and oxygen to activate embryo growth.',
        },
        {
          prompt: 'Dandelion seeds have hair-like structures suited for dispersal by:',
          options: ['Water', 'Wind', 'Explosion', 'Insects'],
          correctIndex: 1,
          explanation: 'Lightweight feathery pappus hairs allow wind currents to carry dandelion seeds.',
        },
      ],
    },
    {
      slug: 'human-skeletal-nervous-5',
      title: 'Skeletal & Nervous Systems',
      chapter: 'Ch 2',
      summary: 'Understand joints, voluntary/involuntary muscles, and how the brain, spinal cord, and nerves coordinate.',
      minutes: 20,
      prereqs: ['plant-reproduction-5'],
      quiz: [
        {
          prompt: 'Which type of joint allows movement in all directions, such as in the shoulder?',
          options: ['Hinge joint', 'Ball and socket joint', 'Pivot joint', 'Gliding joint'],
          correctIndex: 1,
          explanation: 'A ball-and-socket joint permits multi-axial rotational movement.',
        },
        {
          prompt: 'Reflex actions are primarily controlled by the:',
          options: ['Spinal cord', 'Ribcage', 'Stomach', 'Cerebellum'],
          correctIndex: 0,
          explanation: 'The spinal cord triggers rapid involuntary reflex arcs before conscious brain processing.',
        },
      ],
    },
    {
      slug: 'states-of-matter-5',
      title: 'States of Matter & Physical Changes',
      chapter: 'Ch 3',
      summary: 'Compare particle spacing in solids, liquids, and gases, and identify reversible vs. irreversible changes.',
      minutes: 18,
      prereqs: ['plant-reproduction-5'],
      quiz: [
        {
          prompt: 'In which state of matter are molecules most tightly packed in fixed positions?',
          options: ['Solid', 'Liquid', 'Gas', 'Plasma'],
          correctIndex: 0,
          explanation: 'Solids have strong intermolecular forces holding particles in fixed lattices.',
        },
        {
          prompt: 'Melting of ice into liquid water is an example of a:',
          options: ['Chemical change', 'Irreversible change', 'Reversible physical change', 'Combustion'],
          correctIndex: 2,
          explanation: 'No new substance forms and freezing reverses the state back to ice.',
        },
      ],
    },
    {
      slug: 'simple-machines-5',
      title: 'Force, Work & Simple Machines',
      chapter: 'Ch 4',
      summary: 'Classify levers, pulleys, inclined planes, and wedges that multiply force or change force direction.',
      formula: 'Work = Force × Displacement',
      minutes: 22,
      prereqs: ['states-of-matter-5'],
      quiz: [
        {
          prompt: 'A pair of scissors is an example of which class of lever?',
          options: ['First-class lever', 'Second-class lever', 'Third-class lever', 'Inclined plane'],
          correctIndex: 0,
          explanation: 'In scissors, the fulcrum lies between the effort and the load (Class 1).',
        },
        {
          prompt: 'Which simple machine wraps an inclined plane around a central cylinder?',
          options: ['Pulley', 'Wheel and axle', 'Screw', 'Wedge'],
          correctIndex: 2,
          explanation: 'A screw consists of a helical inclined plane wrapped around a shaft.',
        },
      ],
    },
    {
      slug: 'earth-solar-system-5',
      title: 'Earth, Moon Phases & Eclipses',
      chapter: 'Ch 5',
      summary: 'Model lunar phases, solar vs. lunar eclipses, and artificial satellite orbits.',
      minutes: 20,
      prereqs: ['simple-machines-5'],
      quiz: [
        {
          prompt: 'A solar eclipse occurs when the:',
          options: [
            'Earth comes between Sun and Moon',
            'Moon comes between Sun and Earth',
            'Sun comes between Earth and Moon',
            'Earth tilts away from the Sun',
          ],
          correctIndex: 1,
          explanation: 'The Moon casts its shadow onto Earth when positioned directly between Sun and Earth.',
        },
        {
          prompt: 'What causes tides in Earth’s oceans?',
          options: ['Solar flares', 'Gravitational pull of the Moon and Sun', 'Ocean winds', 'Volcanic vents'],
          correctIndex: 1,
          explanation: 'Differential gravitational attraction from the Moon (and Sun) creates tidal bulges.',
        },
      ],
    },
  ],
  6: [
    {
      slug: 'nutrition-food-components-6',
      title: 'Components of Food & Balanced Diet',
      chapter: 'Ch 1',
      summary: 'Test for starch, proteins, and fats and connect vitamin/mineral deficiencies to disorders.',
      minutes: 18,
      prereqs: [],
      quiz: [
        {
          prompt: 'Which chemical turns blue-black in the presence of starch?',
          options: ['Copper sulphate', 'Iodine solution', 'Caustic soda', 'Vinegar'],
          correctIndex: 1,
          explanation: 'Dilute iodine binds with amylose in starch to produce a blue-black complex.',
        },
        {
          prompt: 'Deficiency of Vitamin C leads to:',
          options: ['Rickets', 'Scurvy', 'Goitre', 'Night blindness'],
          correctIndex: 1,
          explanation: 'Lack of Vitamin C impairs collagen synthesis, causing bleeding gums (scurvy).',
        },
      ],
    },
    {
      slug: 'separation-substances-6',
      title: 'Separation of Mixtures',
      chapter: 'Ch 2',
      summary: 'Select filtration, sedimentation, decantation, evaporation, and magnetic separation for mixtures.',
      minutes: 20,
      prereqs: ['nutrition-food-components-6'],
      quiz: [
        {
          prompt: 'Which method separates dissolved common salt from seawater?',
          options: ['Filtration', 'Evaporation', 'Winnowing', 'Handpicking'],
          correctIndex: 1,
          explanation: 'Water vaporizes on heating while salt crystals remain behind.',
        },
        {
          prompt: 'Threshing followed by winnowing separates husk from grain based on difference in:',
          options: ['Color', 'Weight / density', 'Solubility', 'Magnetism'],
          correctIndex: 1,
          explanation: 'Wind carries lighter chaff away while heavier grains fall vertically.',
        },
      ],
    },
    {
      slug: 'motion-measurement-6',
      title: 'Measurement & Types of Motion',
      chapter: 'Ch 3',
      summary: 'Measure lengths in SI units and distinguish rectilinear, circular, and periodic motion.',
      formula: '1 m = 100 cm = 1,000 mm',
      minutes: 20,
      prereqs: ['separation-substances-6'],
      quiz: [
        {
          prompt: 'The swinging of a pendulum is an example of:',
          options: ['Rectilinear motion', 'Periodic motion', 'Random motion', 'Translational motion'],
          correctIndex: 1,
          explanation: 'A pendulum repeats its to-and-fro path in fixed time intervals.',
        },
        {
          prompt: 'What is the SI unit of length?',
          options: ['Centimeter', 'Kilometer', 'Meter', 'Foot'],
          correctIndex: 2,
          explanation: 'The meter (m) is the standard base SI unit for length.',
        },
      ],
    },
    {
      slug: 'light-shadows-6',
      title: 'Light, Shadows & Reflections',
      chapter: 'Ch 4',
      summary: 'Investigate rectilinear propagation of light through pinhole cameras, shadows, and plane mirrors.',
      minutes: 22,
      prereqs: ['motion-measurement-6'],
      quiz: [
        {
          prompt: 'The image formed inside a pinhole camera is always:',
          options: ['Erect and magnified', 'Inverted', 'Virtual', 'Black and white only'],
          correctIndex: 1,
          explanation: 'Light rays cross straight through the aperture, producing an upside-down image.',
        },
        {
          prompt: 'Materials that allow light to pass partially through them are called:',
          options: ['Transparent', 'Opaque', 'Translucent', 'Luminous'],
          correctIndex: 2,
          explanation: 'Translucent materials scatter part of the incident light (e.g., frosted glass).',
        },
      ],
    },
    {
      slug: 'electricity-magnets-6',
      title: 'Electric Circuits & Magnetism',
      chapter: 'Ch 5',
      summary: 'Build closed switch circuits with cells and bulbs and explore magnetic poles and compasses.',
      minutes: 24,
      prereqs: ['light-shadows-6'],
      quiz: [
        {
          prompt: 'Which material acts as an electrical insulator?',
          options: ['Copper wire', 'Graphite', 'Dry rubber', 'Aluminum foil'],
          correctIndex: 2,
          explanation: 'Dry rubber lacks free charge carriers and blocks electric current.',
        },
        {
          prompt: 'Like poles of two bar magnets always:',
          options: ['Attract each other', 'Repel each other', 'Neutralize', 'Spin endlessly'],
          correctIndex: 1,
          explanation: 'North repels North and South repels South.',
        },
      ],
    },
  ],
  7: [
    {
      slug: 'plant-animal-nutrition-7',
      title: 'Photosynthesis & Digestive Systems',
      chapter: 'Ch 1',
      summary: 'Trace chlorophyll-driven glucose synthesis and human enzymatic digestion across organs.',
      formula: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂',
      minutes: 22,
      prereqs: [],
      quiz: [
        {
          prompt: 'Which gas is absorbed from air through stomata for photosynthesis?',
          options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'],
          correctIndex: 2,
          explanation: 'Leaves take in CO₂ through stomatal pores to synthesize carbohydrates.',
        },
        {
          prompt: 'Bile juice produced by the liver helps digest:',
          options: ['Starch', 'Fats', 'Cellulose', 'Vitamins'],
          correctIndex: 1,
          explanation: 'Bile emulsifies large fat globules into smaller droplets for lipase action.',
        },
      ],
    },
    {
      slug: 'heat-transfer-7',
      title: 'Heat, Temperature & Transfer Modes',
      chapter: 'Ch 2',
      summary: 'Contrast clinical vs. laboratory thermometers and conduction, convection, and radiation.',
      formula: '°F = (9/5)°C + 32',
      minutes: 22,
      prereqs: ['plant-animal-nutrition-7'],
      quiz: [
        {
          prompt: 'Heat from the Sun reaches Earth primarily through:',
          options: ['Conduction', 'Convection', 'Radiation', 'Evaporation'],
          correctIndex: 2,
          explanation: 'Radiation requires no material medium and travels across the vacuum of space.',
        },
        {
          prompt: 'Sea breeze during daytime is driven by:',
          options: ['Convection currents', 'Conduction in sand', 'Magnetic wind', 'Refraction'],
          correctIndex: 0,
          explanation: 'Warm air rises over land and cooler air from the sea flows inward by convection.',
        },
      ],
    },
    {
      slug: 'acids-bases-salts-7',
      title: 'Acids, Bases & Neutralisation',
      chapter: 'Ch 3',
      summary: 'Use litmus, turmeric, and phenolphthalein indicators and write word equations for neutralisation.',
      formula: 'Acid + Base → Salt + Water + Heat',
      minutes: 24,
      prereqs: ['heat-transfer-7'],
      quiz: [
        {
          prompt: 'A basic solution turns red litmus paper:',
          options: ['Yellow', 'Blue', 'Colorless', 'Green'],
          correctIndex: 1,
          explanation: 'Bases turn red litmus blue; acids turn blue litmus red.',
        },
        {
          prompt: 'Which compound relieves ant-sting irritation caused by formic acid?',
          options: ['Vinegar', 'Calamine (zinc carbonate)', 'Lemon juice', 'Hydrochloric acid'],
          correctIndex: 1,
          explanation: 'Mildly basic calamine neutralizes the injected formic acid.',
        },
      ],
    },
    {
      slug: 'respiration-circulation-7',
      title: 'Respiration & Transportation in Organisms',
      chapter: 'Ch 4',
      summary: 'Compare aerobic vs. anaerobic respiration and trace blood flow and plant xylem/phloem transport.',
      minutes: 26,
      prereqs: ['plant-animal-nutrition-7'],
      quiz: [
        {
          prompt: 'Which vascular tissue carries water and dissolved minerals upward from roots?',
          options: ['Phloem', 'Xylem', 'Cambium', 'Cortex'],
          correctIndex: 1,
          explanation: 'Xylem vessels transport water and minerals from roots to leaves.',
        },
        {
          prompt: 'Which blood cells transport oxygen bound to hemoglobin?',
          options: ['Platelets', 'White blood cells', 'Red blood cells', 'Plasma cells'],
          correctIndex: 2,
          explanation: 'Red blood cells contain hemoglobin which binds oxygen.',
        },
      ],
    },
    {
      slug: 'motion-time-light-7',
      title: 'Speed-Time Graphs & Spherical Mirrors',
      chapter: 'Ch 5',
      summary: 'Calculate average speed from distance-time graphs and examine concave/convex mirror images.',
      formula: 'Speed = Distance / Time',
      minutes: 26,
      prereqs: ['heat-transfer-7', 'respiration-circulation-7'],
      quiz: [
        {
          prompt: 'A car travels 180 km in 3 hours. What is its average speed in m/s?',
          options: ['16.67 m/s', '60 m/s', '20 m/s', '15 m/s'],
          correctIndex: 0,
          explanation: '60 km/h × (5/18) = 16.67 m/s.',
        },
        {
          prompt: 'Which mirror is used as a rear-view mirror in vehicles for a wider field of view?',
          options: ['Plane mirror', 'Concave mirror', 'Convex mirror', 'Parabolic mirror'],
          correctIndex: 2,
          explanation: 'Convex mirrors always form erect, diminished images over a wide field.',
        },
      ],
    },
  ],
  8: [
    {
      slug: 'microorganisms-cells-8',
      title: 'Cell Structure & Microorganisms',
      chapter: 'Ch 1',
      summary: 'Compare plant and animal cell organelles and understand beneficial vs. pathogenic microbes.',
      minutes: 22,
      prereqs: [],
      quiz: [
        {
          prompt: 'Which organelle is present in plant cells but absent in animal cells?',
          options: ['Nucleus', 'Cell wall & Chloroplast', 'Mitochondria', 'Cell membrane'],
          correctIndex: 1,
          explanation: 'Plant cells have rigid cellulose cell walls and chloroplasts for photosynthesis.',
        },
        {
          prompt: 'Which bacterium converts milk into curd?',
          options: ['Rhizobium', 'Lactobacillus', 'Penicillium', 'Amoeba'],
          correctIndex: 1,
          explanation: 'Lactobacillus multiplies in milk and converts lactose into lactic acid.',
        },
      ],
    },
    {
      slug: 'metals-combustion-8',
      title: 'Metals, Non-Metals & Combustion',
      chapter: 'Ch 2',
      summary: 'Contrast malleability and reactivity of metals with flame zones and ignition temperature.',
      minutes: 24,
      prereqs: ['microorganisms-cells-8'],
      quiz: [
        {
          prompt: 'Which non-metal is liquid at room temperature?',
          options: ['Mercury', 'Bromine', 'Chlorine', 'Sulphur'],
          correctIndex: 1,
          explanation: 'Bromine is the only non-metal liquid at room temperature (mercury is a metal).',
        },
        {
          prompt: 'Which zone of a candle flame is the hottest?',
          options: ['Innermost dark zone', 'Middle luminous yellow zone', 'Outermost non-luminous blue zone', 'Wick base'],
          correctIndex: 2,
          explanation: 'Complete combustion occurs in the outermost blue zone, reaching maximum temperature.',
        },
      ],
    },
    {
      slug: 'force-pressure-friction-8',
      title: 'Force, Pressure & Friction',
      chapter: 'Ch 3',
      summary: 'Analyze contact/non-contact forces, fluid and atmospheric pressure, and rolling vs. sliding friction.',
      formula: 'Pressure = Force / Area (Pa = N/m²)',
      minutes: 26,
      prereqs: ['metals-combustion-8'],
      quiz: [
        {
          prompt: 'Why do school bags have wide shoulder straps?',
          options: [
            'To increase total weight',
            'To increase area and reduce pressure on shoulders',
            'To decrease friction',
            'To reduce gravitational force',
          ],
          correctIndex: 1,
          explanation: 'Larger contact area distributes force, reducing pressure (P = F/A).',
        },
        {
          prompt: 'Which type of friction is the smallest for a given pair of surfaces?',
          options: ['Static friction', 'Sliding friction', 'Rolling friction', 'Limiting friction'],
          correctIndex: 2,
          explanation: 'Rolling motion minimizes surface interlocking, making rolling friction lowest.',
        },
      ],
    },
    {
      slug: 'sound-waves-8',
      title: 'Sound, Frequency & Amplitude',
      chapter: 'Ch 4',
      summary: 'Relate pitch to frequency, loudness to amplitude, and trace human ear vibration transmission.',
      formula: 'Frequency f = Oscillations / Time (Hz)',
      minutes: 22,
      prereqs: ['force-pressure-friction-8'],
      quiz: [
        {
          prompt: 'What is the audible frequency range for the human ear?',
          options: ['2 Hz – 200 Hz', '20 Hz – 20,000 Hz', '200 Hz – 2,000 Hz', 'Above 20,000 Hz'],
          correctIndex: 1,
          explanation: 'Humans detect sound waves between 20 Hz and 20 kHz.',
        },
        {
          prompt: 'Loudness of a sound depends directly on its:',
          options: ['Frequency', 'Amplitude', 'Wavelength', 'Speed'],
          correctIndex: 1,
          explanation: 'Loudness is proportional to the square of vibration amplitude.',
        },
      ],
    },
    {
      slug: 'light-electrostatics-8',
      title: 'Chemical Effects of Current & Refraction',
      chapter: 'Ch 5',
      summary: 'Examine electroplating, laws of reflection, multiple mirror images, and human eye anatomy.',
      formula: '∠i = ∠r',
      minutes: 28,
      prereqs: ['force-pressure-friction-8', 'sound-waves-8'],
      quiz: [
        {
          prompt: 'If the angle between an incident ray and a plane mirror is 35°, what is the angle of reflection?',
          options: ['35°', '55°', '70°', '90°'],
          correctIndex: 1,
          explanation: 'Angle of incidence from the normal is 90° - 35° = 55°, so angle of reflection = 55°.',
        },
        {
          prompt: 'In electroplating copper onto an iron spoon, the spoon is connected to the:',
          options: ['Positive terminal (anode)', 'Negative terminal (cathode)', 'Insulator', 'Fuse'],
          correctIndex: 1,
          explanation: 'Positive copper ions migrate toward and deposit on the negative cathode.',
        },
      ],
    },
  ],
  9: [
    {
      slug: 'matter-atoms-molecules-9',
      title: 'Atoms, Molecules & Mole Concept',
      chapter: 'Ch 1',
      summary: 'Apply laws of conservation of mass and definite proportions, write chemical formulas, and compute moles.',
      formula: 'n = Given Mass / Molar Mass',
      minutes: 26,
      prereqs: [],
      quiz: [
        {
          prompt: 'How many moles are present in 36 g of water (H₂O, molar mass = 18 g/mol)?',
          options: ['1 mole', '2 moles', '3 moles', '18 moles'],
          correctIndex: 1,
          explanation: 'n = 36 / 18 = 2 moles.',
        },
        {
          prompt: 'What is the chemical formula of aluminium oxide (Al³⁺ and O²⁻)?',
          options: ['AlO', 'Al₂O₃', 'Al₃O₂', 'AlO₂'],
          correctIndex: 1,
          explanation: 'Crossing valencies 3 and 2 yields Al₂O₃.',
        },
      ],
    },
    {
      slug: 'atomic-structure-9',
      title: 'Structure of the Atom & Valency',
      chapter: 'Ch 2',
      summary: 'Compare Bohr energy shells, isotopes, isobars, and calculate valency from electronic configuration.',
      formula: 'Max electrons in shell n = 2n²',
      minutes: 25,
      prereqs: ['matter-atoms-molecules-9'],
      quiz: [
        {
          prompt: 'What is the maximum number of electrons in the M shell (n = 3)?',
          options: ['2', '8', '18', '32'],
          correctIndex: 2,
          explanation: '2n² = 2 × 3² = 18 electrons.',
        },
        {
          prompt: 'Isotopes of an element always have the same:',
          options: ['Mass number', 'Neutron count', 'Atomic number (protons)', 'Atomic mass'],
          correctIndex: 2,
          explanation: 'Isotopes share the same number of protons (atomic number) but differ in neutrons.',
        },
      ],
    },
    {
      slug: 'kinematics-laws-9',
      title: 'Equations of Motion & Newton’s Laws',
      chapter: 'Ch 3',
      summary: 'Derive the three kinematic equations graphically and apply inertia, F = ma, and momentum conservation.',
      formula: 'v = u + at,  s = ut + ½at²,  F = ma',
      minutes: 30,
      prereqs: [],
      quiz: [
        {
          prompt: 'A body starts from rest and accelerates at 4 m/s² for 5 s. Find its final velocity.',
          options: ['9 m/s', '16 m/s', '20 m/s', '25 m/s'],
          correctIndex: 2,
          explanation: 'v = u + at = 0 + 4 × 5 = 20 m/s.',
        },
        {
          prompt: 'What is the SI unit of linear momentum?',
          options: ['kg·m/s²', 'kg·m/s', 'N·m', 'J/s'],
          correctIndex: 1,
          explanation: 'Momentum p = m × v, measured in kg·m/s.',
        },
      ],
    },
    {
      slug: 'gravitation-work-energy-9',
      title: 'Gravitation, Work & Mechanical Energy',
      chapter: 'Ch 4',
      summary: 'Use universal gravitation, Archimedes’ buoyancy principle, kinetic/potential energy, and power.',
      formula: 'KE = ½mv²,  PE = mgh',
      minutes: 28,
      prereqs: ['kinematics-laws-9'],
      quiz: [
        {
          prompt: 'If the distance between two masses is doubled, the gravitational force becomes:',
          options: ['Twice', 'Half', 'One-fourth', 'Four times'],
          correctIndex: 2,
          explanation: 'Gravitational force is inversely proportional to r², so (1/2)² = 1/4.',
        },
        {
          prompt: 'Calculate the kinetic energy of a 4 kg object moving at 5 m/s.',
          options: ['10 J', '20 J', '50 J', '100 J'],
          correctIndex: 2,
          explanation: 'KE = ½ × 4 × 5² = 2 × 25 = 50 J.',
        },
      ],
    },
    {
      slug: 'tissues-cell-9',
      title: 'Cell Organelles & Plant/Animal Tissues',
      chapter: 'Ch 5',
      summary: 'Differentiate prokaryotic vs. eukaryotic cells, mitosis/meiosis, and meristematic vs. permanent tissues.',
      minutes: 24,
      prereqs: ['matter-atoms-molecules-9'],
      quiz: [
        {
          prompt: 'Which organelle synthesizes ATP and is termed the powerhouse of the cell?',
          options: ['Golgi apparatus', 'Mitochondria', 'Lysosome', 'Ribosome'],
          correctIndex: 1,
          explanation: 'Mitochondria carry out cellular respiration to produce ATP.',
        },
        {
          prompt: 'Which plant tissue provides flexibility to young stems without breaking?',
          options: ['Sclerenchyma', 'Collenchyma', 'Xylem', 'Cork'],
          correctIndex: 1,
          explanation: 'Collenchyma cells have corner-thickened living walls conferring mechanical flexibility.',
        },
      ],
    },
  ],
  10: [
    {
      slug: 'chemical-reactions-10',
      title: 'Chemical Reactions, Acids & Salts',
      chapter: 'Ch 1',
      summary: 'Balance redox, displacement, and double-displacement equations and understand pH scale reactions.',
      formula: 'pH = -log₁₀[H⁺]',
      minutes: 26,
      prereqs: [],
      quiz: [
        {
          prompt: 'When zinc reacts with dilute H₂SO₄, which gas is evolved?',
          options: ['Oxygen', 'Hydrogen', 'Sulphur dioxide', 'Chlorine'],
          correctIndex: 1,
          explanation: 'Zn + H₂SO₄ → ZnSO₄ + H₂↑.',
        },
        {
          prompt: 'What is the chemical formula of Plaster of Paris?',
          options: ['CaSO₄ · 2H₂O', 'CaSO₄ · ½H₂O', 'CaCO₃', 'CaOCl₂'],
          correctIndex: 1,
          explanation: 'Calcium sulphate hemihydrate (CaSO₄ · ½H₂O) is Plaster of Paris.',
        },
      ],
    },
    {
      slug: 'carbon-compounds-periodic-10',
      title: 'Carbon Compounds & Functional Groups',
      chapter: 'Ch 2',
      summary: 'Name homologous series (alkanes, alkenes, alcohols, carboxylic acids) and analyze esterification.',
      formula: 'CₙH₂ₙ₊₂ (Alkanes)',
      minutes: 28,
      prereqs: ['chemical-reactions-10'],
      quiz: [
        {
          prompt: 'How many covalent bonds are present in a molecule of ethane (C₂H₆)?',
          options: ['6', '7', '8', '5'],
          correctIndex: 1,
          explanation: 'One C–C single bond plus six C–H single bonds gives 7 covalent bonds.',
        },
        {
          prompt: 'Which functional group characterizes carboxylic acids?',
          options: ['-OH', '-CHO', '-COOH', '-CO-'],
          correctIndex: 2,
          explanation: 'Carboxylic acids contain the -COOH group.',
        },
      ],
    },
    {
      slug: 'life-processes-heredity-10',
      title: 'Life Processes, Control & Heredity',
      chapter: 'Ch 3',
      summary: 'Map nephron filtration, reflex arcs, hormone regulation, and Mendelian monohybrid/dihybrid crosses.',
      formula: 'F₂ Phenotypic Ratio = 3 : 1 (Monohybrid)',
      minutes: 30,
      prereqs: [],
      quiz: [
        {
          prompt: 'What is the structural and functional filtration unit of the human kidney?',
          options: ['Neuron', 'Nephron', 'Alveolus', 'Villus'],
          correctIndex: 1,
          explanation: 'Nephrons filter blood plasma and reabsorb water/nutrients to form urine.',
        },
        {
          prompt: 'In Mendel’s monohybrid cross (Tt × Tt), what fraction of offspring are short (tt)?',
          options: ['1/2', '1/4', '3/4', '1/8'],
          correctIndex: 1,
          explanation: 'Genotypes are 1 TT : 2 Tt : 1 tt, so 1/4 are recessive short.',
        },
      ],
    },
    {
      slug: 'optics-lenses-10',
      title: 'Refraction, Lenses & Human Eye',
      chapter: 'Ch 4',
      summary: 'Apply lens formula, magnification, Snell’s law, and myopia/hypermetropia corrective lenses.',
      formula: '1/f = 1/v - 1/u,  P = 1/f (in meters)',
      minutes: 28,
      prereqs: [],
      quiz: [
        {
          prompt: 'What is the power of a convex lens with focal length +25 cm?',
          options: ['+2 D', '+4 D', '-4 D', '+0.25 D'],
          correctIndex: 1,
          explanation: 'P = 1 / 0.25 m = +4 Dioptres.',
        },
        {
          prompt: 'Myopia (short-sightedness) is corrected using a:',
          options: ['Convex lens', 'Concave lens', 'Cylindrical lens', 'Bifocal mirror'],
          correctIndex: 1,
          explanation: 'A diverging concave lens shifts the focal point back onto the retina.',
        },
      ],
    },
    {
      slug: 'electricity-magnetism-10',
      title: 'Ohm’s Law, Circuits & Electromagnetism',
      chapter: 'Ch 5',
      summary: 'Compute series/parallel equivalent resistance, Joule heating, and Fleming’s left/right-hand rules.',
      formula: 'V = IR,  P = VI = I²R',
      minutes: 30,
      prereqs: ['optics-lenses-10'],
      quiz: [
        {
          prompt: 'Two 6 Ω resistors connected in parallel have an equivalent resistance of:',
          options: ['12 Ω', '6 Ω', '3 Ω', '1.5 Ω'],
          correctIndex: 2,
          explanation: '1/R = 1/6 + 1/6 = 2/6 ⇒ R = 3 Ω.',
        },
        {
          prompt: 'How much charge flows through a wire carrying 2 A current for 30 seconds?',
          options: ['15 C', '32 C', '60 C', '120 C'],
          correctIndex: 2,
          explanation: 'Q = I × t = 2 × 30 = 60 Coulombs.',
        },
      ],
    },
  ],
};

function buildCoursesAndConcepts(): { courses: Course[]; concepts: Concept[] } {
  const courses: Course[] = [];
  const concepts: Concept[] = [];
  const grades: Grade[] = [5, 6, 7, 8, 9, 10];
  const boards: Board[] = ['CBSE', 'SSC'];
  const subjects: Subject[] = ['Mathematics', 'Science'];

  for (const grade of grades) {
    for (const board of boards) {
      for (const subject of subjects) {
        const courseId = `${board.toLowerCase()}-${grade}-${subject.toLowerCase().slice(0, 4)}`;
        const prefix = `${board} Class ${grade}`;
        courses.push({
          id: courseId,
          title: `${prefix} ${subject}`,
          grade,
          board,
          subject,
          description:
            board === 'CBSE'
              ? `NCERT-aligned ${subject} prerequisite map for Class ${grade} CBSE learners.`
              : `State Board (SSC) ${subject} mastery path for Class ${grade} students.`,
        });

        const blueprint =
          subject === 'Mathematics' ? MATH_CURRICULA[grade] : SCIENCE_CURRICULA[grade];

        // Add subtle board-tailored chapter numbering / focus while keeping rich curriculum
        blueprint.forEach((topic, idx) => {
          const conceptId = `${courseId}-${topic.slug}`;
          const boardTag = board === 'SSC' ? `SSC Unit ${idx + 1}` : topic.chapter;
          concepts.push({
            id: conceptId,
            courseId,
            title: topic.title,
            chapter: boardTag,
            summary: topic.summary,
            formula: topic.formula,
            estimatedMinutes: topic.minutes,
            prerequisites: topic.prereqs.map((slug) => `${courseId}-${slug}`),
            quiz: topic.quiz.map((q, qIdx) => ({
              id: `${conceptId}-q${qIdx + 1}`,
              ...q,
            })),
          });
        });
      }
    }
  }

  return { courses, concepts };
}

export function createInitialDatabaseState(): DatabaseState {
  const { courses, concepts } = buildCoursesAndConcepts();

  const users: UserProfile[] = [
    {
      id: 'student-aarav',
      name: 'Aarav Sharma',
      role: 'student',
      grade: 8,
      board: 'CBSE',
    },
    {
      id: 'student-diya',
      name: 'Diya Reddy',
      role: 'student',
      grade: 10,
      board: 'SSC',
    },
    {
      id: 'teacher-meera',
      name: 'Meera Nair',
      role: 'teacher',
      grade: 8,
      board: 'CBSE',
    },
  ];

  // Seed realistic baseline mastery for demo learners so shortest paths are immediately vivid
  const progressByUser: Record<string, string[]> = {
    'student-aarav': [
      'cbse-8-math-squares-roots-8',
      'cbse-8-math-algebraic-identities-8',
      'cbse-8-scie-microorganisms-cells-8',
    ],
    'student-diya': [
      'ssc-10-math-real-numbers-euclid-10',
      'ssc-10-math-coordinate-geometry-10',
      'ssc-10-scie-chemical-reactions-10',
      'ssc-10-scie-optics-lenses-10',
    ],
    'teacher-meera': [],
  };

  return {
    users,
    courses,
    concepts,
    progressByUser,
    quizAttempts: [],
    studyHistory: [],
  };
}
