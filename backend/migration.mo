import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";

module {
  type OldActor = {
    HARDCODED_ADMIN_PRINCIPAL : Text;
    userProfiles : Map.Map<Principal, UserProfile>;
    places : Map.Map<Text, Place>;
    routes : Map.Map<Principal, List.List<Route>>;
    emergencyProfiles : Map.Map<Principal, EmergencyProfile>;
    sosSnapshots : Map.Map<Principal, SOSSnapshot>;
    meetupLocations : Map.Map<Principal, MeetupLocation>;
    activityLogs : List.List<ActivityLogEntry>;
    userActivityLogs : Map.Map<Principal, List.List<ActivityLogEntry>>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    places : Map.Map<Text, Place>;
    routes : Map.Map<Principal, List.List<Route>>;
    emergencyProfiles : Map.Map<Principal, EmergencyProfile>;
    sosSnapshots : Map.Map<Principal, SOSSnapshot>;
    meetupLocations : Map.Map<Principal, MeetupLocation>;
    activityLogs : List.List<ActivityLogEntry>;
    userActivityLogs : Map.Map<Principal, List.List<ActivityLogEntry>>;
  };

  // Type definitions reused from main actor
  type UserProfile = {
    name : Text;
    licenseProof : ?Storage.ExternalBlob;
    idProof : ?Storage.ExternalBlob;
    isVerified : Bool;
    registrationTime : Time.Time;
  };

  type Place = {
    name : Text;
    category : PlaceCategory;
    description : Text;
    location : Text;
    submittedBy : Principal;
  };

  type PlaceCategory = {
    #hotel;
    #restaurant;
    #shop;
    #gasStation;
    #mechanic;
  };

  type Route = {
    start : Text;
    destination : Text;
    waypoints : [Text];
    dateTime : Time.Time;
    notes : ?Text;
    creator : Principal;
  };

  type EmergencyProfile = {
    nextOfKin : Text;
    healthConditions : Text;
    accessCode : Text;
  };

  type SOSSnapshot = {
    timestamp : Time.Time;
    latitude : Float;
    longitude : Float;
    user : Principal;
  };

  type MeetupLocation = {
    user : Principal;
    name : Text;
    latitude : Float;
    longitude : Float;
    timestamp : Time.Time;
    isActive : Bool;
  };

  type ActivityLogEntry = {
    timestamp : Time.Time;
    eventType : EventType;
    description : Text;
    initiatedBy : Principal;
  };

  type EventType = {
    #userRegistration;
    #verificationSubmitted;
    #verificationReviewed;
    #placeAdded;
    #routeCreated;
    #emergencyProfileUpdated;
    #sosSnapshot;
    #meetupLocationShared;
    #meetupLocationUpdated;
    #adminAction;
  };

  public func run(old : OldActor) : NewActor {
    // Drop HARDCODED_ADMIN_PRINCIPAL and return new actor state
    {
      userProfiles = old.userProfiles;
      places = old.places;
      routes = old.routes;
      emergencyProfiles = old.emergencyProfiles;
      sosSnapshots = old.sosSnapshots;
      meetupLocations = old.meetupLocations;
      activityLogs = old.activityLogs;
      userActivityLogs = old.userActivityLogs;
    };
  };
};
