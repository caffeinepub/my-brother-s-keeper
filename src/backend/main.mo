import Text "mo:core/Text";
import Time "mo:core/Time";
import List "mo:core/List";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Mixins
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
    licenseProof : ?Storage.ExternalBlob;
    idProof : ?Storage.ExternalBlob;
    isVerified : Bool;
  };

  // Place Type
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

  // Route Type
  public type Route = {
    start : Text;
    destination : Text;
    waypoints : [Text];
    dateTime : Time.Time;
    notes : ?Text;
    creator : Principal;
  };

  // Emergency Profile Type
  public type EmergencyProfile = {
    nextOfKin : Text;
    healthConditions : Text;
    accessCode : Text;
  };

  // SOS Location Snapshot Type
  public type SOSSnapshot = {
    timestamp : Time.Time;
    latitude : Float;
    longitude : Float;
    user : Principal;
  };

  // State
  let userProfiles = Map.empty<Principal, UserProfile>();
  let places = Map.empty<Text, Place>();
  let routes = Map.empty<Principal, List.List<Route>>();
  let emergencyProfiles = Map.empty<Principal, EmergencyProfile>();
  let sosSnapshots = Map.empty<Principal, SOSSnapshot>();

  // Required User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // User Profile Functions
  public shared ({ caller }) func createUserProfile(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
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

  // Only admin function to approve/reject verification
  public shared ({ caller }) func reviewVerification(user : Principal, approved : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
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

  // Places Directory Functions
  public shared ({ caller }) func addPlace(
    name : Text,
    category : PlaceCategory,
    description : Text,
    location : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
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

  public query ({ caller }) func searchPlaces(
    category : ?PlaceCategory,
  ) : async [Place] {
    // Public access - anyone can browse places
    places.values().toArray().filter(
      func(p) {
        switch (category) {
          case (null) { true };
          case (?cat) { p.category == cat };
        };
      }
    );
  };

  // Route Sharing Functions
  public shared ({ caller }) func createRoute(
    start : Text,
    destination : Text,
    waypoints : [Text],
    dateTime : Time.Time,
    notes : ?Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
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

  public query ({ caller }) func getRoutes(user : Principal) : async [Route] {
    // Public access - anyone can view shared routes
    switch (routes.get(user)) {
      case (?routeList) { routeList.toArray() };
      case (null) { [] };
    };
  };

  // Emergency Profile Functions
  public shared ({ caller }) func createOrUpdateEmergencyProfile(
    nextOfKin : Text,
    healthConditions : Text,
    accessCode : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create emergency profiles");
    };
    let profile : EmergencyProfile = {
      nextOfKin;
      healthConditions;
      accessCode;
    };
    emergencyProfiles.add(caller, profile);
  };

  // SOS Feature Functions
  public shared ({ caller }) func createSOSSnapshot(
    latitude : Float,
    longitude : Float,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
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

  // Emergency Lookup - Public access with access code verification
  public query ({ caller }) func emergencyLookup(user : Principal, accessCode : Text) : async {
    emergencyProfile : ?EmergencyProfile;
    sosSnapshot : ?SOSSnapshot;
  } {
    // Public access - anyone with the correct access code can lookup emergency info
    switch (emergencyProfiles.get(user)) {
      case (?profile) {
        if (profile.accessCode == accessCode) {
          return {
            emergencyProfile = ?profile;
            sosSnapshot = sosSnapshots.get(user);
          };
        };
      };
      case (null) {};
    };
    { emergencyProfile = null; sosSnapshot = null };
  };

  module Place {
    public func compare(place1 : Place, place2 : Place) : Order.Order {
      Text.compare(place1.name, place2.name);
    };
  };
};
