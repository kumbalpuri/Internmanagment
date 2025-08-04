// Resume processing service for Jerry AI
export interface ResumeData {
  id: string;
  fileName: string;
  content: string;
  extractedData: {
    name: string;
    email: string;
    phone: string;
    education: string[];
    experience: string[];
    skills: string[];
    projects: string[];
    achievements: string[];
  };
  uploadedAt: string;
}

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  requirements: string[];
  skills: string[];
  description: string;
}

class ResumeService {
  private resumes = new Map<string, ResumeData>();

  // Upload and process resume
  async uploadResume(file: File): Promise<ResumeData> {
    try {
      const content = await this.extractTextFromFile(file);
      const extractedData = await this.extractResumeData(content);
      
      const resumeData: ResumeData = {
        id: `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fileName: file.name,
        content,
        extractedData,
        uploadedAt: new Date().toISOString()
      };

      this.resumes.set(resumeData.id, resumeData);
      return resumeData;
    } catch (error) {
      console.error('Resume upload failed:', error);
      throw new Error('Failed to process resume. Please ensure it\'s a valid PDF or text file.');
    }
  }

  // Extract text from file
  private async extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (file.type === 'application/pdf') {
          // For PDF files, we'll simulate text extraction
          // In production, you'd use a PDF parsing library
          resolve(this.simulatePDFExtraction(file.name));
        } else {
          resolve(content);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      if (file.type === 'application/pdf') {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  }

  // Simulate PDF text extraction (in production, use proper PDF parser)
  private simulatePDFExtraction(fileName: string): string {
    return `
      John Doe
      Software Engineer
      Email: john.doe@email.com
      Phone: +91-9876543210
      
      EDUCATION:
      - B.Tech Computer Science, IIT Delhi (2020-2024)
      - CGPA: 8.5/10
      
      EXPERIENCE:
      - Software Development Intern at TechCorp (Summer 2023)
        * Developed REST APIs using Node.js and Express
        * Worked with React.js for frontend development
        * Collaborated with team of 5 developers
      
      SKILLS:
      - Programming: JavaScript, Python, Java, C++
      - Web Technologies: React.js, Node.js, Express.js, HTML, CSS
      - Databases: MongoDB, MySQL, PostgreSQL
      - Tools: Git, Docker, AWS, Postman
      
      PROJECTS:
      - E-commerce Web Application
        * Built full-stack application using MERN stack
        * Implemented user authentication and payment gateway
        * Deployed on AWS with CI/CD pipeline
      
      - Machine Learning Price Predictor
        * Developed ML model using Python and scikit-learn
        * Achieved 85% accuracy in price prediction
        * Created web interface using Flask
      
      ACHIEVEMENTS:
      - Winner of college hackathon 2023
      - Published research paper on AI applications
      - Active contributor to open source projects
    `;
  }

  // Extract structured data from resume content
  private async extractResumeData(content: string): Promise<ResumeData['extractedData']> {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    
    return {
      name: this.extractName(lines),
      email: this.extractEmail(content),
      phone: this.extractPhone(content),
      education: this.extractEducation(lines),
      experience: this.extractExperience(lines),
      skills: this.extractSkills(lines),
      projects: this.extractProjects(lines),
      achievements: this.extractAchievements(lines)
    };
  }

  private extractName(lines: string[]): string {
    // First non-empty line is usually the name
    return lines[0] || 'Unknown';
  }

  private extractEmail(content: string): string {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const match = content.match(emailRegex);
    return match ? match[0] : '';
  }

  private extractPhone(content: string): string {
    const phoneRegex = /[\+]?[1-9]?[\d\s\-\(\)]{10,}/;
    const match = content.match(phoneRegex);
    return match ? match[0].trim() : '';
  }

  private extractEducation(lines: string[]): string[] {
    const education: string[] = [];
    let inEducationSection = false;
    
    for (const line of lines) {
      if (line.toUpperCase().includes('EDUCATION')) {
        inEducationSection = true;
        continue;
      }
      if (inEducationSection && (line.toUpperCase().includes('EXPERIENCE') || line.toUpperCase().includes('SKILLS'))) {
        break;
      }
      if (inEducationSection && line.includes('-')) {
        education.push(line.replace('-', '').trim());
      }
    }
    
    return education;
  }

  private extractExperience(lines: string[]): string[] {
    const experience: string[] = [];
    let inExperienceSection = false;
    
    for (const line of lines) {
      if (line.toUpperCase().includes('EXPERIENCE')) {
        inExperienceSection = true;
        continue;
      }
      if (inExperienceSection && (line.toUpperCase().includes('SKILLS') || line.toUpperCase().includes('PROJECTS'))) {
        break;
      }
      if (inExperienceSection && line.includes('-')) {
        experience.push(line.replace('-', '').trim());
      }
    }
    
    return experience;
  }

  private extractSkills(lines: string[]): string[] {
    const skills: string[] = [];
    let inSkillsSection = false;
    
    for (const line of lines) {
      if (line.toUpperCase().includes('SKILLS')) {
        inSkillsSection = true;
        continue;
      }
      if (inSkillsSection && (line.toUpperCase().includes('PROJECTS') || line.toUpperCase().includes('ACHIEVEMENTS'))) {
        break;
      }
      if (inSkillsSection && line.includes(':')) {
        const skillsText = line.split(':')[1];
        if (skillsText) {
          skills.push(...skillsText.split(',').map(s => s.trim()));
        }
      }
    }
    
    return skills;
  }

  private extractProjects(lines: string[]): string[] {
    const projects: string[] = [];
    let inProjectsSection = false;
    
    for (const line of lines) {
      if (line.toUpperCase().includes('PROJECTS')) {
        inProjectsSection = true;
        continue;
      }
      if (inProjectsSection && line.toUpperCase().includes('ACHIEVEMENTS')) {
        break;
      }
      if (inProjectsSection && line.includes('-') && !line.includes('*')) {
        projects.push(line.replace('-', '').trim());
      }
    }
    
    return projects;
  }

  private extractAchievements(lines: string[]): string[] {
    const achievements: string[] = [];
    let inAchievementsSection = false;
    
    for (const line of lines) {
      if (line.toUpperCase().includes('ACHIEVEMENTS')) {
        inAchievementsSection = true;
        continue;
      }
      if (inAchievementsSection && line.includes('-')) {
        achievements.push(line.replace('-', '').trim());
      }
    }
    
    return achievements;
  }

  // Get resume by ID
  getResume(id: string): ResumeData | undefined {
    return this.resumes.get(id);
  }

  // Get all resumes
  getAllResumes(): ResumeData[] {
    return Array.from(this.resumes.values());
  }

  // Generate interview questions based on resume and JD
  generateInterviewQuestions(resume: ResumeData, jobDescription: JobDescription): string[] {
    const questions: string[] = [];
    
    // Technical questions based on skills
    const commonSkills = resume.extractedData.skills.filter(skill => 
      jobDescription.skills.some(jdSkill => 
        skill.toLowerCase().includes(jdSkill.toLowerCase()) || 
        jdSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );

    if (commonSkills.length > 0) {
      questions.push(`I see you have experience with ${commonSkills.slice(0, 2).join(' and ')}. Can you tell me about a specific project where you used these technologies?`);
    }

    // Experience-based questions
    if (resume.extractedData.experience.length > 0) {
      questions.push(`Tell me about your experience at ${resume.extractedData.experience[0].split(' ')[0]}. What were your key responsibilities?`);
    }

    // Project-based questions
    if (resume.extractedData.projects.length > 0) {
      questions.push(`I noticed you worked on ${resume.extractedData.projects[0]}. What challenges did you face and how did you overcome them?`);
    }

    // Job-specific questions
    questions.push(`This role requires ${jobDescription.requirements[0]}. How does your background align with this requirement?`);
    
    // Problem-solving question
    questions.push(`Can you walk me through your approach to solving complex technical problems?`);

    // Motivation question
    questions.push(`What interests you most about this ${jobDescription.title} position at ${jobDescription.company}?`);

    return questions;
  }
}

export const resumeService = new ResumeService();