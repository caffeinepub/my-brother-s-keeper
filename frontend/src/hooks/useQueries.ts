import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Place, PlaceCategory, Route, EmergencyProfile, MeetupLocationInput, MemberSummary, ActivityLogEntry, UserAccountDetails, PromoteToAdminResult } from '../backend';
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

export function useUploadVerification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ licenseProof, idProof }: { licenseProof: any; idProof: any }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadVerification(licenseProof, idProof);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    // Do not cache stale admin status for too long
    staleTime: 0,
  });
}

export function usePromoteToAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<PromoteToAdminResult, Error, string>({
    mutationFn: async (token: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.promoteToAdmin(token);
    },
    onSuccess: (result) => {
      if (result.__kind__ === 'success' || result.__kind__ === 'accountAlreadyAdmin') {
        // Invalidate and immediately refetch admin status so guards update
        queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
        queryClient.refetchQueries({ queryKey: ['isCallerAdmin'] });
        queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        queryClient.invalidateQueries({ queryKey: ['callerRole'] });
      }
    },
  });
}

export function useGenerateAdminToken() {
  const { actor } = useActor();

  return useMutation<string, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.generateAdminToken();
    },
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
    },
  });
}

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

export function useGetAllLatestSOSLocations() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['allSOSLocations'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLatestSOSLocations();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Emergency Lookup ────────────────────────────────────────────────────────

export function useEmergencyLookup() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ user, accessCode }: { user: Principal; accessCode: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.emergencyLookup(user, accessCode);
    },
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
    },
  });
}

export function useGetMeetupLocation(userId: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['meetupLocation', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getMeetupLocation(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
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
    },
  });
}

export function useGetAllActiveMeetupLocations() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['allActiveMeetupLocations'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllActiveMeetupLocations();
    },
    enabled: !!actor && !isFetching,
  });
}
