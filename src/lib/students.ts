export interface Student {
  id: string;
  name: string;
  registerNumber: string;
  email: string;
  grade: string;
  section: string;
  phone: string;
  avatar: string;
  profilePicture?: string;
}

const AVATARS = [
  "🧑‍🎓", "👩‍🎓", "👨‍🎓", "🎓", "📚", "✏️", "🎒", "🌟"
];

export const getRandomAvatar = () => AVATARS[Math.floor(Math.random() * AVATARS.length)];

export const INITIAL_STUDENTS: Student[] = [
  { id: "1", name: "Aarav Sharma", registerNumber: "001", email: "aarav@school.edu", grade: "A", section: "A", phone: "+91 98765 43210", avatar: "🧑‍🎓" },
  { id: "2", name: "Priya Patel", registerNumber: "002", email: "priya@school.edu", grade: "A+", section: "A", phone: "+91 98765 43211", avatar: "👩‍🎓" },
  { id: "3", name: "Rohan Gupta", registerNumber: "003", email: "rohan@school.edu", grade: "B+", section: "B", phone: "+91 98765 43212", avatar: "👨‍🎓" },
  { id: "4", name: "Ananya Singh", registerNumber: "004", email: "ananya@school.edu", grade: "A", section: "A", phone: "+91 98765 43213", avatar: "🌟" },
  { id: "5", name: "Vikram Reddy", registerNumber: "005", email: "vikram@school.edu", grade: "B", section: "B", phone: "+91 98765 43214", avatar: "🎒" },
];
