// User data containing information about all users in the system

export const students = [
    {
      id: 1,
      name: "Muhamed Amer",
      email: "muhamed@student.guc.edu.eg",
      password: "123456",
      gucId: "49-12345",
      faculty: "Media Engineering and Technology",
      major: "Computer Science & Engineering",
      gpa: 3.7,
      bio: "Passionate about software engineering and AI.",
      skills: "React, JavaScript, Python, Machine Learning",
      location: "Cairo, Egypt",
      pro: true
    },
    {
      id: 2,
      name: "Sarah Ahmed",
      email: "sarah@student.guc.edu.eg",
      password: "123456",
      gucId: "49-54321",
      faculty: "Management",
      major: "Business Informatics",
      gpa: 3.5,
      bio: "Interested in data analytics and business development.",
      skills: "SQL, Excel, Tableau, Data Analysis",
      location: "Alexandria, Egypt",
      pro: false
    },
    {
      id: 3,
      name: "Omar Hassan",
      email: "omar@student.guc.edu.eg",
      password: "123456",
      gucId: "49-67890",
      faculty: "Engineering",
      major: "Electronics Engineering",
      gpa: 3.8,
      bio: "Passionate about embedded systems and IoT solutions.",
      skills: "C++, Arduino, VHDL, PCB Design",
      location: "Cairo, Egypt",
      pro: true
    }
  ];
  
  export const companies = [
    {
      id: 1,
      name: "Tech Innovators",
      email: "company@company.com",
      password: "123456",
      industry: "Technology",
      companySize: "large",
      location: "Cairo, Egypt",
      description: "Leading software development company specializing in enterprise solutions.",
      website: "www.techinnovators.com",
      verified: true,
      employees: [
        {
          id: 101,
          name: "Ahmad Hassan",
          position: "Senior Software Engineer",
          department: "Engineering",
          email: "ahmad.hassan@techinnovators.com"
        },
        {
          id: 102,
          name: "Nour El-Din",
          position: "Project Manager",
          department: "Project Management",
          email: "nour@techinnovators.com"
        },
        {
          id: 103,
          name: "Fatima Ali",
          position: "HR Director",
          department: "Human Resources",
          email: "fatima@techinnovators.com"
        },
        {
          id: 104,
          name: "Omar Khalid",
          position: "CTO",
          department: "Executive",
          email: "omar@techinnovators.com"
        }
      ]
    },
    {
      id: 2,
      name: "Global Finance Corp",
      email: "info@globalfinance.com",
      password: "123456",
      industry: "Finance",
      companySize: "corporate",
      location: "Alexandria, Egypt",
      description: "International financial services provider with focus on emerging markets.",
      website: "www.globalfinance.com",
      verified: true,
      employees: [
        {
          id: 201,
          name: "Sara Mohamed",
          position: "Financial Analyst",
          department: "Finance",
          email: "sara@globalfinance.com"
        },
        {
          id: 202,
          name: "Karim Ahmed",
          position: "Investment Manager",
          department: "Investments",
          email: "karim@globalfinance.com"
        },
        {
          id: 203,
          name: "Laila Mahmoud",
          position: "HR Manager",
          department: "Human Resources",
          email: "laila@globalfinance.com"
        },
        {
          id: 204,
          name: "Tarek Hussein",
          position: "CFO",
          department: "Executive",
          email: "tarek@globalfinance.com"
        }
      ]
    },    {
      id: 3,
      name: "MediCare Solutions",
      email: "contact@medicare.com",
      password: "123456",
      industry: "Healthcare",
      companySize: "medium",
      location: "Giza, Egypt",
      description: "Healthcare technology provider focusing on patient management systems.",
      website: "www.medicaresolutions.com",
      verified: false,
      employees: [
        {
          id: 301,
          name: "Hoda Nabil",
          position: "Medical Systems Developer",
          department: "Engineering",
          email: "hoda@medicare.com"
        },
        {
          id: 302,
          name: "Amir Safwat",
          position: "Healthcare Specialist",
          department: "Healthcare",
          email: "amir@medicare.com"
        },
        {
          id: 303,
          name: "Dina Fouad",
          position: "HR Coordinator",
          department: "Human Resources",
          email: "dina@medicare.com"
        },
        {
          id: 304,
          name: "Mohamed Samir",
          position: "CTO",
          department: "Executive",
          email: "mohamed@medicare.com"
        }
      ]
    }
  ];
  
  export const scadMembers = [
    {
      id: 1,
      name: "Dr. Ahmed Mahmoud",
      email: "scad@guc.edu.eg",
      password: "123456",
      position: "Head of SCAD",
      department: "Career Services",
      office: "C7.203"
    }
  ];
  
  export const facultyAcademics = [
    {
      id: 1,
      name: "Dr. Mohamed Ibrahim",
      email: "faculty@uni.edu",
      password: "123456",
      department: "Computer Science",
      position: "Associate Professor",
      office: "B1.102",
      research: "Machine Learning, Data Mining"
    },
    {
      id: 2,
      name: "Dr. Laila Hossam",
      email: "laila@uni.edu",
      password: "123456",
      department: "Electronics Engineering",
      position: "Professor",
      office: "B3.210",
      research: "Embedded Systems, VLSI Design"
    }
  ];
  
  // Function to find a user by email and password
  export const findUserByCredentials = (email, password, role) => {
    let user = null;
    
    switch(role) {
      case 'student':
        user = students.find(s => s.email === email && s.password === password);
        break;
      case 'company':
        user = companies.find(c => c.email === email && c.password === password);
        break;
      case 'scad':
        user = scadMembers.find(s => s.email === email && s.password === password);
        break;
      case 'faculty':
        user = facultyAcademics.find(f => f.email === email && f.password === password);
        break;
      default:
        return null;
    }
    
    return user;
  };
    // Course lists based on majors
  export const coursesByMajor = {
    "Computer Science & Engineering": [
      { id: 1, code: "CSEN 401", name: "Computer Programming Lab" },
      { id: 2, code: "CSEN 403", name: "Database Systems" },
      { id: 3, code: "CSEN 501", name: "Advanced Computer Programming" },
      { id: 4, code: "CSEN 502", name: "Theory of Computation" },
      { id: 5, code: "CSEN 503", name: "Digital System Design" },
      { id: 6, code: "CSEN 504", name: "Computer Architecture" },
      { id: 7, code: "CSEN 601", name: "Computer Networks" },
      { id: 8, code: "CSEN 602", name: "Software Engineering" },
      { id: 9, code: "CSEN 603", name: "Parallel Computing" },
      { id: 10, code: "CSEN 604", name: "Advanced Algorithms" },
      { id: 11, code: "CSEN 605", name: "Operating Systems" },
      { id: 12, code: "CSEN 606", name: "Computer Graphics" },
      { id: 13, code: "CSEN 701", name: "Embedded Systems" },
      { id: 14, code: "CSEN 702", name: "Microprocessors" },
      { id: 15, code: "CSEN 703", name: "Analysis and Design of Algorithms" },
      { id: 16, code: "CSEN 704", name: "Advanced Software Engineering" },
      { id: 17, code: "CSEN 705", name: "Distributed Systems" },
      { id: 18, code: "CSEN 706", name: "Machine Learning" }
    ],
    "Business Informatics": [
      { id: 1, code: "BINF 301", name: "Introduction to Business Informatics" },
      { id: 2, code: "BINF 302", name: "Management Information Systems" },
      { id: 3, code: "BINF 401", name: "Business Process Management" },
      { id: 4, code: "BINF 402", name: "Business Intelligence" },
      { id: 5, code: "BINF 403", name: "IT Project Management" },
      { id: 6, code: "BINF 501", name: "Enterprise Resource Planning" },
      { id: 7, code: "BINF 502", name: "Knowledge Management" },
      { id: 8, code: "BINF 503", name: "Supply Chain Management" },
      { id: 9, code: "BINF 601", name: "IT Governance" },
      { id: 10, code: "BINF 602", name: "Big Data Analytics" }
    ],
    "Electronics Engineering": [
      { id: 1, code: "ELCT 301", name: "Circuit Analysis" },
      { id: 2, code: "ELCT 302", name: "Digital Logic Design" },
      { id: 3, code: "ELCT 401", name: "Electronics I" },
      { id: 4, code: "ELCT 402", name: "Signals & Systems" },
      { id: 5, code: "ELCT 501", name: "Electronics II" },
      { id: 6, code: "ELCT 502", name: "Control Systems" },
      { id: 7, code: "ELCT 503", name: "Embedded Systems" },
      { id: 8, code: "ELCT 601", name: "Digital Signal Processing" },
      { id: 9, code: "ELCT 602", name: "VLSI Design" },
      { id: 10, code: "ELCT 603", name: "Communication Systems" }
    ]
  };