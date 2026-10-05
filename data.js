/**
 * Core Data Store
 * Academic syllabus and timetable for CSE Semester 3 (2024 Scheme).
 * No placeholder or mock entities.
 */

const DEFAULT_SUBJECTS = [
  {
    id: "sub-math3",
    code: "24MAT31",
    name: "Mathematics III for IT Stream",
    faculty: "Dr. Padma Priya P",
    credits: 4,
    type: "Theory",
    classroomLink: "https://classroom.google.com"
  },
  {
    id: "sub-ds",
    code: "24CS32",
    name: "Data Structures",
    faculty: "Manasvi J. Maasthi",
    credits: 4,
    type: "Theory",
    classroomLink: "https://classroom.google.com"
  },
  {
    id: "sub-os",
    code: "24CS33",
    name: "Operating System",
    faculty: "Aishwarya T",
    credits: 4,
    type: "Theory",
    classroomLink: "https://classroom.google.com"
  },
  {
    id: "sub-co",
    code: "24CS34",
    name: "Computer Organization",
    faculty: "R. Eswin Priya Angel",
    credits: 3,
    type: "Theory",
    classroomLink: "https://classroom.google.com"
  },
  {
    id: "sub-dslab",
    code: "24CSL35",
    name: "Data Structures Lab",
    faculty: "Manasvi J. Maasthi",
    credits: 1.5,
    type: "Lab",
    classroomLink: "https://classroom.google.com"
  },
  {
    id: "sub-iotlab",
    code: "24CSL36",
    name: "Embedded IoT Lab",
    faculty: "Apoorva M. S",
    credits: 1.5,
    type: "Lab",
    classroomLink: "https://classroom.google.com"
  },
  {
    id: "sub-java",
    code: "24CS37",
    name: "Object-Oriented Programming with Java",
    faculty: "Dr. Paramesha K",
    credits: 3,
    type: "Theory",
    classroomLink: "https://classroom.google.com"
  },
  {
    id: "sub-uhv",
    code: "24UHV38",
    name: "Universal Human Values",
    faculty: "Manjunatha G. B",
    credits: 1,
    type: "Seminar",
    classroomLink: "https://classroom.google.com"
  }
];

const DEFAULT_TIMETABLE = [
  { 
    day: "Monday", 
    slots: [
      { time: "09:00 – 10:00", subject: "Mathematics III", faculty: "Dr. Padma Priya P", type: "Lecture" },
      { time: "10:00 – 11:00", subject: "Data Structures", faculty: "Manasvi J. Maasthi", type: "Lecture" },
      { time: "11:15 – 12:15", subject: "Operating System", faculty: "Aishwarya T", type: "Lecture" },
      { time: "12:15 – 13:15", subject: "Computer Organization", faculty: "R. Eswin Priya Angel", type: "Lecture" },
      { time: "13:15 – 14:00", subject: "Lunch Break", faculty: "", type: "Break" },
      { time: "14:00 – 16:30", subject: "Data Structures Lab", faculty: "Manasvi J. Maasthi", type: "Lab" }
    ]
  },
  { 
    day: "Tuesday", 
    slots: [
      { time: "09:00 – 10:00", subject: "Operating System", faculty: "Aishwarya T", type: "Lecture" },
      { time: "10:00 – 11:00", subject: "OOP with Java", faculty: "Dr. Paramesha K", type: "Lecture" },
      { time: "11:15 – 12:15", subject: "Mathematics III", faculty: "Dr. Padma Priya P", type: "Lecture" },
      { time: "12:15 – 13:15", subject: "Universal Human Values", faculty: "Manjunatha G. B", type: "Lecture" },
      { time: "13:15 – 14:00", subject: "Lunch Break", faculty: "", type: "Break" },
      { time: "14:00 – 16:30", subject: "Embedded IoT Lab", faculty: "Apoorva M. S", type: "Lab" }
    ]
  },
  { 
    day: "Wednesday", 
    slots: [
      { time: "09:00 – 10:00", subject: "Computer Organization", faculty: "R. Eswin Priya Angel", type: "Lecture" },
      { time: "10:00 – 11:00", subject: "Data Structures", faculty: "Manasvi J. Maasthi", type: "Lecture" },
      { time: "11:15 – 12:15", subject: "OOP with Java", faculty: "Dr. Paramesha K", type: "Lecture" },
      { time: "12:15 – 13:15", subject: "Mathematics III", faculty: "Dr. Padma Priya P", type: "Lecture" },
      { time: "13:15 – 14:00", subject: "Lunch Break", faculty: "", type: "Break" },
      { time: "14:00 – 16:30", subject: "Department Office / Tutorial", faculty: "", type: "Session" }
    ]
  },
  { 
    day: "Thursday", 
    slots: [
      { time: "09:00 – 10:00", subject: "Data Structures", faculty: "Manasvi J. Maasthi", type: "Lecture" },
      { time: "10:00 – 11:00", subject: "Operating System", faculty: "Aishwarya T", type: "Lecture" },
      { time: "11:15 – 12:15", subject: "Computer Organization", faculty: "R. Eswin Priya Angel", type: "Lecture" },
      { time: "12:15 – 13:15", subject: "OOP with Java", faculty: "Dr. Paramesha K", type: "Lecture" },
      { time: "13:15 – 14:00", subject: "Lunch Break", faculty: "", type: "Break" },
      { time: "14:00 – 16:30", subject: "Project Lab", faculty: "Department", type: "Lab" }
    ]
  },
  { 
    day: "Friday", 
    slots: [
      { time: "09:00 – 10:00", subject: "Mathematics III", faculty: "Dr. Padma Priya P", type: "Lecture" },
      { time: "10:00 – 11:00", subject: "Universal Human Values", faculty: "Manjunatha G. B", type: "Lecture" },
      { time: "11:15 – 12:15", subject: "Operating System", faculty: "Aishwarya T", type: "Lecture" },
      { time: "12:15 – 13:15", subject: "Data Structures", faculty: "Manasvi J. Maasthi", type: "Lecture" },
      { time: "13:15 – 14:00", subject: "Lunch Break", faculty: "", type: "Break" },
      { time: "14:00 – 16:30", subject: "Association & Forum Activities", faculty: "CSE Forum", type: "Forum" }
    ]
  }
];

// Initial user tasks (zero fake tasks; user captures genuine priorities)
const DEFAULT_TASKS = [];

// Business leads (empty state by default; populated by user entry)
const DEFAULT_LEADS = [];

// Content creator pipeline (empty state by default)
const DEFAULT_CONTENT = [];

// Class representative dispute log (empty state by default)
const DEFAULT_CR_DISPUTES = [];
