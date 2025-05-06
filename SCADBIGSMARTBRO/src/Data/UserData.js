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
      verified: true
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
      verified: true
    },
    {
      id: 3,
      name: "MediCare Solutions",
      email: "contact@medicare.com",
      password: "123456",
      industry: "Healthcare",
      companySize: "medium",
      location: "Giza, Egypt",
      description: "Healthcare technology provider focusing on patient management systems.",
      website: "www.medicaresolutions.com",
      verified: false
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