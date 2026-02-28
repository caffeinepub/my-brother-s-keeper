import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface MeetupLocationInput {
    latitude: number;
    name: string;
    longitude: number;
}
export interface EmergencyProfile {
    accessCode: string;
    healthConditions: string;
    nextOfKin: string;
}
export type Time = bigint;
export type PromoteToAdminResult = {
    __kind__: "accountAlreadyAdmin";
    accountAlreadyAdmin: null;
} | {
    __kind__: "success";
    success: string;
} | {
    __kind__: "invalidToken";
    invalidToken: null;
} | {
    __kind__: "tokenExpired";
    tokenExpired: null;
};
export interface MemberSummary {
    userId: Principal;
    name: string;
    isVerified: boolean;
    registrationTime: Time;
}
export interface SOSSnapshot {
    latitude: number;
    user: Principal;
    longitude: number;
    timestamp: Time;
}
export interface EmergencyLookupResult {
    sosSnapshot?: SOSSnapshot;
    userName?: string;
    emergencyProfile?: EmergencyProfile;
}
export interface ActivityLogEntry {
    description: string;
    timestamp: Time;
    initiatedBy: Principal;
    eventType: EventType;
}
export interface Place {
    name: string;
    submittedBy: Principal;
    description: string;
    category: PlaceCategory;
    location: string;
}
export interface MeetupLocation {
    latitude: number;
    name: string;
    user: Principal;
    isActive: boolean;
    longitude: number;
    timestamp: Time;
}
export interface UserAccountDetails {
    recentRoutes: Array<Route>;
    emergencyProfile?: EmergencyProfile;
    accountCreated: Time;
    activityLog: Array<ActivityLogEntry>;
    placesAdded: Array<Place>;
    lastLocations: Array<MeetupLocation>;
    profile: UserProfile;
}
export interface UserProfile {
    licenseProof?: ExternalBlob;
    name: string;
    idProof?: ExternalBlob;
    isVerified: boolean;
    registrationTime: Time;
}
export interface Route {
    creator: Principal;
    destination: string;
    waypoints: Array<string>;
    start: string;
    notes?: string;
    dateTime: Time;
}
export enum EventType {
    sosSnapshot = "sosSnapshot",
    routeCreated = "routeCreated",
    meetupLocationUpdated = "meetupLocationUpdated",
    verificationSubmitted = "verificationSubmitted",
    meetupLocationShared = "meetupLocationShared",
    adminAction = "adminAction",
    emergencyProfileUpdated = "emergencyProfileUpdated",
    verificationReviewed = "verificationReviewed",
    userRegistration = "userRegistration",
    placeAdded = "placeAdded"
}
export enum PlaceCategory {
    gasStation = "gasStation",
    hotel = "hotel",
    shop = "shop",
    mechanic = "mechanic",
    restaurant = "restaurant"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPlace(name: string, category: PlaceCategory, description: string, location: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrUpdateEmergencyProfile(nextOfKin: string, healthConditions: string, accessCode: string): Promise<void>;
    createRoute(start: string, destination: string, waypoints: Array<string>, dateTime: Time, notes: string | null): Promise<void>;
    createSOSSnapshot(latitude: number, longitude: number): Promise<void>;
    deactivateMeetupLocation(): Promise<void>;
    emergencyLookup(user: Principal, accessCode: string): Promise<EmergencyLookupResult>;
    generateAdminToken(): Promise<string>;
    getActivityLogs(): Promise<Array<ActivityLogEntry>>;
    getAllActiveMeetupLocations(): Promise<Array<MeetupLocation>>;
    getAllAvailableMeetupLocations(): Promise<Array<MeetupLocation>>;
    getAllLatestSOSLocations(): Promise<Array<SOSSnapshot>>;
    getAllMembers(): Promise<Array<MemberSummary>>;
    getAllUserProfiles(): Promise<Array<[Principal, UserProfile]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLatestMeetupLocation(user: Principal): Promise<MeetupLocation | null>;
    getLatestSOSLocation(user: Principal): Promise<SOSSnapshot | null>;
    getMeetupLocation(user: Principal): Promise<MeetupLocation | null>;
    getRoutes(user: Principal): Promise<Array<Route>>;
    getUserAccountDetails(userId: Principal): Promise<UserAccountDetails>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    promoteToAdmin(token: string): Promise<PromoteToAdminResult>;
    reviewVerification(user: Principal, approved: boolean): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchPlaces(category: PlaceCategory | null): Promise<Array<Place>>;
    shareMeetupLocation(locationInput: MeetupLocationInput): Promise<void>;
    updateMeetupLocation(locationInput: MeetupLocationInput): Promise<void>;
    uploadVerification(licenseProof: ExternalBlob | null, idProof: ExternalBlob | null): Promise<void>;
}
