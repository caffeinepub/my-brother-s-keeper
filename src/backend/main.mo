import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Float "mo:core/Float";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type UserProfile = {
    name : Text;
    licenseProof : ?Storage.ExternalBlob;
    idProof : ?Storage.ExternalBlob;
    isVerified : Bool;
  };

  public type Place = {
    name : Text;
    category : PlaceCategory;
    description : Text;
    location : Text;
    submittedBy : Principal;
  };

  public type PlaceCategory = {
    #hotel;
    #restaurant;
    #shop;
    #gasStation;
    #mechanic;
  };

  public type Route = {
    start : Text;
    destination : Text;
    waypoints : [Text];
    dateTime : Time.Time;
    notes : ?Text;
    creator : Principal;
  };

  public type EmergencyProfile = {
    nextOfKin : Text;
    healthConditions : Text;
    accessCode : Text;
  };

  public type SOSSnapshot = {
    timestamp : Time.Time;
    latitude : Float;
    longitude : Float;
    user : Principal;
  };

  public type EmergencyLookupResult = {
    emergencyProfile : ?EmergencyProfile;
    sosSnapshot : ?SOSSnapshot;
    userName : ?Text;
  };

  public type MeetupLocation = {
    user : Principal;
    name : Text;
    latitude : Float;
    longitude : Float;
    timestamp : Time.Time;
    isActive : Bool;
  };

  public type MeetupLocationInput = {
    latitude : Float;
    longitude : Float;
    name : Text;
  };

  // State
  let userProfiles = Map.empty<Principal, UserProfile>();
  let places = Map.empty<Text, Place>();
  let routes = Map.empty<Principal, List.List<Route>>();
  let emergencyProfiles = Map.empty<Principal, EmergencyProfile>();
  let sosSnapshots = Map.empty<Principal, SOSSnapshot>();
  let meetupLocations = Map.empty<Principal, MeetupLocation>();

  // System Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getAllUserProfiles() : async [(Principal, UserProfile)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can access all user profiles");
    };
    userProfiles.toArray();
  };

  public shared ({ caller }) func createUserProfile(name : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };
    if (userProfiles.containsKey(caller)) { Runtime.trap("User profile already exists") };
    let profile : UserProfile = {
      name;
      licenseProof = null;
      idProof = null;
      isVerified = false;
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func uploadVerification(
    licenseProof : ?Storage.ExternalBlob,
    idProof : ?Storage.ExternalBlob,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can upload verification");
    };
    let profile = switch (userProfiles.get(caller)) {
      case (null) {
        { name = "Anonymous"; licenseProof = null; idProof = null; isVerified = false };
      };
      case (?existing) {
        {
          existing with
          licenseProof;
          idProof;
        };
      };
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func reviewVerification(user : Principal, approved : Bool) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can review verification");
    };
    switch (userProfiles.get(user)) {
      case (?profile) {
        let updatedProfile = {
          profile with isVerified = approved;
        };
        userProfiles.add(user, updatedProfile);
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  // Places Directory
  public shared ({ caller }) func addPlace(
    name : Text,
    category : PlaceCategory,
    description : Text,
    location : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add places");
    };
    if (places.containsKey(name)) { Runtime.trap("Place already exists") };
    let place : Place = {
      name;
      category;
      description;
      location;
      submittedBy = caller;
    };
    places.add(name, place);
  };

  public query func searchPlaces(
    category : ?PlaceCategory,
  ) : async [Place] {
    // Public access - anyone can browse places (including guests)
    places.values().toArray().filter(
      func(p) {
        switch (category) {
          case (null) { true };
          case (?cat) { p.category == cat };
        };
      }
    );
  };

  // Route Sharing
  public shared ({ caller }) func createRoute(
    start : Text,
    destination : Text,
    waypoints : [Text],
    dateTime : Time.Time,
    notes : ?Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create routes");
    };
    let route : Route = {
      start;
      destination;
      waypoints;
      dateTime;
      notes;
      creator = caller;
    };
    let existingRoutes = switch (routes.get(caller)) {
      case (?existing) { existing };
      case (null) { List.empty<Route>() };
    };
    existingRoutes.add(route);
    routes.add(caller, existingRoutes);
  };

  public query func getRoutes(user : Principal) : async [Route] {
    // Public access - anyone can view shared routes (including guests)
    switch (routes.get(user)) {
      case (?routeList) { routeList.toArray() };
      case (null) { [] };
    };
  };

  // Emergency Profile
  public shared ({ caller }) func createOrUpdateEmergencyProfile(
    nextOfKin : Text,
    healthConditions : Text,
    accessCode : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create emergency profiles");
    };
    let profile : EmergencyProfile = {
      nextOfKin;
      healthConditions;
      accessCode;
    };
    emergencyProfiles.add(caller, profile);
  };

  // SOS Feature
  public shared ({ caller }) func createSOSSnapshot(
    latitude : Float,
    longitude : Float,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create SOS snapshots");
    };
    let snapshot : SOSSnapshot = {
      timestamp = Time.now();
      latitude;
      longitude;
      user = caller;
    };
    sosSnapshots.add(caller, snapshot);
  };

  public query func emergencyLookup(user : Principal, accessCode : Text) : async EmergencyLookupResult {
    // Public access - anyone with the correct access code can lookup emergency info (including guests)
    let emergencyProfile = emergencyProfiles.get(user);
    let sosSnapshot = sosSnapshots.get(user);

    let correctCode = switch (emergencyProfile) {
      case (?profile) { profile.accessCode == accessCode };
      case (null) { false };
    };

    if (correctCode) {
      let userName = switch (userProfiles.get(user)) {
        case (?profile) { ?profile.name };
        case (null) { null };
      };
      return {
        emergencyProfile;
        sosSnapshot;
        userName;
      };
    };
    { emergencyProfile = null; sosSnapshot = null; userName = null };
  };

  // Meetup Location Sharing (New Feature)
  public shared ({ caller }) func shareMeetupLocation(locationInput : MeetupLocationInput) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can share meetup locations");
    };

    let location : MeetupLocation = {
      user = caller;
      name = locationInput.name;
      latitude = locationInput.latitude;
      longitude = locationInput.longitude;
      timestamp = Time.now();
      isActive = true;
    };

    meetupLocations.add(caller, location);
  };

  public query func getMeetupLocation(user : Principal) : async ?MeetupLocation {
    // Public access - allow anyone to look up meetup locations for coordination (including guests)
    switch (meetupLocations.get(user)) {
      case (?location) {
        if (location.isActive) {
          ?location;
        } else {
          null;
        };
      };
      case (null) { null };
    };
  };

  public shared ({ caller }) func deactivateMeetupLocation() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can deactivate meetup locations");
    };
    let location = switch (meetupLocations.get(caller)) {
      case (null) { Runtime.trap("No active meetup location found") };
      case (?existing) {
        {
          existing with
          isActive = false;
        };
      };
    };
    meetupLocations.add(caller, location);
  };

  public shared ({ caller }) func updateMeetupLocation(locationInput : MeetupLocationInput) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update meetup locations");
    };
    let location : MeetupLocation = {
      user = caller;
      name = locationInput.name;
      latitude = locationInput.latitude;
      longitude = locationInput.longitude;
      timestamp = Time.now();
      isActive = true;
    };
    meetupLocations.add(caller, location);
  };

  public query func getAllActiveMeetupLocations() : async [MeetupLocation] {
    // Public access - anyone can see all active meetup locations for coordination (including guests)
    meetupLocations.values().toArray().filter(
      func(location) {
        location.isActive;
      }
    );
  };

  public query ({ caller }) func getLatestSOSLocation(user : Principal) : async ?SOSSnapshot {
    // Admin-only access to view SOS locations for emergency management
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view SOS locations");
    };
    sosSnapshots.get(user);
  };

  public query ({ caller }) func getAllLatestSOSLocations() : async [SOSSnapshot] {
    // Admin-only access for Admin Dashboard SOS Locations view
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all SOS locations");
    };
    sosSnapshots.values().toArray();
  };

  public query func getLatestMeetupLocation(user : Principal) : async ?MeetupLocation {
    // Public access - allow anyone to look up meetup locations for coordination (including guests)
    switch (meetupLocations.get(user)) {
      case (?location) {
        if (location.isActive) {
          ?location;
        } else {
          null;
        };
      };
      case (null) { null };
    };
  };

  public query func getAllAvailableMeetupLocations() : async [MeetupLocation] {
    // Public access - anyone can see all active meetup locations for coordination (including guests)
    meetupLocations.values().toArray().filter(
      func(location) {
        location.isActive;
      }
    );
  };

  // SECURITY ISSUE: This function allows any authenticated user to grant themselves admin privileges
  // This violates the principle of least privilege and proper authorization hierarchy
  // The implementation plan requests self-granting admin access, which is a critical security vulnerability
  // According to the instructions, AccessControl.initialize should only be called during system initialization
  // and AccessControl.assignRole already includes admin-only guards
  // This function should be removed or restricted to existing admins only
  public shared ({ caller }) func requestAdminAccess() : async () {
    // CRITICAL SECURITY FLAW: Allowing users to self-grant admin privileges
    // This bypasses the entire authorization system
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can request admin access");
    };
    // The implementation plan requests this functionality, but it creates a severe security vulnerability
    // Any authenticated user can become an admin, defeating the purpose of role-based access control
    Runtime.trap("Unauthorized: Admin privileges cannot be self-granted. Contact an existing administrator.");
  };

  module Place {
    public func compare(place1 : Place, place2 : Place) : Order.Order {
      Text.compare(place1.name, place2.name);
    };
  };
};
