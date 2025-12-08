export interface JobOffer {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  contractType: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  status: string;
  publishedBy: string;
  publishedDate: string | Date; 
  closingDate: string | Date; 
  createdAt: string | Date;
  updatedAt: string | Date;
  linkedInPostId?: string;
  externalPlatforms: string[];
  applicationCount: number;
  viewCount: number;
  tags: string[];
  experienceLevel: string;
  educationRequired: string;
  isActive: boolean;
}

export interface JobOfferRequest {
  title: string;
  description: string;
  department: string;
  location: string;
  contractType: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  closingDate: Date;
  tags: string[];
  experienceLevel: string;
  educationRequired: string;
  publishToLinkedIn?: boolean;
  publishToIndeed?: boolean;
}