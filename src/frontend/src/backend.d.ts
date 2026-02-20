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
export interface EmergencyLookupResult {
    sosSnapshot?: SOSSnapshot;
    userName?: string;
    emergencyProfile?: EmergencyProfile;
}
export interface SOSSnapshot {
    latitude: number;
    user: Principal;
    longitude: number;
    timestamp: Time;
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
export interface UserProfile {
    licenseProof?: ExternalBlob;
    name: string;
    idProof?: ExternalBlob;
    isVerified: boolean;
}
export interface Route {
    creator: Principal;
    destination: string;
    waypoints: Array<string>;
    start: string;
    notes?: string;
    dateTime: Time;
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
    createUserProfile(name: string): Promise<void>;
    deactivateMeetupLocation(): Promise<void>;
    emergencyLookup(user: Principal, accessCode: string): Promise<EmergencyLookupResult>;
    getAllActiveMeetupLocations(): Promise<Array<MeetupLocation>>;
    getAllAvailableMeetupLocations(): Promise<Array<MeetupLocation>>;
    getAllLatestSOSLocations(): Promise<Array<SOSSnapshot>>;
    getAllUserProfiles(): Promise<Array<[Principal, UserProfile]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLatestMeetupLocation(user: Principal): Promise<MeetupLocation | null>;
    getLatestSOSLocation(user: Principal): Promise<SOSSnapshot | null>;
    getMeetupLocation(user: Principal): Promise<MeetupLocation | null>;
    getRoutes(user: Principal): Promise<Array<Route>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    requestAdminAccess(): Promise<void>;
    reviewVerification(user: Principal, approved: boolean): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchPlaces(category: PlaceCategory | null): Promise<Array<Place>>;
    shareMeetupLocation(locationInput: MeetupLocationInput): Promise<void>;
    updateMeetupLocation(locationInput: MeetupLocationInput): Promise<void>;
    uploadVerification(licenseProof: ExternalBlob | null, idProof: ExternalBlob | null): Promise<void>;
}
