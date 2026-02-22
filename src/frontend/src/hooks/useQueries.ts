import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { PlaceCategory, type Place, type Route, type UserProfile, UserRole, ExternalBlob, type MeetupLocation, type SOSSnapshot, type ActivityLogEntry, EventType } from '../backend';
import { Principal } from '@dfinity/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
    const { actor, isFetching: actorFetching } = useActor();

    const query = useQuery<UserProfile | null>({
        queryKey: ['currentUserProfile'],
        queryFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.getCallerUserProfile();
        },
        enabled: !!actor && !actorFetching,
        retry: false
    });

    return {
        ...query,
        isLoading: actorFetching || query.isLoading,
        isFetched: !!actor && query.isFetched
    };
}

export function useIsCallerAdmin() {
    const { actor, isFetching: actorFetching } = useActor();

    const query = useQuery<boolean>({
        queryKey: ['isCallerAdmin'],
        queryFn: async () => {
            console.log('[useIsCallerAdmin] Starting admin check...');
            if (!actor) {
                console.log('[useIsCallerAdmin] No actor available, returning false');
                return false;
            }
            try {
                console.log('[useIsCallerAdmin] Calling actor.isCallerAdmin()...');
                const isAdmin = await actor.isCallerAdmin();
                console.log('[useIsCallerAdmin] ✅ Admin status received:', isAdmin);
                return isAdmin;
            } catch (error: any) {
                console.error('[useIsCallerAdmin] ❌ Error fetching admin status:', error);
                console.error('[useIsCallerAdmin] Error details:', {
                    message: error?.message,
                    name: error?.name,
                    stack: error?.stack
                });
                // Return false instead of throwing to prevent access denial on errors
                return false;
            }
        },
        enabled: !!actor && !actorFetching,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
        staleTime: 30000 // Cache for 30 seconds
    });

    console.log('[useIsCallerAdmin] Hook state:', {
        actorAvailable: !!actor,
        actorFetching,
        queryLoading: query.isLoading,
        queryFetching: query.isFetching,
        queryStatus: query.status,
        data: query.data,
        error: query.error,
        isFetched: query.isFetched
    });

    return {
        ...query,
        isLoading: actorFetching || query.isLoading,
        isFetched: !!actor && query.isFetched
    };
}

export function useGetHardcodedAdminPrincipal() {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<string>({
        queryKey: ['hardcodedAdminPrincipal'],
        queryFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.setupHardcodedAdmin();
        },
        enabled: !!actor && !actorFetching,
        retry: 1
    });
}

export function useGetCallerUserRole() {
    const { actor, isFetching: actorFetching } = useActor();

    const query = useQuery<UserRole>({
        queryKey: ['currentUserRole'],
        queryFn: async () => {
            console.log('[useGetCallerUserRole] Fetching user role...');
            if (!actor) {
                console.log('[useGetCallerUserRole] No actor available, returning guest');
                return UserRole.guest;
            }
            try {
                const role = await actor.getCallerUserRole();
                console.log('[useGetCallerUserRole] Fetched role:', role);
                return role;
            } catch (error) {
                console.error('[useGetCallerUserRole] Error fetching role:', error);
                throw error;
            }
        },
        enabled: !!actor && !actorFetching,
        retry: 1,
        retryDelay: 500
    });

    console.log('[useGetCallerUserRole] Hook state:', {
        actorFetching,
        queryLoading: query.isLoading,
        queryFetching: query.isFetching,
        data: query.data,
        error: query.error
    });

    return {
        ...query,
        isLoading: actorFetching || query.isLoading,
        isFetched: !!actor && query.isFetched
    };
}

export function useCreateUserProfile() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (profile: UserProfile) => {
            if (!actor) throw new Error('Actor not available');
            return actor.saveCallerUserProfile(profile);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        }
    });
}

export function useUploadVerification() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ licenseProof, idProof }: { licenseProof: ExternalBlob | null; idProof: ExternalBlob | null }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.uploadVerification(licenseProof, idProof);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        }
    });
}

// Admin Queries
export function useGetAllUserProfiles() {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<[Principal, UserProfile][]>({
        queryKey: ['allUserProfiles'],
        queryFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.getAllUserProfiles();
        },
        enabled: !!actor && !actorFetching,
        retry: 1
    });
}

export function useGetAllMembers() {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<[Principal, UserProfile][]>({
        queryKey: ['allMembers'],
        queryFn: async () => {
            console.log('[useGetAllMembers] Fetching all members...');
            if (!actor) throw new Error('Actor not available');
            try {
                const members = await actor.getAllMembers();
                console.log('[useGetAllMembers] Fetched members:', members.length);
                return members;
            } catch (error) {
                console.error('[useGetAllMembers] Error fetching members:', error);
                throw error;
            }
        },
        enabled: !!actor && !actorFetching,
        retry: 1
    });
}

export function useGetActivityLogs() {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<ActivityLogEntry[]>({
        queryKey: ['activityLogs'],
        queryFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.getActivityLogs();
        },
        enabled: !!actor && !actorFetching,
        retry: 1
    });
}

export function useGetUserProfile(userPrincipalText: string | null) {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<UserProfile | null>({
        queryKey: ['userProfile', userPrincipalText],
        queryFn: async () => {
            if (!actor || !userPrincipalText) return null;
            try {
                const principal = Principal.fromText(userPrincipalText.trim());
                return actor.getUserProfile(principal);
            } catch (error) {
                console.error('Invalid principal:', error);
                return null;
            }
        },
        enabled: !!actor && !actorFetching && !!userPrincipalText
    });
}

export function useReviewVerification() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ user, approved }: { user: string; approved: boolean }) => {
            if (!actor) throw new Error('Actor not available');
            const principal = Principal.fromText(user.trim());
            return actor.reviewVerification(principal, approved);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
            queryClient.invalidateQueries({ queryKey: ['allMembers'] });
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
        }
    });
}

// Places Queries
export function useSearchPlaces(category: PlaceCategory | null = null) {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<Place[]>({
        queryKey: ['places', category],
        queryFn: async () => {
            if (!actor) return [];
            return actor.searchPlaces(category);
        },
        enabled: !!actor && !actorFetching
    });
}

export function useAddPlace() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ name, category, description, location }: { name: string; category: PlaceCategory; description: string; location: string }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.addPlace(name, category, description, location);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['places'] });
            queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
        }
    });
}

// Routes Queries
export function useGetRoutes(userPrincipalText: string | null) {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<Route[]>({
        queryKey: ['routes', userPrincipalText],
        queryFn: async () => {
            if (!actor || !userPrincipalText) return [];
            try {
                const principal = Principal.fromText(userPrincipalText.trim());
                return actor.getRoutes(principal);
            } catch (error) {
                console.error('Invalid principal:', error);
                return [];
            }
        },
        enabled: !!actor && !actorFetching && !!userPrincipalText
    });
}

export function useCreateRoute() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ start, destination, waypoints, dateTime, notes }: { start: string; destination: string; waypoints: string[]; dateTime: bigint; notes: string | null }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.createRoute(start, destination, waypoints, dateTime, notes);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routes'] });
            queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
        }
    });
}

// Emergency Profile Queries
export function useCreateOrUpdateEmergencyProfile() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ nextOfKin, healthConditions, accessCode }: { nextOfKin: string; healthConditions: string; accessCode: string }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.createOrUpdateEmergencyProfile(nextOfKin, healthConditions, accessCode);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emergencyLookup'] });
            queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
        }
    });
}

// SOS Queries
export function useCreateSOSSnapshot() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.createSOSSnapshot(latitude, longitude);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emergencyLookup'] });
            queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
        }
    });
}

export function useEmergencyLookup(userPrincipalText: string | null, accessCode: string | null) {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery({
        queryKey: ['emergencyLookup', userPrincipalText, accessCode],
        queryFn: async () => {
            if (!actor || !userPrincipalText || !accessCode) return null;
            try {
                const principal = Principal.fromText(userPrincipalText.trim());
                return actor.emergencyLookup(principal, accessCode);
            } catch (error) {
                console.error('Emergency lookup error:', error);
                return null;
            }
        },
        enabled: !!actor && !actorFetching && !!userPrincipalText && !!accessCode
    });
}

// Meetup Location Queries
export function useShareMeetupLocation() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ latitude, longitude, name }: { latitude: number; longitude: number; name: string }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.shareMeetupLocation({ latitude, longitude, name });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meetupLocation'] });
            queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
        }
    });
}

export function useUpdateMeetupLocation() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ latitude, longitude, name }: { latitude: number; longitude: number; name: string }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.updateMeetupLocation({ latitude, longitude, name });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meetupLocation'] });
            queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
        }
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
        }
    });
}

export function useGetMeetupLocation(userPrincipalText: string | null) {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<MeetupLocation | null>({
        queryKey: ['meetupLocation', userPrincipalText],
        queryFn: async () => {
            if (!actor || !userPrincipalText) return null;
            try {
                const principal = Principal.fromText(userPrincipalText.trim());
                return actor.getMeetupLocation(principal);
            } catch (error) {
                console.error('Invalid principal:', error);
                return null;
            }
        },
        enabled: !!actor && !actorFetching && !!userPrincipalText
    });
}

export function useGetLatestMeetupLocation(userPrincipalText: string | null) {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<MeetupLocation | null>({
        queryKey: ['latestMeetupLocation', userPrincipalText],
        queryFn: async () => {
            if (!actor || !userPrincipalText) return null;
            try {
                const principal = Principal.fromText(userPrincipalText.trim());
                return actor.getLatestMeetupLocation(principal);
            } catch (error) {
                console.error('Invalid principal:', error);
                return null;
            }
        },
        enabled: !!actor && !actorFetching && !!userPrincipalText
    });
}

export function useGetAllActiveMeetupLocations() {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<MeetupLocation[]>({
        queryKey: ['allActiveMeetupLocations'],
        queryFn: async () => {
            if (!actor) return [];
            return actor.getAllActiveMeetupLocations();
        },
        enabled: !!actor && !actorFetching
    });
}

export function useGetAllAvailableMeetupLocations() {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<MeetupLocation[]>({
        queryKey: ['allAvailableMeetupLocations'],
        queryFn: async () => {
            if (!actor) return [];
            return actor.getAllAvailableMeetupLocations();
        },
        enabled: !!actor && !actorFetching
    });
}

export function useGetAllLatestSOSLocations() {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<SOSSnapshot[]>({
        queryKey: ['allLatestSOSLocations'],
        queryFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.getAllLatestSOSLocations();
        },
        enabled: !!actor && !actorFetching,
        retry: 1
    });
}

export function useGetLatestSOSLocation(userPrincipalText: string | null) {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<SOSSnapshot | null>({
        queryKey: ['latestSOSLocation', userPrincipalText],
        queryFn: async () => {
            if (!actor || !userPrincipalText) return null;
            try {
                const principal = Principal.fromText(userPrincipalText.trim());
                return actor.getLatestSOSLocation(principal);
            } catch (error) {
                console.error('Invalid principal:', error);
                return null;
            }
        },
        enabled: !!actor && !actorFetching && !!userPrincipalText
    });
}
