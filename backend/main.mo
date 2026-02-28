import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Float "mo:core/Float";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();

  public type PromoteToAdminResult = {
    #success : Text;
    #accountAlreadyAdmin;
    #invalidToken;
    #tokenExpired;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    licenseProof : ?Storage.ExternalBlob;
    idProof : ?Storage.ExternalBlob;
    isVerified : Bool;
    registrationTime : Time.Time;
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

  public type ActivityLogEntry = {
    timestamp : Time.Time;
    eventType : EventType;
    description : Text;
    initiatedBy : Principal;
  };

  public type EventType = {
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

  public type MemberSummary = {
    userId : Principal;
    name : Text;
    isVerified : Bool;
    registrationTime : Time.Time;
  };

  public type UserAccountDetails = {
    profile : UserProfile;
    emergencyProfile : ?EmergencyProfile;
    recentRoutes : [Route];
    placesAdded : [Place];
    lastLocations : [MeetupLocation];
    activityLog : [ActivityLogEntry];
    accountCreated : Time.Time;
  };

  public type AdminToken = {
    token : Text;
    expiration : Time.Time;
    createdBy : Principal;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let places = Map.empty<Text, Place>();
  let routes = Map.empty<Principal, List.List<Route>>();
  let emergencyProfiles = Map.empty<Principal, EmergencyProfile>();
  let sosSnapshots = Map.empty<Principal, SOSSnapshot>();
  let meetupLocations = Map.empty<Principal, MeetupLocation>();
  let activityLogs = List.empty<ActivityLogEntry>();
  let userActivityLogs = Map.empty<Principal, List.List<ActivityLogEntry>>();
  let adminTokens = Map.empty<Text, AdminToken>();

  func isAdminUser(caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  func addActivityLog(eventType : EventType, description : Text, initiatedBy : Principal) {
    let logEntry : ActivityLogEntry = {
      timestamp = Time.now();
      eventType;
      description;
      initiatedBy;
    };
    activityLogs.add(logEntry);

    let userLog = switch (userActivityLogs.get(initiatedBy)) {
      case (?existing) { existing };
      case (null) { List.empty<ActivityLogEntry>() };
    };
    userLog.add(logEntry);
    userActivityLogs.add(initiatedBy, userLog);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not isAdminUser(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func getAllUserProfiles() : async [(Principal, UserProfile)] {
    if (not isAdminUser(caller)) {
      Runtime.trap("Unauthorized: Only admins can access all user profiles");
    };
    userProfiles.toArray();
  };

  public query ({ caller }) func getAllMembers() : async [MemberSummary] {
    if (not isAdminUser(caller)) {
      Runtime.trap("Unauthorized: Only admins can access member list");
    };
    userProfiles.toArray().map(
      func((_id, profile)) {
        {
          userId = _id;
          name = profile.name;
          isVerified = profile.isVerified;
          registrationTime = profile.registrationTime;
        };
      }
    );
  };

  public query ({ caller }) func getActivityLogs() : async [ActivityLogEntry] {
    if (not isAdminUser(caller)) {
      Runtime.trap("Unauthorized: Only admins can access activity logs");
    };
    activityLogs.toArray();
  };

  public query ({ caller }) func getUserAccountDetails(userId : Principal) : async UserAccountDetails {
    if (not isAdminUser(caller)) {
      Runtime.trap("Unauthorized: Only admins can view account details");
    };
    switch (userProfiles.get(userId)) {
      case (?profile) {
        let emergencyProfile = emergencyProfiles.get(userId);
        let recentRoutes = switch (routes.get(userId)) {
          case (?routeList) { routeList.toArray() };
          case (null) { [] };
        };
        let placesAdded = places.values().toArray().filter(
          func(p) { p.submittedBy == userId }
        );
        let lastLocations = meetupLocations.values().toArray().filter(
          func(location) { location.user == userId }
        );
        let activityLog = switch (userActivityLogs.get(userId)) {
          case (?logList) { logList.toArray() };
          case (null) { [] };
        };

        {
          profile;
          emergencyProfile;
          recentRoutes;
          placesAdded;
          lastLocations;
          activityLog;
          accountCreated = profile.registrationTime;
        };
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
    addActivityLog(#userRegistration, "User registered: " # profile.name, caller);
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
        { name = "Anonymous"; licenseProof = null; idProof = null; isVerified = false; registrationTime = Time.now() };
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
    addActivityLog(#verificationSubmitted, "Verification submitted by user: " # profile.name, caller);
  };

  public shared ({ caller }) func reviewVerification(user : Principal, approved : Bool) : async () {
    if (not isAdminUser(caller)) {
      Runtime.trap("Unauthorized: Only admins can review verification");
    };
    switch (userProfiles.get(user)) {
      case (?profile) {
        let updatedProfile = {
          profile with isVerified = approved;
        };
        userProfiles.add(user, updatedProfile);
        addActivityLog(#verificationReviewed, "Verification " # (if approved { "approved" } else { "rejected"
        }) # " for user: " # profile.name, caller);
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

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
    addActivityLog(#placeAdded, "Place added: " # name, caller);
  };

  public query func searchPlaces(
    category : ?PlaceCategory,
  ) : async [Place] {
    places.values().toArray().filter(
      func(p) {
        switch (category) {
          case (null) { true };
          case (?cat) { p.category == cat };
        };
      }
    );
  };

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
    addActivityLog(#routeCreated, "Route created from " # start # " to " # destination, caller);
  };

  public query ({ caller }) func getRoutes(user : Principal) : async [Route] {
    if (caller != user and not isAdminUser(caller)) {
      Runtime.trap("Unauthorized: Can only view your own routes");
    };
    switch (routes.get(user)) {
      case (?routeList) { routeList.toArray() };
      case (null) { [] };
    };
  };

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
    addActivityLog(#emergencyProfileUpdated, "Emergency profile updated", caller);
  };

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
    addActivityLog(#sosSnapshot, "SOS snapshot created", caller);
  };

  public query func emergencyLookup(user : Principal, accessCode : Text) : async EmergencyLookupResult {
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
    addActivityLog(#meetupLocationShared, "Meetup location shared: " # location.name, caller);
  };

  public query func getMeetupLocation(user : Principal) : async ?MeetupLocation {
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
    addActivityLog(#meetupLocationUpdated, "Meetup location updated: " # location.name, caller);
  };

  public query func getAllActiveMeetupLocations() : async [MeetupLocation] {
    meetupLocations.values().toArray().filter(
      func(location) {
        location.isActive;
      }
    );
  };

  public query ({ caller }) func getLatestSOSLocation(user : Principal) : async ?SOSSnapshot {
    if (not isAdminUser(caller)) {
      Runtime.trap("Unauthorized: Only admins can view SOS locations");
    };
    sosSnapshots.get(user);
  };

  public query ({ caller }) func getAllLatestSOSLocations() : async [SOSSnapshot] {
    if (not isAdminUser(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all SOS locations");
    };
    sosSnapshots.values().toArray();
  };

  public query func getLatestMeetupLocation(user : Principal) : async ?MeetupLocation {
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
    meetupLocations.values().toArray().filter(
      func(location) {
        location.isActive;
      }
    );
  };

  public shared ({ caller }) func promoteToAdmin(token : Text) : async PromoteToAdminResult {
    let tokenEntry = adminTokens.get(token);

    switch (tokenEntry) {
      case (null) {
        #invalidToken;
      };
      case (?adminToken) {
        if (Time.now() > adminToken.expiration) {
          #tokenExpired;
        } else if (isAdminUser(caller)) {
          #accountAlreadyAdmin;
        } else {
          AccessControl.assignRole(
            accessControlState,
            adminToken.createdBy,
            caller,
            #admin,
          );
          addActivityLog(#adminAction, "User with principal " # debug_show (caller) # " promoted to admin.", adminToken.createdBy);
          #success("Admin privileges granted successfully");
        };
      };
    };
  };

  public shared ({ caller }) func generateAdminToken() : async Text {
    if (not isAdminUser(caller)) {
      Runtime.trap("Unauthorized: Only admins can generate tokens");
    };

    let token = "ROUTECOIN_ADMIN_" # caller.toText() # "_" # Time.now().toText();
    let expiration = Time.now() + (86400_000_000_000 * 3);

    let adminToken : AdminToken = {
      token;
      expiration;
      createdBy = caller;
    };

    adminTokens.add(token, adminToken);
    token;
  };

  module Place {
    public func compare(place1 : Place, place2 : Place) : Order.Order {
      Text.compare(place1.name, place2.name);
    };
  };
};

