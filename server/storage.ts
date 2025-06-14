import { users, videos, type User, type InsertUser, type Video, type InsertVideo } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCredits(id: number, credits: number): Promise<User | undefined>;
  
  createVideo(video: InsertVideo): Promise<Video>;
  getVideo(id: number): Promise<Video | undefined>;
  getUserVideos(userId: number): Promise<Video[]>;
  updateVideo(id: number, updates: Partial<Video>): Promise<Video | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private videos: Map<number, Video>;
  private currentUserId: number;
  private currentVideoId: number;

  constructor() {
    this.users = new Map();
    this.videos = new Map();
    this.currentUserId = 1;
    this.currentVideoId = 1;
    
    // Create demo user for testing
    this.createDemoUser();
  }

  private createDemoUser() {
    const demoUser: User = {
      id: 1,
      firebaseUid: "demo-user",
      email: "demo@test.com",
      name: "Demo User",
      credits: 100, // Lots of credits for testing
      createdAt: new Date()
    };
    this.users.set(1, demoUser);
    this.currentUserId = 2; // Next user will have ID 2
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseUid === firebaseUid,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      credits: insertUser.credits ?? 3,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserCredits(id: number, credits: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, credits };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = this.currentVideoId++;
    const video: Video = {
      id,
      userId: insertVideo.userId,
      topic: insertVideo.topic,
      script: insertVideo.script ?? null,
      status: insertVideo.status ?? "pending",
      duration: insertVideo.duration ?? null,
      audioUrl: insertVideo.audioUrl ?? null,
      videoUrl: insertVideo.videoUrl ?? null,
      createdAt: new Date()
    };
    this.videos.set(id, video);
    return video;
  }

  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async getUserVideos(userId: number): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(
      (video) => video.userId === userId
    );
  }

  async updateVideo(id: number, updates: Partial<Video>): Promise<Video | undefined> {
    const video = this.videos.get(id);
    if (!video) return undefined;
    
    const updatedVideo = { ...video, ...updates };
    this.videos.set(id, updatedVideo);
    return updatedVideo;
  }
}

export const storage = new MemStorage();
