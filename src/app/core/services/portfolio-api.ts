import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../environments/environment.prod';

export interface Project {
  id: number;
  caseId: string;
  title: string;
  description: string;
  detailedDescription: string;
  status: string;
  techStack: string;
  repoUrl: string;
  sortOrder: number;
  resultLine: string;
  liveUrl: string;
}

// export interface ExperienceEntry {
//   id: number;
//   dateRange: string;
//   title: string;
//   description: string;
// }

export interface Experience {
  id: number;
  dateRange: string;
  title: string;
  description: string;
  category: string;       // 'experience' | 'education' | 'certification'
  organization: string;
  details: string;        // bullet points separated by new lines
  techStack: string;      // comma-separated
  startDate: string;
}

export interface Skill {
  id: number;
  category: string;
  name: string;
  proficiency: number;
  icon: string;
}

export interface ContactRequest {
  name: string;
  email: string;
  message: string;
}

@Service()
export class PortfolioApi {
    private http = inject(HttpClient);
    // private baseUrl = 'http://localhost:5089/api';
    private baseUrl = environment.apiUrl;

  getProjects() {
    return this.http.get<Project[]>(`${this.baseUrl}/Projects`);
  }

  getExperience() {
    return this.http.get<Experience[]>(`${this.baseUrl}/Experience`);
  }

  getSkills() {
    return this.http.get<Skill[]>(`${this.baseUrl}/Skills`);
  }
  
  submitContact(payload: ContactRequest) {
    return this.http.post<{ success: boolean }>(`${this.baseUrl}/Contact`, payload);
  }
  
}
