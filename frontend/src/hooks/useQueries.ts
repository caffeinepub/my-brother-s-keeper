import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import {
  UserProfile,
  Place,
  PlaceCategory,
  Route,
  EmergencyProfile,
  SOSSnapshot,
  MeetupLocation,
  MeetupLocationInput,
  ActivityLogEntry,
  MemberSummary,
  UserAccountDetails,
  UserRole,
} from '../backend';
import { Principal } from '@dfinity/principal';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetUserProfile(userId: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUserProfile(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useGetAllUserProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<[Principal, UserProfile][]>({
    queryKey: ['allUserProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUserProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllMembers() {
  const { actor, isFetching } = useActor();

  return useQuery<MemberSummary[]>({
    queryKey: ['allMembers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMembers();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['callerRole'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

/**
 * Mutation to promote the current caller to admin using the admin token.
 * Calls assignCallerUserRole with the admin role.
 * On success, invalidates the callerRole query so admin UI appears immediately.
 */
export function usePromoteToAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ principal, role }: { principal: Principal; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignCallerUserRole(principal, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerRole'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: () => {
      // Silently ignore errors — admin may already be set or token may be invalid
    },
  });
}

// ─── Verification ─────────────────────────────────────────────────────────────

export function useUploadVerification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      licenseProof,
      idProof,
    }: {
      licenseProof: import('../backend').ExternalBlob | null;
      idProof: import('../backend').ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadVerification(licenseProof, idProof);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useReviewVerification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, approved }: { user: Principal; approved: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reviewVerification(user, approved);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['allMembers'] });
    },
  });
}

// ─── Places ──────────────────────────────────────────────────────────────────

export function useSearchPlaces(category: PlaceCategory | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Place[]>({
    queryKey: ['places', category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchPlaces(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddPlace() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      category,
      description,
      location,
    }: {
      name: string;
      category: PlaceCategory;
      description: string;
      location: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addPlace(name, category, description, location);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
    },
  });
}

// ─── Routes ──────────────────────────────────────────────────────────────────

export function useGetRoutes(userId: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Route[]>({
    queryKey: ['routes', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getRoutes(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useCreateRoute() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      start,
      destination,
      waypoints,
      dateTime,
      notes,
    }: {
      start: string;
      destination: string;
      waypoints: string[];
      dateTime: bigint;
      notes: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createRoute(start, destination, waypoints, dateTime, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}

// ─── Emergency Profile ───────────────────────────────────────────────────────

export function useCreateOrUpdateEmergencyProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      nextOfKin,
      healthConditions,
      accessCode,
    }: {
      nextOfKin: string;
      healthConditions: string;
      accessCode: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrUpdateEmergencyProfile(nextOfKin, healthConditions, accessCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyProfile'] });
    },
  });
}

export function useEmergencyLookup() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ user, accessCode }: { user: Principal; accessCode: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.emergencyLookup(user, accessCode);
    },
  });
}

// ─── SOS ─────────────────────────────────────────────────────────────────────

export function useCreateSOSSnapshot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createSOSSnapshot(latitude, longitude);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sosSnapshot'] });
    },
  });
}

export function useGetLatestSOSLocation(userId: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<SOSSnapshot | null>({
    queryKey: ['sosSnapshot', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getLatestSOSLocation(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useGetAllLatestSOSLocations() {
  const { actor, isFetching } = useActor();

  return useQuery<SOSSnapshot[]>({
    queryKey: ['allSOSLocations'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLatestSOSLocations();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Meetup ──────────────────────────────────────────────────────────────────

export function useShareMeetupLocation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (locationInput: MeetupLocationInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.shareMeetupLocation(locationInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetupLocation'] });
      queryClient.invalidateQueries({ queryKey: ['activeMeetupLocations'] });
    },
  });
}

export function useUpdateMeetupLocation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (locationInput: MeetupLocationInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMeetupLocation(locationInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetupLocation'] });
      queryClient.invalidateQueries({ queryKey: ['activeMeetupLocations'] });
    },
  });
}

export function useDeactivateMeetupLocation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.deactivateMeetupLocation();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetupLocation'] });
      queryClient.invalidateQueries({ queryKey: ['activeMeetupLocations'] });
    },
  });
}

export function useGetMeetupLocation(userId: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<MeetupLocation | null>({
    queryKey: ['meetupLocation', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getMeetupLocation(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useGetAllActiveMeetupLocations() {
  const { actor, isFetching } = useActor();

  return useQuery<MeetupLocation[]>({
    queryKey: ['activeMeetupLocations'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllActiveMeetupLocations();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Activity Logs ───────────────────────────────────────────────────────────

export function useGetActivityLogs() {
  const { actor, isFetching } = useActor();

  return useQuery<ActivityLogEntry[]>({
    queryKey: ['activityLogs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActivityLogs();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── User Account Details (Admin) ────────────────────────────────────────────

export function useGetUserAccountDetails(userId: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<UserAccountDetails | null>({
    queryKey: ['userAccountDetails', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUserAccountDetails(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}
